import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { analyzeFinanceData } from '../services/aiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FinanceData {
  name: string;
  revenue: number;
  spend: number;
}

interface SavedInsight {
  id: string;
  title: string;
  content: string;
  date: string;
}

interface RoiResult {
  roi: number;
  netProfit: number;
  roas: number;
  netRevenue: number;
  taxesValue: number;
  feesValue: number;
  margin: number;
  breakEvenRevenue: number;
}

const SAMPLE_DATA: FinanceData[] = [
  { name: 'Jan', revenue: 4200, spend: 1200 },
  { name: 'Fev', revenue: 5100, spend: 1500 },
  { name: 'Mar', revenue: 6100, spend: 1700 },
  { name: 'Abr', revenue: 7200, spend: 2100 }
];

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const SofiaModule: React.FC = () => {
  const [chartData, setChartData] = useState<FinanceData[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('rgp_sofia_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedInsights, setSavedInsights] = useState<SavedInsight[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('rgp_sofia_reports');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('rgp_sofia_data', JSON.stringify(chartData));
  }, [chartData]);

  useEffect(() => {
    localStorage.setItem('rgp_sofia_reports', JSON.stringify(savedInsights));
  }, [savedInsights]);

  const [newData, setNewData] = useState({ month: '', rev: '', spend: '' });
  const [cost, setCost] = useState('');
  const [revenue, setRevenue] = useState('');
  const [taxRate, setTaxRate] = useState('6');
  const [platformFee, setPlatformFee] = useState('10');
  const [roiData, setRoiData] = useState<RoiResult | null>(null);

  const [insights, setInsights] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');

  const dashboardStats = useMemo(() => {
    const totalRevenue = chartData.reduce((acc, item) => acc + item.revenue, 0);
    const totalSpend = chartData.reduce((acc, item) => acc + item.spend, 0);
    const totalProfit = totalRevenue - totalSpend;
    const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const last = chartData[chartData.length - 1];
    const prev = chartData[chartData.length - 2];

    const revenueTrend =
      last && prev && prev.revenue > 0
        ? ((last.revenue - prev.revenue) / prev.revenue) * 100
        : 0;

    const spendTrend =
      last && prev && prev.spend > 0
        ? ((last.spend - prev.spend) / prev.spend) * 100
        : 0;

    return {
      totalRevenue,
      totalSpend,
      totalProfit,
      margin,
      revenueTrend,
      spendTrend,
      dataPoints: chartData.length
    };
  }, [chartData]);

  const handleAddDataPoint = () => {
    if (!newData.month.trim() || !newData.rev || !newData.spend) return;

    const newPoint: FinanceData = {
      name: newData.month.trim(),
      revenue: Number(newData.rev),
      spend: Number(newData.spend)
    };

    setChartData(prev => [...prev, newPoint]);
    setNewData({ month: '', rev: '', spend: '' });
  };

  const handleLoadExampleData = () => {
    if (chartData.length > 0) {
      const confirmReplace = window.confirm(
        'Já existem dados salvos. Deseja substituir pelos dados de exemplo?'
      );
      if (!confirmReplace) return;
    }
    setChartData(SAMPLE_DATA);
  };

  const handleClearData = () => {
    if (window.confirm('Apagar todo o histórico financeiro?')) {
      setChartData([]);
    }
  };

  const getAIInsights = async () => {
    setIsLoading(true);

    try {
      const dataContext =
        chartData.length > 0 ? JSON.stringify(chartData, null, 2) : 'Sem dados históricos.';

      const summaryContext = `
RESUMO EXECUTIVO:
- Receita total: ${formatCurrency(dashboardStats.totalRevenue)}
- Despesa total: ${formatCurrency(dashboardStats.totalSpend)}
- Lucro acumulado: ${formatCurrency(dashboardStats.totalProfit)}
- Margem: ${dashboardStats.margin.toFixed(1)}%
- Pontos no gráfico: ${dashboardStats.dataPoints}
- Tendência da receita vs período anterior: ${dashboardStats.revenueTrend.toFixed(1)}%
- Tendência da despesa vs período anterior: ${dashboardStats.spendTrend.toFixed(1)}%
      `.trim();

      const finalPrompt = `
Você é a Sofia, analista financeira estratégica da RGP.
Analise os dados abaixo de forma prática, executiva e orientada à decisão.

${customQuestion ? `PERGUNTA DO USUÁRIO:\n${customQuestion}\n` : ''}

${summaryContext}

DADOS HISTÓRICOS:
${dataContext}

Quero uma resposta em português com:
1. Diagnóstico geral
2. Pontos de atenção
3. Oportunidades
4. Próximas ações recomendadas
      `.trim();

      const result = await analyzeFinanceData(finalPrompt);
      setInsights(result || '');
    } catch (error) {
      setInsights('Erro ao processar análise.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveInsight = () => {
    if (!insights) return;

    const title = window.prompt(
      'Nome do Relatório:',
      `Análise Financeira ${new Date().toLocaleDateString()}`
    );

    if (!title) return;

    setSavedInsights([
      {
        id: Date.now().toString(),
        title,
        content: insights,
        date: new Date().toLocaleDateString()
      },
      ...savedInsights
    ]);
  };

  const handleDeleteInsight = (id: string) => {
    if (window.confirm('Apagar relatório?')) {
      setSavedInsights(savedInsights.filter(i => i.id !== id));
    }
  };

  const calculateAdvancedROI = () => {
    const c = parseFloat(cost);
    const r = parseFloat(revenue);
    const t = parseFloat(taxRate) / 100;
    const p = parseFloat(platformFee) / 100;

    if (!Number.isFinite(c) || !Number.isFinite(r) || c <= 0 || r < 0) return;

    const taxesValue = r * t;
    const feesValue = r * p;
    const netRevenue = r - taxesValue - feesValue;
    const netProfit = netRevenue - c;
    const roi = (netProfit / c) * 100;
    const roas = r / c;
    const margin = r > 0 ? (netProfit / r) * 100 : 0;
    const breakEvenRevenue = c / (1 - t - p);

    setRoiData({
      roi,
      netProfit,
      roas,
      netRevenue,
      taxesValue,
      feesValue,
      margin,
      breakEvenRevenue
    });

    localStorage.setItem('@RGP:ultimo_roi', (roi / 100).toString());
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl">
          <p className="text-[11px] text-slate-500 font-bold uppercase">Receita Total</p>
          <p className="text-2xl font-mono text-emerald-400 mt-1">
            {formatCurrency(dashboardStats.totalRevenue)}
          </p>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl">
          <p className="text-[11px] text-slate-500 font-bold uppercase">Despesas Totais</p>
          <p className="text-2xl font-mono text-red-400 mt-1">
            {formatCurrency(dashboardStats.totalSpend)}
          </p>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl">
          <p className="text-[11px] text-slate-500 font-bold uppercase">Lucro Acumulado</p>
          <p
            className={`text-2xl font-mono mt-1 ${
              dashboardStats.totalProfit >= 0 ? 'text-cyan-400' : 'text-red-400'
            }`}
          >
            {formatCurrency(dashboardStats.totalProfit)}
          </p>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl">
          <p className="text-[11px] text-slate-500 font-bold uppercase">Margem</p>
          <p
            className={`text-2xl font-mono mt-1 ${
              dashboardStats.margin >= 20 ? 'text-emerald-400' : 'text-yellow-400'
            }`}
          >
            {dashboardStats.margin.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        <div className="lg:col-span-2 space-y-6">
          {/* GRÁFICO */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold text-lg text-white">Eficiência Financeira</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Compare receita e despesa por período e gere análises da Sofia.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <input
                  placeholder="Período"
                  className="w-24 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
                  value={newData.month}
                  onChange={e => setNewData({ ...newData, month: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Receita"
                  className="w-24 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
                  value={newData.rev}
                  onChange={e => setNewData({ ...newData, rev: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Despesa"
                  className="w-24 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
                  value={newData.spend}
                  onChange={e => setNewData({ ...newData, spend: e.target.value })}
                />
                <button
                  onClick={handleAddDataPoint}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 rounded text-xs font-bold"
                >
                  + Adicionar
                </button>
                <button
                  onClick={handleLoadExampleData}
                  className="border border-slate-700 hover:border-blue-500 text-slate-300 px-3 rounded text-xs font-bold"
                >
                  Exemplo
                </button>
                {chartData.length > 0 && (
                  <button
                    onClick={handleClearData}
                    className="text-red-400 border border-red-500/20 hover:bg-red-500/10 px-3 rounded text-xs font-bold"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            <div className="h-[320px] bg-slate-950/30 rounded-lg border border-slate-800 relative overflow-hidden">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Receita"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorRev)"
                      strokeWidth={3}
                    />
                    <Area
                      type="monotone"
                      dataKey="spend"
                      name="Despesa"
                      stroke="#f43f5e"
                      fillOpacity={1}
                      fill="url(#colorSpend)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 px-6 text-center">
                  <i className="fas fa-chart-line text-4xl mb-3 opacity-50"></i>
                  <p className="text-sm text-slate-400 font-semibold mb-1">
                    Nenhum dado financeiro cadastrado
                  </p>
                  <p className="text-xs mb-4">
                    Adicione receita e despesa por período ou carregue um exemplo para testar a Sofia.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleLoadExampleData}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold"
                    >
                      Carregar Exemplo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {chartData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Pontos</p>
                  <p className="text-sm font-bold text-white mt-1">{dashboardStats.dataPoints}</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-500">
                    Tendência Receita
                  </p>
                  <p
                    className={`text-sm font-bold mt-1 ${
                      dashboardStats.revenueTrend >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {dashboardStats.revenueTrend >= 0 ? '+' : ''}
                    {dashboardStats.revenueTrend.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-500">
                    Tendência Despesa
                  </p>
                  <p
                    className={`text-sm font-bold mt-1 ${
                      dashboardStats.spendTrend <= 0 ? 'text-emerald-400' : 'text-yellow-400'
                    }`}
                  >
                    {dashboardStats.spendTrend >= 0 ? '+' : ''}
                    {dashboardStats.spendTrend.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={customQuestion}
                onChange={e => setCustomQuestion(e.target.value)}
                placeholder="Ex.: Onde estou perdendo margem? O custo está saudável?"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none transition-all"
              />
              <button
                onClick={getAIInsights}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-xs text-white"
              >
                <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                {isLoading ? 'PROCESSANDO...' : 'ANALISAR'}
              </button>
            </div>
          </div>

          {/* INSIGHT ATUAL */}
          {insights && (
            <div className="bg-blue-900/10 border border-blue-500/20 p-5 rounded-xl text-left relative group">
              <div className="flex justify-between mb-3 border-b border-blue-500/10 pb-2">
                <div className="text-xs text-blue-400 font-bold uppercase tracking-wider">
                  <i className="fas fa-brain mr-1"></i> Insight da Sofia
                </div>
                <button
                  onClick={handleSaveInsight}
                  className="text-[10px] text-slate-400 hover:text-white uppercase font-bold"
                >
                  <i className="fas fa-save mr-1"></i> Salvar Relatório
                </button>
              </div>

              <div className="text-slate-300 text-sm leading-relaxed prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{insights}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6 text-left">
          {/* BIBLIOTECA */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-3 tracking-widest flex items-center gap-2">
              <i className="fas fa-history"></i> Biblioteca de Insights
            </h4>

            <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
              {savedInsights.length === 0 ? (
                <p className="text-[10px] text-slate-600 italic text-center py-4">
                  Nenhum insight salvo ainda.
                </p>
              ) : (
                savedInsights.map(item => (
                  <div
                    key={item.id}
                    className="group p-2 rounded bg-slate-950 border border-slate-800 hover:border-blue-500/40 flex justify-between items-center transition-all"
                  >
                    <div onClick={() => setInsights(item.content)} className="cursor-pointer flex-1">
                      <p className="text-[10px] font-bold text-slate-300 truncate">{item.title}</p>
                      <span className="text-[9px] text-slate-600">{item.date}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteInsight(item.id)}
                      className="text-slate-700 hover:text-red-500 p-1"
                    >
                      <i className="fas fa-times text-[10px]"></i>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ROI */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-2xl">
            <h3 className="font-bold text-lg mb-4 text-white">Calculadora de ROI</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Imposto (%)
                  </label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={e => setTaxRate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Taxas (%)
                  </label>
                  <input
                    type="number"
                    value={platformFee}
                    onChange={e => setPlatformFee(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Investimento (R$)
                </label>
                <input
                  type="number"
                  value={cost}
                  onChange={e => setCost(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Receita Bruta (R$)
                </label>
                <input
                  type="number"
                  value={revenue}
                  onChange={e => setRevenue(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
                />
              </div>

              <button
                onClick={calculateAdvancedROI}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
              >
                CALCULAR RESULTADO
              </button>

              {roiData && (
                <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 animate-in slide-in-from-top-2 duration-300 space-y-4">
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                      Lucro Líquido
                    </div>
                    <div
                      className={`text-2xl font-black ${
                        roiData.netProfit > 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {formatCurrency(roiData.netProfit)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="border border-slate-800 rounded-lg p-3">
                      <div className="text-[9px] text-slate-500 font-bold uppercase">ROI</div>
                      <div
                        className={`font-bold mt-1 ${
                          roiData.roi >= 100
                            ? 'text-emerald-500'
                            : roiData.roi > 0
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        }`}
                      >
                        {roiData.roi.toFixed(1)}%
                      </div>
                    </div>

                    <div className="border border-slate-800 rounded-lg p-3">
                      <div className="text-[9px] text-slate-500 font-bold uppercase">ROAS</div>
                      <div className="font-bold text-blue-400 mt-1">{roiData.roas.toFixed(2)}x</div>
                    </div>

                    <div className="border border-slate-800 rounded-lg p-3">
                      <div className="text-[9px] text-slate-500 font-bold uppercase">Receita Líquida</div>
                      <div className="font-bold text-cyan-400 mt-1">
                        {formatCurrency(roiData.netRevenue)}
                      </div>
                    </div>

                    <div className="border border-slate-800 rounded-lg p-3">
                      <div className="text-[9px] text-slate-500 font-bold uppercase">Margem</div>
                      <div className="font-bold text-white mt-1">{roiData.margin.toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Impostos</span>
                      <span>{formatCurrency(roiData.taxesValue)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Taxas</span>
                      <span>{formatCurrency(roiData.feesValue)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300 font-semibold">
                      <span>Ponto de equilíbrio de receita</span>
                      <span>{formatCurrency(roiData.breakEvenRevenue)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SofiaModule;
