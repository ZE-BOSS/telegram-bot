"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState("")
  const { login, register, isLoading, error } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSignUp) {
      await register(email, password, username)
    } else {
      await login(email, password)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary mb-4">
            <span className="text-lg font-bold text-primary-foreground">T</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Trading Signals</h1>
          <p className="text-sm text-muted-foreground mt-2">Automated signal execution platform</p>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>{isSignUp ? "Create Account" : "Sign In"}</CardTitle>
            <CardDescription>
              {isSignUp ? "Create a new account to get started" : "Enter your credentials to access the platform"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {isSignUp && (
                <div>
                  <label htmlFor="username" className="text-sm font-medium text-foreground block mb-2">
                    Username
                  </label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your_username"
                    className="bg-input border-border/50"
                    required={isSignUp}
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="text-sm font-medium text-foreground block mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-input border-border/50"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-medium text-foreground block mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-input border-border/50"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-blue-600 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline">
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
