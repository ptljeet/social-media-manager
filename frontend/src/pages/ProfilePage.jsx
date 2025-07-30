import React from 'react';

export default function ProfilePage() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) return <p className="text-center mt-10">User not logged in.</p>;

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>

      {/*Logout Button */}
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
