import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  Calendar,
  Wrench,
  User,
  Car,
  Tag,
  Package,
  IndianRupee,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { FaCar } from "react-icons/fa";

const ServiceHistoryItem = ({ svc, isOpen, toggleExpand }) => {
  const hasParts = (svc.parts || []).length > 0;
  const hasLabor = (svc.laborCharges || []).length > 0;
  const hasSvcs = (svc.selectedServices || []).length > 0;

  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden">
      {/* ── Summary row ── */}
      <button
        onClick={() => toggleExpand(svc._id)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left gap-4"
      >
        {/* Left: icon + name + vehicle */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-lg capitalize text-slate-900 truncate w-full">
              {(Array.isArray(svc.serviceName)
                ? svc.serviceName
                : (svc.serviceName || "General Maintenance")
                  .split("\n")
                  .filter(Boolean)
              )
                .map((item) =>
                  ((typeof item === "object" ? item.name : item) || "").trim(),
                )
                .join(" - ")}
            </p>
            <div className="flex items-center gap-3 flex-wrap mt-0.5">
              {svc.serviceId && (
                <span className="text-xs font-bold text-slate-500">
                  {svc.serviceId}
                </span>
              )}
              {svc.licensePlate && (
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                  {svc.licensePlate}
                </span>
              )}
              {svc.jobCardId && (
                <span className="text-xs font-bold text-blue-500">
                  {svc.jobCardId}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: staff + status + chevron */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden md:flex flex-col items-end gap-1">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${svc.status === "Completed"
                ? "bg-green-50 text-green-600 border-green-100"
                : "bg-blue-50 text-blue-600 border-blue-100"
                }`}
            >
              {svc.status}
            </span>
          </div>
          <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100">
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </div>
        </div>
      </button>

      {/* ── Expanded detail ── */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="svc-detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 bg-slate-50/70 border-t border-slate-100 space-y-5">
              {/* Meta row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Date
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {new Date(svc.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {svc.priority && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Priority
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {svc.priority}
                    </span>
                  </div>
                )}
                {/* Staff — visible on mobile inside expanded panel */}
                {svc.mechanicName && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Wrench className="w-3 h-3" /> Mechanic
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {svc.mechanicName}
                    </span>
                  </div>
                )}
                {svc.advisorName && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <User className="w-3 h-3" /> Advisor
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {svc.advisorName}
                    </span>
                  </div>
                )}
              </div>

              {/* Vehicle snapshot */}
              {svc.vehicle && (svc.vehicle.make || svc.vehicle.model) && (
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <FaCar className="w-3 h-3" /> Vehicle
                  </h4>
                  <p className="text-sm font-bold text-slate-800 bg-white border border-slate-100 rounded-xl px-4 py-2">
                    {`${[
                      svc.vehicle.year ? `${svc.vehicle.year} -` : null,
                      svc.vehicle.make,
                      svc.vehicle.model,
                    ]
                      .filter(Boolean)
                      .join(" ")}`}

                    {svc.vehicle.fuelType && (
                      <span className="ml-2 font-semibold text-slate-400">
                        ({svc.vehicle.fuelType})
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Selected services */}
              {hasSvcs && (
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <IndianRupee className="w-3 h-3" /> Services Done
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="bg-white border-b border-slate-100">
                          <th className="px-4 py-2 font-black text-slate-500 text-xs uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-4 py-2 font-black text-slate-500 text-xs uppercase tracking-wider text-right">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {svc.selectedServices.map((sv, i) => (
                          <tr
                            key={i}
                            className="bg-white hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-4 capitalize py-2 font-bold text-slate-800">
                              {sv.name}
                            </td>
                            <td className="px-4 py-2 font-black text-slate-800 text-right">
                              {/* Use sv.price or sv.amount based on your data structure */}
                              ₹{Number(sv.price || 0).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Parts used */}
              {hasParts && (
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Package className="w-3 h-3" /> Parts Used
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="bg-white border-b border-slate-100">
                          <th className="px-4 py-2 font-black text-slate-500 text-xs uppercase tracking-wider">
                            Part
                          </th>
                          <th className="px-4 py-2 font-black text-slate-500 text-xs uppercase tracking-wider text-center">
                            Qty
                          </th>
                          <th className="px-4 py-2 font-black text-slate-500 text-xs uppercase tracking-wider text-right">
                            Unit
                          </th>
                          <th className="px-4 py-2 font-black text-slate-500 text-xs uppercase tracking-wider text-right">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {svc.parts.map((p, i) => (
                          <tr
                            key={i}
                            className="bg-white hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-4 py-2 capitalize font-bold text-slate-800">
                              {p.name}
                            </td>
                            <td className="px-4 py-2 font-bold text-slate-600 text-center">
                              {p.quantity}
                            </td>
                            <td className="px-4 py-2 font-bold text-slate-600 text-right">
                              ₹{Number(p.unitPrice).toLocaleString("en-IN")}
                            </td>
                            <td className="px-4 py-2 font-black text-slate-800 text-right">
                              ₹{Number(p.total).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Labour */}
              {hasLabor && (
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <IndianRupee className="w-3 h-3" /> Labour Charges
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="bg-white border-b border-slate-100">
                          <th className="px-4 py-2 font-black text-slate-500 text-xs uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-4 py-2 font-black text-slate-500 text-xs uppercase tracking-wider text-right">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {svc.laborCharges.map((l, i) => (
                          <tr
                            key={i}
                            className="bg-white hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-4 capitalize py-2 font-bold text-slate-800">
                              {l.description}
                            </td>
                            <td className="px-4 py-2 font-black text-slate-800 text-right">
                              ₹{Number(l.amount).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Notes */}
              {svc.notes && (
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <StickyNote className="w-3 h-3" /> Notes / Remarks
                  </h4>
                  <p className="text-sm text-slate-600 font-medium bg-white border border-slate-100 rounded-xl px-4 py-2 leading-relaxed">
                    {svc.notes}
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

export default ServiceHistoryItem;
