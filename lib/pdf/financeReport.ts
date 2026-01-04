import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Timestamp } from 'firebase/firestore'

function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount))
}

function formatDate(value: Timestamp | Date) {
  const date = value instanceof Date ? value : value.toDate()
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Format date for filename (YYYY-MM-DD)
function formatDateForFile(date: Date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function generateFinanceReportPDF(
  transactions: any[],
  start: Date,
  end: Date
) {
    const doc = new jsPDF()

    const incomes = transactions.filter(t => t.type === 'income')
    const expenses = transactions.filter(t => t.type === 'expense')

    const incomeTotal = incomes.reduce((s, t) => s + Number(t.amount), 0)
    const expenseTotal = expenses.reduce((s, t) => s + Number(t.amount), 0)

    /* ===== HEADER ===== */
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 14
    let currentY = 15

    // Centered title
    doc.setFontSize(16)
    doc.text('Stan’s Finance Tracker', pageWidth / 2, currentY, { align: 'center' })
    currentY += 7

    // Centered subtitle
    doc.setFontSize(12)
    doc.text('Personal Finance Report', pageWidth / 2, currentY, { align: 'center' })
    currentY += 10

    // Two columns: Period (left) | Date Generated (right)
    doc.setFontSize(10)
    const periodText = `Period: ${start.toDateString()} - ${end.toDateString()}`
    const dateGeneratedText = `Date Generated: ${new Date().toDateString()}`
    doc.text(periodText, margin, currentY)
    const rightX = pageWidth - margin - doc.getTextWidth(dateGeneratedText)
    doc.text(dateGeneratedText, rightX, currentY)
    currentY += 10



    /* ===== TOTALS WITH COLOR FILL ===== */
    const totalHeight = 8
    const totalPadding = 2

    // Total Income (green background)
    const incomeText = `Total Income: ${formatAmount(incomeTotal)}`
    const incomeWidth = doc.getTextWidth(incomeText) + totalPadding * 2
    doc.setFillColor(220, 252, 231)
    doc.rect(margin, currentY - totalHeight + 2, incomeWidth, totalHeight, 'F')
    doc.setFontSize(11)
    doc.setTextColor(22, 101, 52)
    doc.text(incomeText, margin + totalPadding, currentY)

    // Total Expense (red background)
    const expenseText = `Total Expense: ${formatAmount(expenseTotal)}`
    const expenseWidth = doc.getTextWidth(expenseText) + totalPadding * 2
    const expenseX = pageWidth - margin - expenseWidth
    doc.setFillColor(254, 226, 226)
    doc.rect(expenseX, currentY - totalHeight + 2, expenseWidth, totalHeight, 'F')
    doc.setTextColor(153, 27, 27)
    doc.text(expenseText, expenseX + totalPadding, currentY)

    // Reset color
    doc.setTextColor(0, 0, 0)
    currentY += totalHeight + 6 // space before tables

    /* ===== INCOME TABLE ===== */
    if (incomes.length > 0) {
    autoTable(doc, {
        startY: currentY,
        theme: 'grid',
        head: [['Date', 'Account', 'Category', 'Amount']],
        body: incomes.map(i => [
        formatDate(i.date_incurred),
        i.account_name,
        i.category,
        formatAmount(i.amount)
        ]),
        foot: [['', '', 'Total', formatAmount(incomeTotal)]],
        footStyles: {
        fillColor: [220, 252, 231],
        textColor: [22, 101, 52],
        fontStyle: 'bold'
        },
        headStyles: {
        fillColor: [220, 252, 231],
        textColor: [22, 101, 52],
        fontStyle: 'bold'
        },
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 3: { halign: 'right' } }
    })
    currentY = (doc as any).lastAutoTable?.finalY + 10
    }

    /* ===== EXPENSE TABLE ===== */
    if (expenses.length > 0) {
    autoTable(doc, {
        startY: currentY,
        theme: 'grid',
        head: [['Date', 'Account', 'Category', 'Amount']],
        body: expenses.map(e => [
        formatDate(e.date_incurred),
        e.account_name,
        e.category,
        formatAmount(e.amount)
        ]),
        foot: [['', '', 'Total', formatAmount(expenseTotal)]],
        footStyles: {
        fillColor: [254, 226, 226],
        textColor: [153, 27, 27],
        fontStyle: 'bold'
        },
        headStyles: {
        fillColor: [254, 226, 226],
        textColor: [153, 27, 27],
        fontStyle: 'bold'
        },
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 3: { halign: 'right' } }
    })
    }

    /* ===== SAVE PDF ===== */
    const fileName = `sft_finance_report_${formatDateForFile(start)}-${formatDateForFile(end)}.pdf`
    doc.save(fileName)

    }
