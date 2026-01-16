import React, { useState, useMemo, useEffect } from 'react';
import { handleSalesObjection } from '../services/aiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- INTERFACES ---
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

interface SavedScript {
  id: string;
  title: string;
  content: string;
  date: string;
}

const BrennerModule: React.FC = () => {
  // --- 1. ESTADO DOS LEADS (SALVOS NO NAVEGADOR) ---
  const [leads, setLeads] = useState<Lead[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rgp_brenner_leads');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('rgp_brenner_leads', JSON.stringify(leads));
  }, [leads]);

  // --- 2. ESTADO DOS SCRIPTS ---
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rgp_brenner_scripts');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('rgp_brenner_scripts', JSON.stringify(savedScripts));
  }, [savedScripts]);

  // --- 3. ESTADOS DO FORMULÁRIO E MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSavedScripts, setShowSavedScripts] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Lead>({ 
    id: '',
    name: '', 
    company: '', 
    value: 0, 
    email: '', 
    phone: '', 
    location: '', 
    source: '', 
    status: 'PROSPECÇÃO'
  });

  // IA States
  const [objection, setObjection] = useState('');
  const [scriptResponse, setScriptResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const COLUMNS = ['PROSPECÇÃO', 'QUALIFICAÇÃO', 'PROPOSTA', 'FECHAMENTO'] as const;

  // --- CÁLCULOS KPI ---
  const stats = useMemo(() => {
    const closedValue = leads
      .filter(l => l.status === 'FECHAMENTO')
      .reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
    return {
      total: leads.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0),
      closed: closedValue,
      goalProgress: (closedValue / 15000) * 100 
    };
  }, [leads]);

  // --- AÇÕES DO LEAD ---

  const openNewLeadModal = (column: Lead['status']) => {
    setEditingLeadId(null);
    setFormData({
      id: Math.random().toString(36).substr(2, 9),
      name: '', 
      company: '', 
      value: 0, 
      email: '', 
      phone: '', 
      location: '', 
      source: '', 
      status: column
    });
    setIsModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setFormData({ ...lead });
    setIsModalOpen(true);
  };

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
        alert("O Nome do Lead é obrigatório.");
        return;
    }

    if (editingLeadId) {
      setLeads(leads.map(lead => (lead.id === editingLeadId ? formData : lead)));
    } else {
      setLeads([...leads, { ...formData, id: Math.random().toString(36).substr(2, 9) }]);
    }
    
    setIsModalOpen(false);
  };

  const handleDeleteLead = () => {
    if (confirm("Tem certeza que deseja excluir este lead?")) {
      setLeads(leads.filter(l => l.id !== editingLeadId));
      setIsModalOpen(false);
    }
  };

  // --- DRAG AND DROP ---
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("leadId", leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Lead['status']) => {
    const leadId = e.dataTransfer.getData("leadId");
    if (leadId) {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: targetStatus } : l));
    }
  };

  // --- IA FUNCTIONS ---
  const getScript = async () => {
    if (!objection) return;
    setIsLoading(true);
    try {
      const res = await handleSalesObjection(objection);
      setScriptResponse(res || '');
    } catch (e) {
      setScriptResponse('Erro ao conectar com a IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveScript = () => {
    if (!scriptResponse) return;
    const title = window.prompt("Nome do Script:");
    if (title) {
        setSavedScripts([{ id: Date.now().toString(), title, content: scriptResponse, date: new Date().toLocaleDateString() }, ...savedScripts]);
    }
  };

  const handleDeleteScript = (id: string) => {
      setSavedScripts(savedScripts.filter(s => s.id !== id));
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

      {/* 2. KANBAN BOARD */}
      <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4 min-h-[500px]">
        {COLUMNS.map((col) => (
          <div 
            key={col}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col)}
            className="flex-1 min-w-[300px] bg-slate-900/50 rounded-xl border border-slate-800 p-4 flex flex-col"
          >
            <div className="flex justify-between items-center mb-4 text-xs font-bold text-slate-400 uppercase">
              <span className={col === 'FECHAMENTO' ? 'text-emerald-400' : ''}>{col}</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">{leads.filter(l => l.status === col).length}</span>
            </div>
            
            <div className="flex-1 space-y-3">
              {leads.filter(l => l.status === col).map(lead => (
                <div 
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  onClick={() => openEditModal(lead)}
                  className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-emerald-500 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all group relative"
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-sm text-white group-hover:text-emerald-400 truncate pr-4">{lead.name}</p>
                    <i className="fas fa-pen text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  </div>
                  
                  {lead.company && <p className="text-xs text-slate-400 truncate mb-2">{lead.company}</p>}

                  {/* TAGS IMPORTANTES (Local e Origem) AGORA VISÍVEIS NO CARD */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {lead.location && (
                        <span className="text-[9px] bg-slate-700/50 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                           <i className="fas fa-map-marker-alt mr-1"></i>{lead.location}
                        </span>
                    )}
                    {lead.source && (
                        <span className="text-[9px] bg-blue-900/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-900/30">
                           {lead.source}
                        </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-slate-700 pt-2 mt-2">
                     <span className="text-xs font-mono font-bold text-emerald-400">R$ {Number(lead.value).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => openNewLeadModal(col)}
                className="w-full py-3 border border-dashed border-slate-700 rounded-lg text-xs text-slate-500 hover:border-emerald-500 hover:text-emerald-400 transition-all mt-2"
              >
                + Novo Lead
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 3. BRENNER SCRIPTS (IA) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800">
           <div className="flex justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2"><i className="fas fa-bolt text-emerald-500"></i> Brenner Scripts</h3>
              <button onClick={() => setShowSavedScripts(!showSavedScripts)} className="lg:hidden text-xs text-emerald-400 border border-emerald-900 bg-emerald-900/20 px-2 py-1 rounded">Ver Salvos</button>
           </div>
           
           <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                 {['Tá caro', 'Vou pensar', 'Falar com sócio', 'Não tenho tempo'].map(opt => (
                    <button key={opt} onClick={() => setObjection(opt)} className="text-xs bg-slate-800 border border-slate-700 p-2 rounded hover:bg-slate-700 text-slate-300 transition-colors">{opt}</button>
                 ))}
              </div>
              <textarea 
                 value={objection}
                 onChange={e => setObjection(e.target.value)}
                 className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none h-20 placeholder-slate-600"
                 placeholder="Digite a objeção do cliente aqui..."
              />
              <button onClick={getScript} disabled={isLoading || !objection} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all text-sm">
                 {isLoading ? 'Gerando...' : 'Gerar Resposta'}
              </button>
           </div>

           {scriptResponse && (
               <div className="mt-6 bg-slate-950 border border-slate-800 p-4 rounded-lg">
                   <div className="flex justify-end mb-2">
                       <button onClick={handleSaveScript} className="text-xs flex items-center gap-2 text-emerald-400 hover:text-white"><i className="fas fa-save"></i> Salvar</button>
                   </div>
                   <div className="text-slate-300 text-sm leading-relaxed overflow-y-auto max-h-60">
                       <ReactMarkdown remarkPlugins={[remarkGfm]}>{scriptResponse}</ReactMarkdown>
                   </div>
               </div>
           )}
        </div>

        {/* SCRIPTS SALVOS (SIDEBAR) */}
        <div className={`lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col ${showSavedScripts ? 'block' : 'hidden lg:flex'}`}>
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3"><i className="fas fa-save"></i> Scripts Salvos</h4>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar max-h-[400px]">
                {savedScripts.length === 0 ? <p className="text-xs text-slate-600 text-center italic mt-4">Nenhum script salvo.</p> : 
                   savedScripts.map(s => (
                       <div key={s.id} className="bg-slate-950/50 p-3 rounded border border-slate-800 flex justify-between items-start group">
                           <div onClick={() => {setScriptResponse(s.content); setObjection(s.title)}} className="cursor-pointer flex-1">
                               <p className="text-xs font-bold text-slate-300 group-hover:text-emerald-400">{s.title}</p>
                               <span className="text-[10px] text-slate-600">{s.date}</span>
                           </div>
                           <button onClick={() => handleDeleteScript(s.id)} className="text-slate-600 hover:text-red-500 ml-2"><i className="fas fa-trash-alt text-xs"></i></button>
                       </div>
                   ))
                }
            </div>
        </div>
      </div>

      {/* --- MODAL UNIFICADO COM TODOS OS CAMPOS --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-2xl">
                    <h3 className="text-lg font-bold text-white">
                        {editingLeadId ? 'Editar Lead' : 'Novo Lead'}
                    </h3>
                    <div className="flex gap-2">
                        {editingLeadId && (
                            <button onClick={handleDeleteLead} className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded text-xs font-bold border border-red-500/20">
                                <i className="fas fa-trash mr-1"></i> Excluir
                            </button>
                        )}
                        <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>

                {/* Form Body - Scrollável */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form id="leadForm" onSubmit={handleSaveLead} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        <div className="md:col-span-2">
                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Status do Pipeline</label>
                            <select 
                                value={formData.status} 
                                onChange={e => setFormData({...formData, status: e.target.value as Lead['status']})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none"
                            >
                                {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* BLOCO 1: IDENTIFICAÇÃO */}
                        <div className="md:col-span-2 border-b border-slate-800 pb-2 mb-2">
                            <span className="text-xs text-emerald-500 font-bold uppercase">Identificação</span>
                        </div>

                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Nome Completo *</label>
                            <input 
                                required
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none"
                                placeholder="Nome do Cliente"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Empresa</label>
                            <input 
                                value={formData.company} 
                                onChange={e => setFormData({...formData, company: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none"
                                placeholder="Empresa Ltda"
                            />
                        </div>

                        {/* BLOCO 2: CONTATO & DADOS IMPORTANTES */}
                        <div className="md:col-span-2 border-b border-slate-800 pb-2 mb-2 mt-2">
                            <span className="text-xs text-emerald-500 font-bold uppercase">Contato & Origem</span>
                        </div>

                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Email</label>
                            <input 
                                type="email"
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none"
                                placeholder="email@cliente.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-slate-400 mb-1">WhatsApp / Telefone</label>
                            <input 
                                value={formData.phone} 
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none"
                                placeholder="(00) 00000-0000"
                            />
                        </div>

                        <div>
                             <label className="block text-xs text-slate-400 mb-1">Localização (Cidade/UF)</label>
                             <input 
                                value={formData.location} 
                                onChange={e => setFormData({...formData, location: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none"
                                placeholder="Ex: São Paulo, SP"
                            />
                        </div>

                        <div>
                             <label className="block text-xs text-slate-400 mb-1">Origem (Onde nos conheceu?)</label>
                             <select 
                                value={formData.source} 
                                onChange={e => setFormData({...formData, source: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none"
                            >
                                <option value="">Selecione...</option>
                                <option value="Instagram">Instagram</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Indicação">Indicação</option>
                                <option value="Tráfego Pago">Tráfego Pago</option>
                                <option value="Outros">Outros</option>
                            </select>
                        </div>

                        {/* BLOCO 3: NEGOCIAÇÃO */}
                        <div className="md:col-span-2 mt-4 bg-emerald-900/10 p-4 rounded-lg border border-emerald-900/30">
                             <label className="block text-xs font-bold text-emerald-400 uppercase mb-1">Valor do Contrato (R$)</label>
                             <input 
                                type="number"
                                value={formData.value} 
                                onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})}
                                className="w-full bg-transparent border-b border-emerald-500 text-xl font-bold text-white focus:outline-none placeholder-emerald-700"
                                placeholder="0.00"
                            />
                        </div>

                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="p-5 border-t border-slate-800 bg-slate-900 rounded-b-2xl flex gap-3">
                    <button 
                        onClick={() => setIsModalOpen(false)} 
                        className="flex-1 py-3 rounded-lg border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-all"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        form="leadForm"
                        className="flex-1 py-3 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition-all"
                    >
                        {editingLeadId ? 'Salvar Alterações' : 'Criar Lead'}
                    </button>
                </div>

            </div>
        </div>
      )}

    </div>
  );
};

export default BrennerModule;
