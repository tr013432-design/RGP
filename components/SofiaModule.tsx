import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';
import { analyzeFinanceData } from '../services/aiService';

const data = [
  { name: 'Jan', revenue: 45000, spend: 12000 },
  { name: 'Fev', revenue: 52000, spend: 15000 },
  { name: 'Mar', revenue: 48000, spend: 14000 },
  { name: 'Abr', revenue: 61000, spend: 18000 },
  { name: 'Mai', revenue: 59000, spend: 17500 },
  { name: 'Jun', revenue: 72000, spend: 22000 },
];

const SofiaModule: React.FC = () => {
  const [cost, setCost] = useState('');
  const [revenue, setRevenue] = useState('');
  const [taxRate, setTaxRate] = useState('6');
  const [platformFee, setPlatformFee] = useState('10');
  const [roiData, setRoiData] = useState<{ roi: number; netProfit: number; roas: number } | null>(null);
  const [insights, setInsights] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const FIXED_COSTS = 15000;

  // Função para limpar e formatar a fala da Sofia em Cards
  const formatSofiaInsight = (rawText: string) => {
    // Remove saudações e apresentações
    let cleaned = rawText.replace(/(Olá|Sou Sofia|Meu nome é sofia|analista financeira sênior|Analisei os dados fornecidos).*?(\.|\n)/gi, '');
    
    // Divide o texto em blocos baseados em marcadores comuns (##, ###, números ou quebras de linha duplas)
    return cleaned.split(/###|##|\d\./).filter(s => s.trim().length > 10);
  };

  const calculateAdvancedROI = () => {
    const c = parseFloat(cost);
    const r = parseFloat(revenue);
    const t = parseFloat(taxRate) / 100;
    const p = parseFloat(platformFee) / 100;

    if (c && r) {
      const taxes = r * t;
      const fees = r * p;
      const netProfit = r - c - taxes - fees;
      const roi = (netProfit / c) * 100;
      const roas = r / c;
      setRoiData({ roi, netProfit, roas });
    }
  };

  const getAIInsights = async () => {
    setIsLoading(true);
    try {
      const result = await analyzeFinanceData(JSON.stringify(data));
      setInsights(result || '');
    } catch (error) {
      setInsights('Erro ao processar análise inteligente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Receita Total', value: 'R$ 72.000', change: '+12%', icon: 'fa-money-bill-wave' },
          { label: 'Margem Líquida', value: '68%', change: '+5%', icon: 'fa-percentage' },
          { label: 'CAC Médio', value: 'R$ 45,20', change: '-8%', icon: 'fa-users-slash' },
          { label: 'LTV/CAC', value: '4.2x', change: '+0.2', icon: 'fa-rocket' },
        ].map((kpi, i) => (
          <div key={i} className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <i className={`fas ${kpi.icon} text-blue-500`}></i>
              </div>
              <span className="text-xs font-bold text-emerald-400">{kpi.change}</span>
            </div>
            <h3 className="text-slate-400 text-sm font-medium">{kpi.label}</h3>
            <p className="text-2xl font-bold mt-1 text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Section */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-white">Eficiência Financeira</h3>
              <button onClick={getAIInsights} disabled={isLoading} className="text-xs bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2">
                <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                {isLoading ? 'ANALISANDO...' : 'PEDIR INSIGHT IA'}
              </button>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                  <ReferenceLine y={FIXED_COSTS} label={{ position: 'right', value: 'Break-even', fill: '#64748b', fontSize: 10 }} stroke="#64748b" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                  <Area type="monotone" dataKey="spend" stroke="#f43f5e" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* NOVA VISUALIZAÇÃO DE INSIGHTS EM CARDS */}
          {insights && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-500">
              {formatSofiaInsight(insights).map((section, idx) => (
                <div key={idx} className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl relative group hover:border-blue-500/40 transition-all">
                  <div className="flex gap-3">
                    <div className="mt-1">
                      <i className="fas fa-bolt-lightning text-blue-400 text-xs"></i>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {section.trim()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ROI Calculator */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col shadow-lg h-fit">
          <h3 className="font-bold text-lg mb-4 text-white">ROI Sofia: Lucro Real</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Imposto (%)</label>
                <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Taxas (%)</label>
                <input type="number" value={platformFee} onChange={(e) => setPlatformFee(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white outline-none focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Investimento (R$)</label>
              <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Receita Bruta (R$)</label>
              <input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <button onClick={calculateAdvancedROI} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all uppercase tracking-wider text-xs shadow-lg shadow-blue-900/20">
              Calcular Performance
            </button>
            
            {roiData && (
              <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 animate-in slide-in-from-bottom-2">
                <div className="text-center mb-3">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Lucro Líquido Real</div>
                  <div className="text-2xl font-black text-emerald-400">R$ {roiData.netProfit.toLocaleString('pt-BR')}</div>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-3 text-center">
                  <div className="flex-1 border-r border-slate-800">
                    <div className="text-[10px] text-slate-500 font-bold">ROI</div>
                    <div className="text-sm font-bold text-emerald-500">{roiData.roi.toFixed(1)}%</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-500 font-bold">ROAS</div>
                    <div className="text-sm font-bold text-blue-400">{roiData.roas.toFixed(1)}x</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SofiaModule;
