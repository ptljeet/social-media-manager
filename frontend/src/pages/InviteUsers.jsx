import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function InviteUsers() {
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');

  const fetchMembers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/invitations/members', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMembers(res.data);
    } catch (error) {
      toast.error('Failed to fetch members');
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleInvite = async () => {
    try {
      await axios.post('http://localhost:5000/api/invitations/send', {
        email: inviteEmail,
        role: inviteRole
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success('Invitation sent');
      setInviteEmail('');
      fetchMembers();
    } catch (error) {
      toast.error('Failed to send invite');
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Remove this user?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/invitations/members/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success('User removed');
      fetchMembers();
    } catch (error) {
      toast.error('Failed to remove user');
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <ToastContainer />
        <h2 className="text-2xl font-bold mb-6">Invite Users</h2>
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="text-lg font-semibold mb-2">Send Invitation</h3>
          <input
            type="email"
            placeholder="Email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="border p-2 mr-2"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="border p-2 mr-2"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <button
            onClick={handleInvite}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Send Invite
          </button>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Organization Members</h3>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member._id} className="border-t">
                  <td className="p-2">{member.name}</td>
                  <td className="p-2">{member.email}</td>
                  <td className="p-2">{member.role}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleRemove(member._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-gray-500 p-4">No members found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
