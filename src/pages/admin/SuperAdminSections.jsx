import { useState, useEffect } from 'react';
import { superAdminApi } from '../../services/superAdminApi';

export default function SuperAdminSections() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superAdminApi.getSections()
      .then(setSections)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading sections...</div>;

  // Group sections by boothPartId for display
  const groupedSections = sections.reduce((acc, curr) => {
    const boothId = curr.boothPart?.partId || 'Unknown Booth';
    if (!acc[boothId]) acc[boothId] = [];
    acc[boothId].push(curr);
    return acc;
  }, {});

  return (
    <div className="page-content fade-in">
      <header className="page-header" style={{ marginBottom: '1rem' }}>
        <h1>All Sections</h1>
        <p className="text-muted">Directory of all booth sections.</p>
      </header>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {Object.entries(groupedSections).map(([boothId, boothSections]) => (
          <div key={boothId} className="card glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Booth Part ID: {boothId}</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {boothSections.map(section => (
                <li key={section.id} style={{ padding: '0.75rem', background: 'var(--bg-secondary)', marginBottom: '0.5rem', borderRadius: '8px' }}>
                  <strong style={{ marginRight: '1rem' }}>Section {section.sectionId}:</strong> {section.sectionName}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {Object.keys(groupedSections).length === 0 && <div>No sections found</div>}
      </div>
    </div>
  );
}
