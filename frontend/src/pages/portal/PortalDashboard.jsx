import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Wrench,
  LogOut,
  Loader2,
  FileText,
  LayoutDashboardIcon,
  LayoutDashboard,
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
  const [token, setToken] = useState(sessionStorage.getItem("portal_token") || sessionStorage.getItem("token"));
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

  useEffect(() => {
    const storedToken = sessionStorage.getItem("portal_token") || sessionStorage.getItem("token");
    if (!storedToken) {
      navigate("/portal");
      return;
    }
    setToken(storedToken);
    fetchDashboardData(storedToken);
    fetchUser(storedToken);
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
    localStorage.removeItem("portal_token");
    localStorage.removeItem("portal_user");
    navigate("/portal");
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "paid":
        return "bg-green-50 text-green-600 border-green-100";
      case "in-progress":
      case "sent":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "pending":
      case "draft":
        return "bg-orange-50 text-orange-600 border-orange-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
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
      <div className="min-h-screen bg-[#f8faff] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-sm">
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
    <div className="min-h-screen bg-[#f8faff] font-sans selection:bg-blue-100 selection:text-blue-600">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-99 border-b border-slate-200/60 px-6 py-4 shadow-sm">
        <div className="max-w-full mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {user?.garage?.logo ? (
                <img
                  src={`${import.meta.env.VITE_BASE_URL?.replace(/\/$/, "")}/${user.garage.logo.replace(/^\//, "")}`}
                  alt="Garage Logo"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.garage.garageName || "G"}&background=2563eb&color=fff`;
                  }}
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-200">
                  {user?.garage?.garageName?.charAt(0) || "G"}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {user?.garage?.garageName || "Your Garage"}
                <span className="block text-sm font-medium tracking-normal text-blue-600">
                  Customer Dashboard
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right mr-4">
              <p className="text-sm font-bold text-slate-900">
                {user?.name || "Customer"}
              </p>
              <p className="text-xs font-bold text-slate-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
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
              <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-xl font-black text-slate-900">
                    Recent Service Activity
                  </h3>
                  <button
                    onClick={() => setActiveTab("services")}
                    className="text-blue-600 font-bold hover:underline"
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
                    <p className="text-slate-500 text-center py-8">
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
              className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900">
                  My Vehicles
                </h3>
                <p className="text-sm text-slate-500 font-bold mt-1">
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
              className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900">Job Cards</h3>
                <p className="text-sm text-slate-500 font-bold mt-1">
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
              className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900">
                  Service History
                </h3>
                <p className="text-sm text-slate-500 font-bold mt-1">
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
              className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900">Invoices</h3>
                <p className="text-sm text-slate-500 font-bold mt-1">
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
        </AnimatePresence>
      </main>
    </div>
  );
};

export default PortalDashboard;
