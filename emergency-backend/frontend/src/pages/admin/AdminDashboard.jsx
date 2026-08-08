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

/* ── history record card ──────────────────────────────── */
function HistoryCard({ record }) {
  const isFake = record.status === 'fake';
  const isCompleted = record.status === 'completed';

  const borderColor = isFake ? '#dc2626' : '#059669';
  const bgColor = isFake ? '#fff5f5' : '#f0fdf4';
  const badgeStyle = {
    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
    padding: '0.25rem 0.75rem', borderRadius: 20, fontWeight: 700, fontSize: '0.8rem',
    background: isFake ? '#fee2e2' : '#dcfce7',
    color: isFake ? '#dc2626' : '#059669',
    border: `1px solid ${borderColor}`,
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      border: `1px solid ${borderColor}`,
      borderLeft: `5px solid ${borderColor}`,
      borderRadius: 12,
      padding: '1rem 1.25rem',
      marginBottom: '0.75rem',
      background: bgColor,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
        <span style={badgeStyle}>
          {isFake ? '🚫 Fake Request' : '✅ Completed Service'}
        </span>
        <span style={{ fontSize: '0.78rem', color: '#718096' }}>
          {formatDate(record.updated_at || record.created_at)}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem 1rem', fontSize: '0.87rem' }}>
        {record.location && (
          <div>
            <span style={{ color: '#718096' }}>📍 Incident:</span>{' '}
            <strong>{record.location.lat?.toFixed(4)}, {record.location.lng?.toFixed(4)}</strong>
          </div>
        )}
        {record.selected_hospital && (
          <div>
            <span style={{ color: '#718096' }}>🏥 Hospital:</span>{' '}
            <strong>{record.selected_hospital.name}</strong>
          </div>
        )}
        {record.ambulance && (
          <>
            <div>
              <span style={{ color: '#718096' }}>🚑 Vehicle:</span>{' '}
              <strong>{record.ambulance.vehicle_number || '—'}</strong>
            </div>
            <div>
              <span style={{ color: '#718096' }}>👤 Driver:</span>{' '}
              <strong>{record.ambulance.name || '—'}</strong>
            </div>
            <div>
              <span style={{ color: '#718096' }}>📞 Amb. Phone:</span>{' '}
              <a href={`tel:${record.ambulance.phone}`}><strong>{record.ambulance.phone}</strong></a>
            </div>
          </>
        )}
        {record.user && (
          <>
            <div>
              <span style={{ color: '#718096' }}>👤 User:</span>{' '}
              <strong>{record.user.name || '—'}</strong>
            </div>
            <div>
              <span style={{ color: '#718096' }}>📞 User Phone:</span>{' '}
              <strong>{record.user.phone || '—'}</strong>
            </div>
            {isFake && record.user.demerit_points > 0 && (
              <div style={{ gridColumn: '1/-1' }}>
                <span style={{ color: '#dc2626', fontWeight: 700 }}>
                  ⚠️ User demerit points: {record.user.demerit_points}
                  {record.user.demerit_points >= 3 ? ' — BLACKLISTED' : ''}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── main component ───────────────────────────────────── */
export default function AdminDashboard() {
  const { logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('live');
  const [toast, setToast] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all' | 'completed' | 'fake'

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
      const [mapRes, usersRes, ambRes, histRes] = await Promise.all([
        adminApi.getDashboardMap(),
        adminApi.getAllUsers(),
        adminApi.getAllAmbulances(),
        adminApi.getHistory(),
      ]);
      const newRequests = mapRes.data.requests || [];
      const newAmbulances = ambRes.data.ambulances || [];

      // Detect NEW active requests (not fake/completed)
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
      setHistory(histRes.data.history || []);
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

  // Only truly active (pending/assigned/to_hospital) – fake/completed excluded by backend map API
  const activeRequests = requests.filter(r => ['pending', 'assigned', 'to_hospital'].includes(r.status));

  // History filter
  const filteredHistory = historyFilter === 'all'
    ? history
    : history.filter(h => h.status === historyFilter);

  const completedCount = history.filter(h => h.status === 'completed').length;
  const fakeCount = history.filter(h => h.status === 'fake').length;

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
          <button
            className={`btn btn-tab ${tab === 'history' ? 'btn-tab--active' : ''}`}
            onClick={() => setTab('history')}
            style={{ position: 'relative' }}
          >
            📁 History
            {history.length > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                background: '#4f46e5', color: 'white',
                borderRadius: '50%', fontSize: '0.65rem', width: 18, height: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
              }}>{history.length}</span>
            )}
          </button>
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
          <p style={{ fontSize: '0.82rem', color: '#718096', marginBottom: '0.5rem' }}>
            Only active emergencies are shown. Fake and completed requests are excluded from the map.
          </p>
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
            <h2 className="card-title">📋 Active Requests ({activeRequests.length})</h2>
            {activeRequests.length === 0 && <p className="card-desc">No active requests</p>}
            <div className="list-items">
              {activeRequests.map((r) => (
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

      {/* ── History Tab ───────────────────────────────────── */}
      {tab === 'history' && (
        <section className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <h2 className="card-title" style={{ margin: 0 }}>
              📁 Service History ({history.length})
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* Summary chips */}
              <span style={{
                padding: '0.3rem 0.75rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                background: '#dcfce7', color: '#059669', border: '1px solid #bbf7d0',
              }}>
                ✅ {completedCount} Completed
              </span>
              <span style={{
                padding: '0.3rem 0.75rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca',
              }}>
                🚫 {fakeCount} Fake
              </span>
            </div>
          </div>

          {/* Filter buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {['all', 'completed', 'fake'].map(f => (
              <button
                key={f}
                onClick={() => setHistoryFilter(f)}
                style={{
                  padding: '0.35rem 0.9rem', borderRadius: 20, fontSize: '0.82rem',
                  fontWeight: historyFilter === f ? 700 : 400,
                  cursor: 'pointer', border: '1px solid',
                  borderColor: historyFilter === f
                    ? (f === 'fake' ? '#dc2626' : f === 'completed' ? '#059669' : '#4f46e5')
                    : '#e5e7eb',
                  background: historyFilter === f
                    ? (f === 'fake' ? '#fee2e2' : f === 'completed' ? '#dcfce7' : '#eef2ff')
                    : 'white',
                  color: historyFilter === f
                    ? (f === 'fake' ? '#dc2626' : f === 'completed' ? '#059669' : '#4f46e5')
                    : '#718096',
                }}
              >
                {f === 'all' ? '📋 All' : f === 'completed' ? '✅ Completed' : '🚫 Fake'}
              </button>
            ))}
          </div>

          {filteredHistory.length === 0 && (
            <p className="card-desc">No {historyFilter === 'all' ? '' : historyFilter} records yet.</p>
          )}

          {filteredHistory.map(record => (
            <HistoryCard key={record.id} record={record} />
          ))}
        </section>
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
