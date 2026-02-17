import { getRecentFeedback } from "@/app/actions/admin";
import AdminTabs from "@/components/admin/AdminTabs";
import { getUserRole } from "@/lib/auth";

export default async function AdminDashboard() {
    const userRole = await getUserRole();
    
    // Only fetch recent feedback for admin users (viewer doesn't need it)
    const recentFeedback = userRole === "admin" ? await getRecentFeedback() : [];

    return <AdminTabs recentFeedback={recentFeedback} userRole={userRole || "viewer"} />;
}
