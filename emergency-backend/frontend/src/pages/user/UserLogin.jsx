import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as userApi from '../../api/userApi';
import {
  HeartPulse,
  ShieldCheck,
  LockKeyhole,
  Phone,
  ArrowRight,
  ArrowLeft,
  Radio,
  CheckCircle2,
} from 'lucide-react';

export default function UserLogin() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // =====================================================
  // EXISTING BACKEND LOGIC — DO NOT CHANGE
  // =====================================================

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const normalized = phone.replace(/\D/g, '').slice(-10);
      const payload =
        normalized.length === 10 ? `+91${normalized}` : phone;

      await userApi.sendOtp(payload);
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

    try {
      const normalized = phone.replace(/\D/g, '').slice(-10);
      const payload =
        normalized.length === 10 ? `+91${normalized}` : phone;

      const { data } = await userApi.verifyOtp(payload, otp);

      loginUser({
        token: data.token,
        user_id: data.user_id,
        profile_completed: data.profile_completed,
      });

      if (!data.profile_completed) {
        navigate('/user/profile');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rakshak-login-page">

      <style>{`

        /* =====================================================
           PAGE
        ===================================================== */

        .rakshak-login-page {
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
              transparent 28%
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
           DECORATIVE BACKGROUND
        ===================================================== */

        .login-background-grid {
          position: absolute;
          inset: 0;

          opacity: 0.35;

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
              transparent 85%
            );

          pointer-events: none;
        }

        .login-orb {
          position: absolute;

          border-radius: 50%;

          filter: blur(70px);

          pointer-events: none;
        }

        .login-orb-blue {
          width: 350px;
          height: 350px;

          top: 10%;
          left: -180px;

          background: rgba(37, 99, 235, 0.09);
        }

        .login-orb-red {
          width: 330px;
          height: 330px;

          right: -170px;
          bottom: 8%;

          background: rgba(239, 68, 68, 0.07);
        }


        /* =====================================================
           NAVBAR
        ===================================================== */

        .login-nav {
          position: relative;
          z-index: 5;

          height: 76px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 5%;

          background:
            rgba(255, 255, 255, 0.82);

          border-bottom:
            1px solid #e2e8f0;

          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .login-logo {
          display: flex;
          align-items: center;

          gap: 11px;
        }

        .login-logo-icon {
          width: 42px;
          height: 42px;

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
            0 9px 22px
            rgba(37, 99, 235, 0.22);
        }

        .login-logo-title {
          color: #0f172a;

          font-size: 18px;
          font-weight: 900;

          letter-spacing: -0.02em;
        }

        .login-logo-title span {
          color: #ef4444;
        }

        .login-logo-subtitle {
          margin-top: 2px;

          color: #64748b;

          font-size: 8px;
          font-weight: 800;

          letter-spacing: 0.12em;
        }

        .login-system-status {
          display: flex;
          align-items: center;

          gap: 8px;

          color: #16a34a;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 0.08em;
        }

        .system-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #22c55e;

          box-shadow:
            0 0 0 5px
            rgba(34, 197, 94, 0.10);

          animation: systemPulse 2s infinite;
        }

        @keyframes systemPulse {
          50% {
            box-shadow:
              0 0 0 9px
              rgba(34, 197, 94, 0);
          }
        }


        /* =====================================================
           MAIN CONTENT
        ===================================================== */

        .login-content {
          position: relative;
          z-index: 2;

          width: min(1180px, calc(100% - 48px));

          flex: 1;

          margin: 0 auto;

          display: grid;

          grid-template-columns: 0.85fr 1.15fr;

          align-items: center;

          gap: 90px;

          padding: 70px 0;
        }


        /* =====================================================
           LEFT INFORMATION
        ===================================================== */

        .login-information {
          max-width: 480px;
        }

        .login-kicker {
          display: inline-flex;

          align-items: center;

          gap: 8px;

          padding: 9px 13px;

          border-radius: 999px;

          color: #2563eb;

          background: #eff6ff;

          border:
            1px solid #dbeafe;

          font-size: 10px;
          font-weight: 900;

          letter-spacing: 0.10em;
        }

        .login-kicker-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #2563eb;

          box-shadow:
            0 0 0 4px
            rgba(37, 99, 235, 0.10);
        }

        .login-information h1 {
          margin: 24px 0 20px;

          color: #0f1f3d;

          font-size:
            clamp(3.4rem, 5vw, 5.5rem);

          line-height: 0.96;

          letter-spacing: -0.065em;

          font-weight: 800;
        }

        .login-information h1 span {
          color: #ef4444;
        }

        .login-information-description {
          max-width: 460px;

          color: #64748b;

          font-size: 16px;

          line-height: 1.75;
        }


        /* =====================================================
           INFORMATION STATS
        ===================================================== */

        .login-info-row {
          display: flex;

          align-items: center;

          gap: 28px;

          margin-top: 35px;
        }

        .login-info-item {
          display: flex;
          align-items: center;

          gap: 9px;

          color: #475569;

          font-size: 11px;
          font-weight: 750;
        }

        .login-info-item svg {
          color: #2563eb;
        }

        .login-info-item.emergency svg {
          color: #ef4444;
        }


        /* =====================================================
           LARGE LOGIN PANEL
        ===================================================== */

        .login-panel {
          width: 100%;

          position: relative;

          padding: 14px;
        }

        .login-panel::before {
          content: "";

          position: absolute;

          width: 260px;
          height: 260px;

          right: -50px;
          top: -80px;

          border-radius: 50%;

          background:
            rgba(37, 99, 235, 0.06);

          filter: blur(40px);

          pointer-events: none;
        }


        /* =====================================================
           MAIN CARD
        ===================================================== */

        .login-card-large {
          position: relative;

          width: 100%;

          min-height: 560px;

          display: flex;
          flex-direction: column;
          justify-content: center;

          padding: 62px 70px;

          background:
            rgba(255, 255, 255, 0.90);

          border:
            1px solid
            rgba(226, 232, 240, 0.95);

          border-radius: 30px;

          box-shadow:
            0 35px 90px
            rgba(15, 23, 42, 0.10),

            0 4px 12px
            rgba(15, 23, 42, 0.035);

          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);

          overflow: hidden;

          animation: loginCardIn 0.65s ease;
        }

        @keyframes loginCardIn {
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

        .login-card-large::before {
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
              #2563eb 55%,
              #ef4444 100%
            );

          border-radius:
            0 0 10px 10px;
        }


        /* =====================================================
           CARD HEADER
        ===================================================== */

        .card-top {
          display: flex;

          align-items: center;
          justify-content: space-between;

          margin-bottom: 40px;
        }

        .card-icon-large {
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

        .card-security {
          display: flex;

          align-items: center;

          gap: 6px;

          padding: 8px 11px;

          border-radius: 999px;

          background: #f0fdf4;

          border:
            1px solid #dcfce7;

          color: #16a34a;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 0.08em;
        }

        .card-security span {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #22c55e;
        }


        /* =====================================================
           CARD TEXT
        ===================================================== */

        .card-eyebrow {
          margin-bottom: 9px;

          color: #2563eb;

          font-size: 10px;
          font-weight: 900;

          letter-spacing: 0.14em;
        }

        .login-card-large h2 {
          margin: 0 0 13px;

          color: #0f172a;

          font-size:
            clamp(2.2rem, 4vw, 3.2rem);

          line-height: 1;

          letter-spacing: -0.055em;

          font-weight: 800;
        }

        .card-description {
          max-width: 510px;

          margin: 0;

          color: #64748b;

          font-size: 14px;

          line-height: 1.7;
        }


        /* =====================================================
           FORM
        ===================================================== */

        .login-form {
          margin-top: 38px;

          max-width: 560px;
        }

        .login-label {
          display: block;

          margin-bottom: 9px;

          color: #334155;

          font-size: 12px;
          font-weight: 800;
        }


        /* =====================================================
           PHONE INPUT
        ===================================================== */

        .phone-field {
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

        .phone-field:focus-within {
          background: #ffffff;

          border-color: #60a5fa;

          box-shadow:
            0 0 0 5px
            rgba(37, 99, 235, 0.08);
        }

        .phone-country {
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

        .phone-field input {
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

        .phone-field input::placeholder {
          color: #94a3b8;
        }


        /* =====================================================
           OTP
        ===================================================== */

        .otp-phone {
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

        .otp-input-large {
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

        .otp-input-large:focus {
          background: white;

          border-color: #60a5fa;

          box-shadow:
            0 0 0 5px
            rgba(37, 99, 235, 0.08);
        }


        /* =====================================================
           ERROR
        ===================================================== */

        .login-error {
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

        .login-error-icon {
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
           PRIMARY BUTTON
        ===================================================== */

        .login-submit {
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

        .login-submit:hover:not(:disabled) {
          transform: translateY(-3px);

          box-shadow:
            0 20px 38px
            rgba(37, 99, 235, 0.29);
        }

        .login-submit:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .login-submit:disabled {
          opacity: 0.65;

          cursor: not-allowed;
        }

        .submit-arrow {
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

        .change-number {
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

        .change-number:hover {
          color: #2563eb;
        }


        /* =====================================================
           CARD FOOTER
        ===================================================== */

        .card-footer {
          display: flex;

          align-items: center;
          justify-content: center;

          gap: 7px;

          margin-top: 29px;

          color: #94a3b8;

          font-size: 10px;

          text-align: center;
        }

        .card-footer svg {
          color: #16a34a;
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .login-page-footer {
          position: relative;
          z-index: 3;

          width: min(1180px, calc(100% - 48px));

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

        .footer-secure {
          display: flex;

          align-items: center;

          gap: 6px;
        }

        .footer-secure svg {
          color: #16a34a;
        }


        /* =====================================================
           SPINNER
        ===================================================== */

        .login-spinner {
          width: 18px;
          height: 18px;

          border:
            2px solid
            rgba(255,255,255,0.35);

          border-top-color: white;

          border-radius: 50%;

          animation:
            loginSpin 0.7s linear infinite;
        }

        @keyframes loginSpin {
          to {
            transform: rotate(360deg);
          }
        }


        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1000px) {

          .login-content {
            grid-template-columns: 1fr;

            gap: 45px;

            padding: 55px 0;
          }

          .login-information {
            max-width: 700px;

            text-align: center;

            margin: auto;
          }

          .login-kicker {
            margin: auto;
          }

          .login-information-description {
            margin: auto;
          }

          .login-info-row {
            justify-content: center;
          }

          .login-panel {
            max-width: 650px;

            margin: auto;
          }

        }


        @media (max-width: 600px) {

          .login-nav {
            height: 68px;

            padding: 0 18px;
          }

          .login-system-status {
            display: none;
          }

          .login-content {
            width: calc(100% - 28px);

            padding: 35px 0;
          }

          .login-information h1 {
            font-size: 3.1rem;
          }

          .login-information-description {
            font-size: 14px;
          }

          .login-info-row {
            flex-direction: column;

            gap: 11px;
          }

          .login-card-large {
            min-height: auto;

            padding:
              42px 24px;

            border-radius: 24px;
          }

          .login-card-large::before {
            left: 30px;
            right: 30px;
          }

          .card-top {
            margin-bottom: 30px;
          }

          .login-card-large h2 {
            font-size: 2.3rem;
          }

          .login-page-footer {
            width: calc(100% - 28px);

            flex-direction: column;

            gap: 8px;

            text-align: center;
          }

        }

      `}</style>


      {/* Background */}
      <div className="login-background-grid"></div>
      <div className="login-orb login-orb-blue"></div>
      <div className="login-orb login-orb-red"></div>


      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="login-nav">

        <div className="login-logo">

          <div className="login-logo-icon">
            <HeartPulse
              size={22}
              strokeWidth={2.5}
            />
          </div>

          <div>

            <div className="login-logo-title">
              RAKSHAK <span>AI</span>
            </div>

            <div className="login-logo-subtitle">
              EMERGENCY RESPONSE SYSTEM
            </div>

          </div>

        </div>


        <div className="login-system-status">

          <span className="system-dot"></span>

          SYSTEM ONLINE

        </div>

      </nav>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="login-content">


        {/* ===================================================
            LEFT
        =================================================== */}

        <section className="login-information">

          <div className="login-kicker">

            <span className="login-kicker-dot"></span>

            SECURE CITIZEN ACCESS

          </div>


          <h1>
            Help is
            <br />
            <span>always closer.</span>
          </h1>


          <p className="login-information-description">
            Access Rakshak AI to request emergency
            assistance, share your live location and
            stay connected with responders in real time.
          </p>


          <div className="login-info-row">

            <div className="login-info-item">

              <ShieldCheck size={17} />

              Secure authentication

            </div>


            <div className="login-info-item emergency">

              <HeartPulse size={17} />

              Emergency ready

            </div>

          </div>

        </section>


        {/* ===================================================
            LOGIN
        =================================================== */}

        <section className="login-panel">

          <div className="login-card-large">


            {/* CARD HEADER */}

            <div className="card-top">

              <div className="card-icon-large">

                {step === 'phone' ? (
                  <Phone size={25} />
                ) : (
                  <LockKeyhole size={25} />
                )}

              </div>


              <div className="card-security">

                <span></span>

                SECURE

              </div>

            </div>


            {/* =================================================
                PHONE
            ================================================= */}

            {step === 'phone' ? (

              <form
                className="login-form"
                onSubmit={handleSendOtp}
              >

                <div className="card-eyebrow">
                  CITIZEN PORTAL
                </div>


                <h2>
                  Welcome back.
                </h2>


                <p className="card-description">
                  Enter your mobile number and we'll
                  send you a secure one-time password.
                </p>


                <div style={{ marginTop: '34px' }}>

                  <label className="login-label">
                    Mobile number
                  </label>


                  <div className="phone-field">

                    <span className="phone-country">
                      +91
                    </span>

                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value)
                      }
                      placeholder="98765 43210"
                      required
                    />

                  </div>

                </div>


                {error && (

                  <div className="login-error">

                    <span className="login-error-icon">
                      !
                    </span>

                    {error}

                  </div>

                )}


                <button
                  type="submit"
                  className="login-submit"
                  disabled={loading}
                >

                  {loading ? (

                    <>
                      <span className="login-spinner"></span>

                      Sending OTP...

                      <span></span>
                    </>

                  ) : (

                    <>
                      <span>
                        Continue securely
                      </span>

                      <span className="submit-arrow">
                        <ArrowRight size={17} />
                      </span>
                    </>

                  )}

                </button>


                <div className="card-footer">

                  <LockKeyhole size={13} />

                  Your number is protected with
                  secure OTP authentication.

                </div>

              </form>

            ) : (

              /* =================================================
                 OTP
              ================================================= */

              <form
                className="login-form"
                onSubmit={handleVerifyOtp}
              >

                <button
                  type="button"
                  className="change-number"
                  onClick={() => setStep('phone')}
                  style={{
                    justifyContent: 'flex-start',
                    padding: 0,
                    marginBottom: '25px',
                  }}
                >

                  <ArrowLeft size={14} />

                  Change number

                </button>


                <div className="card-eyebrow">
                  VERIFICATION
                </div>


                <h2>
                  Verify your number.
                </h2>


                <p className="card-description">
                  Enter the six-digit code sent to
                  your mobile number.
                </p>


                <div className="otp-phone">

                  <Phone size={13} />

                  +91 {phone.replace(/\D/g, '').slice(-10)}

                </div>


                <div style={{ marginTop: '25px' }}>

                  <label className="login-label">
                    Verification code
                  </label>


                  <input
                    className="otp-input-large"
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value)
                    }
                    placeholder="000000"
                    maxLength={6}
                    required
                  />

                </div>


                {error && (

                  <div className="login-error">

                    <span className="login-error-icon">
                      !
                    </span>

                    {error}

                  </div>

                )}


                <button
                  type="submit"
                  className="login-submit"
                  disabled={loading}
                >

                  {loading ? (

                    <>
                      <span className="login-spinner"></span>

                      Verifying...

                      <span></span>
                    </>

                  ) : (

                    <>
                      <span>
                        Verify & continue
                      </span>

                      <span className="submit-arrow">
                        <ArrowRight size={17} />
                      </span>
                    </>

                  )}

                </button>


                <div className="card-footer">

                  <ShieldCheck size={13} />

                  Never share your OTP with anyone.

                </div>

              </form>

            )}

          </div>

        </section>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="login-page-footer">

        <div className="footer-secure">

          <CheckCircle2 size={14} />

          Rakshak AI Emergency Network

        </div>

        <span>
          Secure • Reliable • Available 24/7
        </span>

      </footer>

    </div>
  );
}