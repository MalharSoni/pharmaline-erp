# Pharmaline ERP - Database Schema Design

## Overview
Comprehensive database schema for pharmaceutical manufacturing ERP system.

---

## Core Entities

### 1. User
**Purpose:** Admin and Employee users
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  password      String    // Hashed
  role          UserRole  @default(EMPLOYEE)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  createdOrders           PurchaseOrder[]
  approvedMaterialRequests MaterialRequest[] @relation("ApprovedBy")
  fulfilledMaterialRequests MaterialRequest[] @relation("FulfilledBy")
  createdProductionBatches ProductionBatch[]
  createdPurchaseRequests  PurchaseRequest[]
}

enum UserRole {
  ADMIN
  EMPLOYEE
}
```

---

### 2. Client
**Purpose:** Customer/client database
```prisma
model Client {
  id              String    @id @default(cuid())
  name            String
  contactPerson   String?
  email           String?
  phone           String?
  address         String?
  notes           String?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  purchaseOrders  PurchaseOrder[]
}
```

---

### 3. Product (SKU - Finished Products)
**Purpose:** Finished pharmaceutical products that we manufacture
```prisma
model Product {
  id              String    @id @default(cuid())
  sku             String    @unique
  name            String
  description     String?
  unit            String    // "bottles", "tablets", "units"
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  bom             BOM?
  purchaseOrders  PurchaseOrder[]
  productionBatches ProductionBatch[]
  finishedInventory FinishedInventory[]
}
```

---

### 4. InventoryItem (Raw Materials & Packaging)
**Purpose:** Raw materials and packaging materials in inventory
```prisma
model InventoryItem {
  id              String    @id @default(cuid())
  itemCode        String    @unique
  name            String
  category        InventoryCategory
  currentStock    Float     @default(0)
  unit            String    // "kg", "liters", "pieces"
  reorderPoint    Float
  supplierId      String?
  lastUpdated     DateTime  @default(now())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  supplier        Supplier? @relation(fields: [supplierId], references: [id])
  bomItems        BOMItem[]
  materialRequestItems MaterialRequestItem[]
  materialReturns MaterialReturn[]
  stockHistory    StockHistory[]
  purchaseRequests PurchaseRequest[]
}

enum InventoryCategory {
  RAW_MATERIAL
  PACKAGING_MATERIAL
}
```

---

### 5. FinishedInventory
**Purpose:** Track finished products from production (extras from yield >100%)
```prisma
model FinishedInventory {
  id              String    @id @default(cuid())
  productId       String
  quantity        Float
  batchNumber     String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  product         Product   @relation(fields: [productId], references: [id])
}
```

---

### 6. Supplier
**Purpose:** Suppliers for raw materials
```prisma
model Supplier {
  id              String    @id @default(cuid())
  name            String
  contactPerson   String?
  email           String?
  phone           String?
  address         String?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  inventoryItems  InventoryItem[]
  purchaseRequests PurchaseRequest[]
}
```

---

### 7. BOM (Bill of Materials)
**Purpose:** Formula/recipe for each product
```prisma
model BOM {
  id              String    @id @default(cuid())
  productId       String    @unique
  version         String    @default("1.0")
  notes           String?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  product         Product   @relation(fields: [productId], references: [id])
  items           BOMItem[]
}
```

---

### 8. BOMItem
**Purpose:** Individual materials in a BOM
```prisma
model BOMItem {
  id              String    @id @default(cuid())
  bomId           String
  inventoryItemId String
  quantityRequired Float
  unit            String
  notes           String?

  // Relations
  bom             BOM       @relation(fields: [bomId], references: [id], onDelete: Cascade)
  inventoryItem   InventoryItem @relation(fields: [inventoryItemId], references: [id])
}
```

---

## Order & Production Flow

### 9. PurchaseOrder (PO from Client)
**Purpose:** Client's purchase order
```prisma
model PurchaseOrder {
  id                  String    @id @default(cuid())
  poNumber            String    @unique
  clientId            String
  productId           String
  quantity            Float
  expectedDeliveryDate DateTime
  status              POStatus  @default(PO_RECEIVED)
  createdById         String
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  // Relations
  client              Client    @relation(fields: [clientId], references: [id])
  product             Product   @relation(fields: [productId], references: [id])
  createdBy           User      @relation(fields: [createdById], references: [id])
  salesOrder          SalesOrder?
  payment             Payment?
  cycleTimeLogs       CycleTimeLog[]
}

enum POStatus {
  PO_RECEIVED
  SO_CREATED
  AWAITING_MATERIALS
  READY_FOR_PRODUCTION
  IN_PRODUCTION
  READY_TO_DISPATCH
  DISPATCHED
  OVERDUE
}
```

---

### 10. SalesOrder (Internal SO)
**Purpose:** Internal sales order created from PO
```prisma
model SalesOrder {
  id              String    @id @default(cuid())
  purchaseOrderId String    @unique
  soNumber        String    @unique
  materialStatus  MaterialStatus @default(CHECKING)
  approvedAt      DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  purchaseOrder   PurchaseOrder @relation(fields: [purchaseOrderId], references: [id])
  materialRequest MaterialRequest?
  productionBatch ProductionBatch?
}

enum MaterialStatus {
  CHECKING
  ALL_AVAILABLE
  MISSING_MATERIALS
}
```

---

### 11. MaterialRequest
**Purpose:** Request materials from warehouse for production
```prisma
model MaterialRequest {
  id              String    @id @default(cuid())
  salesOrderId    String    @unique
  requestNumber   String    @unique
  status          MaterialRequestStatus @default(PENDING_APPROVAL)
  approvedById    String?
  approvedAt      DateTime?
  fulfilledById   String?
  fulfilledAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  salesOrder      SalesOrder @relation(fields: [salesOrderId], references: [id])
  approvedBy      User?     @relation("ApprovedBy", fields: [approvedById], references: [id])
  fulfilledBy     User?     @relation("FulfilledBy", fields: [fulfilledById], references: [id])
  items           MaterialRequestItem[]
}

enum MaterialRequestStatus {
  PENDING_APPROVAL
  APPROVED
  FULFILLED
  PARTIAL
}
```

---

### 12. MaterialRequestItem
**Purpose:** Individual items in material request
```prisma
model MaterialRequestItem {
  id                  String    @id @default(cuid())
  materialRequestId   String
  inventoryItemId     String
  quantityRequested   Float
  quantityIssued      Float?
  unit                String

  // Relations
  materialRequest     MaterialRequest @relation(fields: [materialRequestId], references: [id], onDelete: Cascade)
  inventoryItem       InventoryItem @relation(fields: [inventoryItemId], references: [id])
}
```

---

### 13. ProductionBatch
**Purpose:** Production run tracking
```prisma
model ProductionBatch {
  id              String    @id @default(cuid())
  salesOrderId    String    @unique
  productId       String
  batchNumber     String    @unique
  plannedQuantity Float
  actualQuantity  Float?
  yieldPercentage Float?
  status          ProductionStatus @default(PLANNED)
  scheduledStart  DateTime?
  actualStart     DateTime?
  scheduledEnd    DateTime?
  actualEnd       DateTime?
  createdById     String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  salesOrder      SalesOrder @relation(fields: [salesOrderId], references: [id])
  product         Product   @relation(fields: [productId], references: [id])
  createdBy       User      @relation(fields: [createdById], references: [id])
  materialReturns MaterialReturn[]
}

enum ProductionStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  VERIFIED
}
```

---

### 14. MaterialReturn
**Purpose:** Leftover materials returned from production to warehouse
```prisma
model MaterialReturn {
  id              String    @id @default(cuid())
  productionBatchId String
  inventoryItemId String
  quantityReturned Float
  unit            String
  returnedAt      DateTime  @default(now())

  // Relations
  productionBatch ProductionBatch @relation(fields: [productionBatchId], references: [id])
  inventoryItem   InventoryItem @relation(fields: [inventoryItemId], references: [id])
}
```

---

### 15. Payment
**Purpose:** Payment tracking (50% advance, 50% before pickup)
```prisma
model Payment {
  id              String    @id @default(cuid())
  purchaseOrderId String    @unique
  totalAmount     Float
  advanceAmount   Float     // 50%
  advanceDate     DateTime?
  balanceAmount   Float     // 50%
  balanceDate     DateTime?
  status          PaymentStatus @default(PENDING)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  purchaseOrder   PurchaseOrder @relation(fields: [purchaseOrderId], references: [id])
}

enum PaymentStatus {
  PENDING
  PARTIAL  // Advance paid
  PAID     // Fully paid
}
```

---

### 16. PurchaseRequest (Sourcing)
**Purpose:** Purchase requests for sourcing manager when materials are missing
```prisma
model PurchaseRequest {
  id              String    @id @default(cuid())
  inventoryItemId String
  quantityNeeded  Float
  supplierId      String?
  estimatedETA    DateTime?
  status          PurchaseRequestStatus @default(PENDING)
  orderedAt       DateTime?
  receivedAt      DateTime?
  createdById     String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  inventoryItem   InventoryItem @relation(fields: [inventoryItemId], references: [id])
  supplier        Supplier? @relation(fields: [supplierId], references: [id])
  createdBy       User      @relation(fields: [createdById], references: [id])
}

enum PurchaseRequestStatus {
  PENDING
  ORDERED
  RECEIVED
  CANCELLED
}
```

---

## Analytics & Tracking

### 17. CycleTimeLog
**Purpose:** Track time spent in each stage for cycle time analytics
```prisma
model CycleTimeLog {
  id              String    @id @default(cuid())
  purchaseOrderId String
  stage           POStatus
  enteredAt       DateTime  @default(now())
  exitedAt        DateTime?
  durationHours   Float?

  // Relations
  purchaseOrder   PurchaseOrder @relation(fields: [purchaseOrderId], references: [id])
}
```

---

### 18. StockHistory
**Purpose:** Track all inventory movements
```prisma
model StockHistory {
  id              String    @id @default(cuid())
  inventoryItemId String
  changeType      StockChangeType
  quantityBefore  Float
  quantityAfter   Float
  quantityChanged Float
  reason          String?
  referenceId     String?   // ID of related entity (e.g., materialRequestId, materialReturnId)
  createdAt       DateTime  @default(now())

  // Relations
  inventoryItem   InventoryItem @relation(fields: [inventoryItemId], references: [id])
}

enum StockChangeType {
  PURCHASE
  MATERIAL_REQUEST
  MATERIAL_RETURN
  PRODUCTION_USE
  ADJUSTMENT
  WASTE
}
```

---

### 19. Notification
**Purpose:** In-app and email notifications
```prisma
model Notification {
  id              String    @id @default(cuid())
  userId          String?   // null = broadcast to all admins
  type            NotificationType
  title           String
  message         String
  severity        NotificationSeverity @default(INFO)
  isRead          Boolean   @default(false)
  isDismissed     Boolean   @default(false)
  emailSent       Boolean   @default(false)
  referenceId     String?   // ID of related entity
  referenceType   String?   // "PurchaseOrder", "InventoryItem", etc.
  createdAt       DateTime  @default(now())
}

enum NotificationType {
  LOW_STOCK
  OUT_OF_STOCK
  ORDER_OVERDUE
  PAYMENT_RECEIVED
  CYCLE_TIME_EXCEEDED
  MATERIAL_REQUEST_PENDING
  PRODUCTION_COMPLETE
  PURCHASE_REQUEST_CREATED
}

enum NotificationSeverity {
  INFO
  WARNING
  CRITICAL
}
```

---

## Key Design Decisions

### 1. Virtual Bin "Ready for Production"
- Implemented via `MaterialRequest.status = APPROVED` + `SalesOrder.materialStatus = ALL_AVAILABLE`
- No physical "bin" entity needed - it's a status state

### 2. Inventory Deduction Timing
- Inventory is **NOT** deducted when material request is fulfilled
- Inventory is deducted **ONLY** when production batch status = COMPLETED
- Calculated as: `quantityRequested - quantityReturned = actualUsed`

### 3. Yield Auto-Calculation
- `ProductionBatch.yieldPercentage = (actualQuantity / plannedQuantity) * 100`
- Auto-calculated when `actualQuantity` is entered

### 4. Leftover Returns Auto-Calculation
- System calculates: `MaterialRequestItem.quantityIssued - (quantity actually used in production) = leftover`
- Creates `MaterialReturn` records automatically
- Adds back to `InventoryItem.currentStock`

### 5. Payment Tracking
- Two payment milestones: 50% advance (with PO), 50% balance (before dispatch)
- Status: PENDING → PARTIAL (advance paid) → PAID (balance paid)

### 6. Cycle Time Tracking
- `CycleTimeLog` records created automatically when PO status changes
- Each stage entry/exit logged with timestamps
- Analytics query: `SUM(durationHours)` per stage, per order, per product

### 7. Employee Permissions
- Employees **cannot**:
  - Delete orders
  - Edit completed production
  - Change reorder points
  - Add/remove users
  - Export sensitive reports (enforced at API level)

### 8. CSV Import Error Handling
- On duplicate SKU/itemCode: throw error, show conflict resolution UI
- User can choose: Skip, Update, or Cancel import

---

## Next Steps
1. Install Prisma
2. Create `schema.prisma` file
3. Set up Supabase PostgreSQL connection
4. Run migrations
5. Seed initial data
