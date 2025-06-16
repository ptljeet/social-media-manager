import React from 'react';

export default function ProfilePage() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">My Profile</h2>
      <div className="bg-white p-4 rounded shadow max-w-md">
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
      </div>
    </div>
  );
}
