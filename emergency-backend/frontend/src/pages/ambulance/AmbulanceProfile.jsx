import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as ambulanceApi from '../../api/ambulanceApi';

export default function AmbulanceProfile() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [drivingLicense, setDrivingLicense] = useState('');
  const [ambulanceType, setAmbulanceType] = useState('any');

  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [message, setMessage] = useState('');

  const [touched, setTouched] = useState({
    age: false,
    dob: false,
    drivingLicense: false,
    vehicleNumber: false,
  });

  /* =====================================================
     LOAD EXISTING PROFILE
     ===================================================== */

  useEffect(() => {
    (async () => {
      try {
        const { data } = await ambulanceApi.getMe();

        const a = data.ambulance || {};

        setName(a.name || '');
        setAge(a.age ? String(a.age) : '');

        setDob(
          a.date_of_birth
            ? typeof a.date_of_birth === 'string'
              ? a.date_of_birth.slice(0, 10)
              : new Date(a.date_of_birth)
                  .toISOString()
                  .slice(0, 10)
            : ''
        );

        setGender(a.gender || '');
        setVehicleNumber(a.vehicle_number || '');
        setDrivingLicense(a.driving_license || '');
        setAmbulanceType(a.ambulance_type || 'any');
      } catch {
        setMessage('Could not load profile');
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, []);

  /* =====================================================
     AGE CALCULATION
     ===================================================== */

  const calculateAgeFromDob = (dateString) => {
    if (!dateString) return null;

    const birthDate = new Date(dateString);

    if (Number.isNaN(birthDate.getTime())) {
      return null;
    }

    const today = new Date();

    let calculatedAge =
      today.getFullYear() - birthDate.getFullYear();

    const monthDifference =
      today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (
        monthDifference === 0 &&
        today.getDate() < birthDate.getDate()
      )
    ) {
      calculatedAge--;
    }

    return calculatedAge;
  };

  /* =====================================================
     DOB VALIDATION
     ===================================================== */

  const getDobError = () => {
    if (!dob) {
      return 'Date of birth is required';
    }

    const birthDate = new Date(dob);

    if (Number.isNaN(birthDate.getTime())) {
      return 'Enter a valid date of birth';
    }

    const today = new Date();

    if (birthDate > today) {
      return 'Date of birth cannot be in the future';
    }

    const calculatedAge = calculateAgeFromDob(dob);

    if (calculatedAge === null) {
      return 'Invalid date of birth';
    }

    if (calculatedAge < 18) {
      return 'Ambulance driver must be at least 18 years old';
    }

    if (calculatedAge > 100) {
      return 'Please enter a valid date of birth';
    }

    return '';
  };

  /* =====================================================
     AGE VALIDATION
     ===================================================== */

  const getAgeError = () => {
    if (!age) {
      return 'Age is required';
    }

    const numericAge = Number(age);

    if (
      !Number.isInteger(numericAge) ||
      numericAge < 18 ||
      numericAge > 100
    ) {
      return 'Age must be between 18 and 100';
    }

    if (dob) {
      const calculatedAge = calculateAgeFromDob(dob);

      if (
        calculatedAge !== null &&
        numericAge !== calculatedAge
      ) {
        return `Age does not match DOB. Expected ${calculatedAge}`;
      }
    }

    return '';
  };

  /* =====================================================
     DRIVING LICENSE VALIDATION
     ===================================================== */

  const normalizeLicense = (value) => {
    return value
      .toUpperCase()
      .replace(/[\s-]/g, '');
  };

  const getDrivingLicenseError = () => {
    if (!drivingLicense) {
      return 'Driving license number is required';
    }

    const normalized = normalizeLicense(drivingLicense);

    /*
      Frontend format validation.

      Example:
      MH1420110012345
    */

    const licenseRegex =
      /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/;

    if (!licenseRegex.test(normalized)) {
      return (
        'Enter a valid driving license format ' +
        '(e.g. MH1420110012345)'
      );
    }

    const year = Number(
      normalized.substring(4, 8)
    );

    const currentYear = new Date().getFullYear();

    if (
      year < 1950 ||
      year > currentYear
    ) {
      return 'Invalid license year';
    }

    return '';
  };

  /* =====================================================
     VEHICLE NUMBER VALIDATION
     ===================================================== */

  const getVehicleError = () => {
    if (!vehicleNumber.trim()) {
      return 'Vehicle number is required';
    }

    const normalized = vehicleNumber
      .toUpperCase()
      .replace(/[\s-]/g, '');

    const vehicleRegex =
      /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4}$/;

    if (!vehicleRegex.test(normalized)) {
      return (
        'Enter a valid vehicle number ' +
        '(e.g. MH12AB1234)'
      );
    }

    return '';
  };

  /* =====================================================
     VALIDATION RESULTS
     ===================================================== */

  const ageError = getAgeError();
  const dobError = getDobError();
  const licenseError = getDrivingLicenseError();
  const vehicleError = getVehicleError();

  const ageValid =
    touched.age && !ageError;

  const dobValid =
    touched.dob && !dobError;

  const licenseValid =
    touched.drivingLicense &&
    !licenseError;

  const vehicleValid =
    touched.vehicleNumber &&
    !vehicleError;

  /* =====================================================
     FORM VALIDATION
     ===================================================== */

  const validateForm = () => {
    setTouched({
      age: true,
      dob: true,
      drivingLicense: true,
      vehicleNumber: true,
    });

    if (!name.trim()) {
      setMessage('Please enter your name');
      return false;
    }

    if (ageError) {
      setMessage(ageError);
      return false;
    }

    if (dobError) {
      setMessage(dobError);
      return false;
    }

    if (!gender) {
      setMessage('Please select your gender');
      return false;
    }

    if (vehicleError) {
      setMessage(vehicleError);
      return false;
    }

    if (licenseError) {
      setMessage(licenseError);
      return false;
    }

    return true;
  };

  /* =====================================================
     SUBMIT
     ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await ambulanceApi.updateProfile({
        name,
        age: age ? parseInt(age, 10) : undefined,
        date_of_birth: dob || undefined,
        gender: gender || undefined,
        vehicle_number: vehicleNumber,
        driving_license: normalizeLicense(drivingLicense),
        ambulance_type: ambulanceType,
      });

      setMessage(
        'Profile updated successfully'
      );

      if (
        name &&
        age &&
        dob &&
        gender &&
        vehicleNumber &&
        drivingLicense
      ) {
        setTimeout(() => {
          window.location.href =
            '/ambulance/dashboard';
        }, 1000);
      }
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
        'Update failed'
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOADING
     ===================================================== */

  if (loadingProfile) {
    return (
      <div className="rak-profile-loading">
        <div className="rak-spinner" />
        <p>Loading your profile…</p>
      </div>
    );
  }

  return (
    <div className="rak-profile-page">

      <style>{`

        * {
          box-sizing: border-box;
        }

        /* ==========================================
           PAGE
        ========================================== */

        .rak-profile-page {
          min-height: 100vh;

          padding: 35px 20px 60px;

          background:
            linear-gradient(
              135deg,
              #f8fafc 0%,
              #eef4ff 50%,
              #f8fafc 100%
            );

          color: #0f172a;

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        /* ==========================================
           HEADER
        ========================================== */

        .rak-profile-header {
          width: min(1100px, 100%);

          margin: 0 auto 26px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;
        }

        .rak-profile-brand {
          display: flex;

          align-items: center;

          gap: 15px;
        }

        .rak-profile-logo {
          width: 54px;
          height: 54px;

          display: grid;

          place-items: center;

          border-radius: 16px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #1d4ed8
            );

          color: white;

          font-size: 26px;

          box-shadow:
            0 12px 30px
            rgba(37, 99, 235, .23);
        }

        .rak-profile-brand h1 {
          margin: 0;

          color: #0f172a;

          font-size: 24px;

          line-height: 1.2;

          font-weight: 900;

          letter-spacing: -.035em;
        }

        .rak-profile-brand p {
          margin: 5px 0 0;

          color: #64748b;

          font-size: 10px;

          font-weight: 800;

          letter-spacing: .05em;
        }

        .rak-dashboard-link {
          display: inline-flex;

          align-items: center;

          gap: 8px;

          padding: 12px 17px;

          border:
            1px solid #dbe3ef;

          border-radius: 12px;

          background: white;

          color: #334155;

          text-decoration: none;

          font-size: 12px;

          font-weight: 800;

          transition: .2s;
        }

        .rak-dashboard-link:hover {
          border-color: #93c5fd;

          color: #2563eb;

          transform:
            translateY(-1px);
        }

        /* ==========================================
           MAIN CARD
        ========================================== */

        .rak-profile-card {
          width: min(1100px, 100%);

          margin: 0 auto;

          overflow: hidden;

          border:
            1px solid
            rgba(255, 255, 255, .95);

          border-radius: 27px;

          background:
            rgba(255, 255, 255, .97);

          box-shadow:
            0 25px 75px
            rgba(15, 23, 42, .11);
        }

        /* ==========================================
           CARD TOP
        ========================================== */

        .rak-card-top {
          padding: 34px 42px;

          background:
            linear-gradient(
              135deg,
              #eff6ff,
              #ffffff
            );

          border-bottom:
            1px solid #e8eef7;
        }

        .rak-card-top h2 {
          margin: 0;

          color: #0f172a;

          font-size: 28px;

          line-height: 1.2;

          font-weight: 900;

          letter-spacing: -.04em;
        }

        .rak-card-top p {
          max-width: 750px;

          margin: 10px 0 0;

          color: #64748b;

          font-size: 15px;

          line-height: 1.6;

          font-weight: 500;
        }

        /* ==========================================
           FORM
        ========================================== */

        .rak-profile-form {
          padding: 40px 42px;
        }

        /* ==========================================
           SECTION TITLES
        ========================================== */

        .rak-section-title {
          display: flex;

          align-items: center;

          gap: 12px;

          margin: 0 0 22px;

          color: #0f172a;

          font-size: 20px;

          line-height: 1.3;

          font-weight: 900;

          letter-spacing: -.01em;
        }

        .rak-section-title::before {
          content: '';

          width: 6px;

          height: 25px;

          border-radius: 999px;

          background:
            linear-gradient(
              #2563eb,
              #60a5fa
            );
        }

        /* ==========================================
           FORM GRID
        ========================================== */

        .rak-form-grid {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 25px 28px;

          margin-bottom: 40px;
        }

        .rak-form-group {
          display: flex;

          flex-direction: column;

          gap: 10px;
        }

        .rak-form-group.full {
          grid-column: 1 / -1;
        }

        /* ==========================================
           LABEL
        ========================================== */

        .rak-form-label {
          display: flex;

          align-items: center;

          justify-content: space-between;

          color: #334155;

          font-size: 15px;

          line-height: 1.4;

          font-weight: 800;

          letter-spacing: 0;
        }

        .rak-required {
          color: #ef4444;
        }

        /* ==========================================
           INPUTS
        ========================================== */

        .rak-input,
        .rak-select {
          width: 100%;

          height: 56px;

          padding: 0 17px;

          border:
            1px solid #dbe3ed;

          border-radius: 13px;

          outline: none;

          background: #ffffff;

          color: #0f172a;

          font-size: 15px;

          font-weight: 600;

          transition:
            border-color .18s,
            box-shadow .18s,
            background .18s;
        }

        .rak-input::placeholder {
          color: #94a3b8;

          font-size: 14px;

          font-weight: 500;
        }

        .rak-input:focus,
        .rak-select:focus {
          border-color: #3b82f6;

          box-shadow:
            0 0 0 4px
            rgba(59, 130, 246, .10);

          background: white;
        }

        /* ==========================================
           VALID
        ========================================== */

        .rak-input.valid,
        .rak-select.valid {
          border-color: #22c55e;

          background: #f0fdf4;
        }

        .rak-input.valid:focus,
        .rak-select.valid:focus {
          border-color: #16a34a;

          box-shadow:
            0 0 0 4px
            rgba(34, 197, 94, .10);
        }

        /* ==========================================
           INVALID
        ========================================== */

        .rak-input.invalid,
        .rak-select.invalid {
          border-color: #ef4444;

          background: #fff7f7;
        }

        .rak-input.invalid:focus,
        .rak-select.invalid:focus {
          border-color: #dc2626;

          box-shadow:
            0 0 0 4px
            rgba(239, 68, 68, .10);
        }

        /* ==========================================
           FIELD MESSAGES
        ========================================== */

        .rak-field-message {
          display: flex;

          align-items: center;

          gap: 6px;

          margin-top: 0;

          font-size: 12px;

          font-weight: 750;

          line-height: 1.5;
        }

        .rak-field-message.error {
          color: #dc2626;
        }

        .rak-field-message.success {
          color: #16a34a;
        }

        /* ==========================================
           LICENSE HINT
        ========================================== */

        .rak-license-hint {
          padding: 13px 15px;

          border-radius: 10px;

          background: #f8fafc;

          color: #64748b;

          font-size: 12px;

          line-height: 1.6;

          font-weight: 500;
        }

        .rak-license-hint strong {
          color: #334155;

          font-weight: 800;
        }

        /* ==========================================
           AMBULANCE CONFIGURATION
        ========================================== */

        .rak-type-grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 14px;
        }

        .rak-type-option {
          min-height: 115px;

          padding: 17px 10px;

          border:
            1px solid #dbe3ed;

          border-radius: 15px;

          background: white;

          cursor: pointer;

          text-align: center;

          transition: .18s;
        }

        .rak-type-option:hover {
          border-color: #93c5fd;

          transform:
            translateY(-2px);

          box-shadow:
            0 8px 20px
            rgba(37, 99, 235, .08);
        }

        .rak-type-option.active {
          border-color: #2563eb;

          background: #eff6ff;

          box-shadow:
            inset 0 0 0 1px #2563eb;
        }

        .rak-type-icon {
          font-size: 31px;

          margin-bottom: 8px;
        }

        .rak-type-name {
          display: block;

          color: #0f172a;

          font-size: 14px;

          font-weight: 850;
        }

        .rak-type-desc {
          display: block;

          margin-top: 5px;

          color: #64748b;

          font-size: 11px;
        }

        /* ==========================================
           MESSAGE
        ========================================== */

        .rak-message {
          margin: 24px 0 0;

          padding: 14px 16px;

          border-radius: 11px;

          font-size: 12px;

          font-weight: 750;
        }

        .rak-message.success {
          border:
            1px solid #bbf7d0;

          background: #f0fdf4;

          color: #15803d;
        }

        .rak-message.error {
          border:
            1px solid #fecaca;

          background: #fef2f2;

          color: #dc2626;
        }

        /* ==========================================
           SAVE BUTTON
        ========================================== */

        .rak-save-button {
          width: 100%;

          height: 57px;

          margin-top: 28px;

          border: none;

          border-radius: 14px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #1d4ed8
            );

          color: white;

          font-size: 14px;

          font-weight: 900;

          letter-spacing: .02em;

          cursor: pointer;

          box-shadow:
            0 12px 27px
            rgba(37, 99, 235, .20);

          transition: .2s;
        }

        .rak-save-button:hover:not(:disabled) {
          transform:
            translateY(-2px);

          box-shadow:
            0 16px 32px
            rgba(37, 99, 235, .27);
        }

        .rak-save-button:disabled {
          opacity: .55;

          cursor: not-allowed;
        }

        /* ==========================================
           FOOTER
        ========================================== */

        .rak-profile-footer {
          width: min(1100px, 100%);

          margin: 20px auto 0;

          text-align: center;
        }

        .rak-profile-footer a {
          color: #64748b;

          font-size: 12px;

          font-weight: 700;

          text-decoration: none;
        }

        .rak-profile-footer a:hover {
          color: #2563eb;
        }

        /* ==========================================
           LOADING
        ========================================== */

        .rak-profile-loading {
          min-height: 100vh;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          background: #f8fafc;

          color: #64748b;
        }

        .rak-spinner {
          width: 40px;

          height: 40px;

          border:
            3px solid #dbeafe;

          border-top-color:
            #2563eb;

          border-radius: 50%;

          animation:
            rak-spin .8s linear infinite;
        }

        .rak-profile-loading p {
          margin-top: 14px;

          font-size: 13px;

          font-weight: 700;
        }

        @keyframes rak-spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* ==========================================
           TABLET
        ========================================== */

        @media (max-width: 800px) {

          .rak-profile-page {
            padding:
              24px 14px 45px;
          }

          .rak-profile-header {
            align-items: flex-start;
          }

          .rak-profile-brand h1 {
            font-size: 20px;
          }

          .rak-card-top {
            padding:
              28px 26px;
          }

          .rak-card-top h2 {
            font-size: 24px;
          }

          .rak-card-top p {
            font-size: 14px;
          }

          .rak-profile-form {
            padding:
              30px 26px;
          }

          .rak-form-grid {
            grid-template-columns: 1fr;
          }

          .rak-form-group.full {
            grid-column: auto;
          }

          .rak-type-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

        /* ==========================================
           MOBILE
        ========================================== */

        @media (max-width: 520px) {

          .rak-profile-header {
            flex-direction: column;
          }

          .rak-dashboard-link {
            width: 100%;

            justify-content: center;
          }

          .rak-card-top {
            padding:
              24px 19px;
          }

          .rak-card-top h2 {
            font-size: 21px;
          }

          .rak-card-top p {
            font-size: 13px;
          }

          .rak-profile-form {
            padding:
              25px 18px;
          }

          .rak-section-title {
            font-size: 18px;
          }

          .rak-form-label {
            font-size: 14px;
          }

          .rak-input,
          .rak-select {
            height: 53px;

            font-size: 14px;
          }

          .rak-type-grid {
            grid-template-columns:
              1fr 1fr;
          }

          .rak-type-option {
            min-height: 105px;
          }
        }

      `}</style>


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="rak-profile-header">

        <div className="rak-profile-brand">

          <div className="rak-profile-logo">
            🚑
          </div>

          <div>

            <h1>
              Ambulance Profile
            </h1>

            <p>
              RAKSHAK AI • EMERGENCY RESPONSE SYSTEM
            </p>

          </div>

        </div>

        <Link
          to="/ambulance/dashboard"
          className="rak-dashboard-link"
        >
          ← Dashboard
        </Link>

      </header>


      {/* =================================================
          PROFILE CARD
      ================================================= */}

      <section className="rak-profile-card">

        <div className="rak-card-top">

          <h2>
            Driver & Vehicle Information
          </h2>

          <p>
            Keep your information accurate so emergency
            requests can be assigned correctly.
          </p>

        </div>


        <form
          className="rak-profile-form"
          onSubmit={handleSubmit}
        >

          {/* =============================================
              PERSONAL INFORMATION
          ============================================= */}

          <div className="rak-section-title">
            Personal Information
          </div>


          <div className="rak-form-grid">

            {/* FULL NAME */}

            <div className="rak-form-group full">

              <label className="rak-form-label">

                <span>
                  Full Name
                  <span className="rak-required">
                    {' '}*
                  </span>
                </span>

              </label>

              <input
                className="rak-input"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your full name"
                required
              />

            </div>


            {/* AGE */}

            <div className="rak-form-group">

              <label className="rak-form-label">

                <span>
                  Age
                  <span className="rak-required">
                    {' '}*
                  </span>
                </span>

              </label>

              <input
                type="number"
                min="18"
                max="100"
                className={
                  `rak-input ${
                    touched.age
                      ? ageError
                        ? 'invalid'
                        : 'valid'
                      : ''
                  }`
                }
                value={age}
                onChange={(e) =>
                  setAge(e.target.value)
                }
                onBlur={() =>
                  setTouched((prev) => ({
                    ...prev,
                    age: true,
                  }))
                }
                placeholder="e.g. 28"
                required
              />

              {touched.age && ageError && (
                <div className="rak-field-message error">
                  ✕ {ageError}
                </div>
              )}

              {ageValid && (
                <div className="rak-field-message success">
                  ✓ Age is valid
                </div>
              )}

            </div>


            {/* DOB */}

            <div className="rak-form-group">

              <label className="rak-form-label">

                <span>
                  Date of Birth
                  <span className="rak-required">
                    {' '}*
                  </span>
                </span>

              </label>

              <input
                type="date"
                className={
                  `rak-input ${
                    touched.dob
                      ? dobError
                        ? 'invalid'
                        : 'valid'
                      : ''
                  }`
                }
                value={dob}
                onChange={(e) =>
                  setDob(e.target.value)
                }
                onBlur={() =>
                  setTouched((prev) => ({
                    ...prev,
                    dob: true,
                  }))
                }
                required
              />

              {touched.dob && dobError && (
                <div className="rak-field-message error">
                  ✕ {dobError}
                </div>
              )}

              {dobValid && (
                <div className="rak-field-message success">
                  ✓ DOB and age are compatible
                </div>
              )}

            </div>


            {/* GENDER */}

            <div className="rak-form-group">

              <label className="rak-form-label">

                <span>
                  Gender
                  <span className="rak-required">
                    {' '}*
                  </span>
                </span>

              </label>

              <select
                className="rak-select"
                value={gender}
                onChange={(e) =>
                  setGender(e.target.value)
                }
                required
              >

                <option value="">
                  Select gender
                </option>

                <option value="male">
                  Male
                </option>

                <option value="female">
                  Female
                </option>

                <option value="other">
                  Other
                </option>

              </select>

            </div>

          </div>


          {/* =============================================
              DRIVER VERIFICATION
          ============================================= */}

          <div className="rak-section-title">
            Driver Verification
          </div>


          <div className="rak-form-grid">

            {/* LICENSE */}

            <div className="rak-form-group full">

              <label className="rak-form-label">

                <span>
                  Driving License Number
                  <span className="rak-required">
                    {' '}*
                  </span>
                </span>

              </label>

              <input
                type="text"
                className={
                  `rak-input ${
                    touched.drivingLicense
                      ? licenseError
                        ? 'invalid'
                        : 'valid'
                      : ''
                  }`
                }
                value={drivingLicense}
                onChange={(e) => {

                  const value =
                    e.target.value
                      .toUpperCase()
                      .replace(
                        /[^A-Z0-9\s-]/g,
                        ''
                      );

                  setDrivingLicense(value);
                }}
                onBlur={() =>
                  setTouched((prev) => ({
                    ...prev,
                    drivingLicense: true,
                  }))
                }
                placeholder="e.g. MH1420110012345"
                maxLength={18}
                required
              />

              {touched.drivingLicense &&
                licenseError && (
                  <div className="rak-field-message error">
                    ✕ {licenseError}
                  </div>
                )}

              {licenseValid && (
                <div className="rak-field-message success">
                  ✓ License format is valid
                </div>
              )}

              <div className="rak-license-hint">

                <strong>
                  Format:
                </strong>{' '}

                State code + RTO code + year +
                license number.

                {' '}Example:
                <strong>
                  MH1420110012345
                </strong>

              </div>

            </div>


            {/* VEHICLE */}

            <div className="rak-form-group full">

              <label className="rak-form-label">

                <span>
                  Vehicle Number
                  <span className="rak-required">
                    {' '}*
                  </span>
                </span>

              </label>

              <input
                type="text"
                className={
                  `rak-input ${
                    touched.vehicleNumber
                      ? vehicleError
                        ? 'invalid'
                        : 'valid'
                      : ''
                  }`
                }
                value={vehicleNumber}
                onChange={(e) =>
                  setVehicleNumber(
                    e.target.value.toUpperCase()
                  )
                }
                onBlur={() =>
                  setTouched((prev) => ({
                    ...prev,
                    vehicleNumber: true,
                  }))
                }
                placeholder="e.g. MH12AB1234"
                required
              />

              {touched.vehicleNumber &&
                vehicleError && (
                  <div className="rak-field-message error">
                    ✕ {vehicleError}
                  </div>
                )}

              {vehicleValid && (
                <div className="rak-field-message success">
                  ✓ Vehicle number format is valid
                </div>
              )}

            </div>

          </div>


          {/* =============================================
              AMBULANCE CONFIGURATION
          ============================================= */}

          <div className="rak-section-title">
            Ambulance Configuration
          </div>


          <div className="rak-type-grid">

            {/* ANY */}

            <button
              type="button"
              className={
                `rak-type-option ${
                  ambulanceType === 'any'
                    ? 'active'
                    : ''
                }`
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

              <span className="rak-type-desc">
                General
              </span>

            </button>


            {/* BLS */}

            <button
              type="button"
              className={
                `rak-type-option ${
                  ambulanceType === 'basic_life'
                    ? 'active'
                    : ''
                }`
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

              <span className="rak-type-desc">
                Basic Life Support
              </span>

            </button>


            {/* ALS */}

            <button
              type="button"
              className={
                `rak-type-option ${
                  ambulanceType === 'advance_life'
                    ? 'active'
                    : ''
                }`
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

              <span className="rak-type-desc">
                Advanced Support
              </span>

            </button>


            {/* ICU */}

            <button
              type="button"
              className={
                `rak-type-option ${
                  ambulanceType === 'icu_life'
                    ? 'active'
                    : ''
                }`
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

              <span className="rak-type-desc">
                Critical Care
              </span>

            </button>

          </div>


          {/* =============================================
              MESSAGE
          ============================================= */}

          {message && (
            <div
              className={
                `rak-message ${
                  message
                    .toLowerCase()
                    .includes('success')
                    ? 'success'
                    : 'error'
                }`
              }
            >
              {message}
            </div>
          )}


          {/* =============================================
              SAVE
          ============================================= */}

          <button
            type="submit"
            className="rak-save-button"
            disabled={loading}
          >
            {loading
              ? 'Saving Profile…'
              : '✓ Save & Continue'}
          </button>

        </form>

      </section>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="rak-profile-footer">

        <Link to="/ambulance/dashboard">
          ← Back to Ambulance Dashboard
        </Link>

      </footer>

    </div>
  );
}