import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      const { token, user } = res.data;

      // Save token and user to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect based on role
      if (user.role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/calendar');
      }
    } catch (err) {
      console.error('Login failed:', err);
      toast.error('Invalid email or password');
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Login
        </button>

        <p className="text-sm text-center mt-4">
          Don’t have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">Register</a>
        </p>
      </form>
    </main>
  );
}
