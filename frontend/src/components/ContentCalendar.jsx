import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

export default function ContentCalendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const loadPosts = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/posts/calendar?startDate=2025-06-01&endDate=2025-06-30', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const formatted = res.data.map(post => ({
        id: post._id,
        title: post.content.slice(0, 20) + '...',
        start: post.scheduledAt,
        backgroundColor: getColor(post.status)
      }));
      setEvents(formatted);
    };
    loadPosts();
  }, []);

  const getColor = (status) => {
    if (status === 'Scheduled') return 'blue';
    if (status === 'Draft') return 'gray';
    if (status === 'Published') return 'green';
    return 'lightgray';
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      events={events}
      height="auto"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek'
      }}
    />
  );
}
