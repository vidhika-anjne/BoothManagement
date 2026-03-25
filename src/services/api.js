/**
 * api.js — Central API service for Booth Management hierarchy.
 * Handles: Districts → ACs → Booths → Sections + Geocoding fallback with caching.
 */

import axios from 'axios';

const API_BASE   = 'http://localhost:8081/api';
const LOCATIONS  = `${API_BASE}/locations`;

// ── Delhi center fallback ──────────────────────────────────────────────────
const DELHI = { lng: 77.1025, lat: 28.7041 };

// ── In-memory geocoding cache ──────────────────────────────────────────────
const geocodeCache = new Map();

function jitter(baseLng, baseLat, spread = 0.05) {
  return {
    lng: baseLng + (Math.random() - 0.5) * spread,
    lat: baseLat + (Math.random() - 0.5) * spread,
  };
}

// ── Extract lng/lat from a GeoJSON geometry ────────────────────────────────
function coordsFromGeometry(geometry) {
  if (!geometry) return null;
  // Polygon / MultiPolygon → centroid of first ring
  if (geometry.type === 'Polygon' && geometry.coordinates?.[0]?.length) {
    const ring = geometry.coordinates[0];
    const lng = ring.reduce((s, c) => s + c[0], 0) / ring.length;
    const lat = ring.reduce((s, c) => s + c[1], 0) / ring.length;
    return { lng, lat };
  }
  if (geometry.type === 'MultiPolygon' && geometry.coordinates?.[0]?.[0]?.length) {
    const ring = geometry.coordinates[0][0];
    const lng = ring.reduce((s, c) => s + c[0], 0) / ring.length;
    const lat = ring.reduce((s, c) => s + c[1], 0) / ring.length;
    return { lng, lat };
  }
  if (geometry.type === 'Point') return { lng: geometry.coordinates[0], lat: geometry.coordinates[1] };
  return null;
}

// ── Mapbox Geocoding fallback ──────────────────────────────────────────────
export async function geocodeAddress(address, token) {
  if (!address || !token) return jitter(DELHI.lng, DELHI.lat);
  if (geocodeCache.has(address)) return geocodeCache.get(address);
  try {
    const res = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address + ', Delhi, India')}.json`,
      { params: { access_token: token, limit: 1, country: 'IN' } }
    );
    const [lng, lat] = res.data.features?.[0]?.center ?? [DELHI.lng, DELHI.lat];
    const coords = { lng, lat };
    geocodeCache.set(address, coords);
    return coords;
  } catch {
    return jitter(DELHI.lng, DELHI.lat);
  }
}

// ── Districts ──────────────────────────────────────────────────────────────
// Backend returns GeoJSON FeatureCollection: { type, features: [{ type, properties, geometry }] }
export async function fetchDistricts() {
  const res = await axios.get(`${API_BASE}/districts`);
  const payload = res.data;

  // Support both GeoJSON FeatureCollection and plain array
  const features = payload?.features ?? (Array.isArray(payload) ? payload : []);

  return features.map(f => {
    const props = f.properties ?? f;
    const geomCoords = coordsFromGeometry(f.geometry);
    // Use real centroid if GeoJSON polygon exists, else jitter around Delhi
    const { lng, lat } = geomCoords ?? jitter(DELHI.lng, DELHI.lat, 0.3);

    return {
      districtId:   props.districtId   ?? props.id,
      districtName: props.districtName ?? props.name ?? props.districtId,
      name:         props.name         ?? props.districtName,
      ...props,
      lng,
      lat,
    };
  });
}

// ── ACs by District ────────────────────────────────────────────────────────
// Backend endpoint: GET /api/acs?districtId=xxx
// Returns GeoJSON FeatureCollection
export async function fetchAcs(district) {
  const res = await axios.get(`${API_BASE}/acs`, {
    params: { districtId: district.districtId }
  });
  const payload = res.data;
  const features = payload?.features ?? (Array.isArray(payload) ? payload : []);

  const baseLng = district.lng ?? DELHI.lng;
  const baseLat = district.lat ?? DELHI.lat;

  return features.map(f => {
    const props = f.properties ?? f;
    const geomCoords = coordsFromGeometry(f.geometry);
    const { lng, lat } = geomCoords ?? jitter(baseLng, baseLat, 0.12);

    return {
      acNumber: props.acNumber ?? props.id,
      acName:   props.acName   ?? props.name,
      name:     props.name     ?? props.acName,
      ...props,
      lng,
      lat,
    };
  });
}

// ── Booths by AC ───────────────────────────────────────────────────────────
// Backend endpoint: GET /api/locations/acs/{acNumber}/booths?districtId=xxx
export async function fetchBooths(ac, districtId, mapboxToken = null) {
  const acNumber = ac.acNumber ?? ac.id;
  const res = await axios.get(
    `${LOCATIONS}/acs/${encodeURIComponent(acNumber)}/booths`,
    { params: { districtId } }
  );
  const raw = Array.isArray(res.data) ? res.data : (res.data?.features ?? []);

  const baseLng = ac.lng ?? DELHI.lng;
  const baseLat = ac.lat ?? DELHI.lat;

  const booths = await Promise.all(
    raw.map(async b => {
      const booth = b.properties ? { ...b.properties } : { ...b };
      if (booth.pollingStationAddress && mapboxToken) {
        const coords = await geocodeAddress(booth.pollingStationAddress, mapboxToken);
        return { ...booth, ...coords };
      }
      return { ...booth, ...jitter(baseLng, baseLat, 0.05) };
    })
  );
  return booths;
}

// ── Sections by Booth ──────────────────────────────────────────────────────
export async function fetchSections(partId) {
  const res = await axios.get(`${LOCATIONS}/booths/${encodeURIComponent(partId)}/sections`);
  return Array.isArray(res.data) ? res.data : [];
}
