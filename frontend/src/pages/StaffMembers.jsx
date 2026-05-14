import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  Users,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  ShieldCheck,
  Wrench,
  UserCog,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  SquareUser,
  Plus,
} from "lucide-react";
import { FaUsers } from "react-icons/fa6";
import SearchBar from "../components/UI/SearchBar";
import { CardSkeleton, TableSkeleton } from "../components/UI/Skeleton";

const ROLE_CONFIG = {
  owner: {
    label: "Owner",
    class: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  admin: {
    label: "Admin",
    class: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  advisor: {
    label: "Advisor",
    class: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  mechanic: {
    label: "Mechanic",
    class: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
  },
  user: {
    label: "Technician",
    class: "bg-slate-50 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  },
};

const Label = ({ children, hint, required }) => (
  <label className="block text-sm text-gray-700 mb-1">
    {children}
    {required && <span className="text-red-600 ml-0.5">*</span>}
    {hint && <span className="text-xs text-gray-500 ml-1">({hint})</span>}
  </label>
);

const AVATAR_COLORS = [
  "from-blue-500 to-slate-900",
  "from-orange-500 via-orange-600 to-orange-700",
  "from-sky-500 via-blue-600 to-indigo-700",
  "from-violet-600 via-fuchsia-500 to-pink-500",
  "from-slate-400 via-slate-500 to-slate-600",
];

function getAvatarColor(name = "") {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function RoleBadge({ role }) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.user;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-full border ${cfg.class}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

const StatCard = ({
  label,
  count,
  icon: Icon,
  colorClasses,
  onClick,
  active,
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200 text-left w-full
      ${
        active
          ? `${colorClasses.activeBg} ${colorClasses.activeBorder} shadow-sm scale-[1.02]`
          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
      }`}
  >
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
        active ? colorClasses.iconBg : "bg-slate-50"
      }`}
    >
      <Icon
        size={16}
        className={active ? colorClasses.iconColor : "text-slate-400"}
      />
    </div>
    <div className="min-w-0">
      <p
        className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${
          active ? colorClasses.label : "text-slate-400"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-xl font-black leading-none ${
          active ? colorClasses.count : "text-slate-800"
        }`}
      >
        {count}
      </p>
    </div>
  </button>
);

export default function StaffMembers() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const token = sessionStorage.getItem("token");

  const canManage = ["admin", "owner"].includes(user?.role);
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState("all");

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search).get("q") || "";
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeSearch, setActiveSearch] = useState(queryParam);
  const [statusFilter, setStatusFilter] = useState("All");

  // Sync activeSearch with URL on mount or URL change
  useEffect(() => {
    if (queryParam !== activeSearch) {
      setActiveSearch(queryParam);
    }
  }, [queryParam]);

  // Add modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    role: "mechanic",
    mobileNumber: "",
    password: "",
  });
  const [isAdding, setIsAdding] = useState(false);

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    mobileNumber: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStaff = useCallback(
    async (silently = false) => {
      if (!silently) setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/staff`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch staff");
        const data = await res.json();
        setStaff(data);
      } catch (err) {
        addToast(err.message, "error");
      } finally {
        if (!silently) setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // ── FILTER & SORT ──
  const ROLE_ORDER = {
    owner: 1,
    admin: 2,
    advisor: 3,
    mechanic: 4,
    user: 5,
  };

  const filteredStaff = staff
    .filter((m) => {
      const query = (isTyping ? searchQuery : activeSearch).toLowerCase();
      const matchSearch =
        m.name?.toLowerCase().includes(query) ||
        m.email?.toLowerCase().includes(query);
      const matchRole = roleFilter === "all" || m.role === roleFilter;
      return matchSearch && matchRole;
    })
    .sort((a, b) => {
      const orderA = ROLE_ORDER[a.role] || 99;
      const orderB = ROLE_ORDER[b.role] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return (a.name || "").localeCompare(b.name || "");
    });

  // ── STATS ───
  const stats = {
    total: staff.length,
    mechanics: staff.filter((m) => m.role === "mechanic").length,
    advisors: staff.filter((m) => m.role === "advisor").length,
    owners: staff.filter((m) => m.role === "owner").length,
  };

  const STAFF_STATS_CONFIG = [
    {
      role: "all",
      label: "Total Staff",
      count: stats.total,
      icon: Users,
      colorClasses: {
        activeBg: "bg-emerald-50",
        activeBorder: "border-emerald-200",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        label: "text-emerald-600",
        count: "text-emerald-700",
      },
    },
    {
      role: "mechanic",
      label: "Mechanics",
      count: stats.mechanics,
      icon: Wrench,
      colorClasses: {
        activeBg: "bg-amber-50",
        activeBorder: "border-amber-200",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        label: "text-amber-600",
        count: "text-amber-700",
      },
    },
    {
      role: "advisor",
      label: "Advisors",
      count: stats.advisors,
      icon: SquareUser,
      colorClasses: {
        activeBg: "bg-blue-50",
        activeBorder: "border-blue-200",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        label: "text-blue-600",
        count: "text-blue-700",
      },
    },
    {
      role: "owner",
      label: "Owners",
      count: stats.owners,
      icon: ShieldCheck,
      colorClasses: {
        activeBg: "bg-purple-50",
        activeBorder: "border-purple-200",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
        label: "text-purple-600",
        count: "text-purple-700",
      },
    },
  ];

  const handleStatCardClick = (role) => {
    setActiveRole(role);
    setRoleFilter(role);
  };

  // ── EDIT ───
  const openEdit = (member) => {
    setEditTarget(member);
    setEditForm({
      name: member.name || "",
      email: member.email || "",
      mobileNumber: member.mobileNumber || "",
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    const trimmedName = editForm.name.trim();
    const trimmedEmail = editForm.email.trim();

    if (!trimmedName) {
      addToast("Full name is required", "error");
      return;
    }

    if (trimmedEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        addToast("Please provide a valid email address", "error");
        return;
      }
    }

    setIsSaving(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/staff/${editTarget._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
            mobileNumber: editForm.mobileNumber.trim(),
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      addToast("Staff member updated successfully", "success");
      setEditModalOpen(false);
      fetchStaff();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (member) => {
    if (member._id === user?._id) {
      addToast("You cannot deactivate your own account", "error");
      return;
    }

    const newStatus = !member.isActive;

    // Optimistic Update
    setStaff((prev) =>
      prev.map((m) =>
        m._id === member._id ? { ...m, isActive: newStatus } : m,
      ),
    );

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/staff/${member._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: member.name,
            isActive: newStatus,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        // Rollback on error
        setStaff((prev) =>
          prev.map((m) =>
            m._id === member._id ? { ...m, isActive: !newStatus } : m,
          ),
        );
        throw new Error(data.error || "Failed to update status");
      }

      addToast(
        `Staff member ${newStatus ? "activated" : "deactivated"} successfully`,
        newStatus ? "success" : "error",
      );
      // Fetch silently to sync with server without showing loader
      fetchStaff(true);
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  // ── DELETE ——
  const openDelete = (member) => {
    setDeleteTarget(member);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const endpoint =
        user?.role === "admin"
          ? `${import.meta.env.VITE_API_URL}/auth/remove-user/${deleteTarget._id}`
          : `${import.meta.env.VITE_API_URL}/auth/staff/${deleteTarget._id}`;

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to remove staff");
      }
      setStaff((prev) => prev.filter((m) => m._id !== deleteTarget._id));
      addToast("Team member removed successfully", "delete");
      setDeleteModalOpen(false);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── ADD ──
  const openAdd = () => {
    setAddForm({
      name: "",
      email: "",
      role: "mechanic",
      mobileNumber: "",
      password: "",
    });
    setAddModalOpen(true);
  };

  const handleAddStaff = async () => {
    const trimmedName = addForm.name.trim();
    const trimmedEmail = addForm.email.trim();
    const { role, password } = addForm;

    if (!trimmedName || !trimmedEmail || !password) {
      addToast("Please fill in all required fields", "error");
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password,
          role,
          mobileNumber: addForm.mobileNumber.trim(),
          ownerId: user?.effectiveOwnerId || user?._id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add staff");
      addToast("Staff member added successfully", "success");
      setAddModalOpen(false);
      fetchStaff();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setIsAdding(false);
    }
  };

  const handleInputChange = (setter, field) => (e) => {
    setter((p) => ({ ...p, [field]: e.target.value }));
  };

  const handlePhone = (setter) => (e) => {
    let v = e.target.value;
    let rawInput = v.startsWith("+91") ? v.slice(4) : v;
    let digitsOnly = rawInput.replace(/\D/g, "");
    let formattedValue = "+91 " + digitsOnly;

    if (formattedValue.length <= 14) {
      setter((p) => ({ ...p, mobileNumber: formattedValue }));
    }
  };

  return (
    <div className="min-h-[85vh] bg-gray-100 rounded-xl p-4 sm:p-6 cursor-pointer">
      {/* ── HEADER ── */}
      <div className="mb-8 pb-5 border-b border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.22em] mb-2">
              Team Management
            </p>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Staff Members
            </h1>

            <p className="text-sm font-medium text-slate-500 mt-3">
              Manage your garage team — view, edit and remove members
            </p>
          </div>

          {canManage && (
            <button
              onClick={openAdd}
              className="
          self-start sm:self-auto
          flex items-center gap-2
          px-5 py-3
          bg-blue-600 hover:bg-blue-700
          text-white
          rounded-2xl
          text-sm font-bold
          transition-all duration-300
          shadow-md hover:shadow-xl
        "
            >
              <Plus size={17} />
              Add New Staff
            </button>
          )}
        </div>
      </div>

      {/* Search & Role Filter Bar */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <SearchBar
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsTyping(true);
            }}
            onSearch={(term) => {
              const cleanTerm = term.trim();
              setIsTyping(false);
              setActiveSearch(cleanTerm);
              setSearchQuery("");
              if (cleanTerm) {
                navigate(`/staff-members?q=${encodeURIComponent(cleanTerm)}`, {
                  replace: true,
                });
              } else {
                navigate("/staff-members", { replace: true });
              }
            }}
            activeSearch={!isTyping && activeSearch}
            onClearActive={() => {
              setActiveSearch("");
              navigate("/staff-members", { replace: true });
            }}
            placeholder="Search staff by name, email, or ID..."
            className="w-full"
          />
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 ${
          user?.role === "admin" ? "lg:grid-cols-4" : "lg:grid-cols-3"
        }`}
      >
        {STAFF_STATS_CONFIG.map((stat) => {
          // Hide Owner card if user is not an Admin
          if (stat.role === "owner" && user?.role !== "admin") {
            return null;
          }

          return (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              label={stat.label}
              count={stat.count}
              colorClasses={stat.colorClasses}
              active={activeRole === stat.role}
              onClick={() => handleStatCardClick(stat.role)}
            />
          );
        })}
      </div>

      <div className="border-t border-gray-100 py-3">
        <p className="text-sm font-medium text-gray-600">
          Total Staff Members:{" "}
          {/* Replace 'staffData' with your actual state or array variable */}
          <span className="text-gray-900">{filteredStaff?.length || 0}</span>
        </p>
      </div>

      {/* ── ADAPTIVE LIST (Card for Mobile, Table for Desktop) ─── */}
      {loading ? (
        <div className="space-y-6">
          <div className="md:hidden space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="hidden md:block">
            <TableSkeleton rows={6} />
          </div>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 mx-4 sm:mx-6 my-6">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            No Staff Found
          </h3>
          <p className="text-sm font-medium text-slate-500 max-w-sm text-center">
            We couldn't find any staff members matching your search criteria.
            Try adjusting your filters or search term.
          </p>
        </div>
      ) : (
        <>
          {/* MOBILE: CARD VIEW (Hidden on md+) */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredStaff.map((member, i) => {
              const avatarGrad = getAvatarColor(member.name);
              return (
                <div
                  key={member._id}
                  className="p-4 sm:p-5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-linear-to-br ${avatarGrad} flex items-center justify-center text-white font-black text-xs shadow-sm`}
                      >
                        {member.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-sm capitalize font-bold text-slate-900">
                          {member.name}
                        </p>
                        <p className="text-[10px] font-black text-slate-400">
                          ID: {member._id?.slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <RoleBadge role={member.role} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1 border-b border-slate-100 w-fit">
                        Email Address
                      </p>
                      <p className="text-xs font-semibold text-slate-600 truncate">
                        {member.email || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1 border-b border-slate-100 w-fit">
                        Phone Number
                      </p>
                      <p className="text-xs font-semibold text-slate-600 truncate">
                        {member.mobileNumber || "—"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1 border-b border-slate-100 w-fit">
                        Status
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={!canManage || member._id === user?._id}
                          onClick={() => handleToggleStatus(member)}
                          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                            member.isActive !== false
                              ? "bg-emerald-500"
                              : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              member.isActive !== false
                                ? "translate-x-5.5"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                        <span
                          className={`inline-block w-14 text-[10px] font-bold uppercase tracking-wider ${member.isActive !== false ? "text-emerald-600" : "text-slate-500"}`}
                        >
                          {member.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1 border-b border-slate-100 w-fit">
                        Joined Date
                      </p>
                      <p className="text-xs font-semibold text-slate-600">
                        {member.createdAt
                          ? new Date(member.createdAt).toLocaleDateString(
                              "en-IN",
                              { day: "numeric", month: "short" },
                            )
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(member)}
                        className="flex-1 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1.5 active:scale-95 transition"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      {member._id !== user?._id &&
                        (user?.role === "admin" || member.role !== "owner") && (
                          <button
                            onClick={() => openDelete(member)}
                            className="flex-1 py-2 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600 hover:bg-red-100 flex items-center justify-center gap-1.5 active:scale-95 transition"
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* DESKTOP: TABLE VIEW (Hidden on <md) */}
          <div className="hidden md:block rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <table className="w-full text-left border-collapse table-auto">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="w-14 px-5 py-3 text-center text-[10.5px] font-bold uppercase text-slate-500 tracking-wider">
                      #
                    </th>
                    <th className="px-5 py-3 text-[10.5px] font-bold uppercase text-slate-500 tracking-wider">
                      Team Member
                    </th>
                    <th className="px-5 py-3 text-[10.5px] font-bold uppercase text-slate-500 tracking-wider">
                      System Role
                    </th>
                    <th className="px-5 py-3 text-[10.5px] font-bold uppercase text-slate-500 tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-5 py-3 text-center text-[10.5px] font-bold uppercase text-slate-500 tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 text-right text-[10.5px] font-bold uppercase text-slate-500 tracking-wider">
                      Join Date
                    </th>
                    {canManage && (
                      <th className="w-30 px-5 py-3 text-center text-[10.5px] font-bold uppercase text-slate-500 tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map((member, i) => {
                      const avatarGrad = getAvatarColor(member.name);
                      const isCurrentUser = member._id === user?._id;

                      return (
                        <tr
                          key={member._id}
                          className={`group transition-colors duration-150 hover:bg-slate-50/50 ${
                            isCurrentUser ? "bg-blue-50/40" : "bg-white"
                          }`}
                        >
                          {/* # Column */}
                          <td className="px-5 py-4 text-center">
                            <span className="text-xs font-semibold text-slate-400 tabular-nums">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                          </td>

                          {/* Identity Column */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`shrink-0 w-8.5 h-8.5 rounded-lg bg-linear-to-br ${avatarGrad} flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-white`}
                              >
                                {member.name?.[0]?.toUpperCase()}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-slate-900 truncate capitalize">
                                    {member.name}
                                  </span>
                                  {isCurrentUser && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 font-bold uppercase tracking-tight">
                                      You
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                                  ID: {member._id.slice(-6).toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Role Column */}
                          <td className="px-5 py-4">
                            <RoleBadge role={member.role} />
                          </td>

                          {/* Contact Column */}
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium text-slate-700 truncate max-w-50">
                                {member.email || "—"}
                              </span>
                              <span className="text-xs text-slate-400 tabular-nums">
                                {member.mobileNumber || "—"}
                              </span>
                            </div>
                          </td>

                          {/* Status Column */}
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <button
                                  disabled={
                                    !canManage || member._id === user?._id
                                  }
                                  onClick={() => handleToggleStatus(member)}
                                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                                    member.isActive !== false
                                      ? "bg-emerald-500"
                                      : "bg-slate-300"
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                      member.isActive !== false
                                        ? "translate-x-5.5"
                                        : "translate-x-1"
                                    }`}
                                  />
                                </button>
                                <span
                                  className={`text-[10px] font-bold uppercase ${member.isActive !== false ? "text-emerald-600" : "text-slate-500"}`}
                                >
                                  {member.isActive !== false
                                    ? "Active"
                                    : "Inactive"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Date Column - Consistent Right Alignment */}
                          <td className="px-5 py-4 text-right">
                            <span className="text-xs font-bold text-slate-600 tabular-nums whitespace-nowrap">
                              {member.createdAt
                                ? new Date(member.createdAt).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )
                                : "—"}
                            </span>
                          </td>

                          {/* Actions Column */}
                          {canManage && (
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openEdit(member)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit Member"
                                >
                                  <Pencil size={15} />
                                </button>
                                {member._id !== user?._id &&
                                  (user?.role === "admin" ||
                                    member.role !== "owner") && (
                                    <button
                                      onClick={() => openDelete(member)}
                                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete Member"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={canManage ? 7 : 6}
                        className="px-6 py-20 text-center"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-sm font-medium text-slate-400 italic">
                            No members found in your organization.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Footer count */}
      {!loading && filteredStaff.length > 0 && (
        <div className="md:block rounded-xl px-4 sm:px-6 mt-5 py-3 border-t border-slate-100 bg-slate-50">
          <p className="text-xs font-semibold text-slate-400">
            Showing {filteredStaff.length} of {staff.length} team members
          </p>
        </div>
      )}

      {/* ADD MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setAddModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-5 sm:py-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <FaUsers size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Add New Staff
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Create a new account for your team
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-red-200 hover:text-red-500 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 sm:px-7 py-5 sm:py-6 space-y-4">
              <div className="space-y-1.5">
                <Label
                  required
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                >
                  Full Name
                </Label>
                <input
                  value={addForm.name}
                  onChange={handleInputChange(setAddForm, "name")}
                  placeholder="e.g. John Doe"
                  className="w-full capitalize bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  required
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                >
                  Email Address
                </Label>
                <input
                  value={addForm.email}
                  onChange={handleInputChange(setAddForm, "email")}
                  placeholder="e.g. john@example.com"
                  type="email"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  required
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                >
                  Phone Number
                </Label>
                <input
                  value={addForm.mobileNumber}
                  onChange={handlePhone(setAddForm)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    required
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                  >
                    System Role
                  </Label>
                  <select
                    value={addForm.role}
                    onChange={handleInputChange(setAddForm, "role")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                  >
                    <option value="mechanic">Mechanic</option>
                    <option value="advisor">Advisor</option>
                    {user?.role === "admin" && (
                      <option value="owner">Owner</option>
                    )}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label
                    required
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                  >
                    Password
                  </Label>
                  <input
                    value={addForm.password}
                    onChange={handleInputChange(setAddForm, "password")}
                    placeholder="••••••••"
                    type="password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-5 sm:px-7 py-4 sm:py-5 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setAddModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStaff}
                disabled={isAdding}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition shadow-sm active:scale-95"
              >
                {isAdding ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {isAdding ? "Adding..." : "Add Staff"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}

      {editModalOpen && editTarget && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-5 sm:py-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <UserCog size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Edit Staff Member
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {editTarget.role}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 sm:px-7 py-5 sm:py-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Full Name
                </label>
                <input
                  value={editForm.name}
                  onChange={handleInputChange(setEditForm, "name")}
                  placeholder="Full name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Email Address
                </label>
                <input
                  value={editForm.email}
                  onChange={handleInputChange(setEditForm, "email")}
                  placeholder="Email"
                  type="email"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Phone Number
                </label>
                <input
                  value={editForm.mobileNumber}
                  onChange={handlePhone(setEditForm)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                />
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2">
                <ShieldCheck
                  size={16}
                  className="text-blue-500 shrink-0 mt-0.5"
                />
                <p className="text-xs font-medium text-blue-700">
                  Role changes are managed by the system. Only name and email
                  can be edited here.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-5 sm:px-7 py-4 sm:py-5 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition shadow-sm active:scale-95"
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          {/* Backdrop with modern blur */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity"
            onClick={() => setDeleteModalOpen(false)}
          />

          {/* Modal Card */}
          <div className="relative bg-white rounded-4xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            {/* Visual Header - Icon Centered */}
            <div className="pt-8 pb-4 flex flex-col items-center">
              <div className="relative">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 animate-pulse-slow">
                  <Trash2 size={28} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            <div className="px-8 text-center">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Remove Team Member?
              </h3>

              <p className="mt-3 text-[14px] text-slate-500 leading-relaxed font-medium">
                Are you sure you want to remove
                <span className="inline-flex items-center mx-1.5 px-2 py-0.5 bg-slate-100 text-slate-900 font-bold rounded-md capitalize tracking-normal">
                  {deleteTarget.name}
                </span>
                ? They will lose all access to the garage immediately.
              </p>

              {/* Owner Warning: High-contrast but soft edges */}
              {deleteTarget.role === "owner" && (
                <div className="mt-5 flex items-start gap-3 text-left bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 transition-all hover:bg-amber-50">
                  <div className="mt-0.5 shrink-0 text-amber-600">
                    <AlertCircle size={18} strokeWidth={2.5} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-amber-700 uppercase tracking-widest">
                      Critical Warning
                    </p>
                    <p className="text-[12px] font-semibold text-amber-800/80 leading-snug">
                      Removing an Owner may orphan this garage account. Ensure
                      another owner is assigned first.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modern Pill Actions */}
            <div className="flex flex-col sm:flex-row gap-3 p-8">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="order-2 sm:order-1 flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all active:scale-95"
              >
                Stay, Keep
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="order-1 sm:order-2 flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-200 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-lg shadow-rose-200 transition-all active:scale-95"
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Yes, Remove"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
