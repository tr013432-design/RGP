import React, { useState, useEffect } from 'react';

interface Event {
  id: string;
  date: string; // Formato YYYY-MM-DD
  title: string;
  time: string;
  type: 'reuniao' | 'entrega' | 'lembrete';
}

const CalendarModule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rgp_calendar_events');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('rgp_calendar_events', JSON.stringify(events));
  }, [events]);

  // Funções de Data
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleAddEvent = () => {
    if (!selectedDate) return;
    const title = window.prompt("Nome do Compromisso:");
    if (!title) return;
    const time = window.prompt("Horário (ex: 14:00):", "09:00") || "Dia todo";

    const newEvent: Event = {
      id: Date.now().toString(),
      date: selectedDate,
      title,
      time,
      type: 'reuniao'
    };

    setEvents([...events, newEvent]);
  };

  const deleteEvent = (id: string) => {
    if (window.confirm("Excluir este compromisso?")) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  const formatDateKey = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
      {/* CALENDÁRIO (LADO ESQUERDO) */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col">
        {/* Cabeçalho do Mês */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <i className="fas fa-calendar-alt text-pink-500"></i> {monthNames[month]} {year}
          </h2>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><i className="fas fa-chevron-left"></i></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-xs font-bold bg-pink-500/10 text-pink-400 rounded-lg hover:bg-pink-500 hover:text-white transition-all">Hoje</button>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><i className="fas fa-chevron-right"></i></button>
          </div>
        </div>

        {/* Grid de Dias */}
        <div className="grid grid-cols-7 mb-2 text-center">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-xs font-bold text-slate-500 uppercase py-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 grid-rows-6 gap-2 flex-1">
          {/* Espaços vazios antes do dia 1 */}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          
          {/* Dias do Mês */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateKey = formatDateKey(day);
            const dayEvents = events.filter(e => e.date === dateKey);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            const isSelected = selectedDate === dateKey;

            return (
              <div 
                key={day} 
                onClick={() => setSelectedDate(dateKey)}
                className={`
                  relative border rounded-lg p-2 cursor-pointer transition-all flex flex-col gap-1 overflow-hidden group
                  ${isSelected ? 'border-pink-500 bg-pink-500/5' : 'border-slate-800 bg-slate-950/50 hover:border-slate-600'}
                  ${isToday ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900' : ''}
                `}
              >
                <span className={`text-sm font-bold ${isToday ? 'text-blue-400' : 'text-slate-400'} ${isSelected ? 'text-pink-400' : ''}`}>{day}</span>
                
                {/* Bolinhas dos Eventos */}
                <div className="flex flex-col gap-1 mt-auto">
                  {dayEvents.slice(0, 3).map(ev => (
                    <div key={ev.id} className="text-[9px] truncate bg-slate-800 text-slate-300 rounded px-1 py-0.5 border-l-2 border-pink-500">
                      {ev.time} {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[9px] text-slate-500 text-center">+{dayEvents.length - 3} mais</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PAINEL LATERAL (DETALHES DO DIA) */}
      <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col shadow-lg">
        <h3 className="font-bold text-lg text-white mb-4 border-b border-slate-800 pb-4">
          {selectedDate ? (
            <>
              Agenda de <span className="text-pink-400">{selectedDate.split('-').reverse().join('/')}</span>
            </>
          ) : (
            "Selecione um dia"
          )}
        </h3>

        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
          {selectedDate ? (
            events.filter(e => e.date === selectedDate).length > 0 ? (
              events.filter(e => e.date === selectedDate).map(ev => (
                <div key={ev.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex justify-between items-start group hover:border-pink-500/50 transition-all">
                  <div>
                    <span className="text-xs font-bold text-pink-400 block mb-1">{ev.time}</span>
                    <p className="text-sm text-slate-200 font-medium">{ev.title}</p>
                  </div>
                  <button onClick={() => deleteEvent(ev.id)} className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fas fa-trash text-xs"></i>
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 opacity-50">
                <i className="fas fa-mug-hot text-4xl mb-3 text-slate-600"></i>
                <p className="text-sm text-slate-500">Dia livre!</p>
              </div>
            )
          ) : (
            <p className="text-sm text-slate-500 italic">Clique em um dia no calendário para ver ou adicionar compromissos.</p>
          )}
        </div>

        <button 
          onClick={handleAddEvent}
          disabled={!selectedDate}
          className="mt-4 w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-900/20"
        >
          <i className="fas fa-plus"></i> Novo Compromisso
        </button>
      </div>
    </div>
  );
};

export default CalendarModule;
