"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"

interface SignalEditDialogProps {
    isOpen: boolean
    onClose: () => void
    executionId: string
    signalData: {
        symbol: string
        side: string
        entry_price?: number
        stop_loss?: number
        take_profit?: number
    }
    onConfirmed: () => void
}

export function SignalEditDialog({
    isOpen,
    onClose,
    executionId,
    signalData,
    onConfirmed,
}: SignalEditDialogProps) {
    const [entryPrice, setEntryPrice] = useState(signalData.entry_price?.toString() || "")
    const [stopLoss, setStopLoss] = useState(signalData.stop_loss?.toString() || "")
    const [takeProfit, setTakeProfit] = useState(signalData.take_profit?.toString() || "")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleConfirm = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const result = await apiClient.confirmExecution(executionId, {
                stop_loss: stopLoss ? parseFloat(stopLoss) : undefined,
                take_profit: takeProfit ? parseFloat(takeProfit) : undefined,
                // Entry price is not yet editable in backend for *modification* but we might add it later
                // or re-trigger logic. For now, confirmExecution only takes SL/TP in interface but let's assume valid
            })

            if (result.error) {
                setError(result.error)
            } else {
                onConfirmed()
                onClose()
            }
        } catch (err) {
            setError("Failed to confirm execution")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Approve Signal Execution</DialogTitle>
                    <DialogDescription>
                        Review and adjust order parameters for {signalData.symbol} ({signalData.side}).
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="entry" className="text-right">
                            Entry
                        </Label>
                        <Input
                            id="entry"
                            value={entryPrice}
                            onChange={(e) => setEntryPrice(e.target.value)}
                            className="col-span-3"
                            disabled // Entry price editing complexity for market orders vs pending
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sl" className="text-right">
                            Stop Loss
                        </Label>
                        <Input
                            id="sl"
                            value={stopLoss}
                            onChange={(e) => setStopLoss(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tp" className="text-right">
                            Take Profit
                        </Label>
                        <Input
                            id="tp"
                            value={takeProfit}
                            onChange={(e) => setTakeProfit(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? "Confirming..." : "Approve & Execute"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
