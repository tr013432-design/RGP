import React, { useState, useEffect, useMemo } from 'react';

interface CommandTask {
  id: number;
  text: string;
  completed: boolean;
  priority: 'alta' | 'media' | 'baixa';
  owner: 'geral' | 'sofia' | 'brenner' | 'dante' | 'rubens';
  createdAt: string;
}

interface Focus {
  id: string;
  title: string;
  color: string;
}

type TaskFilter = 'todas' | 'abertas' | 'concluidas';

const DEFAULT_FOCOS: Focus[] = [
  { id: 'f1', title: 'Prospecção Ativa', color: 'border-l-cyan-500 text-cyan-500' },
  { id: 'f2', title: 'Análise de ROI', color: 'border-l-purple-500 text-purple-500' },
  { id: 'f3', title: 'Pix na Conta', color: 'border-l-emerald-500 text-emerald-500' }
];

const OWNER_META = {
  geral: {
    label: 'GERAL',
    badge: 'bg-slate-500/10 border border-slate-500/20 text-slate-300'
  },
  sofia: {
    label: 'SOFIA',
    badge: 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
  },
  brenner: {
    label: 'BRENNER',
    badge: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
  },
  dante: {
    label: 'DANTE',
    badge: 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
  },
  rubens: {
    label: 'RUBENS',
    badge: 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
  }
} as const;

const PRIORITY_META = {
  alta: {
    label: 'ALTA',
    badge: 'bg-red-500/10 border border-red-500/20 text-red-400'
  },
  media: {
    label: 'MÉDIA',
    badge: 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
  },
  baixa: {
    label: 'BAIXA',
    badge: 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
  }
} as const;

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<CommandTask[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('@RGP:tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [focos, setFocos] = useState<Focus[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_FOCOS;
    try {
      const saved = localStorage.getItem('@RGP:focos');
      return saved ? JSON.parse(saved) : DEFAULT_FOCOS;
    } catch {
      return DEFAULT_FOCOS;
    }
  });

  const [inputValue, setInputValue] = useState('');
  const [selectedOwner, setSelectedOwner] = useState<CommandTask['owner']>('geral');
  const [selectedPriority, setSelectedPriority] = useState<CommandTask['priority']>('media');
  const [filter, setFilter] = useState<TaskFilter>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    localStorage.setItem('@RGP:tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('@RGP:focos', JSON.stringify(focos));
  }, [focos]);

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const openCount = totalCount - completedCount;
  const highPriorityOpenCount = tasks.filter(t => !t.completed && t.priority === 'alta').length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const efficiencyLabel =
    progress >= 80
      ? 'Alta Performance'
      : progress >= 50
      ? 'Bom Ritmo'
      : progress > 0
      ? 'Atenção'
      : 'Sem Execução';

  const applyAiFocus = (perfil: 'sofia' | 'brenner' | 'dante' | 'rubens') => {
    const sugestoes = {
      sofia: ['Otimizar CPL de Anúncios', 'Auditoria de Fluxo CRM', 'Revisar Planilha ROI'],
      brenner: ['Cold Call: 20 Contatos', 'Follow-up de Propostas', 'Contorno de Objeções'],
      dante: ['Copy da Landing Page', 'Roteiro para VSL Nova', 'Gatilhos de E-mail Marketing'],
      rubens: ['Design de 3 Criativos', 'Ajustar Identidade Visual', 'Edição de Reels Jarvis']
    };

    const novasMetas = sugestoes[perfil];
    setFocos(prev => prev.map((f, i) => ({ ...f, title: novasMetas[i] })));
  };

  const addTask = () => {
    if (!inputValue.trim()) return;

    const newTask: CommandTask = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false,
      priority: selectedPriority,
      owner: selectedOwner,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);
    setInputValue('');
    setSelectedOwner('geral');
    setSelectedPriority('media');
  };

  const toggleTask = (id: number) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: number) => {
    if (window.confirm('Excluir esta tarefa?')) {
      setTasks(prev => prev.filter(task => task.id !== id));
    }
  };

  const startEditingTask = (task: CommandTask) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const saveEditingTask = () => {
    if (!editingText.trim() || editingTaskId === null) return;

    setTasks(prev =>
      prev.map(task =>
        task.id === editingTaskId ? { ...task, text: editingText.trim() } : task
      )
    );

    setEditingTaskId(null);
    setEditingText('');
  };

  const cancelEditingTask = () => {
    setEditingTaskId(null);
    setEditingText('');
  };

  const updateFocus = (id: string, newTitle: string) => {
    setFocos(prev => prev.map(f => (f.id === id ? { ...f, title: newTitle } : f)));
  };

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (filter === 'abertas') {
      result = result.filter(task => !task.completed);
    }

    if (filter === 'concluidas') {
      result = result.filter(task => task.completed);
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        task =>
          task.text.toLowerCase().includes(search) ||
          OWNER_META[task.owner].label.toLowerCase().includes(search) ||
          PRIORITY_META[task.priority].label.toLowerCase().includes(search)
      );
    }

    result.sort((a, b) => {
      if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);

      const priorityWeight = { alta: 0, media: 1, baixa: 2 };
      if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
        return priorityWeight[a.priority] - priorityWeight[b.priority];
      }

      return b.createdAt.localeCompare(a.createdAt);
    });

    return result;
  }, [tasks, filter, searchTerm]);

  const clearCompleted = () => {
    setTasks(prev => prev.filter(task => !task.completed));
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-slate-950 text-slate-200 overflow-y-auto animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col xl:flex-row justify-between items-start gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-white mb-2">Painel de Comando RGP</h1>

          <div className="flex gap-2 mb-2 flex-wrap">
            <button
              onClick={() => applyAiFocus('sofia')}
              className="text-[9px] font-bold bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded hover:bg-blue-500/20 transition-all text-blue-400"
            >
              SOFIA
            </button>
            <button
              onClick={() => applyAiFocus('brenner')}
              className="text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded hover:bg-emerald-500/20 transition-all text-emerald-400"
            >
              BRENNER
            </button>
            <button
              onClick={() => applyAiFocus('dante')}
              className="text-[9px] font-bold bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded hover:bg-purple-500/20 transition-all text-purple-400"
            >
              DANTE
            </button>
            <button
              onClick={() => applyAiFocus('rubens')}
              className="text-[9px] font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded hover:bg-amber-500/20 transition-all text-amber-400"
            >
              RUBENS
            </button>
          </div>

          <p className="text-sm text-slate-500">Central de execução diária da RGP.</p>
        </div>

        {tasks.some(t => t.completed) && (
          <button
            onClick={clearCompleted}
            className="text-xs font-bold text-pink-500 hover:text-pink-400 bg-pink-500/10 px-3 py-2 rounded-lg border border-pink-500/20 transition-all"
          >
            <i className="fas fa-broom mr-2"></i> LIMPAR CONCLUÍDAS
          </button>
        )}
      </header>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{totalCount}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Abertas</p>
          <p className="text-2xl font-bold text-cyan-400">{openCount}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Concluídas</p>
          <p className="text-2xl font-bold text-emerald-400">{completedCount}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Alta Prioridade</p>
          <p className="text-2xl font-bold text-red-400">{highPriorityOpenCount}</p>
        </div>
      </div>

      {/* FOCOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {focos.map((foco, index) => (
          <div
            key={foco.id}
            className={`p-4 bg-slate-900 border border-slate-800 border-l-4 ${foco.color} rounded-xl shadow-lg transition-all hover:scale-[1.02]`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                FOCO 0{index + 1}
              </span>
              <i className="fas fa-bolt text-[9px] opacity-30"></i>
            </div>
            <input
              className="bg-transparent border-none focus:ring-0 w-full font-bold text-white p-0 text-sm outline-none"
              value={foco.title}
              onChange={(e) => updateFocus(foco.id, e.target.value)}
              spellCheck="false"
            />
          </div>
        ))}
      </div>

      {/* EFICIÊNCIA */}
      <div className="mb-8 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="text-xs font-bold text-slate-400 block">EFICIÊNCIA OPERACIONAL RGP</span>
            <span className="text-[10px] text-slate-500">{efficiencyLabel}</span>
          </div>
          <span className="text-xs font-mono text-cyan-400">{progress}%</span>
        </div>

        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* NOVA TAREFA */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px_180px_180px] gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="O que Brenner, Sofia, Dante ou Rubens fariam agora?"
            className="bg-slate-950 border border-slate-800 rounded-xl p-4 focus:outline-none focus:border-cyan-500 text-white placeholder:text-slate-600"
          />

          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value as CommandTask['owner'])}
            className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="geral">Responsável</option>
            <option value="sofia">Sofia</option>
            <option value="brenner">Brenner</option>
            <option value="dante">Dante</option>
            <option value="rubens">Rubens</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as CommandTask['priority'])}
            className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="alta">Prioridade Alta</option>
            <option value="media">Prioridade Média</option>
            <option value="baixa">Prioridade Baixa</option>
          </select>

          <button
            onClick={addTask}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            <i className="fas fa-plus"></i> ADICIONAR
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col xl:flex-row gap-3 justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('todas')}
            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
              filter === 'todas'
                ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            TODAS
          </button>
          <button
            onClick={() => setFilter('abertas')}
            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
              filter === 'abertas'
                ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            ABERTAS
          </button>
          <button
            onClick={() => setFilter('concluidas')}
            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
              filter === 'concluidas'
                ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            CONCLUÍDAS
          </button>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar tarefa..."
          className="w-full xl:w-80 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* LISTA */}
      <div className="space-y-3 pb-10">
        {filteredTasks.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center">
            <i className="fas fa-layer-group text-3xl text-slate-700 mb-3"></i>
            <p className="text-slate-500 text-sm">Nenhuma tarefa encontrada.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`p-4 rounded-xl border transition-all ${
                task.completed
                  ? 'bg-slate-900/30 border-slate-800/50 opacity-60'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-6 h-6 mt-0.5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                    task.completed
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-slate-600 hover:border-cyan-500'
                  }`}
                >
                  {task.completed && <i className="fas fa-check text-[10px] text-white"></i>}
                </button>

                <div className="flex-1 min-w-0">
                  {editingTaskId === task.id ? (
                    <div className="space-y-3">
                      <input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditingTask();
                          if (e.key === 'Escape') cancelEditingTask();
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                        autoFocus
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={saveEditingTask}
                          className="px-3 py-2 text-xs font-bold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={cancelEditingTask}
                          className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2 flex-wrap mb-2">
                        <span className={`text-[10px] px-2 py-1 rounded font-bold ${OWNER_META[task.owner].badge}`}>
                          {OWNER_META[task.owner].label}
                        </span>
                        <span className={`text-[10px] px-2 py-1 rounded font-bold ${PRIORITY_META[task.priority].badge}`}>
                          {PRIORITY_META[task.priority].label}
                        </span>
                      </div>

                      <p
                        className={`text-left font-medium break-words ${
                          task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {task.text}
                      </p>

                      <p className="text-[10px] text-slate-600 mt-2">
                        Criada em {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </>
                  )}
                </div>

                {editingTaskId !== task.id && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => startEditingTask(task)}
                      className="text-slate-500 hover:text-cyan-400 transition-colors"
                      title="Editar"
                    >
                      <i className="fas fa-pen text-xs"></i>
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-500 hover:text-red-500 transition-colors"
                      title="Excluir"
                    >
                      <i className="fas fa-trash text-xs"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tasks;
