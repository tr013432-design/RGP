import React, { useState, useEffect, useMemo } from 'react';

interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  time: string;
  type: 'reuniao' | 'entrega' | 'lembrete';
}

interface EventFormData {
  title: string;
  time: string;
  type: 'reuniao' | 'entrega' | 'lembrete';
}

const CalendarModule: React.FC = () => {
  const today = new Date();

  const formatDateKeyFromDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('rgp_calendar_events');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(formatDateKeyFromDate(today));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    time: '09:00',
    type: 'reuniao'
  });

  useEffect(() => {
    localStorage.setItem('rgp_calendar_events', JSON.stringify(events));
  }, [events]);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const formatDateKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const formatDateLabel = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(y, m - 1, d));
  };

  const formatLongDateLabel = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(y, m - 1, d));
  };

  const getEventTypeLabel = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'reuniao':
        return 'Reunião';
      case 'entrega':
        return 'Entrega';
      case 'lembrete':
        return 'Lembrete';
      default:
        return type;
    }
  };

  const getEventTypeClasses = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'reuniao':
        return 'border-blue-500/30 bg-blue-500/10 text-blue-300';
      case 'entrega':
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
      case 'lembrete':
        return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
      default:
        return 'border-slate-500/30 bg-slate-500/10 text-slate-300';
    }
  };

  const getEventBarColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'reuniao':
        return 'border-blue-500';
      case 'entrega':
        return 'border-emerald-500';
      case 'lembrete':
        return 'border-amber-500';
      default:
        return 'border-pink-500';
    }
  };

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleGoToToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(formatDateKeyFromDate(now));
  };

  const openNewEventModal = () => {
    if (!selectedDate) return;
    setEditingEventId(null);
    setFormData({
      title: '',
      time: '09:00',
      type: 'reuniao'
    });
    setIsModalOpen(true);
  };

  const openEditEventModal = (event: CalendarEvent) => {
    setEditingEventId(event.id);
    setFormData({
      title: event.title,
      time: event.time === 'Dia todo' ? '' : event.time,
      type: event.type
    });
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !formData.title.trim()) return;

    const normalizedTime = formData.time.trim() || 'Dia todo';

    if (editingEventId) {
      setEvents(prev =>
        prev.map(event =>
          event.id === editingEventId
            ? {
                ...event,
                date: selectedDate,
                title: formData.title.trim(),
                time: normalizedTime,
                type: formData.type
              }
            : event
        )
      );
    } else {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        date: selectedDate,
        title: formData.title.trim(),
        time: normalizedTime,
        type: formData.type
      };
      setEvents(prev => [...prev, newEvent]);
    }

    setIsModalOpen(false);
  };

  const deleteEvent = (id: string) => {
    if (window.confirm('Excluir este compromisso?')) {
      setEvents(prev => prev.filter(e => e.id !== id));
    }
  };

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];

    return events
      .filter(event => event.date === selectedDate)
      .sort((a, b) => {
        if (a.time === 'Dia todo') return -1;
        if (b.time === 'Dia todo') return 1;
        return a.time.localeCompare(b.time);
      });
  }, [events, selectedDate]);

  const upcomingEvents = useMemo(() => {
    const todayKey = formatDateKeyFromDate(new Date());

    return [...events]
      .filter(event => event.date >= todayKey)
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        if (a.time === 'Dia todo') return -1;
        if (b.time === 'Dia todo') return 1;
        return a.time.localeCompare(b.time);
      })
      .slice(0, 5);
  }, [events]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100vh-100px)]">
        {/* CALENDÁRIO */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <i className="fas fa-calendar-alt text-pink-500"></i>
                {monthNames[month]} {year}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {events.filter(e => e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length} compromissos neste mês
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <i className="fas fa-chevron-left"></i>
              </button>

              <button
                onClick={handleGoToToday}
                className="px-4 py-2 text-xs font-bold bg-pink-500/10 text-pink-400 rounded-lg hover:bg-pink-500 hover:text-white transition-all"
              >
                Hoje
              </button>

              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2 text-center">
            {weekDays.map(day => (
              <div key={day} className="text-xs font-bold text-slate-500 uppercase py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 grid-rows-6 gap-2 flex-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateKey = formatDateKey(day);
              const dayEvents = events.filter(e => e.date === dateKey);
              const isToday =
                formatDateKeyFromDate(new Date()) === dateKey;
              const isSelected = selectedDate === dateKey;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(dateKey)}
                  className={`
                    relative border rounded-lg p-2 cursor-pointer transition-all flex flex-col gap-1 overflow-hidden group min-h-[88px]
                    ${isSelected ? 'border-pink-500 bg-pink-500/5 shadow-lg shadow-pink-900/10' : 'border-slate-800 bg-slate-950/50 hover:border-slate-600'}
                    ${isToday ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${
                      isSelected ? 'text-pink-400' : isToday ? 'text-blue-400' : 'text-slate-400'
                    }`}>
                      {day}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 mt-auto">
                    {dayEvents.slice(0, 2).map(ev => (
                      <div
                        key={ev.id}
                        className={`text-[9px] truncate bg-slate-800 text-slate-300 rounded px-1 py-0.5 border-l-2 ${getEventBarColor(ev.type)}`}
                      >
                        {ev.time} {ev.title}
                      </div>
                    ))}

                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-slate-500 text-center">
                        +{dayEvents.length - 2} mais
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PAINEL LATERAL */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col shadow-lg">
          <h3 className="font-bold text-lg text-white mb-4 border-b border-slate-800 pb-4">
            {selectedDate ? (
              <>
                Agenda de <span className="text-pink-400">{formatDateLabel(selectedDate)}</span>
              </>
            ) : (
              'Selecione um dia'
            )}
          </h3>

          {selectedDate && (
            <div className="mb-4 bg-slate-950 border border-slate-800 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Data selecionada</p>
              <p className="text-sm text-white capitalize">{formatLongDateLabel(selectedDate)}</p>
              <p className="text-xs text-slate-400 mt-2">
                {selectedDayEvents.length} compromisso{selectedDayEvents.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
            {selectedDate ? (
              selectedDayEvents.length > 0 ? (
                selectedDayEvents.map(ev => (
                  <div
                    key={ev.id}
                    className="bg-slate-950 p-4 rounded-lg border border-slate-800 hover:border-pink-500/50 transition-all"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="text-xs font-bold text-pink-400">
                            {ev.time}
                          </span>
                          <span className={`text-[10px] px-2 py-1 rounded border font-bold ${getEventTypeClasses(ev.type)}`}>
                            {getEventTypeLabel(ev.type)}
                          </span>
                        </div>

                        <p className="text-sm text-slate-200 font-medium">
                          {ev.title}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditEventModal(ev)}
                          className="text-slate-500 hover:text-blue-400 transition-colors"
                          title="Editar"
                        >
                          <i className="fas fa-pen text-xs"></i>
                        </button>

                        <button
                          onClick={() => deleteEvent(ev.id)}
                          className="text-slate-500 hover:text-red-500 transition-colors"
                          title="Excluir"
                        >
                          <i className="fas fa-trash text-xs"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 opacity-60">
                  <i className="fas fa-mug-hot text-4xl mb-3 text-slate-600"></i>
                  <p className="text-sm text-slate-500">Dia livre!</p>
                </div>
              )
            ) : (
              <p className="text-sm text-slate-500 italic">
                Clique em um dia no calendário para ver ou adicionar compromissos.
              </p>
            )}

            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">
                Próximos compromissos
              </h4>

              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-slate-600 italic">Nenhum compromisso futuro.</p>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map(item => (
                    <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                      <p className="text-[10px] text-slate-500 mb-1">
                        {formatDateLabel(item.date)} • {item.time}
                      </p>
                      <p className="text-xs text-slate-200 font-medium line-clamp-1">
                        {item.title}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={openNewEventModal}
            disabled={!selectedDate}
            className="mt-4 w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-900/20"
          >
            <i className="fas fa-plus"></i> Novo Compromisso
          </button>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingEventId ? 'Editar compromisso' : 'Novo compromisso'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {formatLongDateLabel(selectedDate)}
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Título
                </label>
                <input
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Reunião com cliente, entrega de proposta..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-pink-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-pink-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-600 mt-1">
                    Deixe vazio para “Dia todo”.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Tipo
                  </label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as CalendarEvent['type'] })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-pink-500 outline-none"
                  >
                    <option value="reuniao">Reunião</option>
                    <option value="entrega">Entrega</option>
                    <option value="lembrete">Lembrete</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-lg border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-all"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 rounded-lg bg-pink-600 text-white font-bold hover:bg-pink-500 transition-all"
                >
                  {editingEventId ? 'Salvar alterações' : 'Criar compromisso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarModule;
