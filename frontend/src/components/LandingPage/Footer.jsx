import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

export const FAQ = () => {
  const [active, setActive] = useState(0);

  const faqs = [
    {
      q: "Is there a free trial available?",
      a: "Yes! You can explore all the features of GaragePro with a 14-day free trial. No credit card is required to get started.",
    },
    {
      q: "Can I track my spare parts inventory?",
      a: "Absolutely. Our inventory management module lets you track stock levels, set low-stock alerts, and link parts directly to job cards.",
    },
    {
      q: "Does GaragePro support digital signatures?",
      a: "Yes. Customers can sign job cards and estimates digitally on your tablet or phone, making your workshop completely paperless.",
    },
    {
      q: "Can I export reports for accounting?",
      a: "You can generate and export detailed sales, tax, and profit-and-loss reports in Excel or PDF format to share with your accountant.",
    },
    {
      q: "Will my customers get automated service reminders?",
      a: "Yes. You can schedule automated WhatsApp or SMS reminders for upcoming oil changes, insurance renewals, or general service dates.",
    },
    {
      q: "Can I manage different labor rates for different services?",
      a: "Yes, you can set custom labor rates for different types of work or even apply specific rates for premium customers.",
    },
    {
      q: "What kind of support do you offer?",
      a: "We provide priority support via WhatsApp and Email. Pro and Enterprise users also get access to dedicated account managers.",
    },
    {
      q: "Can I import my existing customer list?",
      a: "Definitely. You can upload your existing data using our CSV template to get your workshop up and running without manual entry.",
    },
  ]

  return (
    <section
      id="faq"
      className="py-24 md:py-32 px-6 max-w-3xl mx-auto"
    >
      <div className="text-center mb-12 md:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
          style={{
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.20)",
          }}
        >
          <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest" style={{ color: "#6366f1" }}>
            Common Questions
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-3xl font-extrabold mb-4"
          style={{ color: "#1e1b4b" }}
        >
          Got questions?{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            We've got answers.
          </span>
        </motion.h2>
        <p className="font-medium text-sm md:text-base" style={{ color: "#64748b" }}>
          Everything you need to know about GaragePro.
        </p>
      </div>

      <div className="space-y-3 md:space-y-4">
        {faqs.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl overflow-hidden transition-all duration-300"
            style={{
              background: active === i ? "#fff" : "rgba(255,255,255,0.7)",
              border:
                active === i
                  ? "1.5px solid rgba(99,102,241,0.25)"
                  : "1.5px solid rgba(226,232,240,0.8)",
              boxShadow:
                active === i
                  ? "0 8px 32px rgba(99,102,241,0.10)"
                  : "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <button
              onClick={() => setActive(active === i ? -1 : i)}
              className="w-full px-5 md:px-8 py-5 md:py-6 flex items-center justify-between text-left"
            >
              <span className="text-sm md:text-base font-bold" style={{ color: "#1e1b4b" }}>
                {item.q}
              </span>
              <div
                className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center shrink-0 ml-4 transition-all duration-300"
                style={{
                  background:
                    active === i
                      ? "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)"
                      : "rgba(99,102,241,0.08)",
                  color: active === i ? "#fff" : "#6366f1",
                  transform: active === i ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <ChevronDown size={14} />
              </div>
            </button>
            <AnimatePresence>
              {active === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div
                    className="px-5 md:px-8 pb-5 md:pb-8 text-xs md:text-sm font-medium leading-relaxed"
                    style={{ color: "#64748b" }}
                  >
                    {item.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export const Footer = () => (
  <footer
    className="py-24 px-6 relative overflow-hidden"
    style={{
      background: "linear-gradient(180deg, #f8faff 0%, #eef2ff 100%)",
      borderTop: "1px solid rgba(99,102,241,0.10)",
    }}
  >
    {/* Decorative glow */}
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-125 h-50"
      style={{
        background: "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)",
        filter: "blur(60px)",
      }}
    />

    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
      <div className="md:col-span-2">
        <div className="flex items-center gap-2.5 mb-6">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-sm"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)",
              boxShadow: "0 4px 16px rgba(99,102,241,0.30)",
            }}
          >
            GP
          </div>
          <span className="text-xl font-extrabold tracking-tight" style={{ color: "#1e1b4b" }}>
            GaragePro
          </span>
        </div>
        <p className="text-sm font-medium leading-relaxed max-w-sm mb-8" style={{ color: "#64748b" }}>
          The all-in-one operating system for modern mechanical workshops.
          Manage jobs, track inventory, and bill customers effortlessly.
        </p>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest"
          style={{
            background: "rgba(99,102,241,0.08)",
            color: "#6366f1",
            border: "1px solid rgba(99,102,241,0.16)",
          }}
        >
          &copy; 2026 GaragePro Inc. · Built for Garage Workshops.
        </div>
      </div>

      <div>
        <h4
          className="text-xs font-extrabold uppercase tracking-widest mb-6"
          style={{ color: "#1e1b4b" }}
        >
          Product
        </h4>
        <ul className="space-y-4">
          {[
            { label: "Features", href: "#features" },
            { label: "Pricing", href: "#pricing" },
            { label: "FAQ", href: "#faq" },
          ].map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="text-sm font-medium transition-colors hover:text-indigo-600"
                style={{ color: "#64748b" }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4
          className="text-xs font-extrabold uppercase tracking-widest mb-6"
          style={{ color: "#1e1b4b" }}
        >
          Company
        </h4>
        <ul className="space-y-4">
          {[
            { label: "About Us", href: "#", type: "anchor" },
            { label: "Staff Login", href: "/login", type: "link" },
            { label: "Privacy Policy", href: "#", type: "anchor" },
          ].map((l) => (
            <li key={l.label}>
              {l.type === "link" ? (
                <Link
                  to={l.href}
                  className="text-sm font-medium transition-colors hover:text-indigo-600"
                  style={{ color: "#64748b", textDecoration: "none" }}
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  href={l.href}
                  className="text-sm font-medium transition-colors hover:text-indigo-600"
                  style={{ color: "#64748b", textDecoration: "none" }}
                >
                  {l.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </footer>
);
