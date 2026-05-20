import React from "react";
import { Wrench, CheckCircle2 } from "lucide-react";

const RecentActivityItem = ({ item, getStatusColor }) => {
  const isService = !!item.serviceId;
  const name = isService
    ? (Array.isArray(item.serviceName)
      ? item.serviceName
      : (item.serviceName || "General Maintenance")
        .split("\n")
        .filter(Boolean)
    )
      .map((i) => ((typeof i === "object" ? i.name : i) || "").trim())
      .join(" - ")
    : item.jobCardId;

  return (
    <div className="flex items-center justify-between gap-2 p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 hover:border-blue-100 dark:hover:border-blue-900 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all duration-300">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div
          className={`w-10 sm:w-12 h-10 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${isService ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 dark:text-indigo-400" : "bg-blue-50 dark:bg-blue-950/30 text-blue-500 dark:text-blue-400"}`}
        >
          {isService ? (
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </div>
        <div>
          <p className="font-bold capitalize text-slate-900 dark:text-white truncate max-w-[120px] sm:max-w-[200px] md:max-w-[300px] lg:max-w-[400px]">
            {name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500">{item.serviceId}</p>
            <span className="w-1 h-1 bg-slate-200 dark:bg-zinc-800 rounded-full" />
            <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-tight">
              {item.licensePlate}
            </p>
          </div>
        </div>
      </div>
      <div className="text-right">
        <span
          className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(
            item.status,
          )}`}
        >
          {item.status}
        </span>
        <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 mt-2">
          {new Date(item.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
};

export default RecentActivityItem;
