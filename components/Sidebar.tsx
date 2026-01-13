
import React from 'react';
import { ModuleType } from '../types';

interface SidebarProps {
  activeModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, onModuleChange }) => {
  const navItems = [
    { type: ModuleType.SOFIA, label: 'Sofia', icon: 'fa-brain', color: 'text-blue-400' },
    { type: ModuleType.BRENNER, label: 'Brenner', icon: 'fa-chart-line', color: 'text-emerald-400' },
    { type: ModuleType.DANTE, label: 'Dante', icon: 'fa-pen-nib', color: 'text-purple-400' },
    { type: ModuleType.RUBENS, label: 'Rubens', icon: 'fa-layer-group', color: 'text-orange-400' },
  ];

  return (
    <aside className="w-20 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded flex-shrink-0 flex items-center justify-center">
          <i className="fas fa-rocket text-white"></i>
        </div>
        <span className="hidden md:block font-bold text-lg tracking-tight">RGP Growth</span>
      </div>
      
      <nav className="flex-1 px-3 space-y-2 mt-4">
        {navItems.map((item) => (
          <button
            key={item.type}
            onClick={() => onModuleChange(item.type)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
              activeModule === item.type 
                ? 'bg-slate-800 text-white shadow-lg' 
                : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
            }`}
          >
            <i className={`fas ${item.icon} text-xl ${activeModule === item.type ? item.color : ''}`}></i>
            <span className="hidden md:block font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="hidden md:block text-xs text-slate-500 mb-2">SUPORTE</div>
        <button className="w-full flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-white transition-colors">
          <i className="fas fa-question-circle text-xl"></i>
          <span className="hidden md:block text-sm">Central de Ajuda</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
