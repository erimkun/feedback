import { getFeedbackStats, getRecentFeedback } from "@/app/actions/admin";
import CreateLinkForm from "@/components/admin/CreateLinkForm";
import BulkUpload from "@/components/admin/BulkUpload";
import FeedbackRow from "@/components/admin/FeedbackRow";
import FeedbackCard from "@/components/admin/FeedbackCard";

export default async function AdminDashboard() {
    const stats = await getFeedbackStats();
    const recentFeedback = await getRecentFeedback();

    return (
        <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto px-4 md:px-0">
            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-3 md:gap-6">
                <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-xs md:text-sm font-medium uppercase tracking-wider">Toplam</h3>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{stats.total}</p>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-xs md:text-sm font-medium uppercase tracking-wider">Tamamlanan</h3>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{stats.used}</p>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-xs md:text-sm font-medium uppercase tracking-wider">Ort. Puan</h3>
                    <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-1 md:mt-2">{stats.averageRating}</p>
                </div>
            </div>

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
