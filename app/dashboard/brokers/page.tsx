"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Trash2, Lock, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

interface Broker {
  id: string
  broker_name: string
  login: string
  server: string
  created_at: string
}

export default function BrokersPage() {
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({ brokerName: "", server: "", login: "", password: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchBrokers()
  }, [])

  const fetchBrokers = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await apiClient.getBrokers()
      if (error) {
        setError(error)
      } else {
        setBrokers((data as any) || [])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const { data, error } = await apiClient.createBroker(formData.brokerName, formData.login, formData.server)

      if (error) {
        setError(error)
      } else {
        // Store password credential
        if (formData.password) {
          const brokerId = (data as any)?.id
          if (brokerId) {
            await apiClient.storeCredential(brokerId, "mt5_password", formData.password)
          }
        }
        setFormData({ brokerName: "", server: "", login: "", password: "" })
        setError(null)
        await fetchBrokers()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (brokerId: string) => {
    try {
      const { error } = await apiClient.deleteBroker(brokerId)
      if (error) {
        setError(error)
      } else {
        await fetchBrokers()
      }
    } catch (err) {
      setError("Failed to delete broker")
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Broker Configuration</h1>
            <p className="text-muted-foreground mt-1">Manage your MT5 broker connections</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Connected Brokers</CardTitle>
            <CardDescription>Your active broker accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading brokers...</div>
            ) : brokers.length === 0 ? (
              <div className="text-center text-muted-foreground">No brokers connected</div>
            ) : (
              <div className="space-y-3">
                {brokers.map((broker) => (
                  <div
                    key={broker.id}
                    className="p-4 border border-border/50 rounded-lg hover:border-border/80 transition"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Lock className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{broker.broker_name}</div>
                          <div className="text-xs text-muted-foreground">Account: {broker.login}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-3 border-t border-border/20">
                      <Button variant="destructive" size="sm" className="gap-2" onClick={() => handleDelete(broker.id)}>
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Broker Form */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Add New Broker</CardTitle>
            <CardDescription>Connect your MT5 account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Broker Name</label>
                  <Input
                    placeholder="IC Markets, Exness, etc."
                    value={formData.brokerName}
                    onChange={(e) => setFormData({ ...formData, brokerName: e.target.value })}
                    className="bg-input border-border/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Server</label>
                  <Input
                    placeholder="Server address"
                    value={formData.server}
                    onChange={(e) => setFormData({ ...formData, server: e.target.value })}
                    className="bg-input border-border/50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Login</label>
                  <Input
                    placeholder="Your MT5 login"
                    value={formData.login}
                    onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                    className="bg-input border-border/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Password</label>
                  <Input
                    type="password"
                    placeholder="Your MT5 password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-input border-border/50"
                    required
                  />
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-blue-600" disabled={isSubmitting}>
                {isSubmitting ? "Connecting..." : "Connect Broker"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
