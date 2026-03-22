  import { useState } from 'react';
  import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
  import { TaskModal } from '../components/TaskModal';
  import { useData } from '../context/DataContext';

  export function Calendar() {
    const { tasks } = useData();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week'>('month');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
    const weekDays = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];

    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      
      // Dushanbadan boshlanishi uchun tuzatish
      let startingDayOfWeek = firstDay.getDay() - 1;
      if (startingDayOfWeek === -1) startingDayOfWeek = 6;
      
      const days = [];
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
      }
      return days;
    };

    const previousMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const goToToday = () => {
      setCurrentDate(new Date());
    };

    const days = getDaysInMonth(currentDate);
    const today = new Date();
    const isToday = (day: number | null) => {
      if (!day) return false;
      return day === today.getDate() && 
            currentDate.getMonth() === today.getMonth() && 
            currentDate.getFullYear() === today.getFullYear();
    };

    const tasksOnDate = (day: number | null) => {
      if (!day) return [];
      return tasks.filter(task => {
        const taskDate = new Date(task.date);
        return (
          taskDate.getDate() === day &&
          taskDate.getMonth() === currentDate.getMonth() &&
          taskDate.getFullYear() === currentDate.getFullYear()
        );
      });
    };

    const handleDayClick = (day: number | null) => {
      if (!day) return;
      const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      setSelectedDate(clickedDate);
      setIsTaskModalOpen(true);
    };

    return (
      <div className="p-2 md:p-8 pb-20 md:pb-8 h-full">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">Kalendar</h1>
            <p className="text-xs md:text-base text-gray-600 dark:text-gray-400">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors ${
                  view === 'month' ? 'bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Oylik
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors ${
                  view === 'week' ? 'bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Haftalik
              </button>
            </div>
            <button onClick={goToToday} className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg text-xs md:text-sm font-medium border border-gray-200 dark:border-gray-700">
              Bugun
            </button>
            <div className="flex items-center gap-1">
              <button onClick={previousMonth} className="p-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={nextMonth} className="p-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <button onClick={() => setIsTaskModalOpen(true)} className="ml-auto sm:ml-0 p-2 bg-blue-600 text-white rounded-lg"><Plus className="w-4 h-4" /></button>
          </div>
        </div>

        {view === 'month' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              {weekDays.map((dayName, idx) => (
                <div key={idx} className="p-2 md:p-4">
                  <p className="text-[10px] md:text-sm font-bold text-gray-500 dark:text-gray-400 text-center uppercase">{dayName[0] /* Mobilda faqat 1-harf */}<span className="hidden md:inline">{dayName.slice(1)}</span></p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((day, idx) => (
                <div
                  key={idx}
                  className={`min-h-[70px] md:min-h-[120px] border-r border-b border-gray-100 dark:border-gray-700 p-1 md:p-2 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!day ? 'bg-gray-50/30 dark:bg-gray-900/20' : ''}`}
                  onClick={() => handleDayClick(day)}
                >
                  {day && (
                    <div className="h-full flex flex-col items-center md:items-start">
                      <span className={`text-xs md:text-sm font-bold w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {day}
                      </span>
                      
                      {/* Responsive vazifalar: Mobilda nuqtalar, Desktopda matn */}
                      <div className="mt-1 w-full space-y-1">
                        {/* Desktop View */}
                        <div className="hidden md:block space-y-1">
                          {tasksOnDate(day).slice(0, 3).map((task) => (
                            <div key={task.id} className={`px-2 py-0.5 rounded text-[10px] truncate ${task.completed ? 'bg-green-100 text-green-700 line-through' : 'bg-blue-100 text-blue-700'}`}>
                              {task.title}
                            </div>
                          ))}
                          {tasksOnDate(day).length > 3 && <p className="text-[10px] text-center text-gray-400">+{tasksOnDate(day).length - 3}</p>}
                        </div>
                        
                        {/* Mobile View (Nuqtalar) */}
                        <div className="flex md:hidden flex-wrap justify-center gap-0.5">
                          {tasksOnDate(day).map((task) => (
                            <div key={task.id} className={`w-1.5 h-1.5 rounded-full ${task.priority === 'high' ? 'bg-red-500' : 'bg-blue-500'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Week view qismi ham shu kabi responsive qilingan */}
        {view === 'week' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="grid grid-cols-7">
              {weekDays.map((dayName, idx) => {
                const weekStart = new Date(currentDate);
                weekStart.setDate(currentDate.getDate() - (currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1));
                const currentDay = new Date(weekStart);
                currentDay.setDate(weekStart.getDate() + idx);
                const dayTasks = tasks.filter(task => new Date(task.date).toDateString() === currentDay.toDateString());
                const isCurrent = currentDay.toDateString() === today.toDateString();

                return (
                  <div key={idx} className="min-h-[200px] md:min-h-[400px] border-r last:border-r-0 border-gray-100 dark:border-gray-700 p-1 md:p-4">
                    <div className="text-center mb-2 md:mb-4">
                      <p className="text-[10px] md:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">{dayName[0]}</p>
                      <div className={`mt-1 w-7 h-7 md:w-10 md:h-10 mx-auto flex items-center justify-center rounded-full text-xs md:text-base font-bold ${isCurrent ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'}`}>
                        {currentDay.getDate()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {dayTasks.map((task) => (
                        <div key={task.id} className={`p-1 rounded text-[9px] md:text-xs truncate ${task.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          <span className="md:inline hidden">{task.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => { setIsTaskModalOpen(false); setSelectedDate(null); }}
          defaultDate={selectedDate || undefined}
        />
      </div>
    );
  }