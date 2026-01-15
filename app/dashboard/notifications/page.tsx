"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Loader2, Trash2, Plus, Bell } from "lucide-react"

interface Subscriber {
    id: string
    telegram_id: string
    name: string
    is_active: boolean
}

export default function NotificationsPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([])
    const [loading, setLoading] = useState(true)
    const [newName, setNewName] = useState("")
    const [newId, setNewId] = useState("")
    const [adding, setAdding] = useState(false)

    const fetchSubscribers = async () => {
        setLoading(true)
        const { data } = await apiClient.getSubscribers()
        if (data) setSubscribers(data as Subscriber[])
        setLoading(false)
    }

    useEffect(() => {
        fetchSubscribers()
    }, [])

    const handleAdd = async () => {
        if (!newId) return
        setAdding(true)
        const { data, error } = await apiClient.addSubscriber(newId, newName)
        if (data) {
            setNewName("")
            setNewId("")
            fetchSubscribers()
        } else {
            alert(error || "Failed to add subscriber")
        }
        setAdding(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return
        await apiClient.deleteSubscriber(id)
        fetchSubscribers()
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                        <p className="text-muted-foreground">Manage Telegram accounts that receive signals.</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Subscriber</CardTitle>
                            <CardDescription>Link a new Telegram account or Group ID.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name (Optional)</label>
                                <Input
                                    placeholder="e.g. My Phone, Client Group"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Telegram ID</label>
                                <Input
                                    placeholder="e.g. 123456789"
                                    value={newId}
                                    onChange={(e) => setNewId(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Get your ID from @userinfobot on Telegram.
                                </p>
                            </div>
                            <Button onClick={handleAdd} disabled={adding || !newId} className="w-full">
                                {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                Add Subscriber
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Active Subscribers</CardTitle>
                            <CardDescription>Signals will be forwarded to these accounts.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : subscribers.length === 0 ? (
                                <div className="text-center p-4 text-muted-foreground">
                                    No subscribers found.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {subscribers.map((sub) => (
                                        <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-primary/10 rounded-full">
                                                    <Bell className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{sub.name || "Unnamed"}</p>
                                                    <p className="text-xs text-muted-foreground">{sub.telegram_id}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(sub.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
