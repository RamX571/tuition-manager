import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, Calendar, User, IndianRupee } from 'lucide-react';
import type { Student } from '../types';
import { formatDateISO } from '../utils/feeCalculations';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Omit<Student, 'id' | 'createdAt'>, studentId?: number) => Promise<void>;
  editStudent?: Student | null;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editStudent
}) => {
  const [name, setName] = useState('');
  const [admissionDate, setAdmissionDate] = useState(formatDateISO(new Date()));
  const [monthlyFee, setMonthlyFee] = useState<number | string>(1500);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editStudent) {
      setName(editStudent.name);
      setAdmissionDate(editStudent.admissionDate);
      setMonthlyFee(editStudent.monthlyFee);
      setNotes(editStudent.notes || '');
    } else {
      setName('');
      setAdmissionDate(formatDateISO(new Date()));
      setMonthlyFee(1500);
      setNotes('');
    }
  }, [editStudent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      await onSave(
        {
          name: name.trim(),
          admissionDate,
          monthlyFee: Number(monthlyFee) || 0,
          notes: notes.trim(),
          active: true
        },
        editStudent?.id
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {editStudent ? 'Edit Student' : 'Add New Student'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Student Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Student Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Student ka naam likhein..."
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-semibold"
              />
            </div>
          </div>

          {/* Admission Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Admission Date *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                required
                value={admissionDate}
                onChange={e => setAdmissionDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <p className="text-2xs text-slate-400 mt-1">
              Har 1 month baad is date se fee due calculate hogi
            </p>
          </div>

          {/* Monthly Fee */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Monthly Fee (₹) *
            </label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                required
                min="0"
                value={monthlyFee}
                onChange={e => setMonthlyFee(e.target.value)}
                placeholder="1500"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Koi extra note ya remark..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-2xs"
            >
              <Save className="w-4 h-4" />
              {editStudent ? 'Update Student' : 'Save Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
