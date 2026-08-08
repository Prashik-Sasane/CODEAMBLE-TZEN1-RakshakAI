import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as ambulanceApi from '../../api/ambulanceApi';
import { fetchNearbyHospitals } from '../../api/hospitals';
import { MapPicker, MapView, MapExpandable } from '../../components/LeafletMap';
import { fetchRoute } from '../../api/osrm';

/* ── helpers ─────────────────────────────────────── */
function vibrate(pattern = [200, 100, 200, 100, 400]) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function playAlarm() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const beep = (freq, start, dur) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.4, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    };
    beep(880, 0, 0.25); beep(660, 0.3, 0.25); beep(880, 0.6, 0.5);
    beep(1000, 1.2, 0.25); beep(660, 1.5, 0.4);
  } catch (_) { }
}

/* ── toast ───────────────────────────────────────── */
function Toast({ message, type = 'emergency', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 6000); return () => clearTimeout(t); }, []);
  const colors = { emergency: '#dc2626', info: '#4f46e5', success: '#059669' };
  const icons = { emergency: '🚨', info: '📢', success: '✅' };
  return (
    <div style={{
      position: 'fixed', top: 16, right: 16, zIndex: 9999,
      background: 'white', borderLeft: `5px solid ${colors[type] || colors.info}`,
      borderRadius: 12, padding: '1rem 1.25rem', maxWidth: 330,
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)', display: 'flex',
      alignItems: 'flex-start', gap: '0.75rem', animation: 'slideIn 0.3s ease',
    }}>
      <span style={{ fontSize: '1.4rem' }}>{icons[type] || icons.info}</span>
      <div style={{ flex: 1, fontSize: '0.92rem', fontWeight: 600 }}>{message}</div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.1rem', color: '#999', cursor: 'pointer', padding: 0 }}>✕</button>
    </div>
  );
}

/* ── distance helper ─────────────────────────────── */
function haversineKm(a, b) {
  if (!a?.lat || !b?.lat) return null;
  const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
  const aa = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
}

/* ── main ─────────────────────────────────────────── */
export default function AmbulanceDashboard() {
  const { logout } = useAuth();
  const [assigned, setAssigned] = useState(null);
  const [status, setStatus] = useState('inactive');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // location modes
  const [autoLocation, setAutoLocation] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  // hospital picker
  const [showHospitalPicker, setShowHospitalPicker] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [hospitalsError, setHospitalsError] = useState('');

  const [routeToUser, setRouteToUser] = useState([]);
  const prevAssignedId = useRef(null);

  /* ── notification ─────────────────────────────── */
  const notify = useCallback((msg, type = 'emergency') => {
    vibrate();
    playAlarm();
    setToast({ message: msg, type });
  }, []);

  /* ── poll assigned ───────────────────────────── */
  const fetchAssigned = useCallback(async () => {
    try {
      const { data } = await ambulanceApi.getAssignedDetails();
      const incoming = data.assigned;
      const incomingId = incoming?.request_id;
      if (incomingId && incomingId !== prevAssignedId.current) {
        notify('🚨 New emergency assigned! Please proceed immediately.', 'emergency');
      }
      prevAssignedId.current = incomingId || null;
      setAssigned(incoming);
    } catch {
      setAssigned(null);
    }
  }, [notify]);

  /* ── boot ────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await ambulanceApi.getMe();
        if (!data.ambulance?.profile_completed) { window.location.href = '/ambulance/profile'; return; }
        setStatus(data.ambulance?.status || 'inactive');
        const loc = data.ambulance?.current_location;
        if (loc?.lat) setLocation({ lat: loc.lat, lng: loc.lng });
      } catch { }
    })();
    fetchAssigned();
    const id = setInterval(fetchAssigned, 4000);
    return () => clearInterval(id);
  }, [fetchAssigned]);

  /* ── route ────────────────────────────────────── */
  useEffect(() => {
    if (!assigned || !location?.lat) { setRouteToUser([]); return; }
    const dest = assigned.status === 'to_hospital' ? assigned.selected_hospital : assigned.accident_location;
    if (dest?.lat) fetchRoute(location, dest).then(r => r && setRouteToUser(r));
    else setRouteToUser([]);
  }, [assigned?.status, assigned?.selected_hospital, assigned?.accident_location, location]);

  /* ── auto-GPS location ───────────────────────── */
  useEffect(() => {
    if (!autoLocation || !navigator.geolocation) return;
    const wid = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        try { await ambulanceApi.updateLocation(latitude, longitude); } catch { }
      },
      () => { },
      { enableHighAccuracy: true, maximumAge: 4000, timeout: 12000 }
    );
    return () => navigator.geolocation.clearWatch(wid);
  }, [autoLocation]);

  /* ── handlers ────────────────────────────────── */
  const startAutoGPS = () => {
    if (autoLocation) { setAutoLocation(false); return; }
    if (!navigator.geolocation) { setError('Geolocation not supported.'); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await updateLocationWithCoords(latitude, longitude);
        setAutoLocation(true);
        setLoading(false);
      },
      () => { setError('GPS permission denied. Use manual map.'); setShowMapPicker(true); setLoading(false); },
      { enableHighAccuracy: true, timeout: 14000 }
    );
  };

  const updateLocationWithCoords = async (lat, lng) => {
    setLoading(true); setError('');
    try {
      await ambulanceApi.updateLocation(lat, lng);
      setLocation({ lat, lng });
      setShowMapPicker(false);
    } catch (e) { setError(e.response?.data?.error || 'Failed to update location'); }
    finally { setLoading(false); }
  };

  const toggleStatus = async () => {
    const next = status === 'active' ? 'inactive' : 'active';
    if (next === 'active' && !location) { setError('Set your location first before going active.'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await ambulanceApi.updateStatus(next);
      setStatus(data.status);
    } catch (e) { setError(e.response?.data?.error || 'Failed to update status'); }
    finally { setLoading(false); }
  };

  /* ── hospital picker ─────────────────────────── */
  const handleReachedUser = async () => {
    const acc = assigned?.accident_location;
    if (!acc?.lat) return;
    setHospitalsLoading(true); setHospitalsError('');
    try {
      const list = await fetchNearbyHospitals(acc.lat, acc.lng, 8000);
      if (!list || list.length === 0) {
        setHospitalsError('No hospitals found nearby. You can manually enter one.');
        setHospitals([]);
      } else {
        setHospitals(list);
      }
      setShowHospitalPicker(true);
    } catch {
      setHospitalsError('Could not load hospitals. Please try again.');
      setShowHospitalPicker(true);
    } finally {
      setHospitalsLoading(false);
    }
  };

  const handleSelectHospital = async (hospital) => {
    setLoading(true); setError('');
    try {
      await ambulanceApi.selectHospital(assigned.request_id, hospital);
      setShowHospitalPicker(false);
      notify('🏥 Hospital selected. Navigate to hospital!', 'info');
      fetchAssigned();
    } catch (e) { setError(e.response?.data?.error || 'Failed to select hospital'); }
    finally { setLoading(false); }
  };

  const handleComplete = async (requestId) => {
    if (!requestId) { setError('Invalid request ID'); return; }
    setLoading(true); setError('');
    try {
      let lat = location?.lat ?? null, lng = location?.lng ?? null;
      if (!lat && navigator.geolocation) {
        try {
          const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000, maximumAge: 0 }));
          lat = pos.coords.latitude; lng = pos.coords.longitude;
        } catch { }
      }
      await ambulanceApi.completeRequest(requestId, lat, lng);
      setAssigned(null); setStatus('active'); setShowHospitalPicker(false);
      notify('✅ Request completed! You are now active again.', 'success');
    } catch (e) { setError(e.response?.data?.error || e.message || 'Failed to complete request'); }
    finally { setLoading(false); }
  };

  const handleReportIssue = async (requestId) => {
    const desc = prompt('Describe the issue (e.g., Engine failure, Puncture):');
    if (!desc) return;
    setLoading(true); setError('');
    try {
      const { data } = await ambulanceApi.reportIssue(requestId, desc);
      alert(data.message); setAssigned(null); setStatus('inactive'); setShowHospitalPicker(false);
    } catch (e) { setError(e.response?.data?.error || 'Failed to report issue'); }
    finally { setLoading(false); }
  };

  const handleReportFake = async (requestId) => {
    if (!window.confirm('Sure this is a fake request? A demerit point will be added.')) return;
    setLoading(true); setError('');
    try {
      const { data } = await ambulanceApi.reportFake(requestId);
      alert(data.message); setAssigned(null); setStatus('active'); setShowHospitalPicker(false);
    } catch (e) { setError(e.response?.data?.error || 'Failed to report fake request'); }
    finally { setLoading(false); }
  };

  const openDirections = () => {
    const origin = assigned?.directions?.origin || location;
    const dest = assigned?.status === 'to_hospital' ? assigned?.selected_hospital : assigned?.accident_location;
    if (!origin?.lat || !dest?.lat) return;
    window.open(`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${origin.lat},${origin.lng};${dest.lat},${dest.lng}`, '_blank');
  };

  const dest = assigned?.status === 'to_hospital' ? assigned?.selected_hospital : assigned?.accident_location;
  const distKm = haversineKm(location, dest);

  return (
    <div className="page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="page-header">
        <h1>🚑 Ambulance</h1>
        <button className="btn btn-ghost" onClick={logout}>Logout</button>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ── Status & Location ─────────────────────── */}
      <section className="card">
        <h2 className="card-title">📍 Status & Location</h2>
        <div className="status-row">
          <span className={`badge badge-${status}`}>{status === 'active' ? '🟢 Active' : '⚫ Inactive'}</span>
          {autoLocation && <span style={{ marginLeft: 8, fontSize: '0.8rem', color: '#059669' }}>📡 GPS live</span>}
        </div>

        {/* two location buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', marginTop: '0.5rem' }}>
          <button
            className={`btn ${autoLocation ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, fontSize: '0.88rem' }}
            onClick={startAutoGPS}
            disabled={loading}
          >
            {autoLocation ? '🟢 Auto-updating GPS' : '📡 Auto GPS'}
          </button>
          <button
            className={`btn btn-secondary`}
            style={{ flex: 1, fontSize: '0.88rem' }}
            onClick={() => setShowMapPicker(prev => !prev)}
            disabled={loading}
          >
            {showMapPicker ? '✕ Close Map' : '🗺 Manual Pin'}
          </button>
        </div>

        {location && (
          <p className="success-msg">
            ✅ Location: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            {autoLocation && ' (auto-updating)'}
          </p>
        )}

        {showMapPicker && (
          <div className="map-picker-wrapper">
            <MapPicker initialCenter={location} onSelect={updateLocationWithCoords} height={260} />
          </div>
        )}

        <button
          className={`btn ${status === 'active' ? 'btn-secondary' : 'btn-primary'}`}
          onClick={toggleStatus}
          disabled={loading}
          style={{ marginTop: '0.5rem' }}
        >
          {loading ? 'Updating…' : status === 'active' ? '⚫ Go Inactive' : '🟢 Go Active'}
        </button>
      </section>

      {/* ── Assignment ────────────────────────────── */}
      {assigned ? (
        <section className="card card--highlight">
          <h2 className="card-title">🔴 Active Assignment</h2>
          <div className="status-row">
            <span className={`badge badge-${assigned.status}`}>
              {assigned.status === 'to_hospital' ? '🏥 En-Route to Hospital' : '🚨 Responding to User'}
            </span>
            {distKm !== null && (
              <span style={{ fontSize: '0.85rem', color: '#718096', marginLeft: 8 }}>
                ~{distKm.toFixed(1)} km away
              </span>
            )}
          </div>

          <div className="info-grid">
            <div><strong>User</strong><br />{assigned.user_name || '—'}</div>
            <div><strong>Phone</strong><br /><a href={`tel:${assigned.user_phone}`}>{assigned.user_phone}</a></div>
            <div><strong>Accident</strong><br />{assigned.accident_location?.lat?.toFixed(4)}, {assigned.accident_location?.lng?.toFixed(4)}</div>
            {assigned.selected_hospital && <div><strong>Hospital</strong><br />{assigned.selected_hospital.name}</div>}
          </div>

          {/* Navigate button always visible */}
          <button className="btn btn-primary" onClick={openDirections} style={{ marginBottom: '0.5rem' }}>
            🧭 Navigate ({assigned.status === 'to_hospital' ? 'to Hospital' : 'to User'})
          </button>

          {/* Reached user → show hospital picker */}
          {assigned.status === 'assigned' && (
            <button className="btn btn-secondary" onClick={handleReachedUser} disabled={loading || hospitalsLoading} style={{ marginBottom: '0.5rem' }}>
              {hospitalsLoading ? '⏳ Loading hospitals…' : '🏥 Reached User – Select Hospital'}
            </button>
          )}

          {/* Hospital Picker */}
          {showHospitalPicker && (
            <div style={{
              background: '#f8f9fa', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem',
              border: '1px solid #e5e7eb',
            }}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                🏥 Select a Hospital ({hospitals.length} found nearby)
              </p>
              {hospitalsError && (
                <p style={{ color: '#d97706', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{hospitalsError}</p>
              )}
              {hospitals.length === 0 && !hospitalsError && (
                <p style={{ color: '#718096', fontSize: '0.85rem' }}>Searching for hospitals…</p>
              )}
              {hospitals.map((h, i) => {
                const d = haversineKm(assigned.accident_location, h);
                return (
                  <button
                    key={i}
                    type="button"
                    className="btn btn-secondary hospital-btn"
                    onClick={() => handleSelectHospital(h)}
                    disabled={loading}
                    style={{ marginBottom: '0.5rem', textAlign: 'left' }}
                  >
                    <span style={{ flex: 1 }}>{h.name}</span>
                    {d !== null && <span style={{ color: '#718096', fontSize: '0.8rem', marginLeft: 8 }}>{d.toFixed(1)} km</span>}
                  </button>
                );
              })}
              <button
                className="btn btn-ghost"
                style={{ width: 'auto', marginTop: '0.25rem', fontSize: '0.85rem' }}
                onClick={() => setShowHospitalPicker(false)}
              >
                ✕ Cancel
              </button>
            </div>
          )}

          {/* Complete if at hospital */}
          {assigned.status === 'to_hospital' && (
            <button className="btn btn-primary" onClick={() => handleComplete(assigned.request_id)} disabled={loading} style={{ marginBottom: '0.5rem' }}>
              ✅ Mark Completed
            </button>
          )}

          {/* Issue / Fake buttons */}
          {assigned.status === 'assigned' && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => handleReportIssue(assigned.request_id)} disabled={loading}
                style={{ flex: 1, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)' }}>
                ⚠️ Report Issue
              </button>
              <button className="btn btn-secondary" onClick={() => handleReportFake(assigned.request_id)} disabled={loading}
                style={{ flex: 1, background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                ❌ Fake Request
              </button>
            </div>
          )}

          {/* Live Map */}
          {location && dest && (
            <div className="map-section">
              <MapExpandable defaultHeight={260}>
                <MapView
                  center={location}
                  zoom={14}
                  accident={assigned.accident_location}
                  ambulance={location}
                  hospital={assigned.selected_hospital}
                  track={[]}
                  route={routeToUser}
                  height={260}
                />
              </MapExpandable>
            </div>
          )}
        </section>
      ) : (
        <section className="card">
          <p className="card-desc">No active assignment. Stay active and you will receive requests automatically.</p>
        </section>
      )}

      <footer className="page-footer">
        <Link to="/ambulance/profile">✏️ Edit Profile</Link>
      </footer>

      <style>{`
        @keyframes slideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
