import React, { useState, useEffect, useTransition } from "react";
import axios from "axios";
import {
  Search,
  MapPin,
  Phone,
  ArrowRight,
  Wrench,
  Loader2,
  Sparkles,
  Navigation,
  Clock,
  Navigation2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RegistrationModal from "./RegistrationModal";
import PortalLogin from "./PortalLogin";
import { useNavigate } from "react-router-dom";

const PortalHome = () => {
  const navigate = useNavigate();
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isGaragesModalOpen, setIsGaragesModalOpen] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [loginPrefill, setLoginPrefill] = useState("");
  const [serverLinkedGarages, setServerLinkedGarages] = useState([]);
  const getPortalToken = () =>
    sessionStorage.getItem("portal_token") || sessionStorage.getItem("token");
  const isAuthenticated = !!getPortalToken();

  useEffect(() => {
    fetchGarages();
  }, []);

  const handleSmartAllocation = () => {
    setAllocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          triggerAllocation(
            position.coords.latitude,
            position.coords.longitude,
          );
        },
        () => {
          triggerAllocation();
        },
      );
    } else {
      triggerAllocation();
    }
  };

  const triggerAllocation = async (lat, lng) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/portal/allocate-garage`,
        { lat, lng },
        {
          headers: { Authorization: `Bearer ${getPortalToken()}` },
        },
      );
      if (response.data.success) {
        const { type, garage, garages: payloadGarages } = response.data.data;
        if (type === "ACTIVE" || type === "LAST_USED_SINGLE") {
          handleEnterGarage(garage.garageId);
        } else {
          setServerLinkedGarages(payloadGarages);
          setIsGaragesModalOpen(true);
          setAllocating(false);
        }
      }
    } catch (err) {
      console.error("Allocation failed", err);
      setAllocating(false);
    }
  };

  const handleEnterGarage = async (garageId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/portal/select-garage`,
        { targetGarageId: garageId },
        {
          headers: { Authorization: `Bearer ${getPortalToken()}` },
        },
      );

      if (response.data.success) {
        sessionStorage.setItem("portal_token", response.data.token);
        sessionStorage.setItem("portal_user", JSON.stringify(response.data.user));
        navigate("/portal/dashboard");
      }
    } catch (err) {
      console.error("Error selecting garage:", err);
      setAllocating(false);
    }
  };

  const fetchGarages = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/portal/garages`,
      );
      if (response.data.success) {
        setGarages(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching garages:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGarages = React.useMemo(() => {
    return garages.filter(
      (garage) =>
        garage.garageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (garage.address &&
          garage.address.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [garages, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans selection:bg-blue-100 selection:text-blue-600">
      {/* 1. Refined Sticky Header */}
      <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-200/50 px-6 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div
            className="flex items-center gap-2.5 group cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200 group-hover:rotate-12 transition-transform">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter">
              Garage<span className="text-blue-600">Pro</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                isAuthenticated
                  ? navigate("/portal/dashboard")
                  : setIsLoginModalOpen(true)
              }
              className={`px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${
                isAuthenticated
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
                  : "bg-slate-900 text-white shadow-lg shadow-slate-200 hover:bg-slate-800"
              }`}
            >
              {isAuthenticated ? "My Dashboard" : "Customer Login"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* 2. Hero Section - More whitespace & better typography */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" /> Trusted by India's Garages
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]"
          >
            Premium care for <br />
            <span className="text-blue-600">your vehicle.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-500 leading-relaxed mb-10 px-4"
          >
            Connect with top-rated mechanics, track your service history, and
            book your next appointment in seconds.
          </motion.p>

          {/* 3. Floating Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-indigo-600 rounded-4xl blur-xl opacity-10 group-focus-within:opacity-20 transition-opacity"></div>
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Enter garage name or city..."
                className={`w-full pl-14 pr-6 py-5 bg-white rounded-[1.8rem] border-0 shadow-2xl shadow-slate-200 focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 text-lg placeholder:text-slate-400 ${isPending ? "opacity-70" : ""}`}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  startTransition(() => {
                    setSearchQuery(e.target.value);
                  });
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* 4. Garage Cards Container */}
        <section>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <Wrench className="absolute inset-0 m-auto w-6 h-6 text-blue-600" />
              </div>
              <p className="mt-6 text-slate-400 font-bold tracking-wide uppercase text-xs">
                Scanning Network...
              </p>
            </div>
          ) : filteredGarages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredGarages.map((garage, index) => (
                  <motion.div
                    key={garage._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => {
                      setSelectedGarage(garage);
                      setIsModalOpen(true);
                    }}
                    className="group cursor-pointer relative bg-white rounded-2xl p-6 border border-slate-400 hover:border-blue-500 hover:ring-4 hover:ring-blue-50 transition-all duration-300"
                  >
                    {/* Top Section: Logo & Badge */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {garage.logo ? (
                          <img
                            src={`${import.meta.env.VITE_BASE_URL?.replace(/\/$/, "")}/${String(garage.logo).replace(/^\//, "")}`}
                            alt=""
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <Wrench className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-md">
                          ONLINE
                        </span>
                      </div>
                    </div>

                    {/* Middle Section: Info */}
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {garage.garageName}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">
                          {garage.address || "Location not set"}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Section: Phone & Visual Indicator / Quick Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-2 text-slate-600 text-[13px]">
                        <Phone className="w-4 h-4" />
                        <span>{garage.mobileNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 overflow-hidden px-2 py-1.5 rounded-full bg-slate-50 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all duration-300">
                        <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold transition-all duration-300 group-hover:max-w-20 group-hover:ml-2">
                          Let's Go
                        </span>

                        <div className="w-5 h-5 flex items-center justify-center">
                          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white rounded-[3rem] shadow-sm border-2 border-dashed border-slate-200"
            >
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                No results found
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Try adjusting your search filters.
              </p>
            </motion.div>
          )}
        </section>
      </main>

      {/* 5. Minimalist Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
            <Wrench className="w-5 h-5" />
            <span className="font-black text-slate-900">GARAGEPRO</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-blue-600">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-blue-600">
              Terms of Service
            </a>
            <a href="#" className="hover:text-blue-600">
              Contact Support
            </a>
          </div>
          <p className="text-slate-400 text-sm">
            &copy; 2026 GaragePro Ecosystem
          </p>
        </div>
      </footer>

      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        garage={selectedGarage}
      />
      <PortalLogin
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setLoginPrefill("");
        }}
        prefilledEmail={loginPrefill}
      />
    </div>
  );
};

export default PortalHome;
