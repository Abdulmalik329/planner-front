import { useState } from 'react';
import { User, Palette, Database, AlertTriangle, Download, LogOut, Mail, Shield, Edit2, Check, X } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { authAPI } from '../lib/api';
import { toast } from 'sonner';

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, updateProfile } = useAuth();
  const { tasks, categories } = useData();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [accentColor, setAccentColor] = useState('#3B82F6');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirm: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const accentColors = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
  ];

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const archivedTasks = tasks.filter(t => t.archived).length;
  const activeTasks = tasks.filter(t => !t.completed && !t.archived).length;

  const saveName = async () => {
    if (!newName.trim()) return toast.error('Ism bo\'sh bo\'lmasligi kerak');
    setSavingName(true);
    try {
      await updateProfile(newName.trim());
      setIsEditingName(false);
    } catch (err) {
      toast.error('Xatolik: ' + (err instanceof Error ? err.message : 'Noma\'lum xatolik'));
    } finally {
      setSavingName(false);
    }
  };

  const savePassword = async () => {
    if (!passwordData.current) return toast.error('Joriy parolni kiriting');
    if (passwordData.newPass.length < 6) return toast.error('Yangi parol kamida 6 ta belgi');
    if (passwordData.newPass !== passwordData.confirm) return toast.error('Parollar mos kelmaydi');
    setSavingPassword(true);
    try {
      await authAPI.changePassword(passwordData.current, passwordData.newPass);
      toast.success('Parol muvaffaqiyatli o\'zgartirildi!');
      setIsChangingPassword(false);
      setPasswordData({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error('Xatolik: ' + (err instanceof Error ? err.message : 'Joriy parol noto\'g\'ri'));
    } finally {
      setSavingPassword(false);
    }
  };

  const exportJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      user: { email: user?.email, name: user?.name },
      tasks, categories,
      stats: { totalTasks, completedTasks, archivedTasks, activeTasks },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planner-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON formatida yuklandi');
  };

  const exportCSV = () => {
    const headers = 'Title,Description,Category,Priority,Type,Date,Completed,Archived\n';
    const rows = tasks.map(t =>
      `"${t.title}","${t.description}","${t.category}","${t.priority}","${t.type}","${t.date}","${t.completed}","${t.archived}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planner-tasks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV formatida yuklandi');
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Sozlamalar</h1>
        <p className="text-gray-600 dark:text-gray-400">Ilovangizni sozlang</p>
      </div>

      <div className="space-y-6">

        {/* PROFIL */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profil</h2>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
              style={{ backgroundColor: accentColor }}>
              {(user?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input type="text" value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveName()}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="Ismingiz" autoFocus />
                  <button onClick={saveName} disabled={savingName}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setIsEditingName(false); setNewName(user?.name || ''); }}
                    className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {user?.name || 'Foydalanuvchi'}
                  </p>
                  <button onClick={() => { setIsEditingName(true); setNewName(user?.name || ''); }}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Mail className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Shield className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hisob holati</p>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Faol</p>
              </div>
            </div>
          </div>

          {!isChangingPassword ? (
            <button onClick={() => setIsChangingPassword(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Parolni o'zgartirish
            </button>
          ) : (
            <div className="space-y-3 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Parolni o'zgartirish</p>
              <input type="password" placeholder="Joriy parol"
                value={passwordData.current}
                onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500" />
              <input type="password" placeholder="Yangi parol (min 6 ta belgi)"
                value={passwordData.newPass}
                onChange={e => setPasswordData({ ...passwordData, newPass: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500" />
              <input type="password" placeholder="Yangi parolni tasdiqlang"
                value={passwordData.confirm}
                onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500" />
              <div className="flex gap-2">
                <button onClick={savePassword} disabled={savingPassword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50">
                  {savingPassword ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
                <button onClick={() => { setIsChangingPassword(false); setPasswordData({ current: '', newPass: '', confirm: '' }); }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                  Bekor qilish
                </button>
              </div>
            </div>
          )}
        </div>

        {/* KO'RINISH */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Ko'rinish</h2>
          </div>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Qorong'i rejim</p>
              </div>
              <button onClick={toggleTheme}
                className={`relative w-14 h-8 rounded-full transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${theme === 'dark' ? 'translate-x-6' : ''}`} />
              </button>
            </div>
            {/* <div>
              <p className="font-medium text-gray-900 dark:text-white mb-3">Asosiy rang</p>
              <div className="flex gap-3 flex-wrap">
                {accentColors.map(color => (
                  <button key={color.value} onClick={() => setAccentColor(color.value)} title={color.name}
                    className={`w-10 h-10 rounded-lg transition-all ${accentColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                    style={{ backgroundColor: color.value }} />
                ))}
              </div>
            </div> */}
          </div>
        </div>

        {/* MA'LUMOTLAR */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Ma'lumotlar</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Jami', value: totalTasks, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600' },
              { label: 'Bajarilgan', value: completedTasks, color: 'bg-green-100 dark:bg-green-900/20 text-green-600' },
              { label: 'Faol', value: activeTasks, color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600' },
              // { label: 'Arxiv', value: archivedTasks, color: 'bg-gray-100 dark:bg-gray-700 text-gray-600' },
            ].map((stat, idx) => (
              <div key={idx} className={`rounded-lg p-3 text-center ${stat.color}`}>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Kategoriyalar: <span className="font-medium text-gray-900 dark:text-white">{categories.length}</span>
            </p>
          </div>
          {/* <div className="flex gap-3">
            <button onClick={exportJSON}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm">
              <Download className="w-4 h-4" /> Export JSON
            </button>
            <button onClick={exportCSV}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div> */}
        </div>

        {/* XAVFLI ZONA */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-300">Tizimdan ciqish</h2>
          </div>
          {!showLogoutConfirm ? (
            <button onClick={() => setShowLogoutConfirm(true)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 text-sm">
              <LogOut className="w-4 h-4" /> Tizimdan chiqish
            </button>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">Tizimdan chiqishni tasdiqlaysizmi?</p>
              <div className="flex gap-3">
                <button onClick={logout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                  Ha, chiqish
                </button>
                <button onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                  Bekor qilish
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ILOVA HAQIDA */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Ilova haqida</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Task Planner — vazifalarni boshqarish ilovasi</p>
          <p className="text-xs text-gray-500">Version 1.0.0 · NestJS + React</p>
        </div>

      </div>
    </div>
  );
}