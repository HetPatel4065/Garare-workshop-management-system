import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { useLoading } from "./LoadingContext";
import { getDashboardRoute } from "../utils/roles";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// ─── Token storage helpers (sessionStorage for cross-session persistence) ───────
const TOKEN_KEY = "garage_token";
const getStoredToken = () => sessionStorage.getItem(TOKEN_KEY);
const setStoredToken = (t) => sessionStorage.setItem(TOKEN_KEY, t);
const clearStoredToken = () => sessionStorage.removeItem(TOKEN_KEY);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  const { startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();

  // ─── Core logout helper (no navigate — used internally) ────────────────────
  const _clearSession = useCallback(() => {
    clearStoredToken();
    sessionStorage.removeItem("portal_token");
    sessionStorage.removeItem("service_reminder_shown");
    setToken(null);
    setUser(null);
    setIsVerified(false);
  }, []);

  // ─── Initialize: validate stored token on app boot ─────────────────────────
  const initializeAuth = useCallback(async () => {
    const storedToken = getStoredToken();

    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/me?t=${Date.now()}`,
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Cache-Control": "no-cache",
          },
        },
      );

      if (res.ok) {
        const payload = await res.json();
        const userData = payload?.data ?? payload;
        setUser(userData);
        setToken(storedToken);
        setIsVerified(true);
      } else {
        // Token invalid or expired — clear silently
        _clearSession();
      }
    } catch {
      // Network failure: keep token but don't mark verified
      // (user will be re-checked on next API call)
      _clearSession();
    } finally {
      setLoading(false);
    }
  }, [_clearSession]);

  useEffect(() => {
    initializeAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password, garageId) => {
    startLoading("Authenticating…");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // carry httpOnly refresh cookie
        body: JSON.stringify({ email, password, garageId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await res.json();
      const userData = data.user;
      const jwt = data.token;

      setStoredToken(jwt);
      setToken(jwt);
      setUser(userData);
      setIsVerified(true);

      // Role-aware redirect
      navigate(getDashboardRoute(userData?.role), { replace: true });
    } finally {
      stopLoading();
    }
  };

  // ─── Register ──────────────────────────────────────────────────────────────
  const register = async (formData) => {
    startLoading("Creating Account…");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Registration failed");
      }

      navigate("/owner/login");
    } finally {
      stopLoading();
    }
  };

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    // Best-effort server-side cookie clear
    fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).catch(() => {});

    _clearSession();
    navigate("/login", { replace: true });
  }, [_clearSession, navigate, token]);

  const clearAuth = useCallback(() => {
    _clearSession();
  }, [_clearSession]);

  // ─── Refresh user profile from backend ─────────────────────────────────────
  const refreshUser = useCallback(async () => {
    const currentToken = token || getStoredToken();
    if (!currentToken) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/me?t=${Date.now()}`,
        { headers: { Authorization: `Bearer ${currentToken}` } },
      );

      if (res.ok) {
        const payload = await res.json();
        setUser(payload?.data ?? payload);
        setIsVerified(true);
      } else if (res.status === 401) {
        logout();
      }
    } catch {
      /* network glitch — keep current state */
    }
  }, [token, logout]);

  // ─── Expose API ────────────────────────────────────────────────────────────
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isVerified,
        login,
        register,
        logout,
        clearAuth,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
