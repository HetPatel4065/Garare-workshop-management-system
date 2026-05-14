import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
dotenv.config();

// 1. Import Middlewares
import errorHandler from "./middleware/error.middleware.js";

// 2. Import Routes
import dashboardRoutes from "./routes/dashboard.routes.js";
import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import billingRoutes from "./routes/billing.routes.js";
import settingRoutes from "./routes/setting.routes.js";
import ownerRoutes from "./routes/owner.routes.js";
import advisorRoutes from "./routes/advisor.routes.js";
import mechanicRoutes from "./routes/mechanic.routes.js";
import serviceCatalogRoutes from "./routes/serviceCatalog.routes.js";
import jobCardRoutes from "./routes/jobcard.routes.js";
import backupRoutes from "./routes/backup.routes.js";
import portalRoutes from "./routes/portal.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import requestedCustomerRoutes from "./routes/requestedCustomer.routes.js";
import initializeAdmin from "./utils/adminLogin.js";
import { initDailyReportCron, initServiceReminderCron, initInspectionReminderCron } from "./utils/cron.js";
import http from "http";
import { initSocket } from "./utils/socket.js";


const app = express();
const server = http.createServer(app);

// 3. Global Security & Utility Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })); // Protects against common web vulnerabilities

app.use("/uploads", express.static("uploads", {
  setHeaders: (res) => {
    res.set("Access-Control-Allow-Origin", "*");
  },
}));

app.use(express.json()); // Body parser for JSON
app.use(morgan("dev")); // Logger for incoming requests

// 4. Mount Routes
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/v1/settings", settingRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/advisor", advisorRoutes);
app.use("/api/mechanic", mechanicRoutes);
app.use("/api/service-catalog", serviceCatalogRoutes);
app.use("/api/job-cards", jobCardRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/portal", portalRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/requested-customers", requestedCustomerRoutes);

// 5. Health Check (UX Win: For monitoring server uptime)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Engine Running", uptime: process.uptime() });
});

// Root route
app.get("/", (req, res) => {
  res.send("Garage Workshop Management API is running...");
});

// 6. Error Handling (MUST be the last middleware)
app.use(errorHandler);

// 7. Database Connection & Server Start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is not defined in .env file");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected: Garage Database Ready");

    // 👤 Initialize/Sync Admin
    await initializeAdmin();

    // Initialize Socket.io
    initSocket(server);

    // ⏰ Start Scheduled Tasks
    initDailyReportCron();
    initServiceReminderCron();
    initInspectionReminderCron();


    server.listen(PORT, () => {
      console.log(`Server launched on http://localhost:${PORT}`);
    });
  })

  .catch((err) => {
    console.error("Database Connection Failed:", err.message);
    process.exit(1); // Shutdown if DB isn't reachable
  });
