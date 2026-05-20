import VehicleSale from "../models/VehicleSale.js";
import Owner from "../models/Owner.js";

// 📝 CREATE LISTING (Owner Only)
export const createListing = async (req, res) => {
  try {
    const ownerId = req.user.effectiveOwnerId;
    if (!ownerId) {
      return res.status(400).json({ error: "Active garage owner context required" });
    }

    const {
      title,
      brand,
      model,
      year,
      price,
      fuelType,
      kmDriven,
      transmission,
      description,
    } = req.body;

    if (!title || !brand || !model || !year || !price || !fuelType || !kmDriven || !transmission || !description) {
      return res.status(400).json({ error: "Please fill in all required fields" });
    }

    let specifications = [];
    if (req.body.specifications) {
      try {
        specifications = typeof req.body.specifications === "string"
          ? JSON.parse(req.body.specifications)
          : req.body.specifications;
      } catch (err) {
        console.error("Error parsing specifications:", err);
      }
    }

    const photos = req.files ? req.files.map(file => `/uploads/vehicles/${file.filename}`) : [];

    const newListing = await VehicleSale.create({
      ownerId,
      customerId: req.user.role === "customer" ? req.user._id : undefined,
      title,
      brand,
      model,
      year: Number(year),
      price: Number(price),
      fuelType,
      kmDriven: Number(kmDriven),
      transmission,
      description,
      specifications,
      photos,
      status: "Available",
    });

    res.status(201).json({
      success: true,
      message: "Vehicle listed for sale successfully!",
      listing: newListing,
    });
  } catch (error) {
    console.error("CREATE VEHICLE LISTING ERROR:", error);
    res.status(500).json({ error: "Failed to create vehicle listing: " + error.message });
  }
};

// 📋 GET OWNER LISTINGS (Owner Only or Customer's own listings)
export const getOwnerListings = async (req, res) => {
  try {
    const ownerId = req.user.effectiveOwnerId;
    if (!ownerId) {
      return res.status(400).json({ error: "Active garage owner context required" });
    }

    const query = { ownerId };
    if (req.user.role === "customer") {
      query.$or = [
        { customerId: req.user._id },
        { customerId: { $exists: false } },
        { customerId: null }
      ];
    }

    const listings = await VehicleSale.find(query).sort({ createdAt: -1 });
    res.status(200).json(listings);
  } catch (error) {
    console.error("GET OWNER LISTINGS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch your listings" });
  }
};

// ✏️ UPDATE LISTING (Owner Only)
export const updateListing = async (req, res) => {
  try {
    const ownerId = req.user.effectiveOwnerId;
    const { id } = req.params;

    const listing = await VehicleSale.findById(id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Verify ownership
    if (req.user.role === "customer") {
      if (!listing.customerId || listing.customerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "You are not authorized to update this listing" });
      }
    } else {
      if (listing.ownerId.toString() !== ownerId.toString()) {
        return res.status(403).json({ error: "You are not authorized to update this listing" });
      }
    }

    const {
      title,
      brand,
      model,
      year,
      price,
      fuelType,
      kmDriven,
      transmission,
      description,
      status,
      existingPhotos,
    } = req.body;

    let specifications = [];
    if (req.body.specifications) {
      try {
        specifications = typeof req.body.specifications === "string"
          ? JSON.parse(req.body.specifications)
          : req.body.specifications;
      } catch (err) {
        console.error("Error parsing specifications:", err);
      }
    }

    // Handle photos: we combine remaining existing photos with newly uploaded photos
    let updatedPhotos = [];
    if (existingPhotos) {
      try {
        updatedPhotos = typeof existingPhotos === "string"
          ? JSON.parse(existingPhotos)
          : existingPhotos;
      } catch (err) {
        updatedPhotos = Array.isArray(existingPhotos) ? existingPhotos : [existingPhotos];
      }
    } else {
      updatedPhotos = listing.photos;
    }

    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(file => `/uploads/vehicles/${file.filename}`);
      updatedPhotos = [...updatedPhotos, ...newPhotos];
    }

    const updatedListing = await VehicleSale.findByIdAndUpdate(
      id,
      {
        title: title || listing.title,
        brand: brand || listing.brand,
        model: model || listing.model,
        year: year ? Number(year) : listing.year,
        price: price ? Number(price) : listing.price,
        fuelType: fuelType || listing.fuelType,
        kmDriven: kmDriven ? Number(kmDriven) : listing.kmDriven,
        transmission: transmission || listing.transmission,
        description: description || listing.description,
        specifications: req.body.specifications ? specifications : listing.specifications,
        photos: updatedPhotos,
        status: status || listing.status,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Listing updated successfully!",
      listing: updatedListing,
    });
  } catch (error) {
    console.error("UPDATE LISTING ERROR:", error);
    res.status(500).json({ error: "Failed to update listing: " + error.message });
  }
};

// 🗑️ DELETE LISTING (Owner Only)
export const deleteListing = async (req, res) => {
  try {
    const ownerId = req.user.effectiveOwnerId;
    const { id } = req.params;

    const listing = await VehicleSale.findById(id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Verify ownership
    if (req.user.role === "customer") {
      if (!listing.customerId || listing.customerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "You are not authorized to delete this listing" });
      }
    } else {
      if (listing.ownerId.toString() !== ownerId.toString()) {
        return res.status(403).json({ error: "You are not authorized to delete this listing" });
      }
    }

    await VehicleSale.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Listing deleted successfully!",
    });
  } catch (error) {
    console.error("DELETE LISTING ERROR:", error);
    res.status(500).json({ error: "Failed to delete listing" });
  }
};

// 📋 GET MARKETPLACE LISTINGS (Customer/Public)
export const getMarketplaceListings = async (req, res) => {
  try {
    const {
      brand,
      transmission,
      fuelType,
      priceMin,
      priceMax,
      yearMin,
      yearMax,
      city,
      search,
    } = req.query;

    const filter = { status: "Available" };

    if (brand) {
      filter.brand = { $regex: new RegExp(brand, "i") };
    }
    if (transmission) {
      filter.transmission = transmission;
    }
    if (fuelType) {
      filter.fuelType = fuelType;
    }

    // Range filters
    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = Number(priceMin);
      if (priceMax) filter.price.$lte = Number(priceMax);
    }
    if (yearMin || yearMax) {
      filter.year = {};
      if (yearMin) filter.year.$gte = Number(yearMin);
      if (yearMax) filter.year.$lte = Number(yearMax);
    }

    // Text search (matches title, brand, model, description)
    if (search) {
      filter.$or = [
        { title: { $regex: new RegExp(search, "i") } },
        { brand: { $regex: new RegExp(search, "i") } },
        { model: { $regex: new RegExp(search, "i") } },
        { description: { $regex: new RegExp(search, "i") } },
      ];
    }

    // Query listings and populate Owner and Customer info
    let listings = await VehicleSale.find(filter)
      .populate({
        path: "ownerId",
        select: "name garageName address mobileNumber logo city verificationStatus",
      })
      .populate({
        path: "customerId",
        select: "name email phone isVerified",
      })
      .sort({ createdAt: -1 });

    // Filter by city if provided (Owner's address contains city)
    if (city) {
      listings = listings.filter((item) => {
        if (!item.ownerId) return false;
        const address = item.ownerId.address || "";
        return address.toLowerCase().includes(city.toLowerCase());
      });
    }

    res.status(200).json(listings);
  } catch (error) {
    console.error("GET MARKETPLACE LISTINGS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch marketplace listings" });
  }
};

// 📋 GET MARKETPLACE VEHICLE DETAILS (Customer/Public)
export const getMarketplaceVehicleDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await VehicleSale.findById(id)
      .populate({
        path: "ownerId",
        select: "name garageName address mobileNumber logo email verificationStatus",
      })
      .populate({
        path: "customerId",
        select: "name email phone isVerified",
      });

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    // Generate WhatsApp click-to-chat link
    let whatsappLink = "";
    if (vehicle.customerId && vehicle.customerId.phone) {
      let cleanedNumber = vehicle.customerId.phone.replace(/\D/g, "");
      if (cleanedNumber.length === 10) {
        cleanedNumber = "91" + cleanedNumber;
      }
      const messageText = `Hi ${vehicle.customerId.name || "there"}, I'm interested in your listed vehicle: ${vehicle.brand} ${vehicle.model} (${vehicle.year}) priced at ₹${vehicle.price.toLocaleString("en-IN")}. Is it still available?`;
      whatsappLink = `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(messageText)}`;
    } else if (vehicle.ownerId && vehicle.ownerId.mobileNumber) {
      let cleanedNumber = vehicle.ownerId.mobileNumber.replace(/\D/g, "");
      if (cleanedNumber.length === 10) {
        cleanedNumber = "91" + cleanedNumber;
      }
      const messageText = `Hi ${vehicle.ownerId.name || "there"}, I'm interested in your listed vehicle: ${vehicle.brand} ${vehicle.model} (${vehicle.year}) priced at ₹${vehicle.price.toLocaleString("en-IN")}. Is it still available?`;
      whatsappLink = `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(messageText)}`;
    }

    res.status(200).json({
      success: true,
      vehicle,
      whatsappLink,
    });
  } catch (error) {
    console.error("GET MARKETPLACE DETAILS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch vehicle details" });
  }
};
