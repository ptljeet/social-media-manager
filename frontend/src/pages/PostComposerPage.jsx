// src/pages/PostComposerPage.jsx
import React, { useMemo, useState } from 'react';
import axios from 'axios';
import AppShell from '../components/AppShell';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const MAX_FILE_MB = 25;

export default function PostComposerPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('facebook');
  const [media, setMedia] = useState(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);

  const isImage = media?.type?.startsWith('image/');
  const isVideo = media?.type?.startsWith('video/');

  const mediaPreview = useMemo(
    () => (isImage && media ? URL.createObjectURL(media) : null),
    [isImage, media]
  );

  const onPickMedia = (file) => {
    if (!file) {
      setMedia(null);
      return;
    }
    const mb = file.size / (1024 * 1024);
    if (mb > MAX_FILE_MB) {
      toast.error(`File too large. Max ${MAX_FILE_MB}MB`);
      return;
    }
    if (!/^image\/|^video\//.test(file.type)) {
      toast.error('Only images or videos are allowed');
      return;
    }
    setMedia(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return toast.error('Title is required');
    if (!scheduledAt) return toast.error('Please select a schedule date/time');

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    formData.append('platform', platform);
    formData.append('scheduledAt', scheduledAt);
    formData.append('status', 'pending'); // always pending
    if (media) formData.append('media', media);

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
    <AppShell
      title="Create New Post"
      subtitle="Compose, attach media, schedule, and submit for approval."
      actions={
        <Button
          variant="secondary"
          onClick={() => (window.location.href = '/calendar')}
        >
          Open Calendar
        </Button>
      }
    >
      <ToastContainer position="top-right" autoClose={3000} />

      <Card className="max-w-3xl">
        <CardHeader
          title="Post Composer"
          subtitle="Fill the fields below and submit."
        />
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title & Platform */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  className="w-full border rounded-xl px-3 py-2"
                  type="text"
                  placeholder="Give your post a title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Platform</label>
                <select
                  className="w-full border rounded-xl px-3 py-2"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  required
                >
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="twitter">Twitter</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium mb-1">Content</label>
                <span className="text-xs text-slate-500">
                  {content.length}/280
                </span>
              </div>
              <textarea
                className="w-full border rounded-xl px-3 py-2"
                placeholder="Write the text you want to publish..."
                rows={5}
                maxLength={280}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            {/* Media */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Media (optional)
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-slate-700 hover:file:bg-slate-200"
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => onPickMedia(e.target.files?.[0] || null)}
                  />
                  {media && (
                    <p className="mt-1 text-xs text-slate-500">
                      Selected: {media.name} (
                      {Math.round(media.size / 1024)} KB)
                    </p>
                  )}
                </div>

                {/* Preview */}
                <div className="sm:w-56">
                  <div className="border rounded-xl p-2 bg-slate-50">
                    {!media && (
                      <div className="text-xs text-slate-500 text-center py-6">
                        No media selected
                      </div>
                    )}
                    {isImage && mediaPreview && (
                      <img
                        src={mediaPreview}
                        alt="preview"
                        className="w-full h-36 object-cover rounded-md"
                      />
                    )}
                    {isVideo && media && (
                      <div className="text-xs text-slate-600 italic break-all">
                        Video selected: {media.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Scheduled At
              </label>
              <input
                className="w-full border rounded-xl px-3 py-2"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating…' : 'Submit Post'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setTitle('');
                  setContent('');
                  setPlatform('facebook');
                  setMedia(null);
                  setScheduledAt('');
                }}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </AppShell>
  );
}
