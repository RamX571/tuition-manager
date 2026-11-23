import React from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Database
} from 'lucide-react';

interface BottomNavProps {
  activeTab: 'dashboard' | 'students' | 'fees' | 'backup';
  setActiveTab: (tab: 'dashboard' | 'students' | 'fees' | 'backup') => void;
  overdueCount: number;
  totalStudents: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  overdueCount,
  totalStudents
}) => {
  const tabs = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: overdueCount > 0 ? overdueCount : undefined,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'students' as const,
      label: 'Students',
      icon: Users,
      badge: totalStudents > 0 ? totalStudents : undefined,
      badgeColor: 'bg-slate-200 text-slate-700'
    },
    {
      id: 'fees' as const,
      label: 'Fees',
      icon: CreditCard
    },
    {
      id: 'backup' as const,
      label: 'Backup',
      icon: Database
    }
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] py-1.5 px-2 sm:px-4"
    >
      <div className="max-w-lg mx-auto grid grid-cols-4 gap-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-indigo-600 font-bold bg-indigo-50/90'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge !== undefined && (
                  <span
                    className={`absolute -top-1.5 -right-3 min-w-4 h-4 px-1 flex items-center justify-center text-[10px] font-extrabold rounded-full ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
