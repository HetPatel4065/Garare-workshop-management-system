import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Tag,
  Trash2,
  Edit2,
  CheckCircle,
  X,
  Upload,
  Calendar,
  Layers,
  Settings,
  AlertTriangle,
  Info,
  IndianRupeeIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Sub-component: Photo slider inside listings card
const CardImageSlider = ({ photos, title }) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-full bg-slate-100 dark:bg-zinc-800 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-650">
        <Tag className="w-8 h-8 opacity-45" />
        <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">No photos uploaded</span>
      </div>
    );
  }

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-900 group/slider">
      <img
        src={`${import.meta.env.VITE_BASE_URL?.replace(/\/$/, "")}/${photos[currentIdx].replace(/^\//, "")}`}
        alt={`${title} - Photo ${currentIdx + 1}`}
        className="w-full h-full object-cover transition-transform duration-500 group-hover/slider:scale-103"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80";
        }}
      />
      {photos.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            type="button"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-250 z-10 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={nextSlide}
            type="button"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-250 z-10 cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {photos.map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentIdx ? "bg-white scale-125 shadow-xs" : "bg-white/45"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function MarketplaceListings({ token: customToken, isCustomer = false, currentUser = null }) {
  const { token: authToken } = useAuth();
  const token = customToken || authToken;
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Active");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [fuelType, setFuelType] = useState("Petrol");
  const [kmDriven, setKmDriven] = useState("");
  const [transmission, setTransmission] = useState("Manual");
  const [description, setDescription] = useState("");
  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [status, setStatus] = useState("Available");

  const [submitting, setSubmitting] = useState(false);

  // Fetch listings
  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/vehicle-sales/my-listings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load listings");
      setListings(data);
    } catch (err) {
      console.error(err);
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Form spec operations
  const addSpecField = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const removeSpecField = (index) => {
    setSpecifications(specifications.filter((_, idx) => idx !== index));
  };

  const handleSpecChange = (index, field, val) => {
    const updated = [...specifications];
    updated[index][field] = val;
    setSpecifications(updated);
  };

  // Image Upload Previews
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    setPhotoFiles([...photoFiles, ...files]);

    const previews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreviews([...photoPreviews, ...previews]);
  };

  const removePhotoPreview = (index, isNew = true) => {
    if (isNew) {
      setPhotoFiles(photoFiles.filter((_, idx) => idx !== index));
      setPhotoPreviews(photoPreviews.filter((_, idx) => idx !== index));
    } else {
      setExistingPhotos(existingPhotos.filter((_, idx) => idx !== index));
    }
  };

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingListing(null);
    setTitle("");
    setBrand("");
    setModel("");
    setYear("");
    setPrice("");
    setFuelType("Petrol");
    setKmDriven("");
    setTransmission("Manual");
    setDescription("");
    setSpecifications([{ key: "", value: "" }]);
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setExistingPhotos([]);
    setStatus("Available");
    setModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (listing) => {
    setEditingListing(listing);
    setTitle(listing.title);
    setBrand(listing.brand);
    setModel(listing.model);
    setYear(listing.year);
    setPrice(listing.price);
    setFuelType(listing.fuelType);
    setKmDriven(listing.kmDriven);
    setTransmission(listing.transmission);
    setDescription(listing.description);
    setSpecifications(
      listing.specifications.length > 0
        ? listing.specifications
        : [{ key: "", value: "" }]
    );
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setExistingPhotos(listing.photos || []);
    setStatus(listing.status);
    setModalOpen(true);
  };

  // Submit Listing Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate specs
    const validSpecs = specifications.filter((s) => s.key.trim() && s.value.trim());

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("brand", brand);
      formData.append("model", model);
      formData.append("year", year);
      formData.append("price", price);
      formData.append("fuelType", fuelType);
      formData.append("kmDriven", kmDriven);
      formData.append("transmission", transmission);
      formData.append("description", description);
      formData.append("specifications", JSON.stringify(validSpecs));
      formData.append("status", status);

      if (editingListing) {
        formData.append("existingPhotos", JSON.stringify(existingPhotos));
      }

      for (let i = 0; i < photoFiles.length; i++) {
        formData.append("photos", photoFiles[i]);
      }

      const url = editingListing
        ? `${import.meta.env.VITE_API_URL}/vehicle-sales/${editingListing._id}`
        : `${import.meta.env.VITE_API_URL}/vehicle-sales`;

      const method = editingListing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save listing failed");

      addToast(
        editingListing ? "Vehicle listing updated successfully!" : "Vehicle listed for sale successfully!",
        "success"
      );
      setModalOpen(false);
      fetchListings();
    } catch (err) {
      console.error(err);
      addToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle status directly
  const handleToggleStatus = async (listing) => {
    const newStatus = listing.status === "Available" ? "Sold" : "Available";
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/vehicle-sales/${listing._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update status failed");

      addToast(`Listing marked as ${newStatus}`, "success");
      fetchListings();
    } catch (err) {
      console.error(err);
      addToast(err.message, "error");
    }
  };

  // Delete Listing
  const handleDeleteListing = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle advertisement listing permanently?")) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/vehicle-sales/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete listing failed");

      addToast("Listing deleted successfully", "delete");
      fetchListings();
    } catch (err) {
      console.error(err);
      addToast(err.message, "error");
    }
  };

  // Stats and Filtering
  const currentUserId = currentUser?._id || currentUser?.id;
  const myListingsOnly = isCustomer
    ? listings.filter((l) => l.customerId === currentUserId)
    : listings;

  const totalListings = myListingsOnly.length;
  const activeListings = myListingsOnly.filter((l) => l.status === "Available").length;
  const soldListings = myListingsOnly.filter((l) => l.status === "Sold").length;
  const estimatedRevenue = myListingsOnly
    .filter((l) => l.status === "Sold")
    .reduce((sum, l) => sum + (l.price || 0), 0);

  const activeCount = listings.filter((l) => l.status === "Available").length;
  const soldCount = listings.filter((l) => l.status === "Sold").length;

  const filteredListings = listings.filter((item) => {
    if (statusFilter === "Active") return item.status === "Available";
    return item.status === "Sold";
  });

  return (
    <div className="p-4 sm:p-6 bg-slate-50 dark:bg-zinc-950 rounded-3xl min-h-screen text-slate-800 dark:text-zinc-100 transition-colors duration-300">
      {/* Header */}
      <div className="mb-8 pb-5 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.22em] mb-2">
            Automotive Marketplace
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            {isCustomer ? "Sell Your Car" : "Vehicle Showroom Listings"}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-3">
            {isCustomer
              ? "List your own pre-owned vehicle for sale in the garage automotive showroom"
              : "Add and manage second-hand or certified vehicles for sale directly from your workshop"}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-2xl text-sm font-bold shadow-md shadow-emerald-500/10 hover:shadow-xl transition-all duration-200 self-start sm:self-auto"
        >
          <Plus size={18} />
          {isCustomer ? "List Car for Sale" : "Add Vehicle for Sale"}
        </button>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-xs flex flex-col">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-zinc-500">
            Total Listings
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {totalListings}
          </span>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-xs flex flex-col">
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500">
            Active Available
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {activeListings}
          </span>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-xs flex flex-col">
          <span className="text-[10px] uppercase font-bold tracking-widest text-blue-500">
            Vehicles Sold
          </span>
          <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {soldListings}
          </span>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 shadow-xs flex flex-col">
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-500">
            Sales Earnings
          </span>
          <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            ₹{estimatedRevenue.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-zinc-800/80 pb-px">
        <button
          onClick={() => setStatusFilter("Active")}
          type="button"
          className={`flex items-center gap-2 px-5 py-3 text-sm font-black border-b-2 transition-all duration-200 -mb-px cursor-pointer ${
            statusFilter === "Active"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
          }`}
        >
          <span>Active Listings</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${statusFilter === "Active" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600" : "bg-slate-100 dark:bg-zinc-850 text-slate-500"}`}>{activeCount}</span>
        </button>
        <button
          onClick={() => setStatusFilter("Sold")}
          type="button"
          className={`flex items-center gap-2 px-5 py-3 text-sm font-black border-b-2 transition-all duration-200 -mb-px cursor-pointer ${
            statusFilter === "Sold"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
          }`}
        >
          <span>Sold Vehicles</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${statusFilter === "Sold" ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600" : "bg-slate-100 dark:bg-zinc-850 text-slate-500"}`}>{soldCount}</span>
        </button>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 dark:text-zinc-500 font-medium">Loading your vehicle catalog...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-dashed border-slate-300 dark:border-zinc-800 rounded-3xl">
          <Tag className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            No {statusFilter === "Active" ? "Active" : "Sold"} Listings Found
          </h3>
          <p className="text-sm text-slate-400 dark:text-zinc-500 mt-2 max-w-sm mx-auto">
            {statusFilter === "Active"
              ? "All of your listings have been sold or you haven't listed any yet!"
              : "No listed vehicles have been marked as sold yet."}
          </p>
          {statusFilter === "Active" && (
            <button
              onClick={handleOpenAdd}
              className="mt-6 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all duration-200"
            >
              {isCustomer ? "List Your Vehicle" : "List Your First Vehicle"}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((item) => (
            <motion.div
              layout
              key={item._id}
              onClick={() => {
                if (isCustomer) {
                  navigate(`/portal/marketplace/${item._id}`);
                }
              }}
              className={`bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden flex flex-col shadow-xs group hover:border-emerald-300 dark:hover:border-zinc-700 transition-all duration-300 ${
                isCustomer ? "cursor-pointer hover:shadow-lg active:scale-[0.99]" : ""
              }`}
            >
              <div className="h-48 w-full bg-slate-100 dark:bg-zinc-800 relative overflow-hidden">
                <CardImageSlider photos={item.photos} title={item.title} />
                <span className={`absolute top-4 left-4 px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-full shadow-md z-20 ${item.status === "Available" ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-300 border border-zinc-700/50"}`}>
                  {item.status === "Available" ? "Active" : "Sold"}
                </span>
                <span className="absolute bottom-4 right-4 bg-zinc-950/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-black text-emerald-400 rounded-xl shadow-md border border-zinc-800 z-20">
                  ₹{item.price.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{item.brand}</span>
                    <span>{item.year}</span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors leading-snug line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/60">
                    <div className="flex flex-col bg-slate-50/50 dark:bg-zinc-950/20 p-2 rounded-xl border border-slate-100/50 dark:border-zinc-900/40">
                      <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-zinc-500">KM Driven</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-350 mt-0.5">{item.kmDriven.toLocaleString("en-IN")} km</span>
                    </div>
                    <div className="flex flex-col bg-slate-50/50 dark:bg-zinc-950/20 p-2 rounded-xl border border-slate-100/50 dark:border-zinc-900/40">
                      <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-zinc-500">Transmission</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-350 mt-0.5">{item.transmission}</span>
                    </div>
                    <div className="flex flex-col bg-slate-50/50 dark:bg-zinc-950/20 p-2 rounded-xl border border-slate-100/50 dark:border-zinc-900/40">
                      <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-zinc-500">Fuel Type</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-350 mt-0.5">{item.fuelType}</span>
                    </div>
                    <div className="flex flex-col bg-slate-50/50 dark:bg-zinc-950/20 p-2 rounded-xl border border-slate-100/50 dark:border-zinc-900/40">
                      <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-zinc-500">Model</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-350 mt-0.5">{item.model}</span>
                    </div>
                  </div>
                </div>

                {isCustomer && (!item.customerId || item.customerId !== (currentUser?._id || currentUser?.id)) ? (
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/60 shrink-0 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-950 shrink-0">
                      <Settings className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                      Garage Listing
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/portal/marketplace/${item._id}`);
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all border border-emerald-500 flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <span>View Details</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/60 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(item);
                      }}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all border active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                        item.status === "Available"
                          ? "bg-slate-50 dark:bg-zinc-800/40 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800"
                          : "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600"
                      }`}
                    >
                      <CheckCircle size={14} />
                      {item.status === "Available" ? "Mark Sold" : "Re-List Auto"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(item);
                      }}
                      className="p-2 text-slate-500 hover:text-blue-500 bg-slate-50 dark:bg-zinc-800/40 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl border border-slate-200 dark:border-zinc-800 active:scale-90 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                      title="Edit vehicle listing Details"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteListing(item._id);
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-zinc-800/40 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl border border-slate-200 dark:border-zinc-800 active:scale-90 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                      title="Remove from Showroom"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Listing Form Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Content Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl h-[85vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-4xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-zinc-800/80 flex justify-between items-center bg-slate-50 dark:bg-zinc-900 shrink-0">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {editingListing ? "Edit Vehicle Listing" : "List New Vehicle for Sale"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Fill in details and upload high-res photos to present this vehicle on the customer marketplace
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                {/* 1. Title & Details (Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
                      Advertisement Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Pristine Condition Hyundai i20 Sportz"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-500 text-sm transition-all text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-500 text-sm font-semibold transition-all text-slate-950 dark:text-white"
                    >
                      <option value="Available">Available</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </div>
                </div>

                {/* 2. Brand, Model, Year, Price (Grid) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
                      Brand <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Hyundai"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 focus:outline-none text-sm transition-all dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
                      Model <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. i20"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 focus:outline-none text-sm transition-all dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="e.g. 2021"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 focus:outline-none text-sm transition-all dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 650000"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 focus:outline-none text-sm transition-all dark:text-white"
                    />
                  </div>
                </div>

                {/* 3. Fuel, Transmission, KM (Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
                      Fuel Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 focus:outline-none text-sm transition-all dark:text-white"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="CNG">CNG</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
                      Transmission <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={transmission}
                      onChange={(e) => setTransmission(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 focus:outline-none text-sm transition-all dark:text-white"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
                      KM Driven <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={kmDriven}
                      onChange={(e) => setKmDriven(e.target.value)}
                      placeholder="e.g. 45000"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 focus:outline-none text-sm transition-all dark:text-white"
                    />
                  </div>
                </div>

                {/* 4. Short Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
                    Short Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a premium short pitch highlighting engine status, maintenance records, and interior condition..."
                    rows={3}
                    className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 focus:outline-none text-sm transition-all resize-none dark:text-white"
                  />
                </div>

                {/* 5. Photos Upload & Gallery */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-2">
                    Vehicle Photo Gallery
                  </label>

                  <div className="flex flex-wrap gap-3">
                    {/* Add Photo Button */}
                    <label className="w-24 h-24 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/20 hover:bg-emerald-500/10 hover:border-emerald-400 cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-colors group shrink-0">
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-500 group-hover:text-emerald-500">Upload</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>

                    {/* Previews (Existing Photos) */}
                    {existingPhotos.map((photo, idx) => (
                      <div key={`exist-${idx}`} className="w-24 h-24 rounded-2xl bg-zinc-800 border border-zinc-800 overflow-hidden relative group">
                        <img
                          src={`${import.meta.env.VITE_BASE_URL}${photo}`}
                          alt="existing-preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhotoPreview(idx, false)}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-500 hover:bg-red-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}

                    {/* Previews (New Photos) */}
                    {photoPreviews.map((previewUrl, idx) => (
                      <div key={`new-${idx}`} className="w-24 h-24 rounded-2xl bg-zinc-800 border border-zinc-800 overflow-hidden relative group">
                        <img
                          src={previewUrl}
                          alt="new-preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhotoPreview(idx, true)}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-500 hover:bg-red-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Dynamic Specifications */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400">
                      Technical Specifications
                    </label>
                    <button
                      type="button"
                      onClick={addSpecField}
                      className="text-xs font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Specification
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {specifications.map((spec, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <input
                          type="text"
                          required
                          value={spec.key}
                          onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                          placeholder="e.g. Engine Capacity, Color, Previous Owners"
                          className="flex-1 h-10 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 focus:outline-none text-xs dark:text-white"
                        />
                        <input
                          type="text"
                          required
                          value={spec.value}
                          onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                          placeholder="e.g. 1197 cc, Metallic Red, 1st Owner"
                          className="flex-1 h-10 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 focus:outline-none text-xs dark:text-white"
                        />
                        {specifications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSpecField(index)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 rounded-lg transition-colors border border-slate-200 dark:border-zinc-800/60"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Operations */}
                <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 flex gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-3 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-2xl text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 disabled:opacity-65 flex items-center justify-center gap-1.5"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving Listing...</span>
                      </>
                    ) : (
                      <span>Save Vehicle Listing</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
