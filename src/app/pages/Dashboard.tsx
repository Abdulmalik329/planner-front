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

  const categoryStats = categories.map(cat => {
    const catTasks = tasks.filter(t => t.category === cat.name && !t.archived);
    return {
      name: `${cat.emoji} ${cat.name}`,
      count: catTasks.length,
      completed: catTasks.filter(t => t.completed).length,
    };
  }).filter(c => c.count > 0).slice(0, 4);

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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayTasks.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bugungi vazifalar</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyTasks.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Haftalik vazifalar</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{monthlyTasks.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Oylik vazifalar</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{completionRate}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bajarilgan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Haftalik faoliyat</h2>
          {last7Days.every(d => d.tasks === 0) ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Hali vazifalar qo'shilmagan
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="day" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="tasks" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Vazifalar" />
                <Bar dataKey="completed" fill="#10B981" radius={[8, 8, 0, 0]} name="Bajarilgan" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Kategoriyalar</h2>
          {categoryStats.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Kategoriyalar yo'q
            </div>
          ) : (
            <div className="space-y-4">
              {categoryStats.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{cat.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{cat.count} vazifa</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${cat.count > 0 ? (cat.completed / cat.count) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bugungi Vazifalar</h2>
        {todayTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Bugungi vazifalar yo'q</p>
            <button onClick={() => setIsTaskModalOpen(true)} className="mt-4 text-blue-600 dark:text-blue-400 text-sm hover:underline">
              + Vazifa qo'shish
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {todayTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <button onClick={() => toggleComplete(task.id)} className="flex-shrink-0">
                  {task.completed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-gray-400" />}
                </button>
                <div className="flex-1">
                  <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                    {task.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{task.category}</p>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                  task.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20 text-red-600' :
                  task.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600' :
                  'bg-green-100 dark:bg-green-900/20 text-green-600'
                }`}>
                  {task.priority === 'high' ? 'Yuqori' : task.priority === 'medium' ? "O'rta" : 'Past'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-5 h-5" />
          <span>Yangi Vazifa</span>
        </button>
      </div>

      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
    </div>
  );
}