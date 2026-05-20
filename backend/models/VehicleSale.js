import mongoose from "mongoose";

const vehicleSaleSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "Model is required"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"],
      required: [true, "Fuel type is required"],
    },
    kmDriven: {
      type: Number,
      required: [true, "Kilometers driven is required"],
    },
    transmission: {
      type: String,
      enum: ["Automatic", "Manual"],
      required: [true, "Transmission is required"],
    },
    description: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
    },
    specifications: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    photos: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["Available", "Sold"],
      default: "Available",
    },
  },
  { timestamps: true }
);

const VehicleSale = mongoose.model("VehicleSale", vehicleSaleSchema);
export default VehicleSale;
