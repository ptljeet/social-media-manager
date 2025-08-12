// src/pages/ManageUsers.jsx
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

function RoleBadge({ role }) {
  const r = String(role || '').toLowerCase();
  const styles =
    r === 'super_admin'
      ? 'bg-purple-50 text-purple-700 ring-purple-200'
      : r === 'admin'
      ? 'bg-indigo-50 text-indigo-700 ring-indigo-200'
      : r === 'editor'
      ? 'bg-amber-50 text-amber-700 ring-amber-200'
      : 'bg-emerald-50 text-emerald-700 ring-emerald-200'; // viewer / default
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

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/admin/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch users', err);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return users.filter((u) => {
      const matchesText =
        !needle ||
        u?.name?.toLowerCase().includes(needle) ||
        u?.email?.toLowerCase().includes(needle);
      const matchesRole = roleFilter === 'all' || String(u?.role || '').toLowerCase() === roleFilter;
      return matchesText && matchesRole;
    });
  }, [users, q, roleFilter]);

  const handleDelete = async (userId, role) => {
    const r = String(role || '').toLowerCase();
    if (r === 'super_admin' || r === 'admin') {
      return toast.info('Admin accounts are protected.');
    }
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await API.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8">
        <ToastContainer position="top-right" autoClose={2500} />

        {/* Header */}
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider text-slate-500">Organization</div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Manage Users</h1>
        </div>

        {/* Controls */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            Total:{' '}
            <span className="font-semibold text-slate-900">{users.length}</span>
            {filtered.length !== users.length && (
              <span className="ml-2 text-xs text-slate-500">(filtered: {filtered.length})</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name or email…"
              className="border rounded-xl px-3 py-2 w-64"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border rounded-xl px-3 py-2"
            >
              <option value="all">All roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <button
              onClick={() => { setQ(''); setRoleFilter('all'); }}
              className="h-10 px-3 rounded-lg border bg-white hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Table */}
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
                  filtered.map((user) => {
                    const r = String(user.role || '').toLowerCase();
                    const protectedRole = r === 'super_admin' || r === 'admin';
                    return (
                      <tr key={user._id} className="border-t">
                        <td className="p-3">
                          <div className="font-medium text-slate-900">{user.name || '—'}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-slate-700">{user.email || '—'}</div>
                        </td>
                        <td className="p-3">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="p-3">
                          {protectedRole ? (
                            <span className="text-slate-400 italic">Protected</span>
                          ) : (
                            <button
                              onClick={() => handleDelete(user._id, user.role)}
                              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-rose-600 text-white hover:bg-rose-700"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500">
                      No users found
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
