import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import GarageNavbar from "./Navbar/GarageNavbar";
import GarageSidebar from "./Sidebar/GarageSidebar";
import { useAuth } from "../../context/AuthContext";

export default function GarageLayout({ children }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [showNotifications, setShowNotifications] = useState(false);

  // Global resize handling to disable transitions
  React.useEffect(() => {
    let resizeTimer;
    const handleResize = () => {
      document.body.classList.add("resizing");
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        document.body.classList.remove("resizing");
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Sync sidebar state with window size
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    
    const handleMediaChange = (e) => {
      // If switching to desktop, ensure it's "open"
      if (e.matches) {
        setSidebarOpen(true);
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);


  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <div 
        className="hidden lg:block shrink-0 transition-[width] duration-300 ease-in-out"
        style={{ width: "var(--sidebar-width)" }}
      />

      {/* Sidebar */}
      <GarageSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        showNotifications={showNotifications}
      />

      {/* Main content area — shrinks/grows with sidebar */}
      <div
        className="flex flex-col flex-1 min-w-0 overflow-hidden relative"
      >
        {/* Navbar */}
        <GarageNavbar
          role={user?.role || ""}
          userName={user?.name || "User"}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
