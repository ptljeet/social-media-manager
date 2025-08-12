// src/pages/ProfilePage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AppShell from '../components/AppShell';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardBody } from '../components/ui/Card';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function RoleBadge({ role }) {
  const color =
    String(role).toLowerCase() === 'admin' || String(role).toLowerCase() === 'super_admin'
      ? 'bg-indigo-50 text-indigo-700 ring-indigo-200'
      : 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ${color}`}>
      {role || '—'}
    </span>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
  });
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!ignore) {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
          setError('');
        }
      } catch (e) {
        if (!ignore) {
          setUser(null);
          setError('You are not logged in.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const initials = useMemo(() => getInitials(user?.name || user?.email || ''), [user]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <AppShell title="Profile" subtitle="Manage your account details.">
        <Card>
          <CardBody>
            <div className="animate-pulse">
              <div className="h-6 w-40 bg-slate-200 rounded mb-4" />
              <div className="flex gap-4">
                <div className="h-20 w-20 bg-slate-200 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-1/3 bg-slate-200 rounded" />
                  <div className="h-4 w-1/2 bg-slate-200 rounded" />
                  <div className="h-4 w-1/4 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell title="Profile" subtitle="Manage your account details.">
        <Card>
          <CardBody className="text-slate-700">
            {error || 'User not logged in.'}
            <div className="mt-4">
              <Button onClick={() => (window.location.href = '/login')}>Go to Login</Button>
            </div>
          </CardBody>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Profile"
      subtitle="Manage your account details."
      // Sidebar comes from AppShell by default; no need to add manually
      actions={<Button variant="danger" onClick={handleLogout}>Logout</Button>}
    >
      <Card className="max-w-3xl">
        <CardHeader
          title="Account"
          subtitle="Your personal details and organization information."
          right={<RoleBadge role={user.role} />}
        />
        <CardBody>
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl font-semibold text-slate-600">
                {initials}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Name</div>
                <div className="text-sm font-medium">{user.name || '—'}</div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Email</div>
                <div className="text-sm font-medium">{user.email || '—'}</div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Role</div>
                <div className="text-sm font-medium capitalize">{user.role || '—'}</div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Organization</div>
                <div className="text-sm font-medium">{user.organizationName || '—'}</div>
              </div>

              {user.createdAt && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Member Since</div>
                  <div className="text-sm font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )}

              {user.lastLogin && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Last Login</div>
                  <div className="text-sm font-medium">
                    {new Date(user.lastLogin).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => (window.location.href = '/post-composer')}>Create Post</Button>
            <Button variant="secondary" onClick={() => (window.location.href = '/calendar')}>Open Calendar</Button>
          </div>
        </CardBody>
      </Card>
    </AppShell>
  );
}
