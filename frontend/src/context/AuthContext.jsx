import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Validate token or just set user from storage if simplified
      // Ideally, fetch user profile from backend
      // For now, we'll decode locally or trust storage for role
      const storedRole = localStorage.getItem('role');
      const storedName = localStorage.getItem('user_name');
      if (storedRole) {
        setUser({ role: storedRole, full_name: storedName });
      }
    } else {
      // Clear user if no token
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await axios.post('http://localhost:8000/token', formData);
      const { access_token, role, user_name } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', role);
      localStorage.setItem('user_name', user_name);
      
      setToken(access_token);
      setUser({ role, full_name: user_name });
      return { success: true };
    } catch (error) {
      console.error("Login failed", error);
      return { success: false, message: error.response?.data?.detail || "Login failed" };
    }
  };

  const register = async (email, password, fullName, role) => {
    try {
      if (!email.endsWith('@citchennai.net')) {
        return { success: false, message: "Email must be @citchennai.net" };
      }
      
      const response = await axios.post('http://localhost:8000/register', {
        email,
        password,
        full_name: fullName,
        role
      });
       const { access_token, role: newRole, user_name } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', newRole);
      localStorage.setItem('user_name', user_name);
      
      setToken(access_token);
      setUser({ role: newRole, full_name: user_name });
      return { success: true };
    } catch (error) {
       console.error("Registration failed", error);
       return { success: false, message: error.response?.data?.detail || "Registration failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_name');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
