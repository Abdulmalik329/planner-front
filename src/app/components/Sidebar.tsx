import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, Calendar, ListTodo, BarChart3, 
  FolderKanban, Settings, Sun, Moon,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tasks', icon: ListTodo, label: 'Vazifalar' },
  { path: '/calendar', icon: Calendar, label: 'Kalendar' },
  { path: '/statistics', icon: BarChart3, label: 'Statistika' },
  { path: '/categories', icon: FolderKanban, label: 'Kategoriya' },
];

export function Sidebar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* 1. DESKTOP SIDEBAR (Kattaroq ekranlar uchun) */}
      <aside className="hidden lg:flex w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col h-screen sticky top-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Planner
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Vazifalar menejeri</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          {/* Desktopda Sozlamalar pastki qismda */}
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <Link 
              to="/settings"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                isActive('/settings')
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Sozlamalar</span>
            </Link>
          </div>
        </nav>

        {/* Desktop Dark Mode Toggle */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-medium"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="text-sm">{theme === 'light' ? 'Tungi ' : 'Kunduzgi '}</span>
          </button>
        </div>
      </aside>

      {/* 2. MOBILE TOP BAR (Tepadagi menyu) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Planner
          </h1>
          
          <div className="flex items-center gap-2">
            {/* Mobil uchun Sozlamalar tugmasi shu yerga ko'chirildi */}
            <Link 
              to="/settings"
              className={`p-2 rounded-lg transition-all ${
                isActive('/settings') 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              <Settings className="w-5 h-5" />
            </Link>

            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. MOBILE BOTTOM NAV (Pastki navigatsiya) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 pb-safe">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-all ${
                isActive(item.path) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <item.icon className={`w-6 h-6 ${isActive(item.path) ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      
      {/* Mobil ko'rinishda kontent tepadagi va pastdagi menyular tagida qolib ketmasligi uchun bo'shliqlar */}
      <div className="lg:hidden h-16" /> {/* Header uchun bo'shliq */}
    </>
  );
}