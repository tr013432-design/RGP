import React, { useState } from 'react';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addTask = () => {
    if (!inputValue.trim()) return;
    const newTask: Task = {
      id: Date.now(),
      text: inputValue,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setInputValue('');
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="flex-1 p-8 bg-slate-950 text-slate-200 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Metas e Tarefas Diárias</h1>
        <p className="text-slate-400">Organize o crescimento da Rodrigues Growth Partners</p>
      </header>

      {/* Seção de Metas de Alto Impacto */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="p-4 bg-slate-900 border border-slate-800 border-l-4 border-l-cyan-500 rounded-xl shadow-lg">
          <span className="text-xs font-bold uppercase text-cyan-500">Meta 01</span>
          <p className="mt-1 font-semibold">Prospecção Ativa</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 border-l-4 border-l-purple-500 rounded-xl shadow-lg">
          <span className="text-xs font-bold uppercase text-purple-500">Meta 02</span>
          <p className="mt-1 font-semibold">Análise de ROI</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 border-l-4 border-l-emerald-500 rounded-xl shadow-lg">
          <span className="text-xs font-bold uppercase text-emerald-500">Meta 03</span>
          <p className="mt-1 font-semibold">Pix na Conta</p>
        </div>
      </section>

      {/* Input de Nova Tarefa */}
      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="O que precisa ser feito hoje?"
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-cyan-500 transition-colors"
        />
        <button 
          onClick={addTask}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 rounded-xl font-bold transition-all shadow-lg shadow-cyan-900/20"
        >
          Adicionar
        </button>
      </div>

      {/* Lista de Tarefas */}
      <div className="space-y-3">
        {tasks.map(task => (
          <div 
            key={task.id} 
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
              task.completed ? 'bg-slate-900/50 border-slate-800 opacity-60' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <input 
              type="checkbox" 
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
            />
            <span className={`flex-1 ${task.completed ? 'line-through' : ''}`}>
              {task.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
