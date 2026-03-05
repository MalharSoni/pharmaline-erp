import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { InventoryTable } from '@/components/inventory/inventory-table'
import { getInventoryItems, getSuppliers } from '@/app/actions/inventory'

export default async function InventoryPage() {
  const [inventoryResult, suppliersResult] = await Promise.all([
    getInventoryItems(),
    getSuppliers(),
  ])

  const items = inventoryResult.success && inventoryResult.data ? inventoryResult.data : []
  const suppliers = suppliersResult.success && suppliersResult.data ? suppliersResult.data : []

  return (
    <DashboardLayout title="Inventory Management">
      <InventoryTable items={items} suppliers={suppliers} />
    </DashboardLayout>
  )
}
