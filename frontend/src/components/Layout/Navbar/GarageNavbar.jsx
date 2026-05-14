import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  Search,
  Settings,
  LogOut,
  User,
  X,
  Menu,
  Bell,
  Loader2,
  Wrench,
  ClipboardList,
  Users,
  Box,
  FileText,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Highlight = ({ text = "", query = "" }) => {
  if (!query || !text) return <span>{text || ""}</span>;

  // Escape special characters for regex
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = String(text).split(new RegExp(`(${escapedQuery})`, "gi"));

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-blue-500/40 text-blue-200 rounded-sm px-0.5 font-bold no-underline"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  );
};

const ResultSection = ({ title, items, onSelect, renderItem }) => {
  if (!items?.length) return null;
  return (
    <section className="mb-3 last:mb-0">
      <div className="flex items-center justify-between px-3 py-1.5 sticky top-0 bg-gray-900 z-10 border-b border-white/5 mb-1">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
          {title}
        </p>
        <span className="text-[9px] font-bold text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">
          {items.length}
        </span>
      </div>
      <div className="space-y-0.5 mt-1 px-1">
        {items.map((item, i) => (
          <button
            key={item._id || i}
            onClick={() => onSelect(item)}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 focus:bg-white/10 outline-none rounded-xl text-left transition-all group"
          >
            {renderItem(item)}
          </button>
        ))}
      </div>
    </section>
  );
};

const ResultsDropdown = ({
  searchResults,
  isSearching,
  searchQuery,
  setSearchQuery,
  setShowResults,
  setMobileSearchOpen,
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleSelect = (item) => {
    const q = item.searchParam || "";
    navigate(item.path + (q ? `?q=${encodeURIComponent(q)}` : ""));
    setShowResults(false);
    setSearchQuery("");
    setMobileSearchOpen?.(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowResults(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setShowResults]);

  const iconBox = (color, children) => (
    <div
      className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center shrink-0 shadow-sm border border-white/5`}
    >
      {children}
    </div>
  );

  const hasAnyResults = Object.values(searchResults).some(
    (arr) => arr.length > 0,
  );

  return (
    <div
      ref={dropdownRef}
      className="bg-gray-900 border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden ring-1 ring-white/5"
    >
      <div className="max-h-[65vh] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-white/10 scroll-smooth">
        {isSearching ? (
          <div className="py-16 text-center text-gray-500 text-sm flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full" />
            </div>
            <span className="font-medium tracking-tight">
              Scanning records...
            </span>
          </div>
        ) : (
          <>
            {!hasAnyResults ? (
              <div className="py-12 text-center text-gray-500 flex flex-col items-center gap-3">
                <Search size={24} className="opacity-10" />
                <p className="text-sm">
                  No exact matches for{" "}
                  <span className="text-gray-300 font-bold">
                    "{searchQuery}"
                  </span>
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                <ResultSection
                  title="Customers"
                  items={searchResults.customers}
                  onSelect={(i) =>
                    handleSelect({
                      ...i,
                      path: "/customers",
                      searchParam: i.name,
                    })
                  }
                  renderItem={(c) => (
                    <>
                      {iconBox(
                        "bg-blue-500/10",
                        <User size={14} className="text-blue-400" />,
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-200 truncate group-hover:text-blue-400 transition-colors">
                          <Highlight text={c.name} query={searchQuery} />
                        </p>
                        <p className="text-[11px] text-gray-500 flex items-center gap-2">
                          <span>{c.phone}</span>
                          {c.email && (
                            <span className="w-1 h-1 bg-gray-700 rounded-full" />
                          )}
                          <span className="truncate">{c.email}</span>
                        </p>
                      </div>
                    </>
                  )}
                />

                <ResultSection
                  title="Vehicles"
                  items={searchResults.vehicles}
                  onSelect={(i) =>
                    handleSelect({
                      ...i,
                      path: "/vehicles",
                      searchParam: i.licensePlate,
                    })
                  }
                  renderItem={(v) => (
                    <>
                      {iconBox(
                        "bg-emerald-500/10",
                        <span className="text-emerald-400 font-black text-[10px]">
                          {v.licensePlate?.slice(-4)}
                        </span>,
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-200 truncate group-hover:text-emerald-400 transition-colors">
                          <Highlight
                            text={`${v.make} ${v.model}`}
                            query={searchQuery}
                          />
                        </p>
                        <p className="text-[11px] text-gray-500 font-mono tracking-tighter uppercase">
                          {v.licensePlate}
                        </p>
                      </div>
                    </>
                  )}
                />

                <ResultSection
                  title="Inventory / Parts"
                  items={searchResults.inventory}
                  onSelect={(i) =>
                    handleSelect({
                      ...i,
                      path: "/inventory",
                      searchParam: i.name,
                    })
                  }
                  renderItem={(i) => (
                    <>
                      {iconBox(
                        "bg-amber-500/10",
                        <Box size={14} className="text-amber-400" />,
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-200 truncate group-hover:text-amber-400 transition-colors">
                          <Highlight text={i.name} query={searchQuery} />
                        </p>
                        <p className="text-[11px] text-gray-500">
                          SKU: {i.sku} • Stock:{" "}
                          <span
                            className={
                              i.stock < 5
                                ? "text-red-400 font-bold"
                                : "text-amber-400/70"
                            }
                          >
                            {i.stock}
                          </span>
                        </p>
                      </div>
                    </>
                  )}
                />

                <ResultSection
                  title="Services"
                  items={searchResults.services}
                  onSelect={(i) =>
                    handleSelect({
                      ...i,
                      path: "/services",
                      searchParam: i.serviceName,
                    })
                  }
                  renderItem={(s) => (
                    <>
                      {iconBox(
                        "bg-purple-500/10",
                        <Wrench size={14} className="text-purple-400" />,
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-200 truncate group-hover:text-purple-400 transition-colors">
                          <Highlight text={s.serviceName} query={searchQuery} />
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Vehicle: {s.vehicleId?.licensePlate || "N/A"}
                        </p>
                      </div>
                    </>
                  )}
                />

                <ResultSection
                  title="Job Cards"
                  items={searchResults.jobCards}
                  onSelect={(i) =>
                    handleSelect({
                      ...i,
                      path: "/job-cards",
                      searchParam: i.jobCardId,
                    })
                  }
                  renderItem={(jc) => (
                    <>
                      {iconBox(
                        "bg-rose-500/10",
                        <ClipboardList size={14} className="text-rose-400" />,
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-200 truncate group-hover:text-rose-400 transition-colors">
                          <Highlight text={jc.jobCardId} query={searchQuery} />
                        </p>
                        <p className="text-[11px] text-gray-500 capitalize">
                          {jc.status?.replace("-", " ")} • {jc.customerName}
                        </p>
                      </div>
                    </>
                  )}
                />

                <ResultSection
                  title="Staff Members"
                  items={searchResults.staff}
                  onSelect={(i) =>
                    handleSelect({
                      ...i,
                      path: "/staff-members",
                      searchParam: i.name,
                    })
                  }
                  renderItem={(st) => (
                    <>
                      {iconBox(
                        "bg-indigo-500/10",
                        <Users size={14} className="text-indigo-400" />,
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-200 truncate group-hover:text-indigo-400 transition-colors">
                          <Highlight text={st.name} query={searchQuery} />
                        </p>
                        <p className="text-[11px] text-gray-500 capitalize">
                          {st.role || st.type}
                        </p>
                      </div>
                    </>
                  )}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

import { useNotifications } from "../../../context/NotificationContext";

export default function TopNavbar({
  userName = "User",
  onToggleSidebar,
  showNotifications,
  setShowNotifications,
}) {
  const { logout, user } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const token = sessionStorage.getItem("token");

  // Filter notifications based on relevance (User requirements: unpaid invoices, new requests, reminders)
  const relevantNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const type = String(n.type).toLowerCase();
      return [
        "unpaid_invoice",
        "new_customer",
        "service_reminder",
        "low_stock",
        "warning",
        "info",
        "error",
      ].includes(type);
    });
  }, [notifications]);

  const hasNotifications = unreadCount > 0;

  const queryFromUrl = useMemo(
    () => new URLSearchParams(location.search).get("q") || "",
    [location.search],
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    customers: [],
    vehicles: [],
    services: [],
    inventory: [],
    jobCards: [],
    staff: [],
  });
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dropdownRef = useRef();
  const searchRef = useRef();
  const notifRef = useRef();
  const mobileSearchRef = useRef();

  const firstName = (user?.name || userName).split(" ")[0];
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "User";
  const isSettingsActive = location.pathname === "/settings";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Remove the sync effect that puts the URL query back into the search bar
  // This allows the search bar to stay empty after navigation as requested.

  const performSearch = useCallback(
    async (query) => {
      if (!query.trim() || query.length < 2) {
        setSearchResults({
          customers: [],
          vehicles: [],
          services: [],
          inventory: [],
          jobCards: [],
          staff: [],
        });
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      setShowResults(true);

      try {
        const headers = { Authorization: `Bearer ${token}` };
        const api = import.meta.env.VITE_API_URL;

        const endpoints = [
          `${api}/customers`, // Fetch all and filter if backend search is loose/missing
          `${api}/vehicles`,
          `${api}/services`,
          `${api}/inventory`,
          `${api}/job-cards`,
          `${api}/auth/staff`,
        ];

        const responses = await Promise.all(
          endpoints.map((url) =>
            fetch(url, { headers }).then((res) => (res.ok ? res.json() : [])),
          ),
        );

        const [cust, veh, serv, inv, jc, staff] = responses;

        const filter = (arr, fields) => {
          if (!Array.isArray(arr)) return [];
          return arr
            .filter((item) =>
              fields.some((f) => {
                const val = String(item[f] || "").toLowerCase();
                return val.includes(query.toLowerCase());
              }),
            )
            .slice(0, 5);
        };

        setSearchResults({
          customers: filter(cust, ["name", "phone", "email"]),
          vehicles: filter(veh, ["make", "model", "licensePlate"]),
          inventory: filter(inv, ["name", "sku", "carModel"]),
          services: filter(serv, ["serviceName"]),
          jobCards: filter(jc, ["jobCardId", "customerName", "licensePlate"]),
          staff: filter(staff, ["name", "email", "role"]),
        });
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    },
    [token],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== queryFromUrl || showResults) {
        performSearch(searchQuery);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowResults(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotifications(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setShowNotifications]);

  const handleSearchSubmit = (e) => {
    if (e && e.key && e.key !== "Enter") return;
    
    if (searchQuery.trim()) {
      if (e && e.preventDefault) e.preventDefault();
      const term = searchQuery.trim();
      setShowResults(false);
      setMobileSearchOpen(false);
      setSearchQuery("");
      navigate(`/search?q=${encodeURIComponent(term)}`);
    }
  };

  return (
    <>
      <header
        className={`
          h-16 sm:h-20 flex items-center px-4 sm:px-8 sticky top-0 transition-all duration-500 z-40
          ${scrolled ? "bg-gray-900/80 backdrop-blur-xl border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.3)]" : "bg-transparent"}
        `}
      >
        <div className="flex items-center justify-between w-full max-w-400 mx-auto gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          >
            <Menu size={22} />
          </button>

          <div
            className="flex-1 max-w-2xl hidden md:block relative"
            ref={searchRef}
          >
            <div className="relative group">
              <Search
                size={18}
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 pointer-events-none ${
                  showResults
                    ? "text-blue-500"
                    : "text-gray-500 group-focus-within:text-blue-400"
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                placeholder="Search everything (Customer, Vehicle, Parts, Staff...)"
                className="
                  w-full bg-white/5 border border-white/10
                  rounded-2xl py-3 pl-12 pr-28
                  text-sm text-gray-100 placeholder:text-gray-500
                  outline-none focus:bg-white/8 focus:border-blue-500/40
                  focus:ring-8 focus:ring-blue-500/5
                  transition-all duration-300 shadow-inner
                "
              />
              <AnimatePresence>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => {
                        setSearchQuery("");
                        setShowResults(false);
                        if (location.pathname === "/search") navigate("/search");
                      }}
                      className="text-gray-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                    >
                      <X size={16} />
                    </motion.button>
                  )}
                  <button
                    onClick={handleSearchSubmit}
                    className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-wider"
                  >
                    Search
                  </button>
                </div>
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {showResults && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  className="absolute top-full left-0 right-0 mt-3 z-999"
                >
                  <ResultsDropdown
                    searchResults={searchResults}
                    isSearching={isSearching}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    setShowResults={setShowResults}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 md:hidden" />

          <div className="flex items-center gap-1.5 sm:gap-3" ref={dropdownRef}>
            <button
              onClick={() => setMobileSearchOpen((v) => !v)}
              className={`md:hidden p-2.5 rounded-xl transition-all duration-300 ${
                mobileSearchOpen
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Search size={20} />
            </button>

            <button
              onClick={() => navigate("/settings")}
              className={`hidden sm:flex p-2.5 rounded-xl transition-all duration-300 ${
                isSettingsActive
                  ? "bg-white/10 text-blue-400"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Settings size={20} />
            </button>

            <div className="relative" ref={notifRef}>
              <button
                onClick={() => navigate("/notifications")}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  showNotifications
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Bell size={20} />
                {hasNotifications && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-gray-900 shadow-lg shadow-blue-500/20" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-gray-900/50 backdrop-blur-xl">
                      <h3 className="font-bold text-gray-100">Notifications</h3>
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                        NEW
                      </span>
                    </div>
                    <div className="max-h-100 overflow-y-auto">
                      {relevantNotifications.length === 0 ? (
                        <div className="p-12 text-center">
                          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5 shadow-inner">
                            <Bell size={28} className="text-gray-700" />
                          </div>
                          <p className="text-sm text-gray-400 font-medium tracking-tight">
                            No notifications
                          </p>
                          <p className="text-[11px] text-gray-600 mt-1">
                            We'll let you know when something happens
                          </p>
                        </div>
                      ) : (
                        <div className="py-2">
                          {relevantNotifications.map((n) => (
                            <button
                              key={n._id}
                              onClick={() => {
                                markAsRead(n._id);
                                const type = String(n.type).toLowerCase();
                                if (type === "new_customer")
                                  navigate("/requested-customers");
                                if (type === "unpaid_invoice")
                                  navigate("/billing");
                                if (
                                  type === "service_reminder" ||
                                  ["warning", "info", "error"].includes(type)
                                )
                                  navigate("/reminders");
                                setShowNotifications(false);
                              }}
                              className={`w-full flex items-start gap-4 px-5 py-4 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0 ${!n.read ? "bg-blue-500/5" : ""}`}
                            >
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/5 ${
                                  n.type === "unpaid_invoice"
                                    ? "bg-rose-500/10 text-rose-400"
                                    : n.type === "new_customer"
                                      ? "bg-blue-500/10 text-blue-400"
                                      : n.type === "service_reminder"
                                        ? "bg-amber-500/10 text-amber-400"
                                        : n.type === "low_stock"
                                          ? "bg-orange-500/10 text-orange-400"
                                          : "bg-indigo-500/10 text-indigo-400"
                                }`}
                              >
                                {n.type === "unpaid_invoice" ? (
                                  <FileText size={18} />
                                ) : n.type === "new_customer" ? (
                                  <User size={18} />
                                ) : n.type === "service_reminder" ? (
                                  <Clock size={18} />
                                ) : n.type === "low_stock" ? (
                                  <Box size={18} />
                                ) : (
                                  <Bell size={18} />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <p className="text-xs font-black text-gray-200 uppercase tracking-widest truncate">
                                    {n.title}
                                  </p>
                                  <span className="text-[10px] text-gray-600 font-bold whitespace-nowrap">
                                    {new Date(n.createdAt).toLocaleTimeString(
                                      [],
                                      { hour: "2-digit", minute: "2-digit" },
                                    )}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                                  {n.message}
                                </p>
                              </div>
                              {!n.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shadow-lg shadow-blue-500/50" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-white/5 bg-gray-950/50">
                      <button
                        onClick={() => {
                          navigate("/notifications");
                          setShowNotifications(false);
                        }}
                        className="w-full py-2.5 rounded-xl bg-white/5 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                      >
                        View All Notifications <ArrowRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-3 p-1 rounded-2xl hover:bg-white/5 transition-all duration-300 group"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors leading-none">
                    {firstName}
                  </p>
                  <p className="text-[8px] text-white mt-1.5 uppercase tracking-[0.15em] font-black opacity-80">
                    {roleLabel}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-linear-to-br bg-indigo-600 p-px shadow-lg group-hover:shadow-blue-500/20 transition-all">
                  <div className="w-full h-full rounded-[11px] bg-gray-950 flex items-center justify-center text-blue-400 font-black text-lg">
                    {firstName[0]}
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-3 w-60 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden ring-1 ring-white/5"
                  >
                    <div className="px-4 py-3.5 border-b border-white/5 mb-1 sm:hidden">
                      <p className="text-sm font-bold text-white">
                        {user?.name}
                      </p>
                      <p className="text-[10px] text-gray-500 font-bold capitalize tracking-wider">
                        {user?.role}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <User size={16} />
                      </div>
                      <span className="font-medium">My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate("/settings");
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center text-gray-400">
                        <Settings size={16} />
                      </div>
                      <span className="font-medium">Settings</span>
                    </button>
                    <div className="h-px bg-white/5 my-1.5 mx-3" />
                    <button
                      onClick={logout}
                      className="w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-3 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 group-hover:bg-red-500/20 transition-all">
                        <LogOut size={16} />
                      </div>
                      <span className="font-bold">Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSearchOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-45 md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-0 left-0 right-0 z-50 md:hidden bg-gray-950 p-4 border-b border-white/10 shadow-2xl"
            >
              <div className="flex items-center gap-3" ref={mobileSearchRef}>
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchSubmit}
                    placeholder="Search customers, vehicles, parts..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-24 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5"
                  />
                  <button
                    onClick={handleSearchSubmit}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-wider"
                  >
                    Search
                  </button>
                </div>
                <button
                  onClick={() => setMobileSearchOpen(false)}
                  className="p-3 rounded-2xl bg-white/5 text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              {showResults && (
                <div className="mt-4 max-h-[70vh] overflow-y-auto rounded-2xl">
                  <ResultsDropdown
                    searchResults={searchResults}
                    isSearching={isSearching}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    setShowResults={setShowResults}
                    setMobileSearchOpen={setMobileSearchOpen}
                  />
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
