import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, showSidebar = false }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen">
      <div className="flex">
        {showSidebar && (
          <Sidebar
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={closeMobileSidebar}
          />
        )}

        <div className="flex-1 flex flex-col">
          <Navbar
            showSidebar={showSidebar}
            onToggleMobileSidebar={toggleMobileSidebar}
          />

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {showSidebar && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}
    </div>
  );
};
export default Layout;