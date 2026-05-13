import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wrench, User, StickyNote, ChevronDown, ChevronUp } from "lucide-react";

const JobCardRow = ({ job, isOpen, toggleExpand }) => {
  const notes = job.notes || job.remarks || "";

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      {/* ── Summary Row (always visible) ── */}
      <button
        onClick={() => toggleExpand(job._id)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left gap-4"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5 text-blue-500" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-lg text-slate-900 truncate">{job.jobCardId}</p>
            <p className="text-[13px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg w-fit mt-0.5">
              {job.licensePlate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Date
            </p>
            <p className="text-[13px] font-bold text-slate-600">
              {new Date(job.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100">
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </div>
        </div>
      </button>

      {/* ── Expanded Detail Panel ── */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 bg-slate-50/70 border-t border-slate-100 space-y-6">
              {/* Meta info row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="flex flex-col gap-1.5 p-4 bg-white border border-slate-300 rounded-2xl shadow-sm">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-blue-500" /> Mechanic
                  </span>
                  <span className="text-sm capitalize font-bold text-slate-800">
                    {job.mechanicName || "Not Assigned"}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 p-4 bg-white border border-slate-300 rounded-2xl shadow-sm">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <User className="w-4 h-4 text-indigo-500" /> Advisor
                  </span>
                  <span className="text-sm capitalize font-bold text-slate-800">
                    {job.advisorName || "Not Assigned"}
                  </span>
                </div>
              </div>

              {/* Job Instructions */}
              {(job.serviceInstructions || job.notes) && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <StickyNote className="w-4 h-4 text-amber-500" /> Job
                    Instructions
                  </h4>
                  <p className="text-sm text-slate-700 font-bold capitalize bg-white border border-slate-300 rounded-2xl px-5 py-4 leading-relaxed shadow-sm">
                    {job.serviceInstructions || job.notes}
                  </p>
                </div>
              )}

              {!job.mechanicName &&
                !job.advisorName &&
                !job.serviceInstructions &&
                !job.notes && (
                  <p className="text-sm text-slate-400 font-bold text-center py-8">
                    No detailed instructions available for this job card.
                  </p>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobCardRow;
