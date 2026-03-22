import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { tasksAPI, categoriesAPI } from '../lib/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  date: string;
  type: 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  archived: boolean;
};

export type Category = {
  id: string;
  name: string;
  emoji: string;
  taskCount?: number;
  completedCount?: number;
  color: string;
};

type DataContextType = {
  tasks: Task[];
  categories: Category[];
  loading: boolean;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const loadData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [tasksData, categoriesData] = await Promise.all([
        tasksAPI.getAll(),
        categoriesAPI.getAll(),
      ]);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const addTask = async (task: Omit<Task, 'id'>) => {
    try {
      const result = await tasksAPI.create(task);
      setTasks(prev => [result, ...prev]);
      toast.success('Vazifa muvaffaqiyatli qo\'shildi');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Vazifa qo\'shishda xatolik: ' + (error instanceof Error ? error.message : 'Xatolik'));
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const result = await tasksAPI.update(id, updates);
      setTasks(prev => prev.map(t => t.id === id ? result : t));
      toast.success('Vazifa yangilandi');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Vazifa yangilashda xatolik: ' + (error instanceof Error ? error.message : 'Xatolik'));
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await tasksAPI.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Vazifa o\'chirildi');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Vazifa o\'chirishda xatolik');
      throw error;
    }
  };

  const toggleComplete = async (id: string) => {
    try {
      const result = await tasksAPI.toggleComplete(id);
      setTasks(prev => prev.map(t => t.id === id ? result : t));
    } catch (error) {
      console.error('Error toggling complete:', error);
      toast.error('Xatolik yuz berdi');
      throw error;
    }
  };

  const toggleArchive = async (id: string) => {
    try {
      const result = await tasksAPI.toggleArchive(id);
      setTasks(prev => prev.map(t => t.id === id ? result : t));
    } catch (error) {
      console.error('Error toggling archive:', error);
      toast.error('Xatolik yuz berdi');
      throw error;
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const result = await categoriesAPI.create(category);
      setCategories(prev => [result, ...prev]);
      toast.success('Kategoriya qo\'shildi');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Kategoriya qo\'shishda xatolik');
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const result = await categoriesAPI.update(id, updates);
      setCategories(prev => prev.map(c => c.id === id ? result : c));
      toast.success('Kategoriya yangilandi');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Kategoriya yangilashda xatolik');
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoriesAPI.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Kategoriya o\'chirildi');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Kategoriya o\'chirishda xatolik');
      throw error;
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  return (
    <DataContext.Provider
      value={{
        tasks,
        categories,
        loading,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        toggleArchive,
        addCategory,
        updateCategory,
        deleteCategory,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
