"use client"

import { Download, FileText, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// CSV Export
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; header: string }[]
): void {
  if (data.length === 0) {
    alert('No data to export')
    return
  }

  const headers = columns
    ? columns.map(col => col.header)
    : Object.keys(data[0])

  const keys = columns
    ? columns.map(col => col.key)
    : Object.keys(data[0]) as (keyof T)[]

  const csvRows: string[] = []

  // Add BOM for Excel UTF-8 recognition
  csvRows.push('\ufeff' + headers.join(','))

  // Add data rows
  for (const row of data) {
    const values = keys.map(key => {
      const value = row[key]
      if (value === null || value === undefined) return ''
      if (typeof value === 'string') {
        const escaped = value.replace(/"/g, '""')
        return `"${escaped}"`
      }
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          return `"${value.join('; ')}"`
        }
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`
      }
      return String(value)
    })
    csvRows.push(values.join(','))
  }

  const csvContent = csvRows.join('\n')
  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;')
}

// PDF Export (basic HTML to PDF)
export function exportToPDF<T extends Record<string, any>>(
  data: T[],
  filename: string,
  title: string,
  columns?: { key: keyof T; header: string }[]
): void {
  if (data.length === 0) {
    alert('No data to export')
    return
  }

  const headers = columns
    ? columns.map(col => col.header)
    : Object.keys(data[0])

  const keys = columns
    ? columns.map(col => col.key)
    : Object.keys(data[0]) as (keyof T)[]

  // Create HTML table
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #ff6b35; text-align: center; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #ff6b35; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <table>
        <thead>
          <tr>
            ${headers.map(header => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${keys.map(key => {
                const value = row[key]
                const displayValue = value === null || value === undefined ? '' :
                  typeof value === 'object' ? JSON.stringify(value) : String(value)
                return `<td>${displayValue}</td>`
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        Generated on ${new Date().toLocaleString()} | Total records: ${data.length}
      </div>
    </body>
    </html>
  `

  // Create blob and download
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  // Note: For true PDF export, you would need a library like jsPDF or Puppeteer
  // This creates an HTML file that can be printed to PDF
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export Button Component
interface ExportButtonProps<T extends Record<string, any>> {
  data: T[]
  filename: string
  columns?: { key: keyof T; header: string }[]
  sheetName?: string
  title?: string
}

export function ExportButtons<T extends Record<string, any>>({
  data,
  filename,
  columns,
  title,
}: ExportButtonProps<T>) {
  const [exporting, setExporting] = useState<string | null>(null)

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setExporting(format)
    try {
      switch (format) {
        case 'csv':
          exportToCSV(data, filename, columns)
          break
        case 'pdf':
          exportToPDF(data, filename, title || filename, columns)
          break
      }
    } finally {
      setTimeout(() => setExporting(null), 1000)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={data.length === 0}
          className="border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300"
        >
          {exporting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-700">
        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          disabled={!!exporting}
          className="text-neutral-300 hover:text-white hover:bg-neutral-800"
        >
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={!!exporting}
          className="text-neutral-300 hover:text-white hover:bg-neutral-800"
        >
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
