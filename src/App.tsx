import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { StudentsList } from './components/StudentsList';
import { AddStudentModal } from './components/AddStudentModal';
import { FeeCollectionModal } from './components/FeeCollectionModal';
import { StudentDetailsModal } from './components/StudentDetailsModal';
import { ReceiptModal } from './components/ReceiptModal';
import { BackupModal } from './components/BackupModal';

import { db, clearAllData, purgeOldDemoData } from './db/database';
import type { Student, FeePayment, StudentFeeSummary } from './types';
import { calculateStudentFeeSummary, formatCurrency, formatFriendlyDate } from './utils/feeCalculations';
import { Search, CreditCard, Receipt, Filter } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'fees' | 'backup'>('dashboard');

  // DB Data
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isCollectFeeOpen, setIsCollectFeeOpen] = useState(false);
  const [collectTargetSummary, setCollectTargetSummary] = useState<StudentFeeSummary | null>(null);

  const [isStudentDetailsOpen, setIsStudentDetailsOpen] = useState(false);
  const [detailsTargetSummary, setDetailsTargetSummary] = useState<StudentFeeSummary | null>(null);

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<FeePayment | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice?.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load data from IndexedDB
  const refreshData = useCallback(async () => {
    try {
      await purgeOldDemoData();
      const s = await db.students.toArray();
      const p = await db.payments.toArray();
      setStudents(s);
      setPayments(p);
    } catch (err) {
      console.error('Error loading database:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Compute student summaries dynamically with 1-month logic
  const summaries: StudentFeeSummary[] = useMemo(() => {
    return students.map(student => calculateStudentFeeSummary(student, payments));
  }, [students, payments]);

  // Counts
  const overdueCount = summaries.filter(s => s.status === 'OVERDUE' && s.student.active).length;
  const dueSoonCount = summaries.filter(s => s.status === 'DUE_SOON' && s.student.active).length;

  // Handlers
  const handleSaveStudent = async (studentData: Omit<Student, 'id' | 'createdAt'>, studentId?: number) => {
    if (studentId) {
      await db.students.update(studentId, studentData);
      showToast(`Student "${studentData.name}" updated successfully!`);
    } else {
      await db.students.add({
        ...studentData,
        createdAt: new Date().toISOString()
      });
      showToast(`Student "${studentData.name}" added successfully!`);
    }
    await refreshData();
  };

  const handleDeleteStudent = async (id: number, name: string) => {
    if (confirm(`Kya aap "${name}" ko delete karna chahte hain?`)) {
      await db.students.delete(id);
      showToast(`Student "${name}" deleted.`);
      await refreshData();
    }
  };

  const handleRecordPayment = async (paymentData: Omit<FeePayment, 'id' | 'createdAt'>) => {
    const paymentWithMeta: FeePayment = {
      ...paymentData,
      createdAt: new Date().toISOString()
    };
    const id = await db.payments.add(paymentWithMeta);
    const saved = { ...paymentWithMeta, id };

    showToast(`Fee of ${formatCurrency(saved.amount)} collected successfully!`);
    await refreshData();

    // Automatically show receipt
    setActiveReceiptPayment(saved);
    setIsReceiptOpen(true);
    return saved;
  };

  // Open Collect Modal
  const openCollectModalFor = (summary: StudentFeeSummary) => {
    setCollectTargetSummary(summary);
    setIsCollectFeeOpen(true);
  };

  // Open Edit Modal
  const openEditModalFor = (summary: StudentFeeSummary) => {
    setEditingStudent(summary.student);
    setIsAddStudentOpen(true);
  };

  // Open Details Modal
  const openDetailsModalFor = (summary: StudentFeeSummary) => {
    setDetailsTargetSummary(summary);
    setIsStudentDetailsOpen(true);
  };

  // Open Receipt
  const openReceiptFor = (payment: FeePayment) => {
    setActiveReceiptPayment(payment);
    setIsReceiptOpen(true);
  };

  // Fee Tab specific state
  const [feeSearch, setFeeSearch] = useState('');
  const filteredPayments = useMemo(() => {
    return payments
      .filter(p => {
        const student = students.find(s => s.id === p.studentId);
        const matchName = student ? student.name.toLowerCase().includes(feeSearch.toLowerCase()) : false;
        const matchReceipt = p.receiptNumber.toLowerCase().includes(feeSearch.toLowerCase());
        return matchName || matchReceipt;
      })
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [payments, students, feeSearch]);

  const activeReceiptStudent = useMemo(() => {
    if (!activeReceiptPayment) return null;
    return students.find(s => s.id === activeReceiptPayment.studentId) || null;
  }, [activeReceiptPayment, students]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold animate-bounce flex items-center gap-2">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header canInstall={!!installPrompt} onInstall={handleInstallApp} />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 pb-24 sm:pb-28">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500 font-medium">Loading Tuition Manager...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                summaries={summaries}
                payments={payments}
                onOpenAddStudent={() => {
                  setEditingStudent(null);
                  setIsAddStudentOpen(true);
                }}
                onOpenCollectFee={openCollectModalFor}
                onViewStudentDetails={openDetailsModalFor}
                onViewReceipt={openReceiptFor}
              />
            )}

            {activeTab === 'students' && (
              <StudentsList
                summaries={summaries}
                onOpenAddStudent={() => {
                  setEditingStudent(null);
                  setIsAddStudentOpen(true);
                }}
                onEditStudent={openEditModalFor}
                onDeleteStudent={handleDeleteStudent}
                onOpenCollectFee={openCollectModalFor}
                onViewStudentDetails={openDetailsModalFor}
              />
            )}

            {activeTab === 'fees' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Fee Collection Records</h2>
                    <p className="text-xs text-slate-500">
                      Total {payments.length} fee payment records logged in system
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCollectTargetSummary(null);
                      setIsCollectFeeOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs transition-colors self-start sm:self-auto"
                  >
                    <CreditCard className="w-4 h-4" />
                    Record New Payment
                  </button>
                </div>

                {/* Search */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={feeSearch}
                      onChange={e => setFeeSearch(e.target.value)}
                      placeholder="Search payments by student name or receipt #..."
                      className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Receipt #</th>
                          <th className="py-3 px-4">Student Name</th>
                          <th className="py-3 px-4">Payment Date</th>
                          <th className="py-3 px-4">Period / Cycle</th>
                          <th className="py-3 px-4">Mode</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredPayments.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                              Koi payment record nahi mila
                            </td>
                          </tr>
                        ) : (
                          filteredPayments.map(p => {
                            const student = students.find(s => s.id === p.studentId);
                            return (
                              <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-3 px-4 font-mono text-2xs text-slate-500">
                                  {p.receiptNumber}
                                </td>
                                <td className="py-3 px-4 font-bold text-slate-900">
                                  {student?.name || `Student #${p.studentId}`}
                                </td>
                                <td className="py-3 px-4 text-slate-600">
                                  {formatFriendlyDate(p.paymentDate)}
                                </td>
                                <td className="py-3 px-4 text-slate-600">
                                  {p.cyclePeriod || `${p.monthsCount} month`}
                                </td>
                                <td className="py-3 px-4 uppercase text-2xs font-bold text-slate-700">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100">
                                    {p.mode}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-extrabold text-emerald-600">
                                  {formatCurrency(p.amount)}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    onClick={() => openReceiptFor(p)}
                                    className="px-2.5 py-1 text-xs font-semibold rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                                  >
                                    View Receipt
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'backup' && <BackupModal onDataChanged={refreshData} />}
          </>
        )}
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        overdueCount={overdueCount}
        totalStudents={students.length}
      />

      {/* Modals */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onSave={handleSaveStudent}
        editStudent={editingStudent}
      />

      <FeeCollectionModal
        isOpen={isCollectFeeOpen}
        onClose={() => setIsCollectFeeOpen(false)}
        allSummaries={summaries}
        preSelectedSummary={collectTargetSummary}
        onPaymentRecorded={handleRecordPayment}
      />

      <StudentDetailsModal
        isOpen={isStudentDetailsOpen}
        onClose={() => setIsStudentDetailsOpen(false)}
        summary={detailsTargetSummary}
        payments={payments}
        onOpenCollectFee={openCollectModalFor}
        onOpenEditStudent={openEditModalFor}
        onViewReceipt={openReceiptFor}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        payment={activeReceiptPayment}
        student={activeReceiptStudent}
      />
    </div>
  );
};
