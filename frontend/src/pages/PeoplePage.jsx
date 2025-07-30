import React, { useEffect, useState } from 'react';

export default function PeoplePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/teams/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (res.ok) {
        setUsers(prev =>
          prev.map(u => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      console.error('Error updating role', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div className="p-6">Loading users...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Team Members</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id} className="border-b">
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2 capitalize">{user.role}</td>
              <td className="p-2 text-center">
                <select
                  value={user.role}
                  onChange={e => handleRoleChange(user._id, e.target.value)}
                  className="border px-2 py-1 rounded"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
