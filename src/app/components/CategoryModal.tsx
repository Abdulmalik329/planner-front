import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useData, Category } from '../context/DataContext';

type CategoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
};

const emojis = ['💼', '👤', '💪', '🏠', '📚', '❤️', '🎯', '🎨', '🎮', '🍕', '✈️', '🏋️'];
const colors = [
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Orange', value: 'bg-orange-500' },
];

export function CategoryModal({ isOpen, onClose, category }: CategoryModalProps) {
  const { addCategory } = useData();
  const [formData, setFormData] = useState({
    name: '',
    emoji: '💼',
    color: 'bg-blue-500',
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        emoji: category.emoji,
        color: category.color,
      });
    } else {
      setFormData({
        name: '',
        emoji: '💼',
        color: 'bg-blue-500',
      });
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      await addCategory(formData);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={category ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'} size="sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Kategoriya nomi *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masalan: Ish"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Emoji tanlang *
          </label>
          <div className="grid grid-cols-6 gap-2">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setFormData({ ...formData, emoji })}
                className={`p-3 text-2xl rounded-lg transition-all ${
                  formData.emoji === emoji
                    ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500 scale-110'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Rang tanlang *
          </label>
          <div className="grid grid-cols-4 gap-3">
            {colors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setFormData({ ...formData, color: color.value })}
                className={`h-12 rounded-lg transition-all ${color.value} ${
                  formData.color === color.value
                    ? 'ring-4 ring-offset-2 ring-gray-400 dark:ring-gray-600 scale-105'
                    : 'hover:scale-105'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Ko'rinishi:</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl">
              {formData.emoji}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{formData.name || 'Kategoriya nomi'}</p>
              <div className={`h-2 w-20 rounded-full ${formData.color} mt-1`}></div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {category ? 'Saqlash' : 'Qo\'shish'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
