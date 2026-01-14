import React, { useState } from 'react';
import { CreativeDelivery } from '../types';
import { generateCreativeIdeas } from '../services/geminiService';

const DELIVERIES: CreativeDelivery[] = [
  { id: '1', client: 'Master Fit', type: 'Pack de Anúncios (5)', deadline: '22/05', status: 'EM_PRODUCAO' },
  { id: '2', client: 'Lojas Americanas (Aff)', type: 'Vídeo Reel UGC', deadline: '23/05', status: 'PENDENTE' },
  { id: '3', client: 'Tech Hub', type: 'Static Banner Set', deadline: '20/05', status: 'ENTREGUE' },
  { id: '4', client: 'Clínica Sorriso', type: 'Motion Graphics 15s', deadline: '24/05', status: 'REVISAO' },
];

const RubensModule: React.FC = () => {
  const [brainstormClient, setBrainstormClient] = useState('');
  const [creativeIdeas, setCreativeIdeas] = useState('');
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBrainstorm = async () => {
    if (!brainstormClient) return;

    setIsBrainstorming(true);
    setCreativeIdeas('');
    setError(null);

    try {
      const ideas = await generateCreativeIdeas(brainstormClient, 'Geral');

      if (!ideas || typeof ideas !== 'string') {
        throw new Error('Resposta inválida da IA');
      }

      setCreativeIdeas(ideas);
    } catch (err: any) {
      console.error('Erro Rubens:', err);

      setError(
        err?.message ||
        'Erro ao gerar ideias. Verifique a API ou tente novamente.'
      );
    } finally {
      setIsBrainstorming(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ENTREGUE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'EM_PRODUCAO':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'REVISAO':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">

      {/* ======= BRAINSTORM ======= */}
      <div className="bg-gradient-to-r from-orange-900/40 to-rose-900/40 p-8 rounded-2xl border border-orange-500/20">
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
              <i className="fas fa-lightbulb"></i> Rubens Creative Lab
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Gere roteiros de Reels e TikToks instantâneos com IA.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={brainstormClient}
              onChange={(e) => setBrainstormClient(e.target.value)}
              placeholder="Nome do Cliente ou Nicho"
              className="flex-1 bg-slate-950/50 border border-orange-500/30 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 outline-none placeholder-slate-500"
            />

            <button
              onClick={handleBrainstorm}
              disabled={isBrainstorming || !brainstormClient}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {isBrainstorming ? 'Criando…' : 'Gerar Ideias'}
            </button>
          </div>

          {/* ======= ERRO ======= */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-300 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* ======= RESULTADO ======= */}
          {creativeIdeas && (
            <div className="bg-slate-950 p-6 rounded-xl border border-orange-500/20">
              <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                <h4 className="text-orange-400 font-bold uppercase text-xs">
                  Ideias do Rubens
                </h4>
                <button
                  onClick={() => navigator.clipboard.writeText(creativeIdeas)}
                  className="text-xs text-slate-500 hover:text-white"
                >
                  Copiar
                </button>
              </div>

              <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">
                {creativeIdeas}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RubensModule;
