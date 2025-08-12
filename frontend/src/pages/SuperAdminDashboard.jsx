// src/pages/SuperAdminDashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Pill({ children }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 ring-1 ring-slate-200">
      {children}
    </span>
  );
}

export default function SuperAdminDashboard() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }),
    []
  );

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/superadmin/organizations`, { headers });
      setOrganizations(res.data || []);
    } catch {
      toast.error('Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrganizations(); /* eslint-disable-next-line */ }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await axios.post(`${API_BASE}/superadmin/organizations`, formData, { headers });
      toast.success('Organization created successfully');
      setFormData({ name: '', domain: '', adminName: '', adminEmail: '', adminPassword: '' });
      fetchOrganizations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Creation failed');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteOrg = async () => {
    const id = deletingId;
    if (!id) return;
    try {
      await axios.delete(`${API_BASE}/superadmin/organizations/${id}`, { headers });
      toast.success('Deleted successfully');
      setDeletingId(null);
      fetchOrganizations();
    } catch {
      toast.error('Delete failed');
    }
  };

  const getAdminName = (org) => {
    if (org?.adminName) return org.adminName;
    const adminUser = (org?.users || []).find(u => {
      const r = String(u.role || '').toLowerCase();
      return r === 'admin' || r === 'super_admin';
    });
    return adminUser?.name || adminUser?.email || 'No admin';
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return organizations;
    return organizations.filter(o =>
      o.name?.toLowerCase().includes(q) ||
      o.domain?.toLowerCase().includes(q) ||
      getAdminName(o)?.toLowerCase().includes(q)
    );
  }, [organizations, query]);

  return (
    <div className="min-h-screen bg-slate-50">
      <ToastContainer />
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-50/70 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Super Admin</div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Organizations</h1>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="rounded-2xl bg-white ring-1 ring-slate-200 px-4 py-2 shadow-sm">
                <div className="text-xs text-slate-500">Total</div>
                <div className="text-lg font-semibold text-slate-900">{organizations.length}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Create Organization */}
        <section className="bg-white/90 backdrop-blur rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Create New Organization</h2>
            <p className="text-sm text-slate-500 mt-1">Provision an organization and its first admin.</p>
          </div>
          <form onSubmit={handleCreateOrg} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-600">Organization Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Acme Inc."
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-600">Domain</label>
                <input
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="acme.com"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-600">Admin Name</label>
                <input
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-600">Admin Email</label>
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="jane@acme.com"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-600">Admin Password</label>
                <input
                  type="password"
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center rounded-xl bg-emerald-600 text-white text-sm font-medium px-4 py-2 shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
              >
                {creating ? 'Creating…' : 'Create Organization'}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ name: '', domain: '', adminName: '', adminEmail: '', adminPassword: '' })}
                className="inline-flex items-center rounded-xl bg-white text-slate-700 text-sm font-medium px-4 py-2 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </form>
        </section>

        {/* List / Search */}
        <section className="bg-white/90 backdrop-blur rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">All Organizations</h2>
              <p className="text-sm text-slate-500">Search by name, domain, or admin.</p>
            </div>
            <div className="w-full md:w-80">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search organizations…"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="relative">
            <div className="max-h-[520px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-100/80 backdrop-blur z-10">
                  <tr className="text-left text-slate-600">
                    <th className="p-3 border-b border-slate-200">Name</th>
                    <th className="p-3 border-b border-slate-200">Domain</th>
                    <th className="p-3 border-b border-slate-200">Admin</th> {/* changed */}
                    <th className="p-3 border-b border-slate-200 w-32">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-slate-500">Loading…</td>
                    </tr>
                  )}

                  {!loading && filtered.map((org, idx) => (
                    <tr key={org._id} className={idx % 2 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-3 align-top">
                        <div className="font-medium text-slate-900">{org.name}</div>
                        <div className="mt-1 text-[11px] text-slate-500">{org._id}</div>
                      </td>
                      <td className="p-3 align-top">
                        <Pill>{org.domain}</Pill>
                      </td>
                      {/* Admin Name cell only */}
                      <td className="p-3 align-top">
                        <span className="text-sm font-medium text-slate-900">
                          {getAdminName(org)}
                        </span>
                      </td>
                      <td className="p-3 align-top">
                        <button
                          onClick={() => setDeletingId(org._id)}
                          className="inline-flex items-center rounded-lg bg-rose-600 text-white text-xs font-medium px-3 py-1.5 shadow-sm hover:bg-rose-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-slate-500">
                        No organizations found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Confirm Delete Dialog */}
      {deletingId && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900">Delete organization?</h3>
              <p className="mt-1 text-sm text-slate-600">
                This action cannot be undone. All related data may be removed.
              </p>
              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeletingId(null)}
                  className="inline-flex items-center rounded-xl bg-white text-slate-700 text-sm font-medium px-4 py-2 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteOrg}
                  className="inline-flex items-center rounded-xl bg-rose-600 text-white text-sm font-medium px-4 py-2 shadow-sm hover:bg-rose-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
