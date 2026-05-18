import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import GarageNavbar from "./Navbar/GarageNavbar";
import GarageSidebar from "./Sidebar/GarageSidebar";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import ServiceReminderModal from "../UI/ServiceReminderModal";

export default function GarageLayout({ children }) {
  const { user, token } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [urgentReminders, setUrgentReminders] = useState([]);

  // Check for upcoming service reminders (0-3 days)
  useEffect(() => {
    const checkReminders = async () => {
      // Only show for owner/admin and once per session
      if (
        !token ||
        !user ||
        !["owner", "admin"].includes(user.role?.toLowerCase())
      )
        return;
      if (localStorage.getItem("service_reminder_shown") === "true") return;

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/vehicles`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const urgent = res.data.filter((v) => {
          if (!v.nextServiceDate || v.reminderStatus === "Completed")
            return false;
          const nextDate = new Date(v.nextServiceDate);
          nextDate.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil(
            (nextDate - today) / (1000 * 60 * 60 * 24),
          );
          return diffDays >= 0 && diffDays <= 3;
        });

        if (urgent.length > 0) {
          setUrgentReminders(urgent);
          setReminderModalOpen(true);
          localStorage.setItem("service_reminder_shown", "true");
        }
      } catch (err) {
        console.error("Failed to check reminders:", err);
      }
    };

    checkReminders();
  }, [token, user]);

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
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {/* Navbar */}
        <GarageNavbar
          role={user?.role || ""}
          userName={user?.name || "User"}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-zinc-950 transition-colors duration-300 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full w-full"
            >
              {children || <Outlet />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ServiceReminderModal
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        reminders={urgentReminders}
      />
    </div>
  );
}
