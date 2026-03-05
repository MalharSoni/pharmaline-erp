'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react'
import { importInventoryCSV, CSVInventoryRow } from '@/app/actions/inventory'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface CSVImportModalProps {
  open: boolean
  onClose: () => void
}

export function CSVImportModal({ open, onClose }: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<CSVInventoryRow[]>([])
  const [duplicateHandling, setDuplicateHandling] = useState<'skip' | 'update'>('skip')
  const [loading, setLoading] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const [dragActive, setDragActive] = useState(false)

  const parseCSV = (text: string): CSVInventoryRow[] => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map((h) => h.trim())
    const data: CSVInventoryRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim())
      if (values.length !== headers.length) continue

      data.push({
        itemCode: values[0],
        name: values[1],
        category: values[2],
        currentStock: values[3],
        unit: values[4],
        reorderPoint: values[5],
        supplierId: values[6] || undefined,
      })
    }

    return data
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }

  const processFile = (selectedFile: File) => {
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    setFile(selectedFile)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const parsed = parseCSV(text)
      setPreview(parsed.slice(0, 5))
    }
    reader.readAsText(selectedFile)
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      processFile(droppedFile)
    }
  }, [])

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setLoading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const text = event.target?.result as string
        const parsed = parseCSV(text)

        const result = await importInventoryCSV(parsed, duplicateHandling)

        if (result.success) {
          setImportResult(result.data)
          toast.success('Import completed')
        } else {
          toast.error(result.error || 'Import failed')
        }
        setLoading(false)
      }
      reader.readAsText(file)
    } catch (error) {
      toast.error('An error occurred')
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreview([])
    setImportResult(null)
    setDuplicateHandling('skip')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-bold text-[#171717]">
            Import Inventory from CSV
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#737373]">
            Upload a CSV file with columns: itemCode, name, category, currentStock, unit, reorderPoint, supplierId
          </DialogDescription>
        </DialogHeader>

        {importResult ? (
          <div className="space-y-4 mt-4">
            <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-[10px] p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-[#15803D]" />
                <h3 className="text-[14px] font-bold text-[#171717]">Import Completed</h3>
              </div>
              <div className="space-y-2 text-[13px] text-[#171717]">
                <p>Created: <span className="font-bold">{importResult.created}</span> items</p>
                <p>Updated: <span className="font-bold">{importResult.updated}</span> items</p>
                <p>Skipped: <span className="font-bold">{importResult.skipped}</span> items</p>
                {importResult.errors.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[#DC2626] font-semibold mb-1">Errors:</p>
                    <ul className="list-disc list-inside text-[12px] text-[#DC2626]">
                      {importResult.errors.map((error: string, idx: number) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={handleClose}
              className="w-full bg-[#171717] text-white hover:opacity-88 font-semibold text-[13px]"
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* File Upload */}
            <div
              className={`border-2 border-dashed rounded-[10px] p-8 text-center transition-colors duration-150 ${
                dragActive
                  ? 'border-[#171717] bg-[#F5F5F5]'
                  : 'border-[#D4D4D4] hover:border-[#A3A3A3]'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="csv-upload"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="w-10 h-10 text-[#A3A3A3] mx-auto mb-3" />
                <p className="text-[13px] font-semibold text-[#171717] mb-1">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-[12px] text-[#737373]">CSV files only</p>
              </label>
            </div>

            {/* Preview */}
            {preview.length > 0 && (
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-[#171717]">
                  Preview (first 5 rows)
                </Label>
                <div className="border border-[#D4D4D4] rounded-[10px] overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#F5F5F5] border-b border-[#D4D4D4] hover:bg-[#F5F5F5]">
                          <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                            Item Code
                          </TableHead>
                          <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                            Name
                          </TableHead>
                          <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                            Category
                          </TableHead>
                          <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                            Stock
                          </TableHead>
                          <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                            Unit
                          </TableHead>
                          <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                            Reorder
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.map((row, idx) => (
                          <TableRow
                            key={idx}
                            className="border-b border-[#D4D4D4] hover:bg-[#F5F5F5]"
                          >
                            <TableCell className="text-[12px] text-[#171717] h-10">
                              {row.itemCode}
                            </TableCell>
                            <TableCell className="text-[12px] text-[#171717] h-10">
                              {row.name}
                            </TableCell>
                            <TableCell className="text-[12px] text-[#171717] h-10">
                              {row.category}
                            </TableCell>
                            <TableCell className="text-[12px] text-[#171717] h-10">
                              {row.currentStock}
                            </TableCell>
                            <TableCell className="text-[12px] text-[#171717] h-10">
                              {row.unit}
                            </TableCell>
                            <TableCell className="text-[12px] text-[#171717] h-10">
                              {row.reorderPoint}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}

            {/* Duplicate Handling */}
            {file && (
              <div className="space-y-2">
                <Label className="text-[13px] font-semibold text-[#171717]">
                  Duplicate Handling
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={duplicateHandling === 'skip' ? 'default' : 'outline'}
                    className="flex-1 text-[13px] font-semibold"
                    onClick={() => setDuplicateHandling('skip')}
                  >
                    Skip Duplicates
                  </Button>
                  <Button
                    type="button"
                    variant={duplicateHandling === 'update' ? 'default' : 'outline'}
                    className="flex-1 text-[13px] font-semibold"
                    onClick={() => setDuplicateHandling('update')}
                  >
                    Update Existing
                  </Button>
                </div>
                <p className="text-[11px] text-[#737373]">
                  {duplicateHandling === 'skip'
                    ? 'Skip items with existing item codes'
                    : 'Update existing items with new data from CSV'}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-[#D4D4D4]">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="text-[13px] font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!file || loading}
                className="bg-[#171717] text-white hover:opacity-88 font-semibold text-[13px]"
              >
                {loading ? 'Importing...' : 'Import'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
