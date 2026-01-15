"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard-layout"
import { X, Edit, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

interface Position {
  id: string
  symbol: string
  side: string
  entry_price: number
  actual_entry_price: number | null
  stop_loss: number | null
  take_profit: number | null
  profit_loss: number | null
  executed_at: string | null
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [closingId, setClosingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPositions()
  }, [])

  const fetchPositions = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await apiClient.getExecutions()
      if (error) {
        setError(error)
      } else {
        setPositions((data as any) || [])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = async (positionId: string) => {
    setClosingId(positionId)
    try {
      const { error } = await apiClient.closePosition(positionId)
      if (error) {
        setError(error)
      } else {
        await fetchPositions()
      }
    } finally {
      setClosingId(null)
    }
  }

  const totalPnL = positions.reduce((sum, pos) => sum + (pos.profit_loss || 0), 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Positions</h1>
          <p className="text-muted-foreground mt-1">Manage your active trading positions</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Open Positions</CardTitle>
                <CardDescription>Currently active trades</CardDescription>
              </div>
              <div className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
                {totalPnL >= 0 ? "+" : ""}
                {totalPnL?.toFixed(2) || "0.00"}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading positions...</div>
            ) : positions.length === 0 ? (
              <div className="text-center text-muted-foreground">No open positions</div>
            ) : (
              <div className="space-y-3">
                {positions.map((pos) => (
                  <div
                    key={pos.id}
                    className="p-4 border border-border/50 rounded-lg hover:border-border/80 transition"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-bold text-foreground">{pos.symbol}</div>
                          <div className="text-xs text-muted-foreground">{pos.executed_at}</div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            pos.side === "buy" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {pos.side.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${pos.profit_loss && pos.profit_loss >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {pos.profit_loss ? `${pos.profit_loss >= 0 ? "+" : ""}${pos.profit_loss.toFixed(2)}` : "-"}
                        </div>
                        <div className="text-xs text-muted-foreground">P&L</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-3 py-3 border-t border-b border-border/20">
                      <div>
                        <div className="text-xs text-muted-foreground">Entry</div>
                        <div className="text-sm font-medium text-foreground">{pos.entry_price?.toFixed(5)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Current</div>
                        <div className="text-sm font-medium text-foreground">
                          {pos.actual_entry_price?.toFixed(5) || "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">SL</div>
                        <div className="text-sm font-medium text-foreground">{pos.stop_loss?.toFixed(5) || "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">TP</div>
                        <div className="text-sm font-medium text-foreground">{pos.take_profit?.toFixed(5) || "-"}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Edit className="w-4 h-4" />
                        Modify
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleClose(pos.id)}
                        disabled={closingId === pos.id}
                      >
                        <X className="w-4 h-4" />
                        {closingId === pos.id ? "Closing..." : "Close"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
