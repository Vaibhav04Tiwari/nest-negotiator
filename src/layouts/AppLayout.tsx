import { Outlet } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

const AppLayout = () => (
  <div className="min-h-screen flex flex-col">
    <SiteHeader />
    <main role="main" className="flex-1">
      <Outlet />
    </main>
    <SiteFooter />
  </div>
);

export default AppLayout;
