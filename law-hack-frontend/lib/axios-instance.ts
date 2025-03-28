import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to add auth token to requests
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("auth_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Clear token and redirect to login
      await AsyncStorage.removeItem("auth_token")
      // Navigation will be handled by the auth context

      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)

// API endpoints
export const api = {
  // Auth
  login: (phoneNumber: string, code: string | null, region: string, city: string) =>
    axiosInstance.post("/auth/login", { phoneNumber, code, region, city }),

  // Chat
  initChat: () => axiosInstance.post("/chat/init"),
  sendMessage: (chatId: string, message: string | null, type: "text" | "image" | "video", mediaUrl?: string) =>
    axiosInstance.post("/chat/message", { chatId, message, type, mediaUrl }),
  getChatHistory: (chatId: string) => axiosInstance.get(`/chat/history/${chatId}`),

  // Reports
  submitReport: (reportData: {
    title: string
    location: {
      coordinates: [number, number]
      region: string
      city: string
    }
    body: string
    time: string
    mediaUrls?: string[]
  }) => axiosInstance.post("/report/report", reportData),

  // Admin
  getAdminChats: () => axiosInstance.get("/admin/chats"),
  terminateChat: (chatId: string) => axiosInstance.delete(`/admin/chats/${chatId}`),
  createAnnouncement: (data: {
    title: string
    body: string
    media?: string[]
    region: string
    city: string
  }) => axiosInstance.post("/admin/announcement", data),
  getAnnouncements: () => axiosInstance.get("/admin/announcements"),
  getReports: () => axiosInstance.get("/admin/reports"),
  closeReport: (reportId: string) => axiosInstance.post(`/admin/reports/${reportId}/close`),
}

export default axiosInstance

