import React from "react";
import {
  X,
  MapPin,
  Phone,
  User,
  Wrench,
  Navigation,
  ExternalLink,
  ShieldCheck,
  Clock,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GarageDetailsModal = ({ isOpen, onClose, garage, onRegister }) => {
  if (!isOpen || !garage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Side: Visuals & Header */}
        <div className="w-full md:w-5/12 bg-slate-50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100">
          <div className="w-32 h-32 rounded-3xl bg-white shadow-xl shadow-blue-100 flex items-center justify-center mb-6 border border-slate-100 p-4">
            {garage.logo ? (
              <img
                src={`${import.meta.env.VITE_BASE_URL?.replace(/\/$/, "")}/${String(garage.logo).replace(/^\//, "")}`}
                alt={garage.garageName}
                className="w-full h-full object-contain"
              />
            ) : (
              <Wrench className="w-12 h-12 text-blue-500" strokeWidth={1.5} />
            )}
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2">
              {garage.garageName}
            </h3>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Verified Workshop
            </div>
          </div>

          <div className="mt-8 w-full space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operating Hours</p>
                <p className="text-sm font-bold text-slate-700">08:00 AM - 08:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Information & Actions */}
        <div className="w-full md:w-7/12 p-8 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-blue-600 font-extrabold text-[11px] uppercase tracking-[0.2em] mb-1 block">
                Garage Profile
              </span>
              <h4 className="text-xl font-extrabold text-slate-900">Workshop Information</h4>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 grow">
            {/* Owner Section */}
            <div className="flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Proprietor / Owner</p>
                <p className="text-[15px] font-bold text-slate-800">{garage.name}</p>
              </div>
            </div>

            {/* Address Section */}
            <div className="flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Location Address</p>
                <p className="text-[14px] font-bold text-slate-800 leading-relaxed">
                  {garage.address || "No address provided"}
                </p>
                {garage.location?.lat && garage.location?.lng && (
                  <button
                    onClick={() => window.open(`https://www.google.com/maps?q=${garage.location.lat},${garage.location.lng}`, "_blank")}
                    className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Get Directions
                  </button>
                )}
              </div>
            </div>

            {/* Note Section */}
            {garage.note && (
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Special Note / Services</p>
                  <p className="text-[13px] italic text-slate-500 leading-relaxed">
                    "{garage.note}"
                  </p>
                </div>
              </div>
            )}

            {/* Contact Section */}
            <div className="flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Contact Number</p>
                <p className="text-[15px] font-bold text-slate-800">{garage.mobileNumber}</p>
              </div>
            </div>

            {/* Verification Section */}
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <p className="text-[12px] text-blue-800 font-medium">
                This workshop is part of the <strong>GaragePro Network</strong>, ensuring quality service and genuine parts.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={() => {
                onClose();
                onRegister(garage);
              }}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              Request For Service
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GarageDetailsModal;
