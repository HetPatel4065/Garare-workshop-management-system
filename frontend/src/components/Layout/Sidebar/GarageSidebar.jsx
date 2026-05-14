import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Wrench,
  Package,
  Settings,
  HelpCircle,
  X,
  UserCog,
  Bell,
  UserPlus,
  ReceiptIndianRupeeIcon,
  Car,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Calendar,
  MapPin,
  ShieldCheck,
  Store,
  HardHat,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ROLE_LABELS } from "../../../utils/roles";


const NAV_SECTIONS = [
  {
    label: "Main Menu",
    items: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
        roles: ["admin", "owner", "advisor", "mechanic"],
      },
      {
        name: "Customers",
        path: "/customers",
        icon: Users,
        roles: ["admin", "owner", "advisor", "mechanic"],
      },
      {
        name: "Requested Customers",
        path: "/requested-customers",
        icon: UserPlus,
        roles: ["admin", "owner"],
      },
      {
        name: "Vehicles",
        path: "/vehicles",
        icon: Car,
        roles: ["admin", "owner", "advisor", "mechanic"],
      },
      {
        name: "Job Cards",
        path: "/job-cards",
        icon: FileText,
        roles: ["admin", "owner", "advisor", "mechanic"],
      },
      {
        name: "Services",
        path: "/services",
        icon: Wrench,
        roles: ["admin", "owner", "advisor", "mechanic"],
      },
      {
        name: "Inventory",
        path: "/inventory",
        icon: Package,
        roles: ["admin", "owner", "advisor", "mechanic"],
      },
      {
        name: "Billing",
        path: "/billing",
        icon: ReceiptIndianRupeeIcon,
        roles: ["admin", "owner"],
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        name: "Staff Members",
        path: "/staff-members",
        icon: UserCog,
        roles: ["admin", "owner"],
      },
      {
        name: "Reminders",
        path: "/reminders",
        icon: Calendar,
        roles: ["admin", "owner"],
      },
      {
        name: "Notifications",
        path: "/notifications",
        icon: Bell,
        roles: ["admin", "owner"],
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        name: "Settings",
        path: "/settings",
        icon: Settings,
        roles: ["admin", "owner"],
      },
      {
        name: "Help Center",
        path: "/help",
        icon: HelpCircle,
        roles: ["admin", "owner"],
      },
    ],
  },
];

export default function GarageSidebar({ isOpen, onClose, showNotifications }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() || "mechanic";

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });
  const [openSections, setOpenSections] = useState(() => {
    const saved = localStorage.getItem("sidebar_open_sections");
    return saved ? JSON.parse(saved) : NAV_SECTIONS.map(() => true);
  });

  const sidebarRef = React.useRef(null);
  const memoizedSections = useMemo(() => NAV_SECTIONS, []);

  // Robust desktop detection without re-render loops
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleMediaChange = (e) => setIsDesktop(e.matches);

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", collapsed);
    const width = collapsed ? "80px" : "260px";
    document.documentElement.style.setProperty("--sidebar-width", width);
  }, [collapsed]);

  // Persist open sections state
  useEffect(() => {
    localStorage.setItem("sidebar_open_sections", JSON.stringify(openSections));
  }, [openSections]);

  // Restore scroll position
  useEffect(() => {
    const nav = sidebarRef.current;
    if (nav) {
      const savedScroll = localStorage.getItem("sidebar_scroll");
      if (savedScroll) nav.scrollTop = parseInt(savedScroll, 10);

      const handleScroll = () => {
        localStorage.setItem("sidebar_scroll", nav.scrollTop);
      };
      nav.addEventListener("scroll", handleScroll);
      return () => nav.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (!isDesktop && isOpen) {
      onClose();
    }
  }, [location.pathname, isDesktop]);

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const toggleSection = (idx) =>
    setOpenSections((prev) => prev.map((v, i) => (i === idx ? !v : v)));

  const garageName = user?.businessName || user?.garageName || "Garage Name";
  const address = user?.address || user?.garageAddress || "";

  const LogoEl = ({ size = "w-9 h-9" }) => (
    <div
      className={`${size} rounded-xl overflow-hidden border border-white/10 bg-gray-800 flex items-center justify-center shrink-0 shadow-lg`}
    >
      {user?.logo ? (
        <img
          src={
            user.logo.startsWith("http")
              ? user.logo
              : `${import.meta.env.VITE_BASE_URL}/${user.logo}`
          }
          alt="logo"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "";
          }}
        />
      ) : (
        <Wrench size={18} className="text-blue-400" />
      )}
    </div>
  );

  // Optimized variants: Only touch 'x' to avoid layout recalculations
  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        mass: 0.8,
      },
    },
    closed: {
      x: isDesktop ? 0 : "-100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        mass: 0.8,
      },
    },
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={isOpen || isDesktop ? "open" : "closed"}
        variants={sidebarVariants}
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-gray-950 border-r border-white/5
          gpu-accelerated sidebar-persistent overflow-hidden
        `}
        style={{
          width: "var(--sidebar-width)",
          transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* HEADER */}
        <div className="flex flex-col shrink-0">
          <div
            className={`flex items-center gap-3 px-4 py-5 ${collapsed && isDesktop ? "justify-center" : ""}`}
          >
            <div
              onClick={() => setCollapsed(!collapsed)}
              className="shrink-0 cursor-pointer transition-transform active:scale-95"
            >
              <LogoEl size="w-12 h-12" />
            </div>

            {(!collapsed || !isDesktop) && (
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-white truncate leading-tight">
                  {garageName}
                </p>
                {address && (
                  <div className="flex items-start gap-1 mt-1 opacity-60">
                    <MapPin
                      size={12}
                      className="mt-0.5 shrink-0 text-gray-400"
                    />
                    <p className="text-xs text-white line-clamp-none font-bold leading-normal opacity-80">
                      {address}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden shrink-0 p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* NAV */}
        <nav
          ref={sidebarRef}
          className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide"
        >
          {NAV_SECTIONS.map((section, sIdx) => {
            const visibleItems = section.items.filter((item) =>
              item.roles.includes(role),
            );
            if (!visibleItems.length) return null;
            const isOpenSection = openSections[sIdx];

            return (
              <div key={section.label} className="mb-6 last:mb-2">
                {/* Section header - Motion removed to prevent flickering on route change */}
                {(!collapsed || !isDesktop) && (
                  <button
                    onClick={() => toggleSection(sIdx)}
                    className="w-full flex items-center justify-between px-3 py-2 mb-1 rounded-lg group hover:bg-white/5 transition-colors"
                  >
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-400">
                      {section.label}
                    </span>
                    <ChevronDown
                      size={12}
                      className={`text-gray-600 transition-transform duration-200 ${
                        isOpenSection ? "" : "-rotate-90"
                      }`}
                    />
                  </button>
                )}

                {/* Items */}
                {isOpenSection && (
                  <div className="space-y-1">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      const isCollapsedDesktop = collapsed && isDesktop;

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`
              relative flex items-center rounded-xl text-sm font-semibold
              transition-colors duration-200 group
              ${isCollapsedDesktop ? "justify-center py-3" : "gap-3 px-3 py-2.5"}
              ${active ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-white/10 hover:text-white"}
            `}
                        >
                          <Icon
                            size={18}
                            className={`shrink-0 ${active ? "text-white" : "text-gray-500 group-hover:text-gray-300"}`}
                          />
                          {!isCollapsedDesktop && (
                            <span className="truncate">{item.name}</span>
                          )}

                          {/* Tooltip */}
                          {isCollapsedDesktop && (
                            <div className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-100 border border-white/10 shadow-xl">
                              {item.name}
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <button
            onClick={() => navigate("/profile")}
            className={`
              w-full flex items-center rounded-xl hover:bg-white/10 transition-colors duration-200
              ${collapsed && isDesktop ? "justify-center py-3" : "gap-3 px-3 py-2.5"}
            `}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            {(!collapsed || !isDesktop) && (
              <div className="min-w-0 text-left flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-[10px] text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            )}
            {(!collapsed || !isDesktop) && (
              <span className={`shrink-0 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                role === "admin"    ? "bg-orange-500/20 text-orange-400" :
                role === "owner"    ? "bg-emerald-500/20 text-emerald-400" :
                role === "advisor"  ? "bg-violet-500/20 text-violet-400" :
                role === "mechanic" ? "bg-violet-500/20 text-violet-400" :
                "bg-blue-500/20 text-blue-400"
              }`}>
                {ROLE_LABELS[role] ?? role}
              </span>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
