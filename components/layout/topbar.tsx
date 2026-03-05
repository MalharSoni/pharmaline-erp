"use client"

import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface TopbarProps {
  title: string
  action?: React.ReactNode
}

export function Topbar({ title, action }: TopbarProps) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <h2 className="text-[22px] font-[800] text-gray-900 leading-tight">
        {title}
      </h2>

      <div className="flex items-center gap-6">
        {/* Action Button (e.g., New Order) */}
        {action && <div>{action}</div>}
        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search POs, products..."
            className="pl-10 bg-gray-100 border-none focus-visible:ring-primary/50"
          />
        </div>

        {/* Notifications */}
        <button className="relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center bg-red-500 text-white text-[10px]">
            7
          </Badge>
        </button>

        {/* User Avatar */}
        <Avatar className="w-9 h-9">
          <AvatarFallback className="bg-primary text-white font-bold text-sm">
            VP
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
