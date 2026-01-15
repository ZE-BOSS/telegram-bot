"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TrendingUp, Activity, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export default function DashboardPage() {
  const [executions, setExecutions] = useState<any[]>([])
  const [signals, setSignals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [execRes, sigRes] = await Promise.all([apiClient.getExecutions(5), apiClient.getSignals(5)])

        setExecutions((execRes.data as any) || [])
        setSignals((sigRes.data as any) || [])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalPnL = executions.reduce((sum, ex) => sum + (ex.profit_loss || 0), 0)
  const activePositions = executions.filter((ex) => !ex.close_time).length
  const recentSignals = signals.slice(0, 3)

  const stats = [
    {
      title: "Active Positions",
      value: activePositions.toString(),
      description: "Currently open trades",
      icon: Activity,
      color: "text-blue-500",
    },
    {
      title: "Total P&L",
      value: `$${totalPnL.toFixed(2)}`,
      description: "All time performance",
      icon: TrendingUp,
      color: totalPnL >= 0 ? "text-green-500" : "text-red-500",
    },
    {
      title: "Alerts",
      value: signals.length.toString(),
      description: "Pending signals",
      icon: AlertCircle,
      color: "text-yellow-500",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back to your trading platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="border-border/50 bg-card/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-foreground">{stat.title}</CardTitle>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent Executions */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
            <CardDescription>Your latest executed positions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading...</div>
            ) : executions.length === 0 ? (
              <div className="text-center text-muted-foreground">No trades yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border/50">
                    <tr className="text-muted-foreground text-xs">
                      <th className="text-left py-3 px-3">Symbol</th>
                      <th className="text-left py-3 px-3">Type</th>
                      <th className="text-right py-3 px-3">Entry</th>
                      <th className="text-right py-3 px-3">Current</th>
                      <th className="text-right py-3 px-3">P&L</th>
                      <th className="text-left py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executions.slice(0, 5).map((exec) => (
                      <tr key={exec.id} className="border-b border-border/20 hover:bg-card/50">
                        <td className="py-3 px-3 text-foreground font-medium">{exec.symbol}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              exec.side === "buy" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {exec.side?.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-foreground">{exec.entry_price?.toFixed(5)}</td>
                        <td className="py-3 px-3 text-right text-foreground">
                          {exec.actual_entry_price?.toFixed(5) || "-"}
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-medium ${exec.profit_loss >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {exec.profit_loss >= 0 ? "+" : ""}
                          {exec.profit_loss?.toFixed(2)}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">
                            {exec.execution_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
