import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Package,
  Wrench,
  Tag,
  PieChart,
  Loader2,
} from "lucide-react";
import axios from "axios";

const InvoiceRow = ({ invoice, isOpen, toggleExpand, getStatusColor, onRefresh, token }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadUrl = invoice.pdfUrl
    ? (invoice.pdfUrl.startsWith('http')
      ? invoice.pdfUrl
      : `${import.meta.env.VITE_API_URL.replace("/api", "")}${invoice.pdfUrl.startsWith('/') ? '' : '/'}${invoice.pdfUrl}`)
    : null;

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "finalized":
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "pending":
      case "sent":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleGeneratePDF = async () => {
    if (!token) return;
    setIsGenerating(true);
    try {
      await axios.get(
        `${import.meta.env.VITE_API_URL}/portal/invoices/${invoice._id}/pdf`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const hasParts = (invoice.parts || []).length > 0;
  const hasServices = (invoice.services || []).length > 0;

  return (
    <div className="border border-slate-100 rounded-3xl overflow-hidden bg-white transition-all duration-300 hover:shadow-lg hover:shadow-slate-100">
      {/* ── Summary Row (always visible) ── */}
      <button
        onClick={() => toggleExpand(invoice._id)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-colors text-left gap-4"
      >
        <div className="flex items-center gap-5 min-w-0">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 shadow-sm shadow-indigo-100 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight truncate capitalize">
              {(invoice.services || []).map(s => s.name).join(" - ") || "Service Invoice"}
            </h3>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-[12px] font-bold text-slate-400">
                {invoice.invoiceId}
              </span>
              <span className="w-1 h-1 bg-slate-200 rounded-full" />
              <span className="text-[12px] font-bold text-slate-400">
                {new Date(invoice.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              {invoice.licensePlate && (
                <>
                  <span className="w-1 h-1 bg-slate-200 rounded-full" />
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-tight">
                    {invoice.licensePlate}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <div className="text-right hidden sm:block">
            <span
              className={`flex items-center justify-end gap-1.5 mb-1 text-[10px] font-black uppercase tracking-widest ${getStatusColor(
                invoice.status
              )} bg-transparent border-none p-0`}
            >
              {getStatusIcon(invoice.status)}
              {invoice.status}
            </span>
            <p className="text-xl font-black text-slate-900">
              ₹{Number(invoice.totalAmount || 0).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 transition-colors">
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>
      </button>

      {/* ── Expanded Detail Panel ── */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="invoice-detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-8 pt-2 bg-slate-50/50 border-t border-slate-100 space-y-8">
              {/* Top Banner for Mobile Total */}
              <div className="sm:hidden flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Total Payable
                </span>
                <span className="text-xl font-black text-slate-900">
                  ₹{Number(invoice.totalAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                {/* Left Side: Breakdowns */}
                <div className="space-y-6">
                  {/* Services Breakdown */}
                  {hasServices && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-blue-500" /> Service Charges
                      </h4>
                      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                          <tbody className="divide-y divide-slate-50">
                            {invoice.services.map((s, i) => (
                              <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-5 py-3 font-bold text-slate-800 capitalize">
                                  {s.name}
                                </td>
                                <td className="px-5 py-3 font-black text-slate-900 text-right">
                                  ₹{Number(s.priceSnapshot || s.total).toLocaleString("en-IN")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Labour Charges */}
                  {invoice.labor && invoice.labor.priceSnapshot > 0 && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-300 delay-75">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Wrench className="w-3.5 h-3.5 text-orange-500" /> Labour Charges
                      </h4>
                      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-800">
                          {invoice.labor.typeOfWork || "General Labour"}
                        </span>
                        <span className="text-sm font-black text-slate-900">
                          ₹{Number(invoice.labor.priceSnapshot).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Parts Breakdown */}
                  {hasParts && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-300 delay-150">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-green-500" /> Parts & Inventory
                      </h4>
                      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50/50">
                            <tr>
                              <th className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                              <th className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                              <th className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {invoice.parts.map((p, i) => (
                              <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-5 py-3 font-bold text-slate-800 capitalize">{p.name}</td>
                                <td className="px-5 py-3 font-bold text-slate-600 text-center">{p.quantity}</td>
                                <td className="px-5 py-3 font-black text-slate-900 text-right">
                                  ₹{Number(p.total || (p.priceSnapshot * p.quantity)).toLocaleString("en-IN")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side: Totals & Download */}
                <div className="space-y-6">
                  {/* Summary Card */}
                  <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-blue-400" /> Payment Summary
                    </h4>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-white/10">
                        <span className="text-sm font-bold text-slate-400">Subtotal</span>
                        <span className="text-sm font-black text-white">₹{Number(invoice.subTotal || 0).toLocaleString("en-IN")}</span>
                      </div>

                      {invoice.discountAmount > 0 && (
                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                          <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                            Discount ({invoice.discountPercent}%)
                          </span>
                          <span className="text-sm font-black text-emerald-400">-₹{Number(invoice.discountAmount).toLocaleString("en-IN")}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pb-4 border-b border-white/10">
                        <span className="text-sm font-bold text-slate-400">Tax (GST)</span>
                        <span className="text-sm font-black text-white">₹{Number(invoice.gst || 0).toLocaleString("en-IN")}</span>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Grand Total</span>
                          <span className="text-3xl font-black text-white tracking-tighter mt-1">
                            ₹{Number(invoice.totalAmount || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                        {invoice.amountPaid > 0 && (
                          <div className="text-right">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Paid</span>
                            <span className="block text-lg font-black text-emerald-400">
                              ₹{Number(invoice.amountPaid).toLocaleString("en-IN")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      Actions
                    </h4>

                    {downloadUrl ? (
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-200 active:scale-95 group/btn"
                      >
                        <Download className="w-5 h-5 group-hover/btn:-translate-y-1 transition-transform" />
                        Download Official PDF
                      </a>
                    ) : (
                      <div className="flex flex-col items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="w-8 h-8 text-slate-300" />
                          <p className="text-xs font-bold text-slate-500 text-center">
                            The official PDF has not been generated yet.
                          </p>
                        </div>
                        <button
                          onClick={handleGeneratePDF}
                          disabled={isGenerating}
                          className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-600 rounded-xl font-black text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Generating PDF...
                            </>
                          ) : (
                            <>
                              <FileText className="w-4 h-4" />
                              Generate PDF Now
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvoiceRow;
