import { getFeedbackStats, getRecentFeedback } from "@/app/actions/admin";
import CreateLinkForm from "@/components/admin/CreateLinkForm";
import FeedbackRow from "@/components/admin/FeedbackRow";

export default async function AdminDashboard() {
    const stats = await getFeedbackStats();
    const recentFeedback = await getRecentFeedback();

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Toplam Link</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Tamamlanan</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.used}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Ortalama Puan</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{stats.averageRating}</p>
                </div>
            </div>

            {/* Create Link Section */}
            <CreateLinkForm />

            {/* Recent Feedback Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
        </div>
    );
}
