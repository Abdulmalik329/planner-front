import { useState } from 'react';
import { Search, CheckCircle2, Calendar, Tag } from 'lucide-react';

type ArchivedTask = {
  id: string;
  title: string;
  description: string;
  category: string;
  completedDate: string;
  type: 'daily' | 'weekly' | 'monthly';
};

export function Archive() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'category'>('date');

  const [archivedTasks] = useState<ArchivedTask[]>([
    {
      id: '1',
      title: 'Loyiha ustida ishlash',
      description: 'Frontend development',
      category: '💼 Ish',
      completedDate: '2026-03-14',
      type: 'daily',
    },
    {
      id: '2',
      title: 'Haftalik reja tuzish',
      description: 'Keyingi hafta rejasi',
      category: '👤 Shaxsiy',
      completedDate: '2026-03-13',
      type: 'weekly',
    },
    {
      id: '3',
      title: 'Sport mashg\'ulotlari',
      description: 'Ertalab yugurish',
      category: '💪 Sport',
      completedDate: '2026-03-12',
      type: 'daily',
    },
    {
      id: '4',
      title: 'Kitob o\'qish - 50 sahifa',
      description: 'Atomic Habits',
      category: '📚 O\'qish',
      completedDate: '2026-03-11',
      type: 'daily',
    },
    {
      id: '5',
      title: 'Oila bilan vaqt o\'tkazish',
      description: 'Parkda sayr',
      category: '🏠 Oila',
      completedDate: '2026-03-10',
      type: 'weekly',
    },
  ]);

  const filteredTasks = archivedTasks
    .filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime();
      } else {
        return a.category.localeCompare(b.category);
      }
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Arxiv</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {filteredTasks.length} ta bajarilgan vazifa
        </p>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Arxivda qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Tartiblash:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'category')}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sana bo'yicha</option>
            <option value="category">Kategoriya bo'yicha</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{task.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Tag className="w-4 h-4" />
                    <span>{task.category}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(task.completedDate)}</span>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs">
                    {task.type === 'daily' ? 'Kunlik' : task.type === 'weekly' ? 'Haftalik' : 'Oylik'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-2">Hech qanday vazifa topilmadi</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Bajarilgan vazifalar bu yerda ko'rinadi
          </p>
        </div>
      )}

      <div className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Ajoyib ish!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Siz {archivedTasks.length} ta vazifani muvaffaqiyatli bajardingiz. Davom eting!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
