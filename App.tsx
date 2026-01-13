
import React, { useState } from 'react';
import { ModuleType } from './types';
import Sidebar from './components/Sidebar';
import SofiaModule from './components/SofiaModule';
import BrennerModule from './components/BrennerModule';
import DanteModule from './components/DanteModule';
import RubensModule from './components/RubensModule';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.SOFIA);

  const renderModule = () => {
    switch (activeModule) {
      case ModuleType.SOFIA: return <SofiaModule />;
      case ModuleType.BRENNER: return <BrennerModule />;
      case ModuleType.DANTE: return <DanteModule />;
      case ModuleType.RUBENS: return <RubensModule />;
      default: return <SofiaModule />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              {activeModule === ModuleType.SOFIA && "Sofia: Inteligência & Financeiro"}
              {activeModule === ModuleType.BRENNER && "Brenner: Comercial & CRM"}
              {activeModule === ModuleType.DANTE && "Dante: Copy & Estratégia"}
              {activeModule === ModuleType.RUBENS && "Rubens: Operacional & Criativos"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">Ecossistema Rodrigues Growth Partners</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-semibold border border-slate-700">Versão 2.5 Pro</span>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">R</div>
          </div>
        </header>
        {renderModule()}
      </main>
    </div>
  );
};

export default App;
