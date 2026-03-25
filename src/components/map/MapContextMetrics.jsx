import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function MapContextMetrics({ boothsCount, sectionsCount }) {
  const chartData = {
    labels: ['Total Context Booths', 'Context Sections'],
    datasets: [
      {
        label: 'Counts',
        data: [boothsCount || 0, sectionsCount || 0],
        backgroundColor: ['rgba(239, 68, 68, 0.7)', 'rgba(59, 130, 246, 0.7)'],
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false, 
    plugins: { 
      legend: { display: false }, 
      title: { display: true, text: 'Context Stats' } 
    }
  };

  return (
    <div className="p-4 border-t dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 h-48">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}
