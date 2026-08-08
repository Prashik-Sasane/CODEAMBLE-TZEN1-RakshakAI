import React from 'react';
import { Link } from 'react-router-dom';

import ambulance from '../assets/Ambulance-Background-PNG-removebg-preview.png';

import {
  HeartPulse,
  ShieldCheck,
  Ambulance as AmbulanceIcon,
  UserRound,
  LayoutDashboard,
  MapPin,
  Clock3,
  ArrowRight,
  Activity,
  PhoneCall,
  LockKeyhole,
  Zap,
  Radio,
  ChevronRight,
  Mail,
  CheckCircle2,
  Bell,
  MessageSquare,
  User,
  Navigation,
  Route,
  Siren,
} from 'lucide-react';


export default function Landing() {
  return (
    <div className="landing-page">

      {/* =====================================================
          TOP CONTACT BAR
      ===================================================== */}

      <header className="top-strip">

        <div className="top-strip-container">

          <div className="contact-info">

            <a
              href="tel:+919876543210"
              className="contact-item"
            >
              <PhoneCall size={13} />
              <span>+91 98765 43210</span>
            </a>

            <span className="dot-divider">•</span>

            <a
              href="mailto:contact@rakshakai.com"
              className="contact-item"
            >
              <Mail size={13} />
              <span>contact@rakshakai.com</span>
            </a>

          </div>


          <div className="top-links">

            <Link
              to="/user"
              className="top-link emergency-link"
            >
              <span className="pulse-ring"></span>
              Emergency Hotline
            </Link>

            <span className="top-divider">|</span>

            <Link
              to="/admin"
              className="top-link"
            >
              Admin Portal
            </Link>

          </div>

        </div>

      </header>



      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="landing-navbar">

        <div className="navbar-container">

          <Link
            to="/"
            className="landing-brand"
          >

            <div className="brand-icon">
              <HeartPulse
                size={25}
                strokeWidth={2.5}
              />
            </div>

            <div className="brand-text">

              <div className="brand-name">
                RAKSHAK <span>AI</span>
              </div>

              <div className="brand-tagline">
                EMERGENCY RESPONSE SYSTEM
              </div>

            </div>

          </Link>



          <div className="nav-menu">

            <a
              href="#hero"
              className="nav-link active"
            >
              Home
            </a>

            <a
              href="#portals"
              className="nav-link"
            >
              Services
            </a>

            <a
              href="#security"
              className="nav-link"
            >
              About Us
            </a>

            <a
              href="#portals"
              className="nav-link"
            >
              Portals
            </a>

          </div>



          <div className="nav-right">

            <button
              type="button"
              className="nav-icon-btn"
              aria-label="Support"
            >
              <MessageSquare size={19} />
            </button>

            <button
              type="button"
              className="nav-icon-btn notification-btn"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span className="notification-dot"></span>
            </button>

            <div className="user-avatar">
              <User size={18} />
            </div>

          </div>

        </div>

      </nav>



      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <main>

        <section
          id="hero"
          className="hero-section"
        >


          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="hero-content">

            <div className="hero-badge">

              <Zap size={14} />

              <span>
                NEXT-GEN EMERGENCY NETWORK
              </span>

            </div>


            <h1>

              Immediate &amp; Efficient

              <br />

              <span className="text-gradient">
                Ambulance Dispatch
              </span>

            </h1>


            <p className="hero-description">

              Rakshak AI connects citizens, emergency
              responders, and administrators in real time
              to provide fast, intelligent and reliable
              emergency assistance.

            </p>


            {/* BUTTONS */}

            <div className="hero-actions">

              <Link
                to="/user"
                className="hero-primary-btn"
              >

                <PhoneCall size={18} />

                <span>
                  Request Help Now
                </span>

                <ArrowRight
                  size={18}
                  className="btn-arrow"
                />

              </Link>


              <a
                href="#portals"
                className="hero-secondary-btn"
              >

                <span>
                  Explore Portals
                </span>

                <ChevronRight size={17} />

              </a>

            </div>



            {/* TRUST INFORMATION */}

            <div className="hero-trust">

              <div className="trust-item">

                <ShieldCheck size={17} />

                <span>
                  Secure &amp; Safe
                </span>

              </div>


              <div className="trust-divider"></div>


              <div className="trust-item">

                <Clock3 size={17} />

                <span>
                  &lt; 8 min Avg. ETA
                </span>

              </div>


              <div className="trust-divider"></div>


              <div className="trust-item">

                <MapPin size={17} />

                <span>
                  Live GPS Tracking
                </span>

              </div>

            </div>

          </div>



          {/* =================================================
              RIGHT SIDE — AMBULANCE
          ================================================= */}

          <div className="hero-visual">

            {/* Background glow */}

            <div className="visual-glow"></div>



            {/* Live badge */}

            <div className="live-badge">

              <Radio
                size={14}
                className="live-icon"
              />

              <span>
                Live Priority Emergency Dispatch
              </span>

            </div>



            {/* Radar */}

            <div className="radar">

              <Navigation
                size={20}
                className="radar-arrow"
              />

              <div className="radar-ring"></div>

            </div>



            {/* =================================================
                AMBULANCE
            ================================================= */}

            <div className="ambulance-stage">

              <img
                src={ambulance}
                alt="Emergency ambulance"
                className="ambulance-image"
              />


              {/* Motion lines */}

              <div className="motion-lines">

                <span></span>
                <span></span>
                <span></span>

              </div>

            </div>



            {/* =================================================
                SYSTEM STATUS
            ================================================= */}

            <div className="status-card">

              <div className="status-icon">

                <Activity size={20} />

              </div>


              <div>

                <div className="status-value">
                  99.9%
                </div>

                <div className="status-label">
                  System Uptime
                </div>

              </div>

            </div>

          </div>

        </section>



        {/* =====================================================
            PORTAL SECTION
        ===================================================== */}

        <section
          id="portals"
          className="portal-section"
        >

          <div className="section-heading">

            <span className="section-label">

              <Radio size={12} />

              DEDICATED PORTALS

            </span>


            <h2>

              One Platform.

              <br />

              <span className="text-gradient">
                Three Connected Portals.
              </span>

            </h2>


            <p>
              Select the portal designed for your role
              and access the emergency response system.
            </p>

          </div>



          <div className="portal-grid">


            {/* =================================================
                USER PORTAL
            ================================================= */}

            <Link
              to="/user"
              className="portal-card user-card"
            >

              <div className="card-top-bar"></div>


              <div className="portal-top">

                <div className="portal-icon">

                  <UserRound size={23} />

                </div>


                <span className="portal-arrow">

                  <ArrowRight size={16} />

                </span>

              </div>


              <div className="portal-role">
                CITIZEN &amp; USER
              </div>


              <h3>
                Request Emergency Assistance
              </h3>


              <p>
                Request an ambulance, share your
                location and track emergency
                assistance in real time.
              </p>


              <div className="portal-features">

                <span>

                  <MapPin size={12} />

                  Live Location

                </span>


                <span>

                  <Activity size={12} />

                  Live Tracking

                </span>

              </div>


              <div className="portal-action">

                <span>
                  User Login
                </span>

                <ArrowRight size={15} />

              </div>

            </Link>



            {/* =================================================
                AMBULANCE PORTAL
            ================================================= */}

            <Link
              to="/ambulance"
              className="portal-card ambulance-card"
            >

              <div className="card-top-bar"></div>


              <div className="portal-top">

                <div className="portal-icon">

                  <AmbulanceIcon size={23} />

                </div>


                <span className="portal-arrow">

                  <ArrowRight size={16} />

                </span>

              </div>


              <div className="portal-role">
                PARAMEDIC &amp; DRIVER
              </div>


              <h3>
                Emergency Dispatch Fleet
              </h3>


              <p>
                Receive emergency requests,
                accept assignments and navigate
                efficiently.
              </p>


              <div className="portal-features">

                <span>

                  <Siren size={12} />

                  Live Requests

                </span>


                <span>

                  <Route size={12} />

                  Smart Route

                </span>

              </div>


              <div className="portal-action">

                <span>
                  Ambulance Login
                </span>

                <ArrowRight size={15} />

              </div>

            </Link>



            {/* =================================================
                ADMIN PORTAL
            ================================================= */}

            <Link
              to="/admin"
              className="portal-card admin-card"
            >

              <div className="card-top-bar"></div>


              <div className="portal-top">

                <div className="portal-icon">

                  <LayoutDashboard size={23} />

                </div>


                <span className="portal-arrow">

                  <ArrowRight size={16} />

                </span>

              </div>


              <div className="portal-role">
                COMMAND CENTER
              </div>


              <h3>
                Network Administration
              </h3>


              <p>
                Monitor emergency requests,
                ambulances, users and overall
                system activity.
              </p>


              <div className="portal-features">

                <span>

                  <LayoutDashboard size={12} />

                  Analytics

                </span>


                <span>

                  <ShieldCheck size={12} />

                  Control Center

                </span>

              </div>


              <div className="portal-action">

                <span>
                  Admin Login
                </span>

                <ArrowRight size={15} />

              </div>

            </Link>

          </div>

        </section>



        {/* =====================================================
            SECURITY SECTION
        ===================================================== */}

        <section
          id="security"
          className="security-section"
        >

          <div className="security-card">


            <div className="security-item">

              <div className="security-icon red">

                <ShieldCheck size={21} />

              </div>


              <div>

                <strong>
                  Secure Architecture
                </strong>

                <span>
                  Protected emergency data
                </span>

              </div>

            </div>


            <div className="security-divider"></div>


            <div className="security-item">

              <div className="security-icon blue">

                <LockKeyhole size={21} />

              </div>


              <div>

                <strong>
                  Verified Authentication
                </strong>

                <span>
                  OTP based secure access
                </span>

              </div>

            </div>


            <div className="security-divider"></div>


            <div className="security-item">

              <div className="security-icon green">

                <CheckCircle2 size={21} />

              </div>


              <div>

                <strong>
                  High Reliability
                </strong>

                <span>
                  Reliable emergency response
                </span>

              </div>

            </div>

          </div>

        </section>

      </main>



      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="landing-footer">

        <div className="footer-container">

          <div className="footer-brand">

            <div className="footer-icon">

              <HeartPulse size={19} />

            </div>


            <strong>
              RAKSHAK AI
            </strong>

          </div>


          <span className="footer-tagline">

            Intelligent • Connected • Secure Emergency Response

          </span>


          <span className="footer-copy">

            © {new Date().getFullYear()}
            {' '}
            Rakshak AI. All rights reserved.

          </span>

        </div>

      </footer>



      {/* =====================================================
          COMPLETE PAGE CSS
      ===================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }


        html {
          scroll-behavior: smooth;
        }


        body {
          margin: 0;
        }


        .landing-page {
          min-height: 100vh;

          color: #0f172a;

          background:
            radial-gradient(
              circle at 10% 10%,
              rgba(219, 234, 254, 0.8),
              transparent 32%
            ),
            radial-gradient(
              circle at 90% 15%,
              rgba(254, 226, 226, 0.75),
              transparent 30%
            ),
            #f8fafc;

          font-family:
            Inter,
            "Segoe UI",
            Arial,
            sans-serif;

          overflow-x: hidden;
        }



        /* =====================================================
           TOP STRIP
        ===================================================== */

        .top-strip {
          background: #0b1220;

          color: #cbd5e1;

          padding: 9px 0;

          font-size: 12px;
        }


        .top-strip-container {
          width: min(
            1200px,
            calc(100% - 48px)
          );

          margin: auto;

          display: flex;

          justify-content: space-between;

          align-items: center;
        }


        .contact-info,
        .top-links {
          display: flex;

          align-items: center;

          gap: 12px;
        }


        .contact-item,
        .top-link {
          display: flex;

          align-items: center;

          gap: 6px;

          color: #cbd5e1;

          text-decoration: none;

          transition: 0.2s;
        }


        .contact-item:hover,
        .top-link:hover {
          color: white;
        }


        .dot-divider,
        .top-divider {
          color: #475569;
        }


        .emergency-link {
          color: #f87171;

          font-weight: 700;
        }


        .pulse-ring {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #ef4444;

          animation:
            pulse
            1.5s
            infinite;
        }


        @keyframes pulse {

          0% {
            box-shadow:
              0 0 0 0
              rgba(239, 68, 68, 0.7);
          }

          70% {
            box-shadow:
              0 0 0 7px
              rgba(239, 68, 68, 0);
          }

          100% {
            box-shadow:
              0 0 0 0
              rgba(239, 68, 68, 0);
          }

        }



        /* =====================================================
           NAVBAR
        ===================================================== */

        .landing-navbar {
          position: sticky;

          top: 0;

          z-index: 100;

          background:
            rgba(
              255,
              255,
              255,
              0.92
            );

          backdrop-filter:
            blur(18px);

          border-bottom:
            1px solid #e2e8f0;
        }


        .navbar-container {
          width: min(
            1200px,
            calc(100% - 48px)
          );

          height: 74px;

          margin: auto;

          display: flex;

          align-items: center;

          justify-content: space-between;
        }


        .landing-brand {
          display: flex;

          align-items: center;

          gap: 11px;

          text-decoration: none;

          color: #0f172a;
        }


        .brand-icon {
          width: 43px;
          height: 43px;

          border-radius: 13px;

          display: grid;

          place-items: center;

          color: white;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #1d4ed8
            );

          box-shadow:
            0 10px 20px
            rgba(
              37,
              99,
              235,
              0.25
            );
        }


        .brand-name {
          font-size: 19px;

          font-weight: 900;

          letter-spacing: 0.02em;
        }


        .brand-name span {
          color: #ef4444;
        }


        .brand-tagline {
          margin-top: 3px;

          font-size: 8px;

          font-weight: 700;

          color: #64748b;

          letter-spacing: 0.1em;
        }


        .nav-menu {
          display: flex;

          gap: 32px;
        }


        .nav-link {
          position: relative;

          color: #334155;

          text-decoration: none;

          font-size: 14px;

          font-weight: 700;

          padding: 27px 0;
        }


        .nav-link:hover,
        .nav-link.active {
          color: #2563eb;
        }


        .nav-link.active::after {
          content: "";

          position: absolute;

          left: 0;

          right: 0;

          bottom: 0;

          height: 3px;

          background: #2563eb;

          border-radius: 5px;
        }


        .nav-right {
          display: flex;

          align-items: center;

          gap: 12px;
        }


        .nav-icon-btn {
          position: relative;

          width: 40px;
          height: 40px;

          border:
            1px solid #dbe3ef;

          border-radius: 50%;

          background: white;

          color: #334155;

          display: grid;

          place-items: center;

          cursor: pointer;

          transition: 0.2s;
        }


        .nav-icon-btn:hover {
          transform:
            translateY(-2px);

          border-color:
            #93c5fd;

          color: #2563eb;
        }


        .notification-dot {
          position: absolute;

          top: 5px;

          right: 5px;

          width: 7px;
          height: 7px;

          background: #ef4444;

          border:
            2px solid white;

          border-radius: 50%;
        }


        .user-avatar {
          width: 40px;
          height: 40px;

          border:
            1px solid #dbe3ef;

          border-radius: 50%;

          display: grid;

          place-items: center;

          color: #1e3a8a;

          background:
            linear-gradient(
              135deg,
              #eff6ff,
              #dbeafe
            );
        }



        /* =====================================================
           HERO
        ===================================================== */

        .hero-section {
          width: min(
            1200px,
            calc(100% - 48px)
          );

          min-height: 620px;

          margin: auto;

          display: grid;

          grid-template-columns:
            0.92fr 1.08fr;

          align-items: center;

          gap: 25px;

          padding:
            45px 0 35px;
        }


        .hero-content {
          position: relative;

          z-index: 5;

          padding-left: 5px;
        }


        .hero-badge {
          display: inline-flex;

          align-items: center;

          gap: 8px;

          padding:
            9px 15px;

          border-radius: 999px;

          background: #eff6ff;

          border:
            1px solid #bfdbfe;

          color: #1d4ed8;

          font-size: 11px;

          font-weight: 800;

          letter-spacing: 0.05em;
        }


        .hero-content h1 {
          margin:
            22px 0 18px;

          font-size:
            clamp(
              2.6rem,
              4vw,
              4rem
            );

          line-height: 1.05;

          letter-spacing: -0.045em;

          color: #0f1f3d;
        }


        .text-gradient {
          background:
            linear-gradient(
              135deg,
              #ef4444,
              #dc2626
            );

          -webkit-background-clip: text;

          -webkit-text-fill-color: transparent;
        }


        .hero-description {
          max-width: 520px;

          color: #64748b;

          font-size: 16px;

          line-height: 1.7;
        }


        .hero-actions {
          display: flex;

          align-items: center;

          gap: 14px;

          margin-top: 28px;
        }


        .hero-primary-btn,
        .hero-secondary-btn {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 9px;

          padding:
            14px 22px;

          border-radius: 12px;

          text-decoration: none;

          font-size: 14px;

          font-weight: 800;

          transition:
            transform 0.25s,
            box-shadow 0.25s;
        }


        .hero-primary-btn {
          color: white;

          background:
            linear-gradient(
              135deg,
              #ef4444,
              #dc2626
            );

          box-shadow:
            0 14px 30px
            rgba(
              239,
              68,
              68,
              0.25
            );
        }


        .hero-primary-btn:hover {
          transform:
            translateY(-3px);

          box-shadow:
            0 20px 35px
            rgba(
              239,
              68,
              68,
              0.3
            );
        }


        .hero-secondary-btn {
          color: #1d4ed8;

          background: white;

          border:
            1px solid #bfdbfe;
        }


        .hero-secondary-btn:hover {
          transform:
            translateY(-3px);

          box-shadow:
            0 10px 25px
            rgba(
              30,
              64,
              175,
              0.1
            );
        }


        .btn-arrow {
          transition: 0.2s;
        }


        .hero-primary-btn:hover
        .btn-arrow {
          transform:
            translateX(4px);
        }


        .hero-trust {
          display: flex;

          align-items: center;

          gap: 17px;

          margin-top: 30px;

          padding-top: 22px;

          border-top:
            1px solid #e2e8f0;
        }


        .trust-item {
          display: flex;

          align-items: center;

          gap: 7px;

          color: #64748b;

          font-size: 12px;

          font-weight: 700;
        }


        .trust-item svg {
          color: #2563eb;
        }


        .trust-divider {
          width: 1px;

          height: 18px;

          background: #cbd5e1;
        }



        /* =====================================================
           AMBULANCE AREA
        ===================================================== */

        .hero-visual {
          position: relative;

          width: 100%;

          height: 530px;

          display: flex;

          align-items: center;

          justify-content: center;

          overflow: visible;
        }


        .visual-glow {
          position: absolute;

          width: 560px;

          height: 560px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(
                59,
                130,
                246,
                0.15
              ),
              rgba(
                239,
                68,
                68,
                0.07
              ) 45%,
              transparent 72%
            );

          filter: blur(10px);

          z-index: 0;
        }


        .ambulance-stage {
          position: relative;

          width: 100%;

          max-width: 700px;

          height: 500px;

          display: flex;

          align-items: center;

          justify-content: center;

          z-index: 5;
        }


        /* =====================================================
           BIG AMBULANCE
        ===================================================== */

        .ambulance-image {
          position: relative;

          width: 100%;

          max-width: 650px;

          height: auto;

          display: block;

          object-fit: contain;

          margin-top: 20px;

          z-index: 5;

          filter:
            drop-shadow(
              0 20px 12px
              rgba(
                15,
                23,
                42,
                0.22
              )
            )
            drop-shadow(
              0 8px 5px
              rgba(
                15,
                23,
                42,
                0.15
              )
            );

          animation:
            ambulanceMove
            1.8s
            ease-in-out
            infinite
            alternate;
        }


        @keyframes ambulanceMove {

          0% {
            transform:
              translateX(-6px)
              translateY(0);
          }

          50% {
            transform:
              translateX(0)
              translateY(-3px);
          }

          100% {
            transform:
              translateX(6px)
              translateY(0);
          }

        }



        /* =====================================================
           LIVE BADGE
        ===================================================== */

        .live-badge {
          position: absolute;

          top: 52px;

          left: 0;

          z-index: 20;

          display: flex;

          align-items: center;

          gap: 8px;

          padding:
            12px 18px;

          border-radius: 999px;

          color: white;

          background:
            rgba(
              15,
              23,
              42,
              0.95
            );

          box-shadow:
            0 10px 25px
            rgba(
              15,
              23,
              42,
              0.18
            );

          font-size: 12px;

          font-weight: 800;
        }


        .live-icon {
          color: #ef4444;

          animation:
            livePulse
            1.3s
            infinite;
        }


        @keyframes livePulse {

          0% {
            opacity: 1;

            transform:
              scale(1);
          }

          50% {
            opacity: 0.45;

            transform:
              scale(1.2);
          }

          100% {
            opacity: 1;

            transform:
              scale(1);
          }

        }



        /* =====================================================
           RADAR
        ===================================================== */

        .radar {
          position: absolute;

          top: 55px;

          right: 25px;

          width: 85px;

          height: 85px;

          border-radius: 50%;

          display: grid;

          place-items: center;

          color: #ef4444;

          background:
            rgba(
              255,
              255,
              255,
              0.82
            );

          border:
            3px solid
            rgba(
              239,
              68,
              68,
              0.2
            );

          z-index: 15;
        }


        .radar-arrow {
          transform:
            rotate(45deg);

          z-index: 3;
        }


        .radar-ring {
          position: absolute;

          inset: -3px;

          border:
            2px solid
            rgba(
              239,
              68,
              68,
              0.3
            );

          border-radius: 50%;

          animation:
            radarPulse
            2s
            infinite;
        }


        @keyframes radarPulse {

          0% {
            transform:
              scale(0.85);

            opacity: 1;
          }

          100% {
            transform:
              scale(1.7);

            opacity: 0;
          }

        }



        /* =====================================================
           MOTION LINES
        ===================================================== */

        .motion-lines {
          position: absolute;

          left: 15px;

          top: 58%;

          display: flex;

          flex-direction: column;

          gap: 10px;

          z-index: 3;

          opacity: 0.65;
        }


        .motion-lines span {
          display: block;

          height: 3px;

          border-radius: 10px;

          background: #94a3b8;

          animation:
            speedLine
            1s
            linear
            infinite;
        }


        .motion-lines span:nth-child(1) {
          width: 65px;
        }


        .motion-lines span:nth-child(2) {
          width: 42px;

          animation-delay:
            0.2s;
        }


        .motion-lines span:nth-child(3) {
          width: 52px;

          animation-delay:
            0.4s;
        }


        @keyframes speedLine {

          0% {
            transform:
              translateX(15px);

            opacity: 0;
          }

          30% {
            opacity: 1;
          }

          100% {
            transform:
              translateX(-20px);

            opacity: 0;
          }

        }



        /* =====================================================
           STATUS CARD
        ===================================================== */

        .status-card {
          position: absolute;

          right: 0;

          bottom: 40px;

          z-index: 20;

          display: flex;

          align-items: center;

          gap: 12px;

          padding:
            14px 20px;

          background: white;

          border:
            1px solid #e2e8f0;

          border-radius: 18px;

          box-shadow:
            0 15px 35px
            rgba(
              15,
              23,
              42,
              0.13
            );
        }


        .status-icon {
          width: 42px;

          height: 42px;

          display: grid;

          place-items: center;

          border-radius: 12px;

          color: #ef4444;

          background: #fef2f2;
        }


        .status-value {
          font-size: 21px;

          font-weight: 900;

          line-height: 1;

          color: #0f172a;
        }


        .status-label {
          margin-top: 5px;

          font-size: 11px;

          font-weight: 600;

          color: #64748b;
        }



        /* =====================================================
           PORTALS
        ===================================================== */

        .portal-section {
          width: min(
            1200px,
            calc(100% - 48px)
          );

          margin: auto;

          padding:
            70px 0;
        }


        .section-heading {
          max-width: 650px;

          margin:
            0 auto 45px;

          text-align: center;
        }


        .section-label {
          display: inline-flex;

          align-items: center;

          gap: 6px;

          color: #dc2626;

          font-size: 11px;

          font-weight: 900;

          letter-spacing: 0.12em;
        }


        .section-heading h2 {
          margin:
            12px 0;

          font-size:
            clamp(
              2rem,
              3.5vw,
              2.8rem
            );

          line-height: 1.1;

          color: #0f1f3d;
        }


        .section-heading p {
          color: #64748b;

          font-size: 15px;

          line-height: 1.6;
        }


        .portal-grid {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 24px;
        }


        .portal-card {
          position: relative;

          padding: 30px;

          min-height: 340px;

          display: flex;

          flex-direction: column;

          color: #0f172a;

          text-decoration: none;

          background:
            rgba(
              255,
              255,
              255,
              0.9
            );

          border:
            1px solid #e2e8f0;

          border-radius: 20px;

          overflow: hidden;

          box-shadow:
            0 8px 30px
            rgba(
              15,
              23,
              42,
              0.05
            );

          transition:
            transform 0.3s,
            box-shadow 0.3s;
        }


        .portal-card:hover {
          transform:
            translateY(-8px);

          box-shadow:
            0 20px 45px
            rgba(
              15,
              23,
              42,
              0.11
            );
        }


        .card-top-bar {
          position: absolute;

          top: 0;

          left: 0;

          right: 0;

          height: 4px;

          opacity: 0;

          transition: 0.3s;
        }


        .portal-card:hover
        .card-top-bar {
          opacity: 1;
        }


        .user-card
        .card-top-bar {
          background: #2563eb;
        }


        .ambulance-card
        .card-top-bar {
          background: #dc2626;
        }


        .admin-card
        .card-top-bar {
          background: #7c3aed;
        }


        .portal-top {
          display: flex;

          align-items: center;

          justify-content: space-between;
        }


        .portal-icon {
          width: 52px;

          height: 52px;

          display: grid;

          place-items: center;

          border-radius: 15px;
        }


        .user-card
        .portal-icon {
          color: #2563eb;

          background: #eff6ff;
        }


        .ambulance-card
        .portal-icon {
          color: #dc2626;

          background: #fef2f2;
        }


        .admin-card
        .portal-icon {
          color: #7c3aed;

          background: #f5f3ff;
        }


        .portal-arrow {
          width: 37px;

          height: 37px;

          display: grid;

          place-items: center;

          border:
            1px solid #e2e8f0;

          border-radius: 10px;

          color: #94a3b8;

          transition: 0.2s;
        }


        .portal-card:hover
        .portal-arrow {
          color: #0f172a;

          transform:
            translateX(4px);
        }


        .portal-role {
          margin-top: 28px;

          color: #64748b;

          font-size: 10px;

          font-weight: 900;

          letter-spacing: 0.12em;
        }


        .portal-card h3 {
          margin:
            8px 0 10px;

          font-size: 20px;

          line-height: 1.25;

          font-weight: 850;
        }


        .portal-card p {
          color: #64748b;

          font-size: 13px;

          line-height: 1.65;
        }


        .portal-features {
          display: flex;

          gap: 8px;

          flex-wrap: wrap;

          margin-top: 20px;
        }


        .portal-features span {
          display: inline-flex;

          align-items: center;

          gap: 6px;

          padding:
            7px 10px;

          border-radius: 8px;

          background: #f1f5f9;

          color: #475569;

          font-size: 10px;

          font-weight: 800;
        }


        .portal-action {
          margin-top: auto;

          padding-top: 25px;

          display: flex;

          align-items: center;

          gap: 8px;

          font-size: 13px;

          font-weight: 800;
        }


        .user-card
        .portal-action {
          color: #2563eb;
        }


        .ambulance-card
        .portal-action {
          color: #dc2626;
        }


        .admin-card
        .portal-action {
          color: #7c3aed;
        }



        /* =====================================================
           SECURITY
        ===================================================== */

        .security-section {
          width: min(
            1200px,
            calc(100% - 48px)
          );

          margin: auto;

          padding-bottom: 60px;
        }


        .security-card {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 25px;

          padding:
            25px 30px;

          background: white;

          border:
            1px solid #e2e8f0;

          border-radius: 18px;

          box-shadow:
            0 8px 25px
            rgba(
              15,
              23,
              42,
              0.05
            );
        }


        .security-item {
          display: flex;

          align-items: center;

          gap: 13px;
        }


        .security-icon {
          width: 45px;

          height: 45px;

          display: grid;

          place-items: center;

          border-radius: 13px;
        }


        .security-icon.red {
          color: #dc2626;

          background: #fef2f2;
        }


        .security-icon.blue {
          color: #2563eb;

          background: #eff6ff;
        }


        .security-icon.green {
          color: #16a34a;

          background: #f0fdf4;
        }


        .security-item strong {
          display: block;

          font-size: 13px;

          color: #0f172a;
        }


        .security-item span {
          display: block;

          margin-top: 4px;

          font-size: 11px;

          color: #64748b;
        }


        .security-divider {
          width: 1px;

          height: 35px;

          background: #e2e8f0;
        }



        /* =====================================================
           FOOTER
        ===================================================== */

        .landing-footer {
          padding:
            40px 0;

          background: #0b1220;

          color: #94a3b8;
        }


        .footer-container {
          width: min(
            1200px,
            calc(100% - 48px)
          );

          margin: auto;

          display: flex;

          flex-direction: column;

          align-items: center;

          gap: 12px;

          text-align: center;
        }


        .footer-brand {
          display: flex;

          align-items: center;

          gap: 8px;

          color: white;
        }


        .footer-icon {
          color: #ef4444;
        }


        .footer-brand strong {
          font-size: 16px;
        }


        .footer-tagline {
          font-size: 12px;

          color: #64748b;
        }


        .footer-copy {
          font-size: 10px;

          color: #475569;
        }



        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1000px) {

          .nav-menu {
            gap: 18px;
          }


          .hero-section {
            grid-template-columns: 1fr;

            text-align: center;

            padding-top: 45px;
          }


          .hero-content {
            display: flex;

            flex-direction: column;

            align-items: center;

            padding-left: 0;
          }


          .hero-description {
            margin: auto;
          }


          .hero-actions {
            justify-content: center;
          }


          .hero-trust {
            justify-content: center;
          }


          .hero-visual {
            height: 500px;
          }


          .ambulance-stage {
            max-width: 700px;

            height: 480px;
          }


          .ambulance-image {
            max-width: 650px;
          }


          .portal-grid {
            grid-template-columns: 1fr;
          }


          .portal-card {
            min-height: 300px;
          }


          .security-card {
            flex-direction: column;

            align-items: flex-start;
          }


          .security-divider {
            display: none;
          }

        }



        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {

          .top-strip {
            display: none;
          }


          .navbar-container {
            width:
              calc(100% - 24px);

            height: 65px;
          }


          .nav-menu {
            display: none;
          }


          .nav-right {
            gap: 6px;
          }


          .brand-name {
            font-size: 16px;
          }


          .brand-tagline {
            font-size: 7px;
          }


          .hero-section {
            width:
              calc(100% - 28px);

            padding:
              35px 0 20px;
          }


          .hero-content h1 {
            font-size: 2.4rem;
          }


          .hero-description {
            font-size: 14px;
          }


          .hero-actions {
            flex-direction: column;

            width: 100%;
          }


          .hero-primary-btn,
          .hero-secondary-btn {
            width: 100%;
          }


          .hero-trust {
            flex-wrap: wrap;

            gap: 10px;
          }


          .trust-divider {
            display: none;
          }


          .hero-visual {
            height: 430px;
          }


          .ambulance-stage {
            height: 390px;

            max-width: 100%;
          }


          .ambulance-image {
            width: 115%;

            max-width: 600px;

            margin-top: 20px;
          }


          .live-badge {
            top: 15px;

            left: 0;

            font-size: 10px;

            padding:
              9px 12px;
          }


          .radar {
            top: 20px;

            right: 0;

            width: 60px;

            height: 60px;
          }


          .motion-lines {
            left: 0;
          }


          .status-card {
            right: 0;

            bottom: 20px;

            padding:
              10px 14px;
          }


          .status-value {
            font-size: 17px;
          }


          .portal-section {
            width:
              calc(100% - 28px);

            padding-top: 45px;
          }


          .security-section {
            width:
              calc(100% - 28px);
          }


          .security-card {
            padding: 20px;
          }


          .footer-container {
            width:
              calc(100% - 28px);
          }

        }



        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 450px) {

          .brand-icon {
            width: 38px;

            height: 38px;
          }


          .brand-name {
            font-size: 14px;
          }


          .nav-icon-btn {
            width: 35px;

            height: 35px;
          }


          .user-avatar {
            width: 35px;

            height: 35px;
          }


          .hero-content h1 {
            font-size: 2rem;
          }


          .hero-visual {
            height: 360px;
          }


          .ambulance-stage {
            height: 330px;
          }


          .ambulance-image {
            width: 125%;

            max-width: 550px;
          }


          .live-badge {
            font-size: 9px;

            padding:
              8px 10px;
          }


          .radar {
            width: 52px;

            height: 52px;
          }


          .status-card {
            transform:
              scale(0.9);

            transform-origin:
              right bottom;
          }

        }

      `}</style>

    </div>
  );
}
