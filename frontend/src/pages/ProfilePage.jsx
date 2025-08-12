import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ProfilePage() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading…</p>;
  if (!user) return <p className="text-center mt-10">User not logged in.</p>;

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
      {user.organizationName ? (
        <p><strong>Organization:</strong> {user.organizationName}</p>
      ) : null}

      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = '/login';
        }}
        className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
}
