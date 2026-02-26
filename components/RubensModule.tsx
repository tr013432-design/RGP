import React, { useState, useEffect, useMemo } from 'react';
import { generateCreativeIdeas } from '../services/aiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SavedIdea {
  id: string;
  title: string;
  content: string;
  date: string;
  niche: string;
  goal: string;
  platform: string;
  tone: string;
  audience: string;
  offer: string;
}

const NICHE_PRESETS = [
  {
    id: 'pilates',
    label: 'Studio de Pilates',
    niche: 'Studio de Pilates',
    audience: 'Mulheres de 28 a 55 anos que querem aliviar dores, melhorar postura e saúde',
    offer: 'Avaliação experimental / aula teste / planos mensais'
  },
  {
    id: 'otica',
    label: 'Ótica',
    niche: 'Ótica local',
    audience: 'Pessoas que precisam trocar óculos e valorizam atendimento e preço justo',
    offer: 'Exame de vista, armações, lentes e promoções'
  },
  {
    id: 'advogada',
    label: 'Advogada',
    niche: 'Advogada criminalista',
    audience: 'Pessoas que buscam orientação jurídica urgente e confiam em autoridade',
    offer: 'Atendimento especializado e consultoria jurídica'
  }
];

const RubensModule: React.FC = () => {
  const [client, setClient] = useState('');
  const [goal, setGoal] = useState('Viralização (Topo de Funil)');
  const [platform, setPlatform] = useState('Instagram Reels');
  const [tone, setTone] = useState('Direto');
  const [audience, setAudience] = useState('');
  const [offer, setOffer] = useState('');

  const [ideasOutput, setIdeasOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState('');

  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('rgp_rubens_ideas');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('rgp_rubens_ideas', JSON.stringify(savedIdeas));
  }, [savedIdeas]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedDraft = localStorage.getItem('rgp_rubens_draft');
    if (!savedDraft) return;

    try {
      const parsed = JSON.parse(savedDraft);
      setClient(parsed.client || '');
      setGoal(parsed.goal || 'Viralização (Topo de Funil)');
      setPlatform(parsed.platform || 'Instagram Reels');
      setTone(parsed.tone || 'Direto');
      setAudience(parsed.audience || '');
      setOffer(parsed.offer || '');
    } catch {
      // ignora draft inválido
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(
      'rgp_rubens_draft',
      JSON.stringify({
        client,
        goal,
        platform,
        tone,
        audience,
        offer
      })
    );
  }, [client, goal, platform, tone, audience, offer]);

  const filteredIdeas = useMemo(() => {
    return savedIdeas.filter(item => {
      const search = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(search) ||
        item.niche.toLowerCase().includes(search) ||
        item.goal.toLowerCase().includes(search) ||
        item.platform.toLowerCase().includes(search)
      );
    });
  }, [savedIdeas, searchTerm]);

  const outputStats = useMemo(() => {
    const words = ideasOutput.trim() ? ideasOutput.trim().split(/\s+/).length : 0;
    const chars = ideasOutput.length;
    return { words, chars };
  }, [ideasOutput]);

  const applyPreset = (presetId: string) => {
    const preset = NICHE_PRESETS.find(item => item.id === presetId);
    if (!preset) return;

    setSelectedPreset(presetId);
    setClient(preset.niche);
    setAudience(preset.audience);
    setOffer(preset.offer);
  };

  const buildClientContext = () => {
    return `
NICHO / CLIENTE:
${client}

PLATAFORMA:
${platform}

OBJETIVO:
${goal}

TOM:
${tone}

PÚBLICO:
${audience || 'Não informado'}

OFERTA / SERVIÇO:
${offer || 'Não informado'}
    `.trim();
  };

  const handleGenerate = async () => {
    if (!client.trim()) return;

    setIsGenerating(true);
    setLastAction('Gerando novas ideias');

    try {
      const enrichedClientContext = `
${buildClientContext()}

TAREFA:
Crie 10 ideias de conteúdo para ${platform}, com foco em ${goal}.
Quero ideias práticas, modernas, com potencial de retenção, gancho forte e apelo para conteúdo curto.
Sempre que possível, traga:
- gancho de abertura
- linha central do vídeo
- CTA sugerido
- ângulo criativo
      `.trim();

      const res = await generateCreativeIdeas(enrichedClientContext, goal);
      setIdeasOutput(res || '');
    } catch (e) {
      setIdeasOutput('Erro: O Rubens está sem criatividade agora (falha na API).');
    } finally {
      setIsGenerating(false);
      setLastAction('');
    }
  };

  const handleRegenerateVariant = async (instruction: string) => {
    if (!client.trim()) return;

    setIsGenerating(true);
    setLastAction(instruction);

    try {
      const enrichedClientContext = `
${buildClientContext()}

INSTRUÇÃO EXTRA:
${instruction}

USE TAMBÉM COMO REFERÊNCIA AS IDEIAS ABAIXO:
${ideasOutput || 'Ainda sem ideias anteriores.'}
      `.trim();

      const res = await generateCreativeIdeas(enrichedClientContext, `${goal} | ${instruction}`);
      setIdeasOutput(res || '');
    } catch (e) {
      setIdeasOutput('Erro ao gerar nova variação de ideias.');
    } finally {
      setIsGenerating(false);
      setLastAction('');
    }
  };

  const handleSave = () => {
    if (!ideasOutput.trim()) return;

    const title = window.prompt('Nomeie esta campanha/ideia:', `${client} - ${goal}`);
    if (!title) return;

    const newIdea: SavedIdea = {
      id: Date.now().toString(),
      title,
      content: ideasOutput,
      date: new Date().toLocaleDateString('pt-BR'),
      niche: client,
      goal,
      platform,
      tone,
      audience,
      offer
    };

    setSavedIdeas([newIdea, ...savedIdeas]);
    alert('Ideia salva na Galeria!');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Jogar esta ideia no lixo?')) {
      setSavedIdeas(savedIdeas.filter(idea => idea.id !== id));
    }
  };

  const handleLoad = (idea: SavedIdea) => {
    setIdeasOutput(idea.content);
    setClient(idea.niche);
    setGoal(idea.goal);
    setPlatform(idea.platform);
    setTone(idea.tone);
    setAudience(idea.audience);
    setOffer(idea.offer);
  };

  const handleCopy = async () => {
    if (!ideasOutput) return;

    try {
      await navigator.clipboard.writeText(ideasOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      alert('Não foi possível copiar o texto.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[calc(100vh-100px)]">
      {/* COLUNA DA ESQUERDA */}
      <div className="lg:col-span-1 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <h3 className="font-bold text-sm text-amber-500 uppercase flex items-center gap-2">
            <i className="fas fa-lightbulb"></i> Galeria de Ideias
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">{savedIdeas.length} ideias salvas</p>
        </div>

        <div className="p-3 border-b border-slate-800">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar ideia..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-amber-500 outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {filteredIdeas.length === 0 ? (
            <div className="text-center mt-10 opacity-40 px-4">
              <i className="fas fa-box-open text-3xl mb-2 text-slate-500"></i>
              <p className="text-xs text-slate-500">
                {savedIdeas.length === 0
                  ? 'Nenhuma ideia salva.'
                  : 'Nenhuma ideia encontrada para essa busca.'}
              </p>
            </div>
          ) : (
            filteredIdeas.map((item) => (
              <div
                key={item.id}
                className="group bg-slate-950/50 border border-slate-800 p-3 rounded-lg hover:border-amber-500/50 transition-all flex justify-between items-start"
              >
                <div onClick={() => handleLoad(item)} className="cursor-pointer flex-1 overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                    {item.date} • {item.niche}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-1 line-clamp-1">
                    {item.goal} • {item.platform}
                  </p>
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

      {/* COLUNA DA DIREITA */}
      <div className="lg:col-span-3 flex flex-col gap-6 overflow-y-auto pb-10">
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

          {/* PRESETS */}
          <div className="mb-4 relative z-10">
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
              Atalhos de Nicho
            </label>
            <div className="flex flex-wrap gap-2">
              {NICHE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                    selectedPreset === preset.id
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-amber-500 hover:text-amber-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <div>
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
                <option>Conexão / Lifestyle</option>
                <option>Captação de Leads</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Plataforma</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-amber-500 outline-none transition-all"
              >
                <option>Instagram Reels</option>
                <option>TikTok</option>
                <option>YouTube Shorts</option>
                <option>Stories</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tom</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-amber-500 outline-none transition-all"
              >
                <option>Direto</option>
                <option>Autoridade</option>
                <option>Premium</option>
                <option>Popular</option>
                <option>Polêmico</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Público</label>
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Quem você quer atingir?"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-amber-500 outline-none transition-all placeholder-slate-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Oferta / Serviço</label>
              <input
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                placeholder="Ex: avaliação gratuita, aula teste, consulta..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-amber-500 outline-none transition-all placeholder-slate-600"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 flex-wrap relative z-10">
            <span className="text-xs text-slate-500">O briefing está sendo salvo automaticamente.</span>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !client.trim()}
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-lg shadow-lg shadow-amber-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isGenerating ? (
                <><i className="fas fa-spinner fa-spin"></i> Criando Roteiros...</>
              ) : (
                <><i className="fas fa-wand-magic-sparkles"></i> Gerar 10 Ideias Virais</>
              )}
            </button>
          </div>
        </div>

        {ideasOutput && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl relative animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4 flex-wrap gap-3">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                <i className="fas fa-clapperboard mr-2"></i> Roteiros Gerados
              </span>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-amber-600 border border-slate-700 hover:border-amber-500 text-slate-300 hover:text-white rounded text-xs font-bold transition-all flex items-center gap-2"
                >
                  <i className="fas fa-save"></i> Salvar
                </button>

                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-xs font-bold transition-all flex items-center gap-2"
                >
                  <i className="fas fa-copy"></i> {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => handleRegenerateVariant('Crie ideias mais polêmicas e com ganchos mais fortes.')}
                disabled={isGenerating}
                className="text-[11px] px-3 py-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
              >
                Mais polêmica
              </button>

              <button
                onClick={() => handleRegenerateVariant('Crie ideias mais focadas em vendas e conversão.')}
                disabled={isGenerating}
                className="text-[11px] px-3 py-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
              >
                Mais vendas
              </button>

              <button
                onClick={() => handleRegenerateVariant('Crie ideias com foco em autoridade e posicionamento.')}
                disabled={isGenerating}
                className="text-[11px] px-3 py-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-600 hover:text-white transition-all disabled:opacity-50"
              >
                Mais autoridade
              </button>

              <button
                onClick={() => handleRegenerateVariant('Crie hooks mais curtos e mais fortes para abertura de vídeo.')}
                disabled={isGenerating}
                className="text-[11px] px-3 py-2 rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-300 hover:bg-purple-600 hover:text-white transition-all disabled:opacity-50"
              >
                Hooks fortes
              </button>
            </div>

            {isGenerating && lastAction && (
              <div className="mb-4 text-xs text-slate-400">
                Ajustando ideias: <span className="text-amber-400 font-semibold">{lastAction}</span>
              </div>
            )}

            <div className="flex gap-4 text-xs text-slate-500 mb-5 border-b border-slate-800 pb-4 flex-wrap">
              <span>{outputStats.words} palavras</span>
              <span>{outputStats.chars} caracteres</span>
              <span>{platform}</span>
              <span>{goal}</span>
            </div>

            <div className="text-slate-300 leading-relaxed text-sm prose prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-white mb-4 mt-2" {...props} />,
                  h2: ({ node, ...props }) => (
                    <h2 className="text-lg font-bold text-amber-400 mb-3 mt-6 border-l-4 border-amber-500 pl-3" {...props} />
                  ),
                  h3: ({ node, ...props }) => <h3 className="text-base font-bold text-white mb-2 mt-4" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-bold text-amber-200" {...props} />,
                  ul: ({ node, ...props }) => <ul className="space-y-2 my-3 pl-2" {...props} />,
                  li: ({ node, ...props }) => (
                    <li className="flex gap-2 items-start" {...props}>
                      <span className="text-amber-500 mt-1.5 text-[6px]"><i className="fas fa-circle"></i></span>
                      <span className="flex-1">{props.children}</span>
                    </li>
                  ),
                  p: ({ node, ...props }) => <p className="mb-3 text-slate-300" {...props} />
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
