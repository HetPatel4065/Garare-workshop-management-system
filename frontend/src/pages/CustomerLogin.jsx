import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Car,
  Wrench,
  Clock,
} from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";

// ─── Greeting pool (from existing PortalLogin) ───────────────────────────────
const GREETINGS = [
  // Original List
  "Welcome back",
  "Good to see you",
  "Ready to check your car?",
  "Your service history awaits",
  "We missed you!",
  "Track your vehicle in seconds",
  "Quick OTP — no passwords needed",
  "Let's pick up where you left off",
  "Your garage, at your fingertips",
  "Smarter service tracking starts here",

  // Service & Status Focused
  "Your digital service book is ready",
  "Track your repairs in real-time",
  "Your vehicle is in good hands. Check its progress here",
  "Instant access to your service timeline",
  "Let’s see how your vehicle is doing today",

  // Speed & OTP Focused
  "Skip the password, skip the wait",
  "One quick code to view your car's status",
  "No password? No problem. Let's get you in",
  "Tap, verify, and view your vehicle",
  "Your garage dashboard is just an OTP away",

  // Premium & Welcoming
  "Welcome back! How is the car running?",
  "Giving your car the care it deserves",
  "Welcome to your personal garage portal",
  "Let’s get your vehicle sorted",
  "Keep your vehicle running smoothly. Log in to check status",
];

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepDot({ active, done }) {
  return (
    <div
      className={`w-2 h-2 rounded-full transition-all duration-300 ${
        done
          ? "bg-blue-600 scale-100"
          : active
            ? "bg-blue-500 scale-125"
            : "bg-slate-200"
      }`}
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CustomerLogin() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [registrationStatus, setRegistrationStatus] = useState(null);

  const greeting = useMemo(
    () => GREETINGS[Math.floor(Math.random() * GREETINGS.length)],
    [],
  );

  // ── OTP resend countdown ──────────────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // ── Real-time approval updates via socket ─────────────────────────────────
  useEffect(() => {
    if (step !== 3 || !email) return;
    const socketUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
    const socket = io(socketUrl, { transports: ["websocket"] });

    socket.on("connect", () => socket.emit("join", email));
    socket.on("registration_update", (data) => setRegistrationStatus(data));

    return () => socket.disconnect();
  }, [step, email]);

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/portal/login-otp`,
        { email },
      );
      if (data.success) {
        if (data.isRequested) {
          setRegistrationStatus({
            status: data.status,
            reason: data.rejectionReason,
            customerName: data.customerName,
            garageName: data.garageName,
            appointmentDate: data.appointmentDate,
            appointmentTime: data.appointmentTime,
          });
          setStep(3);
        } else {
          setStep(2);
          setCountdown(30);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Account not found or not active.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/portal/verify-login`,
        { email, otp },
      );

      if (data.success) {
        if (data.isRequested) {
          setRegistrationStatus({
            status: data.status,
            reason: data.rejectionReason,
            customerName: data.customerName,
            garageName: data.garageName,
            appointmentDate: data.appointmentDate,
            appointmentTime: data.appointmentTime,
          });
          setStep(3);
          return;
        }

        // ✅ Auth success — store portal token
        sessionStorage.setItem("portal_token", data.token);
        sessionStorage.setItem("portal_user", JSON.stringify(data.user));

        // Store linked garage for multi-garage support
        const garage = data.user?.garage;
        if (garage) {
          try {
            const stored = JSON.parse(
              sessionStorage.getItem("linkedGarages") || "[]",
            );
            if (!stored.find((g) => g.id === garage._id)) {
              stored.push({
                id: garage._id,
                garageName: garage.garageName,
                email,
              });
              sessionStorage.setItem("linkedGarages", JSON.stringify(stored));
            }
          } catch {
            /* non-critical */
          }
        }

        navigate("/portal/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return;
    setError("");
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/portal/login-otp`, {
        email,
      });
      setCountdown(30);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* ── Brand ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-center mb-8"
        >
          <div
            className="group inline-flex items-center gap-3 mb-4 cursor-pointer select-none"
            onClick={() => navigate("/portal")}
          >
            <div className="bg-blue-600 p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">
              Garage<span className="text-blue-600">Pro</span>
            </span>
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200">
              <Car className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-600">
                Customer Portal
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {greeting}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Sign in with your registered email — no password needed
          </p>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <StepDot active={step === 1} done={step > 1} />
            <StepDot active={step === 2} done={step > 2} />
            <StepDot active={step === 3} done={false} />
          </div>
        </motion.div>

        {/* ── Card ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200  overflow-hidden">
          <div className="h-1 w-full bg-linear-to-r from-blue-400 via-blue-500 to-indigo-500" />

          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {/* ── STEP 1: Email ───────────────────────────────── */}
              {step === 1 && (
                <motion.form
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSendOTP}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Registered Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="customer-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <button
                    id="customer-send-otp-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25 transition-all mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending…</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Send Login Code</span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {/* ── STEP 2: OTP verification ────────────────────── */}
              {step === 2 && (
                <motion.form
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleVerifyOTP}
                  className="space-y-4"
                >
                  {/* Email sent confirmation */}
                  <div className="text-center py-2">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-7 h-7 text-blue-600" />
                    </div>
                    <p className="text-sm text-slate-600">
                      We sent a 6-digit code to{" "}
                      <span className="font-bold text-slate-900">{email}</span>
                    </p>
                  </div>

                  {/* OTP input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      One-Time Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="customer-otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="000000"
                      className="w-full h-14 rounded-xl border border-slate-200 bg-slate-50 text-center text-2xl font-black tracking-[0.5rem] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all"
                    />
                  </div>

                  {error && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <button
                    id="customer-verify-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25 transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying…</span>
                      </>
                    ) : (
                      "Login Now"
                    )}
                  </button>

                  {/* Back + Resend */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setOtp("");
                        setError("");
                      }}
                      className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Change email
                    </button>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={countdown > 0 || loading}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {countdown > 0
                        ? `Resend in ${countdown}s`
                        : "Resend code"}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* ── STEP 3: Registration status screen ──────────── */}
              {step === 3 && registrationStatus && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center space-y-5 py-2"
                >
                  {/* Status icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
                      registrationStatus.status === "rejected"
                        ? "bg-rose-50"
                        : registrationStatus.status === "approved"
                          ? "bg-emerald-50"
                          : "bg-amber-50"
                    }`}
                  >
                    {registrationStatus.status === "rejected" ? (
                      <AlertCircle className="w-8 h-8 text-rose-500" />
                    ) : registrationStatus.status === "approved" ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    ) : (
                      <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    )}
                  </div>

                  {/* Status message */}
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">
                      {registrationStatus.status === "rejected"
                        ? "Registration Rejected"
                        : registrationStatus.status === "approved"
                          ? "Request Approved!"
                          : "Request Pending"}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {registrationStatus.status === "rejected"
                        ? `Hi ${registrationStatus.customerName}, unfortunately your request at ${registrationStatus.garageName} was not approved.`
                        : registrationStatus.status === "approved"
                          ? `Great news ${registrationStatus.customerName}! Your request at ${registrationStatus.garageName} has been approved.`
                          : `Hi ${registrationStatus.customerName}, your request at ${registrationStatus.garageName} is still being reviewed. We'll update you soon.`}
                    </p>
                  </div>

                  {/* Appointment details */}
                  {registrationStatus.status === "approved" &&
                    registrationStatus.appointmentDate && (
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">
                          Confirmed Appointment
                        </p>
                        <p className="text-base font-bold text-slate-900">
                          {new Date(
                            registrationStatus.appointmentDate,
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        {registrationStatus.appointmentTime && (
                          <div className="flex items-center justify-center gap-2 mt-1 text-emerald-700 font-semibold text-sm">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{registrationStatus.appointmentTime}</span>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Rejection reason */}
                  {registrationStatus.status === "rejected" &&
                    registrationStatus.reason && (
                      <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-left">
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">
                          Reason
                        </p>
                        <p className="text-sm text-rose-700">
                          {registrationStatus.reason}
                        </p>
                      </div>
                    )}

                  {/* Action button */}
                  {registrationStatus.status === "approved" ? (
                    <button
                      onClick={() => {
                        setStep(1);
                        setOtp("");
                        setError("");
                        setRegistrationStatus(null);
                      }}
                      className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-600/25"
                    >
                      Proceed to Login
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate("/portal")}
                      className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold transition-all"
                    >
                      Back to Portal
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────── */}
        <div className="mt-5 text-center space-y-3">
          <p className="text-xs text-slate-400">
            Not registered yet?{" "}
            <Link
              to="/portal"
              className="font-medium text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
            >
              Request access via your garage
            </Link>
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
            <Link
              to="/login"
              className="hover:text-slate-600 transition-colors"
            >
              Staff / Owner Login
            </Link>
            <span>·</span>
            <Link
              to="/admin/login"
              className="hover:text-orange-500 transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
