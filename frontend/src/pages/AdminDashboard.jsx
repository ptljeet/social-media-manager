// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import { Link } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    pendingPosts: 0,
    organizationName: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/admin/stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!ignore) {
          setStats({
            totalUsers: res.data.totalUsers || 0,
            totalPosts: res.data.totalPosts || 0,
            pendingPosts: res.data.pendingPosts || 0,
            organizationName: res.data.organizationName || 'Unknown Organization',
          });
        }
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const StatCard = ({ title, value, icon, accent = 'emerald' }) => (
    <div className="bg-white/90 backdrop-blur rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-500">{title}</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{loading ? '—' : value}</div>
        </div>
        <div className={`h-10 w-10 rounded-xl grid place-items-center text-xl bg-${accent}-50 text-${accent}-600 border border-${accent}-100`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const SkeletonCard = () => (
    <div className="bg-white/90 rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="animate-pulse space-y-3">
        <div className="h-3 w-24 bg-slate-200 rounded" />
        <div className="h-8 w-20 bg-slate-200 rounded" />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8">
        {/* Page header */}
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider text-slate-500">Organization</div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            {stats.organizationName} <span className="text-slate-400">• Admin</span>
          </h1>
        </div>

        {/* Quick actions */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            to="/admin/invite-users"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
          >
            ➕ Invite Users
          </Link>
          <Link
            to="/admin/approvals"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            ✅ Review Pending Posts
          </Link>
          <Link
            to="/admin/manage-users"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            👥 Manage Users
          </Link>
        </div>

        {/* Stats grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <StatCard title="Total Users" value={stats.totalUsers} icon="👥" accent="emerald" />
              <StatCard title="Total Posts" value={stats.totalPosts} icon="📝" accent="indigo" />
              <StatCard title="Pending Requests" value={stats.pendingPosts} icon="⏳" accent="amber" />
            </>
          )}
        </section>

        {/* Recent section (placeholder you can wire later) */}
        <section className="mt-8">
          <div className="bg-white/90 rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
              <Link to="/admin/approvals" className="text-sm text-indigo-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="text-sm text-slate-500">
              {loading ? 'Loading…' : 'No recent activity to display.'}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
