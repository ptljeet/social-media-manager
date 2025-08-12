import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' });
API.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export default function InviteUsers() {
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/admin/users'); // same as ManageUsers
      setMembers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleCopyInviteLink = async () => {
    try {
      setCreating(true);
      const { data } = await API.post('/invitations/create', {
        role: 'viewer', // fixed role
        email: inviteEmail || undefined,
      });
      if (!data?.inviteUrl) throw new Error('Invite URL not returned');
      await navigator.clipboard.writeText(data.inviteUrl);
      toast.success('Invite link copied to clipboard');
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Failed to create invite link');
    } finally {
      setCreating(false);
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Remove this user?')) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      toast.success('User removed');
      fetchMembers();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Failed to remove user');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <ToastContainer />
        <h2 className="text-2xl font-bold mb-6">Invite Users</h2>

        {/* Copy link */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="text-lg font-semibold mb-3">Generate Invite Link</h3>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="email"
              placeholder="(Optional) Prefill email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="border p-2 rounded w-64"
            />
            <button
              onClick={handleCopyInviteLink}
              disabled={creating}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-60"
            >
              {creating ? 'Generating…' : 'Copy Invite Link'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Link contains a 7-day token tied to your organization with <b>viewer</b> role.
          </p>
        </div>

        {/* Members */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-3">Organization Members</h3>
          {loading ? (
            <div className="text-gray-500 p-4">Loading members…</div>
          ) : (
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Role</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m._id} className="border-t">
                    <td className="p-2">{m.name}</td>
                    <td className="p-2">{m.email}</td>
                    <td className="p-2">{m.role}</td>
                    <td className="p-2">
                      {(m.role || '').toLowerCase() === 'super_admin' ||
                       (m.role || '').toLowerCase() === 'admin' ? (
                        <span className="text-gray-400 italic">Protected</span>
                      ) : (
                        <button
                          onClick={() => handleRemove(m._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          Remove
                        </button>
                      )}
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
          )}
        </div>
      </main>
    </div>
  );
}
