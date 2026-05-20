import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Calendar,
  Fuel,
  Wrench,
  CircleEqual,
  MapPin,
  MessageCircle,
  Tag,
  Phone,
  Building,
  User,
  Info,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaCar } from "react-icons/fa";
import ThemeToggle from "../../components/theme/ThemeToggle";


const PortalVehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [whatsappLink, setWhatsappLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const token = sessionStorage.getItem("portal_token") || sessionStorage.getItem("garage_token");

  useEffect(() => {
    if (!token) {
      navigate("/portal");
      return;
    }
    fetchVehicleDetails();
  }, [id]);

  const fetchVehicleDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/vehicle-sales/marketplace/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setVehicle(res.data.vehicle);
        setWhatsappLink(res.data.whatsappLink);
      } else {
        setError("Failed to retrieve vehicle details.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Error loading vehicle details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faff] dark:bg-zinc-950 flex flex-col items-center justify-center transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 dark:border-blue-500 border-t-transparent mb-4" />
        <p className="text-slate-500 dark:text-zinc-400 font-bold tracking-widest uppercase text-xs">
          Loading Vehicle Details...
        </p>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-[#f8faff] dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 max-w-md shadow-xs">
          <Info className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Listing Error</h3>
          <p className="text-slate-500 dark:text-zinc-400 font-bold text-sm mt-2">{error || "Vehicle listing not found"}</p>
          <button
            onClick={() => navigate("/portal/marketplace")}
            className="mt-6 px-6 py-2.5 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white font-black text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const photos = vehicle.photos && vehicle.photos.length > 0 ? vehicle.photos : [];

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-zinc-950 dark:text-zinc-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/50 selection:text-blue-600 dark:selection:text-blue-400 transition-colors duration-300 pb-16">
      {/* 🔮 Luxury Sticky Subheader */}
      <header className="bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border-b border-slate-200/60 dark:border-zinc-800 sticky top-0 z-30 px-6 py-4 shadow-xs transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/portal/marketplace")}
              className="p-2.5 rounded-xl border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white shadow-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <nav className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-zinc-500">
              <Link to="/portal/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link to="/portal/marketplace" className="hover:text-blue-600 dark:hover:text-blue-400">Marketplace</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-700 dark:text-zinc-300 max-w-[200px] truncate">{vehicle.title}</span>
            </nav>
          </div>
 
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-1.5 shadow-2xs">
              <CheckCircle className="w-3.5 h-3.5" />
              Verified Deal
            </span>
            <ThemeToggle variant="compact" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── LEFT COLUMN: PHOTO GALLERY ── */}
          <div className="lg:col-span-7 space-y-4">
            {/* Active Display Photo */}
            <div className="bg-slate-900 border border-slate-200/60 dark:border-zinc-800 rounded-4xl overflow-hidden aspect-video w-full relative group">
              <img
                src={`${import.meta.env.VITE_BASE_URL?.replace(/\/$/, "")}/${photos[activePhotoIdx]?.replace(/^\//, "")}`}
                alt={`${vehicle.title}`}
                className="w-full h-full object-cover transition-all"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <div className="absolute bottom-4 left-4 rounded-xl bg-slate-950/85 backdrop-blur-xs text-white text-xs font-bold px-3 py-1.5 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-blue-400" />
                ₹{vehicle.price.toLocaleString("en-IN")}
              </div>
            </div>

            {/* Thumbnail Selection list */}
            {photos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative w-24 h-16 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      idx === activePhotoIdx
                        ? "border-blue-600 scale-95 shadow-md shadow-blue-500/10 dark:shadow-none"
                        : "border-slate-200 dark:border-zinc-800 hover:border-slate-350 dark:hover:border-zinc-700"
                    }`}
                  >
                    <img
                      src={`${import.meta.env.VITE_BASE_URL?.replace(/\/$/, "")}/${photo.replace(/^\//, "")}`}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=150&q=80";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Description Card */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 rounded-4xl p-6 md:p-8 shadow-2xs transition-colors duration-300">
              <h3 className="font-black text-slate-900 dark:text-white text-lg mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Vehicle Information & Description
              </h3>
              <p className="text-slate-650 dark:text-zinc-300 text-sm font-bold leading-relaxed whitespace-pre-line">
                {vehicle.description}
              </p>
            </div>

            {/* Specifications Details */}
            {vehicle.specifications && vehicle.specifications.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 rounded-4xl p-6 md:p-8 shadow-2xs transition-colors duration-300">
                <h3 className="font-black text-slate-900 dark:text-white text-lg mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Additional Specifications
                </h3>
                <div className="overflow-hidden border border-slate-100 dark:border-zinc-800 rounded-2xl">
                  <table className="w-full text-left text-sm font-bold text-slate-600 dark:text-zinc-300">
                    <tbody className="divide-y divide-slate-150 dark:divide-zinc-800">
                      {vehicle.specifications.map((spec, index) => (
                        <tr
                          key={index}
                          className={index % 2 === 0 ? "bg-slate-50/50 dark:bg-zinc-950/20" : "bg-white dark:bg-zinc-900"}
                        >
                          <td className="px-6 py-3.5 font-black text-slate-500 dark:text-zinc-500 w-1/3 truncate">
                            {spec.key}
                          </td>
                          <td className="px-6 py-3.5 text-slate-800 dark:text-zinc-200 font-bold">
                            {spec.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: PRICING & SELLER INFO ── */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Title & Core Grid */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 rounded-4xl p-6 md:p-8 shadow-2xs space-y-6 transition-colors duration-300">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {vehicle.brand}
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mt-1">
                  {vehicle.title}
                </h2>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-3xl font-black bg-linear-to-r from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-500 bg-clip-text text-transparent">
                    ₹{vehicle.price.toLocaleString("en-IN")}
                  </p>
                  <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                    vehicle.status === "Available"
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40"
                      : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/40"
                  }`}>
                    {vehicle.status}
                  </span>
                </div>
              </div>

              {/* Core Specifications Grid */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <div className="bg-slate-50 dark:bg-zinc-950 p-4 border border-slate-100 dark:border-zinc-800/80 rounded-2xl flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Calendar className="w-4 h-4 text-slate-400 dark:text-zinc-550" />
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500">Year</span>
                  </div>
                  <p className="text-sm font-black text-slate-850 dark:text-zinc-200">{vehicle.year}</p>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-950 p-4 border border-slate-100 dark:border-zinc-800/80 rounded-2xl flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Fuel className="w-4 h-4 text-slate-400 dark:text-zinc-550" />
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500">Fuel</span>
                  </div>
                  <p className="text-sm font-black text-slate-850 dark:text-zinc-200">{vehicle.fuelType}</p>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-950 p-4 border border-slate-100 dark:border-zinc-800/80 rounded-2xl flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Wrench className="w-4 h-4 text-slate-400 dark:text-zinc-550" />
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500">Gearbox</span>
                  </div>
                  <p className="text-sm font-black text-slate-850 dark:text-zinc-200">{vehicle.transmission}</p>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-950 p-4 border border-slate-100 dark:border-zinc-800/80 rounded-2xl flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1.5">
                    <CircleEqual className="w-4 h-4 text-slate-400 dark:text-zinc-550" />
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500">Driven</span>
                  </div>
                  <p className="text-sm font-black text-slate-850 dark:text-zinc-200">{vehicle.kmDriven.toLocaleString()} KM</p>
                </div>
              </div>
            </div>

            {/* Glassmorphic Seller Card */}
            {(vehicle.ownerId || vehicle.customerId) && (
              <div className="relative overflow-hidden rounded-4xl border border-white/20 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-6 md:p-8 shadow-xl shadow-blue-500/5 dark:shadow-none backdrop-blur-2xl transition-colors duration-300">
                {/* Visual gradient backdrop circle */}
                <div className="absolute -bottom-24 -right-24 -z-10 h-40 w-40 rounded-full bg-blue-300/10 dark:bg-blue-500/5 blur-3xl" />
                <div className="absolute -top-24 -left-24 -z-10 h-40 w-40 rounded-full bg-indigo-300/10 dark:bg-indigo-500/5 blur-3xl" />

                <h3 className="font-black text-slate-900 dark:text-white text-lg mb-6 pb-2 border-b border-slate-150/50 dark:border-zinc-800 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Seller Contact Details
                </h3>

                <div className="space-y-4 mb-6">
                  {vehicle.customerId ? (
                    // Customer Listing
                    <>
                      {/* private seller indicator */}
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-full w-fit">
                        <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">Private Seller</span>
                      </div>
 
                      {/* Customer Name with Verified Symbol */}
                      <div className="flex items-start gap-3 mt-2">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 shrink-0 rounded-lg">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider">Seller Name</p>
                          <p className="font-bold text-slate-800 dark:text-zinc-200 text-sm flex items-center gap-1.5 mt-0.5">
                            {vehicle.customerId.name}
                            {vehicle.customerId.isVerified && (
                              <span className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full p-0.5 shadow-md shadow-blue-500/20" title="Verified Seller">
                                <CheckCircle className="w-3.5 h-3.5 text-white fill-current" />
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-zinc-950 rounded-lg text-slate-450 dark:text-zinc-500 shrink-0">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider">Contact Phone</p>
                          <p className="font-bold text-slate-700 dark:text-zinc-300 text-sm mt-0.5">{vehicle.customerId.phone}</p>
                        </div>
                      </div>
 
                      {/* Email */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-zinc-950 rounded-lg text-slate-450 dark:text-zinc-500 shrink-0 flex items-center justify-center">
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider">Email Address</p>
                          <p className="font-bold text-slate-700 dark:text-zinc-300 text-sm mt-0.5 truncate max-w-[220px]">{vehicle.customerId.email}</p>
                        </div>
                      </div>

                      {/* Affiliated Garage support for Customer listed vehicles */}
                      {vehicle.ownerId && (
                        <div className="mt-6 pt-4 border-t border-slate-150/50 dark:border-zinc-800 flex items-center gap-3">
                          {vehicle.ownerId.logo ? (
                            <div className="w-9 h-9 rounded-lg border border-slate-200/60 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950 shrink-0 flex items-center justify-center shadow-xs">
                              <img
                                src={
                                  vehicle.ownerId.logo.startsWith("http")
                                    ? vehicle.ownerId.logo
                                    : `${import.meta.env.VITE_BASE_URL?.replace(/\/$/, "")}/${vehicle.ownerId.logo.replace(/^\//, "")}`
                                }
                                alt={vehicle.ownerId.garageName || "Garage Logo"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.parentNode.innerHTML = `<div class="w-full h-full bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xs font-black">${vehicle.ownerId.garageName?.charAt(0) || "G"}</div>`;
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xs font-black shadow-sm shrink-0">
                              {vehicle.ownerId.garageName?.charAt(0) || "G"}
                            </div>
                          )}
                          <div>
                            <p className="text-[9px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider">Certified Affiliated Garage</p>
                            <h4 className="font-black text-slate-800 dark:text-zinc-200 text-xs flex items-center gap-1 mt-0.5">
                              {vehicle.ownerId.garageName}
                              {vehicle.ownerId.verificationStatus === "Verified" && (
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" title="Verified Workshop" />
                              )}
                            </h4>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    // Garage Owner Listing
                    <>
                      {/* Garage Dealer Indicator */}
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-full w-fit">
                        <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Garage Dealer</span>
                      </div>

                      {/* Garage Brand with Logo */}
                      <div className="flex items-center gap-3 mt-2">
                        {vehicle.ownerId.logo ? (
                          <div className="w-11 h-11 rounded-xl border border-slate-200/60 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950 shrink-0 flex items-center justify-center shadow-xs">
                            <img
                              src={
                                vehicle.ownerId.logo.startsWith("http")
                                  ? vehicle.ownerId.logo
                                  : `${import.meta.env.VITE_BASE_URL?.replace(/\/$/, "")}/${vehicle.ownerId.logo.replace(/^\//, "")}`
                              }
                              alt={vehicle.ownerId.garageName || "Garage Logo"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.parentNode.innerHTML = `<div class="w-full h-full bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-base font-black">${vehicle.ownerId.garageName?.charAt(0) || "G"}</div>`;
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-base font-black shadow-sm shrink-0">
                            {vehicle.ownerId.garageName?.charAt(0) || "G"}
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider">Garage Shop</p>
                          <h4 className="font-black text-slate-800 dark:text-zinc-200 text-sm leading-snug flex items-center gap-1.5 mt-0.5">
                            {vehicle.ownerId.garageName}
                            {vehicle.ownerId.verificationStatus === "Verified" && (
                              <span className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full p-0.5 shadow-md shadow-blue-500/20" title="Verified Workshop">
                                <CheckCircle className="w-3.5 h-3.5 text-white fill-current" />
                              </span>
                            )}
                          </h4>
                        </div>
                      </div>

                      {/* Owner Name */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-zinc-950 rounded-lg text-slate-450 dark:text-zinc-500 shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider">Dealer Owner</p>
                          <p className="font-bold text-slate-700 dark:text-zinc-300 text-sm mt-0.5">{vehicle.ownerId.name}</p>
                        </div>
                      </div>

                      {/* Mobile Number */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-zinc-950 rounded-lg text-slate-450 dark:text-zinc-500 shrink-0">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider">Mobile Number</p>
                          <p className="font-bold text-slate-700 dark:text-zinc-300 text-sm mt-0.5">{vehicle.ownerId.mobileNumber}</p>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-zinc-950 rounded-lg text-slate-450 dark:text-zinc-500 shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider">Location Address</p>
                          <p className="font-bold text-slate-700 dark:text-zinc-300 text-sm leading-relaxed mt-0.5">
                            {vehicle.ownerId.address || "Available on request"}, {vehicle.ownerId.city || ""}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* WhatsApp Call To Action */}
                {whatsappLink ? (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-3.5 shadow-lg shadow-emerald-600/10 dark:shadow-none hover:shadow-xl transition-all cursor-pointer text-center"
                  >
                    <MessageCircle className="w-5 h-5 shrink-0 animate-bounce" />
                    Chat on WhatsApp
                    <ExternalLink className="w-4 h-4 shrink-0" />
                  </a>
                ) : (
                  <div className="text-center p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-400 dark:text-zinc-505 text-xs font-bold">
                    Seller details unavailable
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PortalVehicleDetails;
