
import React, { useState } from 'react';
import { generateCopyStrategy } from '../services/aiServices';

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
        <h3 className="font-bold text-lg mb-4">Repositório & Templates</h3>
        <div className="space-y-3">
          {TEMPLATES.map((t, i) => (
            <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer">
              <h4 className="text-sm font-bold text-purple-400 mb-1">{t.title}</h4>
              <p className="text-xs text-slate-500 leading-tight">{t.desc}</p>
            </div>
          ))}
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">VSLs Recentes</h4>
          <ul className="text-xs space-y-2">
            <li className="flex items-center gap-2 text-slate-300 hover:text-purple-400 cursor-pointer">
              <i className="fas fa-file-video"></i> VSL_Infoproduto_V2.docx
            </li>
            <li className="flex items-center gap-2 text-slate-300 hover:text-purple-400 cursor-pointer">
              <i className="fas fa-file-video"></i> LandingPage_HighTicket.pdf
            </li>
          </ul>
        </div>
      </div>

      <div className="lg:col-span-3 space-y-6">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
            <i className="fas fa-pen-nib text-purple-500"></i> Dante: Creative Copy Generator
          </h3>
          <p className="text-sm text-slate-400 mb-6">
            Dê um contexto (ex: "E-mail frio para clínicas de estética com faturamento acima de 100k") e deixe a IA criar a estrutura.
          </p>
          
          <div className="space-y-4">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none h-32 leading-relaxed"
              placeholder="Descreva o avatar, o produto e o objetivo..."
            />
            <div className="flex justify-end">
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center gap-2"
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

        {copyOutput && (
          <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-slate-500">PRODUÇÃO GERADA POR DANTE AI</span>
              <button 
                onClick={() => navigator.clipboard.writeText(copyOutput)}
                className="text-xs flex items-center gap-1 text-slate-400 hover:text-white"
              >
                <i className="fas fa-copy"></i> Copiar Texto
              </button>
            </div>
            <div className="whitespace-pre-wrap text-slate-300 font-serif leading-relaxed text-lg">
              {copyOutput}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DanteModule;
