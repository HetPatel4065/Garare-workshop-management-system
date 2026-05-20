import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Wrench,
  LogOut,
  Loader2,
  FileText,
  LayoutDashboardIcon,
  LayoutDashboard,
  AlertCircle,
  Sparkles,
  X,
  ArrowRight,
  MapPin,
  Calendar,
  Fuel,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { FaCar } from "react-icons/fa";
import { HiDocumentCurrencyRupee } from "react-icons/hi2";

// Components
import TabButton from "./components/TabButton";
import DashboardStats from "./components/DashboardStats";
import RecentActivityItem from "./components/RecentActivityItem";
import VehicleCard from "./components/VehicleCard";
import JobCardRow from "./components/JobCardRow";
import ServiceHistoryItem from "./components/ServiceHistoryItem";
import InvoiceRow from "./components/InvoiceRow";
import MarketplaceListings from "../MarketplaceListings";
import ThemeToggle from "../../components/theme/ThemeToggle";


const PortalDashboard = ({ garageSettings }) => {
  const [data, setData] = useState({
    vehicles: [],
    jobCards: [],
    invoices: [],
    services: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [expandedSvcId, setExpandedSvcId] = useState(null);
  const [expandedVehicleId, setExpandedVehicleId] = useState(null);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);
  const [token, setToken] = useState(
    sessionStorage.getItem("portal_token") || sessionStorage.getItem("garage_token"),
  );
  const navigate = useNavigate();
  const fullYear = new Date().getFullYear();
  const [user, setUser] = useState(() => {
    try {
      return (
        JSON.parse(sessionStorage.getItem("portal_user")) ||
        JSON.parse(sessionStorage.getItem("user")) ||
        null
      );
    } catch {
      return null;
    }
  });

  const [showVehiclePopup, setShowVehiclePopup] = useState(false);
  const [featuredVehicles, setFeaturedVehicles] = useState([]);

  const fetchFeaturedVehicles = async (storedToken) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/vehicle-sales/marketplace`,
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );
      if (Array.isArray(res.data)) {
        setFeaturedVehicles(res.data.filter((v) => v.status === "Available").slice(0, 3));
      }
    } catch (err) {
      console.error("Error fetching featured vehicles for popup:", err);
    }
  };

  useEffect(() => {
    const storedToken =
      sessionStorage.getItem("portal_token") || sessionStorage.getItem("garage_token");
    if (!storedToken) {
      navigate("/portal");
      return;
    }
    setToken(storedToken);
    fetchDashboardData(storedToken);
    fetchUser(storedToken);
    fetchFeaturedVehicles(storedToken);

    const isPopupShown = sessionStorage.getItem("vehicle_popup_shown");
    if (!isPopupShown) {
      const timer = setTimeout(() => {
        setShowVehiclePopup(true);
      }, 180000); // 3 minutes
      return () => clearTimeout(timer);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/portal/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const nextUser = res.data?.data ?? res.data;
        setUser(nextUser);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) handleLogout();
    }
  };

  const fetchDashboardData = async (token) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/portal/dashboard`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) setData(res.data.data);
    } catch (err) {
      setError("Failed to load dashboard data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("portal_token");
    sessionStorage.removeItem("portal_user");
    navigate("/portal");
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "paid":
        return "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50";
      case "in-progress":
      case "sent":
        return "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50";
      case "pending":
      case "draft":
        return "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700/50";
    }
  };

  const toggleJobExpand = (id) => {
    setExpandedJobId((prev) => (prev === id ? null : id));
  };

  const toggleSvcExpand = (id) => {
    setExpandedSvcId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faff] dark:bg-zinc-950 flex flex-col items-center justify-center transition-colors duration-300">
        <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-500 animate-spin mb-4" />
        <p className="text-slate-500 dark:text-zinc-400 font-bold tracking-widest uppercase text-sm">
          Loading Dashboard
        </p>
      </div>
    );
  }

  const toggleVehicleExpand = (id) => {
    setExpandedVehicleId((prev) => (prev === id ? null : id));
  };

  const toggleInvoiceExpand = (id) => {
    setExpandedInvoiceId((prev) => (prev === id ? null : id));
  };

  const { vehicles, jobCards, invoices, services } = data;

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-zinc-950 dark:text-zinc-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/50 selection:text-blue-600 dark:selection:text-blue-400 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md sticky top-0 z-99 border-b border-slate-200/60 dark:border-zinc-800 px-4 sm:px-6 py-3 sm:py-4 shadow-sm transition-colors duration-300">
        <div className="max-w-full mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative shrink-0">
              {user?.garage?.logo ? (
                <img
                  src={`${import.meta.env.VITE_BASE_URL?.replace(/\/$/, "")}/${user.garage.logo.replace(/^\//, "")}`}
                  alt="Garage Logo"
                  className="w-10 sm:w-14 h-10 sm:h-14 rounded-xl sm:rounded-2xl object-cover border-2 border-white shadow-md"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.garage.garageName || "G"}&background=2563eb&color=fff`;
                  }}
                />
              ) : (
                <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-xl sm:rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-sm sm:text-xl font-black shadow-lg shadow-blue-200">
                  {user?.garage?.garageName?.charAt(0) || "G"}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {user?.garage?.garageName || "Your Garage"}
                <span className="block text-[10px] sm:text-sm font-medium tracking-normal text-blue-600 dark:text-blue-400">
                  Customer Dashboard
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:block text-right mr-2 sm:mr-4">
              <p className="text-sm font-bold text-slate-900 dark:text-zinc-200">
                {user?.name || "Customer"}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">{user?.email}</p>
            </div>
            <ThemeToggle variant="compact" />
            <button
              onClick={handleLogout}
              className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          <TabButton
            id="overview"
            icon={LayoutDashboard}
            label="Overview"
            activeTab={activeTab}
            onClick={setActiveTab}
          />
          <TabButton
            id="vehicles"
            icon={FaCar}
            label="My Vehicles"
            activeTab={activeTab}
            onClick={setActiveTab}
          />
          <TabButton
            id="jobcards"
            icon={FileText}
            label="Job Cards"
            activeTab={activeTab}
            onClick={setActiveTab}
          />
          <TabButton
            id="services"
            icon={Wrench}
            label="Service History"
            activeTab={activeTab}
            onClick={setActiveTab}
          />
          <TabButton
            id="invoices"
            icon={HiDocumentCurrencyRupee}
            label="Invoices"
            activeTab={activeTab}
            onClick={setActiveTab}
          />
          <TabButton
            id="sell"
            icon={Tag}
            label="Sell Car"
            activeTab={activeTab}
            onClick={setActiveTab}
          />
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-8"
            >
              <DashboardStats
                vehicleCount={vehicles.length}
                serviceCount={services.length}
                invoiceCount={invoices.length}
              />

              {/* Recent Activity */}
              <div className="bg-white dark:bg-zinc-900 rounded-4xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors duration-300">
                <div className="p-8 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Recent Service Activity
                  </h3>
                  <button
                    onClick={() => setActiveTab("services")}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="p-8">
                  {services.length > 0 ? (
                    <div className="space-y-4">
                      {services.slice(0, 3).map((item) => (
                        <RecentActivityItem
                          key={item._id}
                          item={item}
                          getStatusColor={getStatusColor}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-zinc-500 text-center py-8">
                      No recent services found.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── VEHICLES ── */}
          {activeTab === "vehicles" && (
            <motion.div
              key="vehicles"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-4xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors duration-300"
            >
              <div className="p-6 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  My Vehicles
                </h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 font-bold mt-1">
                  List of your registered vehicles — click to see full details
                </p>
              </div>

              {vehicles.length > 0 ? (
                <div className="p-6 space-y-3">
                  {vehicles.map((vehicle) => (
                    <VehicleCard
                      key={vehicle._id}
                      vehicle={vehicle}
                      isOpen={expandedVehicleId === vehicle._id}
                      toggleExpand={toggleVehicleExpand}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-6 py-16 text-center">
                  <FaCar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold text-lg">
                    No vehicles registered yet.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── JOB CARDS (Accordion) ── */}
          {activeTab === "jobcards" && (
            <motion.div
              key="jobcards"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-4xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors duration-300"
            >
              <div className="p-6 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Job Cards</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 font-bold mt-1">
                  Click any row to expand full job details
                </p>
              </div>

              {jobCards.length > 0 ? (
                <div className="p-6 space-y-3">
                  {jobCards.map((job) => (
                    <JobCardRow
                      key={job._id}
                      job={job}
                      isOpen={expandedJobId === job._id}
                      toggleExpand={toggleJobExpand}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-6 py-16 text-center">
                  <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-bold">
                    No job cards found.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── SERVICE HISTORY (Individual Services) ── */}
          {activeTab === "services" && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-4xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors duration-300"
            >
              <div className="p-6 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Service History
                </h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 font-bold mt-1">
                  Individual service records — click to expand details
                </p>
              </div>

              {services.length > 0 ? (
                <div className="p-6 space-y-3">
                  {services.map((svc) => (
                    <ServiceHistoryItem
                      key={svc._id}
                      svc={svc}
                      isOpen={expandedSvcId === svc._id}
                      toggleExpand={toggleSvcExpand}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-6 py-16 text-center">
                  <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-bold">
                    No service history found.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── INVOICES ── */}
          {activeTab === "invoices" && (
            <motion.div
              key="invoices"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white dark:bg-zinc-900 rounded-4xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors duration-300"
            >
              <div className="p-6 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Invoices</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 font-bold mt-1">
                  View and download your billing records
                </p>
              </div>
              <div className="p-6 space-y-4">
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <InvoiceRow
                      key={invoice._id}
                      invoice={{
                        ...invoice,
                        invoiceId: `${fullYear}-${invoice.invoiceNumber}`,
                        totalAmount: invoice.total,
                        licensePlate:
                          invoice.serviceId?.vehicleId?.licensePlate,
                      }}
                      isOpen={expandedInvoiceId === invoice._id}
                      toggleExpand={toggleInvoiceExpand}
                      getStatusColor={getStatusColor}
                      onRefresh={() => fetchDashboardData(token)}
                      token={token}
                    />
                  ))
                ) : (
                  <div className="px-6 py-16 text-center">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-bold">
                      No invoices found.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── SELL CAR ── */}
          {activeTab === "sell" && (
            <motion.div
              key="sell"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-4xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors duration-300"
            >
              <MarketplaceListings token={token} isCustomer={true} currentUser={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 🔮 Timed Glassmorphic Premium Vehicles Popup */}
      <AnimatePresence>
        {showVehiclePopup && featuredVehicles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 dark:bg-zinc-950/70 backdrop-blur-md p-4 md:p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/20 dark:border-zinc-800/40 bg-white/80 dark:bg-zinc-900/80 p-6 md:p-8 shadow-2xl shadow-blue-500/10 dark:shadow-zinc-950/50 backdrop-blur-2xl"
            >
              {/* Decorative radial gradients */}
              <div className="absolute -top-24 -right-24 -z-10 h-48 w-48 rounded-full bg-blue-400/20 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 -z-10 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl" />

              {/* Close Button */}
              <button
                onClick={() => {
                  sessionStorage.setItem("vehicle_popup_shown", "true");
                  setShowVehiclePopup(false);
                }}
                className="absolute top-4 right-4 rounded-full border border-slate-200/60 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 p-2 text-slate-500 dark:text-zinc-400 shadow-xs backdrop-blur-xs transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-800 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 dark:shadow-none">
                  <Sparkles className="h-6 w-6 animate-pulse" />
                </div>
                <h3 className="bg-linear-to-r from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-500 bg-clip-text text-2xl font-black tracking-tight text-transparent md:text-3xl">
                  Premium Pre-Owned Vehicles
                </h3>
                <p className="mt-2 max-w-lg text-sm font-bold text-slate-500 dark:text-zinc-400">
                  Explore certified quality cars listed directly by our trusted garage network. Handpicked deals, fully serviced, ready to drive!
                </p>
              </div>

              {/* Vehicles Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 mb-6">
                {featuredVehicles.map((vehicle) => (
                  <div
                    key={vehicle._id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 dark:hover:border-zinc-700 hover:shadow-md dark:hover:shadow-zinc-950/30"
                  >
                    {/* Image */}
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                      {vehicle.photos && vehicle.photos.length > 0 ? (
                        <img
                          src={`${import.meta.env.VITE_BASE_URL?.replace(/\/$/, "")}/${vehicle.photos[0].replace(/^\//, "")}`}
                          alt={vehicle.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80";
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-zinc-850 text-slate-400 dark:text-zinc-600">
                          <FaCar className="h-10 w-10" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 rounded-lg bg-blue-600/90 px-2.5 py-1 text-xs font-black text-white shadow-xs dark:shadow-none backdrop-blur-xs">
                        ₹{vehicle.price.toLocaleString("en-IN")}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col p-4">
                      <div className="mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          {vehicle.brand}
                        </span>
                        <h4 className="line-clamp-1 font-bold text-slate-800 dark:text-zinc-200">
                          {vehicle.title}
                        </h4>
                      </div>

                      {/* Spec summary badges */}
                      <div className="mt-auto grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500 dark:text-zinc-450">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-600" />
                          <span>{vehicle.year}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Fuel className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-600" />
                          <span>{vehicle.fuelType}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-600" />
                          <span className="truncate">{vehicle.ownerId?.city || "Local"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Wrench className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-600" />
                          <span>{vehicle.transmission}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row border-t border-slate-100 dark:border-zinc-800/60 pt-5">
                <button
                  onClick={() => {
                    sessionStorage.setItem("vehicle_popup_shown", "true");
                    setShowVehiclePopup(false);
                    navigate("/portal/marketplace");
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-300 dark:hover:shadow-none"
                >
                  Explore Marketplace
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    sessionStorage.setItem("vehicle_popup_shown", "true");
                    setShowVehiclePopup(false);
                  }}
                  className="px-5 py-3 text-sm font-bold text-slate-400 dark:text-zinc-500 transition-colors hover:text-slate-600 dark:hover:text-zinc-300"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortalDashboard;
