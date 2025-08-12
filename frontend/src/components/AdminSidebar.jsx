// src/components/AdminSidebar.jsx
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getUser } from '../util/auth';

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'A';
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'A';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AdminSidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getUser());

  useEffect(() => {
    const onStorage = () => setUser(getUser());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const initials = getInitials(user?.name || user?.email || 'Admin');

  const menu = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'Manage Users', path: '/admin/manage-users', icon: '👥' },
    { label: 'Post Approvals', path: '/admin/approvals', icon: '✅' },
    { label: 'Profile', path: '/admin/profile', icon: '👤' }, // ← admin profile route
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 sticky top-0 h-screen bg-gray-950 text-gray-100 border-r border-gray-800">
      {/* Brand */}
      <div className="h-16 px-4 flex items-center border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500 text-gray-900 grid place-items-center text-lg font-bold">A</div>
          <div>
            <div className="text-sm font-semibold tracking-tight">Admin Panel</div>
            <div className="text-[11px] text-gray-400">SocialHub</div>
          </div>
        </div>
      </div>

      {/* User capsule */}
      <div className="px-4 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gray-900 border border-gray-800 grid place-items-center text-sm font-semibold text-gray-300">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{user?.name || user?.email || 'Admin User'}</div>
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-900/40 text-indigo-300 ring-1 ring-indigo-800">
                Admin
              </span>
              {user?.organizationName && <span className="truncate text-[11px]">{user.organizationName}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3">
        <ul className="space-y-1">
          <li className="px-2 py-1 text-[11px] uppercase tracking-wider text-gray-500">Management</li>
          {menu.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  [
                    'group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition',
                    isActive ? 'bg-gray-800 text-emerald-300 ring-1 ring-gray-700'
                             : 'text-gray-300 hover:bg-gray-900 hover:text-white',
                  ].join(' ')
                }
              >
                <span className="text-base">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-300 bg-rose-900/30 ring-1 ring-rose-800 hover:bg-rose-900/50 transition"
        >
          <span>🔓</span>
          <span>Logout</span>
        </button>
        <div className="mt-3 text-[11px] text-gray-500 text-center">
          Admin • v1.0 • {new Date().getFullYear()}
        </div>
      </div>
    </aside>
  );
}
