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
    const startingDayOfWeek = firstDay.getDay();
    
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

  // Get tasks for a specific date
  const tasksOnDate = (day: number | null) => {
    if (!day) return [];
    
    const dateToCheck = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    
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
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(clickedDate);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Kalendar</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setView('month')}
              className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'month' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Oylik
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'week' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Haftalik
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-3 md:px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Bugun
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={previousMonth}
              className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm md:text-base"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Yangi vazifa</span>
            <span className="sm:hidden">Yangi</span>
          </button>
        </div>
      </div>

      {view === 'month' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
            {weekDays.map((dayName, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 p-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-white text-center">{dayName}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px">
            {days.map((day, idx) => (
              <div
                key={idx}
                className={`bg-white dark:bg-gray-800 p-4 ${isToday(day) ? 'bg-blue-600 text-white' : ''}`}
                onClick={() => handleDayClick(day)}
              >
                {day && (
                  <div className="text-center">
                    <div className="mt-2 w-10 h-10 mx-auto flex items-center justify-center rounded-full">
                      {day}
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {tasksOnDate(day).map((task) => (
                        <div
                          key={task.id}
                          className={`px-3 py-2 rounded-lg text-xs ${task.completed ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 line-through' : task.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' : task.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'}`}
                        >
                          <div className="font-medium">{task.title}</div>
                          <div className="text-xs opacity-75 mt-1">{task.category}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'week' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
            {weekDays.map((dayName, idx) => {
              // Get current week days
              const weekStart = new Date(currentDate);
              weekStart.setDate(currentDate.getDate() - currentDate.getDay());
              const currentDay = new Date(weekStart);
              currentDay.setDate(weekStart.getDate() + idx);
              
              const dayTasks = tasks.filter(task => {
                const taskDate = new Date(task.date);
                return (
                  taskDate.getDate() === currentDay.getDate() &&
                  taskDate.getMonth() === currentDay.getMonth() &&
                  taskDate.getFullYear() === currentDay.getFullYear()
                );
              });

              const isCurrentDay = 
                currentDay.getDate() === today.getDate() &&
                currentDay.getMonth() === today.getMonth() &&
                currentDay.getFullYear() === today.getFullYear();

              return (
                <div key={idx} className="bg-white dark:bg-gray-800 p-4">
                  <div className="text-center mb-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{dayName}</p>
                    <div className={`mt-2 w-10 h-10 mx-auto flex items-center justify-center rounded-full ${isCurrentDay ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'}`}>
                      {currentDay.getDate()}
                    </div>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {dayTasks.map((task) => (
                      <div 
                        key={task.id} 
                        className={`px-3 py-2 rounded-lg text-xs ${task.completed ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 line-through' : task.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' : task.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'}`}
                      >
                        <div className="font-medium">{task.title}</div>
                        <div className="text-xs opacity-75 mt-1">{task.category}</div>
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
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedDate(null);
        }}
        defaultDate={selectedDate || undefined}
      />
    </div>
  );
}