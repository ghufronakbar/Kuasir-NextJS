import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AuthPage } from "@/middleware/auth-page";

const DashboardPage = () => {
  return <DashboardLayout>dashboard</DashboardLayout>;
};

export default AuthPage(DashboardPage, [
  "CASHIER",
  "OWNER",
  "MANAGER_OPERATIONAL",
]);
