import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-4 space-y-4">
        <h2 className="text-xl font-bold text-green-600">SocialHub</h2>
        <nav className="space-y-2">
          {[
            { label: "Dashboard", to: "/home" },
            { label: "Calendar", to: "/calendar" },
            { label: "Inbox", to: "/inbox" },
            { label: "Publishing", to: "/publishing" },
            { label: "Listening", to: "/listening" },
            { label: "Reports", to: "/reports" },
            { label: "People", to: "/people" },
            { label: "Reviews", to: "/reviews" }
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="block text-gray-700 hover:text-green-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Welcome, Jeet!</h1>
          <Link to="/profile">
            <div className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center cursor-pointer">
              J
            </div>
          </Link>
        </header>

        {/* To Do / Approvals */}
        <section className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">To Do</h3>
            <p>📌 9 items</p>
            <a href="#" className="text-blue-500 text-sm">Go to Tasks</a>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Approvals</h3>
            <p>📝 14 pending</p>
            <a href="#" className="text-blue-500 text-sm">Open Approvals</a>
          </div>
        </section>

        {/* Recent Posts */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Recent Posts</h2>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((_, idx) => (
              <div key={idx} className="bg-white p-3 rounded shadow">
                <div className="aspect-video bg-gray-200 rounded mb-2" />
                <p className="text-sm">Post caption preview text here...</p>
                <a href="#" className="text-sm text-blue-600 mt-1 block">Engagements</a>
              </div>
            ))}
          </div>
        </section>

        {/* Engagement Graph Placeholder */}
        <section className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Engagement Overview</h2>
          <div className="w-full h-40 bg-gradient-to-r from-yellow-200 via-purple-200 to-teal-200 rounded" />
        </section>
      </main>
    </div>
  );
}
