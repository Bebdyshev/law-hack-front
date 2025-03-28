"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useColorScheme } from "react-native"

type ThemeContextType = {
  isDarkMode: boolean
  toggleTheme: () => void
  colors: {
    background: string
    text: string
    primary: string
    secondary: string
    accent: string
    card: string
    border: string
    error: string
    success: string
    messageIn: string
    messageOut: string
    inputBackground: string
  }
}

const lightColors = {
  background: "#FFFFFF",
  text: "#1A1A1A",
  primary: "#6366F1",
  secondary: "#A5B4FC",
  accent: "#4F46E5",
  card: "#F9FAFB",
  border: "#E5E7EB",
  error: "#EF4444",
  success: "#10B981",
  messageIn: "#F3F4F6",
  messageOut: "#EEF2FF",
  inputBackground: "#F9FAFB",
}

const darkColors = {
  background: "#111827",
  text: "#F9FAFB",
  primary: "#818CF8",
  secondary: "#A5B4FC",
  accent: "#6366F1",
  card: "#1F2937",
  border: "#374151",
  error: "#F87171",
  success: "#34D399",
  messageIn: "#1F2937",
  messageOut: "#312E81",
  inputBackground: "#1F2937",
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  colors: lightColors,
})

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme()
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark")
  const [colors, setColors] = useState(isDarkMode ? darkColors : lightColors)

  useEffect(() => {
    setColors(isDarkMode ? darkColors : lightColors)
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>{children}</ThemeContext.Provider>
}

