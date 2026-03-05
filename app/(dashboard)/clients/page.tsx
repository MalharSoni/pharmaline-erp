"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ClientModal } from "@/components/clients/client-modal"
import { getClients } from "@/app/actions/clients"
import type { Client } from "@/app/actions/clients"
import { Plus, Search, Mail, Phone, MapPin, Edit } from "lucide-react"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const filtered = clients.filter(
        (client) =>
          client.name.toLowerCase().includes(term) ||
          client.contactPerson.toLowerCase().includes(term) ||
          client.email.toLowerCase().includes(term)
      )
      setFilteredClients(filtered)
    } else {
      setFilteredClients(clients)
    }
  }, [searchTerm, clients])

  const loadClients = async () => {
    setIsLoading(true)
    try {
      const data = await getClients()
      setClients(data)
      setFilteredClients(data)
    } catch (error) {
      console.error("Failed to load clients:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddClient = () => {
    setSelectedClient(null)
    setIsModalOpen(true)
  }

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedClient(null)
    loadClients()
  }

  return (
    <DashboardLayout title="Client Management">
      <Card className="border border-[#D4D4D4] shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex-1">
            <CardTitle className="text-[14px] font-bold text-[#171717]">
              Client Directory
            </CardTitle>
            <p className="text-[12px] text-[#737373] mt-1">
              Manage your pharmaceutical client relationships
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[280px] h-9 text-[13px] border-[#D4D4D4]"
              />
            </div>
            <Button
              onClick={handleAddClient}
              className="bg-[#0F4C81] text-white hover:bg-[#0A3A61] font-semibold text-[13px] px-4 py-2 shadow-sm transition-all duration-150"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Client
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-[13px] text-[#737373]">Loading clients...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-[14px] font-semibold text-[#171717] mb-1">No clients found</p>
              <p className="text-[13px] text-[#737373]">
                {searchTerm
                  ? "Try adjusting your search term"
                  : "Get started by adding your first client"}
              </p>
            </div>
          ) : (
            <div className="border border-[#D4D4D4] rounded-[10px] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5F5F5] border-b border-[#D4D4D4] hover:bg-[#F5F5F5]">
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Company Name
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Contact Person
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Contact Info
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Location
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9 text-center">
                      Orders
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow
                      key={client.id}
                      className="border-b border-[#D4D4D4] hover:bg-[#F5F5F5] transition-colors duration-150"
                    >
                      <TableCell className="h-12">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[13px] text-[#171717]">
                            {client.name}
                          </span>
                          <span className="text-[11.5px] text-[#737373]">
                            Client since{" "}
                            {new Date(client.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px] text-[#171717] h-12">
                        {client.contactPerson}
                      </TableCell>
                      <TableCell className="h-12">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-[13px] text-[#171717]">
                            <Mail className="w-3.5 h-3.5 text-[#737373]" />
                            <span className="truncate max-w-[200px]">{client.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[13px] text-[#737373]">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{client.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="h-12 max-w-xs">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#737373] mt-0.5 flex-shrink-0" />
                          <span className="text-[13px] text-[#171717] line-clamp-2">
                            {client.address}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="h-12">
                        <div className="flex flex-col items-center gap-1">
                          <Badge className="bg-[#E8F1F8] text-[#0F4C81] border border-[#C5D9E8] text-[10.5px] font-bold px-2 py-0.5">
                            {client.totalOrders} Total
                          </Badge>
                          {client.activeOrders > 0 && (
                            <Badge className="bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] text-[10.5px] font-bold px-2 py-0.5">
                              {client.activeOrders} Active
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="h-12 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClient(client)}
                          className="text-[12px] font-semibold px-3 py-1 border-[#D4D4D4] hover:bg-[#F5F5F5]"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ClientModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        client={selectedClient}
      />
    </DashboardLayout>
  )
}
