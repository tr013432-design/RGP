import React, { useState, useEffect } from 'react';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

const Tasks: React.FC = () => {
  // Carrega as tarefas do LocalStorage ao iniciar
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('@RGP:tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  
  const [inputValue, setInputValue] = useState('');

  // Guarda as tarefas sempre que houver uma mudança
  useEffect(() => {
    localStorage.setItem('@RGP:tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!inputValue.trim()) return;
    const newTask: Task = { id: Date.now(), text: inputValue, completed: false };
    setTasks([...tasks, newTask]);
    setInputValue('');
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Função para remover apenas as tarefas feitas
  const clearCompleted = () => {
    setTasks(tasks.filter(t => !t.completed));
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-slate-950 text-slate-200 overflow-y-auto animate-in fade-in duration-500">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Metas RGP</h1>
          <p className="text-slate-400 font-medium italic text-left">"O que não é medido, não é gerido."</p>
        </div>
        
        {tasks.some(t => t.completed) && (
          <button 
            onClick={clearCompleted}
            className="text-xs font-bold text-pink-500 hover:text-pink-400 transition-colors flex items-center gap-2 bg-pink-500/10 px-3 py-2 rounded-lg border border-pink-500/20"
          >
            <i className="fas fa-broom"></i>
            LIMPAR CONCLUÍDAS
          </button>
        )}
      </header>

      {/* Cards de Metas de Alto Impacto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="p-4 bg-slate-900 border border-slate-800 border-l-4 border-l-cyan-500 rounded-xl shadow-lg shadow-cyan-900/5">
          <span className="text-[10px] font-bold uppercase text-cyan-500 tracking-widest">Foco 01</span>
          <p className="mt-1 font-bold text-white">Prospecção Ativa</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 border-l-4 border-l-purple-500 rounded-xl shadow-lg shadow-purple-900/5">
          <span className="text-[10px] font-bold uppercase text-purple-500 tracking-widest">Foco 02</span>
          <p className="mt-1 font-bold text-white">Análise de ROI</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 border-l-4 border-l-emerald-500 rounded-xl shadow-lg shadow-emerald-900/5">
          <span className="text-[10px] font-bold uppercase text-emerald-500 tracking-widest">Foco 03</span>
          <p className="mt-1 font-bold text-white">Pix na Conta</p>
        </div>
      </div>

      {/* Input de Nova Tarefa */}
      <div className="flex gap-3 mb-8">
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          placeholder="Digite a próxima ação estratégica..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-white shadow-inner"
        />
        <button 
          onClick={addTask}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 rounded-xl font-bold transition-all shadow-lg shadow-cyan-900/20 active:scale-95 flex items-center gap-2"
        >
          <i className="fas fa-plus text-xs"></i>
          ADICIONAR
        </button>
      </div>

      {/* Lista de Tarefas */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl">
             <i className="fas fa-clipboard-list text-slate-700 text-4xl mb-4"></i>
             <p className="text-slate-500 italic">Nenhuma tarefa listada. Defina o seu próximo passo.</p>
          </div>
        ) : (
          tasks.map(task => (
            <div 
              key={task.id} 
              className={`group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                task.completed ? 'bg-slate-900/30 border-slate-800/50 opacity-50' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
              onClick={() => toggleTask(task.id)}
            >
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 group-hover:border-cyan-500'
              }`}>
                {task.completed && <i className="fas fa-check text-[10px] text-white"></i>}
              </div>
              <span className={`flex-1 font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                {task.text}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tasks;
