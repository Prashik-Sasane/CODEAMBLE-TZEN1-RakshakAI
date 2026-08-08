import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/adminApi';

import {
  HeartPulse,
  ShieldCheck,
  LockKeyhole,
  UserRound,
  ArrowRight,
  CheckCircle2,
  Radio,
} from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // =====================================================
  // EXISTING ADMIN BACKEND LOGIC — UNCHANGED
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await adminApi.login(username, password);

      loginAdmin({ token: data.token });

      navigate('/admin/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Invalid credentials'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      <style>{`

        /* =====================================================
           PAGE
        ===================================================== */

        .admin-login-page {
          min-height: 100vh;
          width: 100%;
          position: relative;
          overflow: hidden;

          display: flex;
          flex-direction: column;

          background:
            radial-gradient(
              circle at 5% 15%,
              rgba(37, 99, 235, 0.08),
              transparent 30%
            ),
            radial-gradient(
              circle at 95% 85%,
              rgba(239, 68, 68, 0.07),
              transparent 30%
            ),
            #f8fafc;

          color: #0f172a;

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }


        /* =====================================================
           BACKGROUND
        ===================================================== */

        .admin-grid {
          position: absolute;
          inset: 0;

          opacity: 0.32;

          background-image:
            linear-gradient(
              rgba(37, 99, 235, 0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(37, 99, 235, 0.035) 1px,
              transparent 1px
            );

          background-size: 60px 60px;

          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent 90%
            );

          pointer-events: none;
        }

        .admin-orb {
          position: absolute;

          border-radius: 50%;

          filter: blur(75px);

          pointer-events: none;
        }

        .admin-orb-blue {
          width: 380px;
          height: 380px;

          left: -190px;
          top: 12%;

          background:
            rgba(37, 99, 235, 0.09);
        }

        .admin-orb-red {
          width: 350px;
          height: 350px;

          right: -180px;
          bottom: 10%;

          background:
            rgba(239, 68, 68, 0.07);
        }


        /* =====================================================
           NAVBAR
        ===================================================== */

        .admin-login-nav {
          position: relative;
          z-index: 10;

          height: 76px;

          padding: 0 5%;

          display: flex;
          align-items: center;
          justify-content: space-between;

          background:
            rgba(255, 255, 255, 0.82);

          border-bottom:
            1px solid #e2e8f0;

          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .admin-brand {
          display: flex;
          align-items: center;

          gap: 11px;
        }

        .admin-brand-icon {
          width: 43px;
          height: 43px;

          display: grid;
          place-items: center;

          border-radius: 13px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #1d4ed8
            );

          box-shadow:
            0 10px 24px
            rgba(37, 99, 235, 0.23);
        }

        .admin-brand-name {
          color: #0f172a;

          font-size: 18px;
          font-weight: 900;

          letter-spacing: -0.02em;
        }

        .admin-brand-name span {
          color: #ef4444;
        }

        .admin-brand-subtitle {
          margin-top: 2px;

          color: #64748b;

          font-size: 8px;
          font-weight: 800;

          letter-spacing: 0.12em;
        }

        .admin-status {
          display: flex;
          align-items: center;

          gap: 9px;

          color: #16a34a;

          font-size: 10px;
          font-weight: 900;

          letter-spacing: 0.08em;
        }

        .admin-status-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #22c55e;

          box-shadow:
            0 0 0 5px
            rgba(34, 197, 94, 0.10);

          animation: adminPulse 2s infinite;
        }

        @keyframes adminPulse {
          50% {
            box-shadow:
              0 0 0 9px
              rgba(34, 197, 94, 0);
          }
        }


        /* =====================================================
           MAIN
        ===================================================== */

        .admin-login-content {
          position: relative;
          z-index: 2;

          width:
            min(1180px, calc(100% - 48px));

          flex: 1;

          margin: 0 auto;

          display: grid;

          grid-template-columns:
            0.85fr 1.15fr;

          align-items: center;

          gap: 90px;

          padding: 70px 0;
        }


        /* =====================================================
           LEFT INFORMATION
        ===================================================== */

        .admin-information {
          max-width: 490px;
        }

        .admin-kicker {
          display: inline-flex;
          align-items: center;

          gap: 8px;

          padding: 9px 14px;

          border-radius: 999px;

          color: #2563eb;

          background: #eff6ff;

          border:
            1px solid #dbeafe;

          font-size: 10px;
          font-weight: 900;

          letter-spacing: 0.10em;
        }

        .admin-kicker-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #2563eb;

          box-shadow:
            0 0 0 4px
            rgba(37, 99, 235, 0.10);
        }

        .admin-information h1 {
          margin: 24px 0 20px;

          color: #0f1f3d;

          font-size:
            clamp(3.4rem, 5vw, 5.5rem);

          line-height: 0.96;

          letter-spacing: -0.065em;

          font-weight: 800;
        }

        .admin-information h1 span {
          color: #ef4444;
        }

        .admin-description {
          max-width: 460px;

          color: #64748b;

          font-size: 16px;

          line-height: 1.75;
        }


        /* =====================================================
           FEATURES
        ===================================================== */

        .admin-feature-row {
          display: flex;

          align-items: center;

          gap: 25px;

          margin-top: 35px;
        }

        .admin-feature {
          display: flex;

          align-items: center;

          gap: 9px;

          color: #475569;

          font-size: 11px;
          font-weight: 800;
        }

        .admin-feature svg {
          color: #2563eb;
        }

        .admin-feature.red svg {
          color: #ef4444;
        }


        /* =====================================================
           LOGIN PANEL
        ===================================================== */

        .admin-login-panel {
          position: relative;

          width: 100%;

          padding: 14px;
        }

        .admin-login-card {
          position: relative;

          width: 100%;

          min-height: 560px;

          display: flex;
          flex-direction: column;
          justify-content: center;

          padding: 62px 70px;

          border:
            1px solid
            rgba(226, 232, 240, 0.95);

          border-radius: 30px;

          background:
            rgba(255, 255, 255, 0.91);

          box-shadow:
            0 35px 90px
            rgba(15, 23, 42, 0.10),

            0 4px 12px
            rgba(15, 23, 42, 0.035);

          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);

          overflow: hidden;

          animation:
            adminCardIn 0.65s ease;
        }

        @keyframes adminCardIn {
          from {
            opacity: 0;

            transform:
              translateY(18px)
              scale(0.985);
          }

          to {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }
        }

        .admin-login-card::before {
          content: "";

          position: absolute;

          top: 0;
          left: 70px;
          right: 70px;

          height: 3px;

          background:
            linear-gradient(
              90deg,
              #2563eb 0%,
              #2563eb 60%,
              #ef4444 100%
            );

          border-radius:
            0 0 10px 10px;
        }


        /* =====================================================
           CARD HEADER
        ===================================================== */

        .admin-card-top {
          display: flex;

          align-items: center;
          justify-content: space-between;

          margin-bottom: 40px;
        }

        .admin-card-icon {
          width: 60px;
          height: 60px;

          display: grid;
          place-items: center;

          border-radius: 17px;

          color: #2563eb;

          background:
            linear-gradient(
              145deg,
              #eff6ff,
              #dbeafe
            );

          border:
            1px solid #dbeafe;

          box-shadow:
            0 12px 28px
            rgba(37, 99, 235, 0.12);
        }

        .admin-secure-badge {
          display: flex;
          align-items: center;

          gap: 6px;

          padding: 8px 11px;

          border-radius: 999px;

          color: #16a34a;

          background: #f0fdf4;

          border:
            1px solid #dcfce7;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 0.08em;
        }

        .admin-secure-badge span {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #22c55e;
        }


        /* =====================================================
           CARD CONTENT
        ===================================================== */

        .admin-eyebrow {
          margin-bottom: 9px;

          color: #2563eb;

          font-size: 10px;
          font-weight: 900;

          letter-spacing: 0.14em;
        }

        .admin-login-card h2 {
          margin: 0 0 13px;

          color: #0f172a;

          font-size:
            clamp(2.2rem, 4vw, 3.2rem);

          line-height: 1;

          letter-spacing: -0.055em;

          font-weight: 800;
        }

        .admin-card-description {
          max-width: 510px;

          margin: 0;

          color: #64748b;

          font-size: 14px;

          line-height: 1.7;
        }


        /* =====================================================
           FORM
        ===================================================== */

        .admin-login-form {
          margin-top: 38px;

          max-width: 560px;
        }

        .admin-label {
          display: block;

          margin-bottom: 9px;

          color: #334155;

          font-size: 12px;
          font-weight: 800;
        }


        /* =====================================================
           INPUT
        ===================================================== */

        .admin-input-wrapper {
          height: 64px;

          display: flex;
          align-items: center;

          gap: 13px;

          padding: 0 18px;

          border:
            1px solid #dbe3ef;

          border-radius: 16px;

          background: #f8fafc;

          transition:
            border-color 0.2s,
            box-shadow 0.2s,
            background 0.2s;
        }

        .admin-input-wrapper:focus-within {
          background: white;

          border-color: #60a5fa;

          box-shadow:
            0 0 0 5px
            rgba(37, 99, 235, 0.08);
        }

        .admin-input-icon {
          flex-shrink: 0;

          color: #64748b;
        }

        .admin-input-wrapper:focus-within
        .admin-input-icon {
          color: #2563eb;
        }

        .admin-input-wrapper input {
          flex: 1;

          width: 100%;
          height: 100%;

          border: none;
          outline: none;

          background: transparent;

          color: #0f172a;

          font-size: 15px;
          font-weight: 600;
        }

        .admin-input-wrapper input::placeholder {
          color: #94a3b8;
        }


        /* =====================================================
           PASSWORD
        ===================================================== */

        .admin-password-field {
          margin-top: 23px;
        }


        /* =====================================================
           ERROR
        ===================================================== */

        .admin-error {
          display: flex;

          align-items: center;

          gap: 9px;

          margin-top: 13px;

          padding: 11px 13px;

          border-radius: 11px;

          color: #dc2626;

          background: #fef2f2;

          border:
            1px solid #fecaca;

          font-size: 11px;
          font-weight: 700;
        }

        .admin-error-icon {
          width: 19px;
          height: 19px;

          flex-shrink: 0;

          display: grid;
          place-items: center;

          border-radius: 50%;

          background: #ef4444;

          color: white;

          font-size: 11px;
          font-weight: 900;
        }


        /* =====================================================
           LOGIN BUTTON
        ===================================================== */

        .admin-submit {
          width: 100%;

          height: 62px;

          display: flex;

          align-items: center;
          justify-content: space-between;

          margin-top: 22px;

          padding: 0 21px;

          border: none;

          border-radius: 16px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #1d4ed8
            );

          box-shadow:
            0 15px 32px
            rgba(37, 99, 235, 0.22);

          cursor: pointer;

          font-size: 14px;
          font-weight: 850;

          transition:
            transform 0.2s,
            box-shadow 0.2s;
        }

        .admin-submit:hover:not(:disabled) {
          transform: translateY(-3px);

          box-shadow:
            0 20px 38px
            rgba(37, 99, 235, 0.29);
        }

        .admin-submit:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .admin-submit:disabled {
          opacity: 0.65;

          cursor: not-allowed;
        }

        .admin-submit-arrow {
          width: 35px;
          height: 35px;

          display: grid;
          place-items: center;

          border-radius: 10px;

          background:
            rgba(255,255,255,0.13);
        }


        /* =====================================================
           SECURITY FOOTER
        ===================================================== */

        .admin-card-footer {
          display: flex;

          align-items: center;
          justify-content: center;

          gap: 7px;

          margin-top: 29px;

          color: #94a3b8;

          font-size: 10px;

          text-align: center;
        }

        .admin-card-footer svg {
          color: #16a34a;
        }


        /* =====================================================
           SPINNER
        ===================================================== */

        .admin-spinner {
          width: 18px;
          height: 18px;

          border:
            2px solid
            rgba(255,255,255,0.35);

          border-top-color: white;

          border-radius: 50%;

          animation:
            adminSpin 0.7s linear infinite;
        }

        @keyframes adminSpin {
          to {
            transform: rotate(360deg);
          }
        }


        /* =====================================================
           PAGE FOOTER
        ===================================================== */

        .admin-page-footer {
          position: relative;
          z-index: 3;

          width:
            min(1180px, calc(100% - 48px));

          margin: auto;

          padding:
            17px 0 22px;

          display: flex;

          align-items: center;
          justify-content: space-between;

          border-top:
            1px solid #e2e8f0;

          color: #94a3b8;

          font-size: 10px;
        }

        .admin-footer-secure {
          display: flex;

          align-items: center;

          gap: 6px;
        }

        .admin-footer-secure svg {
          color: #16a34a;
        }


        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1000px) {

          .admin-login-content {
            grid-template-columns: 1fr;

            gap: 45px;

            padding: 55px 0;
          }

          .admin-information {
            max-width: 700px;

            text-align: center;

            margin: auto;
          }

          .admin-kicker {
            margin: auto;
          }

          .admin-description {
            margin: auto;
          }

          .admin-feature-row {
            justify-content: center;
          }

          .admin-login-panel {
            max-width: 650px;

            margin: auto;
          }

        }


        @media (max-width: 600px) {

          .admin-login-nav {
            height: 68px;

            padding: 0 18px;
          }

          .admin-status {
            display: none;
          }

          .admin-login-content {
            width:
              calc(100% - 28px);

            padding: 35px 0;
          }

          .admin-information h1 {
            font-size: 3.1rem;
          }

          .admin-description {
            font-size: 14px;
          }

          .admin-feature-row {
            flex-direction: column;

            gap: 11px;
          }

          .admin-login-card {
            min-height: auto;

            padding:
              42px 24px;

            border-radius: 24px;
          }

          .admin-login-card::before {
            left: 30px;
            right: 30px;
          }

          .admin-login-card h2 {
            font-size: 2.3rem;
          }

          .admin-page-footer {
            width:
              calc(100% - 28px);

            flex-direction: column;

            gap: 8px;

            text-align: center;
          }

        }

      `}</style>


      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="admin-grid"></div>

      <div className="admin-orb admin-orb-blue"></div>

      <div className="admin-orb admin-orb-red"></div>


      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="admin-login-nav">

        <div className="admin-brand">

          <div className="admin-brand-icon">
            <HeartPulse
              size={22}
              strokeWidth={2.5}
            />
          </div>

          <div>

            <div className="admin-brand-name">
              RAKSHAK <span>AI</span>
            </div>

            <div className="admin-brand-subtitle">
              EMERGENCY RESPONSE SYSTEM
            </div>

          </div>

        </div>


        <div className="admin-status">

          <span className="admin-status-dot"></span>

          CONTROL NETWORK ONLINE

        </div>

      </nav>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="admin-login-content">


        {/* ===================================================
            LEFT
        =================================================== */}

        <section className="admin-information">

          <div className="admin-kicker">

            <span className="admin-kicker-dot"></span>

            AUTHORIZED ADMIN ACCESS

          </div>


          <h1>

            Command the
            <br />

            <span>response network.</span>

          </h1>


          <p className="admin-description">

            Access the Rakshak AI control center to
            monitor emergency requests, responders,
            system activity and live operations.

          </p>


          <div className="admin-feature-row">

            <div className="admin-feature">

              <ShieldCheck size={17} />

              Secure access

            </div>


            <div className="admin-feature red">

              <Radio size={17} />

              Live operations

            </div>


            <div className="admin-feature">

              <CheckCircle2 size={17} />

              Protected control

            </div>

          </div>

        </section>


        {/* ===================================================
            LOGIN CARD
        =================================================== */}

        <section className="admin-login-panel">

          <div className="admin-login-card">


            {/* CARD HEADER */}

            <div className="admin-card-top">

              <div className="admin-card-icon">

                <ShieldCheck
                  size={27}
                />

              </div>


              <div className="admin-secure-badge">

                <span></span>

                SECURE

              </div>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <form
              className="admin-login-form"
              onSubmit={handleSubmit}
            >

              <div className="admin-eyebrow">
                ADMINISTRATOR PORTAL
              </div>


              <h2>
                Welcome back.
              </h2>


              <p className="admin-card-description">

                Sign in to securely access the
                emergency response command center.

              </p>


              {/* USERNAME */}

              <div style={{ marginTop: '34px' }}>

                <label className="admin-label">
                  Username
                </label>


                <div className="admin-input-wrapper">

                  <UserRound
                    className="admin-input-icon"
                    size={19}
                  />

                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value)
                    }
                    placeholder="Enter administrator username"
                    required
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div className="admin-password-field">

                <label className="admin-label">
                  Password
                </label>


                <div className="admin-input-wrapper">

                  <LockKeyhole
                    className="admin-input-icon"
                    size={19}
                  />

                  <input
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    required
                  />

                </div>

              </div>


              {/* ERROR */}

              {error && (

                <div className="admin-error">

                  <span className="admin-error-icon">
                    !
                  </span>

                  {error}

                </div>

              )}


              {/* LOGIN */}

              <button
                type="submit"
                className="admin-submit"
                disabled={loading}
              >

                {loading ? (

                  <>
                    <span className="admin-spinner"></span>

                    Authenticating...

                    <span></span>
                  </>

                ) : (

                  <>
                    <span>
                      Enter control center
                    </span>

                    <span className="admin-submit-arrow">
                      <ArrowRight size={17} />
                    </span>
                  </>

                )}

              </button>


              {/* SECURITY */}

              <div className="admin-card-footer">

                <LockKeyhole size={13} />

                Restricted access for authorized
                system administrators.

              </div>

            </form>

          </div>

        </section>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="admin-page-footer">

        <div className="admin-footer-secure">

          <CheckCircle2 size={14} />

          Rakshak AI Emergency Control Network

        </div>

        <span>
          Secure • Monitored • Available 24/7
        </span>

      </footer>

    </div>
  );
}