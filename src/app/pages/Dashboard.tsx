import { useState } from 'react';
import { CheckCircle2, Circle, TrendingUp, Calendar, Target, Plus, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

  const weeklyTasks = tasks.filter(t => t.type === 'weekly' && !t.archived);
  const monthlyTasks = tasks.filter(t => t.type === 'monthly' && !t.archived);
  const completedCount = tasks.filter(t => t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Haftalik statistika
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const dayTasks = tasks.filter(t => {
      const td = new Date(t.date);
      return td >= date && td < nextDay;
    });
    return {
      day: date.toLocaleDateString('uz-UZ', { weekday: 'short' }),
      tasks: dayTasks.length,
      completed: dayTasks.filter(t => t.completed).length,
    };
  });

  // YANGILANGAN KATEGORIYA STATISTIKASI (Filter olib tashlandi)
  const categoryStats = categories.map(cat => {
    const catTasks = tasks.filter(t => t.category === cat.name && !t.archived);
    return {
      name: `${cat.emoji} ${cat.name}`,
      count: catTasks.length,
      completed: catTasks.filter(t => t.completed).length,
    };
  }).slice(0, 6); // Eng asosiy 6 ta kategoriyani chiqaradi

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Salom, {user?.name || user?.email?.split('@')[0]} 👋
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Statistika kartalari */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
            <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{todayTasks.length}</p>
          <p className="text-[10px] md:text-sm text-gray-600 dark:text-gray-400 mt-1 uppercase tracking-wider font-semibold">Bugun</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{weeklyTasks.length}</p>
          <p className="text-[10px] md:text-sm text-gray-600 dark:text-gray-400 mt-1 uppercase tracking-wider font-semibold">Haftalik</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
            <Target className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{monthlyTasks.length}</p>
          <p className="text-[10px] md:text-sm text-gray-600 dark:text-gray-400 mt-1 uppercase tracking-wider font-semibold">Oylik</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
            <Clock className="w-5 h-5 md:w-6 md:h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{completionRate}%</p>
          <p className="text-[10px] md:text-sm text-gray-600 dark:text-gray-400 mt-1 uppercase tracking-wider font-semibold">Progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Haftalik faoliyat</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Bar dataKey="tasks" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Vazifalar" />
              <Bar dataKey="completed" fill="#10B981" radius={[4, 4, 0, 0]} name="Bajarilgan" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* KATEGORIYALAR BO'LIMI */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Kategoriyalar </h2>
          {categoryStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm italic">
               Kategoriyalar mavjud emas
            </div>
          ) : (
            <div className="space-y-5">
              {categoryStats.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{cat.name}</span>
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                      {cat.count} vazifa
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${cat.count > 0 ? (cat.completed / cat.count) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bugungi vazifalar ro'yxati */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bugungi Vazifalar</h2>
          <span className="text-xs font-medium text-gray-500">{todayTasks.length} ta jami</span>
        </div>

        {todayTasks.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Bugun uchun rejalashtirilgan ishlar yo'q</p>
            <button 
              onClick={() => setIsTaskModalOpen(true)} 
              className="mt-4 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline"
            >
              <Plus size={16} /> Birinchi vazifani qo'shish
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {todayTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-4 rounded-xl border border-gray-50 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-900/20 hover:shadow-md transition-all group">
                <button 
                  onClick={() => toggleComplete(task.id)} 
                  className="flex-shrink-0 transition-transform active:scale-90"
                >
                  {task.completed ? 
                    <CheckCircle2 className="w-6 h-6 text-green-500" /> : 
                    <Circle className="w-6 h-6 text-gray-300 dark:text-gray-600 group-hover:border-blue-500" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
                    {task.title}
                  </p>
                  <p className="text-[11px] text-gray-500 uppercase font-bold tracking-tight">{task.category}</p>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                  task.priority === 'high' ? 'bg-red-100 text-red-600' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {task.priority === 'high' ? '!!!' : task.priority === 'medium' ? '!!' : '!'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-24 right-6 md:hidden">
         <button
          onClick={() => setIsTaskModalOpen(true)}
          className="p-4 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-500/50 active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Desktop Button */}
      <div className="mt-8 hidden md:block">
        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-5 h-5" />
          <span>Yangi Vazifa Qo'shish</span>
        </button>
      </div>

      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
    </div>
  );
}