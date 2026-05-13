import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isVerified } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // Only allow access if user is verified by backend
  if (!user || !isVerified) {
    return <Navigate to="/login" replace />;
  }

  // Role separation: redirect customers to portal if they hit a garage route
  if (user.role === 'customer') {
    return <Navigate to="/portal/dashboard" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user is authenticated but doesn't have the right role, redirect to their default dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
