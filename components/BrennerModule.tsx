import React, { useState, useMemo } from 'react';
import { handleSalesObjection } from '../services/aiService';

interface Lead {
  id: string;
  name: string;
  company: string;
  value: number;
  status: 'PROSPECÇÃO' | 'QUALIFICAÇÃO' | 'PROPOSTA' | 'FECHAMENTO';
}

const BrennerModule: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]); 
  const [objection, setObjection] = useState('');
  const [scriptResponse, setScriptResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para o Modal de Novo Lead
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCol, setActiveCol] = useState<Lead['status']>('PROSPECÇÃO');
  const [newLead, setNewLead] = useState({ name: '', company: '', value: '' });

  const COLUMNS = ['PROSPECÇÃO', 'QUALIFICAÇÃO', 'PROPOSTA', 'FECHAMENTO'] as const;

  const stats = useMemo(() => {
    const closedValue = leads
      .filter(l => l.status === 'FECHAMENTO')
      .reduce((acc, curr) => acc + curr.value, 0);
    return {
      total: leads.reduce((acc, curr) => acc + curr.value, 0),
      closed: closedValue,
      goalProgress: (closedValue / 15000) * 100 // Baseado na meta de R$ 180k/ano
    };
  }, [leads]);

  // Função para salvar o lead
  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name || !newLead.value) return;

    const lead: Lead = {
      id: Math.random().toString(36).substr(2, 9),
      name: newLead.name,
      company: newLead.company,
      value: Number(newLead.value),
      status: activeCol,
    };

    setLeads([...leads, lead]);
    setNewLead({ name: '', company: '', value: '' });
    setIsModalOpen(false);
  };

  const getScript = async () => {
    if (!objection) return;
    setIsLoading(true);
    try {
      const res = await handleSalesObjection(objection);
      setScriptResponse(res || '');
    } catch (e) {
      setScriptResponse('Falha no contra-ataque.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Placar de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-bold uppercase">Pipeline Total</p>
          <p className="text-2xl font-mono text-white">R$ {stats.total.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-bold uppercase">Pix na Conta</p>
          <p className="text-2xl font-mono text-emerald-400">R$ {stats.closed.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-bold uppercase">Meta 2026</p>
          <div className="w-full bg-slate-800 h-2 mt-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${Math.min(stats.goalProgress, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col} className="flex-1 min-w-[280px] bg-slate-900/50 rounded-xl border border-slate-800 p-4">
            <div className="flex justify-between items-center mb-4 text-xs font-bold text-slate-400 uppercase">
              <span>{col}</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                {leads.filter(l => l.status === col).length}
              </span>
            </div>
            
            <div className="space-y-3">
              {leads.filter(l => l.status === col).map(lead => (
                <div key={lead.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <p className="font-semibold text-sm">{lead.name}</p>
                  <p className="text-xs text-slate-400">{lead.company}</p>
                  <p className="text-xs font-mono text-emerald-400 mt-2">R$ {lead.value.toLocaleString()}</p>
                </div>
              ))}
              
              <button 
                onClick={() => { setActiveCol(col); setIsModalOpen(true); }}
                className="w-full py-2 border border-dashed border-slate-700 rounded-lg text-xs text-slate-500 hover:border-emerald-500 hover:text-emerald-500 transition-all"
              >
                + Adicionar Lead
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Cadastro Rápido */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Novo Lead em {activeCol}</h3>
            <form onSubmit={handleAddLead} className="space-y-4">
              <input 
                autoFocus
                className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Nome do Prospect"
                value={newLead.name}
                onChange={e => setNewLead({...newLead, name: e.target.value})}
              />
              <input 
                className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Empresa"
                value={newLead.company}
                onChange={e => setNewLead({...newLead, company: e.target.value})}
              />
              <input 
                type="number"
                className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Valor do Contrato (R$)"
                value={newLead.value}
                onChange={e => setNewLead({...newLead, value: e.target.value})}
              />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-sm text-slate-400">Cancelar</button>
                <button type="submit" className="flex-2 px-6 py-2 bg-emerald-600 rounded-lg font-bold text-sm">SALVAR LEAD</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seção Brenner Scripts (Mantida do código anterior) */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <i className="fas fa-bolt text-emerald-500"></i> Brenner: Contra-Ataque
        </h3>
        {/* ... Restante do código de scripts ... */}
      </div>
    </div>
  );
};

export default BrennerModule;
