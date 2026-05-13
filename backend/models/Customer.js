import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    // References to the owner/garage this customer belongs to
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
    },
    address: {
      street: String,
      city: String,
      zip: String,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Blocked", "Pending", "Rejected"],
      default: "Active",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    vehicleNumber: {
      type: String,
      trim: true,
    },
    vehicleModel: {
      type: String,
      trim: true,
    },
    tags: [String],
    notes: String,
    customerId: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Calculate total number of vehicles for the UI
customerSchema.virtual("vehicleCount").get(function () {
  return this.vehicles ? this.vehicles.length : 0;
});

customerSchema.pre("save", async function (next) {
  // Only generate if it's a new document and customerId isn't provided
  if (this.isNew && !this.customerId) {
    try {
      // 1. Find the customer with the highest ID for this specific garage
      // Note: ownerId is used for garage reference in this model
      const lastCustomer = await this.constructor
        .findOne({
          ownerId: this.ownerId,
          customerId: { $regex: /^CUST-/ }
        })
        .sort({ customerId: -1 })
        .lean();

      let nextNum = 1000;

      if (lastCustomer?.customerId) {
        const parts = lastCustomer.customerId.split("-");
        const lastNum = parseInt(parts[1], 10);

        if (!isNaN(lastNum)) {
          nextNum = lastNum + 1;
        }
      }

      this.customerId = `CUST-${nextNum}`;

    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});
customerSchema.index({ phone: 1, ownerId: 1 }, { unique: true });
customerSchema.index({ email: 1, ownerId: 1 }, { unique: true });
customerSchema.index({ customerId: 1, ownerId: 1 }, { unique: true });

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;