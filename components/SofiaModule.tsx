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
  const [taxRate, setTaxRate] = useState('6'); // Padrão Simples Nacional
  const [platformFee, setPlatformFee] = useState('10'); // Padrão Hotmart/Stripe
  const [roiData, setRoiData] = useState<{ roi: number; netProfit: number; roas: number } | null>(null);
  const [insights, setInsights] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Média de custos fixos para a Linha de Break-even (Exemplo: R$ 15.000)
  const FIXED_COSTS = 15000;

  const calculateAdvancedROI = () => {
    const c = parseFloat(cost);
    const r = parseFloat(revenue);
    const t = parseFloat(taxRate) / 100;
    const p = parseFloat(platformFee) / 100;

    if (c && r) {
      const grossProfit = r - c;
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
      setInsights(result || 'Análise concluída sem anomalias detectadas.');
    } catch (error) {
      setInsights('Erro crítico na conexão com a Sofia.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPI Cards Reais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Receita Total', value: 'R$ 72.000', change: '+12%', pos: true, icon: 'fa-money-bill-wave' },
          { label: 'Margem Líquida', value: '68%', change: '+5%', pos: true, icon: 'fa-percentage' },
          { label: 'CAC Médio', value: 'R$ 45,20', change: '-8%', pos: true, icon: 'fa-users-slash' },
          { label: 'LTV/CAC', value: '4.2x', change: '+0.2', pos: true, icon: 'fa-rocket' },
        ].map((kpi, i) => (
          <div key={i} className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <i className={`fas ${kpi.icon} text-blue-500`}></i>
              </div>
              <span className={`text-xs font-bold ${kpi.pos ? 'text-emerald-400' : 'text-rose-400'}`}>
                {kpi.change}
              </span>
            </div>
            <h3 className="text-slate-400 text-sm font-medium">{kpi.label}</h3>
            <p className="text-2xl font-bold mt-1 text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico com Linha de Break-even */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg text-white">Eficiência Financeira</h3>
              <p className="text-xs text-slate-500">Comparativo Receita vs Gastos vs Ponto de Equilíbrio</p>
            </div>
            <button onClick={getAIInsights} disabled={isLoading} className="text-xs bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2">
              <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
              {isLoading ? 'ANALISANDO DADOS...' : 'SOLICITAR INSIGHT DA SOFIA'}
            </button>
          </div>
          <div className="h-[350px]">
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
                
                {/* Linha de Break-even (Ponto de Equilíbrio) */}
                <ReferenceLine y={FIXED_COSTS} label={{ position: 'right', value: 'Break-even', fill: '#64748b', fontSize: 10 }} stroke="#64748b" strokeDasharray="3 3" />
                
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                <Area type="monotone" dataKey="spend" stroke="#f43f5e" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {insights && (
            <div className="mt-6 p-4 bg-blue-500/5 border-l-4 border-blue-500 rounded-r-lg text-sm text-blue-200">
              <div className="flex gap-2 mb-1 font-bold items-center text-blue-400">
                <i className="fas fa-brain"></i> ANÁLISE PREDITIVA:
              </div>
              <p className="italic">{insights}</p>
            </div>
          )}
        </div>

        {/* Calculadora de ROI Sofia 2.5 Pro */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col shadow-lg">
          <h3 className="font-bold text-lg mb-4 text-white">ROI Sofia: Lucro Real</h3>
          <div className="space-y-4 flex-grow">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Imposto (%)</label>
                <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Taxas IA/Plat (%)</label>
                <input type="number" value={platformFee} onChange={(e) => setPlatformFee(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Investimento em Tráfego (R$)</label>
              <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Receita Bruta Gerada (R$)</label>
              <input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none" placeholder="0.00" />
            </div>
            <button onClick={calculateAdvancedROI} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all mt-2 uppercase tracking-wider text-xs shadow-lg shadow-blue-900/20">
              Calcular Performance
            </button>
            
            {roiData && (
              <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 animate-in slide-in-from-bottom-2">
                <div className="text-center mb-3">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Lucro Líquido Real</div>
                  <div className="text-2xl font-black text-emerald-400">R$ {roiData.netProfit.toLocaleString('pt-BR')}</div>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-3">
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 font-bold">ROI REAL</div>
                    <div className={`text-sm font-bold ${roiData.roi > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{roiData.roi.toFixed(1)}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 font-bold">ROAS</div>
                    <div className="text-sm font-bold text-blue-400">{roiData.roas.toFixed(1)}x</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-600 mt-4 italic text-center">Sofia odeia achismos. Estes dados consideram impostos e taxas operacionais.</p>
        </div>
      </div>
    </div>
  );
};

export default SofiaModule;
