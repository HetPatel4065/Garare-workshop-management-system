import React from "react";
import { Wrench } from "lucide-react";
import { FaCar } from "react-icons/fa";
import { HiDocumentCurrencyRupee } from "react-icons/hi2";

const DashboardStats = ({ vehicleCount, serviceCount, invoiceCount }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm">
      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
        <FaCar className="w-7 h-7 text-blue-600" />
      </div>
      <h3 className="text-4xl font-black text-slate-900 mb-2">
        {vehicleCount}
      </h3>
      <p className="text-slate-500 font-bold uppercase tracking-wider text-sm">
        Registered Vehicles
      </p>
    </div>
    <div className="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm">
      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
        <Wrench className="w-7 h-7 text-indigo-600" />
      </div>
      <h3 className="text-4xl font-black text-slate-900 mb-2">
        {serviceCount}
      </h3>
      <p className="text-slate-500 font-bold uppercase tracking-wider text-sm">
        Total Services
      </p>
    </div>
    <div className="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm">
      <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
        <HiDocumentCurrencyRupee className="w-7 h-7 text-emerald-600" />
      </div>
      <h3 className="text-4xl font-black text-slate-900 mb-2">
        {invoiceCount}
      </h3>
      <p className="text-slate-500 font-bold uppercase tracking-wider text-sm">
        Invoices Generated
      </p>
    </div>
  </div>
);

export default DashboardStats;
