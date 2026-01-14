
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
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
  const [roi, setRoi] = useState<number | null>(null);
  const [cost, setCost] = useState('');
  const [revenue, setRevenue] = useState('');
  const [insights, setInsights] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const calculateROI = () => {
    const c = parseFloat(cost);
    const r = parseFloat(revenue);
    if (c && r) {
      setRoi(((r - c) / c) * 100);
    }
  };

  const getAIInsights = async () => {
    setIsLoading(true);
    try {
      const result = await analyzeFinanceData(JSON.stringify(data));
      setInsights(result || 'Não foi possível gerar insights no momento.');
    } catch (error) {
      setInsights('Erro ao conectar com a Sofia AI.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Receita Total', value: 'R$ 72.000', change: '+12%', pos: true, icon: 'fa-money-bill-wave' },
          { label: 'Margem Líquida', value: '68%', change: '+5%', pos: true, icon: 'fa-percentage' },
          { label: 'CAC Médio', value: 'R$ 45,20', change: '-8%', pos: true, icon: 'fa-users-slash' },
          { label: 'LTV/CAC', value: '4.2x', change: '+0.2', pos: true, icon: 'fa-rocket' },
        ].map((kpi, i) => (
          <div key={i} className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <i className={`fas ${kpi.icon} text-blue-500`}></i>
              </div>
              <span className={`text-xs font-bold ${kpi.pos ? 'text-emerald-400' : 'text-rose-400'}`}>
                {kpi.change}
              </span>
            </div>
            <h3 className="text-slate-400 text-sm font-medium">{kpi.label}</h3>
            <p className="text-2xl font-bold mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Crescimento de Receita vs Gastos</h3>
            <button onClick={getAIInsights} disabled={isLoading} className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2">
              <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
              {isLoading ? 'Analisando...' : 'Pedir Insight IA'}
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
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                <Area type="monotone" dataKey="spend" stroke="#f43f5e" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {insights && (
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg text-sm text-blue-200">
              <div className="flex gap-2 mb-2 font-bold items-center">
                <i className="fas fa-robot"></i> Insight da Sofia:
              </div>
              <p className="whitespace-pre-wrap">{insights}</p>
            </div>
          )}
        </div>

        {/* ROI Calculator */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col">
          <h3 className="font-bold text-lg mb-4">Calculadora de ROI</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Investimento em Tráfego (R$)</label>
              <input 
                type="number" 
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: 5000"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Receita Gerada (R$)</label>
              <input 
                type="number" 
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: 25000"
              />
            </div>
            <button 
              onClick={calculateROI}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-all mt-2"
            >
              Calcular Retorno
            </button>
            {roi !== null && (
              <div className="mt-4 p-4 bg-slate-800 rounded-lg text-center animate-bounce">
                <div className="text-xs text-slate-400">Seu ROI é de</div>
                <div className={`text-3xl font-black ${roi > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {roi.toFixed(2)}%
                </div>
                <div className="text-xs mt-1 text-slate-500">
                  ROAS: {(parseFloat(revenue) / parseFloat(cost)).toFixed(1)}x
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
