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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const { user, token, setUser, clearAuth } = useStore()

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem("blog-user")
    const storedToken = localStorage.getItem("blog-token")
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser), storedToken)
    }
    setIsLoading(false)
  }, [setUser])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await authAPI.login(email, password)
      const { token, user: userData } = response.data
      
      // Store token and user data in both localStorage and Zustand store
      localStorage.setItem("blog-token", token)
      localStorage.setItem("blog-user", JSON.stringify(userData))
      setUser(userData, token)
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
    try {
      const response = await authAPI.register(userData)
      const { token, user: newUser } = response.data
      
      // Store token and user data in both localStorage and Zustand store
      localStorage.setItem("blog-token", token)
      localStorage.setItem("blog-user", JSON.stringify(newUser))
      setUser(newUser, token)
      setIsLoading(false)
      return true
    } catch (error) {
      console.error("Signup error:", error)
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
    }
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
