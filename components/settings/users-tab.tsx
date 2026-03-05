"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserPlus } from "lucide-react"
import type { User } from "@/app/actions/settings"
import { toast } from "sonner"

interface UsersTabProps {
  users: User[]
}

export function UsersTab({ users }: UsersTabProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "EMPLOYEE" as "ADMIN" | "EMPLOYEE",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Call createUser action
    toast.success("User created successfully")
    setOpen(false)
    setFormData({ name: "", email: "", role: "EMPLOYEE" })
  }

  const getStatusBadge = (status: "ACTIVE" | "INACTIVE") => {
    return (
      <Badge
        className={`text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1 ${
          status === "ACTIVE"
            ? "bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]"
            : "bg-[#F5F5F5] text-[#737373] border border-[#D4D4D4]"
        }`}
      >
        {status}
      </Badge>
    )
  }

  const getRoleBadge = (role: "ADMIN" | "EMPLOYEE") => {
    return (
      <Badge
        className={`text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1 ${
          role === "ADMIN"
            ? "bg-[#E8F1F8] text-[#0F4C81] border border-[#C5D9E8]"
            : "bg-[#F5F5F5] text-[#404040] border border-[#D4D4D4]"
        }`}
      >
        {role}
      </Badge>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-bold text-[#171717]">User Management</h3>
          <p className="text-[11.5px] text-[#737373] mt-1">
            Manage user access and permissions
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0F4C81] text-white hover:bg-[#0A3A61] font-semibold text-[13px] px-4 shadow-sm transition-all duration-150">
              <UserPlus size={14} className="mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-[16px] font-bold">Add New User</DialogTitle>
              <DialogDescription className="text-[13px] text-[#737373]">
                Create a new user account with specified role and permissions.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[13px] font-semibold text-[#171717]">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="text-[13px] border-[#D4D4D4]"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[13px] font-semibold text-[#171717]">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="text-[13px] border-[#D4D4D4]"
                    placeholder="john@pharmaline.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-[13px] font-semibold text-[#171717]">
                    Role
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "ADMIN" | "EMPLOYEE") =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger className="text-[13px] border-[#D4D4D4]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMPLOYEE" className="text-[13px]">
                        Employee
                      </SelectItem>
                      <SelectItem value="ADMIN" className="text-[13px]">
                        Admin
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="font-semibold text-[13px] border-[#D4D4D4]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#0F4C81] text-white hover:bg-[#0A3A61] font-semibold text-[13px]"
                >
                  Create User
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-[#D4D4D4] rounded-[10px] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F5F5F5] border-b border-[#D4D4D4] hover:bg-[#F5F5F5]">
              <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                Name
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                Email
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                Role
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                Status
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide text-right h-9">
                Joined
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                className="border-b border-[#D4D4D4] hover:bg-[#F5F5F5] transition-colors duration-150"
              >
                <TableCell className="font-semibold text-[13px] text-[#171717] h-12">
                  {user.name}
                </TableCell>
                <TableCell className="text-[13px] text-[#737373] h-12">{user.email}</TableCell>
                <TableCell className="h-12">{getRoleBadge(user.role)}</TableCell>
                <TableCell className="h-12">{getStatusBadge(user.status)}</TableCell>
                <TableCell className="text-right text-[13px] text-[#737373] h-12">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
