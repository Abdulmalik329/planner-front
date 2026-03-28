import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Menu,
  X,
} from 'lucide-react';

interface ManagerLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/manager/users', label: 'Users', icon: Users },
  { path: '/manager/settings', label: 'Settings', icon: Settings },
];

export function ManagerLayout({ children }: ManagerLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="manager-layout">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Shield size={20} />
          </div>
          {!collapsed && <span className="logo-text">Manager</span>}
          <button
            className="collapse-btn desktop-only"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button
            className="collapse-btn mobile-only"
            onClick={() => setMobileOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path || location.pathname.startsWith(path + '/');
            return (
              <Link
                key={path}
                to={path}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="sidebar-footer">
          {!collapsed && (
            <div className="user-info">
              <div className="user-avatar">
                {user.name?.[0]?.toUpperCase() || 'M'}
              </div>
              <div className="user-details">
                <span className="user-name">{user.name || 'Manager'}</span>
                <span className="user-role">Manager</span>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Mobile topbar */}
        <div className="mobile-topbar">
          <button onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
          <span className="logo-text">Manager</span>
        </div>

        <div className="page-content">
          {children}
        </div>
      </main>

      <style>{`
        .manager-layout {
          display: flex;
          min-height: 100vh;
          background: #0f1117;
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
          color: #e2e8f0;
        }

        /* ── Sidebar ── */
        .sidebar {
          width: 240px;
          background: #161b27;
          border-right: 1px solid #1e2535;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          transition: width 0.25s ease;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .sidebar.collapsed {
          width: 64px;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 16px;
          border-bottom: 1px solid #1e2535;
          min-height: 64px;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: white;
        }

        .logo-text {
          font-weight: 700;
          font-size: 16px;
          color: #f1f5f9;
          flex: 1;
          white-space: nowrap;
        }

        .collapse-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          transition: color 0.15s;
        }

        .collapse-btn:hover { color: #94a3b8; }

        .sidebar-nav {
          flex: 1;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          color: #64748b;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.15s;
          white-space: nowrap;
          overflow: hidden;
        }

        .nav-item:hover {
          background: #1e2535;
          color: #cbd5e1;
        }

        .nav-item.active {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .sidebar-footer {
          padding: 12px 8px;
          border-top: 1px solid #1e2535;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .user-name {
          font-size: 13px;
          font-weight: 600;
          color: #e2e8f0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 11px;
          color: #818cf8;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          width: 100%;
          transition: all 0.15s;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
        }

        /* ── Main ── */
        .main-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .mobile-topbar {
          display: none;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: #161b27;
          border-bottom: 1px solid #1e2535;
        }

        .mobile-topbar button {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
        }

        .page-content {
          padding: 32px;
          flex: 1;
        }

        .desktop-only { display: flex; }
        .mobile-only { display: none; }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: -280px;
            top: 0;
            height: 100vh;
            z-index: 50;
            width: 240px !important;
            transition: left 0.25s ease;
            box-shadow: 4px 0 24px rgba(0,0,0,0.4);
          }

          .sidebar.mobile-open {
            left: 0;
          }

          .mobile-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 40;
          }

          .mobile-topbar { display: flex; }
          .desktop-only { display: none; }
          .mobile-only { display: flex; }

          .page-content {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
