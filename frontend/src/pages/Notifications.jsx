import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { 
  Bell, 
  Trash2, 
  CheckCheck, 
  Calendar, 
  Clock, 
  FileText, 
  User, 
  Wrench, 
  AlertCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ArrowRight,
  Box
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const NotificationCard = ({ notification, onMarkRead, onDelete }) => {
  const { title, message, type, read, createdAt, link } = notification;

  const getTypeStyles = () => {
    switch (type) {
      case "unpaid_invoice": return { icon: FileText, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" };
      case "new_customer": return { icon: User, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" };
      case "service_reminder": return { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
      case "error": return { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" };
      case "warning": return { icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" };
      case "low_stock": return { icon: Box, color: "text-orange-600", bg: "bg-orange-600/10", border: "border-orange-600/20" };
      default: return { icon: Bell, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" };
    }
  };

  const { icon: Icon, color, bg, border } = getTypeStyles();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative p-5 rounded-3xl border transition-all duration-300 ${
        read ? "bg-white/40 border-slate-100 grayscale-[0.3]" : "bg-white border-blue-100 shadow-sm shadow-blue-500/5 ring-1 ring-blue-500/5"
      } hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-200 hover:-translate-y-0.5`}
    >
      <div className="flex gap-5">
        {/* Icon & Indicator */}
        <div className="relative shrink-0">
          <div className={`w-14 h-14 rounded-2xl ${bg} ${border} border flex items-center justify-center ${color} shadow-sm group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
          </div>
          {!read && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-white animate-pulse" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-1">
            <h3 className={`text-[15px] font-black tracking-tight ${read ? "text-slate-600" : "text-slate-900"}`}>
              {title}
            </h3>
            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap flex items-center gap-1">
              <Clock size={10} />
              {format(new Date(createdAt), "h:mm a • d MMM")}
            </span>
          </div>
          
          <p className={`text-sm leading-relaxed mb-4 ${read ? "text-slate-500" : "text-slate-700"}`}>
            {message}
          </p>

          <div className="flex items-center gap-3">
             {link && (
               <a 
                 href={link}
                 className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
               >
                 View Details <ArrowRight size={12} />
               </a>
             )}
             
             <div className="flex-1" />

             {!read && (
               <button 
                onClick={() => onMarkRead(notification._id)}
                className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                title="Mark as read"
               >
                <CheckCheck size={18} />
               </button>
             )}
             <button 
              onClick={() => onDelete(notification._id)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
              title="Delete"
             >
              <Trash2 size={18} />
             </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Notifications() {
  const { token } = useAuth();
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useNotifications();
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === "All") return matchesSearch;
    if (filter === "Unread") return matchesSearch && !n.read;
    if (filter === "Important") return matchesSearch && ["error", "warning", "unpaid_invoice"].includes(n.type);
    return matchesSearch && n.type === filter.toLowerCase();
  });

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Bell size={24} />
              </div>
              <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em]">Notification Center</p>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-4">
              Project Notifications
            </h1>
            <p className="text-sm font-medium text-slate-500 max-w-lg">
              Stay updated with everything happening in your garage, from new customers to urgent service reminders.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
               onClick={markAllAsRead}
               className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 transition-all shadow-sm"
             >
               <CheckCheck size={18} className="text-emerald-500" />
               Mark All Read
             </button>
             <button 
               onClick={clearAllNotifications}
               className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:border-rose-300 hover:bg-rose-50 transition-all shadow-sm"
             >
               <Trash2 size={18} className="text-rose-500" />
               Clear All
             </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto whitespace-nowrap">
            {["All", "Unread", "Important"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${
                  filter === f 
                    ? "bg-slate-900 text-white shadow-md shadow-slate-200" 
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Content List */}
        <div className="mt-10 space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((n) => (
                <NotificationCard 
                  key={n._id} 
                  notification={n} 
                  onMarkRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 flex flex-col items-center text-center bg-white rounded-[40px] border border-slate-100 shadow-sm"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                  <Bell size={32} className="text-slate-200" />
                </div>
                <h3 className="text-lg font-black text-slate-800">No Notifications Found</h3>
                <p className="text-sm text-slate-400 mt-2 max-w-xs">
                  We couldn't find any notifications matching your current filters.
                </p>
                <button 
                  onClick={() => {setFilter("All"); setSearchQuery("");}}
                  className="mt-6 text-sm font-black text-blue-600 uppercase tracking-widest hover:text-blue-700"
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
