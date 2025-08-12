// src/pages/InviteUsers.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});
API.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

/* ---------- small UI helpers ---------- */
function RoleBadge({ role }) {
  const r = String(role || '').toLowerCase();
  const styles =
    r === 'super_admin'
      ? 'bg-purple-50 text-purple-700 ring-purple-200'
      : r === 'admin'
      ? 'bg-indigo-50 text-indigo-700 ring-indigo-200'
      : r === 'editor'
      ? 'bg-amber-50 text-amber-700 ring-amber-200'
      : 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ${styles}`}>
      {role || 'viewer'}
    </span>
  );
}
function SkeletonRow() {
  return (
    <tr className="border-t">
      <td className="p-2"><div className="h-3 w-40 bg-slate-200 rounded animate-pulse" /></td>
      <td className="p-2"><div className="h-3 w-56 bg-slate-200 rounded animate-pulse" /></td>
      <td className="p-2"><div className="h-5 w-20 bg-slate-200 rounded animate-pulse" /></td>
      <td className="p-2"><div className="h-8 w-20 bg-slate-200 rounded animate-pulse" /></td>
    </tr>
  );
}

/* ---------- page ---------- */
export default function InviteUsers() {
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [copying, setCopying] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/admin/users'); // same data source as Manage Users
      setMembers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchMembers(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m?.name?.toLowerCase().includes(q) ||
        m?.email?.toLowerCase().includes(q) ||
        String(m?.role || '').toLowerCase().includes(q)
    );
  }, [members, search]);

  const handleCreateInvite = async () => {
    try {
      setCreating(true);
      const { data } = await API.post('/invitations/create', {
        role: 'viewer',               // fixed role
        email: inviteEmail || undefined, // optional prefill
      });
      if (!data?.inviteUrl) throw new Error('Invite URL not returned');
      setInviteUrl(data.inviteUrl);
      await navigator.clipboard.writeText(data.inviteUrl);
      toast.success('Invite link created & copied to clipboard');
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Failed to create invite link');
    } finally {
      setCreating(false);
    }
  };

  const copyInviteAgain = async () => {
    if (!inviteUrl) return;
    try {
      setCopying(true);
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('Invite link copied');
    } catch {
      toast.error('Could not copy link');
    } finally {
      setCopying(false);
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Remove this user?')) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      toast.success('User removed');
      fetchMembers();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Failed to remove user');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8">
        <ToastContainer position="top-right" autoClose={3000} />

        {/* Header */}
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider text-slate-500">Organization</div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Invite Users</h1>
        </div>

        {/* Invite link card (alignment fix applied) */}
        <div className="bg-white/90 backdrop-blur rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
          <label className="block text-sm font-medium mb-1">Prefill Email (optional)</label>

          {/* Make input & button same height and center-aligned on desktop */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="email"
              placeholder="name@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 h-10 border rounded-xl px-3"
            />
            <button
              onClick={handleCreateInvite}
              disabled={creating}
              className="h-10 px-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {creating ? 'Generating…' : 'Copy Invite Link'}
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            The invite opens a 7‑day token for your org with <b>viewer</b> role.
          </p>

          {inviteUrl && (
            <div className="mt-4">
              <label className="block text-xs uppercase tracking-wide text-slate-500 mb-1">
                Latest Invite Link
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 overflow-hidden">
                  <div className="truncate">{inviteUrl}</div>
                </div>
                <button
                  onClick={copyInviteAgain}
                  disabled={copying}
                  className="h-9 px-3 rounded-lg border bg-white hover:bg-slate-50 disabled:opacity-60"
                  title="Copy again"
                >
                  {copying ? 'Copying…' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Members: header row */}
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            Members:{' '}
            <span className="font-semibold text-slate-900">{members.length}</span>
            {filtered.length !== members.length && (
              <span className="ml-2 text-xs text-slate-500">(filtered: {filtered.length})</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, role…"
              className="border rounded-xl px-3 py-2 w-64"
            />
            <button
              onClick={() => setSearch('')}
              className="h-9 px-3 rounded-lg border bg-white hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Members table */}
        <div className="bg-white/90 backdrop-blur rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="p-3 text-left font-semibold">Name</th>
                  <th className="p-3 text-left font-semibold">Email</th>
                  <th className="p-3 text-left font-semibold">Role</th>
                  <th className="p-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : filtered.length ? (
                  filtered.map((m) => {
                    const r = String(m.role || '').toLowerCase();
                    const protectedRole = r === 'super_admin' || r === 'admin';
                    return (
                      <tr key={m._id} className="border-t">
                        <td className="p-3">
                          <div className="font-medium text-slate-900">{m.name || '—'}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-slate-700">{m.email || '—'}</div>
                        </td>
                        <td className="p-3">
                          <RoleBadge role={m.role} />
                        </td>
                        <td className="p-3">
                          {protectedRole ? (
                            <span className="text-slate-400 italic">Protected</span>
                          ) : (
                            <button
                              onClick={() => handleRemove(m._id)}
                              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-rose-600 text-white hover:bg-rose-700"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500">
                      No members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
