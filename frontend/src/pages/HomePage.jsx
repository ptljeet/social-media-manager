import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardBody } from '../components/ui/Card';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const ASSET_BASE = process.env.REACT_APP_ASSET_URL || 'http://localhost:5000';

const buildMediaUrl = (media) => {
  if (!media) return '';
  if (/^https?:\/\//i.test(media)) return media;
  return `${ASSET_BASE}${String(media).replace(/\\/g, '/').startsWith('/') ? '' : '/'}${String(media).replace(/\\/g, '/')}`;
};

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

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token');
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const me = await res.json();
        if (!ignore) {
          setUser(me);
          localStorage.setItem('user', JSON.stringify(me));
        }
      } catch {
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

  // Upcoming (approved & future)
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoadingUpcoming(true); setErrUpcoming('');
      try {
        const token = localStorage.getItem('token');
        const qs = new URLSearchParams({
          status: 'approved', fromNow: 'true', limit: '6', sort: 'scheduledAt:asc',
        });
        const res = await fetch(`${API_BASE}/posts?${qs}`, {
          headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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

  // Recently published
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoadingPublished(true); setErrPublished('');
      try {
        const token = localStorage.getItem('token');
        const qs = new URLSearchParams({ status: 'published', limit: '6', sort: 'publishedAt:desc' });
        const res = await fetch(`${API_BASE}/posts?${qs}`, {
          headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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
    <Card className="mb-6">
      <CardHeader
        title="Organization"
        subtitle="Your current organization and quick actions"
        right={
          <div className="flex gap-2">
            <Link to="/post-composer"><Button>Create Post</Button></Link>
            <Link to="/calendar"><Button variant="secondary">Open Calendar</Button></Link>
          </div>
        }
      />
      <CardBody>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-slate-500">Name</div>
            <div className="text-lg font-semibold">{user?.organizationName || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Role</div>
            <div className="text-lg font-semibold capitalize">{user?.role || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">User</div>
            <div className="text-lg font-semibold">{displayName}</div>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const CardsGrid = ({ items, emptyText }) => (
    items.length === 0 ? (
      <Card><CardBody><div className="text-slate-600">{emptyText}</div></CardBody></Card>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((post) => {
          const mediaUrl = buildMediaUrl(post.media);
          return (
            <Card key={post._id}>
              <CardBody className="p-0">
                <div className="aspect-video bg-slate-100 rounded-t-2xl overflow-hidden">
                  {mediaUrl ? (
                    <img src={mediaUrl} alt="Post media" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">No media</div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold truncate">{post.title || 'Untitled'}</p>
                  <p className="text-sm text-slate-700 line-clamp-2">{post.content || '—'}</p>
                  <div className="text-xs text-slate-500 mt-1">Scheduled: {formatDate(post.scheduledAt)}</div>
                  <Link to={`/posts/${post._id}`} className="text-sm text-indigo-600 mt-2 inline-block">View details</Link>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    )
  );

  return (
    <AppShell
      title={`Welcome, ${displayName}!`}
      subtitle="Here’s a snapshot of what’s coming up and what just went live."
    >
      <OrgCard />

      {/* Upcoming */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Upcoming Events</h2>
          <Link to="/calendar" className="text-sm text-indigo-600">View calendar</Link>
        </div>
        {errUpcoming && (
          <Card className="mb-3"><CardBody><div className="text-rose-700">{errUpcoming}</div></CardBody></Card>
        )}
        {loadingUpcoming ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[0,1,2].map(i => (
              <Card key={i}><CardBody>
                <div className="aspect-video bg-slate-200 rounded mb-3 animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-4/5 mb-2 animate-pulse" />
                <div className="h-3 bg-slate-200 rounded w-2/3 animate-pulse" />
              </CardBody></Card>
            ))}
          </div>
        ) : (
          <CardsGrid items={upcoming} emptyText="No upcoming approved posts for your organization." />
        )}
      </div>

      {/* Recently Published */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recently Published</h2>
          <Link to="/posts" className="text-sm text-indigo-600">View all posts</Link>
        </div>
        {errPublished && (
          <Card className="mb-3"><CardBody><div className="text-rose-700">{errPublished}</div></CardBody></Card>
        )}
        {loadingPublished ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[0,1,2].map(i => (
              <Card key={i}><CardBody>
                <div className="aspect-video bg-slate-200 rounded mb-3 animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-4/5 mb-2 animate-pulse" />
                <div className="h-3 bg-slate-200 rounded w-2/3 animate-pulse" />
              </CardBody></Card>
            ))}
          </div>
        ) : (
          <CardsGrid items={published} emptyText="No recently published posts yet." />
        )}
      </div>
    </AppShell>
  );
}
