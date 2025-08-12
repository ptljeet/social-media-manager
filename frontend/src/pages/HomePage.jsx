import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

function formatDate(dt) {
  const d = new Date(dt);
  return isNaN(+d)
    ? '—'
    : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [published, setPublished] = useState([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [loadingPublished, setLoadingPublished] = useState(true);
  const [errUpcoming, setErrUpcoming] = useState('');
  const [errPublished, setErrPublished] = useState('');

  // Load the current user from backend (and cache to localStorage)
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token');

        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const me = await res.json();

        if (!ignore) {
          setUser(me);
          localStorage.setItem('user', JSON.stringify(me));
        }
      } catch (_) {
        if (!ignore) setUser(null);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const displayName = useMemo(() => {
    if (!user) return 'there';
    if (user.firstName) return `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`;
    return user.name || user.email || 'there';
  }, [user]);

  // Fetch Upcoming Events: approved + scheduled in the future
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoadingUpcoming(true);
      setErrUpcoming('');
      try {
        const token = localStorage.getItem('token');
        const qs = new URLSearchParams({
          status: 'approved',
          fromNow: 'true',
          limit: '6',
          sort: 'scheduledAt:asc',
        });

        const res = await fetch(`http://localhost:5000/api/posts?${qs}`, {
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
        const data = await res.json();

        if (!ignore) setUpcoming(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!ignore) setErrUpcoming(e.message || 'Failed to load upcoming events.');
      } finally {
        if (!ignore) setLoadingUpcoming(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  // Fetch Recently Published: status = published (most recent first)
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoadingPublished(true);
      setErrPublished('');
      try {
        const token = localStorage.getItem('token');
        const qs = new URLSearchParams({
          status: 'published',
          limit: '6',
          sort: 'publishedAt:desc',
        });

        const res = await fetch(`http://localhost:5000/api/posts?${qs}`, {
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
        const data = await res.json();

        if (!ignore) setPublished(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!ignore) setErrPublished(e.message || 'Failed to load recent posts.');
      } finally {
        if (!ignore) setLoadingPublished(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const OrgCard = () => (
    <div className="bg-white p-4 rounded shadow flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">Organization</div>
        <div className="text-lg font-semibold">{user?.organizationName || '—'}</div>
        <div className="text-xs text-gray-500 mt-1">Your role: {user?.role || '—'}</div>
      </div>
      <div className="flex gap-2">
        <Link
          to="/post-composer"
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Create Post
        </Link>
        <Link
          to="/calendar"
          className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
        >
          Open Calendar
        </Link>
      </div>
    </div>
  );

  const CardsGrid = ({ items, emptyText }) => (
    items.length === 0 ? (
      <div className="bg-white p-6 rounded shadow text-gray-600">{emptyText}</div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((post) => {
          const mediaUrl = post.media ? `http://localhost:5000${post.media}` : null;
          return (
            <div key={post._id} className="bg-white p-3 rounded shadow">
              <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                {mediaUrl ? (
                  <img
                    src={mediaUrl}
                    alt="Post media"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No media
                  </div>
                )}
              </div>
              <p className="text-sm font-medium truncate">{post.title || 'Untitled'}</p>
              <p className="text-sm text-gray-700 line-clamp-2">{post.content || '—'}</p>
              <div className="text-xs text-gray-500 mt-1">
                Scheduled: {formatDate(post.scheduledAt)}
              </div>
              <Link
                to={`/posts/${post._id}`}
                className="text-sm text-blue-600 mt-2 inline-block"
              >
                View details
              </Link>
            </div>
          );
        })}
      </div>
    )
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Welcome, {displayName}!</h1>
          <Link to="/profile" className="group" aria-label="Profile">
            <div className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center cursor-pointer">
              {String(displayName).charAt(0).toUpperCase()}
            </div>
          </Link>
        </header>

        {/* Org + Quick Actions */}
        <section className="mb-6">
          <OrgCard />
        </section>

        {/* Upcoming Events */}
        <section className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
            <Link to="/calendar" className="text-sm text-blue-600">View calendar</Link>
          </div>

          {errUpcoming && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded p-3 mb-3">
              {errUpcoming}
            </div>
          )}

          {loadingUpcoming ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0,1,2].map(i => (
                <div key={i} className="bg-white p-3 rounded shadow animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-4/5 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <CardsGrid
              items={upcoming}
              emptyText="No upcoming approved posts for your organization."
            />
          )}
        </section>

        {/* Recently Published */}
        <section className="mb-2">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Recently Published</h2>
            <Link to="/posts" className="text-sm text-blue-600">View all posts</Link>
          </div>

          {errPublished && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded p-3 mb-3">
              {errPublished}
            </div>
          )}

          {loadingPublished ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0,1,2].map(i => (
                <div key={i} className="bg-white p-3 rounded shadow animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-4/5 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <CardsGrid
              items={published}
              emptyText="No recently published posts yet."
            />
          )}
        </section>
      </main>
    </div>
  );
}
