import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', organization: '' });
  const [organizations, setOrganizations] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract invite token from URL (if any)
  const queryParams = new URLSearchParams(location.search);
  const inviteToken = queryParams.get('invite');

  useEffect(() => {
    // Fetch organizations (public endpoint)
    axios.get('http://localhost:5000/api/public/organizations')
      .then(res => setOrganizations(res.data))
      .catch(err => console.error('Failed to load organizations', err));
  }, []);

  // Auto-select organization if invite token is present
  useEffect(() => {
    if (inviteToken) {
      axios.post('http://localhost:5000/api/auth/validate-invite', { token: inviteToken })
        .then(res => {
          setForm((prev) => ({
            ...prev,
            email: res.data.email,
            organization: res.data.organizationId
          }));
        })
        .catch(() => console.error('Invalid or expired invite token'));
    }
  }, [inviteToken]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        ...form,
        inviteToken, // pass token if available
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/calendar');
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          type="email"
          className="w-full mb-3 p-2 border rounded"
          required
          disabled={!!inviteToken} // disable if invite prefilled
        />
        <input
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          type="password"
          className="w-full mb-3 p-2 border rounded"
          required
        />

        {!inviteToken && (
          <select
            name="organization"
            value={form.organization}
            onChange={handleChange}
            className="w-full mb-3 p-2 border rounded"
            required
          >
            <option value="">Select Organization</option>
            {organizations.map((org) => (
              <option key={org._id} value={org._id}>
                {org.name}
              </option>
            ))}
          </select>
        )}

        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
          Register
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">Login</a>
        </p>
      </form>
    </main>
  );
}
