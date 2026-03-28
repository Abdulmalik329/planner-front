import { useEffect, useState } from 'react';
import { Save, User, Lock, Loader2, Check, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem('token');

export default function ManagerSettings() {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [profile, setProfile] = useState({
    name: storedUser.name || '',
    email: storedUser.email || '',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const showMsg = (
    setter: typeof setProfileMsg,
    ok: boolean,
    text: string
  ) => {
    setter({ ok, text });
    setTimeout(() => setter(null), 4000);
  };

  const handleProfileSave = async () => {
    setProfileLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/me/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: profile.name, email: profile.email }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Update failed');
      }

      const updated = await res.json();
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...updated }));
      showMsg(setProfileMsg, true, 'Profile updated successfully');
    } catch (e: any) {
      showMsg(setProfileMsg, false, e.message || 'Update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    if (passwords.newPass !== passwords.confirm) {
      showMsg(setPasswordMsg, false, 'Passwords do not match');
      return;
    }
    if (passwords.newPass.length < 6) {
      showMsg(setPasswordMsg, false, 'Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/me/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.newPass,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to change password');
      }

      setPasswords({ current: '', newPass: '', confirm: '' });
      showMsg(setPasswordMsg, true, 'Password changed successfully');
    } catch (e: any) {
      showMsg(setPasswordMsg, false, e.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your manager account</p>
      </div>

      <div className="settings-grid">
        {/* Profile section */}
        <div className="settings-card">
          <div className="card-header">
            <div className="card-icon"><User size={16} /></div>
            <h3>Profile Information</h3>
          </div>

          <div className="form-fields">
            <div className="form-field">
              <label>Display Name</label>
              <input
                type="text"
                placeholder="Your full name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
          </div>

          {profileMsg && (
            <div className={`msg ${profileMsg.ok ? 'ok' : 'err'}`}>
              {profileMsg.ok ? <Check size={13} /> : <AlertTriangle size={13} />}
              {profileMsg.text}
            </div>
          )}

          <button className="save-btn" onClick={handleProfileSave} disabled={profileLoading}>
            {profileLoading ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
            Save Profile
          </button>
        </div>

        {/* Password section */}
        <div className="settings-card">
          <div className="card-header">
            <div className="card-icon purple"><Lock size={16} /></div>
            <h3>Change Password</h3>
          </div>

          <div className="form-fields">
            <div className="form-field">
              <label>Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={passwords.newPass}
                onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="Repeat new password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />
            </div>
          </div>

          {passwordMsg && (
            <div className={`msg ${passwordMsg.ok ? 'ok' : 'err'}`}>
              {passwordMsg.ok ? <Check size={13} /> : <AlertTriangle size={13} />}
              {passwordMsg.text}
            </div>
          )}

          <button className="save-btn purple-btn" onClick={handlePasswordSave} disabled={passwordLoading}>
            {passwordLoading ? <Loader2 size={14} className="spin" /> : <Lock size={14} />}
            Change Password
          </button>
        </div>

        {/* Info card */}
        <div className="settings-card info-card">
          <div className="card-header">
            <div className="card-icon green" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              <User size={16} />
            </div>
            <h3>Account Info</h3>
          </div>
          <div className="info-rows">
            <div className="info-row">
              <span className="ir-label">Role</span>
              <span className="ir-value role-badge">MANAGER</span>
            </div>
            <div className="info-row">
              <span className="ir-label">User ID</span>
              <span className="ir-value id-val">{storedUser.id || '—'}</span>
            </div>
            <div className="info-row">
              <span className="ir-label">Account status</span>
              <span className="ir-value status-active">Active</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .settings-page { color: #e2e8f0; }
        .page-header { margin-bottom: 28px; }
        .page-title { font-size: 26px; font-weight: 700; color: #f1f5f9; margin: 0 0 4px; }
        .page-subtitle { color: #64748b; font-size: 14px; margin: 0; }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .settings-card {
          background: #161b27;
          border: 1px solid #1e2535;
          border-radius: 12px;
          padding: 24px;
        }

        .card-header {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 20px;
        }

        .card-icon {
          width: 36px; height: 36px;
          background: rgba(99,102,241,0.1); color: #818cf8;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .card-icon.purple { background: rgba(139,92,246,0.1); color: #a78bfa; }

        .card-header h3 { font-size: 15px; font-weight: 700; color: #f1f5f9; margin: 0; }

        .form-fields { display: flex; flex-direction: column; gap: 14px; margin-bottom: 16px; }
        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-field label { font-size: 12px; font-weight: 600; color: #64748b; }
        .form-field input {
          background: #0f1117;
          border: 1px solid #1e2535;
          color: #e2e8f0;
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s;
        }
        .form-field input:focus { border-color: #6366f1; }

        .msg {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 12px; border-radius: 6px;
          font-size: 12px; margin-bottom: 14px;
        }
        .msg.ok { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: #10b981; }
        .msg.err { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; }

        .save-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 18px;
          background: #6366f1; color: white;
          border: none; border-radius: 8px;
          font-size: 13px; font-weight: 600;
          cursor: pointer; transition: background 0.15s;
        }
        .save-btn:hover:not(:disabled) { background: #4f46e5; }
        .save-btn:disabled { opacity: 0.6; cursor: default; }
        .save-btn.purple-btn { background: #8b5cf6; }
        .save-btn.purple-btn:hover:not(:disabled) { background: #7c3aed; }

        .info-rows { display: flex; flex-direction: column; gap: 0; }
        .info-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #1e2535;
        }
        .info-row:last-child { border-bottom: none; }
        .ir-label { font-size: 13px; color: #64748b; }
        .ir-value { font-size: 13px; color: #e2e8f0; }
        .id-val { font-family: monospace; font-size: 11px; color: #475569; }
        .role-badge {
          background: rgba(139,92,246,0.1); color: #a78bfa;
          padding: 2px 8px; border-radius: 4px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.05em;
        }
        .status-active {
          background: rgba(16,185,129,0.1); color: #10b981;
          padding: 2px 8px; border-radius: 4px;
          font-size: 11px; font-weight: 700;
        }

        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
