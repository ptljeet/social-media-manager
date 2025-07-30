import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function OrganizationPage() {
  const [organizations, setOrganizations] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/org', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setOrganizations(res.data);
    } catch (err) {
      console.error('Failed to fetch organizations', err);
      setError('Could not load organizations.');
    } finally {
      setLoading(false);
    }
  };

  const createOrg = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await axios.post(
        'http://localhost:5000/api/org',
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setName('');
      setDescription('');
      fetchOrgs();
    } catch (err) {
      console.error('Creation failed', err);
      alert('Failed to create organization.');
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Organizations</h2>

      <form onSubmit={createOrg} className="space-y-4 mb-6 bg-white p-4 rounded shadow">
        <input
          className="w-full border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Organization Name"
          required
        />
        <textarea
          className="w-full border p-2 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          rows={3}
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">
          ➕ Create Organization
        </button>
      </form>

      {loading && <p className="text-sm text-gray-500">Loading organizations...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="space-y-2">
        {organizations.map((org) => (
          <li key={org._id} className="bg-gray-100 p-3 rounded shadow-sm">
            <strong className="text-lg">{org.name}</strong>
            {org.description && (
              <p className="text-sm text-gray-600 mt-1">{org.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
