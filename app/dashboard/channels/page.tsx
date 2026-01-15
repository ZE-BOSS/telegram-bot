"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MessageSquare, Trash2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

interface Channel {
  id: string
  channel_name: string
  channel_id: number
  is_active: boolean
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({ channelName: "", channelId: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchChannels()
  }, [])

  const fetchChannels = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await apiClient.getTelegramChannels()
      if (error) {
        setError(error)
      } else {
        setChannels((data as any) || [])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const { error } = await apiClient.createTelegramChannel(Number(formData.channelId), formData.channelName)

      if (error) {
        setError(error)
      } else {
        setFormData({ channelName: "", channelId: "" })
        setError(null)
        await fetchChannels()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (channelId: string) => {
    try {
      const { error } = await apiClient.deleteTelegramChannel(channelId)
      if (error) {
        setError(error)
      } else {
        await fetchChannels()
      }
    } catch (err) {
      setError("Failed to delete channel")
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Telegram Channels</h1>
            <p className="text-muted-foreground mt-1">Manage signal source channels</p>
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
            <CardTitle>Active Channels</CardTitle>
            <CardDescription>Your connected signal channels</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading channels...</div>
            ) : channels.length === 0 ? (
              <div className="text-center text-muted-foreground">No channels added</div>
            ) : (
              <div className="space-y-3">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className="p-4 border border-border/50 rounded-lg hover:border-border/80 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-foreground">{channel.channel_name}</div>
                          <div className="text-xs text-muted-foreground">ID: {channel.channel_id}</div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleDelete(channel.id)}
                      >
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

        {/* Add Channel Form */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Add New Channel</CardTitle>
            <CardDescription>Subscribe to a Telegram channel for signals</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Channel Name</label>
                  <Input
                    placeholder="Channel display name"
                    value={formData.channelName}
                    onChange={(e) => setFormData({ ...formData, channelName: e.target.value })}
                    className="bg-input border-border/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Channel ID</label>
                  <Input
                    placeholder="Telegram channel ID"
                    value={formData.channelId}
                    onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
                    className="bg-input border-border/50"
                    required
                    type="number"
                  />
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-blue-600" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Channel"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
