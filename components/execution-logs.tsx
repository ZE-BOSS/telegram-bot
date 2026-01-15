"use client"

import { useEffect, useState, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface LogEntry {
    timestamp: string
    message: string
    type: "info" | "error" | "success" | "warning"
    executionId?: string
}

interface ExecutionLogsProps {
    logs: LogEntry[]
}

export function ExecutionLogs({ logs }: ExecutionLogsProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Auto-scroll to bottom
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [logs])

    return (
        <Card className="h-[300px] flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Live Execution Logs</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full px-4 pb-4" ref={scrollRef}>
                    <div className="space-y-2 text-sm font-mono">
                        {logs.length === 0 && (
                            <div className="text-muted-foreground text-center py-8">
                                No execution logs yet...
                            </div>
                        )}
                        {logs.map((log, i) => (
                            <div key={i} className="flex items-start gap-2 border-b border-border/50 pb-1 last:border-0 hover:bg-muted/50 transition-colors p-1 rounded-sm">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                                <div className="flex-1 break-words">
                                    {log.executionId && (
                                        <Badge variant="outline" className="mr-2 text-[10px] h-4 px-1">
                                            {log.executionId.slice(0, 6)}
                                        </Badge>
                                    )}
                                    <span className={
                                        log.type === "error" ? "text-red-500" :
                                            log.type === "success" ? "text-green-500" :
                                                log.type === "warning" ? "text-yellow-500" :
                                                    "text-foreground"
                                    }>
                                        {log.message}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
