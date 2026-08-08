import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/adminApi';
import { AdminMapView, MapPicker } from '../../components/LeafletMap';

/* ── helpers ─────────────────────────────────────────── */
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
      gain.gain.setValueAtTime(0.35, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    };
    beep(880, 0, 0.25); beep(660, 0.3, 0.25); beep(880, 0.6, 0.5);
  } catch (_) { }
}

/* ── toast component ──────────────────────────────────── */
function Toast({ message, type = 'info', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 5000); return () => clearTimeout(t); }, []);
  const colors = {
    emergency: '#dc2626', info: '#4f46e5', success: '#059669', warning: '#d97706',
  };
  return (
    <div style={{
      position: 'fixed', top: 16, right: 16, zIndex: 9999,
      background: 'white', borderLeft: `5px solid ${colors[type] || colors.info}`,
      borderRadius: 12, padding: '1rem 1.25rem', maxWidth: 340,
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)', display: 'flex',
      alignItems: 'flex-start', gap: '0.75rem', animation: 'slideIn 0.3s ease',
    }}>
      <span style={{ fontSize: '1.3rem' }}>
        {type === 'emergency' ? '🚨' : type === 'success' ? '✅' : '📢'}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>{message}</div>
      </div>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', fontSize: '1.1rem', color: '#999', cursor: 'pointer', padding: 0,
      }}>✕</button>
    </div>
  );
}

/* ── main component ───────────────────────────────────── */
export default function AdminDashboard() {
  const { logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('map');
  const [toast, setToast] = useState(null);

  // location state
  const [adminLocation, setAdminLocation] = useState(null);
  const [autoLocation, setAutoLocation] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const prevRequestIds = useRef(new Set());
  const prevAmbulanceStatuses = useRef({});

  const notify = useCallback((msg, type = 'emergency') => {
    vibrate();
    playAlarm();
    setToast({ message: msg, type });
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const [mapRes, usersRes, ambRes] = await Promise.all([
        adminApi.getDashboardMap(),
        adminApi.getAllUsers(),
        adminApi.getAllAmbulances(),
      ]);
      const newRequests = mapRes.data.requests || [];
      const newAmbulances = ambRes.data.ambulances || [];

      // Detect NEW requests
      const newIds = new Set(newRequests.map(r => r.id));
      if (prevRequestIds.current.size > 0) {
        newRequests.forEach(r => {
          if (!prevRequestIds.current.has(r.id) && (r.status === 'pending' || r.status === 'assigned')) {
            notify(`🚨 New Emergency! Request ${r.status === 'assigned' ? 'assigned to ambulance' : 'pending'}.`, 'emergency');
          }
        });
      }
      prevRequestIds.current = newIds;

      // Detect ambulance status changes (newly assigned)
      const prev = prevAmbulanceStatuses.current;
      newAmbulances.forEach(a => {
        if (prev[a._id] !== undefined && prev[a._id] !== 'assigned' && a.status === 'assigned') {
          notify(`🚑 Ambulance ${a.name || a.phone} is now heading to incident.`, 'info');
        }
        prev[a._id] = a.status;
      });
      prevAmbulanceStatuses.current = prev;

      setRequests(newRequests);
      setUsers(usersRes.data.users || []);
      setAmbulances(newAmbulances);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 5000);
    return () => clearInterval(id);
  }, [fetchAll]);

  // Auto-location
  useEffect(() => {
    if (!autoLocation || !navigator.geolocation) return;
    const wid = navigator.geolocation.watchPosition(
      (pos) => setAdminLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(wid);
  }, [autoLocation]);

  const handleAutoLocation = () => {
    if (autoLocation) { setAutoLocation(false); return; }
    if (!navigator.geolocation) { alert('Geolocation not supported. Use manual pick.'); return; }
    setAutoLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => setAdminLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setAutoLocation(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const activeRequests = requests.filter(r => ['pending', 'assigned', 'to_hospital'].includes(r.status));
  const completedRequests = requests.filter(r => r.status === 'completed' || r.status === 'fake');

  if (loading) return <div className="page"><div className="loading">Loading…</div></div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;

  return (
    <div className="page page--wide">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="page-header">
        <div>
          <h1>🛡️ Admin Dashboard</h1>
          <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: 2 }}>
            {activeRequests.length} active • {ambulances.filter(a => a.status === 'active').length} ambulances online
          </div>
        </div>
        <div className="header-actions">
          <button className={`btn btn-tab ${tab === 'map' ? 'btn-tab--active' : ''}`} onClick={() => setTab('map')}>🗺 Map</button>
          <button className={`btn btn-tab ${tab === 'live' ? 'btn-tab--active' : ''}`} onClick={() => setTab('live')}>🔴 Live</button>
          <button className={`btn btn-tab ${tab === 'list' ? 'btn-tab--active' : ''}`} onClick={() => setTab('list')}>📋 List</button>
          <button className="btn btn-ghost" onClick={logout}>Logout</button>
        </div>
      </header>

      {/* ── Location Section ─────────────────────────────── */}
      <section className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>📍 Admin Location</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn btn-tab ${autoLocation ? 'btn-tab--active' : ''}`}
              style={{ width: 'auto', padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
              onClick={handleAutoLocation}
            >
              {autoLocation ? '🟢 Auto-updating' : '📡 Auto GPS'}
            </button>
            <button
              className="btn btn-tab"
              style={{ width: 'auto', padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
              onClick={() => setShowMapPicker(!showMapPicker)}
            >
              {showMapPicker ? '✕ Close' : '🗺 Manual Pin'}
            </button>
          </div>
        </div>
        {adminLocation && (
          <div style={{ fontSize: '0.8rem', color: '#059669', marginTop: '0.5rem' }}>
            ✅ Location set: {adminLocation.lat.toFixed(5)}, {adminLocation.lng.toFixed(5)}
            {autoLocation && ' (live)'}
          </div>
        )}
        {showMapPicker && (
          <div style={{ marginTop: '1rem' }}>
            <MapPicker
              initialCenter={adminLocation}
              onSelect={(lat, lng) => { setAdminLocation({ lat, lng }); setShowMapPicker(false); }}
              height={260}
            />
          </div>
        )}
      </section>

      {/* ── Map Tab ───────────────────────────────────────── */}
      {tab === 'map' && (
        <section className="card">
          <h2 className="card-title">🗺 Live Map</h2>
          <AdminMapView requests={requests} height={480} expandable />
        </section>
      )}

      {/* ── Live Requests Tab ─────────────────────────────── */}
      {tab === 'live' && (
        <section className="card">
          <h2 className="card-title">🔴 Active Emergencies ({activeRequests.length})</h2>
          {activeRequests.length === 0 && <p className="card-desc">No active emergencies right now.</p>}
          {activeRequests.map(r => (
            <div key={r.id} style={{
              border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem',
              borderLeft: `4px solid ${r.status === 'pending' ? '#f59e0b' : r.status === 'assigned' ? '#059669' : '#4f46e5'}`,
              background: r.status === 'pending' ? '#fffbeb' : r.status === 'assigned' ? '#f0fdf4' : '#eef2ff',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className={`badge badge-${r.status}`}>
                  {r.status === 'to_hospital' ? '🏥 To Hospital' : r.status === 'assigned' ? '🚑 Assigned' : '⏳ Pending'}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#718096' }}>
                  📍 {r.location?.lat?.toFixed(4)}, {r.location?.lng?.toFixed(4)}
                </span>
              </div>
              {r.assigned_ambulance && (
                <div style={{ fontSize: '0.88rem', marginTop: '0.5rem' }}>
                  <strong>🚑 Ambulance:</strong> {r.assigned_ambulance.vehicle_number} &nbsp;|&nbsp;
                  <strong>Driver:</strong> {r.assigned_ambulance.name || '—'} &nbsp;|&nbsp;
                  <strong>📞</strong> <a href={`tel:${r.assigned_ambulance.phone}`}>{r.assigned_ambulance.phone}</a>
                  {r.assigned_ambulance.current_location && (
                    <div style={{ color: '#718096', marginTop: 4 }}>
                      Ambulance @ {r.assigned_ambulance.current_location.lat?.toFixed(4)}, {r.assigned_ambulance.current_location.lng?.toFixed(4)}
                    </div>
                  )}
                  {r.selected_hospital && (
                    <div style={{ marginTop: 4 }}>🏥 <strong>Hospital:</strong> {r.selected_hospital.name}</div>
                  )}
                </div>
              )}
              {r.status === 'pending' && !r.assigned_ambulance && (
                <div style={{ fontSize: '0.85rem', color: '#d97706', marginTop: '0.35rem' }}>⚠️ No ambulance assigned yet — manage traffic!</div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ── List Tab ──────────────────────────────────────── */}
      {tab === 'list' && (
        <>
          <section className="card">
            <h2 className="card-title">📋 All Requests ({requests.length})</h2>
            {requests.length === 0 && <p className="card-desc">No requests</p>}
            <div className="list-items">
              {requests.slice(0, 20).map((r) => (
                <div key={r.id} className="list-item list-item--request">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className={`badge badge-${r.status}`}>{r.status === 'to_hospital' ? 'To Hospital' : r.status}</span>
                    <span style={{ fontSize: '0.8rem', color: '#718096' }}>
                      {r.location?.lat?.toFixed(3)}, {r.location?.lng?.toFixed(3)}
                    </span>
                  </div>
                  {r.assigned_ambulance && (
                    <div className="ambulance-details">
                      <strong>Vehicle:</strong> {r.assigned_ambulance.vehicle_number} |
                      <strong> Driver:</strong> {r.assigned_ambulance.name} |
                      <strong> Phone:</strong> {r.assigned_ambulance.phone}
                      {r.selected_hospital && <span> | <strong>Hospital:</strong> {r.selected_hospital.name}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
          <section className="card">
            <h2 className="card-title">🚑 Ambulances ({ambulances.length})</h2>
            <div className="list-items">
              {ambulances.map((a) => (
                <div key={a._id} className="list-item" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{a.phone} – {a.name || '—'}</span>
                  <span className={`badge badge-${a.status || 'inactive'}`}>{a.status || 'inactive'}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="card">
            <h2 className="card-title">👥 Users ({users.length})</h2>
            <div className="list-items">
              {users.slice(0, 10).map((u) => (
                <div key={u._id} className="list-item">{u.phone} – {u.name || '—'}</div>
              ))}
            </div>
          </section>
        </>
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
