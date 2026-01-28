import { getRecentFeedback } from "@/app/actions/admin";
import AdminTabs from "@/components/admin/AdminTabs";

export default async function AdminDashboard() {
    const recentFeedback = await getRecentFeedback();

    return <AdminTabs recentFeedback={recentFeedback} />;
}
