export type FeeStatus = 'PAID' | 'DUE_SOON' | 'OVERDUE';

export type PaymentMode = 'cash' | 'upi' | 'bank_transfer' | 'other';

export interface Student {
  id?: number;
  name: string;
  phone: string;
  parentName?: string;
  admissionDate: string; // YYYY-MM-DD
  monthlyFee: number;
  standard?: string; // e.g. "Class 10", "12th Science"
  batch?: string; // e.g. "Morning (7:00 AM)", "Evening"
  notes?: string;
  active: boolean;
  createdAt: string;
}

export interface FeePayment {
  id?: number;
  studentId: number;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  mode: PaymentMode;
  /** Month of the fee cycle in YYYY-MM form; optional. */
  billingMonth?: string;
  monthsCount: number; // usually 1
  cyclePeriod: string; // e.g. "15 Oct 2026 - 14 Nov 2026"
  receiptNumber: string;
  note?: string;
  createdAt: string;
}

export interface StudentFeeSummary {
  student: Student;
  totalPaidAmount: number;
  totalMonthsPaid: number;
  lastPaymentDate: string | null;
  nextDueDate: string; // YYYY-MM-DD
  nextCycleLabel: string; // e.g. "Month 3 (12 Nov 2026 - 11 Dec 2026)"
  status: FeeStatus;
  daysDifference: number; // >0: days overdue, <0: days until due, 0: due today
  currentDueAmount: number;
}

export interface DashboardMetrics {
  totalStudents: number;
  totalMonthlyRevenue: number;
  collectedThisMonth: number;
  overdueCount: number;
  dueSoonCount: number;
  paidCount: number;
  overdueAmount: number;
}
