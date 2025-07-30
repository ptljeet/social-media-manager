
// src/pages/CalendarPage.jsx
import React, { useEffect, useState } from 'react';
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

  const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

  const fetchPosts = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/posts/calendar?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setPosts(res.data);
    } catch (err) {
      toast.error('Failed to load calendar posts');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentMonth]);

  const getPostsByDate = (dateStr) =>
    posts.filter(
      (post) => format(new Date(post.scheduledAt), 'yyyy-MM-dd') === dateStr
    );

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

      await axios.post('http://localhost:5000/api/posts', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Post created successfully');
      setShowCreateModal(false);
      setNewPostData({
        title: '',
        content: '',
        platform: '',
        scheduledAt: '',
        status: 'pending'
      });
      fetchPosts();
    } catch (err) {
      toast.error('Failed to create post');
      console.error('POST ERROR:', err);
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
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedPost(post);
                      setShowModal(true);
                    }}
                    className="bg-gray-50 p-2 rounded mb-2 border cursor-pointer hover:bg-blue-50"
                  >
                    <div className="text-[10px] text-gray-500">
                      {format(new Date(post.scheduledAt), 'h:mm a')}
                    </div>
                    <div className="text-xs font-medium truncate">{post.content}</div>
                    <div className="text-[10px] text-purple-600 font-semibold text-right">
                      {post.engagement || 0}% engagement
                    </div>
                  </div>
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
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full relative">
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
      </main>
    </div>
  );
}
