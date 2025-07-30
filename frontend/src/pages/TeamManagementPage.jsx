// src/pages/TeamManagementPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/AdminSidebar';

export default function TeamManagementPage() {
  const [teams, setTeams] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', organization: '', members: [] });

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [teamRes, orgRes, userRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/teams', { headers }),
        axios.get('http://localhost:5000/api/org', { headers }),
        axios.get('http://localhost:5000/api/admin/users', { headers })
      ]);
      setTeams(teamRes.data);
      setOrganizations(orgRes.data);
      setUsers(userRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMemberToggle = (userId) => {
    setForm((prev) => {
      const isSelected = prev.members.includes(userId);
      const newMembers = isSelected
        ? prev.members.filter((id) => id !== userId)
        : [...prev.members, userId];
      return { ...prev, members: newMembers };
    });
  };

  const createTeam = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/teams', form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setForm({ name: '', organization: '', members: [] });
      fetchData();
    } catch (err) {
      alert('Failed to create team');
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Team Management</h2>

        <form onSubmit={createTeam} className="bg-white p-4 rounded shadow mb-6 space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Team Name"
            required
          />
          <select
            name="organization"
            value={form.organization}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Organization</option>
            {organizations.map((org) => (
              <option key={org._id} value={org._id}>
                {org.name}
              </option>
            ))}
          </select>

          <div>
            <label className="block mb-2 font-medium">Assign Members:</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {users.map((user) => (
                <label key={user._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.members.includes(user._id)}
                    onChange={() => handleMemberToggle(user._id)}
                  />
                  {user.name} ({user.role})
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Create Team
          </button>
        </form>

        <h3 className="text-xl font-semibold mb-2">Existing Teams</h3>
        <ul className="space-y-2">
          {teams.map((team) => (
            <li key={team._id} className="bg-gray-100 p-3 rounded">
              <strong>{team.name}</strong> — <span className="text-sm text-gray-600">
                Org: {team.organization?.name || 'N/A'}, Members: {team.members?.length || 0}
              </span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
