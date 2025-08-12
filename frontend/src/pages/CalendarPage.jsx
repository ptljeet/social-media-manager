// src/pages/CalendarPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  startOfWeek,
  addDays
} from 'date-fns';
import Sidebar from '../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ASSET_BASE = process.env.REACT_APP_ASSET_URL || 'http://localhost:5000';

function buildMediaUrl(media) {
  if (!media) return '';
  // if backend already sent absolute URL, keep it
  if (/^https?:\/\//i.test(media)) return media;
  // normalize windows backslashes just in case
  const clean = String(media).replace(/\\/g, '/');
  return `${ASSET_BASE}${clean.startsWith('/') ? '' : '/'}${clean}`;
}


const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [posts, setPosts] = useState([]);
  const [viewMode, setViewMode] = useState('month');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newPostData, setNewPostData] = useState({
    title: '',
    content: '',
    platform: '',
    scheduledAt: '',
    status: 'pending'
  });

  // Derive a stable key for the visible month range so the effect deps are simple
  const period = useMemo(() => {
    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
    return { start, end, key: `${start}|${end}` };
  }, [currentMonth]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/posts/calendar?startDate=${period.start}&endDate=${period.end}&status=approved`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        if (!cancelled) setPosts(res.data);
      } catch {
        if (!cancelled) toast.error('Failed to load calendar posts');
      }
    })();
    return () => { cancelled = true; };
  }, [period.key]); // depends only on our memoized key

  const getPostsByDate = (dateStr) =>
    posts.filter(p => format(new Date(p.scheduledAt), 'yyyy-MM-dd') === dateStr);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', newPostData.title);
      formData.append('content', newPostData.content);
      formData.append('platform', newPostData.platform);
      formData.append('scheduledAt', newPostData.scheduledAt);
      formData.append('status', newPostData.status);

      await axios.post(`${API_BASE}/posts`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      toast.success('Post created successfully');
      setShowCreateModal(false);
      setNewPostData({ title: '', content: '', platform: '', scheduledAt: '', status: 'pending' });
      // refresh current period
      const res = await axios.get(
        `${API_BASE}/posts/calendar?startDate=${period.start}&endDate=${period.end}&status=approved`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setPosts(res.data);
    } catch (err) {
      console.error('POST ERROR:', err);
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const renderGrid = (dates) => (
    <>
      <div className="grid grid-cols-7 gap-2 text-sm mb-2">
        {days.map((day) => (
          <div key={day} className="font-medium text-center">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 text-sm">
        {dates.map((date, i) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const postsOnDay = getPostsByDate(dateStr);
          return (
            <div key={i} className="bg-white p-2 rounded border min-h-[100px]">
              <div className="text-xs text-gray-400 mb-1">{format(date, 'MMM d')}</div>
              {postsOnDay.length === 0 ? (
                <p className="text-gray-300 italic text-xs text-center">No posts</p>
              ) : (
                postsOnDay.map((post, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => { setSelectedPost(post); setShowModal(true); }}
                    className="w-full text-left bg-gray-50 p-2 rounded mb-2 border hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <div className="text-[10px] text-gray-500">
                      {format(new Date(post.scheduledAt), 'h:mm a')}
                    </div>
                    <div className="text-xs font-medium truncate">
                      {post.title || post.content}
                    </div>
                    <div className="text-[10px] text-purple-600 font-semibold text-right">
                      {post.engagement || 0}% engagement
                    </div>
                  </button>
                ))
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  const renderView = () => {
    const base = startOfWeek(startOfMonth(currentMonth));
    const range = viewMode === 'week' ? 7 : 35;
    const dates = [...Array(range)].map((_, i) => addDays(base, i));
    return renderGrid(dates);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 overflow-auto relative">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentMonth(new Date())} className="px-2 py-1 border rounded text-sm">Today</button>
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="px-2 py-1 border rounded text-sm">←</button>
            <h1 className="text-xl font-semibold">{format(currentMonth, 'MMMM yyyy')}</h1>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="px-2 py-1 border rounded text-sm">→</button>
          </div>
          <div className="flex gap-2">
            {['list', 'week', 'month'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1 rounded text-sm border ${viewMode === mode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {renderView()}

        {/* Floating Create Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-14 h-14 text-3xl shadow-md hover:bg-blue-700"
        >
          +
        </button>

        {/* Create Post Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowCreateModal(false)} className="absolute top-2 right-2 text-gray-600 hover:text-black">✕</button>
              <h2 className="text-xl font-semibold mb-4">Create New Post</h2>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    required
                    value={newPostData.title}
                    onChange={(e) => setNewPostData({ ...newPostData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <textarea className="w-full border rounded px-3 py-2" rows={3} required value={newPostData.content}
                    onChange={(e) => setNewPostData({ ...newPostData, content: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Platform</label>
                  <select className="w-full border rounded px-3 py-2" required value={newPostData.platform}
                    onChange={(e) => setNewPostData({ ...newPostData, platform: e.target.value })}>
                    <option value="">Select...</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Scheduled At</label>
                  <input type="datetime-local" className="w-full border rounded px-3 py-2" required value={newPostData.scheduledAt}
                    onChange={(e) => setNewPostData({ ...newPostData, scheduledAt: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select className="w-full border rounded px-3 py-2" value={newPostData.status}
                    onChange={(e) => setNewPostData({ ...newPostData, status: e.target.value })}>
                    <option value="pending">Pending Approval</option>
                    <option value="draft">Save as Draft</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Post'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Post Details Modal */}
        {showModal && selectedPost && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-lg p-5 relative"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-2 right-2 text-gray-600 hover:text-black"
                aria-label="Close"
              >
                ✕
              </button>

              <h3 className="text-xl font-semibold mb-2">
                {selectedPost.title || 'Post Details'}
              </h3>

              {selectedPost.media && (
  <div className="mb-3">
    {/\.(mp4|webm|ogg)$/i.test(String(selectedPost.media)) ? (
      <video src={buildMediaUrl(selectedPost.media)} className="w-full rounded border" controls />
    ) : (
      <img src={buildMediaUrl(selectedPost.media)} alt="Post media" className="w-full rounded border" />
    )}
  </div>
)}


              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Content:</span>{' '}
                  <span className="whitespace-pre-wrap break-words">
                    {selectedPost.content || '—'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-semibold">Platform:</span> {selectedPost.platform || '—'}</div>
                  <div><span className="font-semibold">Status:</span> <span className="capitalize">{selectedPost.status || '—'}</span></div>
                  <div><span className="font-semibold">Scheduled:</span> {selectedPost.scheduledAt ? format(new Date(selectedPost.scheduledAt), 'PPpp') : '—'}</div>
                  {selectedPost.publishedAt && (
                    <div><span className="font-semibold">Published:</span> {format(new Date(selectedPost.publishedAt), 'PPpp')}</div>
                  )}
                </div>
                {selectedPost.organizationName && (
                  <div><span className="font-semibold">Organization:</span> {selectedPost.organizationName}</div>
                )}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded border">Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
