import type { Student, FeePayment, StudentFeeSummary, FeeStatus } from '../types';

/**
 * Add N months to a date string (YYYY-MM-DD) safely
 */
export function addMonthsToDate(dateStr: string, monthsToAdd: number): Date {
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);

  const result = new Date(year, month, day);
  const originalDay = result.getDate();
  result.setMonth(result.getMonth() + monthsToAdd);

  // Handle month end overflow (e.g. 31 Jan + 1 month = 28 Feb)
  if (result.getDate() !== originalDay) {
    result.setDate(0);
  }
  return result;
}

/**
 * Format a Date object to YYYY-MM-DD
 */
export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date for friendly Indian English display: "15 Oct 2026"
 */
export function formatFriendlyDate(dateStrOrObj: string | Date | null | undefined): string {
  if (!dateStrOrObj) return '-';
  const d = typeof dateStrOrObj === 'string' ? new Date(dateStrOrObj + 'T00:00:00') : dateStrOrObj;
  if (isNaN(d.getTime())) return '-';

  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format currency to Indian Rupee format: ₹ 1,500
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Generate a readable receipt number
 */
export function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `TM-${year}-${randomStr}`;
}

/**
 * Calculate dynamic 1-month fee status for a student
 * Cycle 1 Due Date = Admission Date + 1 Month (e.g., 12 Oct -> 12 Nov)
 * Cycle 2 Due Date = Admission Date + 2 Months
 */
export function calculateStudentFeeSummary(
  student: Student,
  payments: FeePayment[],
  referenceDate: Date = new Date()
): StudentFeeSummary {
  // Sort payments by date ascending
  const studentPayments = payments
    .filter(p => p.studentId === student.id)
    .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());

  const totalPaidAmount = studentPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalMonthsPaid = studentPayments.length;

  const lastPayment = studentPayments.length > 0 ? studentPayments[studentPayments.length - 1] : null;
  const lastPaymentDate = lastPayment ? lastPayment.paymentDate : null;

  // Fees are due one month after admission, then on the same calendar day.
  // Find the first unpaid cycle; this retains the correct history if a month is missed.
  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const paidMonths = new Set(studentPayments.map(p => p.billingMonth || p.paymentDate.slice(0, 7)));
  let cycleNum = 1;
  let cycleDueDate = addMonthsToDate(student.admissionDate, cycleNum);
  let unpaidDueCount = 0;
  let firstUnpaidDue: Date | null = null;

  while (cycleDueDate <= today) {
    const key = formatDateISO(cycleDueDate).slice(0, 7);
    if (!paidMonths.has(key)) {
      unpaidDueCount += 1;
      if (!firstUnpaidDue) firstUnpaidDue = new Date(cycleDueDate);
    }
    cycleNum += 1;
    cycleDueDate = addMonthsToDate(student.admissionDate, cycleNum);
  }

  // If nothing is due yet, show the upcoming cycle. Otherwise show the oldest unpaid one.
  const displayedDueDate = firstUnpaidDue ?? cycleDueDate;
  const cycleStartDate = addMonthsToDate(displayedDueDate ? formatDateISO(displayedDueDate) : student.admissionDate, -1);

  // Next cycle label
  const periodEnd = new Date(displayedDueDate);
  periodEnd.setDate(periodEnd.getDate() - 1);
  const nextCycleLabel = `${formatFriendlyDate(cycleStartDate)} - ${formatFriendlyDate(periodEnd)}`;

  const nextDueDateStr = formatDateISO(displayedDueDate);

  // Compare referenceDate with cycleDueDate
  const dueDate = new Date(displayedDueDate.getFullYear(), displayedDueDate.getMonth(), displayedDueDate.getDate());

  const diffTime = today.getTime() - dueDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); // >0: overdue, <0: remaining

  let status: FeeStatus = 'PAID';
  let currentDueAmount = 0;

  if (unpaidDueCount > 0 && diffDays > 0) {
    status = 'OVERDUE';
    // Calculate how many months overdue
    currentDueAmount = student.monthlyFee * unpaidDueCount;
  } else if (unpaidDueCount > 0 || (diffDays >= -3 && diffDays <= 0)) {
    status = 'DUE_SOON';
    currentDueAmount = student.monthlyFee;
  } else {
    status = 'PAID';
    currentDueAmount = 0;
  }

  return {
    student,
    totalPaidAmount,
    totalMonthsPaid,
    lastPaymentDate,
    nextDueDate: nextDueDateStr,
    nextCycleLabel,
    status,
    daysDifference: diffDays,
    currentDueAmount
  };
}
