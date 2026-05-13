import React from "react";

const TabButton = ({ id, icon: Icon, label, activeTab, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
      activeTab === id
        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
        : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-slate-300"
    }`}
  >
    <Icon className="w-5 h-5" />
    {label}
  </button>
);

export default TabButton;
