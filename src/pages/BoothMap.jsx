/**
 * BoothMap.jsx — Full-Screen Map UI (Google Maps style)
 *
 * Everything lives ON the map as floating elements:
 *   • Floating top bar (title + breadcrumb + search)
 *   • Floating level pill
 *   • Floating back / reset buttons
 *   • Floating bottom sheet (booth details + sections)
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Map, { Marker, Popup, Source, Layer, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Search, ChevronRight, ArrowLeft, RotateCcw, MapPin,
  Building2, Layers, CheckCircle, XCircle, X, ChevronDown, ChevronUp
} from 'lucide-react';
import * as api from '../services/api.js';

// ── Constants ───────────────────────────────────────────────────────────────
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const DELHI     = { longitude: 77.1025, latitude: 28.7041, zoom: 10 };

// ── Cluster / point layers ──────────────────────────────────────────────────
const clusterCircle = {
  id: 'clusters', type: 'circle', source: 'booths',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': ['step', ['get', 'point_count'], '#f97316', 30, '#ef4444', 100, '#dc2626'],
    'circle-radius': ['step', ['get', 'point_count'], 24, 30, 34, 100, 46],
    'circle-stroke-width': 3, 'circle-stroke-color': '#fff', 'circle-opacity': 0.92,
  },
};
const clusterCount = {
  id: 'cluster-count', type: 'symbol', source: 'booths',
  filter: ['has', 'point_count'],
  layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 14, 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'] },
  paint: { 'text-color': '#fff' },
};
const pointLayer = {
  id: 'booth-points', type: 'circle', source: 'booths',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': '#f97316', 'circle-radius': 11,
    'circle-stroke-width': 3, 'circle-stroke-color': '#fff', 'circle-opacity': 0.95,
  },
};

function toGeoJSON(items) {
  return {
    type: 'FeatureCollection',
    features: items.map(it => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [it.lng, it.lat] },
      properties: { ...it },
    })),
  };
}

// ── Glass panel style helper ────────────────────────────────────────────────
const glass = 'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-white/40 dark:border-zinc-700/60 shadow-xl';

// ── Map pin marker ──────────────────────────────────────────────────────────
function PinMarker({ lng, lat, color, ring, label, size = 44, onClick }) {
  return (
    <Marker longitude={lng} latitude={lat} anchor="center">
      <button onClick={onClick} title={label}
        style={{ background: color, border: `3px solid ${ring ?? '#fff'}`, width: size, height: size }}
        className="rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
      >
        <span className="text-white font-bold leading-tight text-center"
          style={{ fontSize: 9, maxWidth: size - 10, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {(label || '').slice(0, 6)}
        </span>
      </button>
    </Marker>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function BoothMap() {
  const mapRef = useRef(null);

  const [level, setLevel]     = useState('DISTRICT');
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sheetOpen, setSheetOpen]   = useState(false);

  const [districts, setDistricts] = useState([]);
  const [acs,       setAcs]       = useState([]);
  const [booths,    setBooths]    = useState([]);
  const [sections,  setSections]  = useState([]);

  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedAC,       setSelectedAC]       = useState(null);
  const [selectedBooth,    setSelectedBooth]    = useState(null);

  const [viewState, setViewState] = useState(DELHI);

  // ── Init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      try { setDistricts(await api.fetchDistricts()); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const flyTo = useCallback((lng, lat, zoom = 11, dur = 1800) =>
    mapRef.current?.flyTo({ center: [lng, lat], zoom, speed: 1.4, duration: dur }), []);

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleSelectDistrict = useCallback(async (d) => {
    setSelectedDistrict(d); setSelectedAC(null); setSelectedBooth(null);
    setAcs([]); setBooths([]); setSections([]);
    setSheetOpen(false); setSearch('');
    setLevel('AC'); flyTo(d.lng, d.lat, 11);
    setLoading(true);
    try { setAcs(await api.fetchAcs(d)); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [flyTo]);

  const handleSelectAC = useCallback(async (ac) => {
    setSelectedAC(ac); setSelectedBooth(null);
    setBooths([]); setSections([]);
    setSheetOpen(false); setSearch('');
    setLevel('BOOTH'); flyTo(ac.lng, ac.lat, 13);
    setLoading(true);
    try {
      const data = await api.fetchBooths(ac, selectedDistrict?.districtId);
      setBooths(data);
      if (data.length) flyTo(data[0].lng, data[0].lat, 13, 900);
    }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [flyTo, selectedDistrict]);

  const handleSelectBooth = useCallback(async (booth) => {
    setSelectedBooth(booth); setSheetOpen(true);
    flyTo(booth.lng, booth.lat, 16);
    setSections([]);
    setLoading(true);
    try { setSections(await api.fetchSections(booth.partId ?? booth.id)); }
    catch { setSections([]); }
    finally { setLoading(false); }
  }, [flyTo]);

  const handleBack = useCallback(() => {
    setSheetOpen(false); setSearch('');
    if (level === 'BOOTH' || level === 'SECTION') {
      setLevel('AC');
      setSelectedBooth(null); setSections([]);
      if (selectedAC) flyTo(selectedAC.lng, selectedAC.lat, 12);
    } else if (level === 'AC') {
      setLevel('DISTRICT');
      setSelectedDistrict(null); setSelectedAC(null); setAcs([]);
      flyTo(DELHI.longitude, DELHI.latitude, DELHI.zoom, 2000);
    }
  }, [level, selectedAC, flyTo]);

  const handleReset = useCallback(() => {
    setLevel('DISTRICT'); setSearch(''); setSheetOpen(false);
    setSelectedDistrict(null); setSelectedAC(null); setSelectedBooth(null);
    setAcs([]); setBooths([]); setSections([]);
    flyTo(DELHI.longitude, DELHI.latitude, DELHI.zoom, 2000);
  }, [flyTo]);

  // ── Map click ────────────────────────────────────────────────────────
  const onMapClick = useCallback(async (e) => {
    if (!mapRef.current || (level !== 'BOOTH' && level !== 'SECTION')) {
      if (level !== 'BOOTH' && level !== 'SECTION') setSheetOpen(false);
      return;
    }
    const style = mapRef.current.getStyle();
    const ids = (style?.layers ?? []).map(l => l.id);
    const q = ['clusters', 'booth-points'].filter(id => ids.includes(id));
    if (!q.length) return;
    const feats = mapRef.current.queryRenderedFeatures(e.point, { layers: q });
    if (!feats.length) { setSheetOpen(false); return; }
    const f = feats[0];
    if (f.layer.id === 'clusters') {
      mapRef.current.getSource('booths')?.getClusterExpansionZoom(f.properties.cluster_id, (err, zoom) => {
        if (!err) mapRef.current.easeTo({ center: f.geometry.coordinates, zoom, duration: 500 });
      });
    } else if (f.layer.id === 'booth-points') {
      await handleSelectBooth(f.properties);
    }
  }, [level, handleSelectBooth]);

  // ── Filtered markers ─────────────────────────────────────────────────
  const q = search.toLowerCase();
  const visibleDistricts = useMemo(() =>
    districts.filter(d => !q || (d.districtName||'').toLowerCase().includes(q)), [districts, q]);
  const visibleAcs = useMemo(() =>
    acs.filter(ac => !q || (ac.acName||ac.name||'').toLowerCase().includes(q)), [acs, q]);

  const boothGeoJSON = useMemo(() => toGeoJSON(booths), [booths]);

  // ── Level config ─────────────────────────────────────────────────────
  const levelConfig = {
    DISTRICT: { label: 'Districts',          color: 'bg-blue-600',    count: districts.length },
    AC:       { label: 'Constituencies',     color: 'bg-emerald-600', count: acs.length },
    BOOTH:    { label: 'Booths',             color: 'bg-orange-500',  count: booths.length },
    SECTION:  { label: 'Sections',           color: 'bg-purple-600',  count: sections.length },
  }[level];

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>

      {/* ── FULL SCREEN MAP ──────────────────────────────────────────── */}
      <Map
        ref={mapRef}
        {...viewState}
        onMove={e => setViewState(e.viewState)}
        mapStyle={MAP_STYLE}
        interactiveLayerIds={['clusters', 'booth-points']}
        onClick={onMapClick}
        style={{ position: 'absolute', inset: 0 }}
      >
        <NavigationControl position="bottom-right" />

        {/* District markers */}
        {level === 'DISTRICT' && visibleDistricts.map((d, i) => (
          <PinMarker key={d.districtId ?? i} lng={d.lng} lat={d.lat}
            color="#3b82f6" ring="#1d4ed8"
            label={d.districtName || d.name}
            onClick={() => handleSelectDistrict(d)} />
        ))}

        {/* AC markers */}
        {level === 'AC' && visibleAcs.map((ac, i) => (
          <PinMarker key={ac.acNumber ?? i} lng={ac.lng} lat={ac.lat}
            color="#10b981"
            ring={selectedAC?.acNumber === ac.acNumber ? '#047857' : '#fff'}
            label={ac.acName || ac.name}
            onClick={() => handleSelectAC(ac)} />
        ))}

        {/* Booth cluster layer */}
        {(level === 'BOOTH' || level === 'SECTION') && booths.length > 0 && (
          <Source id="booths" type="geojson" data={boothGeoJSON} cluster clusterMaxZoom={15} clusterRadius={50}>
            <Layer {...clusterCircle} />
            <Layer {...clusterCount} />
            <Layer {...pointLayer} />
          </Source>
        )}
      </Map>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* FLOATING UI — always on top of the map                        */}
      {/* ══════════════════════════════════════════════════════════════ */}

      {/* ── TOP BAR ────────────────────────────────────────────────── */}
      <div className={`absolute top-4 left-4 right-4 z-10 ${glass} rounded-2xl px-4 py-3 flex items-center gap-3`}>

        {/* Logo */}
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <MapPin size={13} className="text-white" />
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
          <button onClick={handleReset}
            className="text-xs font-semibold text-indigo-600 hover:underline whitespace-nowrap shrink-0">
            Delhi
          </button>
          {selectedDistrict && (<>
            <ChevronRight size={11} className="text-gray-400 shrink-0" />
            <button onClick={() => handleSelectDistrict(selectedDistrict)}
              className="text-xs font-semibold text-indigo-600 hover:underline truncate max-w-[90px]">
              {selectedDistrict.districtName}
            </button>
          </>)}
          {selectedAC && (<>
            <ChevronRight size={11} className="text-gray-400 shrink-0" />
            <button onClick={() => handleSelectAC(selectedAC)}
              className="text-xs font-semibold text-indigo-600 hover:underline whitespace-nowrap">
              AC {selectedAC.acNumber}
            </button>
          </>)}
          {selectedBooth && (<>
            <ChevronRight size={11} className="text-gray-400 shrink-0" />
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 truncate max-w-[100px]">
              {selectedBooth.partName}
            </span>
          </>)}
        </div>

        {/* Level pill */}
        <span className={`hidden sm:inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full text-white shrink-0 ${levelConfig.color}`}>
          {levelConfig.label} · {levelConfig.count}
        </span>

        {/* Search toggle */}
        <button onClick={() => setShowSearch(s => !s)}
          className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center hover:bg-indigo-100 transition-colors shrink-0">
          <Search size={14} className="text-indigo-600" />
        </button>
      </div>

      {/* ── SEARCH DROPDOWN ──────────────────────────────────────────── */}
      {showSearch && (
        <div className={`absolute top-20 right-4 z-10 ${glass} rounded-2xl p-3 w-64 shadow-2xl`}>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${level === 'DISTRICT' ? 'districts' : level === 'AC' ? 'ACs' : 'booths'}…`}
              className="w-full pl-8 pr-8 py-2 text-xs rounded-xl border border-gray-200 dark:border-zinc-600 bg-white/70 dark:bg-zinc-800/70 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={12} />
              </button>
            )}
          </div>
          {/* Quick result pills */}
          {level === 'DISTRICT' && search && (
            <div className="mt-2 flex flex-col gap-1 max-h-40 overflow-y-auto">
              {visibleDistricts.map((d, i) => (
                <button key={i} onClick={() => { handleSelectDistrict(d); setShowSearch(false); }}
                  className="text-left text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-200 transition-colors">
                  {d.districtName}
                </button>
              ))}
            </div>
          )}
          {level === 'AC' && search && (
            <div className="mt-2 flex flex-col gap-1 max-h-40 overflow-y-auto">
              {visibleAcs.map((ac, i) => (
                <button key={i} onClick={() => { handleSelectAC(ac); setShowSearch(false); }}
                  className="text-left text-xs px-3 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-gray-700 dark:text-gray-200 transition-colors">
                  {ac.acName || ac.name} <span className="text-gray-400">·  AC {ac.acNumber}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── BACK + RESET buttons (bottom-left) ───────────────────────── */}
      <div className="absolute bottom-6 left-4 z-10 flex gap-2">
        {level !== 'DISTRICT' && (
          <button onClick={handleBack}
            className={`${glass} flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/90 transition-all`}>
            <ArrowLeft size={13} /> Back
          </button>
        )}
        <button onClick={handleReset}
          className={`${glass} flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-white/90 transition-all`}>
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      {/* ── LOADING SPINNER (center) ─────────────────────────────────── */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className={`${glass} p-4 rounded-2xl`}>
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
          </div>
        </div>
      )}

      {/* ── BOTTOM SHEET — booth detail card ─────────────────────────── */}
      {sheetOpen && selectedBooth && (
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-10 ${glass} rounded-2xl w-full max-w-md mx-4 shadow-2xl`}
          style={{ left: '50%', transform: 'translateX(-50%)' }}>

          {/* Handle / collapse */}
          <div className="flex items-start justify-between px-5 pt-4 pb-2">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-0.5">
                Booth {selectedBooth.partNumber}
              </div>
              <h3 className="text-base font-extrabold text-gray-800 dark:text-white leading-tight truncate">
                {selectedBooth.partName}
              </h3>
              {selectedBooth.pollingStationName && (
                <p className="text-xs text-gray-500 mt-0.5">{selectedBooth.pollingStationName}</p>
              )}
              {selectedBooth.pollingStationAddress && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">{selectedBooth.pollingStationAddress}</p>
              )}
            </div>
            <button onClick={() => setSheetOpen(false)}
              className="ml-3 w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-700 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0">
              <X size={13} className="text-gray-500" />
            </button>
          </div>

          {/* Section info */}
          <div className="px-5 pb-4">
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-3 h-3 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
                Loading sections…
              </div>
            ) : sections.length > 0 ? (
              <>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full mb-3">
                  <CheckCircle size={12} /> {sections.length} Section{sections.length > 1 ? 's' : ''} Available
                </span>
                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto">
                  {sections.map((s, i) => (
                    <div key={s.sectionId ?? i}
                      className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 rounded-lg px-2.5 py-1.5">
                      <span className="w-5 h-5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {s.sectionId}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-300 truncate">{s.sectionName}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
                <XCircle size={12} /> No sections available for this booth
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── AC level floating info strip ─────────────────────────────── */}
      {level === 'AC' && !sheetOpen && (
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-10 ${glass} rounded-2xl px-5 py-3 flex items-center gap-3`}>
          <Building2 size={14} className="text-emerald-500 shrink-0" />
          <div>
            <p className="text-xs font-bold text-gray-800 dark:text-white">{selectedDistrict?.districtName}</p>
            <p className="text-[10px] text-gray-400">{acs.length} Assembly Constituencies — click to view booths</p>
          </div>
        </div>
      )}

      {/* ── DISTRICT level hint ───────────────────────────────────────── */}
      {level === 'DISTRICT' && (
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-10 ${glass} rounded-2xl px-5 py-3 flex items-center gap-3`}>
          <Layers size={14} className="text-blue-500 shrink-0" />
          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
            Click a district marker to explore Assembly Constituencies
          </p>
        </div>
      )}
    </div>
  );
}
