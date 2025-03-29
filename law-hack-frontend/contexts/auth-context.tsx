"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { login } from "../lib/axios-instance"

type AuthContextType = {
  isAuthenticated: boolean
  isLoading: boolean
  userRole: string | null
  login: (phoneNumber: string, code: string | null, region: string, city: string) => Promise<void>
  logout: () => Promise<void>
  requestVerificationCode: (phoneNumber: string, region: string, city: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  userRole: null,
  login: async () => {},
  logout: async () => {},
  requestVerificationCode: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("auth_token")
        const role = await AsyncStorage.getItem("user_role")

        if (token) {
          setIsAuthenticated(true)
          setUserRole(role)
        }
      } catch (error) {
        console.error("Error checking auth status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const loginUser = async (phoneNumber: string, code: string | null, region: string, city: string) => {
    console.log('Login attempt with:', { phoneNumber, code, region, city });
    try {
      const response = await login(phoneNumber, code, region, city);
      console.log('Login response received:', response.data);

      if (response.data) {
        // Store auth token
        await AsyncStorage.setItem("auth_token", response.data.token || "dummy-token");
        await AsyncStorage.setItem("user_role", response.data.role || "user");
        console.log('Auth tokens stored, role:', response.data.role || "user");

        setIsAuthenticated(true);
        setUserRole(response.data.role || "user");
      }
    } catch (error: any) {
      console.error("Login error:", error.message);
      console.error("Full error:", error);
      throw error;
    }
  }

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("auth_token")
      await AsyncStorage.removeItem("user_role")
      setIsAuthenticated(false)
      setUserRole(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const requestVerificationCode = async (phoneNumber: string, region: string, city: string) => {
    console.log('Requesting verification code for:', { phoneNumber, region, city });
    try {
      // Вызываем API для запроса кода верификации
      const response = await login(phoneNumber, null, region, city);
      console.log('Verification code request successful:', response.data);
    } catch (error: any) {
      console.error("Error requesting verification code:", error.message);
      console.error("Full error:", error);
      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userRole,
        login: loginUser,
        logout,
        requestVerificationCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

