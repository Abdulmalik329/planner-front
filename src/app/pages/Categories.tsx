import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useData, Category } from '../context/DataContext';
import { CategoryModal } from '../components/CategoryModal';
import { useState } from 'react';

export function Categories() {
  const { categories, deleteCategory: removeCategory, tasks } = useData();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Calculate task counts for each category
  const categoriesWithCounts = categories.map(cat => {
    const categoryTasks = tasks.filter(t => t.category === `${cat.emoji} ${cat.name}`);
    const taskCount = categoryTasks.length;
    const completedCount = categoryTasks.filter(t => t.completed).length;
    return { ...cat, taskCount, completedCount };
  });

  const deleteCategory = (id: string) => {
    removeCategory(id);
  };

  const openCategoryModal = (category: Category | null) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Kategoriyalar</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">{categories.length} ta kategoriya</p>
        </div>
        <button
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          onClick={() => openCategoryModal(null)}
        >
          <Plus className="w-4 h-4" />
          Yangi kategoriya
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriesWithCounts.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 mb-2">Hech qanday kategoriya yo'q</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Yangi kategoriya qo'shish uchun yuqoridagi tugmani bosing
            </p>
          </div>
        ) : (
          categoriesWithCounts.map((category) => {
            const progress = category.taskCount > 0 ? Math.round((category.completedCount / category.taskCount) * 100) : 0;

            return (
              <div
                key={category.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl">
                      {category.emoji}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.taskCount} vazifa
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      onClick={() => openCategoryModal(category)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {category.completedCount}/{category.taskCount}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`${category.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${isNaN(progress) ? 0 : progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-right">{isNaN(progress) ? 0 : progress}% bajarilgan</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Kategoriyalar haqida
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Kategoriyalar vazifalaringizni tashkil qilishga yordam beradi. Har bir kategoriya uchun emoji va rang tanlashingiz mumkin.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">💼</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Ish</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">👤</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Shaxsiy</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">💪</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Sport</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">🏠</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Oila</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">📚</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">O'qish</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">❤️</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Sog'liq</p>
          </div>
        </div>
      </div>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        category={editingCategory}
      />
    </div>
  );
}