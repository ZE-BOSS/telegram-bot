"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"

interface User {
  id: string
  email: string
  username: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = apiClient.getToken()
    if (token) {
      // User is already logged in
      const userStr = localStorage.getItem("user")
      if (userStr) {
        setUser(JSON.parse(userStr))
      }
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const { data, error } = await apiClient.login(email, password)
        if (error) {
          setError(error)
          return false
        }

        const authData = data as any
        apiClient.setToken(authData.access_token)
        const userData = { id: authData.user_id, email, username: authData.username }
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))

        router.push("/dashboard")
        return true
      } finally {
        setIsLoading(false)
      }
    },
    [router],
  )

  const register = useCallback(
    async (email: string, password: string, username: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const { data, error } = await apiClient.register(email, password, username)
        if (error) {
          setError(error)
          return false
        }

        const authData = data as any
        apiClient.setToken(authData.access_token)
        const userData = { id: authData.user_id, email, username }
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))

        router.push("/dashboard")
        return true
      } finally {
        setIsLoading(false)
      }
    },
    [router],
  )

  const logout = useCallback(() => {
    apiClient.clearToken()
    setUser(null)
    localStorage.removeItem("user")
    router.push("/")
  }, [router])

  return { user, isLoading, error, login, register, logout }
}
