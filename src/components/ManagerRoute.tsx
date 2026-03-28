import { Navigate } from 'react-router-dom';

interface ManagerRouteProps {
  children: React.ReactNode;
}

export function ManagerRoute({ children }: ManagerRouteProps) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'MANAGER') {
    // Regular users go to their own dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
