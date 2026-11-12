import React from 'react';
import { Box, Calculator, FolderOpen, Scissors } from 'lucide-react';

export type WorkspaceTab = '3d' | 'raskroy' | 'materials' | 'projects';

interface MobileBottomNavProps {
  activeTab: WorkspaceTab;
  cutListCount: number;
  projectsCount: number;
  onSelectTab: (tab: WorkspaceTab) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  cutListCount,
  projectsCount,
  onSelectTab,
}) => {
  const items: {
    id: WorkspaceTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    {
      id: '3d',
      label: '3D Konstruktor',
      icon: <Box className="w-5 h-5" />,
    },
    {
      id: 'raskroy',
      label: 'Raskroy',
      icon: <Scissors className="w-5 h-5" />,
      badge: cutListCount,
    },
    {
      id: 'materials',
      label: 'Smeta',
      icon: <Calculator className="w-5 h-5" />,
    },
    {
      id: 'projects',
      label: 'Loyihalarim',
      icon: <FolderOpen className="w-5 h-5" />,
      badge: projectsCount,
    },
  ];

  return (
    <nav
      aria-label="Mobil pastki menyu"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.45)] no-print"
    >
      <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-amber-400 bg-amber-500/12'
                  : 'text-slate-400 hover:text-slate-200 active:bg-slate-900'
              }`}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-0.5 w-6 h-0.5 rounded-full bg-amber-400"
                />
              )}
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-slate-950 font-mono text-[9px] font-bold flex items-center justify-center leading-none">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] leading-tight tracking-tight truncate max-w-full ${
                  isActive ? 'font-bold text-amber-300' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
