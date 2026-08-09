import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as ambulanceApi from '../../api/ambulanceApi';

import {
  HeartPulse,
  ShieldCheck,
  LockKeyhole,
  Phone,
  ArrowRight,
  ArrowLeft,
  Ambulance,
  CheckCircle2,
  Radio,
} from 'lucide-react';

export default function AmbulanceLogin() {
  const navigate = useNavigate();
  const { loginAmbulance } = useAuth();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // =====================================================
  // EXISTING BACKEND LOGIC — UNCHANGED
  // =====================================================

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    try {
      const normalized = phone.replace(/\D/g, '').slice(-10);
      const payload =
        normalized.length === 10 ? `+91${normalized}` : phone;

      const res = await ambulanceApi.sendOtp(payload);
      if (res.data?.otp) {
        setGeneratedOtp(res.data.otp);
      }
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const normalized = phone.replace(/\D/g, '').slice(-10);
      const payload =
        normalized.length === 10 ? `+91${normalized}` : phone;

      const { data } = await ambulanceApi.verifyOtp(payload, otp);

      loginAmbulance({
        token: data.token,
        ambulance_id: data.ambulance_id,
        profile_completed: data.profile_completed,
      });

      // Existing redirect logic — unchanged
      if (!data.profile_completed) {
        navigate('/ambulance/profile');
      } else {
        navigate('/ambulance/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Invalid or expired OTP'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ambulance-login-page">

      <style>{`

        /* =====================================================
           PAGE
        ===================================================== */

        .ambulance-login-page {
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
              rgba(239, 68, 68, 0.08),
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

        .ambulance-grid {
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

        .ambulance-orb {
          position: absolute;

          border-radius: 50%;

          filter: blur(75px);

          pointer-events: none;
        }

        .ambulance-orb-blue {
          width: 380px;
          height: 380px;

          left: -190px;
          top: 12%;

          background:
            rgba(37, 99, 235, 0.09);
        }

        .ambulance-orb-red {
          width: 350px;
          height: 350px;

          right: -180px;
          bottom: 10%;

          background:
            rgba(239, 68, 68, 0.08);
        }


        /* =====================================================
           NAVBAR
        ===================================================== */

        .ambulance-login-nav {
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

        .ambulance-brand {
          display: flex;
          align-items: center;

          gap: 11px;
        }

        .ambulance-brand-icon {
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

        .ambulance-brand-name {
          color: #0f172a;

          font-size: 18px;
          font-weight: 900;

          letter-spacing: -0.02em;
        }

        .ambulance-brand-name span {
          color: #ef4444;
        }

        .ambulance-brand-subtitle {
          margin-top: 2px;

          color: #64748b;

          font-size: 8px;
          font-weight: 800;

          letter-spacing: 0.12em;
        }

        .ambulance-status {
          display: flex;
          align-items: center;

          gap: 9px;

          color: #16a34a;

          font-size: 10px;
          font-weight: 900;

          letter-spacing: 0.08em;
        }

        .ambulance-status-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #22c55e;

          box-shadow:
            0 0 0 5px
            rgba(34, 197, 94, 0.10);

          animation: ambulancePulse 2s infinite;
        }

        @keyframes ambulancePulse {
          50% {
            box-shadow:
              0 0 0 9px
              rgba(34, 197, 94, 0);
          }
        }


        /* =====================================================
           MAIN
        ===================================================== */

        .ambulance-login-content {
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
           LEFT SIDE
        ===================================================== */

        .ambulance-information {
          max-width: 490px;
        }

        .ambulance-kicker {
          display: inline-flex;
          align-items: center;

          gap: 8px;

          padding: 9px 14px;

          border-radius: 999px;

          color: #ef4444;

          background: #fef2f2;

          border:
            1px solid #fecaca;

          font-size: 10px;
          font-weight: 900;

          letter-spacing: 0.1em;
        }

        .ambulance-kicker-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #ef4444;

          box-shadow:
            0 0 0 4px
            rgba(239, 68, 68, 0.10);
        }

        .ambulance-information h1 {
          margin: 24px 0 20px;

          color: #0f1f3d;

          font-size:
            clamp(3.4rem, 5vw, 5.5rem);

          line-height: 0.96;

          letter-spacing: -0.065em;

          font-weight: 800;
        }

        .ambulance-information h1 span {
          color: #2563eb;
        }

        .ambulance-description {
          max-width: 460px;

          color: #64748b;

          font-size: 16px;

          line-height: 1.75;
        }


        /* =====================================================
           FEATURES
        ===================================================== */

        .ambulance-feature-row {
          display: flex;

          align-items: center;

          gap: 25px;

          margin-top: 35px;
        }

        .ambulance-feature {
          display: flex;

          align-items: center;

          gap: 9px;

          color: #475569;

          font-size: 11px;
          font-weight: 800;
        }

        .ambulance-feature svg {
          color: #2563eb;
        }

        .ambulance-feature.red svg {
          color: #ef4444;
        }


        /* =====================================================
           LOGIN PANEL
        ===================================================== */

        .ambulance-login-panel {
          position: relative;

          width: 100%;

          padding: 14px;
        }

        .ambulance-login-card {
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
            ambulanceCardIn 0.65s ease;
        }

        @keyframes ambulanceCardIn {
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

        .ambulance-login-card::before {
          content: "";

          position: absolute;

          top: 0;
          left: 70px;
          right: 70px;

          height: 3px;

          background:
            linear-gradient(
              90deg,
              #ef4444 0%,
              #ef4444 35%,
              #2563eb 100%
            );

          border-radius:
            0 0 10px 10px;
        }
        .ambulance-card-top {
          display: flex;

          align-items: center;
          justify-content: space-between;

          margin-bottom: 40px;
        }

        .ambulance-card-icon {
          width: 60px;
          height: 60px;

          display: grid;
          place-items: center;

          border-radius: 17px;

          color: #ef4444;

          background:
            linear-gradient(
              145deg,
              #fef2f2,
              #fee2e2
            );

          border:
            1px solid #fecaca;

          box-shadow:
            0 12px 28px
            rgba(239, 68, 68, 0.12);
        }

        .ambulance-secure-badge {
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

        .ambulance-secure-badge span {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #22c55e;
        }


        /* =====================================================
           CARD CONTENT
        ===================================================== */

        .ambulance-eyebrow {
          margin-bottom: 9px;

          color: #ef4444;

          font-size: 10px;
          font-weight: 900;

          letter-spacing: 0.14em;
        }

        .ambulance-login-card h2 {
          margin: 0 0 13px;

          color: #0f172a;

          font-size:
            clamp(2.2rem, 4vw, 3.2rem);

          line-height: 1;

          letter-spacing: -0.055em;

          font-weight: 800;
        }

        .ambulance-card-description {
          max-width: 510px;

          margin: 0;

          color: #64748b;

          font-size: 14px;

          line-height: 1.7;
        }


        /* =====================================================
           FORM
        ===================================================== */

        .ambulance-login-form {
          margin-top: 38px;

          max-width: 560px;
        }

        .ambulance-label {
          display: block;

          margin-bottom: 9px;

          color: #334155;

          font-size: 12px;
          font-weight: 800;
        }


        /* =====================================================
           PHONE
        ===================================================== */

        .ambulance-phone-field {
          height: 64px;

          display: flex;
          align-items: center;

          border:
            1px solid #dbe3ef;

          border-radius: 16px;

          background: #f8fafc;

          overflow: hidden;

          transition:
            border-color 0.2s,
            box-shadow 0.2s,
            background 0.2s;
        }

        .ambulance-phone-field:focus-within {
          background: white;

          border-color: #60a5fa;

          box-shadow:
            0 0 0 5px
            rgba(37, 99, 235, 0.08);
        }

        .ambulance-country {
          height: 100%;

          display: flex;
          align-items: center;

          padding: 0 18px;

          border-right:
            1px solid #e2e8f0;

          color: #475569;

          font-size: 14px;
          font-weight: 800;
        }

        .ambulance-phone-field input {
          flex: 1;

          width: 100%;
          height: 100%;

          padding: 0 19px;

          border: none;
          outline: none;

          background: transparent;

          color: #0f172a;

          font-size: 17px;
          font-weight: 600;
        }

        .ambulance-phone-field input::placeholder {
          color: #94a3b8;
        }


        /* =====================================================
           OTP
        ===================================================== */

        .ambulance-otp-phone {
          display: inline-flex;

          align-items: center;

          gap: 7px;

          margin-top: 20px;

          padding: 9px 12px;

          border-radius: 10px;

          color: #475569;

          background: #f1f5f9;

          font-size: 11px;
          font-weight: 800;
        }

        .ambulance-otp-input {
          width: 100%;

          height: 74px;

          margin-top: 3px;

          border:
            1px solid #dbe3ef;

          border-radius: 16px;

          outline: none;

          background: #f8fafc;

          color: #0f172a;

          text-align: center;

          font-size: 30px;

          font-weight: 800;

          letter-spacing: 0.45em;

          padding-left: 0.45em;

          transition: 0.2s;
        }

        .ambulance-otp-input:focus {
          background: white;

          border-color: #60a5fa;

          box-shadow:
            0 0 0 5px
            rgba(37, 99, 235, 0.08);
        }


        /* =====================================================
           ERROR
        ===================================================== */

        .ambulance-error {
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

        .ambulance-error-icon {
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
           BUTTON
        ===================================================== */

        .ambulance-submit {
          width: 100%;

          height: 62px;

          display: flex;

          align-items: center;
          justify-content: space-between;

          margin-top: 17px;

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

        .ambulance-submit:hover:not(:disabled) {
          transform: translateY(-3px);

          box-shadow:
            0 20px 38px
            rgba(37, 99, 235, 0.29);
        }

        .ambulance-submit:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .ambulance-submit:disabled {
          opacity: 0.65;

          cursor: not-allowed;
        }

        .ambulance-submit-arrow {
          width: 35px;
          height: 35px;

          display: grid;
          place-items: center;

          border-radius: 10px;

          background:
            rgba(255,255,255,0.13);
        }


        /* =====================================================
           CHANGE NUMBER
        ===================================================== */

        .ambulance-change-number {
          width: 100%;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 6px;

          margin-top: 16px;

          padding: 10px;

          border: none;

          background: transparent;

          color: #64748b;

          cursor: pointer;

          font-size: 12px;
          font-weight: 750;

          transition: color 0.2s;
        }

        .ambulance-change-number:hover {
          color: #2563eb;
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .ambulance-card-footer {
          display: flex;

          align-items: center;
          justify-content: center;

          gap: 7px;

          margin-top: 29px;

          color: #94a3b8;

          font-size: 10px;

          text-align: center;
        }

        .ambulance-card-footer svg {
          color: #16a34a;
        }


        /* =====================================================
           SPINNER
        ===================================================== */

        .ambulance-spinner {
          width: 18px;
          height: 18px;

          border:
            2px solid
            rgba(255,255,255,0.35);

          border-top-color: white;

          border-radius: 50%;

          animation:
            ambulanceSpin 0.7s linear infinite;
        }

        @keyframes ambulanceSpin {
          to {
            transform: rotate(360deg);
          }
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .ambulance-page-footer {
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

        .ambulance-footer-secure {
          display: flex;

          align-items: center;

          gap: 6px;
        }

        .ambulance-footer-secure svg {
          color: #16a34a;
        }


        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1000px) {

          .ambulance-login-content {
            grid-template-columns: 1fr;

            gap: 45px;

            padding: 55px 0;
          }

          .ambulance-information {
            max-width: 700px;

            text-align: center;

            margin: auto;
          }

          .ambulance-kicker {
            margin: auto;
          }

          .ambulance-description {
            margin: auto;
          }

          .ambulance-feature-row {
            justify-content: center;
          }

          .ambulance-login-panel {
            max-width: 650px;

            margin: auto;
          }

        }


        @media (max-width: 600px) {

          .ambulance-login-nav {
            height: 68px;

            padding: 0 18px;
          }

          .ambulance-status {
            display: none;
          }

          .ambulance-login-content {
            width:
              calc(100% - 28px);

            padding: 35px 0;
          }

          .ambulance-information h1 {
            font-size: 3.1rem;
          }

          .ambulance-description {
            font-size: 14px;
          }

          .ambulance-feature-row {
            flex-direction: column;

            gap: 11px;
          }

          .ambulance-login-card {
            min-height: auto;

            padding: 42px 24px;

            border-radius: 24px;
          }

          .ambulance-login-card::before {
            left: 30px;
            right: 30px;
          }

          .ambulance-login-card h2 {
            font-size: 2.3rem;
          }

          .ambulance-page-footer {
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

      <div className="ambulance-grid"></div>

      <div className="ambulance-orb ambulance-orb-blue"></div>

      <div className="ambulance-orb ambulance-orb-red"></div>


      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="ambulance-login-nav">

        <div className="ambulance-brand">

          <div className="ambulance-brand-icon">
            <HeartPulse
              size={22}
              strokeWidth={2.5}
            />
          </div>

          <div>

            <div className="ambulance-brand-name">
              RAKSHAK <span>AI</span>
            </div>

            <div className="ambulance-brand-subtitle">
              EMERGENCY RESPONSE SYSTEM
            </div>

          </div>

        </div>


        <div className="ambulance-status">

          <span className="ambulance-status-dot"></span>

          RESPONSE NETWORK ONLINE

        </div>

      </nav>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="ambulance-login-content">


        {/* ===================================================
            LEFT
        =================================================== */}

        <section className="ambulance-information">

          <div className="ambulance-kicker">

            <span className="ambulance-kicker-dot"></span>

            RESPONDER ACCESS

          </div>


          <h1>

            Ready to
            <br />

            <span>respond faster.</span>

          </h1>


          <p className="ambulance-description">

            Access the Rakshak AI responder network,
            receive emergency assignments and stay
            connected with patients in real time.

          </p>


          <div className="ambulance-feature-row">

            <div className="ambulance-feature">

              <Radio size={17} />

              Live dispatch

            </div>


            <div className="ambulance-feature red">

              <Ambulance size={18} />

              Emergency response

            </div>


            <div className="ambulance-feature">

              <ShieldCheck size={17} />

              Secure access

            </div>

          </div>

        </section>


        {/* ===================================================
            LOGIN CARD
        =================================================== */}

        <section className="ambulance-login-panel">

          <div className="ambulance-login-card">


            {/* CARD HEADER */}

            <div className="ambulance-card-top">

              <div className="ambulance-card-icon">

                {step === 'phone' ? (
                  <Ambulance size={27} />
                ) : (
                  <LockKeyhole size={27} />
                )}

              </div>


              <div className="ambulance-secure-badge">

                <span></span>

                SECURE

              </div>

            </div>


            {/* =================================================
                PHONE STEP
            ================================================= */}

            {step === 'phone' ? (

              <form
                className="ambulance-login-form"
                onSubmit={handleSendOtp}
              >

                <div className="ambulance-eyebrow">
                  AMBULANCE PORTAL
                </div>


                <h2>
                  Responder login.
                </h2>


                <p className="ambulance-card-description">
                  Enter your registered mobile number
                  to securely access your ambulance
                  response dashboard.
                </p>


                <div style={{ marginTop: '34px' }}>

                  <label className="ambulance-label">
                    Registered mobile number
                  </label>


                  <div className="ambulance-phone-field">

                    <span className="ambulance-country">
                      +91
                    </span>


                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 10);

                        setPhone(value);
                      }}
                      placeholder="98765 43210"
                      maxLength={10}
                      required
                    />

                  </div>

                </div>


                {error && (

                  <div className="ambulance-error">

                    <span className="ambulance-error-icon">
                      !
                    </span>

                    {error}

                  </div>

                )}


                <button
                  type="submit"
                  className="ambulance-submit"
                  disabled={loading}
                >

                  {loading ? (

                    <>
                      <span className="ambulance-spinner"></span>

                      Sending OTP...

                      <span></span>
                    </>

                  ) : (

                    <>
                      <span>
                        Continue securely
                      </span>

                      <span className="ambulance-submit-arrow">
                        <ArrowRight size={17} />
                      </span>
                    </>

                  )}

                </button>


                <div className="ambulance-card-footer">

                  <LockKeyhole size={13} />

                  Secure OTP authentication for
                  authorized responders.

                </div>

              </form>

            ) : (

              /* =================================================
                 OTP STEP
              ================================================= */

              <form
                className="ambulance-login-form"
                onSubmit={handleVerifyOtp}
              >

                <button
                  type="button"
                  className="ambulance-change-number"
                  onClick={() => {
                    setStep('phone');
                    setError('');
                    setOtp('');
                  }}
                  style={{
                    justifyContent: 'flex-start',
                    padding: 0,
                    marginBottom: '25px',
                  }}
                >

                  <ArrowLeft size={14} />

                  Change number

                </button>


                <div className="ambulance-eyebrow">
                  VERIFICATION
                </div>


                <h2>
                  Verify your number.
                </h2>


                <p className="ambulance-card-description">
                  Enter the six-digit verification
                  code sent to your registered mobile.
                </p>


                <div className="ambulance-otp-phone">

                  <Phone size={13} />

                  +91 {phone.replace(/\D/g, '').slice(-10)}

                </div>

                {generatedOtp && (
                  <div style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    border: '1px solid #bfdbfe',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: '800', letterSpacing: '0.05em' }}>
                        🔑 GENERATED OTP (FROM DATABASE)
                      </div>
                      <div style={{ fontSize: '20px', color: '#1d4ed8', fontWeight: '900', letterSpacing: '3px', marginTop: '2px' }}>
                        {generatedOtp}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtp(generatedOtp)}
                      style={{
                        padding: '8px 14px',
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Auto-fill OTP
                    </button>
                  </div>
                )}


                <div style={{ marginTop: '25px' }}>

                  <label className="ambulance-label">
                    Verification code
                  </label>


                  <input
                    className="ambulance-otp-input"
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 6);

                      setOtp(value);
                    }}
                    placeholder="000000"
                    maxLength={6}
                    required
                  />

                </div>


                {error && (

                  <div className="ambulance-error">

                    <span className="ambulance-error-icon">
                      !
                    </span>

                    {error}

                  </div>

                )}


                <button
                  type="submit"
                  className="ambulance-submit"
                  disabled={loading}
                >

                  {loading ? (

                    <>
                      <span className="ambulance-spinner"></span>

                      Verifying...

                      <span></span>
                    </>

                  ) : (

                    <>
                      <span>
                        Verify & continue
                      </span>

                      <span className="ambulance-submit-arrow">
                        <ArrowRight size={17} />
                      </span>
                    </>

                  )}

                </button>


                <div className="ambulance-card-footer">

                  <ShieldCheck size={13} />

                  Never share your OTP with anyone.

                </div>

              </form>

            )}

          </div>

        </section>

      </main>
      <footer className="ambulance-page-footer">

        <div className="ambulance-footer-secure">

          <CheckCircle2 size={14} />

          Rakshak AI Responder Network

        </div>

        <span>
          Secure • Real-time • 24/7 Response
        </span>

      </footer>

    </div>
  );
}