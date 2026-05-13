import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  FiMail,
  FiMessageCircle,
  FiPhone,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiSearch,
} from "react-icons/fi";
import { FaUser } from "react-icons/fa";
import { format } from "date-fns";

const ServiceReminders = () => {
  const { token } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Upcoming");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReminders(res.data);
    } catch (err) {
      console.error("Error fetching reminders:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReminders = reminders.filter((r) => {
    if (!r.nextServiceDate) return false;

    const nextDate = new Date(r.nextServiceDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = nextDate.toDateString() === today.toDateString();
    const isOverdue = nextDate < today && r.reminderStatus !== "Completed";
    const isUpcoming = nextDate > today && r.reminderStatus !== "Completed";
    const isCompleted = r.reminderStatus === "Completed";

    const matchesSearch =
      r.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === "Today") return isToday;
    if (filter === "Overdue") return isOverdue;
    if (filter === "Upcoming") return isUpcoming;
    if (filter === "Completed") return isCompleted;
    return true;
  });

  const getStatusBadge = (status, dueDate) => {
    const nextDate = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const baseClass =
      "px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 w-fit whitespace-nowrap";

    if (status === "Completed") {
      return (
        <span className={`${baseClass} bg-green-100 text-green-700`}>
          <FiCheckCircle size={12} /> Completed
        </span>
      );
    }
    if (nextDate < today) {
      return (
        <span className={`${baseClass} bg-red-100 text-red-700`}>
          <FiAlertCircle size={12} /> Overdue
        </span>
      );
    }
    if (nextDate.toDateString() === today.toDateString()) {
      return (
        <span className={`${baseClass} bg-yellow-100 text-yellow-700`}>
          <FiClock size={12} /> Due Today
        </span>
      );
    }
    return (
      <span className={`${baseClass} bg-blue-100 text-blue-700`}>
        <FiCalendar size={12} /> Upcoming
      </span>
    );
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="mb-8 pb-5 border-b border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.22em] mb-2">
              Service Management
            </p>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Service Reminders
            </h1>

            <p className="text-sm font-medium text-slate-500 mt-3">
              Manage and track upcoming vehicle services
            </p>
          </div>

          <button
            onClick={fetchReminders}
            className="
        self-start sm:self-auto
        flex items-center gap-2
        px-5 py-3
        bg-blue-600 hover:bg-blue-700
        text-white
        rounded-2xl
        text-sm font-bold
        transition-all duration-300
        shadow-md hover:shadow-xl
      "
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search license or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-semibold text-slate-700 outline-none shadow-sm"
          />
        </div>
        <div className="w-full lg:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {["Today", "Upcoming", "Overdue", "Completed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  flex items-center justify-center px-4 py-2 
                  rounded-lg text-[11px] font-black uppercase tracking-wider transition-all duration-200 
                  ${
                    filter === f
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                  }
                `}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reminders Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse"
            >
              <div className="h-4 bg-slate-100 rounded w-1/3 mb-4"></div>
              <div className="h-6 bg-slate-100 rounded w-1/2 mb-2"></div>
              <div className="h-20 bg-slate-50 rounded-xl mt-6"></div>
            </div>
          ))}
        </div>
      ) : filteredReminders.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <FiCalendar size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            No reminders found
          </h3>
          <p className="text-slate-500 mt-2">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4 sm:gap-6">
          {filteredReminders.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col"
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-5 gap-2">
                  <div className="min-w-0">
                    <h4 className="text-lg font-black text-slate-900 truncate leading-none mb-1">
                      {r.licensePlate}
                    </h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tight truncate">
                      {r.make} {r.model}
                    </p>
                  </div>
                  {getStatusBadge(r.reminderStatus, r.nextServiceDate)}
                </div>

                <div className="bg-slate-50 rounded-xl p-3 space-y-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-500">
                      <FiCalendar size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        Due Date
                      </p>
                      <p className="font-bold text-xs sm:text-sm text-slate-700">
                        {format(new Date(r.nextServiceDate), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-indigo-500">
                      <FaUser size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        Customer
                      </p>
                      <p className="font-bold text-xs sm:text-sm text-slate-700 truncate">
                        {r.customerName || "Walk-in Customer"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button className="flex items-center justify-center py-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-95">
                    <FiMail size={20} />
                  </button>
                  <button className="flex items-center justify-center py-3 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all active:scale-95">
                    <FiMessageCircle size={20} />
                  </button>
                  <button className="flex items-center justify-center py-3 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all active:scale-95">
                    <FiPhone size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceReminders;
