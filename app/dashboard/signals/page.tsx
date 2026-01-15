"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CheckCircle, XCircle, Clock, AlertCircle, PlayCircle, Edit } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useWebSocket } from "@/hooks/useWebSocket"
import { ExecutionLogs } from "@/components/execution-logs"
import { SignalEditDialog } from "@/components/signal-edit-dialog"
import { toast } from "sonner"

interface Signal {
  id: string
  symbol: string
  signal_type: string
  entry_price?: number
  entry_range?: number[]
  stop_loss?: number
  take_profit?: number
  take_profits?: number[]
  confidence_score?: number
  raw_message: string
  status: string
  received_at: string
  processed_at?: string
}

interface Execution {
  execution_id: string
  signal_id: string
  status: string
  symbol: string
  side: string
  entry_price?: number
  stop_loss?: number
  take_profit?: number
  ticket: number | null
  profit_loss: number | null
  actual_entry_price?: number
  executed_at: string | null
}

interface SystemStatus {
  status: "running" | "stopped" | "error"
  pid: number | null
  message?: string
}

interface LogEntry {
  timestamp: string
  message: string
  type: "info" | "error" | "success" | "warning"
  executionId?: string
}

export default function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [executions, setExecutions] = useState<Execution[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({ status: "stopped", pid: null })
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Edit Dialog State
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null)
  const [selectedSignalData, setSelectedSignalData] = useState<any>(null)

  // WebSocket
  const { isConnected, lastMessage } = useWebSocket()

  const fetchStatus = async () => {
    const { data } = await apiClient.getSystemStatus()
    if (data) setSystemStatus(data as SystemStatus)
  }

  const toggleSystem = async () => {
    setProcessing(true)
    if (systemStatus.status === "running") {
      await apiClient.stopSystem()
    } else {
      await apiClient.startSystem()
    }
    // Wait a bit for process to start/stop
    setTimeout(async () => {
      await fetchStatus()
      setProcessing(false)
    }, 2000)
  }

  useEffect(() => {
    fetchSignals()
    fetchExecutions()
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  // Handle WebSocket Messages
  useEffect(() => {
    // Request notification permission on mount
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === "signal_received") {
        const msg = `New Signal: ${lastMessage.signal.symbol} ${lastMessage.signal.signal_type.toUpperCase()}`
        addLog(msg, "info")
        toast.info(msg, {
          description: `Price: ${lastMessage.signal.entry_price || 'Market'}`,
          action: {
            label: "View",
            onClick: () => fetchSignals()
          }
        })

        if (Notification.permission === "granted") {
          new Notification("New Trading Signal", { body: msg })
        }

        fetchSignals()
      } else if (lastMessage.type === "telegram_message") {
        addLog(
          `Telegram: ${lastMessage.text}`,
          "info"
        )
      } else if (lastMessage.type === "signal_approval_required") {
        const msg = `Approval Required: ${lastMessage.symbol} ${lastMessage.side.toUpperCase()}`
        addLog(msg, "warning", lastMessage.execution_id)
        toast.warning(msg, {
          description: `TP: ${lastMessage.take_profit || 'N/A'}`,
          duration: 10000,
        })

        if (Notification.permission === "granted") {
          new Notification("Trade Approval Required", { body: msg })
        }

        fetchExecutions()
      } else if (lastMessage.type === "signal_update") {
        fetchSignals()
      } else if (lastMessage.type === "execution_confirmed") {
        addLog(`Execution confirmed: ${lastMessage.status}`, "success", lastMessage.execution_id)
        fetchExecutions()
      } else if (lastMessage.type === "execution_update") {
        addLog(`Execution update: ${lastMessage.symbol || ''} ${lastMessage.status}`, "info", lastMessage.execution_id)
        fetchExecutions()
        fetchSignals() // Status might change in signals list too
      } else if (lastMessage.type === "error") {
        addLog(`Error: ${lastMessage.message}`, "error", lastMessage.execution_id)
        fetchExecutions()
      } else if (lastMessage.type === "position_update") {
        updateExecutionState(lastMessage.execution_id, { profit_loss: lastMessage.profit_loss })
      } else if (lastMessage.type === "position_closed") {
        addLog(`Position closed: ${lastMessage.execution_id.slice(0, 8)}, P&L: ${lastMessage.profit_loss}`, "success")
        fetchExecutions()
      } else if (lastMessage.type === "log") {
        addLog(lastMessage.message, lastMessage.level || "info", lastMessage.execution_id)
      }
    }
  }, [lastMessage])

  const addLog = (message: string, type: "info" | "error" | "success" | "warning" = "info", executionId?: string) => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toISOString(),
      message,
      type,
      executionId
    }])
  }

  const updateExecutionState = (executionId: string, updates: Partial<Execution>) => {
    setExecutions(prev => prev.map(ex => ex.execution_id === executionId ? { ...ex, ...updates } : ex))
  }


  const fetchSignals = async () => {
    try {
      const { data, error } = await apiClient.getSignals()
      if (error) {
        setError(error)
      } else {
        setSignals((data as any) || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchExecutions = async () => {
    try {
      const { data } = await apiClient.getExecutions()
      if (data) setExecutions(data as any)
      setIsLoading(false)
    } catch (e) {
      console.error(e)
    }
  }

  const handleReject = async (executionId: string) => {
    if (!confirm("Are you sure you want to reject this signal?")) return
    try {
      const { error } = await apiClient.rejectExecution(executionId)
      if (error) {
        addLog("Failed to reject signal: " + error, "error")
      } else {
        addLog("Signal rejected", "info")
        fetchExecutions()
      }
    } catch (e) {
      addLog("Failed to reject signal", "error")
    }
  }

  const handleClose = async (executionId: string) => {
    if (!confirm("Are you sure you want to close this position?")) return
    try {
      addLog("Closing position...", "info", executionId)
      const { error } = await apiClient.closePosition(executionId)
      if (error) {
        addLog("Failed to close position: " + error, "error")
      } else {
        addLog("Close order sent", "success")
        fetchExecutions()
      }
    } catch (e) {
      addLog("Failed to close position", "error")
    }
  }

  const handleApproveClick = (execution: Execution) => {
    // Find original signal data for defaults
    // We might need to fetch detailed execution to get SL/TP if not in list
    // For now, simplify
    const signal = signals.find(s => s.id === execution.signal_id)

    setSelectedExecutionId(execution.execution_id)
    setSelectedSignalData({
      symbol: execution.symbol,
      side: execution.side,
      entry_price: signal?.entry_price,
      stop_loss: signal?.stop_loss,
      take_profit: signal?.take_profit
    })
    setEditDialogOpen(true)
  }

  const executedCount = signals.filter((s) => s.processed_at).length
  const pendingCount = executions.filter((e) => e.status === "pending_approval").length
  const failedCount = signals.filter((s) => !s.symbol).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Trading Signals</h1>
            <p className="text-muted-foreground mt-1">Signal history and execution status</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-muted-foreground">{isConnected ? 'Live' : 'Disconnected'}</span>
          </div>
        </div>

        {/* System Control Panel */}
        <Card className={systemStatus.status === "running" ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>Listener Status</CardTitle>
              <CardDescription>
                {systemStatus.status === "running"
                  ? `Running (PID: ${systemStatus.pid})`
                  : "Stopped"}
              </CardDescription>
            </div>
            <Button
              variant={systemStatus.status === "running" ? "destructive" : "default"}
              onClick={toggleSystem}
              disabled={processing}
            >
              {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {systemStatus.status === "running" ? "Stop Listener" : "Start Listener"}
            </Button>
          </CardHeader>
        </Card>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Executed</CardTitle>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{executedCount}</div>
              <p className="text-xs text-muted-foreground">Processed signals</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="w-5 h-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Invalid</CardTitle>
              <XCircle className="w-5 h-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{failedCount}</div>
              <p className="text-xs text-muted-foreground">Parse errors</p>
            </CardContent>
          </Card>
        </div>

        {/* Execution Logs Panel */}
        <ExecutionLogs logs={logs} />

        {/* Pending Approvals List */}
        {pendingCount > 0 && (
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="text-yellow-500">Action Required</CardTitle>
              <CardDescription>Signals waiting for your approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executions.filter(e => e.status === "pending_approval").map(execution => (
                  <div key={execution.execution_id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-background">
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        {execution.symbol}
                        <span className={`text-xs px-2 py-0.5 rounded ${execution.side === 'buy' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {execution.side.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        TP: {execution.take_profit?.toFixed(5) || "N/A"} | ID: {execution.execution_id.slice(0, 8)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-red-400 border-red-500/30 hover:bg-red-500/10" onClick={() => handleReject(execution.execution_id)}>
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => handleApproveClick(execution)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Review & Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Positions List */}
        {executions.filter(e => e.status === "executed").length > 0 && (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader>
              <CardTitle className="text-green-500">Active Positions</CardTitle>
              <CardDescription>Trades currently open in MT5</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executions.filter(e => e.status === "executed").map(execution => (
                  <div key={execution.execution_id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-background">
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        {execution.symbol}
                        <span className={`text-xs px-2 py-0.5 rounded ${execution.side === 'buy' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {execution.side.toUpperCase()}
                        </span>
                        <span className={`text-sm font-bold ml-4 ${execution.profit_loss && execution.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {execution.profit_loss !== null ? `${execution.profit_loss >= 0 ? '+' : ''}${execution.profit_loss.toFixed(2)} USD` : 'Calculating...'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Entry: {execution.actual_entry_price?.toFixed(5)} | SL: {execution.stop_loss?.toFixed(5)} | TP: {execution.take_profit?.toFixed(5)}
                      </div>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => handleClose(execution.execution_id)}>
                      Close Position
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}


        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Signal History</CardTitle>
            <CardDescription>Recent trading signals</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading signals...</div>
            ) : signals.length === 0 ? (
              <div className="text-center text-muted-foreground">No signals received yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border/50">
                    <tr className="text-muted-foreground text-xs">
                      <th className="text-left py-3 px-3">Symbol</th>
                      <th className="text-left py-3 px-3">Type</th>
                      <th className="text-right py-3 px-3">Entry</th>
                      <th className="text-right py-3 px-3">SL</th>
                      <th className="text-right py-3 px-3">TP</th>
                      <th className="text-left py-3 px-3">Original Message</th>
                      <th className="text-right py-3 px-3">Confidence</th>
                      <th className="text-left py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {signals.map((signal) => (
                      <tr key={signal.id} className="border-b border-border/20 hover:bg-card/50">
                        <td className="py-3 px-3 text-foreground font-medium">{signal.symbol || "-"}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${signal.signal_type === "buy"
                              ? "bg-green-500/20 text-green-400"
                              : signal.signal_type === "sell"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-gray-500/20 text-gray-400"
                              }`}
                          >
                            {signal.signal_type || "-"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-foreground">
                          {signal.entry_range && signal.entry_range.length === 2
                            ? `${signal.entry_range[0].toFixed(5)} - ${signal.entry_range[1].toFixed(5)}`
                            : signal.entry_price?.toFixed(5) || "-"}
                        </td>
                        <td className="py-3 px-3 text-right text-foreground">{signal.stop_loss?.toFixed(5) || "-"}</td>
                        <td className="py-3 px-3 text-right text-foreground">
                          {signal.take_profits && signal.take_profits.length > 0
                            ? signal.take_profits.map(tp => tp.toFixed(5)).join(", ")
                            : signal.take_profit?.toFixed(5) || "-"}
                        </td>
                        <td className="py-3 px-3 text-left">
                          <div className="max-w-[200px] truncate text-xs text-muted-foreground italic" title={signal.raw_message}>
                            {signal.raw_message}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right text-foreground">
                          {signal.confidence_score ? `${(signal.confidence_score * 100).toFixed(0)}%` : "-"}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${signal.status === "rejected" ? "bg-red-500/20 text-red-400" :
                              signal.status === "processed" ? "bg-green-500/20 text-green-400" :
                                "bg-yellow-500/20 text-yellow-400"
                              }`}
                          >
                            {signal.status ? signal.status.charAt(0).toUpperCase() + signal.status.slice(1) : "Pending"}
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

      {selectedExecutionId && selectedSignalData && (
        <SignalEditDialog
          isOpen={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          executionId={selectedExecutionId}
          signalData={selectedSignalData}
          onConfirmed={() => {
            addLog("Approved execution " + selectedExecutionId, "success")
            fetchExecutions()
          }}
        />
      )}
    </DashboardLayout>
  )
}
