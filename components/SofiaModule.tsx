import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { analyzeFinanceData } from '../services/aiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 1. Interfaces para Salvamento
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

const SofiaModule: React.FC = () => {
  // --- ESTADOS COM LOCAL STORAGE ---
  
  // A. Dados do Gráfico
  const [chartData, setChartData] = useState<FinanceData[]>(() => {
    const saved = localStorage.getItem('rgp_sofia_data');
    return saved ? JSON.parse(saved) : []; // Começa vazio ou carrega salvo
  });
  
  // B. Relatórios Salvos
  const [savedInsights, setSavedInsights] = useState<SavedInsight[]>(() => {
    const saved = localStorage.getItem('rgp_sofia_reports');
    return saved ? JSON.parse(saved) : [];
  });

  // Salvamento Automático
  useEffect(() => { localStorage.setItem('rgp_sofia_data', JSON.stringify(chartData)); }, [chartData]);
  useEffect(() => { localStorage.setItem('rgp_sofia_reports', JSON.stringify(savedInsights)); }, [savedInsights]);

  // Estados de Input (Gráfico e Calculadora)
  const [newData, setNewData] = useState({ month: '', rev: '', spend: '' });
  const [cost, setCost] = useState('');
  const [revenue, setRevenue] = useState('');
  const [taxRate, setTaxRate] = useState('6');
  const [platformFee, setPlatformFee] = useState('10');
  const [roiData, setRoiData] = useState<{ roi: number; netProfit: number; roas: number } | null>(null);
  
  // Estados da IA
  const [insights, setInsights] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');

  const FIXED_COSTS = 15000;

  // Função: Adicionar Mês ao Gráfico
  const handleAddDataPoint = () => {
    if (!newData.month || !newData.rev || !newData.spend) return;
    const newPoint: FinanceData = {
        name: newData.month,
        revenue: Number(newData.rev),
        spend: Number(newData.spend)
    };
    setChartData([...chartData, newPoint]);
    setNewData({ month: '', rev: '', spend: '' });
  };

  // Função: Limpar Gráfico
  const handleClearData = () => {
    if(window.confirm("Apagar todo o histórico financeiro?")) setChartData([]);
  };

  const getAIInsights = async () => {
    setIsLoading(true);
    try {
      const dataContext = chartData.length > 0 ? JSON.stringify(chartData) : "Sem dados históricos.";
      const finalPrompt = `${customQuestion ? `PERGUNTA: "${customQuestion}"` : ''}\n\nDADOS:\n${dataContext}`;
      const result = await analyzeFinanceData(finalPrompt);
      setInsights(result || '');
    } catch (error) {
      setInsights('Erro ao processar análise.');
    } finally {
      setIsLoading(false);
    }
  };

  // Funções de Biblioteca (Salvar/Excluir Insight)
  const handleSaveInsight = () => {
    if (!insights) return;
    const title = window.prompt("Nome do Relatório:", "Análise Financeira " + new Date().toLocaleDateString());
    if (!title) return;
    setSavedInsights([{ id: Date.now().toString(), title, content: insights, date: new Date().toLocaleDateString() }, ...savedInsights]);
    alert("Relatório salvo!");
  };

  const handleDeleteInsight = (id: string) => {
      if(window.confirm("Apagar relatório?")) setSavedInsights(savedInsights.filter(i => i.id !== id));
  };

  const calculateAdvancedROI = () => {
    const c = parseFloat(cost); const r = parseFloat(revenue);
    const t = parseFloat(taxRate) / 100; const p = parseFloat(platformFee) / 100;
    if (c && r) {
      const netProfit = r - c - (r*t) - (r*p);
      setRoiData({ roi: (netProfit / c) * 100, netProfit, roas: r / c });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA PRINCIPAL: GRÁFICO + IA */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SEÇÃO DO GRÁFICO + INPUT DE DADOS */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-white">Eficiência Financeira</h3>
              <div className="flex gap-2">
                 {/* Inputs Rápidos para preencher o gráfico */}
                 <input placeholder="Mês (Ex: Jul)" className="w-20 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white" value={newData.month} onChange={e => setNewData({...newData, month: e.target.value})} />
                 <input type="number" placeholder="Receita" className="w-20 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white" value={newData.rev} onChange={e => setNewData({...newData, rev: e.target.value})} />
                 <input type="number" placeholder="Gastos" className="w-20 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white" value={newData.spend} onChange={e => setNewData({...newData, spend: e.target.value})} />
                 <button onClick={handleAddDataPoint} className="bg-blue-600 hover:bg-blue-500 text-white px-3 rounded text-xs font-bold">+</button>
                 {chartData.length > 0 && <button onClick={handleClearData} className="text-red-500 px-2 text-xs"><i className="fas fa-trash"></i></button>}
              </div>
            </div>

            <div className="h-[300px] bg-slate-950/30 rounded-lg border border-slate-800 border-dashed relative">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
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
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                    <Area type="monotone" dataKey="spend" stroke="#f43f5e" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                  <i className="fas fa-chart-line text-4xl mb-2 opacity-50"></i>
                  <p className="text-xs">Adicione dados acima para ver o gráfico</p>
                </div>
              )}
            </div>
            
            {/* AREA DE PERGUNTA IA */}
            <div className="mt-4 flex gap-2">
                <input 
                  type="text" 
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Ex: Por que meu ROI caiu? O que fazer para melhorar?"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                />
                <button 
                  onClick={getAIInsights} 
                  disabled={isLoading} 
                  className="text-xs bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-white whitespace-nowrap"
                >
                  <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                  {isLoading ? 'ANALISANDO...' : 'PEDIR ANÁLISE'}
                </button>
            </div>
          </div>

          {/* INSIGHTS RESULTADO */}
          {insights && (
            <div className="bg-blue-900/10 border border-blue-500/20 p-5 rounded-xl relative group hover:border-blue-500/40 transition-all">
               <div className="flex justify-between mb-2">
                   <div className="text-xs text-blue-400 font-bold uppercase"><i className="fas fa-bolt mr-1"></i> Análise Sofia</div>
                   <button onClick={handleSaveInsight} className="text-xs text-slate-400 hover:text-white"><i className="fas fa-save mr-1"></i> Salvar</button>
               </div>
               <div className="text-slate-300 text-sm leading-relaxed">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      strong: ({node, ...props}) => <strong className="font-bold text-emerald-400" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
                    }}
                  >
                    {insights}
                  </ReactMarkdown>
               </div>
            </div>
          )}
        </div>

        {/* COLUNA LATERAL: CALCULADORA + HISTÓRICO */}
        <div className="space-y-6">
            {/* HISTÓRICO DE RELATÓRIOS (NOVO) */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col max-h-[300px]">
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 flex items-center gap-2">
                    <i className="fas fa-history"></i> Relatórios Salvos
                </h4>
                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                    {savedInsights.length === 0 ? (
                        <p className="text-xs text-slate-600 italic text-center mt-4">Nenhum relatório salvo.</p>
                    ) : (
                        savedInsights.map((item) => (
                            <div key={item.id} className="group p-3 rounded-lg bg-slate-950/50 border border-slate-800 hover:border-blue-500/30 transition-all flex justify-between">
                                <div onClick={() => setInsights(item.content)} className="cursor-pointer flex-1">
                                    <p className="text-xs font-bold text-slate-300 group-hover:text-blue-400 truncate">{item.title}</p>
                                    <span className="text-[10px] text-slate-600">{item.date}</span>
                                </div>
                                <button onClick={() => handleDeleteInsight(item.id)} className="text-slate-600 hover:text-red-500 ml-2">
                                    <i className="fas fa-trash-alt text-xs"></i>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* CALCULADORA ROI */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col shadow-lg">
            <h3 className="font-bold text-lg mb-4 text-white">Calculadora ROI</h3>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Imposto (%)</label>
                    <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Taxas (%)</label>
                    <input type="number" value={platformFee} onChange={(e) => setPlatformFee(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
                </div>
                </div>
                <div>
                <label className="block text-xs text-slate-400 mb-1">Investimento (R$)</label>
                <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white" />
                </div>
                <div>
                <label className="block text-xs text-slate-400 mb-1">Receita Bruta (R$)</label>
                <input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white" />
                </div>
                <button onClick={calculateAdvancedROI} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs shadow-lg shadow-blue-900/20">
                CALCULAR
                </button>
                
                {roiData && (
                <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-center mb-3">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Lucro Líquido</div>
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
    </div>
  );
};

export default SofiaModule;
