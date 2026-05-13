import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./context/AuthContext";

// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./context/ProtectedRoutes";
import Settings from "./pages/Settings";
import Inventory from "./pages/Inventory";
import JobCards from "./pages/JobCards";
import Customers from "./pages/Customers";
import RequestedCustomers from "./pages/RequestedCustomers";
import Profile from "./pages/Profile";
import Billing from "./pages/Billing";
import StaffMembers from "./pages/StaffMembers";
import Services from "./pages/Services";
import Vehicles from "./pages/Vehicles";
import ServiceReminders from "./pages/ServiceReminders";
import PortalLogin from "./pages/portal/PortalLogin";
import PortalHome from "./pages/portal/PortalHome";
import PortalDashboard from "./pages/portal/PortalDashboard";
import AdminLogin from "./pages/AdminLogin";
import HelpCenter from "./pages/HelpCenter";
import SearchPage from "./pages/SearchPage";

// Components
import ToastContainer from "./components/UI/ToastContainer";
import GarageLayout from "./components/Layout/GarageLayout";

// --- ELITE PAGE TRANSITION COMPONENT ---
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{
      duration: 0.25,
      ease: "easeInOut",
    }}
    className="h-full w-full"
  >
    {children}
  </motion.div>
);

function App() {
  const { user, token, loading, isVerified } = useAuth();
  const location = useLocation();
  const [portalToken, setPortalToken] = useState(
    sessionStorage.getItem("portal_token"),
  );

  useEffect(() => {
    setPortalToken(sessionStorage.getItem("portal_token"));
  }, [location]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-medium animate-pulse">
            Initializing System...
          </p>
        </div>
      </div>
    );
  }

  const isAuthenticated = !!token && !!user && isVerified;

  const getDashboardPath = (role) => {
    if (role === "customer") return "/portal/dashboard";
    return "/dashboard";
  };

  return (
    <>
      <ToastContainer />
      {/* 1. mode="wait" ensures smooth exit-before-entry */}
      <AnimatePresence mode="wait">
        {/* 2. KEY is the most important part for sub-route transitions */}
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PageTransition>
                <LandingPage />
              </PageTransition>
            }
          />

          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <PageTransition>
                  <Login />
                </PageTransition>
              ) : (
                <Navigate to={getDashboardPath(user?.role)} replace />
              )
            }
          />

          <Route
            path="/signup"
            element={
              !isAuthenticated ? (
                <PageTransition>
                  <Signup />
                </PageTransition>
              ) : (
                <Navigate to={getDashboardPath(user?.role)} replace />
              )
            }
          />

          <Route
            path="/admin/login"
            element={
              !isAuthenticated ? (
                <PageTransition>
                  <AdminLogin />
                </PageTransition>
              ) : (
                <Navigate to={getDashboardPath(user?.role)} replace />
              )
            }
          />

          {/* Portal Routes */}
          <Route
            path="/portal"
            element={
              <PageTransition>
                <PortalHome />
              </PageTransition>
            }
          />
          <Route
            path="/portal/login"
            element={
              <PageTransition>
                <PortalLogin />
              </PageTransition>
            }
          />
          <Route
            path="/portal/dashboard"
            element={
              portalToken ? (
                <PageTransition>
                  <PortalDashboard />
                </PageTransition>
              ) : (
                <Navigate to="/portal" replace />
              )
            }
          />

          {/* Protected Garage Routes with Persistent Layout */}
          <Route
            element={
              <ProtectedRoute>
                {/* Note: GarageLayout itself doesn't need PageTransition here 
                    because its children (the sub-routes) will handle it */}
                <GarageLayout />
              </ProtectedRoute>
            }
          >
            {/* 3. Wrap EVERY sub-route component with PageTransition */}
            <Route
              path="/dashboard"
              element={
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              }
            />
            <Route
              path="/inventory"
              element={
                <PageTransition>
                  <Inventory />
                </PageTransition>
              }
            />
            <Route
              path="/job-cards"
              element={
                <PageTransition>
                  <JobCards />
                </PageTransition>
              }
            />
            <Route
              path="/customers"
              element={
                <PageTransition>
                  <Customers />
                </PageTransition>
              }
            />
            <Route
              path="/profile"
              element={
                <PageTransition>
                  <Profile />
                </PageTransition>
              }
            />
            <Route
              path="/services"
              element={
                <PageTransition>
                  <Services />
                </PageTransition>
              }
            />
            <Route
              path="/vehicles"
              element={
                <PageTransition>
                  <Vehicles />
                </PageTransition>
              }
            />
            <Route
              path="/search"
              element={
                <PageTransition>
                  <SearchPage />
                </PageTransition>
              }
            />

            {/* Role Restricted Routes */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={["owner", "admin", "advisor"]}>
                  <PageTransition>
                    <Settings />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/requested-customers"
              element={
                <ProtectedRoute allowedRoles={["owner", "admin"]}>
                  <PageTransition>
                    <RequestedCustomers />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute allowedRoles={["owner", "admin"]}>
                  <PageTransition>
                    <Billing />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff-members"
              element={
                <ProtectedRoute allowedRoles={["owner", "admin"]}>
                  <PageTransition>
                    <StaffMembers />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reminders"
              element={
                <ProtectedRoute allowedRoles={["owner", "admin"]}>
                  <PageTransition>
                    <ServiceReminders />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/help"
              element={
                <ProtectedRoute allowedRoles={["owner", "admin"]}>
                  <PageTransition>
                    <HelpCenter />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Page not found */}
          <Route
            path="*"
            element={
              <PageTransition>
                <div className="h-screen w-screen flex flex-col items-center justify-center gap-6">
                  <h1 className="text-6xl font-bold text-gray-800">404</h1>
                  <p className="text-gray-500 text-lg">Page Not Found</p>
                  <button
                    onClick={() => window.history.back()}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-2xl text-sm font-bold text-white transition-all duration-300"
                  >
                    Go Back
                  </button>
                </div>
              </PageTransition>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
