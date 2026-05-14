import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  ChevronUp,
  Settings,
  Activity,
  Calendar,
  Clock,
  Gauge,
  Info,
  Hash,
} from "lucide-react";
import { FaCar } from "react-icons/fa";

const VehicleCard = ({ vehicle, isOpen, toggleExpand }) => {
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      {/* ── Summary Row (always visible) ── */}
      <button
        onClick={() => toggleExpand(vehicle._id)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50/50 transition-colors text-left gap-4"
      >
        <div className="flex items-center gap-5 min-w-0">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 shadow-sm shadow-blue-100">
            <FaCar className="w-7 h-7 text-blue-600" />
          </div>
          <div className="flex flex-col gap-2 min-w-0">
            {/* Row 1: Make & Model */}
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold capitalize tracking-tight text-black truncate">
                {vehicle.make}{" "}{vehicle.model}
              </h3>
            </div>

            {/* Row 2: Metadata Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* High-Contrast License Plate Style */}
              <div className="flex items-center bg-slate-600 rounded-md overflow-hidden shadow-sm border border-slate-800">
                <span className="px-2 py-0.5 text-[11px] font-bold text-white uppercase tracking-widest">
                  {vehicle.licensePlate}
                </span>
              </div>

              {/* Year Badge */}
              <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200 text-[11px] font-bold">
                <Calendar className="w-3 h-3" />
                {vehicle.year}
              </span>

              {/* Status Badge - Dynamic Colors */}
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                {vehicle.status}
              </span>
            </div>
          </div>
        </div>

        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 transition-colors">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {/* ── Expanded Detail Panel ── */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="vehicle-detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-8 pt-2 bg-slate-50/50 border-t border-slate-100 space-y-8">
              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity className="w-3 h-3" /> Fuel Type
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {vehicle.fuelType || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Settings className="w-3 h-3" /> Transmission
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {vehicle.transmission || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Gauge className="w-3 h-3" /> Mileage
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {vehicle.currentMileage?.toLocaleString() || "0"} KM
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Hash className="w-3 h-3" /> Vehicle ID
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {vehicle.vehicleId || "N/A"}
                  </span>
                </div>
              </div>

              {/* Identity Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-white border border-slate-300 rounded-2xl shadow-sm">
                  <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-500" />
                    Identity Information
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-bold text-slate-500">
                        Chassis No
                      </span>
                      <span className="text-sm font-bold text-black tracking-wide">
                        {vehicle.chassisnumber || "Not Provided"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <span className="text-sm font-bold text-slate-500">
                        Engine Type
                      </span>
                      <span className="text-sm font-bold text-black capitalize">
                        {vehicle.engineType || "Not Provided"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-white border border-slate-300 rounded-2xl shadow-sm">
                  <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-green-500" />
                    Service Schedule
                  </h4>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <Clock className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-500">
                          Last Service
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        {vehicle.serviceDate
                          ? new Date(vehicle.serviceDate).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )
                          : "No record"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-50 rounded-lg">
                          <Calendar className="w-3 h-3 text-orange-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-500">
                          Next Due
                        </span>
                      </div>
                      <span className="text-sm font-bold text-orange-600">
                        {vehicle.nextServiceDate
                          ? new Date(
                            vehicle.nextServiceDate,
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                          : "Not scheduled"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {vehicle.notes && (
                <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
                  <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">
                    Vehicle Notes
                  </h4>
                  <p className="text-sm text-slate-700 font-bold leading-relaxed">
                    {vehicle.notes}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VehicleCard;
