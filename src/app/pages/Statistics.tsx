import { useEffect, useState } from 'react';
import { Flame, Target, TrendingUp, CheckCircle, Clock, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { statisticsAPI } from '../lib/api';
import { useData } from '../context/DataContext';

export function Statistics() {
  const { tasks, categories } = useData();
  const [apiStats, setApiStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statisticsAPI.get()
      .then(setApiStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tasks]);

  const totalTasks = apiStats?.totalTasks ?? tasks.length;
  const completedTasks = apiStats?.completedTasks ?? tasks.filter(t => t.completed).length;
  const activeTasks = apiStats?.activeTasks ?? tasks.filter(t => !t.completed && !t.archived).length;
  const completionRate = apiStats?.completionRate ?? (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);
  
  // Priority stats
  const highPriority = apiStats?.highPriority ?? tasks.filter(t => t.priority === 'high' && !t.completed).length;
  const mediumPriority = apiStats?.mediumPriority ?? tasks.filter(t => t.priority === 'medium' && !t.completed).length;
  const lowPriority = apiStats?.lowPriority ?? tasks.filter(t => t.priority === 'low' && !t.completed).length;

  const priorityData = [
    { name: 'Yuqori', value: highPriority, color: '#EF4444' },
    { name: "O'rta", value: mediumPriority, color: '#F59E0B' },
    { name: 'Past', value: lowPriority, color: '#10B981' },
  ].filter(d => d.value > 0);

  const categoryProgress = categories.map(cat => {
    // Kategoriya tekshiruvi (Emoji + Name yoki faqat Name)
    const catTasks = tasks.filter(t => t.category === `${cat.emoji} ${cat.name}` || t.category === cat.name);
    const catCompleted = catTasks.filter(t => t.completed).length;
    return { name: cat.name, emoji: cat.emoji, completed: catCompleted, total: catTasks.length };
  }).filter(c => c.total > 0);

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

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold animate-pulse">STATISTIKA YUKLANMOQDA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Statistika Analizi</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Sizning mahsuldorligingiz raqamlarda</p>
      </div>

      {/* Top 5 Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {[
          { label: 'Jami', val: totalTasks, icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { label: 'Bajarildi', val: completedTasks, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Natija', val: `${completionRate}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Qolgan', val: activeTasks, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Kategoriya', val: categories.length, icon: LayoutGrid, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-900/20' }
        ].map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-[24px] p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{card.val}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Activity Chart Card */}
        <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-white">
            <BarChart3 size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold">Haftalik Faollik</h2>
          </div>
          
          {last7Days.every(d => d.tasks === 0) ? (
            <div className="flex items-center justify-center h-64 italic text-gray-400">Ma'lumotlar mavjud emas</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} stroke="#9CA3AF" />
                <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#9CA3AF" />
                <Tooltip 
                  cursor={{fill: 'rgba(59, 130, 246, 0.05)'}}
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '16px', color: '#fff', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} 
                />
                <Bar dataKey="completed" fill="#10B981" radius={[6, 6, 6, 6]} barSize={12} name="Bajarildi" />
                <Bar dataKey="tasks" fill="#3B82F6" radius={[6, 6, 6, 6]} barSize={12} name="Jami" opacity={0.3} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Priority Chart Card */}
        <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-white">
            <PieChartIcon size={20} className="text-purple-600" />
            <h2 className="text-lg font-bold">Muhimlik Darajasi</h2>
          </div>
          
          {priorityData.length === 0 ? (
            <div className="flex items-center justify-center h-64 italic text-gray-400">Faol vazifalar yo'q</div>
          ) : (
            <div className="relative">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie 
                    data={priorityData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={70} 
                    outerRadius={95} 
                    paddingAngle={8} 
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '12px', color: '#fff' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Custom Legend */}
              <div className="flex justify-center gap-6 mt-4">
                {priorityData.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{item.name}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-800 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Categories Detailed Progress */}
      {categoryProgress.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8">Kategoriyalar Progressi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {categoryProgress.map((cat, idx) => {
              const percent = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
              return (
                <div key={idx} className="group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl group-hover:scale-110 transition-transform">{cat.emoji}</span>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">{cat.name}</span>
                    </div>
                    <span className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                      {cat.completed} / {cat.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                      style={{ width: `${percent}%` }} 
                    />
                  </div>
                  <div className="flex justify-end mt-1">
                    <span className="text-[10px] font-bold text-gray-400">{percent}% bajarildi</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// LayoutGrid componentini import qilishni unutmang (lucide-react dan)
import { LayoutGrid } from 'lucide-react';