
import React, { useState } from 'react';
import { handleSalesObjection } from '../services/aiService';

const INITIAL_LEADS = [
  { id: '1', name: 'João Silva', company: 'Tech Solutions', value: 5000, status: 'PROSPECÇÃO' },
  { id: '2', name: 'Maria Santos', company: 'Health & Co', value: 12000, status: 'QUALIFICAÇÃO' },
  { id: '3', name: 'Ricardo Oliveira', company: 'E-commerce Master', value: 8000, status: 'PROPOSTA' },
  { id: '4', name: 'Ana Costa', company: 'Inovação Digital', value: 15000, status: 'FECHAMENTO' },
];

const BrennerModule: React.FC = () => {
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [objection, setObjection] = useState('');
  const [scriptResponse, setScriptResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const COLUMNS = ['PROSPECÇÃO', 'QUALIFICAÇÃO', 'PROPOSTA', 'FECHAMENTO'];

  const getScript = async () => {
    if (!objection) return;
    setIsLoading(true);
    try {
      const res = await handleSalesObjection(objection);
      setScriptResponse(res || '');
    } catch (e) {
      setScriptResponse('Erro ao carregar script.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Pipeline Kanban */}
      <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col} className="flex-1 min-w-[280px] bg-slate-900/50 rounded-xl border border-slate-800 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{col}</h3>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                {leads.filter(l => l.status === col).length}
              </span>
            </div>
            <div className="space-y-3">
              {leads
                .filter(l => l.status === col)
                .map(lead => (
                  <div key={lead.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-sm group-hover:text-blue-400 transition-colors">{lead.name}</p>
                      <i className="fas fa-ellipsis-v text-xs text-slate-600"></i>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{lead.company}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-emerald-400">R$ {lead.value.toLocaleString()}</span>
                      <div className="flex -space-x-2">
                        <div className="w-5 h-5 rounded-full bg-slate-600 border border-slate-800 text-[8px] flex items-center justify-center">BS</div>
                      </div>
                    </div>
                  </div>
                ))}
              <button className="w-full py-2 border border-dashed border-slate-700 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-all">
                + Adicionar Lead
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sales Scripts Section */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <i className="fas fa-microphone-lines text-emerald-500"></i>
          </div>
          <div>
            <h3 className="font-bold text-lg">Brenner Scripts</h3>
            <p className="text-xs text-slate-400">Supere objeções em tempo real com IA</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <p className="text-sm font-medium">Qual a objeção do lead?</p>
            <div className="grid grid-cols-2 gap-2">
              {['Tá caro', 'Vou pensar', 'Falar com sócio', 'Não tenho tempo'].map(btn => (
                <button 
                  key={btn}
                  onClick={() => setObjection(btn)}
                  className="p-2 text-xs bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 transition-colors"
                >
                  "{btn}"
                </button>
              ))}
            </div>
            <textarea 
              value={objection}
              onChange={(e) => setObjection(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none h-24"
              placeholder="Digite a objeção personalizada..."
            />
            <button 
              onClick={getScript}
              disabled={isLoading || !objection}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold transition-all disabled:opacity-50"
            >
              {isLoading ? 'Consultando Brenner...' : 'Gerar Script de Resposta'}
            </button>
          </div>

          <div className="flex-1 bg-slate-950/50 border border-slate-800 rounded-lg p-4 min-h-[200px]">
            {scriptResponse ? (
              <div className="prose prose-invert prose-sm">
                <h4 className="text-emerald-400 font-bold mb-3 flex items-center gap-2">
                  <i className="fas fa-magic"></i> Scripts Sugeridos:
                </h4>
                <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">
                  {scriptResponse}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-600 text-sm italic">
                O script aparecerá aqui...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrennerModule;
