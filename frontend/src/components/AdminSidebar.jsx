// src/components/AdminSidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
      <nav className="space-y-2">
        <Link to="/admin/dashboard" className="block hover:text-green-400">Dashboard</Link>
        <Link to="/admin/users" className="block hover:text-green-400">Manage Users</Link>
        <Link to="/admin/teams" className="block hover:text-green-400">Manage Teams</Link>
        <Link to="/admin/approvals" className="block hover:text-green-400">Post Approvals</Link>
        <hr className="my-3 border-gray-700" />
        <Link to="/profile" className="block text-sm hover:text-blue-300">👤 Profile</Link>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="block text-left text-red-400 text-sm mt-2 hover:underline"
        >
          🔓 Logout
        </button>
      </nav>
    </aside>
  );
}
