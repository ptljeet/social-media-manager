import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    pendingPosts: 0,
    organizationName: '',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        // Backend should send organizationName in the response
        setStats((prev) => ({
          ...prev,
          totalUsers: res.data.totalUsers,
          totalPosts: res.data.totalPosts,
          pendingPosts: res.data.pendingPosts,
          organizationName: res.data.organizationName || 'Unknown Organization',
        }));
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6">
        {/* Organization Name */}
        <h1 className="text-3xl font-bold mb-2">{stats.organizationName} Organization</h1>
        <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded shadow text-center">
            <h3 className="text-xl font-semibold mb-2">Total Users</h3>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <h3 className="text-xl font-semibold mb-2">Total Posts</h3>
            <p className="text-3xl font-bold">{stats.totalPosts}</p>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <h3 className="text-xl font-semibold mb-2">Pending Requests</h3>
            <p className="text-3xl font-bold">{stats.pendingPosts}</p>
          </div>
        </div>

        <Link
          to="/admin/invite-users"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Go to Invite Users
        </Link>
      </main>
    </div>
  );
}
