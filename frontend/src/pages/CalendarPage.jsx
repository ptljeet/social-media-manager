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

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [posts, setPosts] = useState([]);
  const [viewMode, setViewMode] = useState('month');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

  useEffect(() => {
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
        console.error('Error loading calendar posts:', err);
      }
    };

    fetchPosts();
  }, [currentMonth]);

  const getPostsByDate = (dateStr) =>
    posts.filter(
      (post) => format(new Date(post.scheduledAt), 'yyyy-MM-dd') === dateStr
    );

  const renderMonthGrid = () => {
    const start = startOfWeek(startOfMonth(currentMonth));
    return (
      <>
        <div className="grid grid-cols-7 gap-2 text-sm mb-2">
          {days.map((day) => (
            <div key={day} className="font-medium text-center">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 text-sm">
          {[...Array(35)].map((_, i) => {
            const date = addDays(start, i);
            const dateStr = format(date, 'yyyy-MM-dd');
            const postsOnDay = getPostsByDate(dateStr);
            return (
              <div key={i} className="bg-white p-2 rounded border min-h-[100px]">
                <div className="text-xs text-gray-400 mb-1">{format(date, 'd')}</div>
                {postsOnDay.length === 0 ? (
                  <p className="text-gray-300 italic text-xs">No posts</p>
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
  };

  const renderWeekGrid = () => {
    const start = startOfWeek(currentMonth);
    const daysInWeek = [...Array(7)].map((_, i) => addDays(start, i));
    return (
      <>
        <div className="grid grid-cols-7 gap-2 text-sm mb-2">
          {days.map((day) => (
            <div key={day} className="font-medium text-center">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 text-sm">
          {daysInWeek.map((date, i) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const postsOnDay = getPostsByDate(dateStr);
            return (
              <div key={i} className="bg-white p-2 rounded border min-h-[100px]">
                <div className="text-xs text-gray-400 mb-1 text-center">
                  {format(date, 'MMM d')}
                </div>
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
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-4 space-y-4">
        <h2 className="text-xl font-bold text-green-600">SocialHub</h2>
        <nav className="space-y-2">
          {["Home", "Calendar", "Publishing", "Reports", "People"].map((label) => (
            <a key={label} href={`/${label.toLowerCase()}`} className="block text-gray-700 hover:text-green-600">
              {label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-2 py-1 border rounded text-sm"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="px-2 py-1 border rounded text-sm"
            >
              ←
            </button>
            <h1 className="text-xl font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </h1>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="px-2 py-1 border rounded text-sm"
            >
              →
            </button>
          </div>
          <div className="flex gap-2">
            {['list', 'week', 'month'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1 rounded text-sm border ${
                  viewMode === mode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Views */}
        {viewMode === 'month' && renderMonthGrid()}
        {viewMode === 'week' && renderWeekGrid()}
        {viewMode === 'list' && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-md font-semibold mb-2">Post List</h2>
            <ul className="divide-y text-sm">
              {posts.map((post, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setSelectedPost(post);
                    setShowModal(true);
                  }}
                  className="py-2 flex justify-between cursor-pointer hover:bg-blue-50 px-2 rounded"
                >
                  <div>
                    <p className="font-medium">{post.content}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(post.scheduledAt), 'MMM d, h:mm a')} — {post.platform}
                    </p>
                  </div>
                  <span className="text-xs text-purple-600 font-semibold">{post.engagement || 0}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Post Modal */}
        {showModal && selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-2 right-2 text-gray-600 hover:text-black"
              >
                ✕
              </button>
              <h2 className="text-xl font-semibold mb-2">Post Details</h2>
              <p className="text-sm mb-2"><strong>Content:</strong> {selectedPost.content}</p>
              <p className="text-sm mb-2"><strong>Platform:</strong> {selectedPost.platform}</p>
              <p className="text-sm mb-2"><strong>Status:</strong> {selectedPost.status}</p>
              <p className="text-sm mb-2"><strong>Scheduled At:</strong> {format(new Date(selectedPost.scheduledAt), 'PPpp')}</p>
              <p className="text-sm mb-2"><strong>Engagement:</strong> {selectedPost.engagement || 0}%</p>
              {selectedPost.mediaUrl && (
                <img src={selectedPost.mediaUrl} alt="Media" className="mt-2 rounded max-h-48 object-contain" />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
