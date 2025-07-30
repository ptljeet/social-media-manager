import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/role`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchUsers();
    } catch (err) {
      alert('Role update failed');
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar /> {}
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Admin Dashboard: Manage Users</h2>
        <table className="w-full bg-white rounded shadow text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="border px-2 py-1 rounded"
                  >
                    <option value="Viewer">Viewer</option>
                    <option value="Editor">Editor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
