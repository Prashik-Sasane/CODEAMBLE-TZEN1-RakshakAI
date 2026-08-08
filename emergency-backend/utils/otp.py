from models.otp_model import OTPModel
from config import Config
from utils.twilio_sms import send_sms, normalize_phone

def send_otp_logic(db, phone, role='user'):
    """Generate OTP, store in DB, send via Twilio. role: 'user' or 'ambulance'."""
    otp = OTPModel.generate_otp()
    OTPModel.create_otp(db, phone, otp, Config.OTP_EXPIRY_MINUTES, role=role)
    to_number = normalize_phone(phone)
    body = f"Your Emergency App verification code is: {otp}. Valid for {Config.OTP_EXPIRY_MINUTES} minutes."
    
    # Always print warning/debug info in console so local devs can grab OTP
    print("\n" + "="*60)
    print(f"🔑 [LOCAL OTP SYSTEM] Role: {role} | Phone: {phone}")
    print(f"👉 Generated OTP Code: {otp}")
    print("="*60 + "\n")
    
    ok, err = send_sms(to_number, body)
    if not ok:
        # Instead of failing, log the error but allow local development to proceed with the CLI OTP
        print(f"⚠️  [Twilio SMS Failed] {err}")
        print("💡 Local developer bypass: Use the OTP printed above to log in.")
        return otp
    return otp
