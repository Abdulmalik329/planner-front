import { useState } from 'react';
import { CheckCircle2, Circle, TrendingUp, Calendar, Target, Plus, Clock, LayoutGrid } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { TaskModal } from '../components/TaskModal';

export function Dashboard() {
  const { tasks, categories, toggleComplete } = useData();
  const { user } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Bugungi vazifalarni hisoblash (faqat UI uchun)
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

  // MAX 6 TA KATEGORIYA (STIKER USLUBIDA)
  const displayCategories = categories.slice(0, 6);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Salom, {user?.name || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            Bugun {new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })}. Rejalarni boshlaymizmi?
          </p>
        </div>
        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Yangi Vazifa
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-blue-500 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
          <Calendar className="mb-4 opacity-80" size={24} />
          <p className="text-3xl font-black">{todayTasks.length}</p>
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">Bugungi ishlar</p>
        </div>
        <div className="bg-emerald-500 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20">
          <Clock className="mb-4 opacity-80" size={24} />
          <p className="text-3xl font-black">{completionRate}%</p>
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">Umumiy natija</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
          <TrendingUp className="mb-4 text-purple-500" size={24} />
          <p className="text-3xl font-black text-gray-900 dark:text-white">{tasks.length}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Jami vazifalar</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
          <LayoutGrid className="mb-4 text-orange-500" size={24} />
          <p className="text-3xl font-black text-gray-900 dark:text-white">{categories.length}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Kategoriyalar</p>
        </div>
      </div>

      {/* CATEGORIES "STICKERS" SECTION */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          Kategoriyalar <span className="text-xs font-normal text-gray-400">({categories.length})</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayCategories.length > 0 ? (
            displayCategories.map((cat) => (
              <div 
                key={cat.id} 
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:border-blue-500 transition-all cursor-pointer group shadow-sm"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {cat.emoji}
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate w-full px-1">
                  {cat.name}
                </span>
              </div>
            ))
          ) : (
            <div className="col-span-full py-4 text-gray-400 text-sm italic">Hali kategoriyalar yo'q...</div>
          )}
        </div>
      </div>

      {/* TODAY'S TASKS LIST */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[32px] p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bugungi Rejalar</h2>
          <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-3 py-1 rounded-full text-xs font-black uppercase">
            {todayTasks.length} ta
          </span>
        </div>

        {todayTasks.length === 0 ? (
          <div className="py-16 text-center">
            <div className="bg-gray-50 dark:bg-gray-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✨</div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Bugun uchun barcha ishlar bajarilgan yoki hali reja yo'q!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayTasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-all group"
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
                <div className="flex-1 min-w-0">
                  <p className={`text-base font-bold truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">{task.category}</span>
                    {task.priority === 'high' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
    </div>
  );
}