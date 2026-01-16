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

  // --- 2. ESTADO DOS SCRIPTS SALVOS ---
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>(() => {
    const saved = localStorage.getItem('rgp_brenner_scripts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('rgp_brenner_scripts', JSON.stringify(savedScripts));
  }, [savedScripts]);

  // --- ESTADOS DE CONTROLE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSavedScripts, setShowSavedScripts] = useState(false);
  
  // Estado para Edição (se null, é criação. se tiver lead, é edição)
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);

  // Formulário Unificado
  const [formData, setFormData] = useState<Partial<Lead>>({ 
    name: '', company: '', value: 0, email: '', phone: '', location: '', source: '', status: 'PROSPECÇÃO'
  });

  // IA States
  const [objection, setObjection] = useState('');
  const [scriptResponse, setScriptResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const COLUMNS = ['PROSPECÇÃO', 'QUALIFICAÇÃO', 'PROPOSTA', 'FECHAMENTO'] as const;

  // --- CÁLCULOS DE KPI ---
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

  // --- LÓGICA DE CRUD (CRIAR/EDITAR) ---
  
  // Abrir Modal para Criar
  const openNewLeadModal = (statusColumn: Lead['status']) => {
    setEditingLeadId(null); // Modo criação
    setFormData({ 
      name: '', company: '', value: 0, email: '', phone: '', location: '', source: '', status: statusColumn 
    });
    setIsModalOpen(true);
  };

  // Abrir Modal para Editar (Ao clicar no card)
  const openEditModal = (lead: Lead) => {
    setEditingLeadId(lead.id); // Modo edição
    setFormData({ ...lead });
    setIsModalOpen(true);
  };

  // Salvar (Serve para criar ou atualizar)
  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.value) return;

    if (editingLeadId) {
      // ATUALIZAR EXISTENTE
      setLeads(leads.map(lead => 
        lead.id === editingLeadId ? { ...lead, ...formData } as Lead : lead
      ));
    } else {
      // CRIAR NOVO
      const newLead: Lead = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData as Lead
      };
      setLeads([...leads, newLead]);
    }
    setIsModalOpen(false);
  };

  // Excluir
  const handleDeleteLead = () => {
    if (editingLeadId && window.confirm("Tem certeza que deseja excluir este lead?")) {
        setLeads(leads.filter(l => l.id !== editingLeadId));
        setIsModalOpen(false);
    }
  };

  // --- LÓGICA DE DRAG AND DROP (ARRASTAR) ---
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("leadId", leadId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessário para permitir o drop
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Lead['status']) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    
    // Atualiza o status do lead arrastado
    setLeads(prevLeads => prevLeads.map(lead => 
      lead.id === leadId ? { ...lead, status: targetStatus } : lead
    ));
  };

  // --- LÓGICA DA IA ---
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
    <div className="space-y-6 animate-in fade-in duration-500">
      
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

      {/* 2. KANBAN DE VENDAS (DRAG & DROP ATIVO) */}
      <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4 min-h-[400px]">
        {COLUMNS.map((col) => (
          <div 
            key={col} 
            // ÁREA DE DROP (SOLTAR)
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col)}
            className="flex-1 min-w-[280px] bg-slate-900/50 rounded-xl border border-slate-800 p-4 flex flex-col transition-colors hover:bg-slate-900/80"
          >
            <div className="flex justify-between items-center mb-4 text-xs font-bold text-slate-400 uppercase pointer-events-none">
              <span className={`px-2 py-1 rounded ${col === 'FECHAMENTO' ? 'text-emerald-400 bg-emerald-900/20' : ''}`}>{col}</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                {leads.filter(l => l.status === col).length}
              </span>
            </div>
             
            <div className="space-y-3 flex-1">
              {leads.filter(l => l.status === col).map(lead => (
                <div 
                  key={lead.id} 
                  // TORNAR O CARD ARRASTÁVEL
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  onClick={() => openEditModal(lead)} // Clicar abre edição
                  className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-emerald-500 cursor-grab active:cursor-grabbing hover:shadow-lg hover:shadow-emerald-900/20 transition-all group relative"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors line-clamp-1">{lead.name}</p>
                    {/* Ícone indicativo de edição */}
                    <i className="fas fa-pen text-[10px] text-slate-600 group-hover:text-slate-400"></i>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{lead.company}</p>
                  <div className="mt-3 flex justify-between items-center border-t border-slate-700/50 pt-2">
                    <p className="text-xs font-mono text-emerald-400 font-bold">R$ {lead.value.toLocaleString()}</p>
                    <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300 truncate max-w-[80px]">{lead.source}</span>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => openNewLeadModal(col)}
                className="w-full py-3 border border-dashed border-slate-700 rounded-lg text-xs text-slate-500 hover:border-emerald-500 hover:text-emerald-400 hover:bg-slate-800/50 transition-all mt-2"
              >
                + Adicionar Lead
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 3. BRENNER SCRIPTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">
                    {editingLeadId ? 'Editar Lead' : 'Novo Lead'}
                </h3>
                {editingLeadId && (
                    <button onClick={handleDeleteLead} className="text-red-500 hover:text-red-400 text-xs flex items-center gap-1 border border-red-900/30 bg-red-900/10 px-3 py-1 rounded-lg transition-colors">
                        <i className="fas fa-trash"></i> Excluir
                    </button>
                )}
            </div>
            
            <form onSubmit={handleSaveLead} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                 <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Status (Coluna)</label>
                 <select 
                    className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-sm text-white focus:border-emerald-500 outline-none"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as Lead['status']})}
                 >
                    {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>

              <input className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-sm text-white focus:border-emerald-500 outline-none" placeholder="Nome do Cliente" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <input className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-sm text-white focus:border-emerald-500 outline-none" placeholder="Empresa" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
              <input className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-sm text-white focus:border-emerald-500 outline-none" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-sm text-white focus:border-emerald-500 outline-none" placeholder="Telefone / WhatsApp" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              
              <div className="md:col-span-2">
                <input type="number" className="w-full bg-emerald-900/20 border border-emerald-500/30 p-3 rounded-lg text-sm text-emerald-400 font-bold placeholder-emerald-700/50" placeholder="Valor do Contrato (R$)" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} required />
              </div>

              <div className="md:col-span-2 flex gap-2 pt-4 border-t border-slate-800 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-sm text-slate-400 hover:text-white transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-emerald-600 rounded-lg font-bold text-sm text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition-all">
                    {editingLeadId ? 'SALVAR ALTERAÇÕES' : 'CRIAR LEAD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrennerModule;
