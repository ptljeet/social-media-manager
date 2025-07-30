import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminPostApprovals() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingPosts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/posts/pending', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPosts(res.data || []);
    } catch (err) {
      toast.error('Failed to fetch pending posts');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (postId) => {
    try {
      await axios.post(`http://localhost:5000/api/posts/${postId}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast.success('Post approved successfully!');
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch (err) {
      toast.error('Approval failed');
    }
  };

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <ToastContainer />
        <h1 className="text-2xl font-bold mb-4">Pending Post Approvals</h1>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-400 italic">No posts pending approval.</p>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post._id} className="bg-white p-4 rounded shadow border">
                <h2 className="text-lg font-semibold mb-1">{post.title}</h2>
                <p className="text-sm mb-2 text-gray-700">{post.content}</p>
                <p className="text-xs text-gray-500 mb-2">
                  Platform: {post.platform} | Scheduled: {new Date(post.scheduledAt).toLocaleString()}
                </p>
                <button
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                  onClick={() => handleApprove(post._id)}
                >
                  Approve
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
