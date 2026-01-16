import React, { useState, useEffect } from 'react';
import { generateCreativeIdeas } from '../services/aiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SavedIdea {
  id: string;
  title: string;
  content: string;
  date: string;
  niche: string;
}

const RubensModule: React.FC = () => {
  const [client, setClient] = useState('');
  const [goal, setGoal] = useState('Viralização');
  const [ideasOutput, setIdeasOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // --- LÓGICA DE SALVAMENTO NO NAVEGADOR (LOCAL STORAGE) ---
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>(() => {
    const saved = localStorage.getItem('rgp_rubens_ideas');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('rgp_rubens_ideas', JSON.stringify(savedIdeas));
  }, [savedIdeas]);

  const handleGenerate = async () => {
    if (!client) return;
    setIsGenerating(true);
    try {
      const res = await generateCreativeIdeas(client, goal);
      setIdeasOutput(res || '');
    } catch (e) {
      setIdeasOutput('Erro: O Rubens está sem criatividade agora (falha na API).');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!ideasOutput) return;
    
    const title = window.prompt("Nomeie esta campanha/ideia:", `${client} - ${goal}`);
    if (!title) return;

    const newIdea: SavedIdea = {
      id: Date.now().toString(),
      title: title,
      content: ideasOutput,
      date: new Date().toLocaleDateString('pt-BR'),
      niche: client
    };

    setSavedIdeas([newIdea, ...savedIdeas]);
    alert("Ideia salva na Galeria!");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Jogar esta ideia no lixo?")) {
      setSavedIdeas(savedIdeas.filter(idea => idea.id !== id));
    }
  };

  const handleLoad = (idea: SavedIdea) => {
    setIdeasOutput(idea.content);
    setClient(idea.niche);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-100px)]">
      {/* --- COLUNA DA ESQUERDA: GALERIA --- */}
      <div className="lg:col-span-1 flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <h3 className="font-bold text-sm text-amber-500 uppercase flex items-center gap-2">
            <i className="fas fa-lightbulb"></i> Galeria de Ideias
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {savedIdeas.length === 0 ? (
            <div className="text-center mt-10 opacity-40">
              <i className="fas fa-box-open text-3xl mb-2 text-slate-500"></i>
              <p className="text-xs text-slate-500">Nenhuma ideia salva.</p>
            </div>
          ) : (
            savedIdeas.map((item) => (
              <div key={item.id} className="group bg-slate-950/50 border border-slate-800 p-3 rounded-lg hover:border-amber-500/50 transition-all flex justify-between items-start">
                <div onClick={() => handleLoad(item)} className="cursor-pointer flex-1">
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors line-clamp-1">{item.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-1">{item.date} • {item.niche}</p>
                </div>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-600 hover:text-red-500 ml-2 transition-colors"
                >
                  <i className="fas fa-trash-alt text-xs"></i>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- COLUNA DA DIREITA: CRIAÇÃO --- */}
      <div className="lg:col-span-3 flex flex-col gap-6 h-full overflow-y-auto pb-10">
        
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-0 pointer-events-none"></div>

          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <i className="fas fa-video text-amber-500 text-xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Rubens Creative Lab</h2>
              <p className="text-xs text-slate-400">Gerador de roteiros virais para Reels e TikTok</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Cliente / Nicho</label>
              <input 
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Ex: Advogada Criminalista, Pizzaria Delivery..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-amber-500 outline-none transition-all placeholder-slate-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Objetivo</label>
              <select 
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-amber-500 outline-none transition-all"
              >
                <option>Viralização (Topo de Funil)</option>
                <option>Vendas (Fundo de Funil)</option>
                <option>Autoridade</option>
                <option>Conexão/Lifestyle</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !client}
            className="mt-4 w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-lg shadow-lg shadow-amber-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isGenerating ? (
              <><i className="fas fa-spinner fa-spin"></i> Criando Roteiros...</>
            ) : (
              <><i className="fas fa-wand-magic-sparkles"></i> Gerar 10 Ideias Virais</>
            )}
          </button>
        </div>

        {ideasOutput && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl relative animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                <i className="fas fa-clapperboard mr-2"></i> Roteiros Gerados
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={handleSave}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-amber-600 border border-slate-700 hover:border-amber-500 text-slate-300 hover:text-white rounded text-xs font-bold transition-all flex items-center gap-2"
                >
                  <i className="fas fa-save"></i> Salvar
                </button>
                <button 
                  onClick={() => navigator.clipboard.writeText(ideasOutput)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-xs font-bold transition-all flex items-center gap-2"
                >
                  <i className="fas fa-copy"></i> Copiar
                </button>
              </div>
            </div>

            <div className="text-slate-300 leading-relaxed text-sm">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mb-4 mt-2" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-bold text-amber-400 mb-3 mt-6 border-l-4 border-amber-500 pl-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-base font-bold text-white mb-2 mt-4" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-amber-200" {...props} />,
                  ul: ({node, ...props}) => <ul className="space-y-2 my-3 pl-2" {...props} />,
                  li: ({node, ...props}) => (
                    <li className="flex gap-2 items-start" {...props}>
                      <span className="text-amber-500 mt-1.5 text-[6px]"><i className="fas fa-circle"></i></span>
                      <span className="flex-1">{props.children}</span>
                    </li>
                  ),
                  p: ({node, ...props}) => <p className="mb-3 text-slate-300" {...props} />,
                }}
              >
                {ideasOutput}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RubensModule;
