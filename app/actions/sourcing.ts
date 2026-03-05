"use server"

// Sourcing/Purchase Request action handlers

export type PurchaseRequestStatus = "PENDING" | "APPROVED" | "ORDERED" | "RECEIVED" | "CANCELLED"

export interface PurchaseRequest {
  id: string
  prNumber: string
  materialId: string
  materialName: string
  quantity: number
  unit: string
  supplierId?: string
  supplierName?: string
  status: PurchaseRequestStatus
  requestedBy: string
  requestedAt: Date
  expectedDeliveryDate?: Date
  approvedBy?: string
  approvedAt?: Date
  orderedAt?: Date
  receivedAt?: Date
  notes?: string
  reason: string
  currentStock?: number
  reorderLevel?: number
}

export interface CreatePurchaseRequestInput {
  materialId: string
  materialName: string
  quantity: number
  unit: string
  supplierId?: string
  supplierName?: string
  expectedDeliveryDate?: Date
  notes?: string
  reason: string
  requestedBy: string
}

export interface Supplier {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
}

// Mock data for development
const mockSuppliers: Supplier[] = [
  {
    id: "sup-001",
    name: "ChemSource Global",
    contactPerson: "David Lee",
    email: "david.lee@chemsource.com",
    phone: "+1 (555) 111-2222",
  },
  {
    id: "sup-002",
    name: "API Direct Inc",
    contactPerson: "Maria Garcia",
    email: "m.garcia@apidirect.com",
    phone: "+1 (555) 222-3333",
  },
  {
    id: "sup-003",
    name: "Pacific Materials",
    contactPerson: "Tom Chen",
    email: "tom.chen@pacificmat.com",
    phone: "+1 (555) 333-4444",
  },
  {
    id: "sup-004",
    name: "European Excipients",
    contactPerson: "Hans Mueller",
    email: "h.mueller@eurexcip.de",
    phone: "+49 30 1234567",
  },
]

const mockPurchaseRequests: PurchaseRequest[] = [
  {
    id: "pr-001",
    prNumber: "PR-7001",
    materialId: "mat-001",
    materialName: "Metformin API",
    quantity: 100,
    unit: "kg",
    supplierId: "sup-001",
    supplierName: "ChemSource Global",
    status: "PENDING",
    requestedBy: "Warehouse Manager",
    requestedAt: new Date("2026-03-05T08:30:00"),
    expectedDeliveryDate: new Date("2026-03-15"),
    reason: "Low stock - below reorder level",
    currentStock: 12,
    reorderLevel: 50,
    notes: "Urgent - production scheduled for March 18",
  },
  {
    id: "pr-002",
    prNumber: "PR-7002",
    materialId: "mat-007",
    materialName: "Foil PTP (250mm)",
    quantity: 50,
    unit: "kg",
    supplierId: "sup-003",
    supplierName: "Pacific Materials",
    status: "APPROVED",
    requestedBy: "Production Manager",
    requestedAt: new Date("2026-03-04T14:20:00"),
    expectedDeliveryDate: new Date("2026-03-12"),
    approvedBy: "Procurement Head",
    approvedAt: new Date("2026-03-04T16:00:00"),
    reason: "Critical stock - 2.5kg remaining",
    currentStock: 2.5,
    reorderLevel: 10,
  },
  {
    id: "pr-003",
    prNumber: "PR-7003",
    materialId: "mat-008",
    materialName: "Gelatin Powder",
    quantity: 30,
    unit: "kg",
    supplierId: "sup-002",
    supplierName: "API Direct Inc",
    status: "ORDERED",
    requestedBy: "Warehouse Manager",
    requestedAt: new Date("2026-03-02T10:15:00"),
    expectedDeliveryDate: new Date("2026-03-10"),
    approvedBy: "Procurement Head",
    approvedAt: new Date("2026-03-02T11:30:00"),
    orderedAt: new Date("2026-03-02T15:00:00"),
    reason: "Approaching reorder level",
    currentStock: 8,
    reorderLevel: 15,
  },
  {
    id: "pr-004",
    prNumber: "PR-7004",
    materialId: "mat-009",
    materialName: "Lactose Monohydrate",
    quantity: 200,
    unit: "kg",
    supplierId: "sup-004",
    supplierName: "European Excipients",
    status: "RECEIVED",
    requestedBy: "Production Planner",
    requestedAt: new Date("2026-02-20T09:00:00"),
    expectedDeliveryDate: new Date("2026-03-01"),
    approvedBy: "Procurement Head",
    approvedAt: new Date("2026-02-20T14:00:00"),
    orderedAt: new Date("2026-02-21T10:00:00"),
    receivedAt: new Date("2026-03-01T13:30:00"),
    reason: "Quarterly bulk order",
    currentStock: 45,
    reorderLevel: 100,
  },
  {
    id: "pr-005",
    prNumber: "PR-7005",
    materialId: "mat-010",
    materialName: "Magnesium Stearate",
    quantity: 25,
    unit: "kg",
    supplierId: "sup-001",
    supplierName: "ChemSource Global",
    status: "PENDING",
    requestedBy: "QA Manager",
    requestedAt: new Date("2026-03-03T11:45:00"),
    expectedDeliveryDate: new Date("2026-03-14"),
    reason: "Low stock alert",
    currentStock: 6,
    reorderLevel: 20,
    notes: "Request COA with delivery",
  },
]

export async function getPurchaseRequests(): Promise<PurchaseRequest[]> {
  // TODO: Replace with actual database query
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockPurchaseRequests
}

export async function getSuppliers(): Promise<Supplier[]> {
  // TODO: Replace with actual database query
  await new Promise((resolve) => setTimeout(resolve, 200))
  return mockSuppliers
}

export async function getLowStockMaterials(): Promise<
  Array<{
    id: string
    name: string
    currentStock: number
    unit: string
    reorderLevel: number
  }>
> {
  // TODO: Replace with actual database query
  await new Promise((resolve) => setTimeout(resolve, 200))

  return [
    { id: "mat-001", name: "Metformin API", currentStock: 12, unit: "kg", reorderLevel: 50 },
    { id: "mat-007", name: "Foil PTP (250mm)", currentStock: 2.5, unit: "kg", reorderLevel: 10 },
    { id: "mat-008", name: "Gelatin Powder", currentStock: 8, unit: "kg", reorderLevel: 15 },
    {
      id: "mat-010",
      name: "Magnesium Stearate",
      currentStock: 6,
      unit: "kg",
      reorderLevel: 20,
    },
    {
      id: "mat-011",
      name: "Titanium Dioxide",
      currentStock: 3.2,
      unit: "kg",
      reorderLevel: 12,
    },
  ]
}

export async function createPurchaseRequest(
  data: CreatePurchaseRequestInput
): Promise<{ success: boolean; message: string; data?: PurchaseRequest }> {
  try {
    // TODO: Replace with actual database insert
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newPR: PurchaseRequest = {
      id: `pr-${Date.now()}`,
      prNumber: `PR-${7000 + mockPurchaseRequests.length + 1}`,
      materialId: data.materialId,
      materialName: data.materialName,
      quantity: data.quantity,
      unit: data.unit,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      status: "PENDING",
      requestedBy: data.requestedBy,
      requestedAt: new Date(),
      expectedDeliveryDate: data.expectedDeliveryDate,
      notes: data.notes,
      reason: data.reason,
    }

    return {
      success: true,
      message: "Purchase request created successfully",
      data: newPR,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create purchase request",
    }
  }
}

export async function approvePurchaseRequest(
  prId: string,
  approvedBy: string
): Promise<{ success: boolean; message: string }> {
  try {
    // TODO: Replace with actual database update
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      message: "Purchase request approved successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to approve purchase request",
    }
  }
}

export async function markAsOrdered(
  prId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // TODO: Replace with actual database update
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      message: "Purchase request marked as ordered",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to mark as ordered",
    }
  }
}

export async function markAsReceived(
  prId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // TODO: Replace with actual database update
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      message: "Purchase request marked as received",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to mark as received",
    }
  }
}
