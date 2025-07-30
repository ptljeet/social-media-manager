import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

export default function ReportsPage() {
  const [analyticsData, setAnalyticsData] = useState({
    reach: 1200,
    engagement: 540,
    clicks: 380
  });

  // Dummy fetch simulation
  useEffect(() => {
    // In real usage, fetch from backend
    // fetch('/api/analytics').then(...)
  }, []);

  const barData = {
    labels: ['Reach', 'Engagement', 'Clicks'],
    datasets: [
      {
        label: 'Post Metrics',
        data: [
          analyticsData.reach,
          analyticsData.engagement,
          analyticsData.clicks
        ],
        backgroundColor: ['#34d399', '#60a5fa', '#f472b6']
      }
    ]
  };

  const pieData = {
    labels: ['Facebook', 'Instagram'],
    datasets: [
      {
        label: 'Platform Share',
        data: [65, 35],
        backgroundColor: ['#3b82f6', '#e1306c']
      }
    ]
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Analytics & Reports</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-2">Post Metrics</h2>
          <Bar data={barData} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Platform Distribution</h2>
          <Pie data={pieData} />
        </div>
      </div>
    </div>
  );
}
