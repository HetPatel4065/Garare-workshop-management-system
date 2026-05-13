import RequestedCustomer from "../models/RequestedCustomer.js";
import Customer from "../models/Customer.js";
import Vehicle from "../models/Vehicle.js";
import Notification from "../models/Notification.js";
import Owner from "../models/Owner.js";
import { sendWelcomeEmail, sendRejectionEmail } from "../utils/email.js";
import mongoose from "mongoose";

// ➕ CREATE REQUEST (Portal/Registration)
export const createRequestedCustomer = async (req, res) => {
  try {
    const data = { ...req.body };
    
    if (!data.ownerId && req.user) {
        data.ownerId = req.user.effectiveOwnerId;
    }

    if (!data.ownerId) {
      return res.status(400).json({ error: "Garage identification is required" });
    }

    // Prevent duplicates (phone or vehicle number)
    const existingRequest = await RequestedCustomer.findOne({
      ownerId: data.ownerId,
      $or: [{ phone: data.phone }, { vehicleNumber: data.vehicleNumber }],
      status: "pending"
    });

    if (existingRequest) {
      return res.status(400).json({ error: "A pending request with this phone or vehicle number already exists." });
    }

    const requestedCustomer = await RequestedCustomer.create(data);

    // Create notification for owner
    await Notification.create({
      ownerId: data.ownerId,
      title: "New Customer Request",
      message: `${data.customerName} has requested registration for vehicle ${data.vehicleNumber}.`,
      type: "new_customer",
      link: `/requested-customers`
    });

    res.status(201).json(requestedCustomer);
  } catch (err) {
    console.error("Create Requested Customer Error:", err);
    res.status(400).json({ error: err.message || "Failed to submit request" });
  }
};

// 📋 GET ALL REQUESTS (Owner)
export const getAllRequestedCustomers = async (req, res) => {
  try {
    const ownerId = req.user.effectiveOwnerId;
    const { status, search } = req.query;

    let query = { ownerId };

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { vehicleNumber: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    const requests = await RequestedCustomer.find(query).sort({ requestedAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

// 🔍 GET SINGLE REQUEST
export const getRequestedCustomerById = async (req, res) => {
  try {
    const ownerId = req.user.effectiveOwnerId;
    const request = await RequestedCustomer.findOne({ _id: req.params.id, ownerId });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.status(200).json(request);
  } catch (err) {
    res.status(500).json({ error: "Error fetching request" });
  }
};

// ✅ APPROVE REQUEST
export const approveRequestedCustomer = async (req, res) => {
  try {
    const ownerId = req.user.effectiveOwnerId;
    const { inspectionDate, inspectionTime } = req.body;

    const request = await RequestedCustomer.findOne({ _id: req.params.id, ownerId });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.status === "approved") {
      return res.status(400).json({ error: "Request already approved" });
    }

    // 1. Check if Customer already exists by phone OR email
    let existingCustomer = await Customer.findOne({
      ownerId,
      $or: [{ phone: request.phone }, { email: request.email }]
    });
    
    let customerId;
    if (existingCustomer) {
      customerId = existingCustomer._id;
      console.log("Linking to existing customer:", existingCustomer._id);
    } else {
      // Create new customer
      try {
        const newCustomer = await Customer.create({
          name: request.customerName,
          phone: request.phone,
          email: request.email,
          address: { street: request.location },
          ownerId: ownerId,
          status: "Active",
          isVerified: true
        });
        customerId = newCustomer._id;
        console.log("Created new customer:", customerId);
      } catch (custErr) {
        console.error("Customer Creation Failed:", custErr);
        return res.status(400).json({ error: `Failed to create customer record: ${custErr.message}` });
      }
    }

    // 2. Create Vehicle
    const modelParts = (request.vehicleModel || "").trim().split(/\s+/);
    const make = modelParts[0] || "Unknown";
    const model = modelParts.length > 1 ? modelParts.slice(1).join(" ") : "Generic";

    try {
      await Vehicle.create({
        garageId: ownerId,
        customerId: customerId,
        customerName: request.customerName,
        make: make.trim(),
        model: model.trim(),
        year: new Date().getFullYear(),
        licensePlate: request.vehicleNumber.trim(),
        status: "With Owner"
      });
      console.log("Vehicle created successfully");
    } catch (vehErr) {
      console.error("Vehicle Creation Failed:", vehErr);
      return res.status(400).json({ error: `Failed to create vehicle record: ${vehErr.message}` });
    }

    // 3. Update Requested Customer
    request.status = "approved";
    request.approvedAt = new Date();
    await request.save();

    // 4. Send Welcome Email & Notification (Async)
    try {
      const owner = await Owner.findById(ownerId);
      await sendWelcomeEmail(
        request.email,
        request.customerName,
        owner?.garageName || "Our Garage",
        owner?.name || "The Team",
        inspectionDate,
        inspectionTime
      );
    } catch (emailErr) {
      console.error("Non-blocking Email Error:", emailErr);
    }

    await Notification.create({
      ownerId,
      title: "Customer Approved",
      message: `${request.customerName} has been approved and added to the system.`,
      type: "success",
      link: `/customers`
    });

    res.status(200).json({ message: "Customer approved and moved to active records", request });
  } catch (err) {
    console.error("FULL APPROVAL ERROR:", err);
    res.status(500).json({ error: err.message || "Internal server error during approval" });
  }
};

// ❌ REJECT REQUEST
export const rejectRequestedCustomer = async (req, res) => {
  try {
    const ownerId = req.user.effectiveOwnerId;
    const { rejectionReason } = req.body;

    const request = await RequestedCustomer.findOneAndUpdate(
      { _id: req.params.id, ownerId },
      { 
        status: "rejected", 
        rejectionReason 
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Send Rejection Email (Async)
    try {
      const owner = await Owner.findById(ownerId);
      await sendRejectionEmail(
        request.email,
        request.customerName,
        owner?.garageName,
        rejectionReason
      );
    } catch (emailErr) {
      console.error("Failed to send rejection email:", emailErr);
    }

    res.status(200).json({ message: "Request rejected", request });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to reject request" });
  }
};

// ❌ DELETE REQUEST
export const deleteRequestedCustomer = async (req, res) => {
  try {
    const ownerId = req.user.effectiveOwnerId;
    const request = await RequestedCustomer.findOneAndDelete({ _id: req.params.id, ownerId });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.status(200).json({ message: "Request deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to delete request" });
  }
};

// 📊 GET TODAY'S REQUESTS (For Dashboard)
export const getTodaysInspections = async (req, res) => {
    try {
      const ownerId = req.user.effectiveOwnerId;
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
  
      const requests = await RequestedCustomer.find({
        ownerId,
        createdAt: { $gte: start, $lte: end },
        status: "pending"
      }).sort({ createdAt: -1 });
  
      res.status(200).json(requests);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch today's requests" });
    }
  };
