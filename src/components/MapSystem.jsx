import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, ChevronRight, Navigation, Building, MapPin, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';

const API_BASE = 'http://localhost:8081/api';

const INITIAL_CENTER = [28.6139, 77.2090];
const INITIAL_ZOOM = 10;

// Custom Marker Icons
const defaultIcon = L.divIcon({
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#10b981;border:2px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,0.3)"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8]
});

const selectedIcon = L.divIcon({
  html: `<div style="width:24px;height:24px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 4px 8px rgba(0,0,0,0.4);animation: pulse 2s infinite;"></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

// A component to dynamically change map view
const MapOverlayer = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true, duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
};

export default function MapSystem() {
  const [level, setLevel] = useState('district'); 
  const [districts, setDistricts] = useState([]);
  const [acs, setAcs] = useState([]);
  const [booths, setBooths] = useState([]);
  const [sections, setSections] = useState([]);

  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedAC, setSelectedAC] = useState(null);
  const [selectedBooth, setSelectedBooth] = useState(null);

  const [loading, setLoading] = useState(false);
  
  // State to control map view
  const [mapCenter, setMapCenter] = useState(INITIAL_CENTER);
  const [mapZoom, setMapZoom] = useState(INITIAL_ZOOM);

  const mapRef = useRef(null);

  useEffect(() => {
    fetchDistricts();
  }, []);

  const safeData = (data) => Array.isArray(data) ? data : (data?.features || []);

  const fetchDistricts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/districts`);
      const data = await res.json();
      setDistricts(safeData(data));
    } catch (err) {
      console.error('Error fetching districts:', err);
      setDistricts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAcs = async (districtRaw) => {
    // Determine the true object if it's nested in a GeoJSON feature
    const district = districtRaw.properties ? districtRaw.properties : districtRaw;
    const districtId = district.districtId || district.id;

    setLoading(true);
    setSelectedDistrict(district);
    setLevel('ac');
    setSelectedAC(null);
    setSelectedBooth(null);
    setBooths([]);
    setSections([]);

    setMapCenter(INITIAL_CENTER);
    setMapZoom(11);

    try {
      // Encode URL properly to prevent 400 Bad Request
      const res = await fetch(`${API_BASE}/districts/${encodeURIComponent(districtId)}/acs`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setAcs(safeData(data));
    } catch (err) {
      console.error('Error fetching ACs:', err);
      setAcs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBooths = async (acRaw) => {
    const ac = acRaw.properties ? acRaw.properties : acRaw;
    const acNumber = ac.acNumber || ac.id;
    const districtId = selectedDistrict?.districtId || selectedDistrict?.id || '';

    setLoading(true);
    setSelectedAC(ac);
    setLevel('booth');
    setSelectedBooth(null);
    setSections([]);
    
    setMapZoom(12);

    try {
      // Try fetching booths securely
      let res = await fetch(`${API_BASE}/acs/${encodeURIComponent(acNumber)}/booths?districtId=${encodeURIComponent(districtId)}`);
      if (!res.ok) {
        // Fallback if the endpoint is different
        res = await fetch(`${API_BASE}/booths?acId=${encodeURIComponent(acNumber)}`);
      }
      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      let data = await res.json();
      let boothsArray = safeData(data);
      
      boothsArray = boothsArray.map(bRaw => {
        const b = bRaw.properties ? bRaw.properties : bRaw;
        // Inject dummy lat/lng if the backend model lacks it (i.e. if it's BoothPart not Booth)
        if (b.latitude && b.longitude) return b;
        return {
          ...b,
          latitude: INITIAL_CENTER[0] + (((b.partId || b.id || 1) * 17) % 100 / 100 - 0.5) * 0.1,
          longitude: INITIAL_CENTER[1] + (((b.partId || b.id || 1) * 13) % 100 / 100 - 0.5) * 0.1
        };
      });

      setBooths(boothsArray);
      
      if (boothsArray.length > 0) {
        setMapCenter([boothsArray[0].latitude, boothsArray[0].longitude]);
      }
    } catch (err) {
      console.error('Error fetching Booths:', err);
      setBooths([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async (boothRaw) => {
    const booth = boothRaw.properties ? boothRaw.properties : boothRaw;
    setLoading(true);
    setSelectedBooth(booth);
    setLevel('section');
    
    setMapCenter([booth.latitude, booth.longitude]);
    setMapZoom(15);
    
    if (mapRef.current) {
        mapRef.current.setView([booth.latitude, booth.longitude], 15, { animate: true });
    }

    try {
      const res = await fetch(`${API_BASE}/booths/${booth.partId || booth.id}/sections`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setSections(safeData(data));
    } catch (err) {
      console.error('Error fetching sections:', err);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (level === 'section') {
      setLevel('booth');
      setSelectedBooth(null);
      setSections([]);
      setMapZoom(12);
    } else if (level === 'booth') {
      setLevel('ac');
      setSelectedAC(null);
      setBooths([]);
      setMapCenter(INITIAL_CENTER);
      setMapZoom(11);
    } else if (level === 'ac') {
      setLevel('district');
      setSelectedDistrict(null);
      setAcs([]);
      setMapCenter(INITIAL_CENTER);
      setMapZoom(INITIAL_ZOOM);
    }
  };

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <div className="w-96 bg-white border-r border-neutral-200 flex flex-col shadow-xl z-[1000] relative">
        <div className="bg-slate-900 text-white p-6">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="text-blue-400 w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">Booth Manager</h1>
          </div>
          <p className="text-slate-400 text-sm">Leaflet Maps Integration</p>
        </div>

        <div className="bg-slate-800 text-slate-300 px-6 py-3 text-sm flex items-center space-x-2 border-b border-slate-700">
          <span 
            className={`cursor-pointer hover:text-white transition-colors ${level === 'district' ? 'text-white font-semibold' : ''}`}
            onClick={() => { setLevel('district'); setSelectedDistrict(null); setSelectedAC(null); setSelectedBooth(null); setMapCenter(INITIAL_CENTER); setMapZoom(INITIAL_ZOOM); }}
          >
            Delhi
          </span>
          {selectedDistrict && (
            <>
              <ChevronRight className="w-4 h-4 text-slate-500" />
              <span 
                className={`cursor-pointer hover:text-white transition-colors ${level === 'ac' ? 'text-white font-semibold' : ''}`}
                onClick={() => { setLevel('ac'); setSelectedAC(null); setSelectedBooth(null); setMapZoom(11); }}
              >
                {selectedDistrict.districtName || selectedDistrict.name}
              </span>
            </>
          )}
          {selectedAC && (
            <>
              <ChevronRight className="w-4 h-4 text-slate-500" />
              <span 
                className={`cursor-pointer hover:text-white transition-colors ${level === 'booth' ? 'text-white font-semibold' : ''}`}
                onClick={() => { setLevel('booth'); setSelectedBooth(null); setMapZoom(12); }}
              >
                {selectedAC.acName || selectedAC.name}
              </span>
            </>
          )}
        </div>

        {level !== 'district' && (
          <div className="px-6 py-3 border-b border-neutral-100 bg-white">
            <button 
              onClick={handleBack}
              className="flex items-center text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {loading && (
            <div className="flex items-center justify-center p-8 text-blue-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {!loading && level === 'district' && (
            <div className="animate-fade-in">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Select District</h2>
              <div className="space-y-2">
                {districts.map((dRaw, i) => {
                  const d = dRaw.properties ? dRaw.properties : dRaw;
                  return (
                  <button key={d.districtId || d.id || i} onClick={() => fetchAcs(dRaw)} className="w-full text-left p-4 rounded-xl border border-neutral-200 hover:border-blue-400 hover:bg-blue-50 flex items-center justify-between group">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3"><Navigation className="w-5 h-5"/></div>
                      <span className="font-semibold text-slate-700">{d.districtName || d.name || 'Unknown'}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </button>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && level === 'ac' && (
            <div className="animate-fade-in">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Select AC</h2>
              <div className="space-y-2">
                {acs.map((acRaw, i) => {
                  const ac = acRaw.properties ? acRaw.properties : acRaw;
                  return (
                  <button key={ac.acNumber || ac.id || i} onClick={() => fetchBooths(acRaw)} className="w-full text-left p-4 rounded-xl border border-neutral-200 hover:border-indigo-400 hover:bg-indigo-50 flex items-center justify-between group">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3"><Building className="w-5 h-5"/></div>
                      <div>
                        <span className="block font-semibold text-slate-700">{ac.acName || ac.name || 'Unknown'}</span>
                        <span className="text-xs text-slate-500">AC No: {ac.acNumber || ac.id || ''}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </button>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && level === 'booth' && (
            <div className="animate-fade-in space-y-3">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Select Polling Booth</h2>
              {booths.map((b) => (
                <button key={b.partId || b.id} onClick={() => fetchSections(b)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedBooth?.partId === b.partId ? 'border-blue-500 bg-blue-50 relative' : 'border-neutral-200 hover:border-emerald-400 hover:bg-emerald-50'}`}>
                  {selectedBooth?.partId === b.partId && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl"></div>}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800">Booth {b.partNumber || b.name}</h3>
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">{b.partName || "Main Booth"}</p>
                  <p className="text-xs text-slate-500 bg-white/50 p-2 border border-slate-100 rounded">
                    <MapPin className="w-3 h-3 inline mr-1 text-slate-400" />
                    {b.pollingStationName || 'Station Coordinates Available'} {b.pollingStationAddress && `- ${b.pollingStationAddress}`}
                  </p>
                </button>
              ))}
            </div>
          )}

          {!loading && level === 'section' && selectedBooth && (
            <div className="animate-fade-in space-y-4">
              <div className="bg-white border text-left p-5 rounded-xl border-emerald-200 bg-emerald-50/50">
                <h3 className="font-bold text-emerald-900 mb-2">Booth {selectedBooth.partNumber}</h3>
                <h4 className="text-sm font-medium text-emerald-800">{selectedBooth.partName}</h4>
              </div>

              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-6">Sections</h2>
              {sections.length > 0 ? (
                <div className="space-y-2">
                  {sections.map((sec, i) => (
                    <div key={sec.sectionId || i} className="p-4 bg-white border border-slate-200 rounded-xl flex gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                        S{sec.sectionId}
                      </div>
                      <div className="text-sm font-medium text-slate-700 flex-1 leading-snug">
                        {sec.sectionName}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3 opacity-80" />
                  <p className="font-medium text-slate-700">No sections available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MAP AREA */}
      <div className="flex-1 relative z-0">
        <MapContainer
          center={INITIAL_CENTER}
          zoom={INITIAL_ZOOM}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
          whenCreated={mapInstance => { mapRef.current = mapInstance }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapOverlayer center={mapCenter} zoom={mapZoom} />

          {(level === 'booth' || level === 'section') && booths.map((booth, idx) => {
            const isSelected = selectedBooth && selectedBooth.partId === booth.partId;
            return (
              <Marker 
                key={booth.partId || idx} 
                position={[booth.latitude, booth.longitude]}
                icon={isSelected ? selectedIcon : defaultIcon}
                eventHandlers={{
                  click: () => {
                    fetchSections(booth);
                  }
                }}
              >
                <Popup className="custom-popup">
                  <div className="font-bold text-sm">Booth {booth.partNumber || booth.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{booth.partName}</div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
            100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
          }
          .custom-popup .leaflet-popup-content-wrapper {
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
        `}} />
      </div>
    </div>
  );
}
