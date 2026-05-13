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
    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/50 transition-colors">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${isService ? "bg-indigo-50 text-indigo-500" : "bg-blue-50 text-blue-500"}`}
        >
          {isService ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <Wrench className="w-6 h-6" />
          )}
        </div>
        <div>
          <p className="font-bold capitalize text-slate-900 truncate max-w-62.5">
            {name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs font-bold text-slate-400">{item.serviceId}</p>
            <span className="w-1 h-1 bg-slate-200 rounded-full" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">
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
        <p className="text-[10px] font-bold text-slate-400 mt-2">
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
