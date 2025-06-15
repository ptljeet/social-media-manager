import React from 'react';
import { useNavigate } from 'react-router-dom';
import ContentCalendar from '../components/ContentCalendar';

export default function CalendarPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Content Calendar</h1>
        <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
      </div>
      <ContentCalendar />
    </div>
  );
}
