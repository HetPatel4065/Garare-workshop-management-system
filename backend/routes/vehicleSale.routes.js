import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { auth } from "../middleware/auth.middleware.js";
import {
  createListing,
  getOwnerListings,
  updateListing,
  deleteListing,
  getMarketplaceListings,
  getMarketplaceVehicleDetails,
} from "../controllers/vehicleSale.controller.js";

const router = express.Router();

// Ensure upload directory exists
const uploadDir = "uploads/vehicles";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only images (jpeg, jpg, png, webp) are allowed"));
  },
});

// 🏪 PUBLIC / CUSTOMER MARKETPLACE ROUTES
router.get("/marketplace", getMarketplaceListings);
router.get("/marketplace/:id", getMarketplaceVehicleDetails);

// 🛠️ OWNER LISTING MANAGEMENT ROUTES (Protected by Auth)
router.post("/", auth, upload.array("photos", 10), createListing);
router.get("/my-listings", auth, getOwnerListings);
router.put("/:id", auth, upload.array("photos", 10), updateListing);
router.delete("/:id", auth, deleteListing);

export default router;
