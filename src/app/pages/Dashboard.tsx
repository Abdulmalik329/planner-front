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

  // Sana hisob-kitoblari
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 1. Bugungi vazifalar
  const todayTasks = tasks.filter(t => {
    const d = new Date(t.date);
    return d >= today && d < tomorrow && !t.archived;
  });

  // 2. Statistika uchun filtrlar
  const weeklyTasks = tasks.filter(t => t.type === 'weekly' && !t.archived);
  const monthlyTasks = tasks.filter(t => t.type === 'monthly' && !t.archived);
  const completedCount = tasks.filter(t => t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // 3. Haftalik chart ma'lumotlari
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

  // 4. TOG'RILANGAN KATEGORIYA HISOB-KITOBI (Categories page mantiqi bilan bir xil)
  const categoryStats = categories.map(cat => {
    // Ham emoji + nom, ham faqat nom ko'rinishida tekshiramiz (Xatolikni oldini olish uchun)
    const catTasks = tasks.filter(t => 
      !t.archived && (
        t.category === `${cat.emoji} ${cat.name}` || 
        t.category === cat.name
      )
    );
    
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Bugun', val: todayTasks.length, icon: Calendar, bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
          { label: 'Haftalik', val: weeklyTasks.length, icon: TrendingUp, bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
          { label: 'Oylik', val: monthlyTasks.length, icon: Target, bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
          { label: 'Progress', val: `${completionRate}%`, icon: Clock, bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
              <item.icon className={`w-5 h-5 ${item.text}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.val}</p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Haftalik chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Faollik grafikasi</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} stroke="#9CA3AF" />
              <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#9CA3AF" />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="tasks" fill="#3B82F6" radius={[4, 4, 4, 4]} barSize={12} name="Jami" />
              <Bar dataKey="completed" fill="#10B981" radius={[4, 4, 4, 4]} barSize={12} name="Bajarildi" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Kategoriyalar Progressi */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Kategoriyalar bo'yicha</h2>
          <div className="space-y-6">
            {categoryStats.length > 0 ? (
              categoryStats.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.emoji}</span>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{cat.name}</span>
                    </div>
                    <span className="text-[11px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg uppercase">
                      {cat.count} ta ish
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-2.5">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${cat.count > 0 ? (cat.completed / cat.count) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-40 italic text-gray-400">Kategoriyalar topilmadi</div>
            )}
          </div>
        </div>
      </div>

      {/* Bugungi Vazifalar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Bugungi Vazifalar</h2>
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center gap-1 hover:opacity-80"
          >
            <Plus size={16} /> Qo'shish
          </button>
        </div>

        {todayTasks.length === 0 ? (
          <div className="py-10 text-center border-2 border-dashed border-gray-50 dark:border-gray-700 rounded-2xl">
            <p className="text-gray-400 text-sm">Bugun uchun hech qanday reja yo'q</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/10 transition-all hover:border-blue-200">
                <button onClick={() => toggleComplete(task.id)} className="flex-shrink-0 active:scale-90 transition-transform">
                  {task.completed ? 
                    <CheckCircle2 className="w-6 h-6 text-green-500" /> : 
                    <Circle className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold truncate ${task.completed ? 'line-through text-gray-400 font-normal' : 'text-gray-800 dark:text-gray-100'}`}>
                    {task.title}
                  </p>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{task.category}</p>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'high' ? 'bg-red-500' : 'bg-blue-500'}`} />
              </div>
            ))}
          </div>
        )}
      </div>

      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
    </div>
  );
}