# Orders Management - Code Reference

## Quick Start

```bash
# Navigate to orders page
http://localhost:3000/orders
```

## Key File Locations

```
/Users/malharsoni/pharmaline-erp/
├── app/actions/orders.ts                      # Server actions
├── app/(dashboard)/orders/page.tsx            # Main page
├── components/orders/new-order-modal.tsx      # New order dialog
└── components/orders/order-detail-modal.tsx   # Detail view
```

## Status Badge Component Pattern

```tsx
const getStatusBadge = (status: string) => {
  const variants: Record<string, { label: string; className: string }> = {
    IN_PRODUCTION: {
      label: "In Production",
      className: "bg-[#E8F1F8] text-[#0F4C81] border border-[#C5D9E8]"
    },
    AWAITING_MATERIALS: {
      label: "Awaiting Materials",
      className: "bg-[#FFF8E1] text-[#B8860B] border border-[#F5DDA8]"
    },
    // ... more statuses
  }

  const config = variants[status] || variants.PO_RECEIVED
  return (
    <Badge className={`${config.className} text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1`}>
      {config.label}
    </Badge>
  )
}
```

## Table Pattern

```tsx
<Table>
  <TableHeader>
    <TableRow className="bg-[#F5F5F5] border-b border-[#D4D4D4] hover:bg-[#F5F5F5]">
      <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
        Order #
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="border-b border-[#D4D4D4] hover:bg-[#F5F5F5] transition-colors duration-150">
      <TableCell className="text-[13px] text-[#171717] h-12">
        {order.poNumber}
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Professional Card Pattern

```tsx
<div className="border border-[#D4D4D4] rounded-[10px] p-4 bg-white">
  <div className="flex items-center gap-2 mb-2">
    <Package className="w-4 h-4 text-[#737373]" />
    <span className="text-[10px] font-bold uppercase tracking-wide text-[#737373]">
      Product
    </span>
  </div>
  <p className="text-[14px] font-semibold text-[#171717]">{order.product.name}</p>
  <p className="text-[11.5px] text-[#737373] mt-0.5">SKU: {order.product.sku}</p>
</div>
```

## Button Pattern

```tsx
// Primary Action
<Button className="bg-[#0F4C81] text-white hover:bg-[#0A3A61] font-semibold text-[13px] px-4">
  <Plus className="w-4 h-4 mr-1.5" />
  New Order
</Button>

// Secondary Action
<Button
  variant="outline"
  className="text-[13px] font-semibold border-[#D4D4D4] hover:bg-[#F5F5F5]"
>
  Cancel
</Button>

// Destructive Action
<Button
  variant="outline"
  className="text-[#DC2626] border-[#DC2626] hover:bg-[#FEF2F2] text-[13px]"
>
  <Trash2 className="w-4 h-4 mr-1.5" />
  Delete
</Button>
```

## Status Filter Pills

```tsx
const STATUS_FILTERS = [
  { value: "ALL", label: "All Orders" },
  { value: "IN_PRODUCTION", label: "In Production" },
  // ...
]

<div className="flex items-center gap-2">
  {STATUS_FILTERS.map((filter) => (
    <button
      key={filter.value}
      onClick={() => setStatusFilter(filter.value)}
      className={cn(
        "px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors duration-150",
        statusFilter === filter.value
          ? "bg-[#0F4C81] text-white"
          : "bg-white border border-[#D4D4D4] text-[#737373] hover:bg-[#F5F5F5]"
      )}
    >
      {filter.label}
    </button>
  ))}
</div>
```

## Server Action Pattern

```tsx
'use server'

export async function createOrder(data: CreateOrderData) {
  try {
    // Generate unique number
    const poNumber = await generatePONumber()

    // Create in database
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        clientId: data.clientId,
        productId: data.productId,
        quantity: data.quantity,
        expectedDeliveryDate: data.expectedDeliveryDate,
        status: POStatus.PO_RECEIVED,
        createdById: data.createdById,
      },
      include: {
        client: true,
        product: true,
      }
    })

    // Revalidate page
    revalidatePath('/orders')

    return {
      success: true,
      data: { purchaseOrder, poNumber }
    }
  } catch (error) {
    console.error('Error creating order:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order'
    }
  }
}
```

## Toast Usage

```tsx
import { toast } from "sonner"

// Success
toast.success(`Order created: ${result.data?.poNumber}`)

// Error
toast.error(result.error || "Failed to create order")
```

## Date Formatting

```tsx
import { format } from "date-fns"

// Display date
format(new Date(order.expectedDeliveryDate), "MMM d, yyyy")
// Output: "Mar 5, 2026"

// Display date with time
format(new Date(order.approvedAt), "MMM d, yyyy 'at' h:mm a")
// Output: "Mar 5, 2026 at 2:30 PM"
```

## Days Until Due Logic

```tsx
const getDaysUntilDue = (dueDate: string) => {
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const daysUntilDue = getDaysUntilDue(order.expectedDeliveryDate)
const isOverdue = daysUntilDue < 0

<p className={cn(
  "text-[11.5px] font-semibold",
  isOverdue ? "text-[#DC2626]" : daysUntilDue <= 3 ? "text-[#F59E0B]" : "text-[#737373]"
)}>
  {isOverdue
    ? `${Math.abs(daysUntilDue)} days overdue`
    : daysUntilDue === 0
    ? "Due today"
    : `${daysUntilDue} days left`
  }
</p>
```

## Modal Pattern

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle className="text-[18px] font-bold text-[#171717]">
        Create New Purchase Order
      </DialogTitle>
    </DialogHeader>

    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Form content */}
    </form>
  </DialogContent>
</Dialog>
```

## Form Field Pattern

```tsx
<div className="space-y-2">
  <Label className="text-[11px] font-bold uppercase tracking-wide text-[#737373]">
    Client
  </Label>
  <Select
    value={formData.clientId}
    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
  >
    <SelectTrigger className="w-full h-10 text-[13px] border-[#D4D4D4]">
      <SelectValue placeholder="Select client..." />
    </SelectTrigger>
    <SelectContent>
      {clients.map((client) => (
        <SelectItem key={client.id} value={client.id} className="text-[13px]">
          {client.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

## Payment Badge Pattern

```tsx
const getPaymentBadge = (paid: boolean) => {
  if (paid) {
    return (
      <div className="flex items-center gap-1.5 text-[#2E7D32]">
        <CheckCircle className="w-4 h-4" />
        <span className="text-[11.5px] font-semibold">Paid</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1.5 text-[#DC2626]">
      <XCircle className="w-4 h-4" />
      <span className="text-[11.5px] font-semibold">Pending</span>
    </div>
  )
}
```

## Loading State Pattern

```tsx
const [loading, setLoading] = useState(false)

{loading ? (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-[#0F4C81]" />
  </div>
) : (
  // Content
)}

// Button with loading
<Button disabled={loading}>
  {loading ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Creating...
    </>
  ) : (
    "Create Order"
  )}
</Button>
```

## Empty State Pattern

```tsx
{orders.length === 0 ? (
  <div className="flex flex-col items-center justify-center py-12">
    <p className="text-[14px] font-semibold text-[#737373] mb-1">No orders found</p>
    <p className="text-[13px] text-[#A3A3A3] mb-4">
      Create your first order to get started
    </p>
    <Button
      onClick={() => setNewOrderOpen(true)}
      className="bg-[#0F4C81] text-white hover:bg-[#0A3A61] font-semibold text-[13px]"
    >
      <Plus className="w-4 h-4 mr-1.5" />
      New Order
    </Button>
  </div>
) : (
  // Table content
)}
```

## Auto-Number Generation Pattern

```tsx
async function generatePONumber(): Promise<string> {
  const lastPO = await prisma.purchaseOrder.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { poNumber: true }
  })

  if (!lastPO) {
    return 'PO-10001'
  }

  const lastNumber = parseInt(lastPO.poNumber.split('-')[1])
  return `PO-${lastNumber + 1}`
}
```

## Color Reference

```css
/* Professional Pharmaceutical Blue */
--primary: #0F4C81
--primary-hover: #0A3A61

/* Neutral Scale */
--black: #171717
--gray-1: #737373
--gray-2: #A3A3A3
--gray-3: #D4D4D4
--gray-4: #F5F5F5

/* Status Colors */
--success: #2E7D32
--success-dark: #15803D
--warning: #B8860B
--warning-light: #F59E0B
--error: #DC2626
--info: #2563EB

/* Status Backgrounds */
--success-bg: #E8F5E9
--warning-bg: #FFF8E1
--error-bg: #FEF2F2
--info-bg: #EFF6FF
```

## Typography Scale

```css
/* Page Title */
font-size: 22px
font-weight: 800
line-height: tight

/* Section Header */
font-size: 14px
font-weight: 700

/* Section Label (uppercase) */
font-size: 10px
font-weight: 700
text-transform: uppercase
letter-spacing: 0.06em

/* Table Header (uppercase) */
font-size: 11px
font-weight: 700
text-transform: uppercase
letter-spacing: 0.06em

/* Table Cell */
font-size: 13px
font-weight: 400

/* Badge */
font-size: 10.5px
font-weight: 700
text-transform: uppercase
letter-spacing: 0.03em

/* Button */
font-size: 13px
font-weight: 600

/* Body/Meta */
font-size: 11.5px
font-weight: 500
```

## Spacing Standards

```css
/* Card Padding - OPTIMIZED */
padding: 1rem (py-4 px-4)
NOT: 1.5rem (py-6 px-6)

/* Card Radius */
border-radius: 10px (rounded-[10px])
NOT: rounded-xl

/* Table Row Height */
height: 3rem (h-12)

/* Border */
border: 1px solid #D4D4D4

/* Shadow */
box-shadow: 0 1px 3px rgba(0,0,0,.08)
```
