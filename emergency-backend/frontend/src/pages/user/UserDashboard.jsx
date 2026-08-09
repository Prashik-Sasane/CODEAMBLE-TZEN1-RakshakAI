// import { useState, useEffect, useRef } from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import * as userApi from '../../api/userApi';
// import { MapPicker, TrackingMap } from '../../components/LeafletMap';
// import { sensorService } from '../../services/sensorService';
// import EmergencyChatbot from '../../components/EmergencyChatbot';

// /* ── Cancel Confirmation Modal ────────────────────────── */
// function CancelModal({ onConfirm, onClose, cancelCount, isCancelling }) {
//   const nextCount = cancelCount + 1;
//   const remaining = 3 - (nextCount % 3 === 0 ? 3 : nextCount % 3);
//   const willGetDemerit = nextCount % 3 === 0;

//   return (
//     <div style={{
//       position: 'fixed', inset: 0, zIndex: 9999,
//       background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
//       display: 'flex', alignItems: 'center', justifyContent: 'center',
//       padding: '1rem',
//       animation: 'fadeIn 0.2s ease',
//     }}>
//       <div style={{
//         background: 'white', borderRadius: 20,
//         padding: '2rem 1.75rem', maxWidth: 360, width: '100%',
//         boxShadow: '0 24px 80px rgba(0,0,0,0.28)',
//         animation: 'slideUp 0.25s ease',
//         textAlign: 'center',
//       }}>
//         {/* Icon */}
//         <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🚨</div>

//         <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 800, color: '#1a202c' }}>
//           Cancel Emergency Request?
//         </h3>
//         <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '1.25rem', lineHeight: 1.5 }}>
//           Are you sure you want to cancel your ambulance request? This will free up the ambulance for other emergencies.
//         </p>

//         {/* Cancellation counter info */}
//         <div style={{
//           background: willGetDemerit ? '#fff5f5' : '#fffbeb',
//           border: `1px solid ${willGetDemerit ? '#fecaca' : '#fde68a'}`,
//           borderRadius: 12, padding: '0.75rem 1rem',
//           marginBottom: '1.5rem', fontSize: '0.85rem',
//           color: willGetDemerit ? '#dc2626' : '#92400e',
//           lineHeight: 1.5,
//         }}>
//           {willGetDemerit ? (
//             <>
//               ⚠️ <strong>Warning:</strong> This is your <strong>{nextCount}rd/th cancellation</strong>. You will receive a <strong>demerit point</strong> for excessive cancellations.
//             </>
//           ) : (
//             <>
//               ℹ️ This will be cancellation <strong>#{nextCount}</strong>.{' '}
//               {remaining === 1
//                 ? <>⚠️ <strong>1 more</strong> cancellation will give you a demerit point.</>
//                 : <>{remaining} more cancellation(s) before a demerit point.</>}
//             </>
//           )}
//         </div>

//         {/* Buttons */}
//         <div style={{ display: 'flex', gap: '0.75rem' }}>
//           <button
//             onClick={onClose}
//             disabled={isCancelling}
//             style={{
//               flex: 1, padding: '0.75rem', borderRadius: 12,
//               border: '2px solid #e5e7eb', background: 'white',
//               fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
//               color: '#4a5568', transition: 'all 0.15s',
//             }}
//             onMouseEnter={e => e.currentTarget.style.background = '#f7fafc'}
//             onMouseLeave={e => e.currentTarget.style.background = 'white'}
//           >
//             Keep Request
//           </button>
//           <button
//             onClick={onConfirm}
//             disabled={isCancelling}
//             style={{
//               flex: 1, padding: '0.75rem', borderRadius: 12,
//               border: 'none',
//               background: isCancelling ? '#fca5a5' : 'linear-gradient(135deg, #ef4444, #dc2626)',
//               fontWeight: 700, fontSize: '0.95rem', cursor: isCancelling ? 'not-allowed' : 'pointer',
//               color: 'white', boxShadow: '0 4px 14px rgba(239,68,68,0.35)',
//               transition: 'all 0.15s',
//             }}
//           >
//             {isCancelling ? 'Cancelling…' : 'Yes, Cancel'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ── Toast Notification ───────────────────────────────── */
// function Toast({ message, type = 'info', onClose }) {
//   useEffect(() => { const t = setTimeout(onClose, 6000); return () => clearTimeout(t); }, []);
//   const colors = { warning: '#d97706', error: '#dc2626', success: '#059669', info: '#4f46e5' };
//   const icons = { warning: '⚠️', error: '❌', success: '✅', info: 'ℹ️' };
//   return (
//     <div style={{
//       position: 'fixed', top: 16, right: 16, zIndex: 10000,
//       background: 'white', borderLeft: `5px solid ${colors[type]}`,
//       borderRadius: 12, padding: '1rem 1.25rem', maxWidth: 340,
//       boxShadow: '0 8px 32px rgba(0,0,0,0.18)', display: 'flex',
//       alignItems: 'flex-start', gap: '0.75rem', animation: 'slideIn 0.3s ease',
//     }}>
//       <span style={{ fontSize: '1.3rem' }}>{icons[type]}</span>
//       <div style={{ flex: 1, fontSize: '0.9rem', lineHeight: 1.5 }}>{message}</div>
//       <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.1rem', color: '#999', cursor: 'pointer', padding: 0 }}>✕</button>
//     </div>
//   );
// }

// /* ── Main Dashboard ───────────────────────────────────── */
// export default function UserDashboard() {
//   const { logout } = useAuth();
//   const [request, setRequest] = useState(null);
//   const [location, setLocation] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showMapPicker, setShowMapPicker] = useState(false);
//   const [userInfo, setUserInfo] = useState(null);
//   const [ambulanceType, setAmbulanceType] = useState('any');

//   // Cancel state
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [isCancelling, setIsCancelling] = useState(false);
//   const [toast, setToast] = useState(null);

//   const fetchRequest = async () => {
//     try {
//       const { data } = await userApi.getMyRequest();
//       setRequest(data.request);
//     } catch {
//       setRequest(null);
//     }
//   };

//   const refreshUser = async () => {
//     try {
//       const { data } = await userApi.getMe();
//       setUserInfo(data.user);
//     } catch { /* ignore */ }
//   };

//   useEffect(() => {
//     fetchRequest();
//     const id = setInterval(fetchRequest, 3000);
//     return () => clearInterval(id);
//   }, []);

//   // Check for new assignment and play alarm
//   const prevRequestRef = useRef(null);
//   useEffect(() => {
//     if (request?.assigned_ambulance && request.status === 'assigned' &&
//       (!prevRequestRef.current?.assigned_ambulance || prevRequestRef.current?.status !== 'assigned')) {
//       playAlarmSound();
//     }
//     prevRequestRef.current = request;
//   }, [request]);

//   useEffect(() => {
//     (async () => {
//       try {
//         const { data } = await userApi.getMe();
//         setUserInfo(data.user);
//         if (!data.user?.profile_completed) {
//           window.location.href = '/user/profile';
//           return;
//         }
//         if (data.user?.accident_detection_enabled) sensorService.start();
//       } catch { /* ignore */ }
//     })();
//     return () => sensorService.stop();
//   }, []);

//   const tryGeolocation = () => {
//     if (!navigator.geolocation) {
//       setError('Geolocation is not supported by your browser');
//       setShowMapPicker(true);
//       return;
//     }
//     setLoading(true);
//     setError('');
//     navigator.geolocation.getCurrentPosition(
//       async (pos) => {
//         const { latitude, longitude } = pos.coords;
//         await updateLocationWithCoords(latitude, longitude);
//         setLoading(false);
//       },
//       () => {
//         setError('Location access denied. Please select your location on the map below.');
//         setShowMapPicker(true);
//         setLoading(false);
//       },
//       { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
//     );
//   };

//   const updateLocationWithCoords = async (lat, lng) => {
//     setLoading(true);
//     setError('');
//     try {
//       await userApi.updateLocation(lat, lng);
//       setLocation({ lat, lng });
//       setShowMapPicker(false);
//     } catch (e) {
//       setError(e.response?.data?.error || 'Failed to update location');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleMapPickerSelect = (lat, lng) => {
//     updateLocationWithCoords(lat, lng);
//   };

//   const handleRequestEmergency = async () => {
//     if (!location) {
//       setError('Please set your location first');
//       return;
//     }
//     setLoading(true);
//     setError('');
//     try {
//       const { data } = await userApi.requestEmergency(location.lat, location.lng, ambulanceType);
//       setRequest(data.request);
//       if (data.request?.assigned_ambulance) {
//         playAlarmSound();
//       }
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to create request');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancelConfirmed = async () => {
//     if (!request?._id) return;
//     setIsCancelling(true);
//     try {
//       const { data } = await userApi.cancelRequest(request._id);
//       setRequest(null);
//       setShowCancelModal(false);
//       // Refresh user info to get updated cancel_count / demerit_points
//       await refreshUser();

//       if (data.demerit_added) {
//         setToast({
//           type: 'warning',
//           message: data.warning || `⚠️ Demerit point added. You now have ${data.demerit_points} demerit point(s).`,
//         });
//       } else {
//         setToast({
//           type: 'info',
//           message: data.info || 'Request cancelled. The ambulance has been freed.',
//         });
//       }
//     } catch (err) {
//       setToast({
//         type: 'error',
//         message: err.response?.data?.error || 'Failed to cancel request. Please try again.',
//       });
//       setShowCancelModal(false);
//     } finally {
//       setIsCancelling(false);
//     }
//   };

//   const vibrate = (pattern = [200, 100, 200, 100, 400]) => {
//     if (navigator.vibrate) navigator.vibrate(pattern);
//   };

//   const playAlarmSound = () => {
//     vibrate();
//     try {
//       const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//       const oscillator = audioContext.createOscillator();
//       const gainNode = audioContext.createGain();
//       oscillator.connect(gainNode);
//       gainNode.connect(audioContext.destination);
//       oscillator.frequency.value = 800;
//       oscillator.type = 'sine';
//       gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
//       gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 3);
//       oscillator.start(audioContext.currentTime);
//       oscillator.stop(audioContext.currentTime + 3);
//     } catch (_) { }
//   };

//   const cancelCount = userInfo?.cancel_count || 0;
//   const canCancel = request && ['pending', 'assigned'].includes(request.status);

//   return (
//     <div className="page">
//       {/* Cancel modal */}
//       {showCancelModal && (
//         <CancelModal
//           onConfirm={handleCancelConfirmed}
//           onClose={() => !isCancelling && setShowCancelModal(false)}
//           cancelCount={cancelCount}
//           isCancelling={isCancelling}
//         />
//       )}

//       {/* Toast notification */}
//       {toast && (
//         <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
//       )}

//       <header className="page-header">
//         <h1>User Dashboard</h1>
//         <button className="btn btn-ghost" onClick={logout}>Logout</button>
//       </header>

//       {error && <div className="alert alert-error">{error}</div>}

//       {/* Blacklist warning */}
//       {userInfo?.is_blacklisted && (
//         <div className="alert alert-error" style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: '#ef4444', color: '#dc2626' }}>
//           ⚠️ Your account is blacklisted due to fake emergency requests. You cannot create new requests.
//         </div>
//       )}

//       {/* Demerit warning */}
//       {userInfo && userInfo.demerit_points > 0 && !userInfo.is_blacklisted && (
//         <div className="alert" style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: '#f59e0b', color: '#d97706' }}>
//           ⚠️ Warning: You have {userInfo.demerit_points} demerit point(s).{' '}
//           {userInfo.demerit_points === 1 ? 'One more fake/abusive request will result in blacklisting.' : ''}
//         </div>
//       )}

//       {/* Cancel count info banner */}
//       {cancelCount > 0 && cancelCount % 3 !== 0 && !userInfo?.is_blacklisted && (
//         <div className="alert" style={{ background: 'rgba(249,115,22,0.1)', borderColor: '#fb923c', color: '#c2410c', fontSize: '0.85rem' }}>
//           🔄 You have cancelled <strong>{cancelCount}</strong> request(s). {3 - (cancelCount % 3)} more will result in a demerit point.
//         </div>
//       )}

//       {/* Location section */}
//       <section className="card">
//         <h2 className="card-title">Your Location</h2>
//         <p className="card-desc">Allow browser location or select manually on the map</p>
//         <button className="btn btn-secondary" onClick={tryGeolocation} disabled={loading}>
//           {loading ? 'Getting location…' : 'Allow & Update Location'}
//         </button>
//         {location && (
//           <p className="success-msg">Location set: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
//         )}
//         {showMapPicker && (
//           <div className="map-picker-wrapper">
//             <MapPicker
//               initialCenter={location}
//               onSelect={handleMapPickerSelect}
//               height={260}
//             />
//           </div>
//         )}
//       </section>

//       {request ? (
//         <section className="card card--highlight">
//           <h2 className="card-title">Current Request</h2>
//           <div className="request-status">
//             <span className={`badge badge-${request.status}`}>
//               {request.status === 'to_hospital' ? 'To Hospital' : request.status}
//             </span>
//           </div>

//           {request.assigned_ambulance && (
//             <div className="info-grid">
//               <div><strong>Driver</strong><br />{request.assigned_ambulance.name}</div>
//               <div><strong>Phone</strong><br /><a href={`tel:${request.assigned_ambulance.phone}`}>{request.assigned_ambulance.phone}</a></div>
//               <div><strong>Vehicle</strong><br />{request.assigned_ambulance.vehicle_number}</div>
//               {request.selected_hospital && <div><strong>Hospital</strong><br />{request.selected_hospital.name}</div>}
//             </div>
//           )}

//           <div className="map-section">
//             <TrackingMap request={request} height={300} expandable />
//           </div>

//           {/* ── Cancel button ── */}
//           {canCancel && (
//             <div style={{ marginTop: '1.25rem', borderTop: '1px solid #f3f4f6', paddingTop: '1.25rem' }}>
//               <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.75rem', textAlign: 'center' }}>
//                 Made a mistake? You can cancel the request.
//               </p>
//               <button
//                 onClick={() => setShowCancelModal(true)}
//                 style={{
//                   width: '100%',
//                   padding: '0.8rem',
//                   borderRadius: 12,
//                   border: '2px solid #fca5a5',
//                   background: 'white',
//                   color: '#dc2626',
//                   fontWeight: 700,
//                   fontSize: '0.95rem',
//                   cursor: 'pointer',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '0.5rem',
//                   transition: 'all 0.2s',
//                 }}
//                 onMouseEnter={e => {
//                   e.currentTarget.style.background = '#fef2f2';
//                   e.currentTarget.style.boxShadow = '0 4px 14px rgba(239,68,68,0.18)';
//                 }}
//                 onMouseLeave={e => {
//                   e.currentTarget.style.background = 'white';
//                   e.currentTarget.style.boxShadow = 'none';
//                 }}
//               >
//                 ✕ Cancel Request
//                 {cancelCount > 0 && (
//                   <span style={{
//                     fontSize: '0.72rem', fontWeight: 500, color: '#9ca3af',
//                     background: '#f3f4f6', borderRadius: 10, padding: '0.1rem 0.5rem',
//                   }}>
//                     {3 - ((cancelCount + 1) % 3 || 3)} left before demerit
//                   </span>
//                 )}
//               </button>
//             </div>
//           )}
//         </section>
//       ) : (
//         <section className="card">
//           <h2 className="card-title">Request Emergency</h2>
//           <p className="card-desc">Set your location first, then request an ambulance.</p>
//           <div className="form-group" style={{ marginBottom: '1rem' }}>
//             <label>Ambulance Type</label>
//             <select value={ambulanceType} onChange={(e) => setAmbulanceType(e.target.value)} className="form-control">
//               <option value="any">Any</option>
//               <option value="basic_life">Basic Life Support</option>
//               <option value="advance_life">Advance Life Support</option>
//               <option value="icu_life">ICU Life Support</option>
//             </select>
//           </div>
//           <button className="btn btn-primary" onClick={handleRequestEmergency} disabled={loading || !location || userInfo?.is_blacklisted}>
//             {loading ? 'Requesting…' : userInfo?.is_blacklisted ? 'Account Blacklisted' : 'Request Emergency'}
//           </button>
//         </section>
//       )}

//       <footer className="page-footer">
//         <Link to="/user/profile">Edit Profile</Link>
//       </footer>

//       {/* ── Emergency AI Chatbot ── */}
//       <EmergencyChatbot />

//       <style>{`
//         @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
//         @keyframes slideUp { from { transform: translateY(30px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
//         @keyframes slideIn { from { transform: translateX(120%); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
//       `}</style>
//     </div>
//   );
// }

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as userApi from '../../api/userApi';
import { MapPicker, TrackingMap } from '../../components/LeafletMap';
import { sensorService } from '../../services/sensorService';
import EmergencyChatbot from '../../components/EmergencyChatbot';

/* =========================================================
   CANCEL MODAL
   Existing cancellation logic preserved
========================================================= */

function CancelModal({
  onConfirm,
  onClose,
  cancelCount,
  isCancelling,
}) {
  const nextCount = cancelCount + 1;
  const remaining =
    3 - (nextCount % 3 === 0 ? 3 : nextCount % 3);

  const willGetDemerit = nextCount % 3 === 0;

  return (
    <div className="rak-modal-overlay">
      <div className="rak-cancel-modal">

        <div className="rak-danger-icon">
          🚨
        </div>

        <h3>
          Cancel Emergency Request?
        </h3>

        <p>
          Are you sure you want to cancel your ambulance
          request? This will free up the ambulance for
          other emergencies.
        </p>

        <div
          className={
            willGetDemerit
              ? 'rak-cancel-warning danger'
              : 'rak-cancel-warning'
          }
        >
          {willGetDemerit ? (
            <>
              ⚠️ <strong>Warning:</strong> This is your{' '}
              <strong>{nextCount}rd/th cancellation</strong>.
              You will receive a{' '}
              <strong>demerit point</strong> for excessive
              cancellations.
            </>
          ) : (
            <>
              ℹ️ This will be cancellation{' '}
              <strong>#{nextCount}</strong>.{' '}
              {remaining === 1 ? (
                <>
                  ⚠️ <strong>1 more</strong> cancellation will
                  give you a demerit point.
                </>
              ) : (
                <>
                  {remaining} more cancellation(s) before a
                  demerit point.
                </>
              )}
            </>
          )}
        </div>

        <div className="rak-modal-actions">

          <button
            onClick={onClose}
            disabled={isCancelling}
            className="rak-modal-keep"
          >
            Keep Request
          </button>

          <button
            onClick={onConfirm}
            disabled={isCancelling}
            className="rak-modal-cancel"
          >
            {isCancelling
              ? 'Cancelling…'
              : 'Yes, Cancel'}
          </button>

        </div>
      </div>
    </div>
  );
}


/* =========================================================
   TOAST
   Existing notification behavior preserved
========================================================= */

function Toast({
  message,
  type = 'info',
  onClose,
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    warning: '#d97706',
    error: '#dc2626',
    success: '#059669',
    info: '#4f46e5',
  };

  const icons = {
    warning: '⚠️',
    error: '❌',
    success: '✅',
    info: 'ℹ️',
  };

  return (
    <div
      className="rak-toast"
      style={{
        borderLeftColor: colors[type],
      }}
    >
      <span className="rak-toast-icon">
        {icons[type]}
      </span>

      <div className="rak-toast-message">
        {message}
      </div>

      <button
        onClick={onClose}
        className="rak-toast-close"
      >
        ✕
      </button>
    </div>
  );
}


/* =========================================================
   MAIN USER DASHBOARD
========================================================= */

export default function UserDashboard() {

  const { logout } = useAuth();

  const [request, setRequest] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  /*
    EXISTING BACKEND VALUE
    --------------------------------
    any
    basic_life
    advance_life
    icu_life
  */
  const [ambulanceType, setAmbulanceType] =
    useState('any');

  /* Existing cancellation state */
  const [showCancelModal, setShowCancelModal] =
    useState(false);

  const [isCancelling, setIsCancelling] =
    useState(false);

  const [toast, setToast] = useState(null);


  /* =======================================================
     EXISTING: GET CURRENT REQUEST
  ======================================================= */

  const fetchRequest = async () => {
    try {
      const { data } =
        await userApi.getMyRequest();

      setRequest(data.request);

    } catch {
      setRequest(null);
    }
  };


  /* =======================================================
     EXISTING: GET USER
  ======================================================= */

  const refreshUser = async () => {
    try {
      const { data } =
        await userApi.getMe();

      setUserInfo(data.user);

    } catch {
      /* ignore */
    }
  };


  /* =======================================================
     EXISTING: REQUEST POLLING
     Every 3 seconds
  ======================================================= */

  useEffect(() => {

    fetchRequest();

    const id = setInterval(
      fetchRequest,
      3000
    );

    return () => clearInterval(id);

  }, []);


  /* =======================================================
     EXISTING: ASSIGNMENT DETECTION
     AND ALARM
  ======================================================= */

  const prevRequestRef =
    useRef(null);

  useEffect(() => {

    if (
      request?.assigned_ambulance &&
      request.status === 'assigned' &&
      (
        !prevRequestRef.current?.assigned_ambulance ||
        prevRequestRef.current?.status !== 'assigned'
      )
    ) {
      playAlarmSound();
    }

    prevRequestRef.current = request;

  }, [request]);


  /* =======================================================
     EXISTING: USER PROFILE + SENSOR SERVICE
  ======================================================= */

  useEffect(() => {

    (async () => {

      try {

        const { data } =
          await userApi.getMe();

        setUserInfo(data.user);

        if (
          !data.user?.profile_completed
        ) {
          window.location.href =
            '/user/profile';

          return;
        }

        if (
          data.user?.accident_detection_enabled
        ) {
          sensorService.start();
        }

      } catch {
        /* ignore */
      }

    })();

    return () =>
      sensorService.stop();

  }, []);


  /* =======================================================
     EXISTING: GPS LOCATION
  ======================================================= */

  const tryGeolocation = () => {

    if (!navigator.geolocation) {

      setError(
        'Geolocation is not supported by your browser'
      );

      setShowMapPicker(true);

      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(

      async (pos) => {

        const {
          latitude,
          longitude,
        } = pos.coords;

        await updateLocationWithCoords(
          latitude,
          longitude
        );

        setLoading(false);
      },

      () => {

        setError(
          'Location access denied. Please select your location on the map below.'
        );

        setShowMapPicker(true);

        setLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };


  /* =======================================================
     EXISTING: UPDATE LOCATION
  ======================================================= */

  const updateLocationWithCoords =
    async (lat, lng) => {

      setLoading(true);
      setError('');

      try {

        await userApi.updateLocation(
          lat,
          lng
        );

        setLocation({
          lat,
          lng,
        });

        setShowMapPicker(false);

      } catch (e) {

        setError(
          e.response?.data?.error ||
          'Failed to update location'
        );

      } finally {

        setLoading(false);
      }
    };


  /* =======================================================
     EXISTING: MANUAL MAP LOCATION
  ======================================================= */

  const handleMapPickerSelect =
    (lat, lng) => {

      updateLocationWithCoords(
        lat,
        lng
      );
    };


  /* =======================================================
     EXISTING: REQUEST EMERGENCY
  ======================================================= */

  const handleRequestEmergency =
    async () => {

      if (!location) {

        setError(
          'Please set your location first'
        );

        return;
      }

      setLoading(true);
      setError('');

      try {

        /*
          IMPORTANT:
          EXACT SAME BACKEND CALL

          latitude
          longitude
          ambulanceType
        */

        const { data } =
          await userApi.requestEmergency(
            location.lat,
            location.lng,
            ambulanceType
          );

        setRequest(
          data.request
        );

        if (
          data.request?.assigned_ambulance
        ) {
          playAlarmSound();
        }

      } catch (err) {

        setError(
          err.response?.data?.error ||
          'Failed to create request'
        );

      } finally {

        setLoading(false);
      }
    };


  /* =======================================================
     EXISTING: CANCEL REQUEST
  ======================================================= */

  const handleCancelConfirmed =
    async () => {

      if (!request?._id) {
        return;
      }

      setIsCancelling(true);

      try {

        /*
          EXISTING BACKEND CALL
        */

        const { data } =
          await userApi.cancelRequest(
            request._id
          );

        setRequest(null);

        setShowCancelModal(false);

        await refreshUser();


        if (data.demerit_added) {

          setToast({
            type: 'warning',
            message:
              data.warning ||
              `⚠️ Demerit point added. You now have ${data.demerit_points} demerit point(s).`,
          });

        } else {

          setToast({
            type: 'info',
            message:
              data.info ||
              'Request cancelled. The ambulance has been freed.',
          });
        }

      } catch (err) {

        setToast({
          type: 'error',
          message:
            err.response?.data?.error ||
            'Failed to cancel request. Please try again.',
        });

        setShowCancelModal(false);

      } finally {

        setIsCancelling(false);
      }
    };


  /* =======================================================
     EXISTING: VIBRATION
  ======================================================= */

  const vibrate =
    (pattern = [
      200,
      100,
      200,
      100,
      400,
    ]) => {

      if (navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    };


  /* =======================================================
     EXISTING: ALARM
  ======================================================= */

  const playAlarmSound = () => {

    vibrate();

    try {

      const audioContext =
        new (
          window.AudioContext ||
          window.webkitAudioContext
        )();

      const oscillator =
        audioContext.createOscillator();

      const gainNode =
        audioContext.createGain();

      oscillator.connect(gainNode);

      gainNode.connect(
        audioContext.destination
      );

      oscillator.frequency.value = 800;

      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(
        0.3,
        audioContext.currentTime
      );

      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 3
      );

      oscillator.start(
        audioContext.currentTime
      );

      oscillator.stop(
        audioContext.currentTime + 3
      );

    } catch (_) {
      /* ignore */
    }
  };


  /* =======================================================
     EXISTING: CANCELLATION DATA
  ======================================================= */

  const cancelCount =
    userInfo?.cancel_count || 0;

  const canCancel =
    request &&
    ['pending', 'assigned']
      .includes(request.status);


  /* =======================================================
     DERIVED FRONTEND STATE
     NO BACKEND CHANGE
  ======================================================= */

  const isAssigned =
    Boolean(
      request?.assigned_ambulance
    );

  const isPending =
    request?.status === 'pending';

  const isToHospital =
    request?.status === 'to_hospital';

  const isActive =
    Boolean(request);

  const locationReady =
    Boolean(location);


  /* =======================================================
     UI
  ======================================================= */

  return (

    <div className="rak-dashboard">


      {/* ===================================================
          GLOBAL STYLE
      =================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .rak-dashboard {
          min-height: 100vh;

          color: #0f172a;

          background:
            #f5f7fb;

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          overflow-x: hidden;
        }


        /* ================================================
           NAVBAR
        ================================================ */

        .rak-navbar {
          position: fixed;

          top: 0;
          left: 0;
          right: 0;

          height: 72px;

          z-index: 1000;

          display: flex;

          align-items: center;

          justify-content: space-between;

          padding:
            0 clamp(18px, 4vw, 55px);

          background:
            rgba(255,255,255,0.88);

          border-bottom:
            1px solid #e8edf4;

          backdrop-filter:
            blur(20px);

          -webkit-backdrop-filter:
            blur(20px);
        }


        .rak-brand {
          display: flex;

          align-items: center;

          gap: 11px;
        }


        .rak-brand-logo {
          width: 41px;
          height: 41px;

          display: grid;

          place-items: center;

          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #1d4ed8
            );

          color: white;

          font-size: 20px;

          box-shadow:
            0 9px 24px
            rgba(37,99,235,.22);
        }


        .rak-brand-title {
          font-size: 16px;

          font-weight: 900;

          letter-spacing:
            -0.025em;
        }


        .rak-brand-title span {
          color: #ef4444;
        }


        .rak-brand-subtitle {
          margin-top: 2px;

          color: #94a3b8;

          font-size: 7px;

          font-weight: 900;

          letter-spacing: .12em;
        }


        .rak-nav-right {
          display: flex;

          align-items: center;

          gap: 10px;
        }


        .rak-protection {
          display: flex;

          align-items: center;

          gap: 7px;

          padding:
            8px 12px;

          border-radius: 999px;

          color: #15803d;

          background:
            #f0fdf4;

          border:
            1px solid #dcfce7;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: .05em;
        }


        .rak-online-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #22c55e;

          box-shadow:
            0 0 0 4px
            rgba(34,197,94,.12);
        }


        .rak-logout {
          height: 40px;

          padding:
            0 15px;

          border:
            1px solid #e2e8f0;

          border-radius: 11px;

          background: white;

          color: #475569;

          font-weight: 700;

          cursor: pointer;

          transition: .2s;
        }


        .rak-logout:hover {
          background: #f8fafc;

          border-color: #cbd5e1;
        }


        /* ================================================
           MAIN
        ================================================ */

        .rak-main {
          padding-top: 72px;

          min-height: 100vh;
        }


        /* ================================================
           MAP AREA
        ================================================ */

        .rak-map-area {
          position: relative;

          min-height:
            calc(100vh - 72px);

          background:
            #e8edf3;

          overflow: hidden;
        }


        .rak-map-container {
          position: absolute;

          inset: 0;

          width: 100%;
          height: 100%;
        }


        .rak-map-container .leaflet-container {
          width: 100%;
          height: 100%;
        }


        /* ================================================
           LOCATION CONTROL
        ================================================ */

        .rak-location-card {
          position: absolute;

          top: 25px;
          left: 25px;

          z-index: 500;

          width:
            min(390px, calc(100% - 50px));

          padding: 20px;

          border:
            1px solid
            rgba(255,255,255,.85);

          border-radius: 20px;

          background:
            rgba(255,255,255,.94);

          box-shadow:
            0 15px 45px
            rgba(15,23,42,.14);

          backdrop-filter:
            blur(18px);
        }


        .rak-location-header {
          display: flex;

          align-items: center;

          gap: 11px;

          margin-bottom: 7px;
        }


        .rak-location-icon {
          width: 36px;
          height: 36px;

          display: grid;

          place-items: center;

          border-radius: 11px;

          background: #eff6ff;

          color: #2563eb;

          font-size: 18px;
        }


        .rak-location-title {
          font-size: 14px;

          font-weight: 850;
        }


        .rak-location-description {
          margin:
            0 0 14px 47px;

          color: #64748b;

          font-size: 11px;

          line-height: 1.5;
        }


        .rak-location-button {
          width: 100%;

          height: 46px;

          border: none;

          border-radius: 12px;

          background:
            #0f172a;

          color: white;

          font-weight: 800;

          cursor: pointer;

          transition: .2s;
        }


        .rak-location-button:hover {
          background: #1e293b;

          transform:
            translateY(-1px);
        }


        .rak-location-button:disabled {
          opacity: .55;

          cursor: not-allowed;

          transform: none;
        }


        .rak-location-success {
          margin-top: 10px;

          padding: 9px 11px;

          border-radius: 10px;

          color: #15803d;

          background: #f0fdf4;

          font-size: 10px;

          font-weight: 700;
        }


        /* ================================================
           MAP PICKER
        ================================================ */

        .rak-map-picker {
          position: absolute;

          top: 155px;
          left: 25px;

          z-index: 600;

          width:
            min(450px, calc(100% - 50px));

          padding: 7px;

          border-radius: 17px;

          background: white;

          box-shadow:
            0 18px 50px
            rgba(15,23,42,.18);
        }


        /* ================================================
           EMPTY STATE / REQUEST PANEL
        ================================================ */

        .rak-bottom-panel {
          position: absolute;

          left: 25px;
          right: 25px;
          bottom: 25px;

          z-index: 500;

          display: flex;

          justify-content: center;

          pointer-events: none;
        }


        .rak-bottom-card {
          pointer-events: auto;

          width:
            min(760px, 100%);

          padding: 24px;

          border:
            1px solid
            rgba(255,255,255,.9);

          border-radius: 26px;

          background:
            rgba(255,255,255,.96);

          box-shadow:
            0 24px 70px
            rgba(15,23,42,.18);

          backdrop-filter:
            blur(22px);

          -webkit-backdrop-filter:
            blur(22px);
        }


        .rak-request-heading {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 15px;

          margin-bottom: 18px;
        }


        .rak-request-heading h2 {
          margin: 0;

          font-size: 20px;

          letter-spacing:
            -0.03em;
        }


        .rak-request-heading p {
          margin: 5px 0 0;

          color: #64748b;

          font-size: 11px;
        }


        /* ================================================
           AMBULANCE TYPES
        ================================================ */

        .rak-types {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 10px;

          margin-bottom: 17px;
        }


        .rak-type {
          position: relative;

          min-height: 92px;

          padding: 13px 9px;

          border:
            1px solid #e2e8f0;

          border-radius: 15px;

          background: white;

          cursor: pointer;

          text-align: center;

          transition:
            transform .18s,
            border-color .18s,
            box-shadow .18s;
        }


        .rak-type:hover {
          transform:
            translateY(-2px);

          border-color:
            #bfdbfe;

          box-shadow:
            0 8px 20px
            rgba(37,99,235,.08);
        }


        .rak-type.selected {
          border-color:
            #2563eb;

          background:
            #eff6ff;

          box-shadow:
            inset 0 0 0 1px
            #2563eb;
        }


        .rak-type-icon {
          width: 39px;
          height: 39px;

          margin:
            0 auto 6px;

          display: grid;

          place-items: center;

          border-radius: 11px;

          background:
            #f8fafc;

          font-size: 22px;
        }


        .rak-type.selected
        .rak-type-icon {
          background: white;
        }


        .rak-type-name {
          display: block;

          color: #0f172a;

          font-size: 11px;

          font-weight: 850;
        }


        .rak-type-subtitle {
          display: block;

          margin-top: 3px;

          color: #94a3b8;

          font-size: 8px;
        }


        /* ================================================
           EMERGENCY BUTTON
        ================================================ */

        .rak-emergency-button {
          width: 100%;

          height: 58px;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 10px;

          border: none;

          border-radius: 15px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #ef4444,
              #dc2626
            );

          box-shadow:
            0 14px 30px
            rgba(239,68,68,.28);

          font-size: 14px;

          font-weight: 900;

          letter-spacing: .02em;

          cursor: pointer;

          transition:
            transform .18s,
            box-shadow .18s;
        }


        .rak-emergency-button:hover:not(:disabled) {
          transform:
            translateY(-2px);

          box-shadow:
            0 18px 38px
            rgba(239,68,68,.34);
        }


        .rak-emergency-button:disabled {
          opacity: .55;

          cursor: not-allowed;

          box-shadow: none;
        }


        .rak-emergency-icon {
          font-size: 19px;
        }


        /* ================================================
           ACTIVE REQUEST CARD
        ================================================ */

        .rak-active-card {
          pointer-events: auto;

          width:
            min(650px, 100%);

          padding: 22px;

          border-radius: 25px;

          background:
            rgba(255,255,255,.97);

          box-shadow:
            0 25px 70px
            rgba(15,23,42,.20);
        }


        .rak-active-top {
          display: flex;

          align-items: center;

          justify-content: space-between;

          margin-bottom: 18px;
        }


        .rak-active-title {
          display: flex;

          align-items: center;

          gap: 12px;
        }


        .rak-ambulance-image {
          width: 58px;
          height: 42px;

          object-fit: contain;

          /*
            Put ambulance.png inside:

            public/ambulance.png

            If the image is not present,
            the emoji fallback below is used.
          */
        }


        .rak-ambulance-fallback {
          width: 58px;
          height: 42px;

          display: grid;

          place-items: center;

          border-radius: 12px;

          background: #fff1f2;

          font-size: 28px;
        }


        .rak-active-title h2 {
          margin: 0;

          font-size: 18px;

          letter-spacing:
            -.025em;
        }


        .rak-active-title p {
          margin: 4px 0 0;

          color: #64748b;

          font-size: 10px;
        }


        .rak-status-pill {
          padding:
            7px 11px;

          border-radius: 999px;

          color: #047857;

          background: #ecfdf5;

          font-size: 9px;

          font-weight: 900;

          text-transform: uppercase;
        }


        /* ================================================
           DRIVER
        ================================================ */

        .rak-driver-card {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 14px;

          padding: 15px;

          border-radius: 16px;

          background: #f8fafc;

          border:
            1px solid #eef2f7;
        }


        .rak-driver-label {
          margin-bottom: 4px;

          color: #94a3b8;

          font-size: 9px;

          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: .06em;
        }


        .rak-driver-value {
          color: #0f172a;

          font-size: 13px;

          font-weight: 750;
        }


        .rak-driver-phone {
          color: #2563eb;

          text-decoration: none;
        }


        .rak-driver-phone:hover {
          text-decoration: underline;
        }


        /* ================================================
           REQUEST STATUS
        ================================================ */

        .rak-progress {
          display: flex;

          align-items: center;

          gap: 8px;

          margin:
            16px 0;

          color: #64748b;

          font-size: 10px;

          font-weight: 700;
        }


        .rak-progress-dot {
          width: 9px;
          height: 9px;

          border-radius: 50%;

          background: #22c55e;

          box-shadow:
            0 0 0 5px
            rgba(34,197,94,.10);
        }


        .rak-progress-line {
          flex: 1;

          height: 2px;

          background:
            linear-gradient(
              90deg,
              #22c55e,
              #dbeafe
            );
        }


        /* ================================================
           HOSPITAL
        ================================================ */

        .rak-hospital {
          margin-top: 12px;

          padding: 12px 14px;

          border-radius: 13px;

          background: #eff6ff;

          color: #1e40af;

          font-size: 11px;

          font-weight: 700;
        }


        /* ================================================
           CALL + CANCEL
        ================================================ */

        .rak-action-row {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 9px;

          margin-top: 14px;
        }


        .rak-call-button,
        .rak-cancel-button {
          height: 44px;

          border-radius: 12px;

          font-weight: 800;

          cursor: pointer;

          transition: .2s;
        }


        .rak-call-button {
          border: none;

          color: white;

          background:
            #0f172a;
        }


        .rak-call-button:hover {
          background:
            #1e293b;
        }


        .rak-cancel-button {
          border:
            1px solid #fecaca;

          color: #dc2626;

          background: white;
        }


        .rak-cancel-button:hover {
          background: #fef2f2;
        }


        /* ================================================
           SEARCHING STATE
        ================================================ */

        .rak-searching {
          display: flex;

          align-items: center;

          gap: 14px;

          padding: 18px;

          border-radius: 16px;

          background: #f8fafc;
        }


        .rak-search-spinner {
          width: 32px;
          height: 32px;

          border:
            3px solid #dbeafe;

          border-top-color:
            #2563eb;

          border-radius: 50%;

          animation:
            rak-spin .8s linear infinite;
        }


        @keyframes rak-spin {
          to {
            transform: rotate(360deg);
          }
        }


        .rak-searching strong {
          display: block;

          font-size: 13px;
        }


        .rak-searching span {
          display: block;

          margin-top: 3px;

          color: #64748b;

          font-size: 10px;
        }


        /* ================================================
           WARNINGS
        ================================================ */

        .rak-warning {
          position: fixed;

          top: 88px;

          left: 50%;

          transform:
            translateX(-50%);

          z-index: 1100;

          width:
            min(600px, calc(100% - 30px));

          padding: 12px 15px;

          border-radius: 13px;

          background: white;

          box-shadow:
            0 12px 35px
            rgba(15,23,42,.13);

          font-size: 11px;

          font-weight: 700;
        }


        .rak-warning.danger {
          border:
            1px solid #fecaca;

          color: #dc2626;
        }


        .rak-warning.orange {
          border:
            1px solid #fed7aa;

          color: #c2410c;
        }


        /* ================================================
           BOTTOM LEFT INFO
        ================================================ */

        .rak-safety-badge {
          position: absolute;

          left: 25px;
          bottom: 25px;

          z-index: 450;

          display: flex;

          align-items: center;

          gap: 8px;

          padding:
            9px 12px;

          border-radius: 999px;

          color: #15803d;

          background:
            rgba(255,255,255,.90);

          box-shadow:
            0 8px 25px
            rgba(15,23,42,.12);

          font-size: 9px;

          font-weight: 850;
        }


        /* ================================================
           TOAST
        ================================================ */

        .rak-toast {
          position: fixed;

          top: 88px;
          right: 20px;

          z-index: 9999;

          width:
            min(370px, calc(100% - 40px));

          display: flex;

          align-items: flex-start;

          gap: 10px;

          padding:
            14px 15px;

          border:
            1px solid #e2e8f0;

          border-left:
            5px solid;

          border-radius: 14px;

          background: white;

          box-shadow:
            0 12px 40px
            rgba(15,23,42,.16);

          animation:
            rak-toast-in .3s ease;
        }


        @keyframes rak-toast-in {

          from {
            opacity: 0;

            transform:
              translateX(40px);
          }

          to {
            opacity: 1;

            transform:
              translateX(0);
          }

        }


        .rak-toast-icon {
          font-size: 17px;
        }


        .rak-toast-message {
          flex: 1;

          color: #334155;

          font-size: 11px;

          line-height: 1.5;
        }


        .rak-toast-close {
          border: none;

          background: none;

          color: #94a3b8;

          cursor: pointer;
        }


        /* ================================================
           MODAL
        ================================================ */

        .rak-modal-overlay {
          position: fixed;

          inset: 0;

          z-index: 9999;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 20px;

          background:
            rgba(15,23,42,.55);

          backdrop-filter:
            blur(7px);
        }


        .rak-cancel-modal {
          width:
            min(400px, 100%);

          padding: 28px;

          border-radius: 23px;

          background: white;

          box-shadow:
            0 30px 100px
            rgba(0,0,0,.28);

          text-align: center;

          animation:
            rak-modal-in .25s ease;
        }


        @keyframes rak-modal-in {

          from {
            opacity: 0;

            transform:
              translateY(20px)
              scale(.97);
          }

          to {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }

        }


        .rak-danger-icon {
          margin-bottom: 10px;

          font-size: 42px;
        }


        .rak-cancel-modal h3 {
          margin:
            0 0 9px;

          font-size: 19px;
        }


        .rak-cancel-modal > p {
          margin:
            0 0 18px;

          color: #64748b;

          font-size: 12px;

          line-height: 1.6;
        }


        .rak-cancel-warning {
          margin-bottom: 20px;

          padding: 12px;

          border:
            1px solid #fde68a;

          border-radius: 12px;

          background: #fffbeb;

          color: #92400e;

          font-size: 11px;

          line-height: 1.5;
        }


        .rak-cancel-warning.danger {
          border-color: #fecaca;

          background: #fef2f2;

          color: #dc2626;
        }


        .rak-modal-actions {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 9px;
        }


        .rak-modal-keep,
        .rak-modal-cancel {
          height: 45px;

          border-radius: 12px;

          font-weight: 800;

          cursor: pointer;
        }


        .rak-modal-keep {
          border:
            1px solid #e2e8f0;

          background: white;

          color: #475569;
        }


        .rak-modal-cancel {
          border: none;

          background:
            linear-gradient(
              135deg,
              #ef4444,
              #dc2626
            );

          color: white;
        }


        /* ================================================
           CHATBOT
        ================================================ */

        .rak-dashboard
        > *:last-child {
          z-index: 2000;
        }


        /* ================================================
           RESPONSIVE
        ================================================ */

        @media (max-width: 800px) {

          .rak-protection {
            display: none;
          }

          .rak-map-area {
            min-height:
              calc(100vh - 68px);
          }

          .rak-location-card {
            top: 15px;
            left: 15px;

            width:
              calc(100% - 30px);
          }

          .rak-bottom-panel {
            left: 12px;
            right: 12px;
            bottom: 12px;
          }

          .rak-bottom-card,
          .rak-active-card {
            padding: 17px;

            border-radius: 20px;
          }

          .rak-types {
            gap: 6px;
          }

          .rak-type {
            min-height: 75px;

            padding: 8px 4px;
          }

          .rak-type-icon {
            width: 31px;
            height: 31px;

            font-size: 17px;
          }

          .rak-type-name {
            font-size: 9px;
          }

          .rak-type-subtitle {
            display: none;
          }

          .rak-driver-card {
            grid-template-columns: 1fr 1fr;
          }

          .rak-safety-badge {
            display: none;
          }

        }


        @media (max-width: 520px) {

          .rak-navbar {
            height: 64px;
          }

          .rak-main {
            padding-top: 64px;
          }

          .rak-brand-subtitle {
            display: none;
          }

          .rak-logout {
            height: 36px;

            padding: 0 10px;

            font-size: 10px;
          }

          .rak-map-area {
            min-height:
              calc(100vh - 64px);
          }

          .rak-location-card {
            padding: 14px;

            border-radius: 16px;
          }

          .rak-location-description {
            margin-left: 0;
          }

          .rak-request-heading h2 {
            font-size: 16px;
          }

          .rak-types {
            grid-template-columns:
              repeat(4, 1fr);
          }

          .rak-type {
            min-height: 67px;
          }

          .rak-type-icon {
            margin-bottom: 3px;
          }

          .rak-emergency-button {
            height: 52px;

            font-size: 12px;
          }

          .rak-active-top {
            align-items: flex-start;
          }

          .rak-status-pill {
            font-size: 7px;

            padding: 6px 8px;
          }

          .rak-driver-card {
            gap: 9px;
          }

          .rak-driver-value {
            font-size: 11px;
          }

        }

      `}</style>


      {/* ===================================================
          NAVBAR
      =================================================== */}

      <header className="rak-navbar">

        <div className="rak-brand">

          <div className="rak-brand-logo">
            🚑
          </div>

          <div>

            <div className="rak-brand-title">
              RAKSHAK <span>AI</span>
            </div>

            <div className="rak-brand-subtitle">
              EMERGENCY RESPONSE SYSTEM
            </div>

          </div>

        </div>


        <div className="rak-nav-right">

          <div className="rak-protection">

            <span className="rak-online-dot"></span>

            AI PROTECTION ACTIVE

          </div>


          <button
            className="rak-logout"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="rak-main">

        <section className="rak-map-area">


          {/* =================================================
              MAP
          ================================================= */}

          <div className="rak-map-container">

            {/*
              IMPORTANT:
              Existing TrackingMap is preserved.

              When there is no active request,
              we still use your existing map system
              through MapPicker when necessary.
            */}

            {request ? (

              <TrackingMap
                request={request}
                height="100%"
                expandable
              />

            ) : (

              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background:
                    '#e8edf3',
                }}
              >

                {showMapPicker && (
                  <MapPicker
                    initialCenter={location}
                    onSelect={
                      handleMapPickerSelect
                    }
                    height="100%"
                  />
                )}

              </div>

            )}

          </div>


          {/* =================================================
              LOCATION CARD
          ================================================= */}

          {!isAssigned && (

            <div className="rak-location-card">

              <div className="rak-location-header">

                <div className="rak-location-icon">
                  📍
                </div>

                <div className="rak-location-title">
                  Your Location
                </div>

              </div>


              <p className="rak-location-description">

                Allow location access so Rakshak can
                find the nearest available ambulance.

              </p>


              <button
                className="rak-location-button"
                onClick={tryGeolocation}
                disabled={loading}
              >

                {loading
                  ? 'Getting your location…'
                  : 'Allow & Update Location'}

              </button>


              {location && (

                <div className="rak-location-success">

                  ✓ Location ready •{' '}
                  {location.lat.toFixed(4)},{' '}
                  {location.lng.toFixed(4)}

                </div>

              )}

            </div>

          )}


          {/* =================================================
              MAP PICKER
          ================================================= */}

          {showMapPicker &&
            !request && (

              <div className="rak-map-picker">

                <MapPicker
                  initialCenter={location}
                  onSelect={
                    handleMapPickerSelect
                  }
                  height={260}
                />

              </div>

            )}


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="rak-warning danger">

              ⚠️ {error}

            </div>

          )}


          {/* =================================================
              BLACKLIST WARNING
          ================================================= */}

          {userInfo?.is_blacklisted && (

            <div className="rak-warning danger">

              🚫 Your account is blacklisted due to fake
              emergency requests. You cannot create new
              requests.

            </div>

          )}


          {/* =================================================
              DEMERIT WARNING
          ================================================= */}

          {userInfo &&
            userInfo.demerit_points > 0 &&
            !userInfo.is_blacklisted && (

              <div className="rak-warning orange">

                ⚠️ You have{' '}
                {userInfo.demerit_points}{' '}
                demerit point(s).

                {userInfo.demerit_points === 1 &&
                  ' One more fake/abusive request will result in blacklisting.'}

              </div>

            )}


          {/* =================================================
              CANCEL COUNT
          ================================================= */}

          {cancelCount > 0 &&
            cancelCount % 3 !== 0 &&
            !userInfo?.is_blacklisted && (

              <div className="rak-warning orange">

                🔄 You have cancelled{' '}
                <strong>
                  {cancelCount}
                </strong>{' '}
                request(s).{' '}

                {3 - (cancelCount % 3)} more
                will result in a demerit point.

              </div>

            )}


          {/* =================================================
              SAFETY BADGE
          ================================================= */}

          <div className="rak-safety-badge">

            <span className="rak-online-dot"></span>

            AI emergency protection active

          </div>


          {/* =================================================
              BOTTOM PANEL
          ================================================= */}

          <div className="rak-bottom-panel">


            {/* ===============================================
                NO ACTIVE REQUEST
            =============================================== */}

            {!isActive && (

              <div className="rak-bottom-card">

                <div className="rak-request-heading">

                  <div>

                    <h2>
                      Need emergency assistance?
                    </h2>

                    <p>
                      Select the ambulance type
                      and request immediate help.
                    </p>

                  </div>

                  <span
                    style={{
                      fontSize: 28,
                    }}
                  >
                    🚨
                  </span>

                </div>


                {/* =========================================
                    AMBULANCE TYPES
                ========================================= */}

                <div className="rak-types">


                  {/* ANY */}

                  <button
                    type="button"
                    className={
                      ambulanceType === 'any'
                        ? 'rak-type selected'
                        : 'rak-type'
                    }
                    onClick={() =>
                      setAmbulanceType('any')
                    }
                  >

                    <div className="rak-type-icon">
                      🚑
                    </div>

                    <span className="rak-type-name">
                      Any
                    </span>

                    <span className="rak-type-subtitle">
                      Nearest
                    </span>

                  </button>


                  {/* BLS */}

                  <button
                    type="button"
                    className={
                      ambulanceType === 'basic_life'
                        ? 'rak-type selected'
                        : 'rak-type'
                    }
                    onClick={() =>
                      setAmbulanceType(
                        'basic_life'
                      )
                    }
                  >

                    <div className="rak-type-icon">
                      🚑
                    </div>

                    <span className="rak-type-name">
                      BLS
                    </span>

                    <span className="rak-type-subtitle">
                      Basic Life
                    </span>

                  </button>


                  {/* ALS */}

                  <button
                    type="button"
                    className={
                      ambulanceType === 'advance_life'
                        ? 'rak-type selected'
                        : 'rak-type'
                    }
                    onClick={() =>
                      setAmbulanceType(
                        'advance_life'
                      )
                    }
                  >

                    <div className="rak-type-icon">
                      🚑
                    </div>

                    <span className="rak-type-name">
                      ALS
                    </span>

                    <span className="rak-type-subtitle">
                      Advanced
                    </span>

                  </button>


                  {/* ICU */}

                  <button
                    type="button"
                    className={
                      ambulanceType === 'icu_life'
                        ? 'rak-type selected'
                        : 'rak-type'
                    }
                    onClick={() =>
                      setAmbulanceType(
                        'icu_life'
                      )
                    }
                  >

                    <div className="rak-type-icon">
                      🚑
                    </div>

                    <span className="rak-type-name">
                      ICU
                    </span>

                    <span className="rak-type-subtitle">
                      Critical Care
                    </span>

                  </button>

                </div>


                {/* =========================================
                    REQUEST BUTTON
                ========================================= */}

                <button
                  className="rak-emergency-button"
                  onClick={
                    handleRequestEmergency
                  }
                  disabled={
                    loading ||
                    !locationReady ||
                    userInfo?.is_blacklisted
                  }
                >

                  <span className="rak-emergency-icon">
                    🚨
                  </span>

                  {loading
                    ? 'REQUESTING AMBULANCE…'
                    : userInfo?.is_blacklisted
                      ? 'ACCOUNT BLACKLISTED'
                      : !locationReady
                        ? 'SET LOCATION FIRST'
                        : 'REQUEST EMERGENCY'}

                </button>

              </div>

            )}


            {/* ===============================================
                ACTIVE REQUEST
            =============================================== */}

            {isActive && (

              <div className="rak-active-card">


                {/* =========================================
                    HEADER
                ========================================= */}

                <div className="rak-active-top">

                  <div className="rak-active-title">

                    <div className="rak-ambulance-fallback">
                      🚑
                    </div>

                    <div>

                      <h2>

                        {isAssigned
                          ? 'Ambulance is on the way'
                          : isToHospital
                            ? 'Heading to hospital'
                            : 'Finding an ambulance'}

                      </h2>

                      <p>

                        {isAssigned
                          ? 'Your emergency response team has been assigned.'
                          : isPending
                            ? 'Searching nearby emergency responders…'
                            : 'Your request is active.'}

                      </p>

                    </div>

                  </div>


                  <span className="rak-status-pill">

                    {request.status ===
                    'to_hospital'
                      ? 'To Hospital'
                      : request.status}

                  </span>

                </div>


                {/* =========================================
                    SEARCHING
                ========================================= */}

                {isPending &&
                  !isAssigned && (

                    <div className="rak-searching">

                      <div className="rak-search-spinner"></div>

                      <div>

                        <strong>
                          Finding nearest ambulance
                        </strong>

                        <span>
                          Please stay available.
                          We are checking nearby responders.
                        </span>

                      </div>

                    </div>

                  )}


                {/* =========================================
                    ASSIGNED DRIVER
                ========================================= */}

                {request.assigned_ambulance && (

                  <>

                    <div className="rak-driver-card">


                      <div>

                        <div className="rak-driver-label">
                          Driver
                        </div>

                        <div className="rak-driver-value">
                          {request.assigned_ambulance.name}
                        </div>

                      </div>


                      <div>

                        <div className="rak-driver-label">
                          Vehicle
                        </div>

                        <div className="rak-driver-value">
                          {request.assigned_ambulance.vehicle_number}
                        </div>

                      </div>


                      <div>

                        <div className="rak-driver-label">
                          Phone
                        </div>

                        <div className="rak-driver-value">

                          <a
                            href={
                              `tel:${request.assigned_ambulance.phone}`
                            }
                            className="rak-driver-phone"
                          >
                            {request.assigned_ambulance.phone}
                          </a>

                        </div>

                      </div>


                      {request.selected_hospital && (

                        <div>

                          <div className="rak-driver-label">
                            Hospital
                          </div>

                          <div className="rak-driver-value">
                            {request.selected_hospital.name}
                          </div>

                        </div>

                      )}

                    </div>


                    {/* =====================================
                        PROGRESS
                    ===================================== */}

                    <div className="rak-progress">

                      <span className="rak-progress-dot"></span>

                      Ambulance assigned

                      <span className="rak-progress-line"></span>

                      <span className="rak-progress-dot"></span>

                      Driver responding

                    </div>


                    {/* =====================================
                        HOSPITAL
                    ===================================== */}

                    {request.selected_hospital && (

                      <div className="rak-hospital">

                        🏥 Destination:{' '}
                        {request.selected_hospital.name}

                      </div>

                    )}


                    {/* =====================================
                        ACTION BUTTONS
                    ===================================== */}

                    {canCancel && (

                      <div className="rak-action-row">

                        <a
                          href={
                            `tel:${request.assigned_ambulance.phone}`
                          }
                          className="rak-call-button"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none',
                          }}
                        >
                          📞 Call Driver
                        </a>


                        <button
                          className="rak-cancel-button"
                          onClick={() =>
                            setShowCancelModal(true)
                          }
                        >
                          ✕ Cancel Request
                        </button>

                      </div>

                    )}

                  </>

                )}

              </div>

            )}

          </div>


          {/* =================================================
              EXISTING EMERGENCY AI CHATBOT
          ================================================= */}

          <EmergencyChatbot />

        </section>

      </main>


      {/* ===================================================
          CANCEL MODAL
      =================================================== */}

      {showCancelModal && (

        <CancelModal
          onConfirm={
            handleCancelConfirmed
          }

          onClose={() =>
            !isCancelling &&
            setShowCancelModal(false)
          }

          cancelCount={
            cancelCount
          }

          isCancelling={
            isCancelling
          }
        />

      )}


      {/* ===================================================
          TOAST
      =================================================== */}

      {toast && (

        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast(null)
          }
        />

      )}

    </div>
  );
}