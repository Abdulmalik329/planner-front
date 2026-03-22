import { Outlet, Navigate } from 'react-router';
import { Sidebar } from './Sidebar';
import { LoadingSpinner } from './LoadingSpinner';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { loading } = useData();
  const { isAuthenticated, loading: authLoading } = useAuth();

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0 pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}