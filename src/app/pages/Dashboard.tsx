import { useState } from 'react';
import { CheckCircle2, Circle, TrendingUp, Calendar, Target, Plus, Clock, LayoutGrid } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { TaskModal } from '../components/TaskModal';

export function Dashboard() {
  const { tasks, categories, toggleComplete } = useData();
  const { user } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Bugungi vazifalar filtri
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayTasks = tasks.filter(t => {
    const d = new Date(t.date);
    return d >= today && d < tomorrow && !t.archived;
  });

  const completionRate = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) 
    : 0;

  // Max 6 ta kategoriya stikerlari
  const displayCategories = categories.slice(0, 6);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Salom, {user?.name || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            Bugun {new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })}.
          </p>
        </div>
        
        {/* DESKTOP "+" TUGMASI */}
        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 items-center gap-2"
        >
          <Plus size={20} /> Yangi Vazifa
        </button>
      </div>

      {/* Statistika Kartalari */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
          <Calendar className="mb-4 opacity-80" size={24} />
          <p className="text-3xl font-black">{todayTasks.length}</p>
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">Bugun</p>
        </div>
        <div className="bg-emerald-500 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20">
          <Clock className="mb-4 opacity-80" size={24} />
          <p className="text-3xl font-black">{completionRate}%</p>
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">Bajarildi</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
          <TrendingUp className="mb-4 text-purple-500" size={24} />
          <p className="text-3xl font-black text-gray-900 dark:text-white">{tasks.length}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Jami</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
          <LayoutGrid className="mb-4 text-orange-500" size={24} />
          <p className="text-3xl font-black text-gray-900 dark:text-white">{categories.length}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Kategoriyalar</p>
        </div>
      </div>

      {/* KATEGORIYALAR "STIKER" USLUBIDA */}
      <div className="mb-10">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-5">Kategoriyalar</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayCategories.map((cat) => (
            <div 
              key={cat.id} 
              className="bg-white dark:bg-gray-800 border-2 border-transparent hover:border-blue-500 dark:border-gray-700 p-5 rounded-[24px] flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-sm group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {cat.emoji}
              </div>
              <span className="text-sm font-black text-gray-800 dark:text-gray-100 truncate w-full">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* BUGUNGI VAZIFALAR RO'YXATI */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[32px] p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Bugungi Rejalar</h2>
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 px-3 py-1 rounded-full text-xs font-black">
            {todayTasks.length} TA
          </span>
        </div>

        {todayTasks.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Rejalar yo'q</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayTasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-900/40 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-all"
              >
                <button 
                  onClick={() => toggleComplete(task.id)} 
                  className="flex-shrink-0 active:scale-90 transition-transform"
                >
                  {task.completed ? 
                    <CheckCircle2 className="w-7 h-7 text-emerald-500" /> : 
                    <Circle className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-base font-bold truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
                    {task.title}
                  </p>
                  <p className="text-[10px] font-black uppercase text-blue-500 mt-0.5">{task.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MOBIL "+" TUGMASI (Floating Action Button) */}
      <button
        onClick={() => setIsTaskModalOpen(true)}
        className="fixed bottom-24 right-6 md:hidden w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-50"
      >
        <Plus size={28} />
      </button>

      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
    </div>
  );
}