import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLoading } from "./LoadingContext";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const { startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();

  // Initialize Auth: Validate session on app load
  const initializeAuth = async () => {
    const storedToken = sessionStorage.getItem("token");

    if (!storedToken) {
      setToken(null);
      setUser(null);
      setIsVerified(false);
      setLoading(false);
      return;
    }

    try {
      // Step 1: Verify token with backend
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/me?t=${Date.now()}`,
        {
          headers: {
            "Authorization": `Bearer ${storedToken}`,
            "Cache-Control": "no-cache"
          },
        },
      );

      if (res.ok) {
        const payload = await res.json();
        const userData = payload?.data ?? payload;

        // Step 2: Only after verification, set the state
        setUser(userData);
        setToken(storedToken);
        setIsVerified(true);
      } else {
        // Token invalid or expired - clear everything
        console.warn("Session expired or invalid. Clearing credentials.");
        handleLogout();
      }
    } catch (err) {
      console.error("Auth verification failed:", err);
      // On network failure, we don't clear the token but we don't mark as verified
      setToken(null);
      setUser(null);
      setIsVerified(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (email, password, garageId) => {
    startLoading("Authenticating...");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, garageId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await res.json();
      sessionStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      setIsVerified(true);

      // Navigation is now handled by the component or App logic based on state
      const userRole = data.user?.role?.toLowerCase();
      if (userRole === 'customer') {
        navigate("/portal/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } finally {
      stopLoading();
    }
  };

  const register = async (formData) => {
    startLoading("Creating Account...");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Registration failed");
      }

      navigate("/login");
    } finally {
      stopLoading();
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("portal_token"); // Clear all related tokens
    setToken(null);
    setUser(null);
    setIsVerified(false);
  };

  const logout = () => {
    handleLogout();
    navigate("/", { replace: true },);
  };

  const clearAuth = () => {
    handleLogout();
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/me?t=${Date.now()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const payload = await res.json();
        const userData = payload?.data ?? payload;
        setUser(userData);
        setIsVerified(true);
      } else if (res.status === 401) {
        logout();
      }
    } catch (err) {
      console.error("User refresh error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        token, 
        login, 
        register, 
        logout, 
        clearAuth,
        loading, 
        isVerified, 
        refreshUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

