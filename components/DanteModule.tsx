import React, { useState, useEffect } from 'react';
import { generateCopyStrategy } from '../services/aiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SavedScript {
  id: string;
  title: string;
  content: string;
  date: string;
  type: string;
}

const DanteModule: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [copyOutput, setCopyOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // --- LÓGICA DE SALVAMENTO LOCAL (NAVEGADOR) ---
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>(() => {
    // Verifica se window existe para evitar erro no servidor
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rgp_dante_scripts');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('rgp_dante_scripts', JSON.stringify(savedScripts));
  }, [savedScripts]);

  const TEMPLATES = [
    { 
      id: 'aida',
      title: 'AIDA (Atenção, Interesse, Desejo, Ação)', 
      desc: 'Ideal para anúncios curtos e e-mails frios diretos.',
      promptModel: 'Crie uma copy persuasiva utilizando a estrutura AIDA (Atenção, Interesse, Desejo, Ação) para vender [INSIRA SEU PRODUTO/SERVIÇO]. \n\nPúblico-alvo: [INSIRA SEU PÚBLICO]\nPrincipal Dor: [INSIRA A DOR]\n\nO tom deve ser agressivo e focado em conversão.'
    },
    { 
      id: 'pas',
      title: 'PAS (Problema, Agitação, Solução)', 
      desc: 'Focado em tocar na ferida e apresentar a cura.',
      promptModel: 'Escreva um texto usando a técnica PAS (Problema, Agitação, Solução).\n\n1. Problema: Descreva uma situação frustrante que [SEU CLIENTE] enfrenta.\n2. Agitação: Torne o problema visceral e emocional.\n3. Solução: Apresente a RGP como a única saída lógica.' 
    },
    { 
      id: 'vantagem',
      title: 'Vantagem Comparativa', 
      desc: 'Destaque porque a RGP é melhor que as outras.',
      promptModel: 'Crie um comparativo "Nós vs Eles".\n\nMostre por que contratar a RGP é um investimento, enquanto contratar agências tradicionais é um gasto. Foque em ROI, previsibilidade e tecnologia.' 
    },
  ];

  const handleTemplateClick = (templatePrompt: string) => {
    setPrompt(templatePrompt);
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const res = await generateCopyStrategy(prompt);
      setCopyOutput(res || '');
    } catch (e) {
      setCopyOutput('Erro ao gerar estratégia. O Dante está descansando.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveScriptLocal = () => {
    if (!copyOutput) return;
    
    const title = window.prompt("Dê um nome para este Script:", "Novo Script RGP");
    if (!title) return;

    const newScript: SavedScript = {
      id: Date.now().toString(),
      title: title,
      content: copyOutput,
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      type: 'Copy'
    };

    setSavedScripts([newScript, ...savedScripts]);
    alert("Script salvo na sua biblioteca local!");
  };

  const handleDeleteScript = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este script permanentemente?")) {
      setSavedScripts(savedScripts.filter(s => s.id !== id));
    }
  };

  const handleLoadScript = (script: SavedScript) => {
    setCopyOutput(script.content);
    setPrompt(`(Carregado do histórico: ${script.title})`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-100px)]">
      {/* COLUNA DA ESQUERDA */}
      <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
        <div>
          <h3 className="font-bold text-lg mb-4 text-white">Templates Rápidos</h3>
          <div className="space-y-3">
            {TEMPLATES.map((t) => (
              <button 
                key={t.id} 
                onClick={() => handleTemplateClick(t.promptModel)}
                className="w-full text-left bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-purple-500 hover:bg-slate-800 transition-all group active:scale-95"
              >
                <h4 className="text-sm font-bold text-purple-400 mb-1 group-hover:text-purple-300">{t.title}</h4>
                <p className="text-[10px] text-slate-500 leading-tight group-hover:text-slate-400">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-hidden flex flex-col">
          <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 flex items-center gap-2">
            <i className="fas fa-save"></i> Meus Scripts Salvos
          </h4>
          <div className="overflow-y-auto space-y-2 pr-2 flex-1 custom-scrollbar">
            {savedScripts.length === 0 ? (
              <p className="text-xs text-slate-600 italic text-center mt-4">Nenhum script salvo ainda.</p>
            ) : (
              savedScripts.map((script) => (
                <div key={script.id} className="group flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800 hover:border-purple-500/30 transition-all">
                  <div 
                    className="flex-1 cursor-pointer overflow-hidden"
                    onClick={() => handleLoadScript(script)}
                  >
                    <p className="text-xs font-bold text-slate-300 truncate group-hover:text-purple-400 transition-colors">{script.title}</p>
                    <span className="text-[10px] text-slate-600">{script.date} • {script.type}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteScript(script.id)}
                    className="ml-2 text-slate-600 hover:text-red-500 p-1 rounded transition-colors"
                    title="Excluir Script"
                  >
                    <i className="fas fa-trash-alt text-xs"></i>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* COLUNA DA DIREITA */}
      <div className="lg:col-span-3 flex flex-col gap-6 h-full overflow-y-auto pb-10">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg shrink-0">
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-white">
            <i className="fas fa-pen-nib text-purple-500"></i> Dante: Creative Copy Generator
          </h3>
          <p className="text-sm text-slate-400 mb-6">
            Selecione um template ao lado ou descreva o que você precisa. O Dante usa gatilhos mentais para criar textos que convertem.
          </p>
           
          <div className="space-y-4">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none h-32 leading-relaxed text-white placeholder-slate-600 transition-all font-mono"
              placeholder="Clique em um template à esquerda ou digite: 'Email para CEO de empresa de logística oferecendo consultoria...'"
            />
            <div className="flex justify-end">
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center gap-2 text-white shadow-lg shadow-purple-900/20"
              >
                {isGenerating ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin"></i> Escrevendo...
                  </>
                ) : (
                  <>
                    <i className="fas fa-wand-magic-sparkles"></i> Gerar Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {copyOutput && (
          <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 animate-in slide-in-from-bottom-4 duration-500 relative shadow-2xl mb-10">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <span className="text-xs font-bold text-purple-400 tracking-widest uppercase">
                <i className="fas fa-scroll mr-2"></i>Produção Gerada
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={handleSaveScriptLocal}
                  className="text-xs flex items-center gap-2 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-600/30 hover:border-emerald-600 text-emerald-400 hover:text-white px-4 py-2 rounded-lg transition-all font-bold"
                >
                  <i className="fas fa-save"></i> Salvar Local
                </button>

                <button 
                  onClick={() => navigator.clipboard.writeText(copyOutput)}
                  className="text-xs flex items-center gap-2 bg-slate-800 hover:bg-purple-600 border border-slate-700 hover:border-purple-500 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-all font-bold"
                >
                  <i className="fas fa-copy"></i> Copiar
                </button>
              </div>
            </div>
            
            <div className="text-slate-300 leading-relaxed text-base">
               <ReactMarkdown 
                 remarkPlugins={[remarkGfm]}
                 components={{
                   h1: ({node, ...props}) => <h1 className="text-2xl font-serif font-bold text-white mb-6 border-b border-purple-500/30 pb-2" {...props} />,
                   h2: ({node, ...props}) => <h2 className="text-xl font-serif font-bold text-purple-300 mb-4 mt-8" {...props} />,
                   h3: ({node, ...props}) => <h3 className="text-lg font-bold text-white mb-3 mt-6" {...props} />,
                   p: ({node, ...props}) => <p className="mb-4 text-slate-300 font-sans" {...props} />,
                   ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 my-4 marker:text-purple-500" {...props} />,
                   ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-2 my-4 marker:text-purple-500" {...props} />,
                   li: ({node, ...props}) => <li className="pl-1" {...props} />,
                   blockquote: ({node, ...props}) => (
                     <blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-6 bg-purple-900/10 italic text-purple-200 rounded-r-lg" {...props} />
                   ),
                   strong: ({node, ...props}) => <strong className="font-bold text-purple-400" {...props} />,
                 }}
               >
                 {copyOutput}
               </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DanteModule;
