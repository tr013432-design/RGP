import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

const SofiaModule: React.FC = () => {
  const [chartData, setChartData] = useState<FinanceData[]>(() => {
    const saved = localStorage.getItem('rgp_sofia_data');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [savedInsights, setSavedInsights] = useState<SavedInsight[]>(() => {
    const saved = localStorage.getItem('rgp_sofia_reports');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('rgp_sofia_data', JSON.stringify(chartData)); }, [chartData]);
  useEffect(() => { localStorage.setItem('rgp_sofia_reports', JSON.stringify(savedInsights)); }, [savedInsights]);

  const [newData, setNewData] = useState({ month: '', rev: '', spend: '' });
  const [cost, setCost] = useState('');
  const [revenue, setRevenue] = useState('');
  const [taxRate, setTaxRate] = useState('6');
  const [platformFee, setPlatformFee] = useState('10');
  const [roiData, setRoiData] = useState<{ roi: number; netProfit: number; roas: number } | null>(null);
  
  const [insights, setInsights] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');

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

  const handleSaveInsight = () => {
    if (!insights) return;
    const title = window.prompt("Nome do Relatório:", "Análise Financeira " + new Date().toLocaleDateString());
    if (!title) return;
    setSavedInsights([{ id: Date.now().toString(), title, content: insights, date: new Date().toLocaleDateString() }, ...savedInsights]);
  };

  const handleDeleteInsight = (id: string) => {
      if(window.confirm("Apagar relatório?")) setSavedInsights(savedInsights.filter(i => i.id !== id));
  };

  // --- FUNÇÃO DE CÁLCULO ATUALIZADA COM INTEGRAÇÃO ---
  const calculateAdvancedROI = () => {
    const c = parseFloat(cost); 
    const r = parseFloat(revenue);
    const t = parseFloat(taxRate) / 100; 
    const p = parseFloat(platformFee) / 100;

    if (c && r) {
      const netProfit = r - c - (r*t) - (r*p);
      const roiCalculado = (netProfit / c); // Valor decimal para facilitar
      
      setRoiData({ roi: roiCalculado * 100, netProfit, roas: r / c });

      // INTEGRAÇÃO: Salva no LocalStorage e avisa o módulo de Tarefas
      localStorage.setItem('@RGP:ultimo_roi', roiCalculado.toString());
      window.dispatchEvent(new Event('storage')); 
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
            <div className="flex justify-between items-center mb-4 text-left">
              <h3 className="font-bold text-lg text-white">Eficiência Financeira</h3>
              <div className="flex gap-2">
                 <input placeholder="Mês" className="w-16 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white" value={newData.month} onChange={e => setNewData({...newData, month: e.target.value})} />
                 <input type="number" placeholder="Rec." className="w-20 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white" value={newData.rev} onChange={e => setNewData({...newData, rev: e.target.value})} />
                 <input type="number" placeholder="Gas." className="w-20 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white" value={newData.spend} onChange={e => setNewData({...newData, spend: e.target.value})} />
                 <button onClick={handleAddDataPoint} className="bg-blue-600 hover:bg-blue-500 text-white px-3 rounded text-xs font-bold">+</button>
                 {chartData.length > 0 && <button onClick={handleClearData} className="text-red-500 px-2 text-xs"><i className="fas fa-trash"></i></button>}
              </div>
            </div>

            <div className="h-[300px] bg-slate-950/30 rounded-lg border border-slate-800 relative overflow-hidden">
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
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                    <Area type="monotone" dataKey="spend" stroke="#f43f5e" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                  <i className="fas fa-chart-line text-4xl mb-2 opacity-50"></i>
                  <p className="text-xs">Alimente os dados para análise da Sofia</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
                <input 
                  type="text" 
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Peça uma análise estratégica dos dados acima..."
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

          {insights && (
            <div className="bg-blue-900/10 border border-blue-500/20 p-5 rounded-xl text-left relative group">
               <div className="flex justify-between mb-3 border-b border-blue-500/10 pb-2">
                   <div className="text-xs text-blue-400 font-bold uppercase tracking-wider"><i className="fas fa-brain mr-1"></i> Insight da Sofia</div>
                   <button onClick={handleSaveInsight} className="text-[10px] text-slate-400 hover:text-white uppercase font-bold"><i className="fas fa-save mr-1"></i> Salvar Relatório</button>
               </div>
               <div className="text-slate-300 text-sm leading-relaxed prose prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {insights}
                  </ReactMarkdown>
               </div>
            </div>
          )}
        </div>

        <div className="space-y-6 text-left">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-3 tracking-widest flex items-center gap-2">
                    <i className="fas fa-history"></i> Biblioteca de Insights
                </h4>
                <div className="space-y-2 overflow-y-auto max-h-[200px] pr-1">
                    {savedInsights.length === 0 ? (
                        <p className="text-[10px] text-slate-600 italic text-center py-4 text-left">Sem registros.</p>
                    ) : (
                        savedInsights.map((item) => (
                            <div key={item.id} className="group p-2 rounded bg-slate-950 border border-slate-800 hover:border-blue-500/40 flex justify-between items-center transition-all">
                                <div onClick={() => setInsights(item.content)} className="cursor-pointer flex-1">
                                    <p className="text-[10px] font-bold text-slate-300 truncate">{item.title}</p>
                                    <span className="text-[9px] text-slate-600">{item.date}</span>
                                </div>
                                <button onClick={() => handleDeleteInsight(item.id)} className="text-slate-700 hover:text-red-500 p-1">
                                    <i className="fas fa-times text-[10px]"></i>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-2xl">
              <h3 className="font-bold text-lg mb-4 text-white">Calculadora de ROI</h3>
              <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Imposto (%)</label>
                        <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Taxas (%)</label>
                        <input type="number" value={platformFee} onChange={(e) => setPlatformFee(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white focus:border-blue-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Investimento (R$)</label>
                    <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Receita Bruta (R$)</label>
                    <input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none" />
                  </div>
                  <button onClick={calculateAdvancedROI} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-900/20 active:scale-95 transition-all">
                    CALCULAR RESULTADO
                  </button>
                  
                  {roiData && (
                    <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 animate-in slide-in-from-top-2 duration-300">
                        <div className="text-center mb-3">
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Lucro Líquido</div>
                          <div className={`text-2xl font-black ${roiData.netProfit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            R$ {roiData.netProfit.toLocaleString('pt-BR')}
                          </div>
                        </div>
                        <div className="flex justify-between border-t border-slate-800 pt-3">
                          <div className="text-center flex-1 border-r border-slate-800">
                              <div className="text-[9px] text-slate-500 font-bold uppercase">ROI</div>
                              <div className={`font-bold ${roiData.roi >= 100 ? 'text-emerald-500' : 'text-yellow-500'}`}>
                                {roiData.roi.toFixed(1)}%
                              </div>
                          </div>
                          <div className="text-center flex-1">
                              <div className="text-[9px] text-slate-500 font-bold uppercase">ROAS</div>
                              <div className="font-bold text-blue-400">{roiData.roas.toFixed(1)}x</div>
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
