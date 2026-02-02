import React, { useState, useEffect } from 'react';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

interface Focus {
  id: string;
  title: string;
  color: string;
}

const Tasks: React.FC = () => {
  // Estado para as Tarefas
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('@RGP:tasks');
    return saved ? JSON.parse(saved) : [];
  });

  // Estado para os 3 Focos Editáveis
  const [focos, setFocos] = useState<Focus[]>(() => {
    const saved = localStorage.getItem('@RGP:focos');
    return saved ? JSON.parse(saved) : [
      { id: 'f1', title: 'Prospecção Ativa', color: 'border-l-cyan-500 text-cyan-500' },
      { id: 'f2', title: 'Análise de ROI', color: 'border-l-purple-500 text-purple-500' },
      { id: 'f3', title: 'Pix na Conta', color: 'border-l-emerald-500 text-emerald-500' }
    ];
  });

  const [inputValue, setInputValue] = useState('');

  // Salvar sempre que houver mudança
  useEffect(() => {
    localStorage.setItem('@RGP:tasks', JSON.stringify(tasks));
    localStorage.setItem('@RGP:focos', JSON.stringify(focos));
  }, [tasks, focos]);

  const addTask = () => {
    if (!inputValue.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: inputValue, completed: false }]);
    setInputValue('');
  };

  const updateFocus = (id: string, newTitle: string) => {
    setFocos(focos.map(f => f.id === id ? { ...f, title: newTitle } : f));
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-slate-950 text-slate-200 overflow-y-auto animate-in fade-in duration-500">
      <header className="mb-8 flex justify-between items-start">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-white mb-2 text-left">Metas RGP</h1>
          <p className="text-slate-400 font-medium italic">"O que não é medido, não é gerido."</p>
        </div>
        
        {tasks.some(t => t.completed) && (
          <button onClick={() => setTasks(tasks.filter(t => !t.completed))} className="text-xs font-bold text-pink-500 hover:text-pink-400 bg-pink-500/10 px-3 py-2 rounded-lg border border-pink-500/20 transition-all">
            <i className="fas fa-broom mr-2"></i> LIMPAR CONCLUÍDAS
          </button>
        )}
      </header>

      {/* Grid de Focos Editáveis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {focos.map((foco, index) => (
          <div key={foco.id} className={`p-4 bg-slate-900 border border-slate-800 border-l-4 ${foco.color} rounded-xl shadow-lg`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">FOCO 0{index + 1}</span>
              <i className="fas fa-pen text-[9px] opacity-30"></i>
            </div>
            <input 
              className="bg-transparent border-none focus:ring-0 w-full font-bold text-white p-0"
              value={foco.title}
              onChange={(e) => updateFocus(foco.id, e.target.value)}
              spellCheck="false"
            />
          </div>
        ))}
      </div>

      {/* Input de Tarefas */}
      <div className="flex gap-3 mb-8">
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          placeholder="Digite a próxima ação estratégica..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 focus:outline-none focus:border-cyan-500 text-white"
        />
        <button onClick={addTask} className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 rounded-xl font-bold flex items-center gap-2">
          <i className="fas fa-plus"></i> ADICIONAR
        </button>
      </div>

      {/* Lista de Tarefas */}
      <div className="space-y-3">
        {tasks.map(task => (
          <div 
            key={task.id} 
            onClick={() => setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${task.completed ? 'bg-slate-900/30 border-slate-800/50 opacity-50' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
          >
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
              {task.completed && <i className="fas fa-check text-[10px] text-white"></i>}
            </div>
            <span className={`flex-1 text-left font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
