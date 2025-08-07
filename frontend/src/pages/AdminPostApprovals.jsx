import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminPostApprovals() {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [declinedPosts, setDeclinedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const [pending, approved, declined] = await Promise.all([
        axios.get('http://localhost:5000/api/posts/status/pending', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get('http://localhost:5000/api/posts/status/approved', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get('http://localhost:5000/api/posts/status/declined', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
      ]);
      setPendingPosts(pending.data);
      setApprovedPosts(approved.data);
      setDeclinedPosts(declined.data);
    } catch (err) {
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (postId) => {
    try {
      await axios.post(`http://localhost:5000/api/posts/${postId}/approve`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Post approved successfully!');
      fetchPosts();
    } catch {
      toast.error('Approval failed');
    }
  };

  const handleDecline = async (postId) => {
    try {
      await axios.post(`http://localhost:5000/api/posts/${postId}/decline`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Post declined successfully!');
      fetchPosts();
    } catch {
      toast.error('Decline failed');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const renderPosts = (posts, actions = true) => (
    posts.length === 0 ? (
      <p className="text-gray-400 italic">No posts found.</p>
    ) : (
      posts.map(post => (
        <div key={post._id} className="bg-white p-4 rounded shadow border mb-4">
          <h2 className="text-lg font-semibold mb-1">{post.title}</h2>
          <p className="text-sm mb-2 text-gray-700">{post.content}</p>
          <p className="text-xs text-gray-500 mb-2">
            Platform: {post.platform} | Scheduled: {new Date(post.scheduledAt).toLocaleString()}
          </p>
          {actions && (
            <div className="space-x-2">
              <button
                className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                onClick={() => handleApprove(post._id)}
              >
                Approve
              </button>
              <button
                className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                onClick={() => handleDecline(post._id)}
              >
                Decline
              </button>
            </div>
          )}
        </div>
      ))
    )
  );

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <ToastContainer />
        <h1 className="text-2xl font-bold mb-4">Post Approvals</h1>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-2">Pending Posts</h2>
            {renderPosts(pendingPosts)}
            <h2 className="text-xl font-semibold mt-6 mb-2">Approved Posts</h2>
            {renderPosts(approvedPosts, false)}
            <h2 className="text-xl font-semibold mt-6 mb-2">Declined Posts</h2>
            {renderPosts(declinedPosts, false)}
          </div>
        )}
      </main>
    </div>
  );
}
