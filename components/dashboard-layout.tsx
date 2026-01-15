"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import {
  BarChart3,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Zap,
  MessageSquare,
  LayoutDashboard,
  Bell,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Positions", href: "/dashboard/positions", icon: TrendingUp },
  { name: "Signals", href: "/dashboard/signals", icon: Zap },
  { name: "Channels", href: "/dashboard/channels", icon: MessageSquare },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Brokers", href: "/dashboard/brokers", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"
          } bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!sidebarOpen && "justify-center w-full"}`}>
            <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-sidebar-primary-foreground">T</span>
            </div>
            {sidebarOpen && <span className="font-bold text-sidebar-foreground text-sm">Trading</span>}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/20"
                    } ${!sidebarOpen && "justify-center px-0"}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.name}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-2">
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent/20 ${!sidebarOpen && "justify-center px-0"
              }`}
            disabled
          >
            <User className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-xs truncate">{user?.email}</span>}
          </Button>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`w-full justify-start gap-3 text-destructive hover:bg-destructive/10 ${!sidebarOpen && "justify-center px-0"
              }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-sidebar-foreground hover:bg-sidebar-accent/20"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
