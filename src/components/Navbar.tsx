import React from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Database,
  PlusCircle,
  GraduationCap
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'students' | 'fees' | 'backup';
  setActiveTab: (tab: 'dashboard' | 'students' | 'fees' | 'backup') => void;
  overdueCount: number;
  dueSoonCount: number;
  totalStudents: number;
  onOpenAddStudent: () => void;
  onOpenQuickCollect: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  overdueCount,
  totalStudents,
  onOpenAddStudent,
  onOpenQuickCollect
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                Tuition Manager
              </h1>
              <p className="text-xs font-medium text-slate-500">
                1-Month Fee & Student Tracker
              </p>
            </div>
          </div>

          {/* Quick actions stay available on phones; labels collapse to icons when space is tight. */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onOpenQuickCollect}
              title="Collect Fee"
              aria-label="Collect Fee"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Collect Fee</span>
            </button>
            <button
              onClick={onOpenAddStudent}
              title="Add Student"
              aria-label="Add Student"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Add Student</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav aria-label="Main navigation" className="hidden sm:flex fixed bottom-5 left-1/2 z-40 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 space-x-1 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-[0_12px_32px_rgba(15,23,42,0.16)] backdrop-blur-lg overflow-x-auto no-scrollbar snap-x">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`snap-start flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
            {overdueCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                {overdueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`snap-start flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'students'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Students</span>
            <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
              {totalStudents}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('fees')}
            className={`snap-start flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'fees'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Fee Collection</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`snap-start flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'backup'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Backup & Data</span>
          </button>
        </nav>
      </div>

      {/* Phone-first navigation: thumb reachable and always available. */}
      <nav
        aria-label="Mobile navigation"
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-4 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-1 pt-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.08)]"
      >
        <MobileNavButton active={activeTab === 'dashboard'} label="Home" onClick={() => setActiveTab('dashboard')} badge={overdueCount}>
          <LayoutDashboard className="w-5 h-5" />
        </MobileNavButton>
        <MobileNavButton active={activeTab === 'students'} label="Students" onClick={() => setActiveTab('students')}>
          <Users className="w-5 h-5" />
        </MobileNavButton>
        <MobileNavButton active={activeTab === 'fees'} label="Fees" onClick={() => setActiveTab('fees')}>
          <CreditCard className="w-5 h-5" />
        </MobileNavButton>
        <MobileNavButton active={activeTab === 'backup'} label="Data" onClick={() => setActiveTab('backup')}>
          <Database className="w-5 h-5" />
        </MobileNavButton>
      </nav>
    </header>
  );
};

function MobileNavButton({
  active,
  label,
  badge,
  onClick,
  children
}: {
  active: boolean;
  label: string;
  badge?: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative mx-auto flex min-w-16 flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-bold transition-colors ${
        active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 active:bg-slate-100'
      }`}
    >
      <span className="relative">
        {children}
        {!!badge && (
          <span className="absolute -right-3 -top-2 min-w-4 rounded-full bg-rose-500 px-1 text-[9px] leading-4 text-white">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>
      {label}
    </button>
  );
}
