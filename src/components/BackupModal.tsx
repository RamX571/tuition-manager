import React, { useState } from 'react';
import { Download, Upload, Trash2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { db, clearAllData } from '../db/database';

interface BackupModalProps {
  onDataChanged: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ onDataChanged }) => {
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleExport = async () => {
    try {
      const students = await db.students.toArray();
      const payments = await db.payments.toArray();

      const backupData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        students,
        payments
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tuition_manager_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage({ text: 'Backup file successfully downloaded!', type: 'success' });
    } catch (err) {
      setStatusMessage({ text: 'Failed to export backup: ' + String(err), type: 'error' });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.students || !data.payments) {
        throw new Error('Invalid backup file format.');
      }

      await db.transaction('rw', db.students, db.payments, async () => {
        await db.students.clear();
        await db.payments.clear();
        await db.students.bulkAdd(data.students);
        await db.payments.bulkAdd(data.payments);
      });

      setStatusMessage({ text: 'Data successfully restored from backup!', type: 'success' });
      onDataChanged();
    } catch (err) {
      setStatusMessage({ text: 'Failed to restore: ' + String(err), type: 'error' });
    } finally {
      e.target.value = '';
    }
  };

  const handleClearAllData = async () => {
    if (confirm('Kya aap sach me sara student aur fee data delete karna chahte hain?')) {
      await clearAllData();
      setStatusMessage({ text: 'All data deleted successfully!', type: 'success' });
      onDataChanged();
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Data Backup & Privacy</h2>
        <p className="text-xs text-slate-500">
          Aapka sara tuition data 100% offline aapke phone me safely save rehta hai. Yaha se data export ya restore karein.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          )}
          {statusMessage.text}
        </div>
      )}

      {/* Grid of backup options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Export Backup (JSON)</h3>
          <p className="text-xs text-slate-500">
            Download your full student directory, fee payment history, and records as a safe JSON file.
          </p>
          <button
            onClick={handleExport}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4" />
            Download Backup File
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Restore from Backup</h3>
          <p className="text-xs text-slate-500">
            Restore previously exported data. Yeh aapke purane records ko naye file se replace karega.
          </p>
          <label className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Select Backup File</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Privacy Guarantee & Clear Data */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-900">100% Offline & Private</h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Koi bhi student ya fee data kisi external server par send nahi hota. Har data IndexedDB browser storage me rehta hai.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-rose-500 font-medium">Danger Zone: Data reset karna chahein?</span>
          <button
            onClick={handleClearAllData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete All Records
          </button>
        </div>
      </div>
    </div>
  );
};
