# Inventory Management & BOM System

## Overview
Complete implementation of Inventory Management and Bill of Materials (BOM) management for Pharmaline ERP.

## Features Implemented

### Inventory Management (`/inventory`)

#### Main Features
- **Inventory Table**: Comprehensive view of all inventory items
- **Add/Edit Items**: Modal-based form for creating and updating inventory items
- **CSV Import**: Bulk import with drag-and-drop support
- **Status Badges**: Visual indicators for stock levels (Low Stock, In Stock, Overstocked, Out of Stock)
- **Category Management**: Support for Raw Materials and Packaging Materials
- **Supplier Tracking**: Optional supplier association for each item

#### Stock Status Logic
- **Out of Stock**: currentStock = 0
- **Low Stock**: currentStock <= reorderPoint
- **In Stock**: currentStock > reorderPoint (normal range)
- **Overstocked**: currentStock > reorderPoint * 2

#### CSV Import Features
- Drag-and-drop file upload
- Preview first 5 rows before import
- Duplicate handling strategies:
  - **Skip**: Ignore items with existing item codes
  - **Update**: Update existing items with new data
- Automatic stock history tracking
- Error reporting for failed rows

#### CSV Template Format
```csv
itemCode,name,category,currentStock,unit,reorderPoint,supplierId
SKU-001,Gelatin Powder,RAW_MATERIAL,50,kg,15,
SKU-002,Foil PTP,PACKAGING_MATERIAL,2.5,kg,10,
```

Template file available at: `/public/inventory-import-template.csv`

### BOM Management (`/bom`)

#### Main Features
- **Product Formula List**: View all products with their formulas
- **Formula Builder**: Create and edit product formulas (Bill of Materials)
- **Material Calculator**: Calculate material requirements for production quantities
- **Stock Validation**: Real-time check of material availability
- **Version Control**: Track formula versions

#### BOM Detail View
- Product information display
- Production quantity calculator
- Material requirements table with:
  - Quantity per unit
  - Total quantity needed
  - Available stock
  - Sufficiency status (OK / Short by X units)
- Visual indicators for material availability

#### Formula Creation
- Select product (links to existing products in database)
- Add multiple materials from inventory
- Specify quantity required per unit
- Auto-fill units from inventory items
- Optional version numbering
- Optional formula notes

## File Structure

```
app/
  actions/
    inventory.ts              # Inventory server actions
    bom.ts                    # BOM server actions
  (dashboard)/
    inventory/
      page.tsx                # Inventory management page
    bom/
      page.tsx                # BOM management page

components/
  inventory/
    inventory-table.tsx       # Main inventory table with actions
    add-item-modal.tsx        # Create/edit inventory item modal
    csv-import-modal.tsx      # CSV import with preview

  bom/
    bom-table.tsx             # Main BOM table with actions
    product-modal.tsx         # Create/edit product formula modal
    bom-detail-modal.tsx      # View BOM details with calculator

public/
  inventory-import-template.csv  # CSV template for imports
```

## Server Actions

### Inventory Actions (`app/actions/inventory.ts`)
- `getInventoryItems()` - Fetch all inventory items with supplier info
- `addInventoryItem(input)` - Create new inventory item
- `updateInventoryItem(input)` - Update existing item
- `deleteInventoryItem(id)` - Delete item (with BOM usage check)
- `importInventoryCSV(rows, duplicateHandling)` - Bulk import from CSV
- `getSuppliers()` - Fetch active suppliers for dropdown

### BOM Actions (`app/actions/bom.ts`)
- `getProducts()` - Fetch all products with BOMs and items
- `getProductById(id)` - Fetch single product with full BOM details
- `createBOM(input)` - Create new BOM for a product
- `updateBOM(input)` - Update existing BOM (replaces all items)
- `deleteBOM(id)` - Delete BOM
- `getInventoryItemsForBOM()` - Fetch inventory items for formula builder
- `calculateBOMCost(productId, quantity)` - Calculate material requirements

## Database Schema

### InventoryItem
- `itemCode` (unique) - SKU/identifier
- `name` - Item name
- `category` - RAW_MATERIAL | PACKAGING_MATERIAL
- `currentStock` - Current quantity
- `unit` - kg, liters, pieces, etc.
- `reorderPoint` - Threshold for low stock alerts
- `supplierId` - Optional supplier reference
- `lastUpdated` - Auto-updated timestamp

### BOM (Bill of Materials)
- `productId` (unique) - References Product
- `version` - Formula version (e.g., "1.0")
- `notes` - Optional formula notes
- `isActive` - Active status

### BOMItem
- `bomId` - References BOM
- `inventoryItemId` - References InventoryItem
- `quantityRequired` - Amount needed per product unit
- `unit` - Measurement unit
- `notes` - Optional item-specific notes

### StockHistory
Auto-created on:
- New item creation
- Stock adjustments
- CSV imports

## Design Standards Applied

### Typography
- Page titles: 22px, weight 800
- Section headers: 14px, weight 700
- Table headers: 11px, weight 700, uppercase, 0.06em letter-spacing
- Body text: 13px, weight 400
- Badges: 10.5px, weight 700, uppercase

### Colors
- Black text: #171717
- Gray text: #737373 (secondary), #A3A3A3 (tertiary)
- Borders: #D4D4D4
- Backgrounds: #F5F5F5 (subtle fills)
- Status badges: Semantic colors (red/green/amber/blue)

### Spacing
- Card padding: 16-20px
- Table cell height: h-12 (48px)
- Button padding: 7px 14px
- Border radius: 10px (cards), 6px (buttons)
- Grid gap: 14-20px

### Interactions
- Transitions: 150ms standard
- Hover states: opacity/background changes
- Active button: scale(0.97)
- Table row hover: #F5F5F5 background

## Usage Examples

### Adding Inventory Item
1. Navigate to `/inventory`
2. Click "Add Item" button
3. Fill in required fields:
   - Item Code (unique SKU)
   - Name
   - Category (Raw Material or Packaging)
   - Current Stock
   - Unit (kg, liters, pieces)
   - Reorder Point
   - Optional: Select Supplier
4. Click "Add Item"

### Importing CSV
1. Navigate to `/inventory`
2. Click "Import CSV"
3. Drag and drop CSV file or click to browse
4. Review preview of first 5 rows
5. Choose duplicate handling strategy
6. Click "Import"
7. View import summary (created, updated, skipped, errors)

### Creating Product Formula
1. Navigate to `/bom`
2. Click "New Product Formula"
3. Product info auto-displayed (must have existing product)
4. Set formula version (default: 1.0)
5. Add materials:
   - Select material from dropdown
   - Enter quantity per unit
   - Unit auto-fills from material
6. Add more materials as needed
7. Optional: Add formula notes
8. Click "Create Formula"

### Viewing BOM Details
1. Navigate to `/bom`
2. Find product with formula
3. Click eye icon to view details
4. Use calculator:
   - Enter production quantity
   - View total material requirements
   - Check stock sufficiency status
5. Red badges indicate insufficient stock with shortage amount

## Stock History Tracking

All inventory changes are logged in `StockHistory`:
- Initial stock entry
- Manual adjustments
- CSV imports
- Material requests (when integrated)
- Material returns (when integrated)

## Validation & Error Handling

### Inventory
- Item code uniqueness enforced
- Cannot delete items used in BOMs
- Numeric validation for stock/reorder values
- Category must be valid enum value

### BOM
- Product must exist before creating BOM
- Cannot create duplicate BOM for same product
- At least one material required
- Positive quantities required
- Atomic transactions (all items created/updated together)

## Future Enhancements

Potential additions for future sprints:
- Cost tracking per inventory item
- Actual yield percentage tracking from production
- Material waste tracking
- Multi-location inventory
- Barcode scanning for inventory
- BOM cost calculation (requires supplier pricing)
- Historical formula versions comparison
- Batch-specific BOM variants
- Automated reorder suggestions
- Stock movement reports

## Integration Points

Ready for integration with:
- **Orders**: Check material availability before accepting orders
- **Production**: Issue materials based on BOM
- **Sourcing**: Auto-generate purchase requests for low stock
- **Warehouse**: Multi-location stock management
- **Reports**: Stock valuation, usage analytics

## Notes

- All tables use professional fixed heights with proper spacing
- Forms include clear validation messages
- CSV import handles errors gracefully
- Modal designs are clean and focused
- No excessive padding or visual clutter
- All components are server-side rendered by default with client-side interactivity where needed
- TypeScript strict mode compatible
- Prisma transactions ensure data consistency
