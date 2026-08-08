/**
 * Fetch nearby hospitals via the backend proxy (/hospitals/nearby).
 * The backend calls Overpass, avoiding browser-side IP blocking/rate-limits.
 */
import api from './client';

export async function fetchNearbyHospitals(lat, lng, radiusM = 10000) {
  try {
    const { data } = await api.get('/hospitals/nearby', {
      params: { lat, lng, radius: radiusM },
    });
    return data.hospitals || [];
  } catch (e) {
    console.warn('Hospital fetch failed:', e?.response?.data || e.message);
    return [];
  }
}
