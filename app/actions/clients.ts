"use server"

// Client management action handlers

export interface Client {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  totalOrders: number
  activeOrders: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateClientInput {
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
}

export interface UpdateClientInput extends CreateClientInput {
  id: string
}

// Mock data for development
const mockClients: Client[] = [
  {
    id: "client-001",
    name: "Global Health Corp",
    contactPerson: "Dr. Sarah Johnson",
    email: "sarah.johnson@globalhealth.com",
    phone: "+1 (555) 123-4567",
    address: "123 Medical Plaza, New York, NY 10001",
    totalOrders: 48,
    activeOrders: 3,
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2026-03-01"),
  },
  {
    id: "client-002",
    name: "Central Pharma",
    contactPerson: "Michael Chen",
    email: "m.chen@centralpharma.com",
    phone: "+1 (555) 234-5678",
    address: "456 Healthcare Ave, Boston, MA 02101",
    totalOrders: 62,
    activeOrders: 5,
    createdAt: new Date("2024-11-20"),
    updatedAt: new Date("2026-02-28"),
  },
  {
    id: "client-003",
    name: "Nordic Meds",
    contactPerson: "Emma Larsson",
    email: "emma.larsson@nordicmeds.se",
    phone: "+46 8 123 456",
    address: "789 Stockholm Street, Stockholm, Sweden",
    totalOrders: 35,
    activeOrders: 2,
    createdAt: new Date("2025-03-10"),
    updatedAt: new Date("2026-03-03"),
  },
  {
    id: "client-004",
    name: "City Hospital",
    contactPerson: "Dr. James Wilson",
    email: "j.wilson@cityhospital.org",
    phone: "+1 (555) 345-6789",
    address: "321 Medical Center Dr, Chicago, IL 60601",
    totalOrders: 28,
    activeOrders: 1,
    createdAt: new Date("2025-06-05"),
    updatedAt: new Date("2026-03-02"),
  },
  {
    id: "client-005",
    name: "Pacific Wellness Group",
    contactPerson: "Lisa Martinez",
    email: "lisa.m@pacificwellness.com",
    phone: "+1 (555) 456-7890",
    address: "555 Ocean Blvd, Los Angeles, CA 90001",
    totalOrders: 19,
    activeOrders: 0,
    createdAt: new Date("2025-08-22"),
    updatedAt: new Date("2026-02-15"),
  },
  {
    id: "client-006",
    name: "Eastern Healthcare Solutions",
    contactPerson: "Raj Patel",
    email: "raj.patel@easternhealth.in",
    phone: "+91 22 1234 5678",
    address: "888 Healthcare Complex, Mumbai, India",
    totalOrders: 41,
    activeOrders: 4,
    createdAt: new Date("2024-09-12"),
    updatedAt: new Date("2026-03-04"),
  },
]

export async function getClients(searchTerm?: string): Promise<Client[]> {
  // TODO: Replace with actual database query
  await new Promise((resolve) => setTimeout(resolve, 300))

  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    return mockClients.filter(
      (client) =>
        client.name.toLowerCase().includes(term) ||
        client.contactPerson.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term)
    )
  }

  return mockClients
}

export async function getClientById(id: string): Promise<Client | null> {
  // TODO: Replace with actual database query
  await new Promise((resolve) => setTimeout(resolve, 200))
  return mockClients.find((client) => client.id === id) || null
}

export async function createClient(
  data: CreateClientInput
): Promise<{ success: boolean; message: string; data?: Client }> {
  try {
    // TODO: Replace with actual database insert
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newClient: Client = {
      id: `client-${Date.now()}`,
      ...data,
      totalOrders: 0,
      activeOrders: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return {
      success: true,
      message: "Client created successfully",
      data: newClient,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create client",
    }
  }
}

export async function updateClient(
  data: UpdateClientInput
): Promise<{ success: boolean; message: string; data?: Client }> {
  try {
    // TODO: Replace with actual database update
    await new Promise((resolve) => setTimeout(resolve, 500))

    const existingClient = mockClients.find((c) => c.id === data.id)
    if (!existingClient) {
      return {
        success: false,
        message: "Client not found",
      }
    }

    const updatedClient: Client = {
      ...existingClient,
      name: data.name,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      address: data.address,
      updatedAt: new Date(),
    }

    return {
      success: true,
      message: "Client updated successfully",
      data: updatedClient,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update client",
    }
  }
}

export async function deleteClient(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    // TODO: Replace with actual database delete
    await new Promise((resolve) => setTimeout(resolve, 500))

    const client = mockClients.find((c) => c.id === id)
    if (!client) {
      return {
        success: false,
        message: "Client not found",
      }
    }

    if (client.activeOrders > 0) {
      return {
        success: false,
        message: "Cannot delete client with active orders",
      }
    }

    return {
      success: true,
      message: "Client deleted successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete client",
    }
  }
}
