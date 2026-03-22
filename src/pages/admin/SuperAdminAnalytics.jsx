import { useState, useEffect } from 'react';
import { superAdminApi } from '../../services/superAdminApi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function SuperAdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superAdminApi.getAnalytics()
      .then(setAnalytics)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading analytics...</div>;
  if (!analytics) return <div style={{ padding: '2rem' }}>Failed to load analytics</div>;

  const genderData = {
    labels: Object.keys(analytics.genderDistribution || {}),
    datasets: [{
      data: Object.values(analytics.genderDistribution || {}),
      backgroundColor: ['#3b82f6', '#ec4899', '#8b5cf6', '#64748b']
    }]
  };

  const casteData = {
    labels: Object.keys(analytics.casteDistribution || {}),
    datasets: [{
      data: Object.values(analytics.casteDistribution || {}),
      backgroundColor: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6', '#0ea5e9']
    }]
  };

  const boothLabels = Object.keys(analytics.votersPerBooth || {}).slice(0, 20); // Top 20 for readability
  const boothCounts = boothLabels.map(k => analytics.votersPerBooth[k]);
  
  const boothData = {
    labels: boothLabels,
    datasets: [{
      label: 'Voters per Booth (Top 20)',
      data: boothCounts,
      backgroundColor: '#3b82f6'
    }]
  };

  return (
    <div className="page-content fade-in">
      <header className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1>Data Analytics</h1>
        <p className="text-muted">Demographic insights across all constituencies.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Gender Distribution</h3>
          <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
            <Pie data={genderData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="card glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Caste Distribution</h3>
          <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
            <Pie data={casteData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div className="card glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Voters Spread per Booth</h3>
        <div style={{ height: '400px' }}>
          <Bar data={boothData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} />
        </div>
      </div>
    </div>
  );
}
