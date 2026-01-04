'use client'

import { useState } from 'react'
import ReportModal from './ReportModal'
import { fetchTransactionsByDate } from '@/lib/reports'
import { generateFinanceReportPDF } from '@/lib/pdf/financeReport'
import { auth } from '@/lib/firebase'
import { Button } from '@heroui/button'

export default function GenerateReportButton() {
  const [open, setOpen] = useState(false)

  async function handleGenerate(start: Date, end: Date) {
    const user_id = auth.currentUser?.uid
    if (!user_id) return

    const transactions = await fetchTransactionsByDate(
      user_id,
      start,
      end
    )

    generateFinanceReportPDF(transactions, start, end)
    setOpen(false)
  }

  return (
    <>
      <Button  color="secondary" variant="ghost" onClick={() => setOpen(true)}>
        Generate Report
      </Button>

      {open && <ReportModal onGenerate={handleGenerate} />}
    </>
  )
}
