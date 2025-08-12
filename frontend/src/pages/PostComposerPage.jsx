// src/pages/PostComposerPage.jsx
import React, { useMemo, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function PostComposerPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('facebook'); // match backend enum
  const [media, setMedia] = useState(null);
  const [status, setStatus] = useState('pending'); // 'draft' | 'pending'
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);

  const mediaPreview = useMemo(() => (media ? URL.createObjectURL(media) : null), [media]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return toast.error('Title is required');
    if (!scheduledAt) return toast.error('Please select a schedule date/time');

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    formData.append('platform', platform);
    formData.append('scheduledAt', scheduledAt);
    formData.append('status', status);
    if (media) formData.append('media', media); // matches upload.single('media')

    try {
      setLoading(true);
      await axios.post(`${API_BASE}/posts`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Post created successfully');

      // reset
      setTitle('');
      setContent('');
      setPlatform('facebook');
      setMedia(null);
      setStatus('pending');
      setScheduledAt('');
    } catch (err) {
      console.error('POST ERROR:', err?.response?.data || err.message);
      toast.error(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Failed to create post'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (non-admin). If this page is admin-only, swap to AdminSidebar */}
      <Sidebar />

      <main className="flex-1 p-6">
        <ToastContainer position="top-right" autoClose={3000} />
        <h2 className="text-2xl font-bold mb-4">Create New Post</h2>

        <div className="bg-white rounded shadow p-5 max-w-2xl">
          <form onSubmit={handleSubmit}>
            <label className="block text-sm mb-1">Title</label>
            <input
              className="border w-full p-2 mb-3 rounded"
              type="text"
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />

            <label className="block text-sm mb-1">Content</label>
            <textarea
              className="border w-full p-2 mb-3 rounded"
              placeholder="Content"
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />

            <label className="block text-sm mb-1">Platform</label>
            <select
              className="border w-full p-2 mb-3 rounded"
              value={platform}
              onChange={e => setPlatform(e.target.value)}
              required
            >
              {/* Keep in sync with Post model enum */}
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter</option>
            </select>

            <label className="block text-sm mb-1">Media (optional)</label>
            <input
              className="w-full mb-2"
              type="file"
              accept="image/*,video/*"
              onChange={e => setMedia(e.target.files?.[0] || null)}
            />
            {mediaPreview && (
              <div className="mb-3">
                {/* show image preview; for video we just show filename */}
                {media?.type?.startsWith('image/') ? (
                  <img src={mediaPreview} alt="preview" className="max-h-40 rounded border" />
                ) : (
                  <div className="text-xs text-gray-600 italic">Selected: {media?.name}</div>
                )}
              </div>
            )}

            <label className="block text-sm mb-1">Scheduled At</label>
            <input
              className="border w-full p-2 mb-3 rounded"
              type="datetime-local"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
              required
            />

            <label className="block text-sm mb-1">Status</label>
            <select
              className="border w-full p-2 mb-4 rounded"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="pending">Pending Approval</option>
              <option value="draft">Save as Draft</option>
            </select>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
              >
                {loading ? 'Creating…' : 'Submit Post'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle('');
                  setContent('');
                  setPlatform('facebook');
                  setMedia(null);
                  setStatus('pending');
                  setScheduledAt('');
                }}
                className="px-4 py-2 rounded border"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
