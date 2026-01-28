"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { createBulkFeedbackLinks, BulkContactItem, BulkSendResult } from "@/app/actions/admin";
import { isValidPhoneNumber } from "@/lib/phone";

type Step = "upload" | "preview" | "sending" | "results";

export default function BulkUpload() {
    const [step, setStep] = useState<Step>("upload");
    const [contacts, setContacts] = useState<BulkContactItem[]>([]);
    const [results, setResults] = useState<BulkSendResult[]>([]);
    const [sendingProgress, setSendingProgress] = useState({ current: 0, total: 0 });
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const normalizePhone = (phone: string): string => {
        // Remove all non-digit characters
        let normalized = phone.replace(/\D/g, "");
        
        // Handle Turkish phone formats
        if (normalized.startsWith("90") && normalized.length === 12) {
            normalized = "0" + normalized.slice(2);
        } else if (normalized.startsWith("5") && normalized.length === 10) {
            normalized = "0" + normalized;
        }
        
        return normalized;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, { raw: false });

            if (jsonData.length === 0) {
                setError("Dosyada veri bulunamadı");
                return;
            }

            // Map Excel columns to our format
            // Expected columns: AD-SOYAD, TEL, GÖRÜŞME YAPILAN OFİS
            const parsedContacts: BulkContactItem[] = jsonData.map((row, index) => {
                // Try different column name variations
                const name = row["AD-SOYAD"] || row["AD SOYAD"] || row["İSİM"] || row["ADI SOYADI"] || row["AD"] || "";
                const rawPhone = row["TEL"] || row["TELEFON"] || row["TEL NO"] || row["TELEFON NO"] || "";
                const office = row["GÖRÜŞME YAPILAN OFİS"] || row["OFİS"] || row["OFFICE"] || row["ŞUBE"] || "";

                const phone = normalizePhone(rawPhone);
                const isPhoneValid = isValidPhoneNumber(phone);
                const isNameValid = name.trim().length >= 2;

                let errorMsg: string | undefined;
                if (!isNameValid) {
                    errorMsg = "Geçersiz isim";
                } else if (!isPhoneValid) {
                    errorMsg = "Geçersiz telefon numarası";
                }

                return {
                    id: `row-${index}`,
                    name: name.trim(),
                    phone,
                    office: office.trim(),
                    isValid: isNameValid && isPhoneValid,
                    error: errorMsg,
                };
            });

            setContacts(parsedContacts);
            setStep("preview");
        } catch (err) {
            console.error("File parse error:", err);
            setError("Dosya okunamadı. Lütfen geçerli bir Excel dosyası yükleyin.");
        }
    };

    const handleContactChange = (id: string, field: keyof BulkContactItem, value: string) => {
        setContacts(prev => prev.map(contact => {
            if (contact.id !== id) return contact;

            const updated = { ...contact, [field]: value };
            
            // Revalidate
            const isPhoneValid = isValidPhoneNumber(updated.phone);
            const isNameValid = updated.name.trim().length >= 2;
            
            let errorMsg: string | undefined;
            if (!isNameValid) {
                errorMsg = "Geçersiz isim";
            } else if (!isPhoneValid) {
                errorMsg = "Geçersiz telefon numarası";
            }

            return {
                ...updated,
                isValid: isNameValid && isPhoneValid,
                error: errorMsg,
            };
        }));
    };

    const handleRemoveContact = (id: string) => {
        setContacts(prev => prev.filter(c => c.id !== id));
    };

    const handleSendAll = async () => {
        const validContacts = contacts.filter(c => c.isValid);
        if (validContacts.length === 0) {
            setError("Gönderilecek geçerli kayıt yok");
            return;
        }

        setStep("sending");
        setSendingProgress({ current: 0, total: validContacts.length });

        try {
            const result = await createBulkFeedbackLinks(validContacts);
            setResults(result.results);
            setStep("results");
        } catch (err) {
            console.error("Bulk send error:", err);
            setError("Toplu gönderim sırasında bir hata oluştu");
            setStep("preview");
        }
    };

    const handleReset = () => {
        setStep("upload");
        setContacts([]);
        setResults([]);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const validCount = contacts.filter(c => c.isValid).length;
    const invalidCount = contacts.filter(c => !c.isValid).length;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 md:px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Toplu SMS Gönderimi</h3>
                <p className="text-sm text-gray-500 mt-1">Excel dosyası yükleyerek toplu link oluşturun ve SMS gönderin</p>
            </div>

            <div className="p-4 md:p-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                        {error}
                        <button onClick={() => setError(null)} className="ml-2 text-red-800 font-medium">×</button>
                    </div>
                )}

                {/* Upload Step */}
                {step === "upload" && (
                    <div className="text-center py-8">
                        <div className="mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 mb-2">Excel dosyanızı yükleyin</p>
                        <p className="text-xs text-gray-400 mb-4">Beklenen sütunlar: AD-SOYAD, TEL, GÖRÜŞME YAPILAN OFİS</p>
                        <label className="inline-block cursor-pointer">
                            <span className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                                Dosya Seç
                            </span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                    </div>
                )}

                {/* Preview Step */}
                {step === "preview" && (
                    <div>
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    ✓ {validCount} Geçerli
                                </span>
                                {invalidCount > 0 && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                        ✗ {invalidCount} Hatalı
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2 ml-auto">
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleSendAll}
                                    disabled={validCount === 0}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {validCount} Kişiye Gönder
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-gray-700">Durum</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-700">Ad Soyad</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-700">Telefon</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-700">Ofis</th>
                                        <th className="px-4 py-2 text-right font-medium text-gray-700">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {contacts.map((contact) => (
                                        <tr key={contact.id} className={contact.isValid ? "" : "bg-red-50"}>
                                            <td className="px-4 py-2">
                                                {contact.isValid ? (
                                                    <span className="text-green-600">✓</span>
                                                ) : (
                                                    <span className="text-red-600" title={contact.error}>✗</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={contact.name}
                                                    onChange={(e) => handleContactChange(contact.id, "name", e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={contact.phone}
                                                    onChange={(e) => handleContactChange(contact.id, "phone", e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={contact.office}
                                                    onChange={(e) => handleContactChange(contact.id, "office", e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <button
                                                    onClick={() => handleRemoveContact(contact.id)}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    Kaldır
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Sending Step */}
                {step === "sending" && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 text-lg mb-2">SMS'ler gönderiliyor...</p>
                        <p className="text-gray-400 text-sm">
                            {sendingProgress.current} / {sendingProgress.total} tamamlandı
                        </p>
                    </div>
                )}

                {/* Results Step */}
                {step === "results" && (
                    <div>
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    ✓ {results.filter(r => r.success).length} Başarılı
                                </span>
                                {results.filter(r => !r.success).length > 0 && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                        ✗ {results.filter(r => !r.success).length} Başarısız
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={handleReset}
                                className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                            >
                                Yeni Yükleme
                            </button>
                        </div>

                        <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-gray-700">Durum</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-700">Ad Soyad</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-700">Sonuç</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {results.map((result) => (
                                        <tr key={result.id} className={result.success ? "bg-green-50" : "bg-red-50"}>
                                            <td className="px-4 py-2">
                                                {result.success ? (
                                                    <span className="text-green-600">✓</span>
                                                ) : (
                                                    <span className="text-red-600">✗</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 font-medium text-gray-900">{result.name}</td>
                                            <td className="px-4 py-2 text-gray-600">
                                                {result.success ? "SMS gönderildi" : result.error}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
