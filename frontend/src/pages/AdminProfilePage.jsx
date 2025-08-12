// src/pages/AdminProfilePage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function AdminProfilePage() {
  const [me, setMe] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
  });
  const [loading, setLoading] = useState(!me);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setMe(data);
        localStorage.setItem('user', JSON.stringify(data));
      } catch {
        setMe(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider text-slate-500">Account</div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Admin Profile</h1>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">Loading…</div>
        ) : !me ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">Not signed in.</div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-500">Name</div>
                <div className="font-medium text-slate-900">{me.name || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Email</div>
                <div className="font-medium text-slate-900">{me.email || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Role</div>
                <div className="font-medium text-slate-900 capitalize">{me.role || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Organization</div>
                <div className="font-medium text-slate-900">{me.organizationName || '—'}</div>
              </div>
            </div>

            <button
              onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
              className="mt-6 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700"
            >
              Logout
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
