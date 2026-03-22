import { useState } from 'react';
import { CheckCircle2, Circle, TrendingUp, Calendar, Target, Plus, Clock } from 'lucide-center';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { TaskModal } from '../components/TaskModal';

export function Dashboard() {
  const { tasks, categories, toggleComplete } = useData();
  const { user } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Sana hisob-kitoblari
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Statistika uchun filtrlar
  const todayTasks = tasks.filter(t => {
    const d = new Date(t.date);
    return d >= today && d < tomorrow && !t.archived;
  });

  const weeklyTasks = tasks.filter(t => t.type === 'weekly' && !t.archived);
  const monthlyTasks = tasks.filter(t => t.type === 'monthly' && !t.archived);
  const completedCount = tasks.filter(t => t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Haftalik chart ma'lumotlari
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

  // TOG'RILANGAN KATEGORIYA HISOB-KITOBI
  const categoryStats = categories.map(cat => {
    // Categories page bilan bir xil format: emoji + prober + name
    const fullCategoryName = `${cat.emoji} ${cat.name}`;
    const catTasks = tasks.filter(t => t.category === fullCategoryName && !t.archived);
    
    return {
      name: cat.name,
      emoji: cat.emoji,
      count: catTasks.length,
      completed: catTasks.filter(t => t.completed).length,
    };
  }).slice(0, 6);

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Salom, {user?.name || user?.email?.split('@')[0]} 👋
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* 4 ta asosiy karta */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        {[
          { label: 'Bugun', val: todayTasks.length, icon: Calendar, color: 'blue' },
          { label: 'Haftalik', val: weeklyTasks.length, icon: TrendingUp, color: 'purple' },
          { label: 'Oylik', val: monthlyTasks.length, icon: Target, color: 'green' },
          { label: 'Progress', val: `${completionRate}%`, icon: Clock, color: 'orange' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className={`w-10 h-10 rounded-lg bg-${item.color}-100 dark:bg-${item.color}-900/20 flex items-center justify-center mb-4`}>
              <item.icon className={`w-5 h-5 text-${item.color}-600 dark:text-${item.color}-400`} />
            </div>
            <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{item.val}</p>
            <p className="text-[10px] md:text-sm text-gray-500 uppercase font-bold tracking-wider">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Haftalik faoliyat Charti */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Haftalik faoliyat</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="tasks" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Jami" />
              <Bar dataKey="completed" fill="#10B981" radius={[4, 4, 0, 0]} name="Bajarildi" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Kategoriyalar Progressi */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Kategoriyalar</h2>
          <div className="space-y-5">
            {categoryStats.length > 0 ? (
              categoryStats.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium dark:text-gray-200">{cat.emoji} {cat.name}</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                      {cat.count} ta vazifa
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${cat.count > 0 ? (cat.completed / cat.count) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-10">Kategoriyalar topilmadi</p>
            )}
          </div>
        </div>
      </div>

      {/* Bugungi Vazifalar ro'yxati */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          Bugungi Rejalar <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">{todayTasks.length}</span>
        </h2>
        
        {todayTasks.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-50 dark:border-gray-700 rounded-2xl">
            <p className="text-gray-500 text-sm mb-4">Bugun uchun vazifalar qo'shilmagan</p>
            <button onClick={() => setIsTaskModalOpen(true)} className="text-blue-600 font-bold hover:underline">+ Yangi vazifa</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-50 dark:border-gray-700/50 bg-gray-50/20 dark:bg-gray-900/10 hover:shadow-sm transition-all">
                <button onClick={() => toggleComplete(task.id)} className="flex-shrink-0">
                  {task.completed ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6 text-gray-300" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
                    {task.title}
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">{task.category}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} title={task.priority} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Tugmasi */}
      <div className="mt-8">
        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Yangi Vazifa Qo'shish</span>
        </button>
      </div>

      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
    </div>
  );
}