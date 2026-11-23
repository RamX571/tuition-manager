import React from 'react';
import {
  Users,
  IndianRupee,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
  CreditCard,
  PlusCircle,
  Receipt
} from 'lucide-react';
import type { StudentFeeSummary, FeePayment } from '../types';
import { formatCurrency, formatFriendlyDate } from '../utils/feeCalculations';

interface DashboardProps {
  summaries: StudentFeeSummary[];
  payments: FeePayment[];
  onOpenAddStudent: () => void;
  onOpenCollectFee: (summary: StudentFeeSummary) => void;
  onViewStudentDetails: (summary: StudentFeeSummary) => void;
  onViewReceipt: (payment: FeePayment) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  summaries,
  payments,
  onOpenAddStudent,
  onOpenCollectFee,
  onViewStudentDetails,
  onViewReceipt
}) => {
  // Metrics calculation
  const totalStudents = summaries.length;
  const totalExpectedRevenue = summaries.reduce((acc, s) => acc + s.student.monthlyFee, 0);

  // Payments in current calendar month
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const collectedThisMonth = payments
    .filter(p => p.paymentDate.startsWith(currentYearMonth))
    .reduce((acc, p) => acc + p.amount, 0);

  const overdueStudents = summaries.filter(s => s.status === 'OVERDUE');
  const dueSoonStudents = summaries.filter(s => s.status === 'DUE_SOON');
  const paidStudents = summaries.filter(s => s.status === 'PAID');

  const totalOverdueAmount = overdueStudents.reduce((acc, s) => acc + s.currentDueAmount, 0);

  // Recent 5 payments
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Students
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {totalStudents}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Active enrolled in tuition
          </p>
        </div>

        {/* Card 2: Expected Monthly Fee */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Monthly Expected
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {formatCurrency(totalExpectedRevenue)}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Total monthly fee target
          </p>
        </div>

        {/* Card 3: Collected This Month */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Collected This Month
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
            {formatCurrency(collectedThisMonth)}
          </div>
          <p className="text-xs text-emerald-600/80 mt-1 font-medium">
            Received in {now.toLocaleString('default', { month: 'long' })}
          </p>
        </div>

        {/* Card 4: Overdue Pending Amount */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rose-200 shadow-2xs bg-gradient-to-br from-rose-50/40 to-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">
              Overdue Pending
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">
            {formatCurrency(totalOverdueAmount)}
          </div>
          <p className="text-xs text-rose-600/90 mt-1 font-medium">
            {overdueStudents.length} student{overdueStudents.length !== 1 ? 's' : ''} with 1-month fee overdue
          </p>
        </div>
      </div>

      {/* Quick Mobile Action Bar */}
      <div className="sm:hidden flex gap-2">
        <button
          onClick={onOpenAddStudent}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* Empty State Banner when 0 students */}
      {totalStudents === 0 && (
        <div className="bg-white rounded-2xl border border-indigo-100 p-8 text-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Welcome to Tuition Manager!</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Abhi koi student add nahi hai. Apna pehla student add karke unka admission date aur monthly fee set karein.
          </p>
          <button
            onClick={onOpenAddStudent}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add First Student
          </button>
        </div>
      )}

      {/* 1-Month Fee Reminders Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Alerts Box */}
        <div className="bg-white rounded-2xl border border-rose-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-rose-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
              <h2 className="text-base font-bold text-slate-900">
                1-Month Fee Overdue Reminders
              </h2>
            </div>
            <span className="px-2.5 py-1 text-xs font-extrabold rounded-full bg-rose-100 text-rose-700">
              {overdueStudents.length} Overdue
            </span>
          </div>

          {overdueStudents.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Sabhi Fees Clear Hain!</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Koi bhi student overdue nahi hai.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueStudents.map(summary => (
                <div
                  key={summary.student.id}
                  className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/30 hover:bg-rose-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => onViewStudentDetails(summary)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                        {summary.student.name}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 text-rose-600 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {summary.daysDifference} days overdue
                      </span>
                      <span>• Due Date: {formatFriendlyDate(summary.nextDueDate)}</span>
                      <span>• Fee: {formatCurrency(summary.student.monthlyFee)}/mo</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => onOpenCollectFee(summary)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-2xs transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Collect Fee
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Due Soon Alerts Box */}
        <div className="bg-white rounded-2xl border border-amber-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">
                Due Soon (Next 3 Days)
              </h2>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
              {dueSoonStudents.length} Students
            </span>
          </div>

          {dueSoonStudents.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Agle 3 din me koi due nahi</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Next cycle aane par automatically yaha alert aayega.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dueSoonStudents.map(summary => (
                <div
                  key={summary.student.id}
                  className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/30 hover:bg-amber-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => onViewStudentDetails(summary)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 hover:text-indigo-600">
                        {summary.student.name}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="text-amber-700 font-semibold">
                        {summary.daysDifference === 0
                          ? 'Due Today!'
                          : `Due in ${Math.abs(summary.daysDifference)} days`}
                      </span>
                      <span>• Due Date: {formatFriendlyDate(summary.nextDueDate)}</span>
                      <span>• Fee: {formatCurrency(summary.student.monthlyFee)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => onOpenCollectFee(summary)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 shadow-2xs transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Collect Fee
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Payments Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Recent Fee Collections
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Last {recentPayments.length} entries
          </span>
        </div>

        {recentPayments.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            Abhi tak koi fee record nahi hui hai.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="pb-2.5">Student</th>
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Amount</th>
                  <th className="pb-2.5">Mode</th>
                  <th className="pb-2.5">Receipt</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayments.map(p => {
                  const student = summaries.find(s => s.student.id === p.studentId)?.student;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 font-semibold text-slate-900">
                        {student?.name || `Student #${p.studentId}`}
                      </td>
                      <td className="py-3 text-slate-500">
                        {formatFriendlyDate(p.paymentDate)}
                      </td>
                      <td className="py-3 font-bold text-emerald-600">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3">
                        <span className="uppercase text-2xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {p.mode}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-2xs text-slate-500">
                        {p.receiptNumber}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onViewReceipt(p)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
