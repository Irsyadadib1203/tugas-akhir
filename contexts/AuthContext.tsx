"use client";
import React, { createContext, useContext, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const storedUser = localStorage.getItem("waterMonitorUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    if (email && password.length >= 6) {
      const mockUser = {
        id: "1",
        email,
        name: email.split("@")[0],
      };
      setUser(mockUser);
      localStorage.setItem("waterMonitorUser", JSON.stringify(mockUser));
      return true;
    }
    return false;
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    if (email && password.length >= 6 && name) {
      const mockUser = {
        id: "1",
        email,
        name,
      };
      setUser(mockUser);
      localStorage.setItem("waterMonitorUser", JSON.stringify(mockUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("waterMonitorUser");
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
