import React, { useState, useMemo } from "react";
import { useNavigate as useNav, Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Wrench,
  Store,
  Upload,
  Phone,
  Mail,
  User,
  MapPin,
} from "lucide-react";
import { FaCar } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const GREETINGS = [
  "Precision tuning for your business",
  "Your digital toolbox is ready",
  "Ready to shift into high gear?",
  "Turbocharge your garage operations",
  "Every nut, bolt, and job card—organized",
  "Accelerate your shop's performance",
  "Ready to build your workshop empire?",
];

export default function OwnerSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [garageName, setGarageName] = useState("");
  const [address, setAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("+91 ");
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNav();

  const greeting = useMemo(
    () => GREETINGS[Math.floor(Math.random() * GREETINGS.length)],
    [],
  );

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append("name", name);
      data.append("email", email);
      data.append("password", password);
      data.append("role", "owner");
      data.append("mobileNumber", mobileNumber);
      data.append("garageName", garageName);
      data.append("address", address);
      if (logo) {
        data.append("logo", logo);
      }

      await register(data);
      // Backend redirects to /owner/login automatically inside register()
    } catch (err) {
      setError(err.message || "Something went wrong during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls =
    "w-full h-11 pl-10 pr-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 text-sm " +
    "text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 " +
    "focus:ring-emerald-400/30 focus:border-emerald-400 focus:bg-white transition-all";

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        {/* ── Brand Header ─────────────────────────────────────── */}
        <div className="text-center mb-6">
          <div
            className="group inline-flex items-center gap-3 mb-2 cursor-pointer select-none"
            onClick={() => navigate("/")}
          >
            <div className="bg-emerald-500 p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">
              Garage<span className="text-emerald-500">Pro</span>
            </span>
          </div>

          {/* Role badge */}
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200">
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600">
                Register as Owner
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {greeting}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create your owner account and register your garage business
          </p>
        </div>

        {/* ── Card ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-emerald-100  overflow-hidden">
          <div className="h-1 w-full bg-linear-to-r from-emerald-400 via-emerald-500 to-teal-500" />

          <div className="p-6 sm:p-8">
            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-100"
              >
                <svg
                  className="w-4 h-4 text-red-500 mt-0.5 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Personal Section */}
              <div className="space-y-3.5">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-slate-100 pb-1 mb-2">
                  1. Personal Account Details
                </p>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Email & Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                      <input
                        type="tel"
                        required
                        value={mobileNumber}
                        onChange={(e) => {
                          let v = e.target.value;
                          if (!v.startsWith("+91 ")) {
                            v = "+91 " + v.replace("+91", "").trim();
                          }
                          if (v.length <= 14) setMobileNumber(v);
                        }}
                        placeholder="+91 9876543210"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="hidden" />{" "}
                    {/* Dummy so className pl-10 aligns perfectly */}
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 flex items-center justify-center font-bold text-base select-none">
                      *
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className={`${inputCls} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Garage Section */}
              <div className="space-y-3.5 pt-2">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-slate-100 pb-1 mb-2">
                  2. Garage Workshop Details
                </p>

                {/* Business Name & Logo */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Business Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                      <input
                        type="text"
                        required
                        value={garageName}
                        onChange={(e) => setGarageName(e.target.value)}
                        placeholder="e.g. Speedy Auto Works"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Garage Logo
                    </label>
                    <label className="relative flex items-center gap-2 h-11 px-3 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 hover:border-emerald-400 hover:bg-emerald-50/60 cursor-pointer transition-all group overflow-hidden">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-5 h-5 rounded object-cover shrink-0"
                        />
                      ) : (
                        <Upload
                          size={14}
                          className="text-emerald-400 shrink-0"
                        />
                      )}
                      <span className="text-xs text-slate-500 truncate group-hover:text-emerald-600 transition-colors">
                        {logo ? logo.name : "Upload Logo"}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Full Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, City, State, PIN Code"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-400/30 transition-all mt-3"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Registering your business…</span>
                  </>
                ) : (
                  <>
                    <Store className="w-4 h-4" />
                    <span>Create Business Profile</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between text-sm">
              <RouterLink
                to="/signup"
                className="font-medium text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back to roles
              </RouterLink>
              <RouterLink
                to="/owner/login"
                className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Sign in instead →
              </RouterLink>
            </div>
          </div>
        </div>

        {/* Footer legal disclaimer */}
        <p className="mt-5 text-center text-[11px] text-slate-400 px-4">
          By registering, you agree to our Terms of Service and Privacy Policy.
          All your data is encrypted natively.
        </p>
      </motion.div>
    </div>
  );
}
