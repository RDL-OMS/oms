// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      setUser({ role: decoded.role, token });
    } catch (error) {
      localStorage.removeItem("token");
    }
  }
  setLoading(false); // Done checking
}, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setUser({ role: decoded.role, token });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

 return (
  <AuthContext.Provider value={{ user, login, logout, loading }}>
    {children}
  </AuthContext.Provider>
);

};

export const useAuth = () => useContext(AuthContext);