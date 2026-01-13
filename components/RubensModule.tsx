
import React from 'react';
import { CreativeDelivery } from '../types';

const DELIVERIES: CreativeDelivery[] = [
  { id: '1', client: 'Master Fit', type: 'Pack de Anúncios (5)', deadline: '22/05', status: 'EM_PRODUCAO' },
  { id: '2', client: 'Lojas Americanas (Aff)', type: 'Vídeo Reel UGC', deadline: '23/05', status: 'PENDENTE' },
  { id: '3', client: 'Tech Hub', type: 'Static Banner Set', deadline: '20/05', status: 'ENTREGUE' },
  { id: '4', client: 'Clínica Sorriso', type: 'Motion Graphics 15s', deadline: '24/05', status: 'REVISAO' },
];

const RubensModule: React.FC = () => {
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'ENTREGUE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'EM_PRODUCAO': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'REVISAO': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editorial Calendar Summary */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Calendário Editorial</h3>
            <div className="flex gap-2">
              <button className="p-2 bg-slate-800 rounded hover:bg-slate-700"><i className="fas fa-chevron-left text-xs"></i></button>
              <button className="px-3 py-1 bg-slate-800 rounded text-xs font-medium">Maio 2024</button>
              <button className="p-2 bg-slate-800 rounded hover:bg-slate-700"><i className="fas fa-chevron-right text-xs"></i></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
              <div key={day} className="text-center text-[10px] uppercase font-bold text-slate-500 mb-2">{day}</div>
            ))}
            {Array.from({ length: 31 }).map((_, i) => (
              <div key={i} className={`h-16 border border-slate-800 rounded-lg p-1 text-[10px] relative group hover:bg-slate-800/30 transition-colors ${i+1 === 22 ? 'bg-blue-500/10 border-blue-500/30' : ''}`}>
                <span className="text-slate-600 group-hover:text-slate-400">{i + 1}</span>
                {i + 1 === 15 && <div className="mt-1 h-2 w-2 rounded-full bg-rose-500" title="Lançamento X"></div>}
                {i + 1 === 22 && <div className="mt-1 h-2 w-full rounded bg-blue-500/50"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Status Tracker */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h3 className="font-bold text-lg mb-6">Status de Entregas</h3>
          <div className="space-y-4">
            {DELIVERIES.map(item => (
              <div key={item.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm">{item.client}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusStyle(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{item.type}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500"><i className="far fa-calendar-alt mr-1"></i> Deadline: {item.deadline}</span>
                  <div className="flex -space-x-1">
                    <img src="https://picsum.photos/20/20?random=1" className="w-5 h-5 rounded-full border border-slate-800" alt="user" />
                    <img src="https://picsum.photos/20/20?random=2" className="w-5 h-5 rounded-full border border-slate-800" alt="user" />
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium transition-colors">
              Ver Todas as Entregas
            </button>
          </div>
        </div>
      </div>
      
      {/* Creative Brainstorm Area */}
      <div className="bg-gradient-to-r from-orange-600/20 to-rose-600/20 p-8 rounded-2xl border border-orange-500/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-orange-400">Rubens Creative Assistant</h3>
            <p className="text-slate-400 max-w-md">Precisa de ideias para um novo criativo? Rubens ajuda você a estruturar o roteiro e os elementos visuais em segundos.</p>
          </div>
          <button className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-3">
            <i className="fas fa-lightbulb"></i> Brainstorm IA
          </button>
        </div>
      </div>
    </div>
  );
};

export default RubensModule;
