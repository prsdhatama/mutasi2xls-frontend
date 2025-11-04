import * as pdfjsLib from 'pdfjs-dist'
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.394/pdf.worker.min.mjs'

import * as XLSX from 'xlsx'
import { detectCategory } from '@/utils/lookup'

export async function parseBCA (arrayBuffer) {
  const pdf = await getDocument({ data: arrayBuffer }).promise

  let allText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const text = await page.getTextContent()
    allText += text.items.map(t => t.str).join(' ') + '\n'
    console.log('=== RAW TEXT PAGE ===')
    console.log(allText)
  }

  const lines = allText
    .split(/\n|(?=\d{2}\/\d{2})/)
    .map(l => l.trim())
    .filter(l => l.match(/^\d{2}\/\d{2}/))

  const rows = []

  for (const line of lines) {
    const match = line.match(
      /^(\d{2}\/\d{2})\s+(.+?)\s+([\d.,]+)\s*(DB|CR)?\s*([\d.,]+)?$/
    )
    if (match) {
      let [, date, desc, amount, type, balance] = match

      desc = desc.replace(/^QR\s*\d+\s+[\d.,]+/, '').trim()
      desc = desc.replace(/^QRC\d+\s*0*[\d.,]*/, '').trim()
      desc = desc.replace(/CBG\s*\d+/, '').trim()

      const cat = detectCategory(desc)

      const cleanAmount = normalizeRupiah(amount)
      const cleanBalance = balance ? normalizeRupiah(balance) : ''

      rows.push({
        date,
        description: desc,
        category: cat,
        amount: cleanAmount,
        type: type || '',
        balance: cleanBalance
      })
    }
  }

  return rows
}

function normalizeRupiah (numStr) {
  if (!numStr) return ''
  numStr = numStr.replace(/[^0-9]/g, '')
  let numeric = parseInt(numStr) || 0
  numeric = Math.floor(numeric / 100)
  return numeric.toLocaleString('id-ID')
}

export function downloadExcel (rows) {
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'BCA')
  XLSX.writeFile(wb, 'BCA_Statement.xlsx')
}
