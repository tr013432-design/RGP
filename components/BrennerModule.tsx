import React, { useState, useMemo } from 'react';
import { handleSalesObjection } from '../services/aiService';

// Tipagem rigorosa para evitar erros de lógica
interface Lead {
  id: string;
  name: string;
  company: string;
  value: number;
  status: 'PROSPECÇÃO' | 'QUALIFICAÇÃO' | 'PROPOSTA' | 'FECHAMENTO';
  lastActivity: Date;
}

const BrennerModule: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]); // Iniciando vazio conforme solicitado
  const [objection, setObjection] = useState('');
  const [scriptResponse, setScriptResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const COLUMNS = ['PROSPECÇÃO', 'QUALIFICAÇÃO', 'PROPOSTA', 'FECHAMENTO'] as const;

  // Cálculos de Métricas Reais (Sem achismos)
  const stats = useMemo(() => {
    const totalPipeline = leads.reduce((acc, curr) => acc + curr.value, 0);
    const closedValue = leads
      .filter(l => l.status === 'FECHAMENTO')
      .reduce((acc, curr) => acc + curr.value, 0);
    
    return {
      total: totalPipeline,
      closed: closedValue,
      count: leads.length,
      // Meta baseada no seu Book of Dreams 2026 (R$ 180k/ano = R$ 15k/mês médio)
      goalProgress: (closedValue / 15000) * 100 
    };
  }, [leads]);

  const getScript = async () => {
    if (!objection) return;
    setIsLoading(true);
    try {
      // O Brenner exige agressividade e foco em conversão
      const res = await handleSalesObjection(objection);
      setScriptResponse(res || '');
    } catch (e) {
      setScriptResponse('Falha crítica na consulta do script.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptResponse);
    alert('Script copiado para o WhatsApp!');
  };

  return (
    <div className="space-y-6">
      {/* Placar de Metas - Foco em Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 uppercase font-bold">Volume em Negociação</p>
          <p className="text-2xl font-mono text-white">R$ {stats.total.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 uppercase font-bold">Pix na Conta (Mês)</p>
          <p className="text-2xl font-mono text-emerald-400">R$ {stats.closed.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 uppercase font-bold">Progresso da Meta</p>
          <div className="w-full bg-slate-800 h-2 mt-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${Math.min(stats.goalProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pipeline Kanban */}
      <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col} className="flex-1 min-w-[280px] bg-slate-900/50 rounded-xl border border-slate-800 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-slate-400">{col}</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-mono">
                  R$ {leads.filter(l => l.status === col).reduce((a, b) => a + b.value, 0).toLocaleString()}
                </span>
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                  {leads.filter(l => l.status === col).length}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              {leads.filter(l => l.status === col).map(lead => (
                <div key={lead.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-emerald-500/50 transition-all cursor-pointer">
                  <p className="font-semibold text-sm">{lead.name}</p>
                  <p className="text-xs text-slate-400">{lead.company}</p>
                  <p className="text-xs font-mono text-emerald-400 mt-2">R$ {lead.value.toLocaleString()}</p>
                </div>
              ))}
              <button className="w-full py-2 border border-dashed border-slate-700 rounded-lg text-xs text-slate-500 hover:border-emerald-500 hover:text-emerald-500 transition-all">
                + Novo Lead
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Brenner Scripts - Quebra de Objeção */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <i className="fas fa-bolt text-emerald-500"></i> Brenner: Quebra de Objeção
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {['Tá caro', 'Vou pensar', 'Falar com sócio', 'Não tenho tempo'].map(btn => (
                <button 
                  key={btn}
                  onClick={() => setObjection(btn)}
                  className={`p-2 text-xs border rounded transition-all ${objection === btn ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}
                >
                  "{btn}"
                </button>
              ))}
            </div>
            <textarea 
              value={objection}
              onChange={(e) => setObjection(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none h-24"
              placeholder="O que o cliente disse?"
            />
            <button 
              onClick={getScript}
              disabled={isLoading || !objection}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold disabled:opacity-30 transition-all"
            >
              {isLoading ? 'ANALISANDO ARGUMENTO...' : 'GERAR CONTRA-ATAQUE'}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 relative group">
            {scriptResponse ? (
              <>
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {scriptResponse}
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="absolute bottom-4 right-4 bg-slate-800 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copiar para WhatsApp"
                >
                  <i className="fas fa-copy text-emerald-400"></i>
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-700 italic text-sm">
                Aguardando objeção para processar...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrennerModule;
