import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  console.log('Clearing existing data...')
  await prisma.notification.deleteMany()
  await prisma.stockHistory.deleteMany()
  await prisma.cycleTimeLog.deleteMany()
  await prisma.purchaseRequest.deleteMany()
  await prisma.materialReturn.deleteMany()
  await prisma.productionBatch.deleteMany()
  await prisma.materialRequestItem.deleteMany()
  await prisma.materialRequest.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.salesOrder.deleteMany()
  await prisma.purchaseOrder.deleteMany()
  await prisma.bomItem.deleteMany()
  await prisma.bom.deleteMany()
  await prisma.finishedInventory.deleteMany()
  await prisma.inventoryItem.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.product.deleteMany()
  await prisma.client.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  // Create demo user
  console.log('Creating user...')
  const user = await prisma.user.create({
    data: {
      email: 'admin@pharmaline.com',
      name: 'VP Operations',
      role: 'ADMIN',
      isActive: true,
    },
  })

  // Create suppliers
  console.log('Creating suppliers...')
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'Global Pharma Supply Co.',
        contactPerson: 'John Smith',
        email: 'john@globalpharm a.com',
        phone: '+1-555-0101',
        address: '123 Industrial Blvd, Newark, NJ',
        isActive: true,
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'MediChem Industries',
        contactPerson: 'Sarah Johnson',
        email: 'sarah@medichem.com',
        phone: '+1-555-0102',
        address: '456 Chemical Way, Houston, TX',
        isActive: true,
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'PackTech Solutions',
        contactPerson: 'Mike Chen',
        email: 'mike@packtech.com',
        phone: '+1-555-0103',
        address: '789 Packaging Dr, Los Angeles, CA',
        isActive: true,
      },
    }),
  ])

  // Create inventory items (raw materials & packaging)
  console.log('Creating inventory items...')
  const inventoryItems = await Promise.all([
    // Raw Materials
    prisma.inventoryItem.create({
      data: {
        itemCode: 'RM-001',
        name: 'Metformin HCl API',
        category: 'RAW_MATERIAL',
        currentStock: 250,
        unit: 'kg',
        reorderPoint: 100,
        supplierId: suppliers[0].id,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        itemCode: 'RM-002',
        name: 'Lisinopril API',
        category: 'RAW_MATERIAL',
        currentStock: 45,
        unit: 'kg',
        reorderPoint: 50,
        supplierId: suppliers[0].id,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        itemCode: 'RM-003',
        name: 'Ibuprofen API',
        category: 'RAW_MATERIAL',
        currentStock: 180,
        unit: 'kg',
        reorderPoint: 80,
        supplierId: suppliers[1].id,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        itemCode: 'RM-004',
        name: 'Atorvastatin API',
        category: 'RAW_MATERIAL',
        currentStock: 92,
        unit: 'kg',
        reorderPoint: 60,
        supplierId: suppliers[1].id,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        itemCode: 'RM-005',
        name: 'Amoxicillin API',
        category: 'RAW_MATERIAL',
        currentStock: 135,
        unit: 'kg',
        reorderPoint: 75,
        supplierId: suppliers[0].id,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        itemCode: 'RM-006',
        name: 'Microcrystalline Cellulose',
        category: 'RAW_MATERIAL',
        currentStock: 450,
        unit: 'kg',
        reorderPoint: 200,
        supplierId: suppliers[1].id,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        itemCode: 'RM-007',
        name: 'Magnesium Stearate',
        category: 'RAW_MATERIAL',
        currentStock: 28,
        unit: 'kg',
        reorderPoint: 30,
        supplierId: suppliers[1].id,
      },
    }),
    // Packaging Materials
    prisma.inventoryItem.create({
      data: {
        itemCode: 'PM-001',
        name: 'PTP Aluminum Foil (250mm)',
        category: 'PACKAGING_MATERIAL',
        currentStock: 2.5,
        unit: 'kg',
        reorderPoint: 10,
        supplierId: suppliers[2].id,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        itemCode: 'PM-002',
        name: 'PVC Film (250mm)',
        category: 'PACKAGING_MATERIAL',
        currentStock: 38,
        unit: 'kg',
        reorderPoint: 25,
        supplierId: suppliers[2].id,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        itemCode: 'PM-003',
        name: 'HDPE Bottles (100ml)',
        category: 'PACKAGING_MATERIAL',
        currentStock: 15200,
        unit: 'pieces',
        reorderPoint: 5000,
        supplierId: suppliers[2].id,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        itemCode: 'PM-004',
        name: 'Cardboard Boxes (20 units)',
        category: 'PACKAGING_MATERIAL',
        currentStock: 3200,
        unit: 'pieces',
        reorderPoint: 1000,
        supplierId: suppliers[2].id,
      },
    }),
  ])

  // Create products
  console.log('Creating products...')
  const products = await Promise.all([
    prisma.product.create({
      data: {
        sku: 'PROD-001',
        name: 'Metformin 850mg Tablets',
        description: 'Oral antidiabetic medication',
        unit: 'bottles (1000 tablets)',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'PROD-002',
        name: 'Lisinopril 10mg Tablets',
        description: 'ACE inhibitor for hypertension',
        unit: 'bottles (500 tablets)',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'PROD-003',
        name: 'Ibuprofen 400mg Tablets',
        description: 'NSAID pain reliever',
        unit: 'bottles (1000 tablets)',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'PROD-004',
        name: 'Atorvastatin 20mg Tablets',
        description: 'Cholesterol-lowering statin',
        unit: 'bottles (500 tablets)',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'PROD-005',
        name: 'Amoxicillin 500mg Capsules',
        description: 'Antibiotic for bacterial infections',
        unit: 'bottles (1000 capsules)',
        isActive: true,
      },
    }),
  ])

  // Create BOMs for products
  console.log('Creating BOMs...')
  await prisma.bom.create({
    data: {
      productId: products[0].id, // Metformin
      version: '1.0',
      notes: 'Standard formulation for 1000 tablets',
      isActive: true,
      items: {
        create: [
          {
            inventoryItemId: inventoryItems[0].id, // Metformin API
            quantityRequired: 0.85,
            unit: 'kg',
            notes: '850mg x 1000 tablets',
          },
          {
            inventoryItemId: inventoryItems[5].id, // MCC
            quantityRequired: 0.12,
            unit: 'kg',
            notes: 'Filler',
          },
          {
            inventoryItemId: inventoryItems[6].id, // Mag Stearate
            quantityRequired: 0.01,
            unit: 'kg',
            notes: 'Lubricant',
          },
          {
            inventoryItemId: inventoryItems[7].id, // Foil
            quantityRequired: 0.05,
            unit: 'kg',
            notes: 'Blister packaging',
          },
        ],
      },
    },
  })

  await prisma.bom.create({
    data: {
      productId: products[1].id, // Lisinopril
      version: '1.0',
      notes: 'Standard formulation for 500 tablets',
      isActive: true,
      items: {
        create: [
          {
            inventoryItemId: inventoryItems[1].id, // Lisinopril API
            quantityRequired: 0.005,
            unit: 'kg',
            notes: '10mg x 500 tablets',
          },
          {
            inventoryItemId: inventoryItems[5].id, // MCC
            quantityRequired: 0.08,
            unit: 'kg',
            notes: 'Filler',
          },
          {
            inventoryItemId: inventoryItems[6].id, // Mag Stearate
            quantityRequired: 0.005,
            unit: 'kg',
            notes: 'Lubricant',
          },
          {
            inventoryItemId: inventoryItems[7].id, // Foil
            quantityRequired: 0.03,
            unit: 'kg',
            notes: 'Blister packaging',
          },
        ],
      },
    },
  })

  // Create clients
  console.log('Creating clients...')
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: 'Global Health Corp',
        contactPerson: 'Dr. Emily Roberts',
        email: 'emily@globalhealthcorp.com',
        phone: '+1-555-0201',
        address: '100 Medical Plaza, Boston, MA',
        isActive: true,
      },
    }),
    prisma.client.create({
      data: {
        name: 'Central Pharma Distribution',
        contactPerson: 'Robert Taylor',
        email: 'robert@centralpharma.com',
        phone: '+1-555-0202',
        address: '200 Distribution Way, Chicago, IL',
        isActive: true,
      },
    }),
    prisma.client.create({
      data: {
        name: 'Nordic Meds AB',
        contactPerson: 'Anna Svensson',
        email: 'anna@nordicmeds.se',
        phone: '+46-8-555-0100',
        address: 'Sjövägen 15, Stockholm, Sweden',
        isActive: true,
      },
    }),
    prisma.client.create({
      data: {
        name: 'City Hospital Network',
        contactPerson: 'Dr. James Wilson',
        email: 'james@cityhospital.org',
        phone: '+1-555-0203',
        address: '500 Hospital Dr, New York, NY',
        isActive: true,
      },
    }),
  ])

  // Create purchase orders with full workflow
  console.log('Creating purchase orders with workflow...')

  // PO 1: In Production (complete workflow)
  const po1 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-9821',
      clientId: clients[0].id,
      productId: products[0].id,
      quantity: 50,
      expectedDeliveryDate: new Date('2026-03-15'),
      status: 'IN_PRODUCTION',
      createdById: user.id,
    },
  })

  const so1 = await prisma.salesOrder.create({
    data: {
      purchaseOrderId: po1.id,
      soNumber: 'SO-2601',
      materialStatus: 'ALL_AVAILABLE',
      approvedAt: new Date(),
    },
  })

  const mr1 = await prisma.materialRequest.create({
    data: {
      salesOrderId: so1.id,
      requestNumber: 'MR-1001',
      status: 'FULFILLED',
      approvedById: user.id,
      approvedAt: new Date(),
      fulfilledById: user.id,
      fulfilledAt: new Date(),
      items: {
        create: [
          {
            inventoryItemId: inventoryItems[0].id,
            quantityRequested: 42.5,
            quantityIssued: 42.5,
            unit: 'kg',
          },
          {
            inventoryItemId: inventoryItems[5].id,
            quantityRequested: 6,
            quantityIssued: 6,
            unit: 'kg',
          },
        ],
      },
    },
  })

  const batch1 = await prisma.productionBatch.create({
    data: {
      salesOrderId: so1.id,
      productId: products[0].id,
      batchNumber: 'BATCH-0419',
      plannedQuantity: 50,
      status: 'IN_PROGRESS',
      scheduledStart: new Date('2026-03-08'),
      actualStart: new Date('2026-03-08T08:00:00'),
      scheduledEnd: new Date('2026-03-10'),
      createdById: user.id,
    },
  })

  await prisma.payment.create({
    data: {
      purchaseOrderId: po1.id,
      totalAmount: 45000,
      advanceAmount: 22500,
      advanceDate: new Date('2026-03-01'),
      balanceAmount: 22500,
      status: 'PARTIAL',
    },
  })

  // PO 2: Awaiting Materials
  const po2 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-9822',
      clientId: clients[1].id,
      productId: products[1].id,
      quantity: 100,
      expectedDeliveryDate: new Date('2026-03-18'),
      status: 'AWAITING_MATERIALS',
      createdById: user.id,
    },
  })

  const so2 = await prisma.salesOrder.create({
    data: {
      purchaseOrderId: po2.id,
      soNumber: 'SO-2602',
      materialStatus: 'MISSING_MATERIALS',
      approvedAt: new Date(),
    },
  })

  const mr2 = await prisma.materialRequest.create({
    data: {
      salesOrderId: so2.id,
      requestNumber: 'MR-1002',
      status: 'APPROVED',
      approvedById: user.id,
      approvedAt: new Date(),
    },
  })

  await prisma.payment.create({
    data: {
      purchaseOrderId: po2.id,
      totalAmount: 58000,
      advanceAmount: 29000,
      advanceDate: new Date('2026-03-02'),
      balanceAmount: 29000,
      status: 'PARTIAL',
    },
  })

  // PO 3: Ready to Dispatch
  const po3 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-9825',
      clientId: clients[2].id,
      productId: products[2].id,
      quantity: 75,
      expectedDeliveryDate: new Date('2026-03-12'),
      status: 'READY_TO_DISPATCH',
      createdById: user.id,
    },
  })

  const so3 = await prisma.salesOrder.create({
    data: {
      purchaseOrderId: po3.id,
      soNumber: 'SO-2603',
      materialStatus: 'ALL_AVAILABLE',
      approvedAt: new Date(),
    },
  })

  const mr3 = await prisma.materialRequest.create({
    data: {
      salesOrderId: so3.id,
      requestNumber: 'MR-1003',
      status: 'FULFILLED',
      approvedById: user.id,
      approvedAt: new Date(),
      fulfilledById: user.id,
      fulfilledAt: new Date(),
    },
  })

  const batch3 = await prisma.productionBatch.create({
    data: {
      salesOrderId: so3.id,
      productId: products[2].id,
      batchNumber: 'BATCH-0418',
      plannedQuantity: 75,
      actualQuantity: 74,
      yieldPercentage: 98.67,
      status: 'COMPLETED',
      scheduledStart: new Date('2026-03-03'),
      actualStart: new Date('2026-03-03T09:00:00'),
      scheduledEnd: new Date('2026-03-05'),
      actualEnd: new Date('2026-03-05T15:30:00'),
      createdById: user.id,
    },
  })

  await prisma.finishedInventory.create({
    data: {
      productId: products[2].id,
      quantity: 74,
      batchNumber: batch3.batchNumber,
    },
  })

  await prisma.payment.create({
    data: {
      purchaseOrderId: po3.id,
      totalAmount: 52000,
      advanceAmount: 26000,
      advanceDate: new Date('2026-02-28'),
      balanceAmount: 26000,
      status: 'PARTIAL',
    },
  })

  // PO 4: Recently Received
  const po4 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-9828',
      clientId: clients[3].id,
      productId: products[3].id,
      quantity: 60,
      expectedDeliveryDate: new Date('2026-03-20'),
      status: 'IN_PRODUCTION',
      createdById: user.id,
    },
  })

  const so4 = await prisma.salesOrder.create({
    data: {
      purchaseOrderId: po4.id,
      soNumber: 'SO-2604',
      materialStatus: 'ALL_AVAILABLE',
      approvedAt: new Date(),
    },
  })

  const mr4 = await prisma.materialRequest.create({
    data: {
      salesOrderId: so4.id,
      requestNumber: 'MR-1004',
      status: 'FULFILLED',
      approvedById: user.id,
      approvedAt: new Date(),
      fulfilledById: user.id,
      fulfilledAt: new Date(),
    },
  })

  const batch4 = await prisma.productionBatch.create({
    data: {
      salesOrderId: so4.id,
      productId: products[3].id,
      batchNumber: 'BATCH-0420',
      plannedQuantity: 60,
      status: 'PLANNED',
      scheduledStart: new Date('2026-03-06T14:00:00'),
      scheduledEnd: new Date('2026-03-09'),
      createdById: user.id,
    },
  })

  await prisma.payment.create({
    data: {
      purchaseOrderId: po4.id,
      totalAmount: 48000,
      advanceAmount: 24000,
      advanceDate: new Date('2026-03-04'),
      balanceAmount: 24000,
      status: 'PARTIAL',
    },
  })

  // Create purchase requests for low stock items
  console.log('Creating purchase requests...')
  await Promise.all([
    prisma.purchaseRequest.create({
      data: {
        inventoryItemId: inventoryItems[7].id, // Foil (critical)
        quantityNeeded: 20,
        supplierId: suppliers[2].id,
        estimatedETA: new Date('2026-03-12'),
        status: 'ORDERED',
        orderedAt: new Date(),
        createdById: user.id,
      },
    }),
    prisma.purchaseRequest.create({
      data: {
        inventoryItemId: inventoryItems[6].id, // Mag Stearate (warning)
        quantityNeeded: 25,
        supplierId: suppliers[1].id,
        estimatedETA: new Date('2026-03-10'),
        status: 'PENDING',
        createdById: user.id,
      },
    }),
    prisma.purchaseRequest.create({
      data: {
        inventoryItemId: inventoryItems[1].id, // Lisinopril (warning)
        quantityNeeded: 50,
        supplierId: suppliers[0].id,
        status: 'PENDING',
        createdById: user.id,
      },
    }),
  ])

  // Create notifications
  console.log('Creating notifications...')
  await Promise.all([
    prisma.notification.create({
      data: {
        type: 'LOW_STOCK',
        title: 'Critical: Low Stock Alert',
        message: 'PTP Aluminum Foil (250mm) is critically low (2.5kg remaining). Reorder point: 10kg',
        severity: 'CRITICAL',
        referenceId: inventoryItems[7].id,
        referenceType: 'InventoryItem',
      },
    }),
    prisma.notification.create({
      data: {
        type: 'LOW_STOCK',
        title: 'Warning: Low Stock Alert',
        message: 'Magnesium Stearate is below reorder point (28kg remaining). Reorder point: 30kg',
        severity: 'WARNING',
        referenceId: inventoryItems[6].id,
        referenceType: 'InventoryItem',
      },
    }),
    prisma.notification.create({
      data: {
        type: 'LOW_STOCK',
        title: 'Warning: Low Stock Alert',
        message: 'Lisinopril API is below reorder point (45kg remaining). Reorder point: 50kg',
        severity: 'WARNING',
        referenceId: inventoryItems[1].id,
        referenceType: 'InventoryItem',
      },
    }),
    prisma.notification.create({
      data: {
        type: 'MATERIAL_REQUEST_PENDING',
        title: 'Material Request Awaiting Approval',
        message: 'Material Request MR-1002 for PO-9822 is awaiting approval',
        severity: 'INFO',
        referenceId: mr2.id,
        referenceType: 'MaterialRequest',
      },
    }),
    prisma.notification.create({
      data: {
        type: 'PRODUCTION_COMPLETE',
        title: 'Production Batch Completed',
        message: `Batch ${batch3.batchNumber} (Ibuprofen 400mg) completed with 98.67% yield`,
        severity: 'INFO',
        referenceId: batch3.id,
        referenceType: 'ProductionBatch',
        isRead: true,
      },
    }),
  ])

  console.log('✅ Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - 1 User`)
  console.log(`   - 3 Suppliers`)
  console.log(`   - 11 Inventory Items (7 raw, 4 packaging)`)
  console.log(`   - 5 Products`)
  console.log(`   - 2 BOMs (Metformin, Lisinopril)`)
  console.log(`   - 4 Clients`)
  console.log(`   - 4 Purchase Orders (various stages)`)
  console.log(`   - 4 Sales Orders`)
  console.log(`   - 4 Material Requests`)
  console.log(`   - 4 Production Batches (2 planned, 1 in progress, 1 completed)`)
  console.log(`   - 4 Payments`)
  console.log(`   - 3 Purchase Requests`)
  console.log(`   - 5 Notifications`)
  console.log('\n🔐 Login: admin@pharmaline.com')
  console.log('🌐 URL: http://localhost:3003')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await pool.end()
    await prisma.$disconnect()
  })
