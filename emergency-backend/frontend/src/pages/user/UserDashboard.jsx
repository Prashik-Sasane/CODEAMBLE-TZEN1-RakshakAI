import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as userApi from '../../api/userApi';
import { MapPicker, TrackingMap } from '../../components/LeafletMap';
import { sensorService } from '../../services/sensorService';
import EmergencyChatbot from '../../components/EmergencyChatbot';

/* ── Cancel Confirmation Modal ────────────────────────── */
function CancelModal({ onConfirm, onClose, cancelCount, isCancelling }) {
  const nextCount = cancelCount + 1;
  const remaining = 3 - (nextCount % 3 === 0 ? 3 : nextCount % 3);
  const willGetDemerit = nextCount % 3 === 0;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: 'white', borderRadius: 20,
        padding: '2rem 1.75rem', maxWidth: 360, width: '100%',
        boxShadow: '0 24px 80px rgba(0,0,0,0.28)',
        animation: 'slideUp 0.25s ease',
        textAlign: 'center',
      }}>
        {/* Icon */}
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🚨</div>

        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 800, color: '#1a202c' }}>
          Cancel Emergency Request?
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Are you sure you want to cancel your ambulance request? This will free up the ambulance for other emergencies.
        </p>

        {/* Cancellation counter info */}
        <div style={{
          background: willGetDemerit ? '#fff5f5' : '#fffbeb',
          border: `1px solid ${willGetDemerit ? '#fecaca' : '#fde68a'}`,
          borderRadius: 12, padding: '0.75rem 1rem',
          marginBottom: '1.5rem', fontSize: '0.85rem',
          color: willGetDemerit ? '#dc2626' : '#92400e',
          lineHeight: 1.5,
        }}>
          {willGetDemerit ? (
            <>
              ⚠️ <strong>Warning:</strong> This is your <strong>{nextCount}rd/th cancellation</strong>. You will receive a <strong>demerit point</strong> for excessive cancellations.
            </>
          ) : (
            <>
              ℹ️ This will be cancellation <strong>#{nextCount}</strong>.{' '}
              {remaining === 1
                ? <>⚠️ <strong>1 more</strong> cancellation will give you a demerit point.</>
                : <>{remaining} more cancellation(s) before a demerit point.</>}
            </>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            disabled={isCancelling}
            style={{
              flex: 1, padding: '0.75rem', borderRadius: 12,
              border: '2px solid #e5e7eb', background: 'white',
              fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
              color: '#4a5568', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f7fafc'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >
            Keep Request
          </button>
          <button
            onClick={onConfirm}
            disabled={isCancelling}
            style={{
              flex: 1, padding: '0.75rem', borderRadius: 12,
              border: 'none',
              background: isCancelling ? '#fca5a5' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              fontWeight: 700, fontSize: '0.95rem', cursor: isCancelling ? 'not-allowed' : 'pointer',
              color: 'white', boxShadow: '0 4px 14px rgba(239,68,68,0.35)',
              transition: 'all 0.15s',
            }}
          >
            {isCancelling ? 'Cancelling…' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Toast Notification ───────────────────────────────── */
function Toast({ message, type = 'info', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 6000); return () => clearTimeout(t); }, []);
  const colors = { warning: '#d97706', error: '#dc2626', success: '#059669', info: '#4f46e5' };
  const icons = { warning: '⚠️', error: '❌', success: '✅', info: 'ℹ️' };
  return (
    <div style={{
      position: 'fixed', top: 16, right: 16, zIndex: 10000,
      background: 'white', borderLeft: `5px solid ${colors[type]}`,
      borderRadius: 12, padding: '1rem 1.25rem', maxWidth: 340,
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)', display: 'flex',
      alignItems: 'flex-start', gap: '0.75rem', animation: 'slideIn 0.3s ease',
    }}>
      <span style={{ fontSize: '1.3rem' }}>{icons[type]}</span>
      <div style={{ flex: 1, fontSize: '0.9rem', lineHeight: 1.5 }}>{message}</div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.1rem', color: '#999', cursor: 'pointer', padding: 0 }}>✕</button>
    </div>
  );
}

/* ── Main Dashboard ───────────────────────────────────── */
export default function UserDashboard() {
  const { logout } = useAuth();
  const [request, setRequest] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [ambulanceType, setAmbulanceType] = useState('any');

  // Cancel state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchRequest = async () => {
    try {
      const { data } = await userApi.getMyRequest();
      setRequest(data.request);
    } catch {
      setRequest(null);
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await userApi.getMe();
      setUserInfo(data.user);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchRequest();
    const id = setInterval(fetchRequest, 3000);
    return () => clearInterval(id);
  }, []);

  // Check for new assignment and play alarm
  const prevRequestRef = useRef(null);
  useEffect(() => {
    if (request?.assigned_ambulance && request.status === 'assigned' &&
      (!prevRequestRef.current?.assigned_ambulance || prevRequestRef.current?.status !== 'assigned')) {
      playAlarmSound();
    }
    prevRequestRef.current = request;
  }, [request]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await userApi.getMe();
        setUserInfo(data.user);
        if (!data.user?.profile_completed) {
          window.location.href = '/user/profile';
          return;
        }
        if (data.user?.accident_detection_enabled) sensorService.start();
      } catch { /* ignore */ }
    })();
    return () => sensorService.stop();
  }, []);

  const tryGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setShowMapPicker(true);
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await updateLocationWithCoords(latitude, longitude);
        setLoading(false);
      },
      () => {
        setError('Location access denied. Please select your location on the map below.');
        setShowMapPicker(true);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const updateLocationWithCoords = async (lat, lng) => {
    setLoading(true);
    setError('');
    try {
      await userApi.updateLocation(lat, lng);
      setLocation({ lat, lng });
      setShowMapPicker(false);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  const handleMapPickerSelect = (lat, lng) => {
    updateLocationWithCoords(lat, lng);
  };

  const handleRequestEmergency = async () => {
    if (!location) {
      setError('Please set your location first');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await userApi.requestEmergency(location.lat, location.lng, ambulanceType);
      setRequest(data.request);
      if (data.request?.assigned_ambulance) {
        playAlarmSound();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirmed = async () => {
    if (!request?._id) return;
    setIsCancelling(true);
    try {
      const { data } = await userApi.cancelRequest(request._id);
      setRequest(null);
      setShowCancelModal(false);
      // Refresh user info to get updated cancel_count / demerit_points
      await refreshUser();

      if (data.demerit_added) {
        setToast({
          type: 'warning',
          message: data.warning || `⚠️ Demerit point added. You now have ${data.demerit_points} demerit point(s).`,
        });
      } else {
        setToast({
          type: 'info',
          message: data.info || 'Request cancelled. The ambulance has been freed.',
        });
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.error || 'Failed to cancel request. Please try again.',
      });
      setShowCancelModal(false);
    } finally {
      setIsCancelling(false);
    }
  };

  const vibrate = (pattern = [200, 100, 200, 100, 400]) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  };

  const playAlarmSound = () => {
    vibrate();
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 3);
    } catch (_) { }
  };

  const cancelCount = userInfo?.cancel_count || 0;
  const canCancel = request && ['pending', 'assigned'].includes(request.status);

  return (
    <div className="page">
      {/* Cancel modal */}
      {showCancelModal && (
        <CancelModal
          onConfirm={handleCancelConfirmed}
          onClose={() => !isCancelling && setShowCancelModal(false)}
          cancelCount={cancelCount}
          isCancelling={isCancelling}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <header className="page-header">
        <h1>User Dashboard</h1>
        <button className="btn btn-ghost" onClick={logout}>Logout</button>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Blacklist warning */}
      {userInfo?.is_blacklisted && (
        <div className="alert alert-error" style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: '#ef4444', color: '#dc2626' }}>
          ⚠️ Your account is blacklisted due to fake emergency requests. You cannot create new requests.
        </div>
      )}

      {/* Demerit warning */}
      {userInfo && userInfo.demerit_points > 0 && !userInfo.is_blacklisted && (
        <div className="alert" style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: '#f59e0b', color: '#d97706' }}>
          ⚠️ Warning: You have {userInfo.demerit_points} demerit point(s).{' '}
          {userInfo.demerit_points === 1 ? 'One more fake/abusive request will result in blacklisting.' : ''}
        </div>
      )}

      {/* Cancel count info banner */}
      {cancelCount > 0 && cancelCount % 3 !== 0 && !userInfo?.is_blacklisted && (
        <div className="alert" style={{ background: 'rgba(249,115,22,0.1)', borderColor: '#fb923c', color: '#c2410c', fontSize: '0.85rem' }}>
          🔄 You have cancelled <strong>{cancelCount}</strong> request(s). {3 - (cancelCount % 3)} more will result in a demerit point.
        </div>
      )}

      {/* Location section */}
      <section className="card">
        <h2 className="card-title">Your Location</h2>
        <p className="card-desc">Allow browser location or select manually on the map</p>
        <button className="btn btn-secondary" onClick={tryGeolocation} disabled={loading}>
          {loading ? 'Getting location…' : 'Allow & Update Location'}
        </button>
        {location && (
          <p className="success-msg">Location set: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
        )}
        {showMapPicker && (
          <div className="map-picker-wrapper">
            <MapPicker
              initialCenter={location}
              onSelect={handleMapPickerSelect}
              height={260}
            />
          </div>
        )}
      </section>

      {request ? (
        <section className="card card--highlight">
          <h2 className="card-title">Current Request</h2>
          <div className="request-status">
            <span className={`badge badge-${request.status}`}>
              {request.status === 'to_hospital' ? 'To Hospital' : request.status}
            </span>
          </div>

          {request.assigned_ambulance && (
            <div className="info-grid">
              <div><strong>Driver</strong><br />{request.assigned_ambulance.name}</div>
              <div><strong>Phone</strong><br /><a href={`tel:${request.assigned_ambulance.phone}`}>{request.assigned_ambulance.phone}</a></div>
              <div><strong>Vehicle</strong><br />{request.assigned_ambulance.vehicle_number}</div>
              {request.selected_hospital && <div><strong>Hospital</strong><br />{request.selected_hospital.name}</div>}
            </div>
          )}

          <div className="map-section">
            <TrackingMap request={request} height={300} expandable />
          </div>

          {/* ── Cancel button ── */}
          {canCancel && (
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid #f3f4f6', paddingTop: '1.25rem' }}>
              <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.75rem', textAlign: 'center' }}>
                Made a mistake? You can cancel the request.
              </p>
              <button
                onClick={() => setShowCancelModal(true)}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: 12,
                  border: '2px solid #fca5a5',
                  background: 'white',
                  color: '#dc2626',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#fef2f2';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(239,68,68,0.18)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                ✕ Cancel Request
                {cancelCount > 0 && (
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 500, color: '#9ca3af',
                    background: '#f3f4f6', borderRadius: 10, padding: '0.1rem 0.5rem',
                  }}>
                    {3 - ((cancelCount + 1) % 3 || 3)} left before demerit
                  </span>
                )}
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="card">
          <h2 className="card-title">Request Emergency</h2>
          <p className="card-desc">Set your location first, then request an ambulance.</p>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Ambulance Type</label>
            <select value={ambulanceType} onChange={(e) => setAmbulanceType(e.target.value)} className="form-control">
              <option value="any">Any</option>
              <option value="basic_life">Basic Life Support</option>
              <option value="advance_life">Advance Life Support</option>
              <option value="icu_life">ICU Life Support</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleRequestEmergency} disabled={loading || !location || userInfo?.is_blacklisted}>
            {loading ? 'Requesting…' : userInfo?.is_blacklisted ? 'Account Blacklisted' : 'Request Emergency'}
          </button>
        </section>
      )}

      <footer className="page-footer">
        <Link to="/user/profile">Edit Profile</Link>
      </footer>

      {/* ── Emergency AI Chatbot ── */}
      <EmergencyChatbot />

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes slideIn { from { transform: translateX(120%); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
      `}</style>
    </div>
  );
}
