import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Search,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit3,
  ToggleLeft,
  ToggleRight,
  Eye,
  X,
  Check,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem('token');

interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'USER' | 'MANAGER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { tasks: number; categories: number };
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Modal types ──
type ModalState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; user: User }
  | { type: 'view'; user: User }
  | { type: 'delete'; user: User };

export default function ManagerUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const searchTimeout = useRef<NodeJS.Timeout>();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy,
        sortOrder,
      });
      if (search) params.set('search', search);
      if (filterActive !== '') params.set('isActive', filterActive);
      if (filterRole !== '') params.set('role', filterRole);

      const res = await fetch(`${API_URL}/manager/users?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      setUsers(json.data || []);
      setMeta(json.meta || { total: 0, page: 1, limit: 10, totalPages: 0 });
    } catch {
      showToast('Failed to load users', false);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, search, filterActive, filterRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSearchChange = (val: string) => {
    clearTimeout(searchTimeout.current);
    setSearch(val);
    setPage(1);
  };

  const handleDelete = async (user: User) => {
    setActionLoading(user.id);
    try {
      const res = await fetch(`${API_URL}/manager/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      showToast('User deleted', true);
      setModal({ type: 'none' });
      fetchUsers();
    } catch {
      showToast('Failed to delete user', false);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`${API_URL}/manager/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      showToast('Status updated', true);
      fetchUsers();
    } catch {
      showToast('Failed to update status', false);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="users-page">
      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.ok ? 'toast-ok' : 'toast-err'}`}>
          {toast.ok ? <Check size={14} /> : <AlertTriangle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{meta.total} total users</p>
        </div>
        <button className="btn-primary" onClick={() => setModal({ type: 'create' })}>
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }}>
              <X size={14} />
            </button>
          )}
        </div>

        <button
          className={`btn-icon ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={15} />
          Filters
          {(filterActive !== '' || filterRole !== '') && (
            <span className="filter-badge" />
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Status</label>
            <select value={filterActive} onChange={(e) => { setFilterActive(e.target.value); setPage(1); }}>
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Role</label>
            <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}>
              <option value="">All</option>
              <option value="USER">User</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Sort by</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="createdAt">Joined date</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Order</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </div>
          {(filterActive !== '' || filterRole !== '') && (
            <button
              className="clear-filters"
              onClick={() => { setFilterActive(''); setFilterRole(''); setPage(1); }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="table-card">
        {loading ? (
          <div className="table-loading">
            <Loader2 size={24} className="spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="table-empty">No users found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Tasks</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar">{(u.name || u.email)[0].toUpperCase()}</div>
                      <div>
                        <div className="user-name">{u.name || '—'}</div>
                        <div className="user-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${u.role.toLowerCase()}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="center">{u._count.tasks}</td>
                  <td>
                    <button
                      className={`status-toggle ${u.isActive ? 'on' : 'off'}`}
                      onClick={() => handleToggleStatus(u.id)}
                      disabled={actionLoading === u.id}
                    >
                      {actionLoading === u.id ? (
                        <Loader2 size={14} className="spin" />
                      ) : u.isActive ? (
                        <><ToggleRight size={16} /> Active</>
                      ) : (
                        <><ToggleLeft size={16} /> Inactive</>
                      )}
                    </button>
                  </td>
                  <td className="date-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="action-btn view"
                        title="View"
                        onClick={() => setModal({ type: 'view', user: u })}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="action-btn edit"
                        title="Edit"
                        onClick={() => setModal({ type: 'edit', user: u })}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        className="action-btn delete"
                        title="Delete"
                        onClick={() => setModal({ type: 'delete', user: u })}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="pagination">
          <span className="pag-info">
            {(page - 1) * limit + 1}–{Math.min(page * limit, meta.total)} of {meta.total}
          </span>
          <div className="pag-btns">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - page) <= 2)
              .map((p) => (
                <button
                  key={p}
                  className={p === page ? 'pag-current' : ''}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {modal.type === 'create' && (
        <UserFormModal
          onClose={() => setModal({ type: 'none' })}
          onSuccess={() => { fetchUsers(); showToast('User created', true); }}
        />
      )}
      {modal.type === 'edit' && (
        <UserFormModal
          user={modal.user}
          onClose={() => setModal({ type: 'none' })}
          onSuccess={() => { fetchUsers(); showToast('User updated', true); }}
        />
      )}
      {modal.type === 'view' && (
        <UserViewModal
          user={modal.user}
          onClose={() => setModal({ type: 'none' })}
          onEdit={() => setModal({ type: 'edit', user: modal.user })}
        />
      )}
      {modal.type === 'delete' && (
        <ConfirmDeleteModal
          user={modal.user}
          loading={actionLoading === modal.user.id}
          onConfirm={() => handleDelete(modal.user)}
          onClose={() => setModal({ type: 'none' })}
        />
      )}

      <style>{`
        .users-page { color: #e2e8f0; }

        /* Toast */
        .toast {
          position: fixed;
          bottom: 24px; right: 24px;
          display: flex; align-items: center; gap: 8px;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          z-index: 1000;
          animation: slideIn 0.2s ease;
        }
        .toast-ok { background: rgba(16,185,129,0.15); border: 1px solid #10b981; color: #10b981; }
        .toast-err { background: rgba(239,68,68,0.15); border: 1px solid #ef4444; color: #ef4444; }
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

        /* Header */
        .page-header {
          display: flex; align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap; gap: 12px;
        }
        .page-title { font-size: 26px; font-weight: 700; color: #f1f5f9; margin: 0 0 4px; }
        .page-subtitle { color: #64748b; font-size: 14px; margin: 0; }

        /* Buttons */
        .btn-primary {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 16px;
          background: #6366f1; color: white;
          border: none; border-radius: 8px;
          font-size: 13px; font-weight: 600;
          cursor: pointer; transition: background 0.15s;
        }
        .btn-primary:hover { background: #4f46e5; }

        .btn-icon {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 14px;
          background: #161b27;
          border: 1px solid #1e2535;
          color: #94a3b8;
          border-radius: 8px;
          font-size: 13px; cursor: pointer;
          transition: all 0.15s;
          position: relative;
        }
        .btn-icon:hover, .btn-icon.active {
          border-color: #6366f1; color: #818cf8;
        }
        .filter-badge {
          position: absolute;
          top: -3px; right: -3px;
          width: 8px; height: 8px;
          background: #6366f1;
          border-radius: 50%;
        }

        /* Toolbar */
        .toolbar {
          display: flex; gap: 10px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .search-box {
          flex: 1; min-width: 200px;
          display: flex; align-items: center; gap: 10px;
          background: #161b27;
          border: 1px solid #1e2535;
          border-radius: 8px;
          padding: 0 12px;
          color: #64748b;
        }
        .search-box:focus-within {
          border-color: #6366f1;
        }
        .search-box input {
          flex: 1; background: none; border: none;
          color: #e2e8f0; font-size: 13px;
          padding: 10px 0; outline: none;
        }
        .search-box button {
          background: none; border: none;
          color: #64748b; cursor: pointer;
          display: flex;
        }

        /* Filters */
        .filter-panel {
          display: flex; flex-wrap: wrap; gap: 12px;
          background: #161b27;
          border: 1px solid #1e2535;
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 16px;
          align-items: flex-end;
        }
        .filter-group {
          display: flex; flex-direction: column; gap: 4px;
        }
        .filter-group label {
          font-size: 11px; color: #475569;
          font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .filter-group select {
          background: #0f1117;
          border: 1px solid #1e2535;
          color: #94a3b8;
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 13px;
          cursor: pointer;
          outline: none;
        }
        .clear-filters {
          background: none;
          border: 1px solid #ef4444;
          color: #ef4444;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 12px;
          cursor: pointer;
          height: fit-content;
        }

        /* Table */
        .table-card {
          background: #161b27;
          border: 1px solid #1e2535;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        .table-loading, .table-empty {
          display: flex; align-items: center; justify-content: center;
          padding: 60px; color: #475569; gap: 10px;
        }
        table { width: 100%; border-collapse: collapse; }
        th {
          text-align: left; padding: 10px 16px;
          font-size: 11px; font-weight: 600;
          color: #475569; text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #1e2535;
          background: #0f1117;
        }
        td {
          padding: 14px 16px;
          font-size: 13px; color: #94a3b8;
          border-bottom: 1px solid #0f1117;
          vertical-align: middle;
        }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: rgba(255,255,255,0.02); }

        .center { text-align: center; }
        .date-cell { color: #475569; font-size: 12px; }

        .user-cell { display: flex; align-items: center; gap: 12px; }
        .avatar {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: white;
          flex-shrink: 0;
        }
        .user-name { font-size: 13px; font-weight: 500; color: #e2e8f0; }
        .user-email { font-size: 12px; color: #475569; }

        .role-badge {
          padding: 2px 8px; border-radius: 4px;
          font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.03em;
        }
        .role-badge.user { background: rgba(59,130,246,0.1); color: #60a5fa; }
        .role-badge.manager { background: rgba(139,92,246,0.1); color: #a78bfa; }

        .status-toggle {
          display: flex; align-items: center; gap: 5px;
          background: none; border: 1px solid;
          border-radius: 5px; padding: 3px 8px;
          font-size: 11px; font-weight: 600;
          cursor: pointer; transition: all 0.15s;
        }
        .status-toggle.on { border-color: rgba(16,185,129,0.3); color: #10b981; }
        .status-toggle.off { border-color: rgba(100,116,139,0.3); color: #64748b; }

        .actions { display: flex; gap: 6px; }
        .action-btn {
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          background: none; border: 1px solid #1e2535;
          border-radius: 6px; cursor: pointer;
          transition: all 0.15s;
        }
        .action-btn.view { color: #60a5fa; }
        .action-btn.view:hover { background: rgba(59,130,246,0.1); border-color: #60a5fa; }
        .action-btn.edit { color: #f59e0b; }
        .action-btn.edit:hover { background: rgba(245,158,11,0.1); border-color: #f59e0b; }
        .action-btn.delete { color: #f87171; }
        .action-btn.delete:hover { background: rgba(239,68,68,0.1); border-color: #f87171; }

        /* Pagination */
        .pagination {
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 12px;
        }
        .pag-info { font-size: 12px; color: #475569; }
        .pag-btns { display: flex; gap: 4px; }
        .pag-btns button {
          width: 32px; height: 32px;
          background: #161b27;
          border: 1px solid #1e2535;
          color: #94a3b8; border-radius: 6px;
          font-size: 13px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .pag-btns button:disabled { opacity: 0.4; cursor: default; }
        .pag-btns button:not(:disabled):hover { border-color: #6366f1; color: #818cf8; }
        .pag-btns button.pag-current { background: #6366f1; border-color: #6366f1; color: white; }

        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── User Form Modal (Create/Edit) ─────────────────────────────────────────────
function UserFormModal({
  user,
  onClose,
  onSuccess,
}: {
  user?: User;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'USER',
    isActive: user?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.email) { setError('Email is required'); return; }
    if (!isEdit && !form.password) { setError('Password is required'); return; }

    setLoading(true);
    setError('');
    try {
      const body: any = {
        email: form.email,
        name: form.name || undefined,
        role: form.role,
        isActive: form.isActive,
      };
      if (form.password) body.password = form.password;

      const res = await fetch(
        `${API_URL}/manager/users${isEdit ? `/${user!.id}` : ''}`,
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Request failed');
      }

      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose} title={isEdit ? 'Edit User' : 'Add New User'}>
      <div className="form-grid">
        <FormField label="Full name">
          <input
            type="text"
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </FormField>
        <FormField label="Email *">
          <input
            type="email"
            placeholder="user@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </FormField>
        <FormField label={isEdit ? 'New password (leave blank to keep)' : 'Password *'}>
          <input
            type="password"
            placeholder="Min 6 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </FormField>
        <FormField label="Role">
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })}>
            <option value="USER">User</option>
            <option value="MANAGER">Manager</option>
          </select>
        </FormField>
        <FormField label="Status">
          <div className="toggle-row">
            <button
              type="button"
              className={`toggle-pill ${form.isActive ? 'on' : ''}`}
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
            >
              <span className="toggle-knob" />
            </button>
            <span>{form.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </FormField>
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <Loader2 size={14} className="spin" /> : null}
          {isEdit ? 'Save changes' : 'Create user'}
        </button>
      </div>

      <style>{formStyles}</style>
    </ModalWrapper>
  );
}

// ── User View Modal ─────────────────────────────────────────────────────────
function UserViewModal({
  user,
  onClose,
  onEdit,
}: {
  user: User;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <ModalWrapper onClose={onClose} title="User Details">
      <div className="view-grid">
        <div className="view-avatar">
          {(user.name || user.email)[0].toUpperCase()}
        </div>
        <ViewRow label="Name" value={user.name || '—'} />
        <ViewRow label="Email" value={user.email} />
        <ViewRow label="Role" value={user.role} />
        <ViewRow label="Status" value={user.isActive ? '✓ Active' : '✗ Inactive'} />
        <ViewRow label="Tasks" value={String(user._count.tasks)} />
        <ViewRow label="Categories" value={String(user._count.categories)} />
        <ViewRow label="Joined" value={new Date(user.createdAt).toLocaleString()} />
        <ViewRow label="Updated" value={new Date(user.updatedAt).toLocaleString()} />
      </div>
      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>Close</button>
        <button className="btn-primary" onClick={onEdit}>
          <Edit3 size={14} /> Edit
        </button>
      </div>
      <style>{formStyles}</style>
    </ModalWrapper>
  );
}

// ── Confirm Delete Modal ─────────────────────────────────────────────────────
function ConfirmDeleteModal({
  user,
  loading,
  onConfirm,
  onClose,
}: {
  user: User;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <ModalWrapper onClose={onClose} title="Delete User">
      <div className="confirm-body">
        <div className="confirm-icon">
          <AlertTriangle size={28} />
        </div>
        <p>
          Are you sure you want to delete <strong>{user.name || user.email}</strong>? This will also delete all their tasks and categories.
        </p>
      </div>
      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
          Delete
        </button>
      </div>
      <style>{formStyles}</style>
    </ModalWrapper>
  );
}

// ── Shared helpers ──────────────────────────────────────────────────────────
function ModalWrapper({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
      <style>{`
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center;
          z-index: 100; padding: 20px;
          backdrop-filter: blur(4px);
        }
        .modal-box {
          background: #161b27;
          border: 1px solid #1e2535;
          border-radius: 14px;
          width: 100%; max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          animation: pop 0.18s ease;
        }
        @keyframes pop { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .modal-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px 16px;
          border-bottom: 1px solid #1e2535;
        }
        .modal-head h3 { font-size: 16px; font-weight: 700; color: #f1f5f9; margin: 0; }
        .modal-close {
          background: none; border: none; color: #64748b;
          cursor: pointer; display: flex; padding: 4px;
        }
        .modal-close:hover { color: #94a3b8; }
        .modal-body { padding: 20px 24px; }
      `}</style>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function ViewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="view-row">
      <span className="vr-label">{label}</span>
      <span className="vr-value">{value}</span>
    </div>
  );
}

const formStyles = `
  .form-grid { display: flex; flex-direction: column; gap: 14px; margin-bottom: 16px; }
  .form-field { display: flex; flex-direction: column; gap: 6px; }
  .form-field label { font-size: 12px; font-weight: 600; color: #64748b; }
  .form-field input, .form-field select {
    background: #0f1117;
    border: 1px solid #1e2535;
    color: #e2e8f0;
    border-radius: 8px;
    padding: 9px 12px;
    font-size: 13px;
    outline: none;
    transition: border-color 0.15s;
  }
  .form-field input:focus, .form-field select:focus { border-color: #6366f1; }
  .toggle-row { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #94a3b8; }
  .toggle-pill {
    width: 40px; height: 22px;
    background: #1e2535;
    border: none; border-radius: 11px;
    cursor: pointer; position: relative;
    transition: background 0.2s;
    padding: 0;
  }
  .toggle-pill.on { background: #6366f1; }
  .toggle-knob {
    position: absolute;
    top: 3px; left: 3px;
    width: 16px; height: 16px;
    background: white; border-radius: 50%;
    transition: transform 0.2s;
    display: block;
  }
  .toggle-pill.on .toggle-knob { transform: translateX(18px); }
  .form-error {
    color: #f87171; font-size: 12px;
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 6px; padding: 8px 12px;
    margin-bottom: 12px;
  }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
  .btn-secondary {
    padding: 9px 16px; background: none;
    border: 1px solid #1e2535; color: #94a3b8;
    border-radius: 8px; font-size: 13px;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-secondary:hover { border-color: #475569; color: #e2e8f0; }
  .btn-primary {
    display: flex; align-items: center; gap: 6px;
    padding: 9px 16px; background: #6366f1; color: white;
    border: none; border-radius: 8px;
    font-size: 13px; font-weight: 600;
    cursor: pointer; transition: background 0.15s;
  }
  .btn-primary:hover:not(:disabled) { background: #4f46e5; }
  .btn-primary:disabled { opacity: 0.6; cursor: default; }
  .btn-danger {
    display: flex; align-items: center; gap: 6px;
    padding: 9px 16px; background: #ef4444; color: white;
    border: none; border-radius: 8px;
    font-size: 13px; font-weight: 600;
    cursor: pointer;
  }
  .btn-danger:hover:not(:disabled) { background: #dc2626; }
  .btn-danger:disabled { opacity: 0.6; cursor: default; }
  .view-grid { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
  .view-avatar {
    width: 56px; height: 56px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; font-weight: 700; color: white;
    margin-bottom: 8px;
  }
  .view-row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid #1e2535; }
  .view-row:last-child { border-bottom: none; }
  .vr-label { font-size: 12px; color: #475569; font-weight: 600; }
  .vr-value { font-size: 13px; color: #e2e8f0; text-align: right; }
  .confirm-body {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; gap: 12px; padding-bottom: 20px;
  }
  .confirm-icon { color: #f59e0b; }
  .confirm-body p { color: #94a3b8; font-size: 14px; line-height: 1.5; }
  .confirm-body strong { color: #f1f5f9; }
  .spin { animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;
