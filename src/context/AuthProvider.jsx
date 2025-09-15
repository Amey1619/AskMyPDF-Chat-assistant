//src/context/AuthProvider
import { useState, useEffect } from "react";
import {
  signup as apiSignup,
  login as apiLogin,
} from "../api/auth";
import {
  logout as apiLogout,
  checkAuthStatus
} from "../api/authStatus"

import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState("");

  // ✅ Centralized auth state setter
  const handleAuthSuccess = (userData, accessToken) => {
    setUser(userData);
    setIsAuthenticated(true);
    if (accessToken){
       setToken(accessToken);
       localStorage.setItem("access_token", accessToken); 
    }
  };

  const checkAuth = async () => {
    try {
      const res = await checkAuthStatus();
      if (res?.status === 200) {
        handleAuthSuccess(res.data.user);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        console.log("User not authenticated. Please login.");
      } else {
        console.error("Auth check failed:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await apiLogin(email, password);
      if (res.status === 200) {
        handleAuthSuccess(res?.data?.user_id, res?.data?.access_token);
      }
      localStorage.setItem('user',res.data.email);
      return res;
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  };

  const signup = async (email, password) => {
    try {
      const res = await apiSignup(email, password);
      if (res?.status === 201) {
        console.log("Signup successful!");
      } else {
        console.log("Signup failed:", res?.status);
      }
      return res;
    } catch (err) {
      console.error("Error during signup:", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      const res = await apiLogout();
      if (res.status === 200) {
        setUser(null);
        setIsAuthenticated(false);
        setToken("");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }
      return res;
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, token, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
