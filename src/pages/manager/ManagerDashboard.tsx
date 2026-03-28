import { useEffect, useState } from 'react';
import {
  Users,
  CheckSquare,
  FolderOpen,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Activity,
  UserCheck,
  UserX,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem('token');
}

interface DashboardData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    newUsersThisMonth: number;
    userGrowthPercent: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    totalCategories: number;
    taskCompletionRate: number;
  };
  usersPerMonth: { month: string; count: number }[];
  taskCompletionRate: {
    total: number;
    completed: number;
    archived: number;
    pending: number;
  };
  recentUsers: {
    id: string;
    name: string | null;
    email: string;
    isActive: boolean;
    createdAt: string;
    _count: { tasks: number };
  }[];
}

export default function ManagerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_URL}/manager/dashboard`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (!data) {
    return <div className="dashboard-error">Failed to load dashboard data.</div>;
  }

  const { overview, usersPerMonth, taskCompletionRate, recentUsers } = data;
  const maxMonth = Math.max(...usersPerMonth.map((m) => m.count), 1);

  const stats = [
    {
      label: 'Total Users',
      value: overview.totalUsers,
      icon: Users,
      color: '#6366f1',
      bg: 'rgba(99,102,241,0.1)',
    },
    {
      label: 'Active Users',
      value: overview.activeUsers,
      icon: UserCheck,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.1)',
    },
    {
      label: 'New This Month',
      value: overview.newUsersThisMonth,
      icon: UserPlus,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.1)',
      badge:
        overview.userGrowthPercent !== 0 ? (
          <span className={`growth ${overview.userGrowthPercent > 0 ? 'up' : 'down'}`}>
            {overview.userGrowthPercent > 0 ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            {Math.abs(overview.userGrowthPercent)}%
          </span>
        ) : null,
    },
    {
      label: 'Total Tasks',
      value: overview.totalTasks,
      icon: CheckSquare,
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.1)',
    },
    {
      label: 'Completed Tasks',
      value: overview.completedTasks,
      icon: Activity,
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.1)',
    },
    {
      label: 'Categories',
      value: overview.totalCategories,
      icon: FolderOpen,
      color: '#ec4899',
      bg: 'rgba(236,72,153,0.1)',
    },
  ];

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Platform overview and analytics</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        {stats.map(({ label, value, icon: Icon, color, bg, badge }) => (
          <div className="stat-card" key={label}>
            <div className="stat-top">
              <div className="stat-icon" style={{ background: bg, color }}>
                <Icon size={20} />
              </div>
              {badge}
            </div>
            <div className="stat-value">{value.toLocaleString()}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="charts-row">
        {/* Bar chart - users per month */}
        <div className="chart-card">
          <h3 className="chart-title">New Users (Last 6 Months)</h3>
          <div className="bar-chart">
            {usersPerMonth.map((m) => (
              <div className="bar-group" key={m.month}>
                <div className="bar-wrap">
                  <div
                    className="bar"
                    style={{ height: `${(m.count / maxMonth) * 100}%` }}
                  />
                </div>
                <span className="bar-label">{m.month.split(' ')[0]}</span>
                <span className="bar-count">{m.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task breakdown */}
        <div className="chart-card">
          <h3 className="chart-title">Task Breakdown</h3>
          <div className="donut-wrapper">
            <DonutChart
              completed={taskCompletionRate.completed}
              pending={taskCompletionRate.pending}
              archived={taskCompletionRate.archived}
              total={taskCompletionRate.total}
            />
          </div>
          <div className="task-legend">
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#10b981' }} />
              <span>Completed</span>
              <span className="legend-count">{taskCompletionRate.completed}</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#f59e0b' }} />
              <span>Pending</span>
              <span className="legend-count">{taskCompletionRate.pending}</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#64748b' }} />
              <span>Archived</span>
              <span className="legend-count">{taskCompletionRate.archived}</span>
            </div>
          </div>
        </div>

        {/* User status */}
        <div className="chart-card">
          <h3 className="chart-title">User Status</h3>
          <div className="user-status-visual">
            <div className="status-ring">
              <svg viewBox="0 0 100 100" width="120" height="120">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#1e2535" strokeWidth="12" />
                {overview.totalUsers > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeDasharray={`${(overview.activeUsers / overview.totalUsers) * 238.76} 238.76`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                )}
              </svg>
              <div className="ring-center">
                <span className="ring-pct">
                  {overview.totalUsers > 0
                    ? Math.round((overview.activeUsers / overview.totalUsers) * 100)
                    : 0}%
                </span>
                <span className="ring-sub">active</span>
              </div>
            </div>
          </div>
          <div className="task-legend">
            <div className="legend-item">
              <UserCheck size={14} color="#10b981" />
              <span>Active</span>
              <span className="legend-count">{overview.activeUsers}</span>
            </div>
            <div className="legend-item">
              <UserX size={14} color="#ef4444" />
              <span>Inactive</span>
              <span className="legend-count">{overview.inactiveUsers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="recent-section">
        <div className="section-header">
          <h3 className="chart-title">Recently Joined Users</h3>
          <a href="/manager/users" className="view-all">View all →</a>
        </div>
        <div className="recent-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Tasks</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      <div className="mini-avatar">
                        {(u.name || u.email)[0].toUpperCase()}
                      </div>
                      <span>{u.name || '—'}</span>
                    </div>
                  </td>
                  <td className="email-cell">{u.email}</td>
                  <td>{u._count.tasks}</td>
                  <td>
                    <span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="date-cell">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .dashboard { color: #e2e8f0; }

        .dashboard-loading, .dashboard-error {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          height: 300px;
          color: #64748b;
        }

        .spinner {
          width: 24px; height: 24px;
          border: 2px solid #1e2535;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .page-header {
          margin-bottom: 28px;
        }

        .page-title {
          font-size: 26px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 4px;
        }

        .page-subtitle {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: #161b27;
          border: 1px solid #1e2535;
          border-radius: 12px;
          padding: 20px;
        }

        .stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .stat-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .growth {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .growth.up { color: #10b981; background: rgba(16,185,129,0.1); }
        .growth.down { color: #ef4444; background: rgba(239,68,68,0.1); }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #64748b;
        }

        /* Charts */
        .charts-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        .chart-card {
          background: #161b27;
          border: 1px solid #1e2535;
          border-radius: 12px;
          padding: 20px;
        }

        .chart-title {
          font-size: 14px;
          font-weight: 600;
          color: #94a3b8;
          margin: 0 0 16px;
        }

        /* Bar chart */
        .bar-chart {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          height: 120px;
        }

        .bar-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }

        .bar-wrap {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
        }

        .bar {
          width: 100%;
          background: linear-gradient(to top, #6366f1, #8b5cf6);
          border-radius: 4px 4px 0 0;
          min-height: 4px;
          transition: height 0.3s;
        }

        .bar-label {
          font-size: 10px;
          color: #475569;
          margin-top: 4px;
        }

        .bar-count {
          font-size: 10px;
          color: #64748b;
        }

        /* Donut */
        .donut-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 12px;
        }

        .task-legend {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #94a3b8;
        }

        .legend-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
        }

        .legend-count {
          margin-left: auto;
          font-weight: 600;
          color: #e2e8f0;
        }

        /* User status ring */
        .user-status-visual {
          display: flex;
          justify-content: center;
          margin-bottom: 12px;
        }

        .status-ring {
          position: relative;
        }

        .ring-center {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .ring-pct {
          display: block;
          font-size: 20px;
          font-weight: 700;
          color: #f1f5f9;
        }

        .ring-sub {
          font-size: 10px;
          color: #64748b;
        }

        /* Recent users */
        .recent-section {
          background: #161b27;
          border: 1px solid #1e2535;
          border-radius: 12px;
          padding: 20px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .view-all {
          font-size: 13px;
          color: #6366f1;
          text-decoration: none;
        }

        .view-all:hover { text-decoration: underline; }

        .recent-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #1e2535;
        }

        td {
          padding: 12px;
          font-size: 13px;
          color: #94a3b8;
          border-bottom: 1px solid #0f1117;
        }

        tr:last-child td { border-bottom: none; }
        tr:hover td { background: rgba(255,255,255,0.02); }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mini-avatar {
          width: 28px; height: 28px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }

        .email-cell { color: #64748b; }
        .date-cell { color: #475569; font-size: 12px; }

        .status-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .status-badge.active {
          background: rgba(16,185,129,0.1);
          color: #10b981;
        }

        .status-badge.inactive {
          background: rgba(239,68,68,0.1);
          color: #ef4444;
        }

        @media (max-width: 900px) {
          .charts-row {
            grid-template-columns: 1fr;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

// ── Donut Chart SVG ───────────────────────────────────────────────────────────
function DonutChart({
  completed,
  pending,
  archived,
  total,
}: {
  completed: number;
  pending: number;
  archived: number;
  total: number;
}) {
  if (total === 0) {
    return (
      <svg viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="38" fill="none" stroke="#1e2535" strokeWidth="12" />
      </svg>
    );
  }

  const r = 38;
  const circ = 2 * Math.PI * r;

  const pctCompleted = completed / total;
  const pctPending = pending / total;

  const dashCompleted = pctCompleted * circ;
  const dashPending = pctPending * circ;

  return (
    <svg viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#1e2535" strokeWidth="12" />
      {/* archived */}
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke="#64748b"
        strokeWidth="12"
        strokeDasharray={`${circ} ${circ}`}
        strokeDashoffset={0}
        transform="rotate(-90 50 50)"
      />
      {/* pending */}
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke="#f59e0b"
        strokeWidth="12"
        strokeDasharray={`${dashCompleted + dashPending} ${circ}`}
        strokeDashoffset={0}
        transform="rotate(-90 50 50)"
      />
      {/* completed */}
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke="#10b981"
        strokeWidth="12"
        strokeDasharray={`${dashCompleted} ${circ}`}
        strokeDashoffset={0}
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="47" textAnchor="middle" fill="#f1f5f9" fontSize="14" fontWeight="700">{total}</text>
      <text x="50" y="58" textAnchor="middle" fill="#64748b" fontSize="8">tasks</text>
    </svg>
  );
}
