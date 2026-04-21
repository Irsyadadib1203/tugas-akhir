"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";

interface AuthContextType {
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  register: (
  email: string,
  password: string,
  name: string
) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (
    email: string
  ) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Listen ke perubahan login Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Login Firebase
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: unknown) {
      let message = "Terjadi kesalahan saat login.";

      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/user-not-found":
            message = "Email tidak terdaftar.";
            break;
          case "auth/wrong-password":
            message = "Password salah.";
            break;
          case "auth/invalid-email":
            message = "Format email tidak valid.";
            break;
          case "auth/invalid-credential":
            message = "Email atau password salah.";
            break;
        }
      }

      return { success: false, message };
    }
  };

  // ✅ Register Firebase
  const register = async (
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: name,
      });
    }

    return { success: true };
  } catch (error: unknown) {
    let message = "Terjadi kesalahan saat registrasi.";

    if (error instanceof FirebaseError) {
      switch (error.code) {
        case "auth/email-already-in-use":
          message = "Email sudah digunakan.";
          break;
        case "auth/weak-password":
          message = "Password terlalu lemah.";
          break;
        case "auth/invalid-email":
          message = "Format email tidak valid.";
          break;
      }
    }

    return { success: false, message };
  }
};
  // ✅ Forgot Password Firebase
  const forgotPassword = async (
    email: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      // Cek apakah email sudah terdaftar
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);

    if (signInMethods.length === 0) {
      return {
        success: false,
        message: "Email tidak terdaftar. Periksa kembali email Anda.",
      };
    }

    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: "Link reset password telah dikirim ke email Anda.",
    };
  } catch (error: unknown) {
    let message = "Terjadi kesalahan saat mengirim email reset password.";

      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/user-not-found":
            message = "Email tidak terdaftar.";
            break;
          case "auth/invalid-email":
            message = "Format email tidak valid.";
            break;
          case "auth/too-many-requests":
            message = "Terlalu banyak permintaan. Coba lagi nanti.";
            break;
        }
      }

      return { success: false, message };
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        forgotPassword
      }}
    >
      {!loading && children}
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