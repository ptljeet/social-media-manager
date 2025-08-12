// src/pages/AdminPostApprovals.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminSidebar from '../components/AdminSidebar';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const ASSET_BASE = process.env.REACT_APP_ASSET_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const buildMediaUrl = (media) => {
  if (!media) return '';
  if (/^https?:\/\//i.test(media)) return media;
  return `${ASSET_BASE}${String(media).startsWith('/') ? '' : '/'}${String(media).replace(/\\/g, '/')}`;
};

function Badge({ color = 'slate', children }) {
  const map = {
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ${map[color]}`}>
      {children}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white/90 border border-slate-200 rounded-2xl p-4 shadow-sm animate-pulse">
      <div className="h-36 w-full bg-slate-200 rounded-xl mb-3" />
      <div className="h-4 w-2/3 bg-slate-200 rounded mb-2" />
      <div className="h-3 w-4/5 bg-slate-200 rounded mb-1.5" />
      <div className="h-3 w-3/5 bg-slate-200 rounded" />
    </div>
  );
}

export default function AdminPostApprovals() {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [declinedPosts, setDeclinedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState('pending'); // 'pending' | 'approved' | 'declined'
  const [q, setQ] = useState('');

  const counts = {
    pending: pendingPosts.length,
    approved: approvedPosts.length,
    declined: declinedPosts.length,
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const [pending, approved, declined] = await Promise.all([
        api.get('/posts/status/pending'),
        api.get('/posts/status/approved'),
        api.get('/posts/status/declined'),
      ]);
      setPendingPosts(pending.data || []);
      setApprovedPosts(approved.data || []);
      setDeclinedPosts(declined.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const dataForTab = tab === 'pending' ? pendingPosts : tab === 'approved' ? approvedPosts : declinedPosts;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return dataForTab;
    return dataForTab.filter(
      (p) =>
        p?.title?.toLowerCase().includes(needle) ||
        p?.content?.toLowerCase().includes(needle) ||
        String(p?.platform || '').toLowerCase().includes(needle)
    );
  }, [dataForTab, q]);

  const handleApprove = async (postId) => {
    try {
      await api.post(`/posts/${postId}/approve`);
      toast.success('Post approved');
      fetchPosts();
    } catch {
      toast.error('Approval failed');
    }
  };

  const handleDecline = async (postId) => {
    if (!window.confirm('Decline this post?')) return;
    try {
      await api.post(`/posts/${postId}/decline`);
      toast.success('Post declined');
      fetchPosts();
    } catch {
      toast.error('Decline failed');
    }
  };

  const PostCard = ({ post, showActions }) => {
    const isVideo = /\.((mp4|webm|ogg))$/i.test(String(post.media || ''));
    const scheduled =
      post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : '—';
    const created = post.createdAt ? new Date(post.createdAt).toLocaleString() : '—';
    return (
      <div className="bg-white/90 border border-slate-200 rounded-2xl p-4 shadow-sm">
        {/* media */}
        {post.media ? (
          <div className="mb-3 overflow-hidden rounded-xl border">
            {isVideo ? (
              <video src={buildMediaUrl(post.media)} className="w-full h-40 object-cover" controls />
            ) : (
              <img src={buildMediaUrl(post.media)} alt="media" className="w-full h-40 object-cover" />
            )}
          </div>
        ) : (
          <div className="mb-3 rounded-xl border bg-slate-50 h-40 grid place-items-center text-slate-400 text-xs">
            No media
          </div>
        )}

        {/* title / content */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900 line-clamp-1">
            {post.title || 'Untitled'}
          </h3>
          <Badge color={post.status === 'approved' ? 'emerald' : post.status === 'declined' ? 'rose' : 'amber'}>
            {post.status || '—'}
          </Badge>
        </div>
        <p className="text-sm text-slate-700 mt-1 line-clamp-2">{post.content || '—'}</p>

        {/* meta */}
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div><span className="font-medium">Platform:</span> {post.platform || '—'}</div>
          <div><span className="font-medium">Scheduled:</span> {scheduled}</div>
          <div><span className="font-medium">Created:</span> {created}</div>
          {post.organizationName && (
            <div className="col-span-2">
              <span className="font-medium">Organization:</span> {post.organizationName}
            </div>
          )}
        </div>

        {/* actions */}
        {showActions && (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => handleApprove(post._id)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Approve
            </button>
            <button
              onClick={() => handleDecline(post._id)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
            >
              Decline
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8">
        <ToastContainer position="top-right" autoClose={2500} />

        {/* header */}
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider text-slate-500">Moderation</div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Post Approvals</h1>
        </div>

        {/* tabs + search */}
        <div className="bg-white/90 border border-slate-200 rounded-2xl shadow-sm p-3 md:p-4 mb-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1.5 rounded-lg border ${tab === 'pending' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white hover:bg-slate-50'}`}
                onClick={() => setTab('pending')}
              >
                Pending <span className="ml-1 text-xs opacity-80">({counts.pending})</span>
              </button>
              <button
                className={`px-3 py-1.5 rounded-lg border ${tab === 'approved' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-slate-50'}`}
                onClick={() => setTab('approved')}
              >
                Approved <span className="ml-1 text-xs opacity-80">({counts.approved})</span>
              </button>
              <button
                className={`px-3 py-1.5 rounded-lg border ${tab === 'declined' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white hover:bg-slate-50'}`}
                onClick={() => setTab('declined')}
              >
                Declined <span className="ml-1 text-xs opacity-80">({counts.declined})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title, content, platform…"
                className="border rounded-xl px-3 py-2 w-72"
              />
              <button
                onClick={() => setQ('')}
                className="h-10 px-3 rounded-lg border bg-white hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white/90 border border-slate-200 rounded-2xl shadow-sm p-8 text-center text-slate-500">
            No posts found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                showActions={tab === 'pending'}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
