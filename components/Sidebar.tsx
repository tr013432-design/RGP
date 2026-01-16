import React from 'react';

// Definimos o que o Sidebar precisa receber para funcionar
interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
  
  // Lista dos botões do menu
  const menuItems = [
    { id: 'sofia', label: 'Sofia', icon: 'fa-brain', color: 'text-blue-400' },
    { id: 'brenner', label: 'Brenner', icon: 'fa-chart-line', color: 'text-emerald-400' },
    { id: 'dante', label: 'Dante', icon: 'fa-pen-nib', color: 'text-purple-400' },
    { id: 'rubens', label: 'Rubens', icon: 'fa-layer-group', color: 'text-amber-400' },
    { id: 'calendar', label: 'Agenda', icon: 'fa-calendar-alt', color: 'text-pink-400' },
  ];

  return (
    <aside className="w-20 md:w-64 bg-slate-900 h-full border-r border-slate-800 flex flex-col transition-all duration-300">
      
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
          <i className="fas fa-rocket text-white text-sm"></i>
        </div>
        <span className="font-bold text-lg tracking-tight hidden md:block text-white">
          RGP Growth
        </span>
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)} // AQUI ESTÁ A MÁGICA: Ao clicar, avisa o App para trocar
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group ${
              activeModule === item.id
                ? 'bg-slate-800 border border-slate-700 shadow-md' // Estilo do botão ativo
                : 'hover:bg-slate-800/50 hover:translate-x-1'      // Estilo do botão inativo
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
               activeModule === item.id ? 'bg-slate-900' : 'bg-slate-800 group-hover:bg-slate-900'
            }`}>
              <i className={`fas ${item.icon} ${item.color} ${
                activeModule === item.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
              }`}></i>
            </div>
            
            <span className={`font-medium text-sm hidden md:block ${
              activeModule === item.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
            }`}>
              {item.label}
            </span>

            {/* Indicador de Ativo (Bolinha lateral) */}
            {activeModule === item.id && (
               <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 hidden md:block shadow-sm shadow-blue-500"></div>
            )}
          </button>
        ))}
      </nav>

      {/* Rodapé do Menu */}
      <div className="p-4 mt-auto border-t border-slate-800">
        <button className="w-full flex items-center gap-3 p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
          <i className="fas fa-cog"></i>
          <span className="text-xs font-bold hidden md:block">Configurações</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
