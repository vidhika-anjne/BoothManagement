import { useState } from 'react'
import { MapContainer, TileLayer, Circle, Marker, Popup, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { BOOTHS } from '../data/mockData.js'
import { useApp } from '../context/AppContext.jsx'
import { MapPin, Download } from 'lucide-react'

// fix default icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: null, iconUrl: null, shadowUrl: null })

function boothIcon(color) {
  return L.divIcon({
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>`,
    className:'', iconSize:[18,18], iconAnchor:[9,9]
  })
}

const FILTERS = ['All','High','Medium','Low']
const DENSITY_COLOR = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' }

export default function BoothMap() {
  const [filter, setFilter] = useState('All')
  const { darkMode, showToast } = useApp()

  const filtered = filter === 'All' ? BOOTHS : BOOTHS.filter(b => b.density === filter)

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Booth Map</div>
          <div className="page-subtitle">Geographic distribution and voter density heatmap</div>
        </div>
        <div className="page-actions">
          <div className="map-filters">
            {FILTERS.map(f => (
              <button key={f} className={`filter-chip${filter===f?' active':''}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => showToast('Map exported!')}><Download size={14}/>Export</button>
        </div>
      </div>

      <div className="map-wrapper" style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <MapContainer
          center={[28.7041, 77.1025]}
          zoom={12}
          style={{ height: 460, borderRadius: 0, border: '1px solid var(--border)', zIndex: 1 }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <ZoomControl position="bottomright" />

          {filtered.map(booth => (
            <Circle
              key={booth.id + '-hl'}
              center={[booth.lat, booth.lng]}
              radius={600}
              pathOptions={{ color: DENSITY_COLOR[booth.density], fillColor: DENSITY_COLOR[booth.density], fillOpacity: 0.18, weight: 1 }}
            />
          ))}

          {filtered.map(booth => (
            <Marker key={booth.id} position={[booth.lat, booth.lng]} icon={boothIcon(DENSITY_COLOR[booth.density])}>
              <Popup>
                <div className="booth-popup-card">
                  <div className="popup-header"><MapPin size={14} style={{ marginRight: 5 }} />{booth.name}</div>
                  <div className="popup-row"><span>Registered Voters</span><strong>{booth.voters.toLocaleString()}</strong></div>
                  <div className="popup-row"><span>Coverage</span><strong>{booth.coverage}%</strong></div>
                  <div className="popup-row"><span>Top Issue</span><strong>{booth.topIssue}</strong></div>
                  <div className="popup-row"><span>Officer</span><strong>{booth.officer}</strong></div>
                  <div>
                    <span className={`popup-badge ${booth.density === 'High' ? 'tag-high' : booth.density === 'Medium' ? 'tag-med' : 'tag-low'}`}>
                      {booth.density} Density
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="card map-legend" style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 999 }}>
          <div className="legend-title">Density Legend</div>
          {['High','Medium','Low'].map(d => (
            <div className="legend-row" key={d}>
              <span className="legend-icon" style={{ background: DENSITY_COLOR[d] }} />
              {d} Density
            </div>
          ))}
          <div className="legend-row" style={{marginTop:'.4rem', paddingTop:'.4rem', borderTop:'1px solid var(--border)'}}>
            <span className="legend-icon booth-icon" />Booth Location
          </div>
        </div>
      </div>

      <div className="booth-cards-row">
        {BOOTHS.map(b => (
          <div key={b.id} className="booth-mini-card">
            <div className="booth-mini-id">{b.name}</div>
            <div className="booth-mini-voters">{b.voters.toLocaleString()}</div>
            <div className="booth-mini-label">Registered Voters</div>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.4rem' }}>Coverage: {b.coverage}%</div>
            <span className={`booth-mini-tag ${b.density.toLowerCase() === 'high' ? 'tag-high' : b.density.toLowerCase() === 'medium' ? 'tag-med' : 'tag-low'}`}>
              {b.density}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
