import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { BOMTable } from '@/components/bom/bom-table'
import { getProducts, getInventoryItemsForBOM } from '@/app/actions/bom'

export default async function BOMPage() {
  const [productsResult, inventoryResult] = await Promise.all([
    getProducts(),
    getInventoryItemsForBOM(),
  ])

  const products = productsResult.success && productsResult.data ? productsResult.data : []
  const inventoryItems = inventoryResult.success && inventoryResult.data ? inventoryResult.data : []

  return (
    <DashboardLayout title="Bill of Materials (BOM)">
      <BOMTable products={products} inventoryItems={inventoryItems} />
    </DashboardLayout>
  )
}
