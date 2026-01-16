import React, { useState, useMemo, useEffect } from 'react';
import { handleSalesObjection } from '../services/aiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Interface expandida com os dados solicitados
interface Lead {
  id: string;
  name: string;
  company: string;
  value: number;
  status: 'PROSPECÇÃO' | 'QUALIFICAÇÃO' | 'PROPOSTA' | 'FECHAMENTO';
  email: string;
  phone: string;
  location: string;
  source: string;
}

// Interface para Scripts Salvos
interface SavedScript {
  id: string;
  title: string;
  content: string;
  date: string;
}

const BrennerModule: React.FC = () => {
  // --- 1. ESTADO DOS LEADS (PERSISTÊNCIA AUTOMÁTICA) ---
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('rgp_brenner_leads');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('rgp_brenner_leads', JSON.stringify(leads));
  }, [leads]);

  // --- 2. ESTADO DOS SCRIPTS SALVOS (PERSISTÊNCIA) ---
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>(() => {
    const saved = localStorage.getItem('rgp_brenner_scripts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('rgp_brenner_scripts', JSON.stringify(savedScripts));
  }, [savedScripts]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCol, setActiveCol] = useState<Lead['status']>('PROSPECÇÃO');
  const [showSavedScripts, setShowSavedScripts] = useState(false); // Toggle para ver biblioteca
  
  const [newLead, setNewLead] = useState({ 
    name: '', company: '', value: '', email: '', phone: '', location: '', source: ''
  });

  const [objection, setObjection] = useState('');
  const [scriptResponse, setScriptResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const COLUMNS = ['PROSPECÇÃO', 'QUALIFICAÇÃO', 'PROPOSTA', 'FECHAMENTO'] as const;

  const stats = useMemo(() => {
    const closedValue = leads
      .filter(l => l.status === 'FECHAMENTO')
      .reduce((acc, curr) => acc + curr.value, 0);
    return {
      total: leads.reduce((acc, curr) => acc + curr.value, 0),
      closed: closedValue,
      goalProgress: (closedValue / 15000) * 100 
    };
  }, [leads]);

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name || !newLead.value) return;

    const lead: Lead = {
      id: Math.random().toString(36).substr(2, 9),
      name: newLead.name,
      company: newLead.company,
      value: Number(newLead.value),
      status: activeCol,
      email: newLead.email,
      phone: newLead.phone,
      location: newLead.location,
      source: newLead.source,
    };

    setLeads([...leads, lead]);
    setNewLead({ name: '', company: '', value: '', email: '', phone: '', location: '', source: '' });
    setIsModalOpen(false);
  };

  const handleDeleteLead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm("Excluir este lead?")) {
        setLeads(leads.filter(l => l.id !== id));
    }
  }

  const getScript = async () => {
    if (!objection) return;
    setIsLoading(true);
    try {
      const res = await handleSalesObjection(objection);
      setScriptResponse(res || '');
    } catch (e) {
      setScriptResponse('Erro ao conectar com a inteligência do Brenner.');
    } finally {
      setIsLoading(false);
    }
  };

  // Funções de Salvar/Excluir Script
  const handleSaveScript = () => {
    if (!scriptResponse) return;
    const title = window.prompt("Nomeie este Script (ex: Objeção Preço Alto):");
    if (!title) return;
    const newScript: SavedScript = {
        id: Date.now().toString(),
        title,
        content: scriptResponse,
        date: new Date().toLocaleDateString('pt-BR')
    };
    setSavedScripts([newScript, ...savedScripts]);
    alert("Script salvo com sucesso!");
  };

  const handleDeleteScript = (id: string) => {
    if(window.confirm("Apagar script?")) {
        setSavedScripts(savedScripts.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. PLACAR DE METAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-bold uppercase">Pipeline Total</p>
          <p className="text-2xl font-mono text-white">R$ {stats.total.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-bold uppercase text-emerald-500">Pix na Conta</p>
          <p className="text-2xl font-mono text-emerald-400">R$ {stats.closed.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-bold uppercase">Meta 2026</p>
          <div className="w-full bg-slate-800 h-2 mt-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${Math.min(stats.goalProgress, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* 2. KANBAN DE VENDAS (DADOS SALVOS) */}
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
                <div key={lead.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-emerald-500/30 transition-all cursor-pointer group relative">
                  <div className="flex justify-between">
                    <p className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors">{lead.name}</p>
                    <button onClick={(e) => handleDeleteLead(lead.id, e)} className="text-slate-600 hover:text-red-500 px-2"><i className="fas fa-times"></i></button>
                  </div>
                  <p className="text-xs text-slate-400">{lead.company}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <p className="text-xs font-mono text-emerald-400 font-bold">R$ {lead.value.toLocaleString()}</p>
                    <span className="text-[10px] bg-slate-700 px-1 rounded text-slate-300">{lead.source}</span>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => { setActiveCol(col); setIsModalOpen(true); }}
                className="w-full py-2 border border-dashed border-slate-700 rounded-lg text-xs text-slate-500 hover:border-emerald-500 hover:text-emerald-400 transition-all"
              >
                + Adicionar Lead
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 3. BRENNER SCRIPTS (IA + BIBLIOTECA) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ÁREA DE GERAÇÃO */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-bolt text-emerald-500"></i>
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Brenner Scripts</h3>
                <p className="text-xs text-slate-400">Supere objeções em tempo real</p>
              </div>
            </div>
            <button 
                onClick={() => setShowSavedScripts(!showSavedScripts)}
                className="lg:hidden text-xs bg-slate-800 px-3 py-2 rounded text-emerald-400"
            >
                {showSavedScripts ? 'Esconder Salvos' : 'Ver Salvos'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {['Tá caro', 'Vou pensar', 'Falar com sócio', 'Não tenho tempo'].map(btn => (
                <button 
                  key={btn}
                  onClick={() => setObjection(btn)}
                  className={`p-2 text-xs border rounded transition-all ${objection === btn ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                >
                  "{btn}"
                </button>
              ))}
            </div>
            <textarea 
              value={objection}
              onChange={(e) => setObjection(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none h-24 text-white placeholder-slate-600"
              placeholder="Digite a objeção..."
            />
            <button 
              onClick={getScript}
              disabled={isLoading || !objection}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold text-white transition-all disabled:opacity-30 shadow-lg shadow-emerald-900/20"
            >
              {isLoading ? 'CONSULTANDO...' : 'GERAR CONTRA-ATAQUE'}
            </button>
          </div>

          {/* RESULTADO + BOTÃO SALVAR */}
          {scriptResponse && (
            <div className="mt-6 bg-slate-950 border border-slate-800 rounded-lg p-5 relative">
               <div className="flex justify-end mb-2">
                   <button onClick={handleSaveScript} className="text-xs flex items-center gap-1 text-emerald-400 hover:text-white transition-colors">
                       <i className="fas fa-save"></i> Salvar Script
                   </button>
               </div>
               <div className="text-slate-300 text-sm leading-relaxed max-h-[300px] overflow-y-auto">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-lg font-bold text-emerald-400 mb-2" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-emerald-400" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  }}
                >
                  {scriptResponse}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* BIBLIOTECA LATERAL (Igual Dante) */}
        <div className={`lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-full ${showSavedScripts ? 'block' : 'hidden lg:flex'}`}>
            <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 flex items-center gap-2">
                <i className="fas fa-save"></i> Scripts Salvos
            </h4>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar max-h-[500px]">
                {savedScripts.length === 0 ? (
                    <p className="text-xs text-slate-600 italic text-center mt-4">Nenhum script salvo.</p>
                ) : (
                    savedScripts.map((script) => (
                        <div key={script.id} className="group p-3 rounded-lg bg-slate-950/50 border border-slate-800 hover:border-emerald-500/30 transition-all">
                            <div className="flex justify-between items-start">
                                <div onClick={() => {setScriptResponse(script.content); setObjection(script.title)}} className="cursor-pointer flex-1">
                                    <p className="text-xs font-bold text-slate-300 group-hover:text-emerald-400">{script.title}</p>
                                    <span className="text-[10px] text-slate-600">{script.date}</span>
                                </div>
                                <button onClick={() => handleDeleteScript(script.id)} className="text-slate-600 hover:text-red-500 ml-2">
                                    <i className="fas fa-trash-alt text-xs"></i>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>

      {/* MODAL DE CADASTRO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-lg shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-white">Novo Lead em <span className="text-emerald-400">{activeCol}</span></h3>
            <form onSubmit={handleAddLead} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-sm text-white" placeholder="Nome" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} required />
              <input className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-sm text-white" placeholder="Empresa" value={newLead.company} onChange={e => setNewLead({...newLead, company: e.target.value})} />
              <input className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-sm text-white" placeholder="Email" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} />
              <input className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-sm text-white" placeholder="Telefone" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} />
              <input className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-sm text-white" placeholder="Local" value={newLead.location} onChange={e => setNewLead({...newLead, location: e.target.value})} />
              <select className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-sm text-white" value={newLead.source} onChange={e => setNewLead({...newLead, source: e.target.value})}>
                <option value="">Origem?</option>
                <option value="Instagram">Instagram</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Tráfego">Tráfego</option>
              </select>
              <div className="md:col-span-2">
                <input type="number" className="w-full bg-emerald-900/20 border border-emerald-500/30 p-3 rounded-lg text-sm text-emerald-400 font-bold" placeholder="Valor (R$)" value={newLead.value} onChange={e => setNewLead({...newLead, value: e.target.value})} required />
              </div>
              <div className="md:col-span-2 flex gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-sm text-slate-400">Cancelar</button>
                <button type="submit" className="flex-1 px-6 py-2 bg-emerald-600 rounded-lg font-bold text-sm text-white">SALVAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrennerModule;
