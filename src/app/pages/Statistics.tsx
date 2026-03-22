import { useEffect, useState } from 'react';
import { Flame, Target, TrendingUp, CheckCircle, Clock, BarChart3, PieChart as PieChartIcon, LayoutGrid } from 'lucide-react';
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
  
  const highPriority = apiStats?.highPriority ?? tasks.filter(t => t.priority === 'high' && !t.completed).length;
  const mediumPriority = apiStats?.mediumPriority ?? tasks.filter(t => t.priority === 'medium' && !t.completed).length;
  const lowPriority = apiStats?.lowPriority ?? tasks.filter(t => t.priority === 'low' && !t.completed).length;

  const priorityData = [
    { name: 'Yuqori', value: highPriority, color: '#EF4444' },
    { name: "O'rta", value: mediumPriority, color: '#F59E0B' },
    { name: 'Past', value: lowPriority, color: '#10B981' },
  ].filter(d => d.value > 0);

  const categoryProgress = categories.map(cat => {
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-10">
      {/* Header */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          Statistika
        </h1>
        <div className="h-1 w-12 bg-blue-600 mt-2 rounded-full"></div>
      </div>

      {/* Grid Cards - Fully Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 mb-10">
        {[
          { label: 'Jami', val: totalTasks, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
          { label: 'Bajarildi', val: completedTasks, icon: Target, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Natija', val: `${completionRate}%`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'Qolgan', val: activeTasks, icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
          { label: 'Turkum', val: categories.length, icon: LayoutGrid, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-500/10' }
        ].map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-[24px] border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-start transition-transform active:scale-95">
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
              <card.icon size={20} className={card.color} />
            </div>
            <p className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{card.val}</p>
            <p className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Main Charts - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Weekly Activity */}
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
              <BarChart3 size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Haftalik Faollik</h2>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" stroke="#9CA3AF" />
                <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" stroke="#9CA3AF" />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '12px', fontSize: '12px' }} 
                />
                <Bar dataKey="completed" fill="#3B82F6" radius={[4, 4, 4, 4]} barSize={10} />
                <Bar dataKey="tasks" fill="#3B82F6" radius={[4, 4, 4, 4]} barSize={10} opacity={0.1} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
              <PieChartIcon size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Muhimlik</h2>
          </div>
          
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                  {priorityData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {priorityData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] font-black text-gray-400 uppercase">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Detailed - Responsive 2 columns */}
      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm">
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 border-l-4 border-blue-600 pl-4">Turkumlar Progressi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {categoryProgress.map((cat, idx) => {
            const percent = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
            return (
              <div key={idx} className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat.emoji}</span>
                    <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-tight">{cat.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-blue-600">{percent}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-2">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                    style={{ width: `${percent}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}