import React, { useState,useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Wrench } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [garageId, setGarageId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password, garageId || undefined);
    } catch (err) {
      setError(err.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const loginGreetings = useMemo(() => {
    const greetings = [
      // --- High Performance & Speed ---
      "Ignition sequence initiated",
      "Welcome to the fast lane",
      "Ready to shift into high gear?",
      "Full throttle toward growth",
      "Turbocharge your operations",
      "Accelerate your shop's performance",
      "Streamlined for maximum velocity",

      // --- Technical & Under the Hood ---
      "Under the hood starts here",
      "Let's get those gears turning",
      "Time to grease the wheels",
      "The missing part of your workflow",
      "Your digital toolbox is ready",
      "Every nut, bolt, and job card—organized",
      "Smooth idling starts with good data",

      // --- Professional & Elite Branding ---
      "Precision tuning for your business",
      "Heavy-duty management, made simple",
      "The all-in-one OS for modern garages",
      "High-performance workshop OS",
      "Welcome to the pro league",
      "Enterprise-grade tools for your bay",
      "The brains behind the brawn",

      // --- New Onboarding/Registration ---
      "Let's get your profile road-ready",
      "Your shop's new secret weapon",
      "Smarter repairs start here",
      "Welcome to the driver's seat",
      "Fixing the way you fix cars",
      "A fresh coat of tech for your garage",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div
            className="group inline-flex items-center gap-3 mb-6 cursor-pointer select-none"
            onClick={() => navigate("/")}
          >
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-100 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">
              Garage<span className="text-blue-600">Pro</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {loginGreetings}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Sign in to your garage management panel
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 overflow-hidden">
          <div className="h-1 w-full bg-linear-to-r from-blue-500 via-blue-600 to-indigo-600" />

          <div className="p-6 sm:p-8">
            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-100">
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
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all"
                />
              </div>

              {/* Garage ID */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Garage ID
                  <span className="text-slate-400 ml-1 text-xs font-normal">
                    (required for Staff)
                  </span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={garageId}
                  onChange={(e) =>
                    setGarageId(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="10-digit Garage ID"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all font-mono"
                />
                <p className="mt-1.5 text-[11px] text-slate-400 ml-0.5">
                  Owners: enter your 10-digit Garage ID. Staff: required.
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pl-3.5 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon style={{ width: 18, height: 18 }} />
                    ) : (
                      <EyeIcon style={{ width: 18, height: 18 }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25 transition-all mt-2"
              >
                {loading ? (
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
                    <span>Signing in…</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Footer links */}
            <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/portal"
                className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                Customer Portal →
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
