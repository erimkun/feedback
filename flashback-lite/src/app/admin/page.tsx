import { getRecentFeedback } from "@/app/actions/admin";
import CreateLinkForm from "@/components/admin/CreateLinkForm";
import BulkUpload from "@/components/admin/BulkUpload";
import StatsDashboard from "@/components/admin/StatsDashboard";
import FeedbackRow from "@/components/admin/FeedbackRow";
import FeedbackCard from "@/components/admin/FeedbackCard";

export default async function AdminDashboard() {
    const recentFeedback = await getRecentFeedback();

    return (
        <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto px-4 md:px-0">
            {/* Advanced Stats Dashboard */}
            <StatsDashboard />

            {/* Create Link Section */}
            <CreateLinkForm />

            {/* Bulk Upload Section */}
            <BulkUpload />

            {/* Recent Feedback Section - Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Son Gelen Geri Bildirimler</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-medium text-gray-700">İsim</th>
                                <th className="px-6 py-3 font-medium text-gray-700">Puan</th>
                                <th className="px-6 py-3 font-medium text-gray-700">Yorum</th>
                                <th className="px-6 py-3 font-medium text-gray-700">Tarih</th>
                                <th className="px-6 py-3 font-medium text-gray-700 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentFeedback.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Henüz geri bildirim yok.
                                    </td>
                                </tr>
                            ) : (
                                recentFeedback.map((item) => (
                                    <FeedbackRow key={item.id} item={item} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Feedback Section - Mobile Cards */}
            <div className="md:hidden space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Son Gelen Geri Bildirimler</h3>
                {recentFeedback.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
                        Henüz geri bildirim yok.
                    </div>
                ) : (
                    recentFeedback.map((item) => (
                        <FeedbackCard key={item.id} item={item} />
                    ))
                )}
            </div>
        </div>
    );
}
