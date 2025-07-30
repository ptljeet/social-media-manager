import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Calendar', path: '/calendar' },
    { label: 'Publishing', path: '/publishing' },
    { label: 'Reports', path: '/reports' },
    { label: 'People', path: '/people' },
    { label: 'Profile', path: '/profile' },
    { label: 'Post Composer', path: '/post-composer' } // ✅ Added new item
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white border-r p-4 space-y-4 min-h-screen">
      <h2 className="text-xl font-bold text-green-600">SocialHub</h2>
      <nav className="space-y-2">
        {menuItems.map(item => (
          <a
            key={item.label}
            href={item.path}
            className={`block px-3 py-2 rounded ${
              location.pathname === item.path
                ? 'bg-gray-200 text-green-600 font-semibold'
                : 'text-gray-700 hover:text-green-600'
            }`}
          >
            {item.label}
          </a>
        ))}

        <hr className="my-3" />

        <button
          onClick={handleLogout}
          className="w-full text-left text-red-600 hover:underline text-sm mt-2"
        >
          🔓 Logout
        </button>
      </nav>
    </aside>
  );
}
