# Orders Management System

## Overview

Professional Orders Management system for Pharmaline ERP with pharmaceutical industry-grade UX. Features include complete order lifecycle tracking, BOM extraction, material request generation, and payment tracking.

## Features Implemented

### 1. Orders List Page (`/orders`)

**Location:** `/app/(dashboard)/orders/page.tsx`

**Features:**
- Full orders table with real-time data
- Status filter pills (All, PO Received, Awaiting Materials, In Production, etc.)
- Search by order number or client name
- Click-to-view order details
- Due date tracking with visual warnings (overdue in red, 3 days or less in amber)
- Total order value summary
- Empty state with CTA

**Columns:**
- Order # (PO number)
- Client (company name)
- Product (name + SKU)
- Quantity (with unit)
- Status (professional badges)
- Due Date (with days remaining counter)
- Actions (View Details button)

### 2. New Order Modal

**Location:** `/components/orders/new-order-modal.tsx`

**Fields:**
- Client selection (dropdown from active clients)
- Product/SKU selection (dropdown from active products)
- Quantity (numeric input)
- Expected delivery date (date picker)
- Total amount (auto-calculates 50/50 payment split)

**Auto-Generated on Order Creation:**
- Purchase Order (PO) with unique PO number (PO-10001, PO-10002, etc.)
- Sales Order (SO) with unique SO number
- Payment record (50% advance, 50% balance)
- Material Request (MR) if product has BOM
- Material Request Items (extracted from BOM)
- Material availability check
- Cycle time logging

**Business Logic:**
- Automatically checks if materials are available in inventory
- Sets order status based on material availability:
  - `READY_FOR_PRODUCTION` if all materials available
  - `AWAITING_MATERIALS` if materials missing
- Creates complete order flow in single transaction

### 3. Order Detail Modal

**Location:** `/components/orders/order-detail-modal.tsx`

**Sections:**

**Order Info Cards:**
- Client details (name, contact person)
- Product details (name, SKU, quantity)
- Due date (with creation date)

**Payment Status:**
- Total amount
- Advance payment (50%) with paid/pending status
- Balance payment (50%) with paid/pending status
- Visual indicators (green checkmark for paid, red X for pending)

**Bill of Materials (BOM):**
- Full material extraction table
- Per-unit quantities
- Total required quantities (per-unit × order quantity)
- Material codes
- Shows BOM version

**Material Request:**
- MR number
- Approval status
- Approved date/time

**Production Batch:**
- Batch number
- Production status
- Planned vs actual quantity
- Yield percentage

**Actions:**
- Delete order (with confirmation)
- Edit order (future enhancement)

### 4. Server Actions

**Location:** `/app/actions/orders.ts`

**Actions:**

```typescript
// Create new order with full flow
createOrder(data: CreateOrderData)

// Get all orders with filters
getOrders(statusFilter?: string, searchQuery?: string)

// Get single order with full details
getOrderById(id: string)

// Update order status
updateOrderStatus(id: string, status: POStatus)

// Delete order
deleteOrder(id: string)

// Get clients for dropdown
getClients()

// Get products for dropdown
getProducts()
```

**Auto-Number Generation:**
- `generatePONumber()` - PO-10001, PO-10002, etc.
- `generateSONumber()` - SO-10001, SO-10002, etc.
- `generateMRNumber()` - MR-10001, MR-10002, etc.

## Design Standards

### Color Palette

**Primary Brand:**
- Professional Blue: `#0F4C81` (buttons, active states)
- Hover Blue: `#0A3A61`

**Neutral Scale:**
- Black: `#171717` (primary text)
- Gray 1: `#737373` (secondary text)
- Gray 2: `#A3A3A3` (tertiary text)
- Gray 3: `#D4D4D4` (borders)
- Gray 4: `#F5F5F5` (table headers, subtle fills)

**Status Colors:**
- Success Green: `#2E7D32` / `#15803D`
- Warning Amber: `#B8860B` / `#F59E0B`
- Error Red: `#DC2626`
- Info Blue: `#2563EB`

### Status Badges

Each order status has a professional badge with border + subtle background:

| Status | Color | Background |
|--------|-------|------------|
| PO Received | Gray | `#F5F5F5` |
| SO Created | Blue | `#E8F1F8` |
| Awaiting Materials | Amber | `#FFF8E1` |
| Ready for Production | Blue | `#EFF6FF` |
| In Production | Blue | `#E8F1F8` |
| Ready to Dispatch | Green | `#E8F5E9` |
| Dispatched | Dark Green | `#E8F5E9` |
| Overdue | Red | `#FEF2F2` |

### Typography

- Page title: `22px`, weight `800`
- Section header: `14px`, weight `700`
- Section label: `10px`, weight `700`, uppercase, tracking `0.06em`
- Table header: `11px`, weight `700`, uppercase, tracking `0.06em`
- Table cell: `13px`, weight `400`
- Badge text: `10.5px`, weight `700`, uppercase, tracking `0.03em`
- Button text: `13px`, weight `600`

### Layout

- Card padding: `py-4 px-4` (optimized, not py-6 px-6)
- Card radius: `rounded-[10px]` (not rounded-xl)
- Table row height: `h-12`
- Border: `1px solid #D4D4D4`
- Shadow: `shadow-sm` (subtle, professional)

## API Flow

### Create Order Flow

```
User clicks "New Order"
  ↓
Fills form with client, product, quantity, date, amount
  ↓
Submit → createOrder() server action
  ↓
1. Create PurchaseOrder (status: PO_RECEIVED)
2. Create Payment record (50/50 split)
3. Create CycleTimeLog entry
4. Create SalesOrder (auto-generated SO number)
5. Update PO status to SO_CREATED
6. Check if product has BOM
   ↓
   YES: Extract materials from BOM
   ↓
7. Create MaterialRequest
8. Create MaterialRequestItems (from BOM)
9. Check material availability in inventory
   ↓
   ALL AVAILABLE: Set status to READY_FOR_PRODUCTION
   ↓
   MISSING: Set status to AWAITING_MATERIALS
  ↓
Return success with PO number and SO number
  ↓
Toast notification: "Order created: PO-10001"
  ↓
Refresh orders list
```

### View Order Details Flow

```
User clicks on order row or "View Details"
  ↓
Open OrderDetailModal
  ↓
getOrderById() server action
  ↓
Fetch order with:
  - Client
  - Product + BOM + BOM Items
  - Payment
  - Sales Order
  - Material Request + Items
  - Production Batch
  - Cycle Time Logs
  ↓
Display complete order information
```

## Database Relations

```
PurchaseOrder
  ├─ Client (belongsTo)
  ├─ Product (belongsTo)
  │   └─ BOM (hasOne)
  │       └─ BOMItems[] (hasMany)
  ├─ Payment (hasOne)
  ├─ SalesOrder (hasOne)
  │   ├─ MaterialRequest (hasOne)
  │   │   └─ MaterialRequestItems[] (hasMany)
  │   └─ ProductionBatch (hasOne)
  └─ CycleTimeLogs[] (hasMany)
```

## File Structure

```
pharmaline-erp/
├── app/
│   ├── actions/
│   │   └── orders.ts                    # Server actions
│   └── (dashboard)/
│       └── orders/
│           └── page.tsx                 # Main orders page
├── components/
│   ├── orders/
│   │   ├── new-order-modal.tsx         # New order dialog
│   │   └── order-detail-modal.tsx      # Order detail view
│   ├── layout/
│   │   ├── dashboard-layout.tsx        # Updated with action prop
│   │   └── topbar.tsx                  # Updated with action prop
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── dialog.tsx
│       ├── badge.tsx
│       ├── table.tsx
│       └── card.tsx
└── lib/
    ├── prisma.ts                        # Prisma client
    └── utils.ts                         # cn() utility
```

## Usage

### Navigate to Orders

```
http://localhost:3000/orders
```

### Create New Order

1. Click "New Order" button (top right)
2. Select client from dropdown
3. Select product from dropdown
4. Enter quantity
5. Select expected delivery date
6. Enter total amount
7. Review auto-calculated advance (50%)
8. Click "Create Order"

### View Order Details

1. Click on any order row in the table
   OR
2. Click "View Details" button

### Filter Orders

- Click status filter pills at top (All Orders, PO Received, etc.)
- Use search bar to search by order # or client name

## Business Rules

1. **Payment Terms:** All orders use 50/50 payment split (50% advance, 50% on delivery)

2. **Material Availability:**
   - If product has no BOM → status remains at SO_CREATED
   - If product has BOM and all materials available → READY_FOR_PRODUCTION
   - If product has BOM but materials missing → AWAITING_MATERIALS

3. **Auto-Numbering:** PO, SO, and MR numbers auto-increment from last used number

4. **Order Status Flow:**
   ```
   PO_RECEIVED
     ↓
   SO_CREATED
     ↓
   AWAITING_MATERIALS (if needed) or READY_FOR_PRODUCTION
     ↓
   IN_PRODUCTION
     ↓
   READY_TO_DISPATCH
     ↓
   DISPATCHED
   ```

5. **Cycle Time Tracking:** Every status change is logged with timestamp

## Toast Notifications

- Success: "Order created: PO-10001"
- Error: "Failed to create order" (with reason)
- Delete: "Order deleted successfully"

## Dependencies

All dependencies are already installed:
- `date-fns` - Date formatting
- `sonner` - Toast notifications
- `lucide-react` - Icons
- `@prisma/client` - Database
- `next` - Framework
- `react-hook-form` + `zod` - Form validation (ready for future use)

## Future Enhancements

- [ ] Edit order functionality
- [ ] Bulk order import
- [ ] Order duplication
- [ ] Advanced filters (date range, client, product)
- [ ] Export orders to CSV/Excel
- [ ] Order templates
- [ ] Email notifications to clients
- [ ] Print order confirmation
- [ ] Order history/audit log
- [ ] Quick actions (mark as paid, update status)

## Testing Checklist

- [ ] Create order with all fields
- [ ] Create order with product that has BOM
- [ ] Create order with product without BOM
- [ ] View order details
- [ ] Delete order
- [ ] Filter by status
- [ ] Search by order number
- [ ] Search by client name
- [ ] Check due date warnings (overdue, near due)
- [ ] Verify payment tracking display
- [ ] Verify BOM extraction display
- [ ] Check toast notifications

## Notes

- The system uses client-side rendering (`"use client"`) for interactive components
- Server actions handle all database operations
- Form validation is currently basic (required fields only)
- User authentication is mocked with `CURRENT_USER_ID` constant
- All dates are formatted using `date-fns` library
- Professional pharmaceutical blue (`#0F4C81`) is used throughout for brand consistency
