import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SuperAdminDashboard() {
  const [organizations, setOrganizations] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });

  const fetchOrganizations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/superadmin/organizations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrganizations(res.data);
    } catch (error) {
      toast.error('Failed to fetch organizations');
    }
  };

  useEffect(() => { fetchOrganizations(); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/superadmin/organizations', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Organization created successfully');
      fetchOrganizations();
      setFormData({ name: '', domain: '', adminName: '', adminEmail: '', adminPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Creation failed');
    }
  };

  const handleDeleteOrg = async (orgId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/superadmin/organizations/${orgId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Deleted successfully');
      fetchOrganizations();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>

      {/* Create Organization */}
      <form onSubmit={handleCreateOrg} className="bg-white p-6 rounded shadow mb-6 max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Create New Organization</h2>
        {['name', 'domain', 'adminName', 'adminEmail', 'adminPassword'].map((field) => (
          <input
            key={field}
            type={field.includes('Password') ? 'password' : 'text'}
            name={field}
            placeholder={field.replace(/([A-Z])/g, ' $1')}
            value={formData[field]}
            onChange={handleChange}
            className="border p-2 w-full mb-2"
            required
          />
        ))}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create Organization
        </button>
      </form>

      {/* Organization List */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Organizations</h2>
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Name</th>
              <th className="p-2">Domain</th>
              <th className="p-2">Users</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
              <tr key={org._id} className="border-t">
                <td className="p-2">{org.name}</td>
                <td className="p-2">{org.domain}</td>
                <td className="p-2">
                  {org.users.map((u) => (
                    <div key={u._id}>{u.name} ({u.role})</div>
                  ))}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => handleDeleteOrg(org._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {organizations.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-gray-500 p-4">No organizations found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
