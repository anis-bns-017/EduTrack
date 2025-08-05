import { createContext, useEffect, useState } from "react";
import axios from "../../api/axios";
import { useContext } from "react";
import React from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ⏳ add loading state

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", { withCredentials: true });
        if (res.data) {
          setUser(res.data);
        } else {
          setUser(null);
        }
        setUser(res.data);
      } catch (error) {
        console.error(
          "❌ Error fetching user:",
          error.response?.data || error.message
        );
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
