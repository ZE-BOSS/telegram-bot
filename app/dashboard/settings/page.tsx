"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Save, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast" // Assuming useToast exists or I should use alert/state

interface UserPreferences {
  manual_approval: boolean
  risk_per_trade: string
  max_slippage: string
  default_stop_loss_pips: number
  use_limit_orders: boolean
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [preferences, setPreferences] = useState({
    manual_approval: true,
    risk_per_trade: 1.0,
    max_slippage: 5.0,
    default_stop_loss_pips: 20,
    use_limit_orders: true
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data } = await apiClient.getSettings()
      if (data) {
        const prefs = data as unknown as UserPreferences
        setPreferences({
          manual_approval: prefs.manual_approval,
          risk_per_trade: parseFloat(prefs.risk_per_trade),
          max_slippage: parseFloat(prefs.max_slippage),
          default_stop_loss_pips: prefs.default_stop_loss_pips,
          use_limit_orders: prefs.use_limit_orders
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setFetching(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiClient.updateSettings(preferences)
      // Show success feedback
      alert("Settings saved successfully")
    } catch (e) {
      console.error(e)
      alert("Failed to save settings")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and trading preferences</p>
        </div>

        {/* Trading Preferences */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Trading Preferences</CardTitle>
            <CardDescription>Configure risk management and execution logic</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">

              <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg bg-background/50">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="manual-approval" className="font-medium">Manual Approval Mode</Label>
                  <span className="text-xs text-muted-foreground">Require approval before executing signals</span>
                </div>
                <Switch
                  id="manual-approval"
                  checked={preferences.manual_approval}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, manual_approval: checked })}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg bg-background/50">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="limit-orders" className="font-medium">Use Limit Order Fallback</Label>
                  <span className="text-xs text-muted-foreground">Place limit orders if price gap exceeds slippage</span>
                </div>
                <Switch
                  id="limit-orders"
                  checked={preferences.use_limit_orders}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, use_limit_orders: checked })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Risk per Trade (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={preferences.risk_per_trade}
                    onChange={(e) => setPreferences({ ...preferences, risk_per_trade: parseFloat(e.target.value) })}
                    className="bg-input border-border/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Max Slippage (Pips)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={preferences.max_slippage}
                    onChange={(e) => setPreferences({ ...preferences, max_slippage: parseFloat(e.target.value) })}
                    className="bg-input border-border/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Default Stop Loss (Pips)</label>
                  <Input
                    type="number"
                    value={preferences.default_stop_loss_pips}
                    onChange={(e) => setPreferences({ ...preferences, default_stop_loss_pips: parseInt(e.target.value) })}
                    className="bg-input border-border/50"
                  />
                </div>
              </div>

              <Button type="submit" className="bg-primary hover:bg-blue-600 gap-2 w-full" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Preferences
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
