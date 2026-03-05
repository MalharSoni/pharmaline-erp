"use server"

// Warehouse action handlers for Material Requests and Returns

export type MaterialRequestStatus = "PENDING" | "APPROVED" | "FULFILLED" | "CANCELLED"
export type MaterialReturnStatus = "PENDING" | "PROCESSED"

export interface MaterialRequestItem {
  materialId: string
  materialName: string
  quantity: number
  unit: string
}

export interface MaterialRequest {
  id: string
  requestNumber: string
  productionOrderId: string
  productionOrderNumber: string
  materials: MaterialRequestItem[]
  status: MaterialRequestStatus
  requestedBy: string
  requestedAt: Date
  approvedBy?: string
  approvedAt?: Date
  fulfilledBy?: string
  fulfilledAt?: Date
  notes?: string
}

export interface MaterialReturn {
  id: string
  returnNumber: string
  productionOrderId: string
  productionOrderNumber: string
  materials: MaterialRequestItem[]
  reason: string
  returnedBy: string
  returnedAt: Date
  status: MaterialReturnStatus
  notes?: string
}

// Mock data for development
const mockMaterialRequests: MaterialRequest[] = [
  {
    id: "mr-001",
    requestNumber: "MR-9001",
    productionOrderId: "po-001",
    productionOrderNumber: "PO-9821",
    materials: [
      { materialId: "mat-001", materialName: "Metformin API", quantity: 50, unit: "kg" },
      { materialId: "mat-002", materialName: "Microcrystalline Cellulose", quantity: 25, unit: "kg" },
    ],
    status: "PENDING",
    requestedBy: "John Smith",
    requestedAt: new Date("2026-03-04T09:30:00"),
  },
  {
    id: "mr-002",
    requestNumber: "MR-9002",
    productionOrderId: "po-002",
    productionOrderNumber: "PO-9822",
    materials: [
      { materialId: "mat-003", materialName: "Lisinopril API", quantity: 30, unit: "kg" },
      { materialId: "mat-004", materialName: "Starch", quantity: 15, unit: "kg" },
    ],
    status: "APPROVED",
    requestedBy: "Jane Doe",
    requestedAt: new Date("2026-03-03T14:15:00"),
    approvedBy: "Mike Johnson",
    approvedAt: new Date("2026-03-03T15:00:00"),
  },
  {
    id: "mr-003",
    requestNumber: "MR-9003",
    productionOrderId: "po-003",
    productionOrderNumber: "PO-9825",
    materials: [
      { materialId: "mat-005", materialName: "Ibuprofen API", quantity: 40, unit: "kg" },
    ],
    status: "FULFILLED",
    requestedBy: "Sarah Lee",
    requestedAt: new Date("2026-03-02T10:00:00"),
    approvedBy: "Mike Johnson",
    approvedAt: new Date("2026-03-02T11:30:00"),
    fulfilledBy: "Tom Wilson",
    fulfilledAt: new Date("2026-03-02T14:00:00"),
  },
]

const mockMaterialReturns: MaterialReturn[] = [
  {
    id: "mr-ret-001",
    returnNumber: "RET-8001",
    productionOrderId: "po-001",
    productionOrderNumber: "PO-9821",
    materials: [
      { materialId: "mat-001", materialName: "Metformin API", quantity: 2.5, unit: "kg" },
    ],
    reason: "Production yield was 95% - excess material returned",
    returnedBy: "John Smith",
    returnedAt: new Date("2026-03-04T16:30:00"),
    status: "PROCESSED",
    notes: "Material in good condition, returned to stock",
  },
  {
    id: "mr-ret-002",
    returnNumber: "RET-8002",
    productionOrderId: "po-003",
    productionOrderNumber: "PO-9825",
    materials: [
      { materialId: "mat-005", materialName: "Ibuprofen API", quantity: 3.8, unit: "kg" },
      { materialId: "mat-006", materialName: "Lactose", quantity: 1.2, unit: "kg" },
    ],
    reason: "Production yield was 92% - excess material returned",
    returnedBy: "Sarah Lee",
    returnedAt: new Date("2026-03-03T18:00:00"),
    status: "PENDING",
  },
]

export async function getMaterialRequests(): Promise<MaterialRequest[]> {
  // TODO: Replace with actual database query
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockMaterialRequests
}

export async function getMaterialReturns(): Promise<MaterialReturn[]> {
  // TODO: Replace with actual database query
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockMaterialReturns
}

export async function createMaterialRequest(
  data: Omit<MaterialRequest, "id" | "requestNumber" | "requestedAt" | "status">
): Promise<{ success: boolean; message: string; data?: MaterialRequest }> {
  try {
    // TODO: Replace with actual database insert
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newRequest: MaterialRequest = {
      ...data,
      id: `mr-${Date.now()}`,
      requestNumber: `MR-${9000 + mockMaterialRequests.length + 1}`,
      status: "PENDING",
      requestedAt: new Date(),
    }

    return {
      success: true,
      message: "Material request created successfully",
      data: newRequest,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create material request",
    }
  }
}

export async function approveMaterialRequest(
  requestId: string,
  approvedBy: string
): Promise<{ success: boolean; message: string }> {
  try {
    // TODO: Replace with actual database update
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      message: "Material request approved successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to approve material request",
    }
  }
}

export async function fulfillMaterialRequest(
  requestId: string,
  fulfilledBy: string
): Promise<{ success: boolean; message: string }> {
  try {
    // TODO: Replace with actual database update
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      message: "Material request fulfilled successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fulfill material request",
    }
  }
}

export async function processMaterialReturn(
  returnId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // TODO: Replace with actual database update
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      message: "Material return processed successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to process material return",
    }
  }
}
