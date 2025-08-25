"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "@/lib/api"
import { useStore } from "@/store/useStore"

interface User {
  id: string
  username: string
  email: string
  first_name?: string
  last_name?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (userData: { username: string; email: string; password: string; first_name?: string; last_name?: string }) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  refreshToken?: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const { user, token, refreshToken, setUser, clearAuth } = useStore()

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem("blog-user")
    const storedToken = localStorage.getItem("blog-token")
    const storedRefreshToken = localStorage.getItem("blog-refresh-token")
    
    if (storedUser && storedToken && storedRefreshToken) {
      setUser(JSON.parse(storedUser), storedToken, storedRefreshToken)
    }
    setIsLoading(false)
  }, [setUser])

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    console.log("Attempting login with username:", username);
    try {
      const response = await authAPI.login(username, password)
      console.log("Login response:", response);
      const { access_token, refresh_token, user: userData } = response.data
      
      // Store tokens and user data in both localStorage and Zustand store
      localStorage.setItem("blog-token", access_token)
      localStorage.setItem("blog-refresh-token", refresh_token)
      localStorage.setItem("blog-user", JSON.stringify(userData))
      setUser(userData, access_token, refresh_token)
      setIsLoading(false)
      return true
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return false
    }
  }

  const signup = async (userData: { username: string; email: string; password: string; first_name?: string; last_name?: string }): Promise<boolean> => {
    setIsLoading(true)
    console.log("Attempting signup with data:", userData);
    try {
      const response = await authAPI.register(userData)
      console.log("Signup response:", response);
      const { access_token, refresh_token, user: newUser } = response.data
      
      // Store tokens and user data in both localStorage and Zustand store
      localStorage.setItem("blog-token", access_token)
      localStorage.setItem("blog-refresh-token", refresh_token)
      localStorage.setItem("blog-user", JSON.stringify(newUser))
      setUser(newUser, access_token, refresh_token)
      setIsLoading(false)
      return true
    } catch (error: any) {
      console.error("Signup error:", error)
      if (error.response && error.response.data) {
        console.error("Backend error data:", error.response.data);
      }
      setIsLoading(false)
      return false
    }
  }

  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout()
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear auth data from both localStorage and Zustand store
      clearAuth()
      localStorage.removeItem("blog-user")
      localStorage.removeItem("blog-token")
      localStorage.removeItem("blog-refresh-token")
    }
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading, refreshToken }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
