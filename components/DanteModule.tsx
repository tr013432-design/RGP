import React, { useState, useEffect, useMemo } from 'react';
import { generateCopyStrategy } from '../services/aiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useGoogleLogin } from '@react-oauth/google';
import { uploadToDrive } from '../services/googleDriveService';

interface SavedScript {
  id: string;
  title: string;
  content: string;
  date: string;
  type: string;
  prompt: string;
  templateId?: string;
}

interface TemplateItem {
  id: string;
  title: string;
  desc: string;
  promptModel: string;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: 'aida',
    title: 'AIDA (Atenção, Interesse, Desejo, Ação)',
    desc: 'Ideal para anúncios curtos e e-mails frios diretos.',
    promptModel:
      'Crie uma copy persuasiva utilizando a estrutura AIDA (Atenção, Interesse, Desejo, Ação) para vender [INSIRA SEU PRODUTO/SERVIÇO]. \n\nPúblico-alvo: [INSIRA SEU PÚBLICO]\nPrincipal Dor: [INSIRA A DOR]\n\nO tom deve ser agressivo e focado em conversão.'
  },
  {
    id: 'pas',
    title: 'PAS (Problema, Agitação, Solução)',
    desc: 'Focado em tocar na ferida e apresentar a cura.',
    promptModel:
      'Escreva um texto usando a técnica PAS (Problema, Agitação, Solução).\n\n1. Problema: Descreva uma situação frustrante que [SEU CLIENTE] enfrenta.\n2. Agitação: Torne o problema visceral e emocional.\n3. Solução: Apresente a RGP como a única saída lógica.'
  },
  {
    id: 'vantagem',
    title: 'Vantagem Comparativa',
    desc: 'Destaque porque a RGP é melhor que as outras.',
    promptModel:
      'Crie um comparativo "Nós vs Eles".\n\nMostre por que contratar a RGP é um investimento, enquanto contratar agências tradicionais é um gasto. Foque em ROI, previsibilidade e tecnologia.'
  }
];

const DanteModule: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [copyOutput, setCopyOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [contentType, setContentType] = useState('Copy');
  const [lastInstruction, setLastInstruction] = useState('');

  const [savedScripts, setSavedScripts] = useState<SavedScript[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rgp_dante_scripts');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('rgp_dante_scripts', JSON.stringify(savedScripts));
  }, [savedScripts]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedDraft = localStorage.getItem('rgp_dante_draft');
    if (savedDraft) setPrompt(savedDraft);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('rgp_dante_draft', prompt);
  }, [prompt]);

  const filteredScripts = useMemo(() => {
    return savedScripts.filter(script =>
      script.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [savedScripts, searchTerm]);

  const wordCount = useMemo(() => {
    return copyOutput.trim() ? copyOutput.trim().split(/\s+/).length : 0;
  }, [copyOutput]);

  const charCount = useMemo(() => copyOutput.length, [copyOutput]);

  const buildPrompt = (userPrompt: string) => {
    return `
Você é Dante, copywriter estratégico da RGP.
Escreva em português do Brasil com foco em conversão, clareza, autoridade e resultado.

FORMATO DE SAÍDA:
- Texto bem organizado
- Clareza comercial
- CTA forte quando fizer sentido
- Linguagem profissional e persuasiva
- Evite enrolação

TIPO DE CONTEÚDO:
${contentType}

PEDIDO:
${userPrompt}
    `.trim();
  };

  const loginAndSaveToDrive = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (!copyOutput) {
        alert('Gere um texto primeiro!');
        return;
      }

      const fileName = `RGP_Dante_${new Date().toLocaleDateString().replace(/\//g, '-')}.md`;
      setIsUploading(true);

      try {
        await uploadToDrive(tokenResponse.access_token, fileName, copyOutput);
        alert('✅ Sucesso! Arquivo salvo no seu Google Drive.');
      } catch (error) {
        console.error(error);
        alert('Erro ao salvar no Drive. Verifique se deu permissão.');
      } finally {
        setIsUploading(false);
      }
    },
    onError: () => alert('Login com Google falhou.'),
    scope: 'https://www.googleapis.com/auth/drive.file'
  });

  const handleTemplateClick = (templateId: string, templatePrompt: string) => {
    setSelectedTemplateId(templateId);
    setPrompt(templatePrompt);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setLastInstruction('');

    try {
      const finalPrompt = buildPrompt(prompt);
      const res = await generateCopyStrategy(finalPrompt);
      setCopyOutput(res || '');
    } catch (e) {
      setCopyOutput('Erro ao gerar estratégia. O Dante está descansando.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateVariant = async (instruction: string) => {
    if (!copyOutput.trim()) return;

    setIsGenerating(true);
    setLastInstruction(instruction);

    try {
      const finalPrompt = `
Você é Dante, copywriter estratégico da RGP.

INSTRUÇÃO:
${instruction}

TEXTO BASE:
${copyOutput}

Reescreva em português do Brasil, mantendo o objetivo comercial e melhorando a performance.
      `.trim();

      const res = await generateCopyStrategy(finalPrompt);
      setCopyOutput(res || '');
    } catch (e) {
      setCopyOutput('Erro ao gerar nova variação.');
    } finally {
      setIsGenerating(false);
      setLastInstruction('');
    }
  };

  const handleSaveScriptLocal = () => {
    if (!copyOutput.trim()) return;

    const title = window.prompt('Dê um nome para este Script:', 'Novo Script RGP');
    if (!title) return;

    const newScript: SavedScript = {
      id: Date.now().toString(),
      title,
      content: copyOutput,
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      type: contentType,
      prompt,
      templateId: selectedTemplateId || undefined
    };

    setSavedScripts([newScript, ...savedScripts]);
    alert('Script salvo na sua biblioteca local!');
  };

  const handleDeleteScript = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este script permanentemente?')) {
      setSavedScripts(savedScripts.filter(s => s.id !== id));
    }
  };

  const handleLoadScript = (script: SavedScript) => {
    setCopyOutput(script.content);
    setPrompt(script.prompt || '');
    setSelectedTemplateId(script.templateId || null);
    setContentType(script.type || 'Copy');
  };

  const handleCopy = async () => {
    if (!copyOutput) return;

    try {
      await navigator.clipboard.writeText(copyOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Não foi possível copiar o texto.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[calc(100vh-100px)]">
      {/* COLUNA DA ESQUERDA */}
      <div className="lg:col-span-1 space-y-6 flex flex-col">
        <div>
          <h3 className="font-bold text-lg mb-4 text-white">Templates Rápidos</h3>
          <div className="space-y-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTemplateClick(t.id, t.promptModel)}
                className={`w-full text-left p-4 rounded-xl border transition-all group active:scale-95 ${
                  selectedTemplateId === t.id
                    ? 'bg-slate-800 border-purple-500 shadow-lg shadow-purple-900/10'
                    : 'bg-slate-900 border-slate-800 hover:border-purple-500 hover:bg-slate-800'
                }`}
              >
                <h4 className="text-sm font-bold text-purple-400 mb-1 group-hover:text-purple-300">
                  {t.title}
                </h4>
                <p className="text-[10px] text-slate-500 leading-tight group-hover:text-slate-400">
                  {t.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h4 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
              <i className="fas fa-save"></i> Meus Scripts Salvos
            </h4>
            <span className="text-[10px] text-slate-600">{savedScripts.length} itens</span>
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar script..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-purple-500 outline-none mb-3"
          />

          <div className="overflow-y-auto space-y-2 pr-2 flex-1 custom-scrollbar">
            {filteredScripts.length === 0 ? (
              <p className="text-xs text-slate-600 italic text-center mt-4">
                {savedScripts.length === 0
                  ? 'Nenhum script salvo ainda.'
                  : 'Nenhum script encontrado para essa busca.'}
              </p>
            ) : (
              filteredScripts.map((script) => (
                <div
                  key={script.id}
                  className="group flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800 hover:border-purple-500/30 transition-all"
                >
                  <div className="flex-1 cursor-pointer overflow-hidden" onClick={() => handleLoadScript(script)}>
                    <p className="text-xs font-bold text-slate-300 truncate group-hover:text-purple-400 transition-colors">
                      {script.title}
                    </p>
                    <span className="text-[10px] text-slate-600">
                      {script.date} • {script.type}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteScript(script.id)}
                    className="ml-2 text-slate-600 hover:text-red-500 p-1 rounded transition-colors"
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
      <div className="lg:col-span-3 flex flex-col gap-6 overflow-y-auto pb-10">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg shrink-0">
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-white">
            <i className="fas fa-pen-nib text-purple-500"></i> Dante: Creative Copy Generator
          </h3>

          <p className="text-sm text-slate-400 mb-6">
            Selecione um template ao lado ou descreva o que você precisa.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Tipo de Conteúdo
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="Copy">Copy</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Legenda">Legenda</option>
                  <option value="Anúncio">Anúncio</option>
                  <option value="E-mail">E-mail</option>
                  <option value="Roteiro curto">Roteiro curto</option>
                  <option value="Página de vendas">Página de vendas</option>
                </select>
              </div>

              <div className="md:col-span-2 flex items-end">
                <div className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-3 text-xs text-slate-400">
                  {selectedTemplateId
                    ? `Template ativo: ${TEMPLATES.find(t => t.id === selectedTemplateId)?.title || 'Selecionado'}`
                    : 'Nenhum template selecionado'}
                </div>
              </div>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none h-36 leading-relaxed text-white placeholder-slate-600 transition-all font-mono"
              placeholder="Clique em um template ou digite..."
            />

            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-slate-500">
                O rascunho do prompt está sendo salvo automaticamente.
              </span>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
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
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4 flex-wrap gap-3">
              <span className="text-xs font-bold text-purple-400 tracking-widest uppercase">
                <i className="fas fa-scroll mr-2"></i>Produção Gerada
              </span>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleSaveScriptLocal}
                  className="text-xs flex items-center gap-2 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-600/30 hover:border-emerald-600 text-emerald-400 hover:text-white px-4 py-2 rounded-lg transition-all font-bold"
                >
                  <i className="fas fa-save"></i> Salvar Local
                </button>

                <button
                  onClick={() => loginAndSaveToDrive()}
                  disabled={isUploading}
                  className="text-xs flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600 border border-blue-600/30 hover:border-blue-600 text-blue-400 hover:text-white px-4 py-2 rounded-lg transition-all font-bold disabled:opacity-60"
                >
                  {isUploading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fab fa-google-drive"></i>}
                  {isUploading ? 'Enviando...' : 'Salvar no Drive'}
                </button>

                <button
                  onClick={handleCopy}
                  className="text-xs flex items-center gap-2 bg-slate-800 hover:bg-purple-600 border border-slate-700 hover:border-purple-500 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-all font-bold"
                >
                  <i className="fas fa-copy"></i> {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() =>
                  handleRegenerateVariant('Reescreva esse texto de forma mais agressiva e focada em conversão.')
                }
                disabled={isGenerating}
                className="text-[11px] px-3 py-2 rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-300 hover:bg-purple-600 hover:text-white transition-all disabled:opacity-50"
              >
                Mais agressiva
              </button>

              <button
                onClick={() =>
                  handleRegenerateVariant('Transforme essa copy em uma mensagem curta e direta de WhatsApp.')
                }
                disabled={isGenerating}
                className="text-[11px] px-3 py-2 rounded-lg border border-green-500/20 bg-green-500/10 text-green-300 hover:bg-green-600 hover:text-white transition-all disabled:opacity-50"
              >
                WhatsApp
              </button>

              <button
                onClick={() =>
                  handleRegenerateVariant('Transforme esse texto em uma legenda envolvente para Instagram com CTA.')
                }
                disabled={isGenerating}
                className="text-[11px] px-3 py-2 rounded-lg border border-pink-500/20 bg-pink-500/10 text-pink-300 hover:bg-pink-600 hover:text-white transition-all disabled:opacity-50"
              >
                Legenda
              </button>

              <button
                onClick={() =>
                  handleRegenerateVariant('Crie 3 variações diferentes dessa copy mantendo o mesmo objetivo.')
                }
                disabled={isGenerating}
                className="text-[11px] px-3 py-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-600 hover:text-white transition-all disabled:opacity-50"
              >
                3 variações
              </button>

              <button
                onClick={() =>
                  handleRegenerateVariant('Deixe o CTA final mais forte, mais direto e mais orientado à ação.')
                }
                disabled={isGenerating}
                className="text-[11px] px-3 py-2 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-600 hover:text-white transition-all disabled:opacity-50"
              >
                CTA melhor
              </button>
            </div>

            {isGenerating && lastInstruction && (
              <div className="mb-4 text-xs text-slate-400">
                Ajustando copy: <span className="text-purple-400 font-semibold">{lastInstruction}</span>
              </div>
            )}

            <div className="flex gap-4 text-xs text-slate-500 mb-5 border-b border-slate-800 pb-4 flex-wrap">
              <span>{wordCount} palavras</span>
              <span>{charCount} caracteres</span>
              <span>Tipo: {contentType}</span>
            </div>

            <div className="text-slate-300 leading-relaxed text-base prose prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{copyOutput}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DanteModule;
