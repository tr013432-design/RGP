import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import SofiaModule from './components/SofiaModule';
import BrennerModule from './components/BrennerModule';
import DanteModule from './components/DanteModule';
import RubensModule from './components/RubensModule';
import CalendarModule from './components/CalendarModule';

function App() {
  // Estado que controla qual tela está aparecendo
  const [activeModule, setActiveModule] = useState('sofia');

  // Função que decide qual componente mostrar
  const renderModule = () => {
    switch (activeModule) {
      case 'sofia':
        return <SofiaModule />;
      case 'brenner':
        return <BrennerModule />;
      case 'dante':
        return <DanteModule />;
      case 'rubens':
        return <RubensModule />;
      // ADICIONEI AQUI:
      case 'calendar':
        return <CalendarModule />;
      default:
        return <SofiaModule />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* BARRA LATERAL (MENU) */}
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />

      {/* ÁREA PRINCIPAL (CONTEÚDO) */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        {/* Cabeçalho Fixo no Topo */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              {activeModule === 'sofia' && 'Sofia: Inteligência & Financeiro'}
              {activeModule === 'brenner' && 'Brenner: Comercial & CRM'}
              {activeModule === 'dante' && 'Dante: Copy & Estratégia'}
              {activeModule === 'rubens' && 'Rubens: Creative Lab'}
              {/* ADICIONEI AQUI: */}
              {activeModule === 'calendar' && 'Agenda Executiva RGP'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">Ecossistema Rodrigues Growth Partners</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
               Versão 2.5 Pro
             </div>
             <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs">
               R
             </div>
          </div>
        </header>

        {/* Onde os Módulos são renderizados */}
        <div className="animate-in fade-in zoom-in duration-300">
           {renderModule()}
        </div>
      </main>
    </div>
  );
}

export default App;
