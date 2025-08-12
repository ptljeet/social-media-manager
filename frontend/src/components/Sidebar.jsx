// src/components/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'U';
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
  });

  useEffect(() => {
    const onStorage = () => {
      try { setUser(JSON.parse(localStorage.getItem('user')) || null); } catch {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const menu = [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Calendar', path: '/calendar', icon: '🗓️' },
    { label: 'Post Composer', path: '/post-composer', icon: '✍️' },
    { label: 'Profile', path: '/profile', icon: '👤' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const initials = getInitials(user?.name || user?.email || 'User');

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 shrink-0 border-r bg-white/80 backdrop-blur sticky top-0 h-screen">
      {/* Brand */}
      <div className="h-16 px-4 flex items-center border-b">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white grid place-items-center text-lg font-bold">S</div>
          <div>
            <div className="text-sm font-semibold tracking-tight">SocialHub</div>
            <div className="text-[11px] text-slate-500">Manage & Schedule</div>
          </div>
        </div>
      </div>

      {/* User capsule */}
      <div className="px-4 py-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 grid place-items-center text-sm font-semibold text-slate-600">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{user?.name || user?.email || 'User'}</div>
            <div className="text-xs text-slate-500 truncate">
              {user?.organizationName || 'No organization'}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3">
        <ul className="space-y-1">
          {menu.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  [
                    'group flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition',
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'text-slate-700 hover:bg-slate-50'
                  ].join(' ')
                }
              >
                <span className="text-base">{item.icon}</span>
                <span className="truncate">{item.label}</span>
                <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500 opacity-0 group-[.active]:opacity-100" />
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer actions */}
      <div className="p-3 border-t">
        <button
          onClick={handleLogout}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition"
        >
          <span>🔓</span>
          <span>Logout</span>
        </button>
        <div className="mt-3 text-[11px] text-slate-400 text-center">
          v1.0 • {new Date().getFullYear()}
        </div>
      </div>
    </aside>
  );
}
