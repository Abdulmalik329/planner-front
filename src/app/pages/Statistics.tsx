import { useEffect, useState } from 'react';
import { Flame, Target, TrendingUp, CheckCircle, Clock } from 'lucide-react';
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
    const catTasks = tasks.filter(t => t.category === cat.name);
    const catCompleted = catTasks.filter(t => t.completed).length;
    return { name: `${cat.emoji} ${cat.name}`, completed: catCompleted, total: catTasks.length };
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
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Statistika</h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Sizning faoliyatingiz tahlili</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTasks}</p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Jami vazifalar</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedTasks}</p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Bajarilgan</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{completionRate}%</p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Muvaffaqiyat</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeTasks}</p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Qolgan</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Kategoriyalar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">7 kunlik aktivlik</h2>
          {last7Days.every(d => d.tasks === 0) ? (
            <div className="flex items-center justify-center h-48 text-gray-400">Hali vazifalar yo'q</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="day" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="completed" fill="#10B981" radius={[4, 4, 0, 0]} name="Bajarilgan" />
                <Bar dataKey="tasks" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Jami" opacity={0.4} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Priority bo'yicha</h2>
          {priorityData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">Faol vazifalar yo'q</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={priorityData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
                    {priorityData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {priorityData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {categoryProgress.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Kategoriyalar bo'yicha</h2>
          <div className="space-y-4">
            {categoryProgress.map((cat, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{cat.name}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {cat.completed}/{cat.total} ({cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${cat.total > 0 ? (cat.completed / cat.total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}