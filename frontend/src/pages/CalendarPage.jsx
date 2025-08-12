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
import AppShell from '../components/AppShell';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const ASSET_BASE = process.env.REACT_APP_ASSET_URL || 'http://localhost:5000';
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const buildMediaUrl = (media) => {
  if (!media) return '';
  if (/^https?:\/\//i.test(media)) return media;
  const clean = String(media).replace(/\\/g, '/');
  return `${ASSET_BASE}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [posts, setPosts] = useState([]);
  const [viewMode, setViewMode] = useState('month');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newPostData, setNewPostData] = useState({
    title: '',
    content: '',
    platform: '',
    scheduledAt: ''
  });
  const [mediaFile, setMediaFile] = useState(null);

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
  }, [period.key]);

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

      // ✅ ensure Admin "Pending" sees it
      formData.append('status', 'pending');

      if (mediaFile) formData.append('media', mediaFile);

      await axios.post(`${API_BASE}/posts`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      toast.success('Post created successfully');
      setShowCreateModal(false);
      setNewPostData({ title: '', content: '', platform: '', scheduledAt: '' });
      setMediaFile(null);

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
      <div className="grid grid-cols-7 gap-2 text-xs md:text-sm mb-2">
        {days.map((day) => (
          <div key={day} className="font-medium text-center text-slate-600">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 text-sm">
        {dates.map((date, i) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const postsOnDay = getPostsByDate(dateStr);
          return (
            <Card key={i} className="min-h-[120px]">
              <CardBody>
                <div className="text-xs text-slate-400 mb-1">{format(date, 'MMM d')}</div>
                {postsOnDay.length === 0 ? (
                  <p className="text-slate-300 italic text-xs text-center">No posts</p>
                ) : (
                  postsOnDay.map((post, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setSelectedPost(post)}
                      className="w-full text-left bg-slate-50 p-2 rounded-lg mb-2 border hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <div className="text-[10px] text-slate-500">
                        {format(new Date(post.scheduledAt), 'h:mm a')}
                      </div>
                      <div className="text-xs font-medium truncate">
                        {post.title || post.content}
                      </div>
                      <div className="text-[10px] text-indigo-600 font-semibold text-right">
                        {post.engagement || 0}% engagement
                      </div>
                    </button>
                  ))
                )}
              </CardBody>
            </Card>
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
    <AppShell
      title="Content Calendar"
      subtitle="See scheduled content by day and quickly create or review posts."
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setCurrentMonth(new Date())}>Today</Button>
          <Button variant="secondary" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>←</Button>
          <div className="px-2 py-2 text-sm font-semibold">{format(currentMonth, 'MMMM yyyy')}</div>
          <Button variant="secondary" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>→</Button>
          <Button onClick={() => setShowCreateModal(true)}>New Post</Button>
        </div>
      }
    >
      <ToastContainer position="top-right" autoClose={3000} />

      <Card className="mb-4">
        <CardHeader
          title="View"
          right={
            <div className="flex gap-2">
              {['list', 'week', 'month'].map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? 'primary' : 'secondary'}
                  onClick={() => setViewMode(mode)}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>
          }
        />
        <CardBody>{renderView()}</CardBody>
      </Card>

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Post"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreatePost} disabled={loading}>
              {loading ? 'Creating…' : 'Create'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreatePost} className="space-y-4" id="create-post-form">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              className="w-full border rounded-xl px-3 py-2"
              required
              value={newPostData.title}
              onChange={(e) => setNewPostData({ ...newPostData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              className="w-full border rounded-xl px-3 py-2"
              rows={3}
              required
              value={newPostData.content}
              onChange={(e) => setNewPostData({ ...newPostData, content: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Platform</label>
              <select
                className="w-full border rounded-xl px-3 py-2"
                required
                value={newPostData.platform}
                onChange={(e) => setNewPostData({ ...newPostData, platform: e.target.value })}
              >
                <option value="">Select…</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Scheduled At</label>
              <input
                type="datetime-local"
                className="w-full border rounded-xl px-3 py-2"
                required
                value={newPostData.scheduledAt}
                onChange={(e) => setNewPostData({ ...newPostData, scheduledAt: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Media (image/video)</label>
            <input
              type="file"
              accept="image/*,video/*"
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-slate-700 hover:file:bg-slate-200"
              onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        title={selectedPost?.title || 'Post Details'}
        footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setSelectedPost(null)}>Close</Button></div>}
      >
        {selectedPost && (
          <div className="space-y-3 text-sm">
            {selectedPost.media && (
              <div>
                {/\.((mp4|webm|ogg))$/i.test(String(selectedPost.media)) ? (
                  <video src={buildMediaUrl(selectedPost.media)} className="w-full rounded border" controls />
                ) : (
                  <img src={buildMediaUrl(selectedPost.media)} alt="Post media" className="w-full rounded border" />
                )}
              </div>
            )}
            <div>
              <span className="font-semibold">Content:</span>{' '}
              <span className="whitespace-pre-wrap break-words">{selectedPost.content || '—'}</span>
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
        )}
      </Modal>
    </AppShell>
  );
}
