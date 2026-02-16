import { getRecentFeedback } from "@/app/actions/admin";
import AdminTabs from "@/components/admin/AdminTabs";
import { getUserRole } from "@/lib/auth";

export default async function AdminDashboard() {
    const recentFeedback = await getRecentFeedback();
    const userRole = await getUserRole();

    return <AdminTabs recentFeedback={recentFeedback} userRole={userRole || "viewer"} />;
}
