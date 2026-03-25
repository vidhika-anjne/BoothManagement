/**
 * MapComponent.jsx — Core Mapbox GL drill-down map.
 * District → AC → Booth → Section hierarchy with flyTo animations,
 * marker clustering at booth level, and custom marker icons.
 *
 * Uses react-map-gl (maplibre flavour already installed in project).
 * For Mapbox geocoding, set VITE_MAPBOX_TOKEN in your .env file.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Map, { Marker, Popup, Source, Layer, NavigationControl, ScaleControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import Sidebar from './Sidebar.jsx';
import BoothDetails from './BoothDetails.jsx';
import * as api from '../../services/api.js';

// ── Constants ────────────────────────────────────────────────────────────────
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? null;
const MAP_STYLE    = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const INITIAL_VIEW = { longitude: 77.1025, latitude: 28.7041, zoom: 10 };

// ── Layer Configs ─────────────────────────────────────────────────────────────
const clusterCircleLayer = {
  id: 'clusters',
  type: 'circle',
  source: 'booths',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': ['step', ['get', 'point_count'], '#6366f1', 20, '#f59e0b', 100, '#ef4444'],
    'circle-radius': ['step', ['get', 'point_count'], 22, 20, 32, 100, 44],
    'circle-stroke-width': 3,
    'circle-stroke-color': '#fff',
    'circle-opacity': 0.9,
  },
};

const clusterCountLayer = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'booths',
  filter: ['has', 'point_count'],
  layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 13, 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'] },
  paint: { 'text-color': '#fff' },
};

const unclusteredLayer = {
  id: 'unclustered',
  type: 'circle',
  source: 'booths',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': '#f59e0b',
    'circle-radius': 8,
    'circle-stroke-width': 2.5,
    'circle-stroke-color': '#fff',
    'circle-opacity': 0.95,
  },
};

// ── Helper: build GeoJSON from booths array ───────────────────────────────────
function toGeoJSON(booths) {
  return {
    type: 'FeatureCollection',
    features: booths.map(b => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [b.lng, b.lat] },
      properties: { ...b },
    })),
  };
}

// ── Custom marker components ──────────────────────────────────────────────────
function DistrictMarker({ d, onClick }) {
  return (
    <Marker longitude={d.lng} latitude={d.lat} anchor="center">
      <button
        onClick={() => onClick(d)}
        title={d.districtName || d.name}
        className="w-10 h-10 rounded-full bg-indigo-600 border-3 border-white shadow-lg flex items-center justify-center hover:bg-indigo-500 hover:scale-110 transition-transform cursor-pointer"
        style={{ border: '3px solid #fff' }}
      >
        <span className="text-white text-[10px] font-bold leading-tight text-center px-0.5 truncate">
          {(d.districtName || d.name || '').slice(0, 4)}
        </span>
      </button>
    </Marker>
  );
}

function AcMarker({ ac, onClick }) {
  return (
    <Marker longitude={ac.lng} latitude={ac.lat} anchor="center">
      <button
        onClick={() => onClick(ac)}
        title={ac.acName || ac.name}
        className="w-9 h-9 rounded-full bg-emerald-500 border-white shadow-lg flex items-center justify-center hover:bg-emerald-400 hover:scale-110 transition-transform cursor-pointer"
        style={{ border: '3px solid #fff' }}
      >
        <span className="text-white text-[9px] font-bold leading-tight px-0.5 truncate">
          {(ac.acName || ac.name || '').slice(0, 4)}
        </span>
      </button>
    </Marker>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MapComponent() {
  const mapRef = useRef(null);

  const [level, setLevel] = useState('DISTRICT');
  const [loading, setLoading] = useState(false);

  const [districts, setDistricts] = useState([]);
  const [acs, setAcs]             = useState([]);
  const [booths, setBooths]       = useState([]);
  const [sections, setSections]   = useState([]);

  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedAC, setSelectedAC]             = useState(null);
  const [selectedBooth, setSelectedBooth]       = useState(null);

  // Popup state (for in-map booth details)
  const [detailPopup, setDetailPopup] = useState(null);

  const [viewState, setViewState] = useState(INITIAL_VIEW);

  // ── Load Districts on Mount ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api.fetchDistricts();
        setDistricts(data);
      } catch (err) {
        console.error('[MapComponent] fetchDistricts error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── flyTo helper ─────────────────────────────────────────────────────────
  const flyTo = useCallback((lng, lat, zoom, duration = 1800) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom, speed: 1.4, duration });
  }, []);

  // ── Select District ───────────────────────────────────────────────────────
  const handleSelectDistrict = useCallback(async (district) => {
    setSelectedDistrict(district);
    setSelectedAC(null);
    setSelectedBooth(null);
    setAcs([]);
    setBooths([]);
    setSections([]);
    setDetailPopup(null);
    setLevel('AC');
    flyTo(district.lng, district.lat, 11);
    setLoading(true);
    try {
      const data = await api.fetchAcs(district);
      setAcs(data);
    } catch (err) {
      console.error('[MapComponent] fetchAcs error:', err);
    } finally {
      setLoading(false);
    }
  }, [flyTo]);

  // ── Select AC ─────────────────────────────────────────────────────────────
  const handleSelectAC = useCallback(async (ac) => {
    setSelectedAC(ac);
    setSelectedBooth(null);
    setBooths([]);
    setSections([]);
    setDetailPopup(null);
    setLevel('BOOTH');
    flyTo(ac.lng, ac.lat, 13);
    setLoading(true);
    try {
      const data = await api.fetchBooths(ac, selectedDistrict?.districtId, MAPBOX_TOKEN);
      setBooths(data);
      // Fly to first available booth cluster
      if (data.length > 0) flyTo(data[0].lng, data[0].lat, 13, 1000);
    } catch (err) {
      console.error('[MapComponent] fetchBooths error:', err);
    } finally {
      setLoading(false);
    }
  }, [flyTo, selectedDistrict]);

  // ── Select Booth ──────────────────────────────────────────────────────────
  const handleSelectBooth = useCallback(async (booth) => {
    setSelectedBooth(booth);
    setDetailPopup(booth);
    setLevel('SECTION');
    flyTo(booth.lng, booth.lat, 16);
    setLoading(true);
    try {
      const data = await api.fetchSections(booth.partId ?? booth.id);
      setSections(data);
    } catch (err) {
      console.error('[MapComponent] fetchSections error:', err);
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, [flyTo]);

  // ── Back Navigation ───────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    setDetailPopup(null);
    if (level === 'SECTION') {
      setLevel('BOOTH');
      setSelectedBooth(null);
      setSections([]);
    } else if (level === 'BOOTH') {
      setLevel('AC');
      setSelectedAC(null);
      setBooths([]);
      flyTo(selectedDistrict?.lng ?? INITIAL_VIEW.longitude, selectedDistrict?.lat ?? INITIAL_VIEW.latitude, 11);
    } else if (level === 'AC') {
      setLevel('DISTRICT');
      setSelectedDistrict(null);
      setAcs([]);
      flyTo(INITIAL_VIEW.longitude, INITIAL_VIEW.latitude, INITIAL_VIEW.zoom);
    }
  }, [level, selectedDistrict, flyTo]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setLevel('DISTRICT');
    setSelectedDistrict(null); setSelectedAC(null); setSelectedBooth(null);
    setAcs([]); setBooths([]); setSections([]);
    setDetailPopup(null);
    flyTo(INITIAL_VIEW.longitude, INITIAL_VIEW.latitude, INITIAL_VIEW.zoom, 2000);
  }, [flyTo]);

  // ── Map click handler (cluster expansion + booth selection) ───────────────
  const onMapClick = useCallback(async (e) => {
    if (!mapRef.current) return;

    const features = mapRef.current.queryRenderedFeatures(e.point, {
      layers: ['clusters', 'unclustered'],
    });

    if (!features.length) { setDetailPopup(null); return; }

    const feat = features[0];

    if (feat.layer.id === 'clusters') {
      // Expand cluster
      const source = mapRef.current.getSource('booths');
      if (source) {
        const [lng, lat] = feat.geometry.coordinates;
        source.getClusterExpansionZoom(feat.properties.cluster_id, (err, zoom) => {
          if (!err) mapRef.current.easeTo({ center: [lng, lat], zoom, duration: 500 });
        });
      }
      return;
    }

    if (feat.layer.id === 'unclustered') {
      const props = feat.properties;
      await handleSelectBooth(props);
    }
  }, [handleSelectBooth]);

  // ── GeoJSON for booth clustering layer ───────────────────────────────────
  const boothGeoJSON = useMemo(() => toGeoJSON(booths), [booths]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full w-full overflow-hidden">

      {/* Sidebar */}
      <Sidebar
        level={level}
        loading={loading}
        districts={districts}
        acs={acs}
        booths={booths}
        sections={sections}
        selectedDistrict={selectedDistrict}
        selectedAC={selectedAC}
        selectedBooth={selectedBooth}
        onSelectDistrict={handleSelectDistrict}
        onSelectAC={handleSelectAC}
        onSelectBooth={handleSelectBooth}
        onBack={handleBack}
        onReset={handleReset}
      />

      {/* Map */}
      <div className="flex-1 relative">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle={MAP_STYLE}
          interactiveLayerIds={['clusters', 'unclustered']}
          onClick={onMapClick}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="bottom-right" />
          <ScaleControl position="bottom-left" />

          {/* District Markers */}
          {level === 'DISTRICT' && districts.map((d, i) => (
            <DistrictMarker key={d.districtId ?? i} d={d} onClick={handleSelectDistrict} />
          ))}

          {/* AC Markers */}
          {level === 'AC' && acs.map((ac, i) => (
            <AcMarker key={ac.acNumber ?? i} ac={ac} onClick={handleSelectAC} />
          ))}

          {/* Booth Cluster Layer */}
          {(level === 'BOOTH' || level === 'SECTION') && booths.length > 0 && (
            <Source id="booths" type="geojson" data={boothGeoJSON} cluster clusterMaxZoom={15} clusterRadius={45}>
              <Layer {...clusterCircleLayer} />
              <Layer {...clusterCountLayer} />
              <Layer {...unclusteredLayer} />
            </Source>
          )}

          {/* Booth Detail Popup */}
          {detailPopup && (
            <Popup
              longitude={detailPopup.lng}
              latitude={detailPopup.lat}
              anchor="bottom"
              closeOnClick={false}
              onClose={() => setDetailPopup(null)}
              offset={20}
              className="booth-detail-popup"
            >
              <BoothDetails
                booth={detailPopup}
                sections={sections}
                onClose={() => setDetailPopup(null)}
              />
            </Popup>
          )}
        </Map>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/30 dark:bg-black/30 backdrop-blur-sm z-20 pointer-events-none">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-lg" />
          </div>
        )}

        {/* Level badge */}
        <div className="absolute top-3 left-3 bg-white dark:bg-zinc-900 shadow-md rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          {level === 'DISTRICT' ? '🗺 Districts' : level === 'AC' ? '🏛 Assembly Constituencies' : level === 'BOOTH' ? '🗳 Booths' : '📋 Sections'}
        </div>
      </div>

      {/* Popup CSS fix — remove default maplibre padding */}
      <style>{`.booth-detail-popup .maplibregl-popup-content { padding: 0; background: transparent; border-radius: 1rem; box-shadow: none; }`}</style>
    </div>
  );
}
