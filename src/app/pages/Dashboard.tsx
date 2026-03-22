import { useState } from 'react';
import { CheckCircle2, Circle, TrendingUp, Calendar, Target, Plus, Clock, LayoutGrid } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { TaskModal } from '../components/TaskModal';

export function Dashboard() {
  const { tasks, categories, toggleComplete } = useData();
  const { user } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayTasks = tasks.filter(t => {
    const d = new Date(t.date);
    return d >= today && d < tomorrow && !t.archived;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const displayCategories = categories.slice(0, 6);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto relative min-h-screen">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Salom, {user?.name || user?.email?.split('@')[0]}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            Bugungi rejalarni boshlaymizmi?
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
          <Calendar className="mb-4 opacity-80" size={24} />
          <p className="text-3xl font-black">{todayTasks.length}</p>
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">Bugungi ishlar</p>
        </div>
        <div className="bg-emerald-500 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20">
          <Clock className="mb-4 opacity-80" size={24} />
          <p className="text-3xl font-black">{completionRate}%</p>
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">Natija</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm text-center md:text-left">
          <p className="text-2xl font-black text-gray-900 dark:text-white">{tasks.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Jami vazifa</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm text-center md:text-left">
          <p className="text-2xl font-black text-gray-900 dark:text-white">{categories.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Kategoriya</p>
        </div>
      </div>

      {/* CATEGORIES "STICKERS" SECTION */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2 text-center md:text-left">
          Kategoriyalar
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayCategories.map((cat) => (
            <div 
              key={cat.id} 
              className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-3xl flex flex-col items-center justify-center text-center hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group shadow-sm active:scale-95"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {cat.emoji}
              </div>
              <span className="text-sm font-black text-gray-800 dark:text-gray-100 truncate w-full uppercase tracking-tighter">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* TODAY'S TASKS LIST */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[32px] p-6 md:p-8 shadow-sm mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bugungi Rejalar</h2>
          <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-3 py-1 rounded-full text-xs font-black uppercase">
            {todayTasks.length} ta
          </span>
        </div>

        {todayTasks.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Hozircha bo'sh ✨</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayTasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-all group shadow-sm"
              >
                <button 
                  onClick={() => toggleComplete(task.id)} 
                  className="flex-shrink-0 transition-transform active:scale-90"
                >
                  {task.completed ? 
                    <CheckCircle2 className="w-7 h-7 text-emerald-500" /> : 
                    <Circle className="w-7 h-7 text-gray-300 dark:text-gray-600 group-hover:text-blue-500" />
                  }
                </button>
                <div className="flex-1 min-w-0 text-left">
                  <p className={`text-base font-bold truncate ${task.completed ? 'line-through text-gray-400 font-medium' : 'text-gray-800 dark:text-gray-100'}`}>
                    {task.title}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-tighter text-blue-500">{task.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* YIKIB QOLUVCHI "+" TUGMASI (DUMALOQ VA O'NG PASDA) */}
      <button
        onClick={() => setIsTaskModalOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-all active:scale-90 z-[9999] group"
        title="Yangi vazifa qo'shish"
      >
        <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
    </div>
  );
}