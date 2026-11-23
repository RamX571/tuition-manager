import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  CreditCard,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  UserCheck,
  UserX
} from 'lucide-react';
import type { StudentFeeSummary, FeeStatus } from '../types';
import { formatCurrency, formatFriendlyDate } from '../utils/feeCalculations';

interface StudentsListProps {
  summaries: StudentFeeSummary[];
  onOpenAddStudent: () => void;
  onEditStudent: (summary: StudentFeeSummary) => void;
  onDeleteStudent: (studentId: number, studentName: string) => void;
  onOpenCollectFee: (summary: StudentFeeSummary) => void;
  onViewStudentDetails: (summary: StudentFeeSummary) => void;
}

export const StudentsList: React.FC<StudentsListProps> = ({
  summaries,
  onOpenAddStudent,
  onEditStudent,
  onDeleteStudent,
  onOpenCollectFee,
  onViewStudentDetails
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');

  // Distinct classes for filter dropdown
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    summaries.forEach(s => {
      if (s.student.standard && s.student.standard.trim()) {
        set.add(s.student.standard.trim());
      }
    });
    return Array.from(set);
  }, [summaries]);

  // Filtered students
  const filteredSummaries = useMemo(() => {
    return summaries.filter(s => {
      const matchSearch =
        s.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student.phone.includes(searchTerm) ||
        (s.student.standard && s.student.standard.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.student.parentName && s.student.parentName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'INACTIVE'
          ? !s.student.active
          : s.status === statusFilter && s.student.active;

      const matchClass = classFilter === 'ALL' || s.student.standard === classFilter;

      return matchSearch && matchStatus && matchClass;
    });
  }, [summaries, searchTerm, statusFilter, classFilter]);

  const overdueCount = summaries.filter(s => s.status === 'OVERDUE' && s.student.active).length;
  const dueSoonCount = summaries.filter(s => s.status === 'DUE_SOON' && s.student.active).length;
  const paidCount = summaries.filter(s => s.status === 'PAID' && s.student.active).length;

  return (
    <div className="space-y-5">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Directory</h2>
          <p className="text-xs text-slate-500">
            Manage students, view dynamic 1-month fee cycles and payment statuses
          </p>
        </div>
        <button
          onClick={onOpenAddStudent}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Student
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by student name, phone, class or parent..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Class Filter */}
          {availableClasses.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
              <select
                value={classFilter}
                onChange={e => setClassFilter(e.target.value)}
                className="py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Classes / Batches</option>
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({summaries.length})
          </button>

          <button
            onClick={() => setStatusFilter('OVERDUE')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'OVERDUE'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Overdue ({overdueCount})
          </button>

          <button
            onClick={() => setStatusFilter('DUE_SOON')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'DUE_SOON'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Due Soon ({dueSoonCount})
          </button>

          <button
            onClick={() => setStatusFilter('PAID')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'PAID'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Paid ({paidCount})
          </button>
        </div>
      </div>

      {/* Students Card Grid */}
      {filteredSummaries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-base font-bold text-slate-700">Koi student nahi mila</p>
          <p className="text-xs text-slate-400 mt-1">
            Search keyword change karein ya naya student add karein.
          </p>
          <button
            onClick={onOpenAddStudent}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSummaries.map(summary => {
            const { student, status, daysDifference, nextDueDate } = summary;

            let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            let badgeIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
            let badgeText = 'Paid / Up-to-date';

            if (status === 'OVERDUE') {
              badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
              badgeIcon = <AlertCircle className="w-3.5 h-3.5 text-rose-600" />;
              badgeText = `${daysDifference} days overdue`;
            } else if (status === 'DUE_SOON') {
              badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
              badgeIcon = <Clock className="w-3.5 h-3.5 text-amber-600" />;
              badgeText = daysDifference === 0 ? 'Due Today' : `Due in ${Math.abs(daysDifference)} days`;
            }

            return (
              <div
                key={student.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Name + Status Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3
                        onClick={() => onViewStudentDetails(summary)}
                        className="text-base font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                      >
                        {student.name}
                      </h3>
                      {student.standard && (
                        <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                          {student.standard}
                        </p>
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-2xs font-bold rounded-full border ${badgeBg}`}
                    >
                      {badgeIcon}
                      <span>{badgeText}</span>
                    </span>
                  </div>

                  {/* Student Details Grid */}
                  <div className="space-y-1.5 py-2.5 text-xs text-slate-600 border-t border-b border-slate-100 my-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Monthly Fee:</span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {formatCurrency(student.monthlyFee)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Admission Date:</span>
                      <span className="font-medium text-slate-700">
                        {formatFriendlyDate(student.admissionDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Next Fee Due:</span>
                      <span
                        className={`font-bold ${
                          status === 'OVERDUE'
                            ? 'text-rose-600'
                            : status === 'DUE_SOON'
                            ? 'text-amber-600'
                            : 'text-slate-700'
                        }`}
                      >
                        {formatFriendlyDate(nextDueDate)}
                      </span>
                    </div>

                    {student.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Phone:</span>
                        <a
                          href={`tel:${student.phone}`}
                          className="text-indigo-600 font-medium hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {student.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onViewStudentDetails(summary)}
                      title="View Details"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditStudent(summary)}
                      title="Edit Student"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => student.id && onDeleteStudent(student.id, student.name)}
                      title="Delete Student"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenCollectFee(summary)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Collect Fee
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
