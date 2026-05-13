import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  EyeIcon,
  EyeSlashIcon,
  PhotoIcon,
  IdentificationIcon,
  BuildingStorefrontIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { Wrench } from "lucide-react";

const ROLES = [
  {
    id: "owner",
    label: "Owner",
    icon: BuildingStorefrontIcon,
    description: "Manage your garage",
    accent: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
  {
    id: "advisor",
    label: "Advisor",
    icon: UserIcon,
    description: "Service advisor",
    accent: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  {
    id: "mechanic",
    label: "Mechanic",
    icon: WrenchScrewdriverIcon,
    description: "Workshop tech",
    accent: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
  },
];

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("owner");

  const [garageName, setGarageName] = useState("");
  const [address, setAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("+91 ");
  const [logo, setLogo] = useState(null);
  const [ownerId, setOwnerId] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  const { login, loginWithGoogle } = useAuth();

  const { register } = useAuth();
  const navigate = useNavigate();

  const selectedRole = ROLES.find((r) => r.id === role);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const signupGreetings = useMemo(() => {
    const greetings = [
      "Ignition sequence initiated",
      "Under the hood starts here",
      "Let's get those gears turning",
      "Precision tuning for your business",
      "Your digital toolbox is ready",
      "Time to grease the wheels",
      "Heavy-duty management, made simple",
      "Torque your workshop to the max",
      "The missing part of your workflow",
      "Welcome to the fast lane",
      "Ready to shift into high gear?",
      "Full throttle toward growth",
      "Accelerate your shop's performance",
      "High-performance workshop OS",
      "Don't get left in the dust",
      "Turbocharge your operations",
      "The podium is waiting for you",
      "Streamlined for maximum velocity",
      "Welcome to the pro league",
      "Your workshop, evolved",
      "The elite garage workshop’s choice",
      "Authorized Partner registration",
      "Upgrade to professional standards",
      "Master your inventory, master your shop",
      "The all-in-one OS for modern garages",
      "Join the network of top-tier workshops",
      "Enterprise-grade tools for your bay",
      "Let's get your profile road-ready",
      "No more paperwork pile-ups",
      "Your shop's new secret weapon",
      "Smarter repairs start here",
      "Welcome to the driver's seat",
      "Smooth idling starts with good data",
      "The brains behind the brawn",
      "Every nut, bolt, and job card—organized",
      "Fixing the way you fix cars",
      "A fresh coat of tech for your garage",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", name);
      data.append("email", email);
      data.append("password", password);
      data.append("role", role);
      data.append("mobileNumber", mobileNumber);
      if (role === "owner") {
        data.append("garageName", garageName);
        data.append("address", address);
        if (logo) data.append("logo", logo);
      } else {
        data.append("ownerId", ownerId);
      }
      await register(data);
    } catch (err) {
      setError(err.message || "Something went wrong during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-120">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div
            className="group inline-flex items-center gap-3 mb-6 cursor-pointer select-none"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-100 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">
              Garage<span className="text-blue-600">Pro</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {signupGreetings}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Join GarageSystem — professional garage management
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 overflow-hidden">
          {/* Blue accent line */}
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
            {/* Google Sign In */}
            <button
              type="button"
              onClick={() => loginWithGoogle()}
              className="w-full flex items-center justify-center gap-3 h-10 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-sm font-medium text-slate-700 transition-all active:scale-[0.98]"
            >
              <img
                className="w-4 h-4"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
              />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                  or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Section: Personal Info */}
              <div>
                <p className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider mb-3">
                  Personal Info
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="w-full h-10 pl-3.5 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeSlashIcon
                            className="h-4.5 w-4.5"
                            style={{ width: 18, height: 18 }}
                          />
                        ) : (
                          <EyeIcon style={{ width: 18, height: 18 }} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Section: Role */}
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
                  Role
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map((r) => {
                    const Icon = r.icon;
                    const isActive = role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id)}
                        style={
                          isActive
                            ? {
                              backgroundColor: r.bg,
                              borderColor: r.accent,
                              color: r.accent,
                            }
                            : {}
                        }
                        className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center transition-all ${isActive
                            ? "shadow-sm"
                            : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                      >
                        <Icon style={{ width: 18, height: 18 }} />
                        <span className="text-xs font-semibold">{r.label}</span>
                        <span
                          className="text-[10px] leading-tight"
                          style={{
                            color: isActive ? r.accent : "#94a3b8",
                            opacity: isActive ? 0.8 : 1,
                          }}
                        >
                          {r.description}
                        </span>
                        {isActive && (
                          <span
                            className="absolute top-2 right-2 w-2 h-2 rounded-full"
                            style={{ backgroundColor: r.accent }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Section: Role-specific fields */}
              {role === "owner" ? (
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
                    Garage Details
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Business Name
                      </label>
                      <input
                        type="text"
                        required
                        value={garageName}
                        onChange={(e) => setGarageName(e.target.value)}
                        placeholder="e.g. Speedy Auto Works"
                        className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={mobileNumber}
                          onChange={(e) => {
                            let v = e.target.value;
                            if (!v.startsWith("+91 "))
                              v = "+91 " + v.replace("+91", "").trim();
                            if (v.length <= 14) setMobileNumber(v);
                          }}
                          placeholder="+91 9000000000"
                          className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Logo
                        </label>
                        <label className="relative flex items-center gap-2 h-10 px-3.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer transition-all group">
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
                            <PhotoIcon
                              style={{ width: 16, height: 16 }}
                              className="text-slate-400 shrink-0"
                            />
                          )}
                          <span className="text-xs text-slate-500 truncate group-hover:text-blue-500 transition-colors">
                            {logo ? logo.name : "Upload"}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Full Address
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street, City, State, PIN"
                        className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={mobileNumber}
                        onChange={(e) => {
                          let v = e.target.value;
                          if (!v.startsWith("+91 "))
                            v = "+91 " + v.replace("+91", "").trim();
                          if (v.length <= 14) setMobileNumber(v);
                        }}
                        placeholder="+91 9000000000"
                        className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all font-mono"
                      />
                    </div>

                    <div
                      className="rounded-xl p-4 mb-3 border"
                      style={{
                        backgroundColor: selectedRole?.bg,
                        borderColor: selectedRole?.border,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <ShieldCheckIcon
                          style={{
                            width: 15,
                            height: 15,
                            color: selectedRole?.accent,
                          }}
                        />
                        <span
                          className="text-xs font-semibold"
                          style={{ color: selectedRole?.accent }}
                        >
                          Joining as {role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Enter the 10-digit Garage ID provided by your owner to
                        link your account.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        10-Digit Garage ID
                      </label>
                      <input
                        type="text"
                        required
                        maxLength="10"
                        value={ownerId}
                        onChange={(e) =>
                          setOwnerId(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="e.g. 1234567890"
                        style={{
                          "--tw-ring-color": selectedRole?.accent + "4D",
                          "--tw-border-color-focus": selectedRole?.accent,
                        }}
                        className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25 transition-all mt-1"
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
                    <span>Creating account…</span>
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline underline-offset-4 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          By creating an account you agree to our{" "}
          <a
            href="#"
            className="underline hover:text-slate-600 transition-colors"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="underline hover:text-slate-600 transition-colors"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
