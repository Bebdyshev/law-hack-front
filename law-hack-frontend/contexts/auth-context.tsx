"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { api } from "../lib/axios-instance"

type AuthContextType = {
  isAuthenticated: boolean
  isLoading: boolean
  userRole: string | null
  login: (phoneNumber: string, code: string | null, region: string, city: string) => Promise<void>
  logout: () => Promise<void>
  requestVerificationCode: (phoneNumber: string) => Promise<void>
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

  const login = async (phoneNumber: string, code: string | null, region: string, city: string) => {
    try {
      const response = await api.login(phoneNumber, code, region, city)

      if (response.data) {
        // Store auth token (assuming your API returns a token)
        await AsyncStorage.setItem("auth_token", response.data.token || "dummy-token")
        await AsyncStorage.setItem("user_role", response.data.role || "user")

        setIsAuthenticated(true)
        setUserRole(response.data.role || "user")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
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

  const requestVerificationCode = async (phoneNumber: string) => {
    // In a real app, you would call an API endpoint to request a verification code
    // For this example, we'll just simulate it
    console.log(`Requesting verification code for ${phoneNumber}`)
    // The actual verification code would be sent via SMS in a real app
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userRole,
        login,
        logout,
        requestVerificationCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

