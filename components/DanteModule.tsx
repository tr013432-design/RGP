import React, { useState } from 'react';
import { generateCopyStrategy } from '../services/aiService';
// 1. Importações para Renderizar Markdown
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const DanteModule: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [copyOutput, setCopyOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const TEMPLATES = [
    { title: 'AIDA (Atenção, Interesse, Desejo, Ação)', desc: 'Ideal para anúncios e e-mails frios.' },
    { title: 'PAS (Problema, Agitação, Solução)', desc: 'Focado em bater na dor do lead.' },
    { title: 'Vantagem Comparativa', desc: 'Destaque porque a RGP é melhor.' },
  ];

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const res = await generateCopyStrategy(prompt);
      setCopyOutput(res || '');
    } catch (e) {
      setCopyOutput('Erro ao gerar estratégia.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <h3 className="font-bold text-lg mb-4 text-white">Repositório & Templates</h3>
        <div className="space-y-3">
          {TEMPLATES.map((t, i) => (
            <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer group">
              <h4 className="text-sm font-bold text-purple-400 mb-1 group-hover:text-purple-300">{t.title}</h4>
              <p className="text-xs text-slate-500 leading-tight group-hover:text-slate-400">{t.desc}</p>
            </div>
          ))}
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">VSLs Recentes</h4>
          <ul className="text-xs space-y-2">
            <li className="flex items-center gap-2 text-slate-300 hover:text-purple-400 cursor-pointer transition-colors">
              <i className="fas fa-file-video"></i> VSL_Infoproduto_V2.docx
            </li>
            <li className="flex items-center gap-2 text-slate-300 hover:text-purple-400 cursor-pointer transition-colors">
              <i className="fas fa-file-video"></i> LandingPage_HighTicket.pdf
            </li>
          </ul>
        </div>
      </div>

      <div className="lg:col-span-3 space-y-6">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-white">
            <i className="fas fa-pen-nib text-purple-500"></i> Dante: Creative Copy Generator
          </h3>
          <p className="text-sm text-slate-400 mb-6">
            Dê um contexto (ex: "E-mail frio para clínicas de estética com faturamento acima de 100k") e deixe a IA criar a estrutura persuasiva.
          </p>
           
          <div className="space-y-4">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none h-32 leading-relaxed text-white placeholder-slate-600 transition-all"
              placeholder="Descreva o avatar, o produto e o objetivo..."
            />
            <div className="flex justify-end">
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center gap-2 text-white shadow-lg shadow-purple-900/20"
              >
                {isGenerating ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin"></i> Dante está escrevendo...
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

        {/* ÁREA DE SAÍDA COM MARKDOWN APLICADO */}
        {copyOutput && (
          <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 animate-in slide-in-from-bottom-4 duration-500 relative shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <span className="text-xs font-bold text-purple-400 tracking-widest uppercase">
                <i className="fas fa-scroll mr-2"></i>Produção Gerada
              </span>
              <button 
                onClick={() => navigator.clipboard.writeText(copyOutput)}
                className="text-xs flex items-center gap-2 bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-all"
              >
                <i className="fas fa-copy"></i> Copiar
              </button>
            </div>
            
            <div className="text-slate-300 leading-relaxed text-base">
               <ReactMarkdown 
                 remarkPlugins={[remarkGfm]}
                 components={{
                   // Títulos elegantes para Copy
                   h1: ({node, ...props}) => <h1 className="text-2xl font-serif font-bold text-white mb-6 border-b border-purple-500/30 pb-2" {...props} />,
                   h2: ({node, ...props}) => <h2 className="text-xl font-serif font-bold text-purple-300 mb-4 mt-8" {...props} />,
                   h3: ({node, ...props}) => <h3 className="text-lg font-bold text-white mb-3 mt-6" {...props} />,
                   // Parágrafos com fonte levemente maior para leitura
                   p: ({node, ...props}) => <p className="mb-4 text-slate-300 font-sans" {...props} />,
                   // Listas
                   ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 my-4 marker:text-purple-500" {...props} />,
                   ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-2 my-4 marker:text-purple-500" {...props} />,
                   li: ({node, ...props}) => <li className="pl-1" {...props} />,
                   // Citações ou Chamadas
                   blockquote: ({node, ...props}) => (
                     <blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-6 bg-purple-900/10 italic text-purple-200 rounded-r-lg" {...props} />
                   ),
                   // Negrito
                   strong: ({node, ...props}) => <strong className="font-bold text-purple-400" {...props} />,
                   // Tabelas (caso Dante gere alguma estrutura de comparativo)
                   table: ({node, ...props}) => (
                     <div className="overflow-x-auto my-6 border border-slate-700 rounded-lg">
                       <table className="min-w-full divide-y divide-slate-700" {...props} />
                     </div>
                   ),
                   th: ({node, ...props}) => (
                     <th className="px-4 py-3 bg-slate-800 text-left text-xs font-bold text-purple-300 uppercase tracking-wider" {...props} />
                   ),
                   td: ({node, ...props}) => (
                     <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-400 border-t border-slate-700" {...props} />
                   )
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
