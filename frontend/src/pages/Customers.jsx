// src/pages/Customers.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchBar from "../components/UI/SearchBar";
import Modal from "../components/UI/Modal";
import { useToast } from "../context/ToastContext";
import CustomerForm from "../components/Customers/CustomerForm";
import CustomerList from "../components/Customers/CustomerList";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "../components/UI/ConfirmModal";
import VehicleHistoryModal from "../components/Customers/VehicleHistoryModal";
import { Plus } from "lucide-react";

export default function Customers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || "mechanic";
  const token = localStorage.getItem("token");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [customers, setCustomers] = useState([]);
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search).get("q") || "";
  const approveIdParam = new URLSearchParams(location.search).get("approveId");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeSearch, setActiveSearch] = useState(queryParam);

  // Sync activeSearch with URL on mount or URL change
  useEffect(() => {
    if (queryParam !== activeSearch) {
      setActiveSearch(queryParam);
    }
  }, [queryParam]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false); // Modal Logic State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [itemToAction, setItemToAction] = useState(null);
  const [approvalDate, setApprovalDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [approvalTime, setApprovalTime] = useState(
    new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  );
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (approveIdParam) {
      setItemToAction(approveIdParam);
      setApproveModalOpen(true);
      // Clear the URL parameter to prevent re-opening on refresh
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [approveIdParam]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/customers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || data.message || "Failed to fetch");
      setCustomers(data);
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    // Use searchQuery (user typing) if active, otherwise fallback to activeSearch (locked search)
    const query = (isTyping ? searchQuery : activeSearch).toLowerCase();
    const nameMatch = (c?.name || "").toLowerCase().includes(query);
    const emailMatch = (c?.email || "").toLowerCase().includes(query);
    const phoneMatch = (c?.phone || "").toLowerCase().includes(query);
    const vehicleMatch = (c?.vehicles || []).some(
      (v) =>
        (v.licensePlate || "").toLowerCase().includes(query) ||
        (v.model || "").toLowerCase().includes(query),
    );

    const searchMatch = nameMatch || emailMatch || phoneMatch || vehicleMatch;
    const effectiveStatus = [
      "Active",
      "Inactive",
      "Blocked",
      "Pending",
      "Rejected",
    ].includes(c?.status)
      ? c.status
      : "Active";
    const statusMatch =
      statusFilter === "All" ? true : effectiveStatus === statusFilter;

    return searchMatch && statusMatch;
  });

  const statusCounts = customers.reduce(
    (acc, customer) => {
      const effectiveStatus = [
        "Active",
        "Inactive",
        "Blocked",
        "Pending",
        "Rejected",
      ].includes(customer?.status)
        ? customer.status
        : "Active";
      acc.All += 1;
      acc[effectiveStatus] += 1;
      return acc;
    },
    { All: 0, Active: 0, Inactive: 0, Blocked: 0, Pending: 0, Rejected: 0 },
  );

  const handleAdd = () => {
    setSelectedCustomer(null);
    setModalOpen(true); // Open Modal
  };
  const handleView = (customer) => {
    setIsReadOnly(true);
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsReadOnly(false);
    setModalOpen(true); // Open Modal
  };

  const handleDelete = (id) => {
    setItemToDelete(id);
    setIsReadOnly(false);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/customers/${itemToDelete}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Delete failed");
      setCustomers((prev) => prev.filter((c) => c._id !== itemToDelete));
      addToast("Customer deleted", "delete");
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const handleSubmit = async (data) => {
    await processSubmit(data);
  };

  const processSubmit = async (data) => {
    try {
      const url = data._id
        ? `${import.meta.env.VITE_API_URL}/customers/${data._id}`
        : `${import.meta.env.VITE_API_URL}/customers`;
      const method = data._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Something went wrong");

      if (data._id) {
        setCustomers((prev) =>
          prev.map((c) => (c._id === result._id ? result : c)),
        );
        addToast("Customer updated", "success");
      } else {
        setCustomers((prev) => [...prev, result]);
        addToast(
          "Customer registered. Check requests dropdown for approval.",
          "info",
        );
      }
      setModalOpen(false);
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const confirmRegistration = async () => {
    if (!pendingRegData) return;
    const finalData = {
      ...pendingRegData,
      serviceDate: approvalDate,
    };
    await processSubmit(finalData);
  };

  const handleApprove = (id) => {
    setItemToAction(id);
    setApproveModalOpen(true);
  };

  const confirmApprove = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/customers/${itemToAction}/approve`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customDate: approvalDate,
            customTime: approvalTime,
          }),
        },
      );
      if (!res.ok) throw new Error("Approval failed");
      addToast("Customer approved and email sent", "success");
      setApproveModalOpen(false);
      setItemToAction(null);
      fetchCustomers();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const handleReject = (id) => {
    setItemToAction(id);
    setRejectModalOpen(true);
  };

  const confirmReject = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/customers/${itemToAction}/reject`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Rejection failed");
      addToast("Customer rejected", "info");
      setRejectModalOpen(false);
      setItemToAction(null);
      fetchCustomers();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100 rounded-xl min-h-screen">
      <div className="mb-8 pb-5 border-b border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.22em] mb-2">
              Customer Management
            </p>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Customers
            </h1>

            <p className="text-sm font-medium text-slate-500 mt-3">
              Manage your client database and vehicle ownership records
            </p>
          </div>

          {role !== "mechanic" && role !== "advisor" && (
            <button
              onClick={handleAdd}
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
              Add Customer
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
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
                navigate(`/customers?q=${encodeURIComponent(cleanTerm)}`, { replace: true });
              } else {
                navigate("/customers", { replace: true });
              }
            }}
            activeSearch={!isTyping && activeSearch}
            onClearActive={() => {
              setActiveSearch("");
              navigate("/customers", { replace: true });
            }}
            placeholder="Search by customer name, email, phone or vehicle..."
            className="w-full"
          />
        </div>
        <div className="w-full lg:w-64">
          <select
            id="customer-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          >
            <option value="All">All Statuses ({statusCounts.All})</option>
            {["Active", "Pending", "Inactive", "Blocked", "Rejected"].map(
              (k) => (
                <option key={k} value={k}>
                  {k} ({statusCounts[k] || 0})
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          ["Active", "bg-green-100 text-green-700 border-green-300"],
          ["Pending", "bg-blue-100 text-blue-700 border-blue-300"],
          ["Inactive", "bg-gray-100 text-gray-700 border-gray-300"],
          ["Blocked", "bg-red-100 text-red-700 border-red-300"],
          ["Rejected", "bg-orange-100 text-orange-700 border-orange-300"],
        ].map(([status, classes]) => (
          <span
            key={status}
            className={`text-[11px] font-bold px-3 py-1 rounded-full border ${classes}`}
          >
            {status}: {statusCounts[status] || 0}
          </span>
        ))}
      </div>
      <div className="mt-4 border-t border-gray-100 p-4">
        <p className="text-sm font-medium text-gray-600">
          Total Customer:{" "}
          <span className="text-gray-900">{filteredCustomers.length}</span>
        </p>
      </div>
      <CustomerList
        customers={filteredCustomers}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onVehicleHistory={(v) => {
          setSelectedVehicle(v);
          setHistoryModalOpen(true);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        role={role}
        isReadOnly={isReadOnly}
      />

      {/* Modal Logic Integration */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCustomer(null);
          setIsReadOnly(false);
        }}
        title={
          isReadOnly
            ? "View Customer"
            : selectedCustomer
              ? "Edit Customer"
              : "Add Customer"
        }
        size="xl"
      >
        <CustomerForm
          customerData={selectedCustomer}
          onSubmit={handleSubmit}
          onClose={() => setModalOpen(false)}
          isReadOnly={isReadOnly} // <--- Pass the prop to the form
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This will also remove all associated vehicles and history."
        confirmText="Yes, Delete"
      />

      <ConfirmModal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={confirmApprove}
        title="Approve Customer"
        message="Please set an optional appointment date and time for the customer's welcome email."
        confirmText="Yes, Approve"
        type="success"
      >
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="text-left">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
              Appointment Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={approvalDate}
              onChange={(e) => setApprovalDate(e.target.value)}
            />
          </div>
          <div className="text-left">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
              Appointment Time
            </label>
            <input
              type="time"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={approvalTime}
              onChange={(e) => setApprovalTime(e.target.value)}
            />
          </div>
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={confirmReject}
        title="Reject Customer"
        message="Are you sure you want to reject this registration? This will permanently delete the request from your system."
        confirmText="Yes, Reject"
        type="error"
      />
      {/* Vehicle History Modal */}
      <VehicleHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        vehicle={selectedVehicle}
        customerId={selectedCustomer?._id}
      />
    </div>
  );
}
