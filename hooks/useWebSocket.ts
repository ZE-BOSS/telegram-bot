"use client"

import { useEffect, useRef, useState } from "react"
import { apiClient } from "@/lib/api-client"

interface WebSocketMessage {
    type: string
    [key: string]: any
}

export function useWebSocket() {
    const [isConnected, setIsConnected] = useState(false)
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
    const wsRef = useRef<WebSocket | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

    useEffect(() => {
        const connect = () => {
            const token = apiClient.getToken()
            if (!token) return

            // Use WS protocol based on current location protocol (ws/wss) or env
            const constApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
            const wsUrl = constApiUrl.replace("http", "ws").replace("/api", "/ws")

            const ws = new WebSocket(`${wsUrl}?token=${token}`)

            ws.onopen = () => {
                console.log("WebSocket Connected")
                setIsConnected(true)
            }

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data)
                    setLastMessage(message)
                } catch (e) {
                    console.error("WS Parse Error:", e)
                }
            }

            ws.onclose = () => {
                console.log("WebSocket Disconnected")
                setIsConnected(false)
                // Reconnect after delay
                reconnectTimeoutRef.current = setTimeout(connect, 3000)
            }

            ws.onerror = (error) => {
                console.error("WebSocket Error:", error)
                ws.close()
            }

            wsRef.current = ws
        }

        connect()

        return () => {
            if (wsRef.current) {
                wsRef.current.close()
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
        }
    }, [])

    return { isConnected, lastMessage }
}
