import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  ShieldCheck,
  Save,
  Loader2,
  List,
  Plus,
  Trash2,
  AlertCircle,
  Lock,
  History,
  Download,
  Users as UsersIcon,
  Mail,
  Smartphone,
  MapPin,
  Image,
  Copy,
  Hash,
  Building2,
  CreditCard,
  MessageSquare,
  KeyRound,
  ShieldAlert,
  Eye,
  EyeOff,
  CheckCircle2,
  Check,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

// Helper Components moved outside to prevent re-renders losing focus
function ToggleItem({
  title,
  description,
  checked = false,
  onChange,
  disabled,
}) {
  const isOn = Boolean(checked);

  const handleClick = (e) => {
    e.stopPropagation();
    if (disabled || !onChange) return;
    onChange();
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange && onChange();
    }
  };

  return (
    <div
      role="switch"
      aria-checked={isOn}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`group relative overflow-hidden flex items-center justify-between p-5 rounded-2xl border transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 select-none ${
        disabled
          ? "cursor-not-allowed bg-slate-50 dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 opacity-60"
          : isOn
            ? "cursor-pointer bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 hover:bg-blue-50/70 dark:hover:bg-blue-950/60"
            : "cursor-pointer bg-slate-50 dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-800/50 hover:bg-white dark:hover:bg-zinc-800/80"
      }`}
    >
      {/* Background Accent */}
      <div
        className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none ${isOn ? "bg-blue-100/50 dark:bg-gray-800/20" : "bg-white dark:bg-zinc-700/30"}`}
      />

      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="pr-4 min-w-0">
          <p
            className={`text-sm font-bold transition-colors duration-200 ${
              disabled
                ? "text-slate-400 dark:text-zinc-600"
                : isOn
                  ? "text-blue-700 dark:text-blue-400"
                  : "text-slate-800 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            }`}
          >
            {title}
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Toggle pill */}
        <div
          className={`relative inline-flex h-7 shrink-0 items-center rounded-full transition-all duration-200 ${
            isOn
              ? "bg-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.15)]"
              : "bg-slate-300 dark:bg-zinc-700"
          } ${disabled ? "opacity-50" : "active:scale-95"}`}
          style={{ width: "3rem" }}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
              isOn ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, desc, onAdd, hideAdd }) {
  return (
    <div className="flex justify-between items-end">
      <div>
        <h4 className="text-md font-black text-slate-800 capitalize tracking-wide">
          {title}
        </h4>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      {!hideAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-xl text-sm font-bold transition-colors"
        >
          <Plus size={16} /> Add New
        </button>
      )}
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  icon,
  placeholder = "",
  disabled = false,
  required = false,
  type = "text",
}) {
  return (
    <div className="space-y-2 p-3">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider px-1 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500 font-black">*</span>}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
            {icon}
          </div>
        )}
        <input
          name={name}
          type={type}
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all ${icon ? "pl-14" : "px-6"} ${disabled ? "cursor-not-allowed bg-slate-100 text-slate-500" : "hover:border-slate-300 bg-white"}`}
        />
      </div>
    </div>
  );
}

const capitalizeWords = (value) => {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function Settings() {
  const { refreshUser, user, token } = useAuth();
  const { addToast } = useToast();

  // Role-based logic
  const isAdmin = user?.role === "admin";
  const isOwner = user?.role === "owner";
  const canEdit = isAdmin || isOwner;

  // States
  const [activeTab, setActiveTab] = useState(isAdmin ? "business" : "catalog");
  const [isTabSet, setIsTabSet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    garageName: "",
    address: "",
    mobileNumber: "",
    note: "",
    logo: "",
    invoiceLogo: "",
    gstNumber: "",
    upiId: "",
    whatsappNumber: "",

    notifications: {
      emailReports: false,
      lowStock: false,
      serviceReminders: false,
      smsReminders: false,
    },
    isGstInclusive: false,
    gstRate: 18,
    laborPrices: [],
    labourCharges: 0,
    security: {
      twoFactorAuth: false,
    },
  });

  const [logoFile, setLogoFile] = useState(null);
  const [invoiceLogoFile, setInvoiceLogoFile] = useState(null);

  const [catalog, setCatalog] = useState([]);
  const [deletedCatalogIds, setDeletedCatalogIds] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [garageId, setGarageId] = useState("");
  const [lastExportedAt, setLastExportedAt] = useState(null);
  const [lastMailedAt, setLastMailedAt] = useState(
    localStorage.getItem("lastMailedAt") || null,
  );
  const [isTestingNotif, setIsTestingNotif] = useState({
    email: false,
    sms: false,
  });

  // Change Password state
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [backupRange, setBackupRange] = useState("7");
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoreResult, setRestoreResult] = useState(null);
  const [showPw, setShowPw] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [settingsRes, catalogRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/v1/settings`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/service-catalog`, { headers }),
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setGarageId(data.garageId || "");
        setLastExportedAt(data.lastExportedAt || null);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          garageName: data.garageName || "",
          address: data.address || "",
          mobileNumber: data.mobileNumber || "",
          note: data.note || "",
          logo: data.logo || "",
          invoiceLogo: data.invoiceLogo || "",
          gstNumber: data.gstNumber || "",
          upiId: data.upiId || "",
          whatsappNumber: data.whatsappNumber || "",

          notifications: data.notifications || {
            emailReports: false,
            lowStock: false,
            smsReminders: false,
            serviceReminders: false,
          },
          labourCharges: data.labourCharges || 0,
          gstRate: data.gstRate || 18,
          isGstInclusive: data.isGstInclusive || false,
          cgstRate: data.cgstRate || 9,
          sgstRate: data.sgstRate || 9,
          igstRate: data.igstRate || 18,
          laborPrices: data.laborPrices || [],
          security: data.security || {
            twoFactorAuth: false,
            loginAlerts: true,
          },
        });
      }
      if (catalogRes.ok) {
        setCatalog(await catalogRes.json());
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (user?.role && !isTabSet) {
      const defaultTab = user.role === "admin" ? "business" : "catalog";
      setActiveTab(defaultTab);
      setIsTabSet(true);
    }
  }, [user, isTabSet]);

  const handleChange = () => {
    setHasChanges(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handlePhone = (e) => {
    const { name, value } = e.target; // Get name (mobileNumber or whatsappNumber)

    // 1. Force the +91 prefix
    if (!value.startsWith("+91 ")) {
      setFormData((prev) => ({ ...prev, mobileNumber: "+91 " }));
      return;
    }

    // 2. Extract digits after "+91 "
    const phoneNumberPart = value.slice(4);
    const digitsOnly = phoneNumberPart.replace(/\D/g, "");

    // 3. Limit to 10 digits and update state
    if (digitsOnly.length <= 10) {
      setFormData((prev) => ({
        ...prev,
        mobileNumber: "+91 " + digitsOnly,
      }));
      setHasChanges(true);
    }
  };

  const handleWhatsApp = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, whatsappNumber: digitsOnly }));
    setHasChanges(true);
  };

  const handleToggle = (key) => {
    setHasChanges(true);
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...(prev.notifications || {}),
        [key]: !prev.notifications?.[key],
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Use FormData to support image uploads
      const data = new FormData();

      // Append regular fields
      Object.keys(formData).forEach((key) => {
        if (typeof formData[key] === "object" && formData[key] !== null) {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });

      // Append files
      if (logoFile) data.append("logo", logoFile);
      if (invoiceLogoFile) data.append("invoiceLogo", invoiceLogoFile);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/settings`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      // Filter out empty catalog items before saving
      const validCatalog = catalog.filter((item) => item.name?.trim());

      const catalogPromises = validCatalog.map((item) => {
        const url = item._id
          ? `${import.meta.env.VITE_API_URL}/service-catalog/${item._id}`
          : `${import.meta.env.VITE_API_URL}/service-catalog`;
        return fetch(url, {
          method: item._id ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(item),
        });
      });

      await Promise.all(catalogPromises);

      // Step 3: Handle Deletions
      const deletePromises = deletedCatalogIds.map((id) =>
        fetch(`${import.meta.env.VITE_API_URL}/service-catalog/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      await Promise.all(deletePromises);

      if (res.ok) {
        setHasChanges(false);
        setLogoFile(null);
        setInvoiceLogoFile(null);
        setDeletedCatalogIds([]); // Clear deleted tracking
        await refreshUser();
        addToast("Settings saved successfully!");
        fetchData();
      }
    } catch (err) {
      addToast("Failed to save settings.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/v1/settings/export`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `garage_backup_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setLastExportedAt(new Date().toISOString());
      addToast("Data exported successfully!");
    } catch (err) {
      addToast("Failed to export data.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSecurityToggle = (key) => {
    setHasChanges(true);
    setFormData((prev) => {
      const current = Boolean(prev.security?.[key]);
      return {
        ...prev,
        security: {
          twoFactorAuth: false,
          loginAlerts: true,
          ...(prev.security || {}),
          [key]: !current,
        },
      };
    });
  };

  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess("");
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      return setPwError("All fields are required.");
    }
    if (pwForm.next.length < 6) {
      return setPwError("New password must be at least 6 characters.");
    }
    if (pwForm.next !== pwForm.confirm) {
      return setPwError("New passwords do not match.");
    }
    setPwLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/v1/settings/change-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: pwForm.current,
            newPassword: pwForm.next,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        return setPwError(data.error || "Failed to change password.");
      setPwSuccess("Password changed successfully!");
      setPwForm({ current: "", next: "", confirm: "" });
      addToast("Password changed successfully!", "success");
    } catch {
      setPwError("Network error. Please try again.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleDownloadBackup = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/backup/download?range=${backupRange}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Backup failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename = `garage_backup_${backupRange}_days_${new Date().toISOString().split("T")[0]}.zip`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      addToast("Backup downloaded successfully!", "success");
    } catch (err) {
      addToast(err.message || "Failed to download backup", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!restoreFile) return addToast("Please select a backup file", "error");

    const confirm = window.confirm(
      "Are you sure you want to restore this backup? This may overwrite existing data.",
    );
    if (!confirm) return;

    setIsRestoring(true);
    setRestoreResult(null);
    try {
      const formData = new FormData();
      formData.append("backup", restoreFile);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/backup/restore`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Restore failed");

      setRestoreResult(data);
      addToast("Data restored successfully!", "success");
      fetchData(); // Refresh UI data
    } catch (err) {
      addToast(err.message || "Failed to restore backup", "error");
    } finally {
      setIsRestoring(false);
      setRestoreFile(null);
    }
  };

  const handleSendTest = async (type) => {
    setIsTestingNotif((prev) => ({ ...prev, [type]: true }));
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/v1/settings/test-notification`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send test");
      addToast(data.message, "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setIsTestingNotif((prev) => ({ ...prev, [type]: false }));
    }
  };

  if (loading)
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-slate-500 font-medium">Loading preferences...</p>
      </div>
    );

  const tabs = [
    {
      id: "business",
      label: "Business Profile",
      icon: <Image size={18} />,
      adminOnly: true,
    },
    { id: "catalog", label: "Services", icon: <List size={18} /> },

    {
      id: "notifications",
      label: "Notifications & Live Data ",
      icon: <Bell size={18} />,
    },
    {
      id: "advanced",
      label: "Backup & Security",
      icon: <ShieldCheck size={18} />,
    },
  ].filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <div className="bg-gray-100 rounded-xl min-h-screen font-sans p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 pb-5 border-b border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.22em] mb-2">
                Garage Management
              </p>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
                Settings
              </h1>

              <p className="text-sm font-medium text-slate-500 mt-3">
                Garage Control Panel
              </p>

              {garageId && isAdmin && (
                <div className="mt-4 flex flex-wrap items-center gap-2 w-fit">
                  <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-2xl shadow-sm">
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                      Garage ID
                    </span>

                    <code className="text-xs font-black text-slate-900 tracking-wide bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                      {garageId}
                    </code>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(garageId);
                      addToast("Garage ID copied!", "info");
                    }}
                    className="
              p-2
              flex items-center justify-center
              bg-white
              border border-slate-200
              rounded-2xl
              shadow-sm
              text-slate-500
              hover:text-blue-600
              hover:border-blue-200
              hover:bg-blue-50
              transition-all duration-300
              active:scale-90
            "
                    title="Copy ID"
                  >
                    <Copy size={16} strokeWidth={2.5} />
                  </button>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="
          self-start sm:self-auto
          flex items-center gap-2
          px-6 py-3
          bg-blue-600 hover:bg-blue-700
          disabled:bg-slate-300
          disabled:cursor-not-allowed
          text-white
          rounded-2xl
          text-sm font-bold
          transition-all duration-300
          shadow-md hover:shadow-xl
          shrink-0
        "
              >
                {isSaving ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}

                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-row items-center justify-start gap-3.5 overflow-x-auto pb-2.5 scrollbar-hide">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold rounded-2xl transition-all whitespace-nowrap
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-slate-400"}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 bg-white rounded-2xl md:rounded-4xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 overflow-hidden">
            <div className="p-6 md:p-10">
              {activeTab === "business" && isAdmin && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
                  {/* OWNER INFORMATION */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-black rounded-full" />
                      <h3 className="text-lg font-bold text-slate-800">
                        Owner Profile Details
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        label="Owner Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        icon={<UsersIcon size={16} />}
                        required
                      />
                      <InputField
                        label="Email Address"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        icon={<Mail size={16} />}
                        required
                      />
                      <InputField
                        label="Mobile Number"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handlePhone}
                        icon={<Smartphone size={16} />}
                        required
                      />
                    </div>
                  </section>

                  {/* Single Brand Logo */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1.5 h-6 bg-black rounded-full" />
                    <h3 className="text-lg font-bold text-slate-800">
                      Business Logo
                    </h3>
                  </div>
                  <div className="flex flex-col items-center gap-6 p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] relative group transition-all hover:bg-white hover:border-blue-200 shadow-sm">
                    {/* Unified Logo Preview Area */}
                    {logoFile || formData.logo ? (
                      <div className="w-60 h-60 rounded-3xl bg-white shadow-2xl shadow-slate-200/50 overflow-hidden flex items-center justify-center p-4 border border-slate-100">
                        <img
                          src={
                            logoFile
                              ? URL.createObjectURL(logoFile)
                              : formData.logo.startsWith("http")
                                ? formData.logo
                                : `${import.meta.env.VITE_BASE_URL}/${formData.logo}`
                          }
                          alt="Business Logo"
                          className="w-full h-full object-contain transition-transform group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="w-48 h-48 rounded-3xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-200 shadow-inner">
                        <ImageIcon size={80} strokeWidth={1.5} />
                      </div>
                    )}

                    {/* Action Section */}
                    <div className="flex flex-col items-center gap-3">
                      {canEdit && (
                        <label className="cursor-pointer bg-blue-600 text-white px-10 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                          Upload New Logo
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleChange();
                                setLogoFile(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      )}

                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        Recommended: Square PNG or JPG (Max 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "catalog" && (
                <div className="space-y-6">
                  <SectionHeader
                    title="Service Packages"
                    desc="Define standard fixed-price services."
                    onAdd={() => {
                      handleChange();
                      setCatalog([
                        ...catalog,
                        { name: "", defaultPrice: 0, category: "General" },
                      ]);
                    }}
                  />
                  <div className="space-y-4">
                    {/* Desktop Header */}
                    {catalog.length > 0 && (
                      <div className="hidden md:flex gap-4 px-5 mb-2">
                        <div className="flex-1 text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                          Service Package Name
                        </div>
                        <div className="w-48 text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                          Default Base Price
                        </div>
                        {<div className="w-12"></div>}
                      </div>
                    )}

                    {catalog.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 px-4 bg-slate-50 border-2 border-dashed border-slate-100 rounded-4xl text-center animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm mb-4">
                          <List size={28} />
                        </div>
                        <h5 className="text-sm font-bold text-slate-800">
                          No Service Packages Found
                        </h5>
                        <p className="text-xs text-slate-500 mt-1 max-w-50 mx-auto">
                          Click "Add New" to define your standard service
                          prices.
                        </p>
                      </div>
                    )}

                    {catalog.map((s, idx) => (
                      <div
                        key={idx}
                        className="relative overflow-hidden group cursor-pointer bg-slate-50 p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300"
                      >
                        <div className="relative z-10 w-full flex flex-col md:flex-row items-start md:items-center gap-4">
                          <div className="flex-1 w-full">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider px-1 mb-1 block md:hidden">
                              Service Name
                            </label>
                            <input
                              placeholder="e.g. Full Oil Change"
                              value={s.name}
                              onChange={(e) => {
                                handleChange();
                                const updated = [...catalog];
                                updated[idx].name = capitalizeWords(
                                  e.target.value,
                                );
                                setCatalog(updated);
                              }}
                              className="w-full border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all hover:border-slate-300 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                            />
                          </div>
                          <div className="w-full md:w-48">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider px-1 mb-1 block md:hidden">
                              Default Price
                            </label>
                            <div className="relative">
                              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                ₹
                              </span>
                              <input
                                type="number"
                                value={s.defaultPrice}
                                onChange={(e) => {
                                  handleChange();
                                  const updated = [...catalog];
                                  updated[idx].defaultPrice = e.target.value;
                                  setCatalog(updated);
                                }}
                                className="w-full border border-slate-200 rounded-2xl pl-10 pr-6 py-4 text-sm font-black text-slate-800 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all hover:border-slate-300 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              handleChange();
                              const itemToDelete = catalog[idx];
                              if (itemToDelete._id) {
                                setDeletedCatalogIds((prev) => [
                                  ...prev,
                                  itemToDelete._id,
                                ]);
                              }
                              setCatalog(catalog.filter((_, i) => i !== idx));
                            }}
                            className="self-end md:self-auto p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  {/* Header Section */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-black rounded-full" />
                      <h3 className="text-lg font-bold text-slate-800">
                        Alert Preferences
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleSendTest("email")}
                        disabled={isTestingNotif.email}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl 
                      bg-gray-100 border border-slate-700 text-slate-700 
                        text-[13px] font-bold transition-all disabled:opacity-50 
                      hover:border-blue-300 hover:bg-blue-100 disabled:hover:bg-gray-100 disabled:hover:border-slate-700"
                      >
                        {isTestingNotif.email ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Mail size={14} />
                        )}
                        <span>Get Your Daily Business Summary</span>
                      </button>
                    </div>
                  </div>

                  {/* Toggles Grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ToggleItem
                      title="Low Stock Alerts"
                      description="Get notified when inventory falls below threshold."
                      checked={formData.notifications?.lowStock ?? false}
                      onChange={() => handleToggle("lowStock")}
                    />
                    <ToggleItem
                      title="Service Reminders"
                      description="Auto-alert customers when next service is due."
                      checked={
                        formData.notifications?.serviceReminders ?? false
                      }
                      onChange={() => handleToggle("serviceReminders")}
                    />
                  </div>
                </div>
              )}

              {activeTab === "advanced" && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                  {/* BACKUP & RESTORE MODULE */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-black rounded-full" />
                      <h3 className="text-lg font-bold text-slate-800">
                        System Backup & Restore
                      </h3>
                    </div>

                    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
                      {/* BACKUP BOX */}
                      <div className="p-6 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-800/80 border border-blue-100 dark:border-zinc-800 rounded-4xl space-y-5 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                            <Download size={22} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-zinc-100 text-base">
                              Get Your {formData.garageName} Data
                            </h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                              Secure Data Export
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed px-1">
                          Export your services, invoices, payments, customers,
                          and inventory into a structured ZIP file for offline
                          safekeeping.
                        </p>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider px-1 block">
                            Time Range
                          </label>
                          <div className="flex gap-2 p-1.5 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-zinc-800/50">
                            {["7", "15", "30"].map((r) => (
                              <button
                                key={r}
                                onClick={() => setBackupRange(r)}
                                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                                  backupRange === r
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                    : "text-slate-500 hover:bg-white dark:hover:bg-zinc-800 hover:text-blue-600"
                                }`}
                              >
                                {r} Days
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={handleDownloadBackup}
                          disabled={isExporting}
                          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98]"
                        >
                          {isExporting ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Download size={18} />
                          )}
                          {isExporting
                            ? "Generating ZIP..."
                            : "Download Backup"}
                        </button>
                      </div>

                      {/* RESTORE BOX */}
                      <div className="p-6 bg-linear-to-br from-slate-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800/80 border border-slate-200 dark:border-zinc-800 rounded-4xl space-y-5 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-slate-900 dark:bg-zinc-800 text-white rounded-2xl shadow-lg shadow-slate-300">
                            <History size={22} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-zinc-100 text-base">
                              Restore Data
                            </h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                              System Recovery
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed px-1">
                          Upload a previously generated backup ZIP file to
                          restore or merge records.{" "}
                          <span className="font-bold text-red-500">
                            Note: This action is irreversible.
                          </span>
                        </p>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider px-1 block">
                            Select Backup File
                          </label>
                          <label
                            className={`flex items-center gap-4 p-4 bg-white border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                              restoreFile
                                ? "border-green-400 bg-green-50/50"
                                : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/30"
                            }`}
                          >
                            <div
                              className={`p-2.5 rounded-xl ${restoreFile ? "bg-green-500 text-white" : "bg-slate-100 text-slate-500"}`}
                            >
                              {restoreFile ? (
                                <Check size={18} />
                              ) : (
                                <Plus size={18} />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-slate-700 truncate">
                                {restoreFile
                                  ? restoreFile.name
                                  : "Choose .zip file"}
                              </span>
                              {!restoreFile && (
                                <span className="text-[10px] font-semibold text-slate-400">
                                  Max size: 50MB
                                </span>
                              )}
                            </div>
                            <input
                              type="file"
                              accept=".zip"
                              className="hidden "
                              onChange={(e) =>
                                setRestoreFile(e.target.files[0])
                              }
                            />
                          </label>
                        </div>

                        <button
                          onClick={handleRestoreBackup}
                          disabled={isRestoring || !restoreFile}
                          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]"
                        >
                          {isRestoring ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <History size={18} />
                          )}
                          {isRestoring
                            ? "Restoring Records..."
                            : "Restore System Data"}
                        </button>
                      </div>
                    </div>

                    {/* RESTORE RESULTS DISPLAY */}
                    {restoreResult && (
                      <div className="animate-in fade-in zoom-in-95 duration-300 bg-green-50 border border-green-100 rounded-4xl p-6 space-y-4">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle2 size={18} />
                          <h5 className="font-bold text-sm">
                            Restore Completed Successfully
                          </h5>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {Object.entries(restoreResult.restored).map(
                            ([key, count]) => (
                              <div
                                key={key}
                                className="bg-white/80 p-3 rounded-xl border border-green-100 flex flex-col items-center"
                              >
                                <span className="text-[10px] font-black uppercase text-slate-400">
                                  {key}
                                </span>
                                <span className="text-lg font-black text-green-600">
                                  {count}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                        {restoreResult.errors.length > 0 && (
                          <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 space-y-1">
                            <p className="text-[10px] font-black text-red-500 uppercase">
                              Encountered Errors:
                            </p>
                            <ul className="text-xs text-red-600 list-disc ml-4">
                              {restoreResult.errors
                                .slice(0, 3)
                                .map((err, i) => (
                                  <li key={i}>{err}</li>
                                ))}
                              {restoreResult.errors.length > 3 && (
                                <li>
                                  ...and {restoreResult.errors.length - 3} more
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* SECURITY TOGGLES */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-black rounded-full" />
                      <h3 className="text-lg font-bold text-slate-800">
                        Security Settings
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ToggleItem
                        title="Two-Factor Authentication"
                        description="Require a second verification step on login."
                        checked={formData.security?.twoFactorAuth ?? false}
                        onChange={() => handleSecurityToggle("twoFactorAuth")}
                      />
                      <ToggleItem
                        title="Login Alerts"
                        description="Notify on new sign-ins to your account."
                        checked={formData.security?.loginAlerts ?? true}
                        onChange={() => handleSecurityToggle("loginAlerts")}
                      />
                    </div>
                    <p className="text-xs font-semibold text-slate-400">
                      Security toggle changes are saved with the main{" "}
                      <strong>Save Changes</strong> button.
                    </p>
                  </div>

                  {/* CHANGE PASSWORD */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-black rounded-full" />
                      <h3 className="text-lg font-bold text-slate-800">
                        Change Password
                      </h3>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
                      {["current", "next", "confirm"].map((field) => (
                        <div key={field} className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider px-1 block">
                            {field === "current"
                              ? "Current Password"
                              : field === "next"
                                ? "New Password"
                                : "Confirm New Password"}
                          </label>
                          <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                              <KeyRound size={16} />
                            </div>
                            <input
                              type={showPw[field] ? "text" : "password"}
                              value={pwForm[field]}
                              onChange={(e) => {
                                setPwError("");
                                setPwSuccess("");
                                setPwForm((p) => ({
                                  ...p,
                                  [field]: e.target.value,
                                }));
                              }}
                              placeholder={
                                field === "current"
                                  ? "Enter current password"
                                  : field === "next"
                                    ? "Min. 6 characters"
                                    : "Re-enter new password"
                              }
                              className="w-full border border-slate-200 rounded-2xl pl-14 pr-11 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all hover:border-slate-300 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowPw((p) => ({
                                  ...p,
                                  [field]: !p[field],
                                }))
                              }
                              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPw[field] ? (
                                <EyeOff size={15} />
                              ) : (
                                <Eye size={15} />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                      {pwError && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
                          <ShieldAlert size={14} />
                          <p className="text-xs font-semibold">{pwError}</p>
                        </div>
                      )}
                      {pwSuccess && (
                        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-2">
                          <CheckCircle2 size={14} />
                          <p className="text-xs font-semibold">{pwSuccess}</p>
                        </div>
                      )}
                      <button
                        onClick={handleChangePassword}
                        disabled={pwLoading}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
                      >
                        {pwLoading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <KeyRound size={16} />
                        )}
                        {pwLoading ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
