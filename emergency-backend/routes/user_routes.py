from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user_model import UserModel
from models.request_model import RequestModel, LocationTrackModel
from models.ambulance_model import AmbulanceModel
from models.otp_model import OTPModel
from utils.auth import role_required
from utils.otp import send_otp_logic
from utils.distance import find_nearest_ambulance
from bson import ObjectId

user_bp = Blueprint('user', __name__)

def _serialize_user(u):
    if not u:
        return u
    u = dict(u)
    u['_id'] = str(u['_id'])
    return u

def _serialize_request(req, db):
    if not req:
        return None
    r = dict(req)
    r['_id'] = str(r['_id'])
    r['user_id'] = str(r['user_id'])
    r['selected_hospital'] = req.get('selected_hospital')
    if r.get('assigned_ambulance_id'):
        r['assigned_ambulance_id'] = str(r['assigned_ambulance_id'])
        amb = AmbulanceModel.find_by_id(db, r['assigned_ambulance_id'])
        if amb:
            r['assigned_ambulance'] = {
                'id': str(amb['_id']),
                'name': amb.get('name'),
                'phone': amb.get('phone'),
                'vehicle_number': amb.get('vehicle_number'),
                'driving_license': amb.get('driving_license'),
                'age': amb.get('age'),
                'date_of_birth': amb.get('date_of_birth'),
                'gender': amb.get('gender'),
                'current_location': amb.get('current_location'),
            }
        track = LocationTrackModel.get_track_for_request(db, r['_id'])
        r['track'] = [{'lat': t['lat'], 'lng': t['lng']} for t in track]
    else:
        r['track'] = []
    return r

def init_user_routes(app, db):
    user_bp.db = db
    app.register_blueprint(user_bp, url_prefix='/user')

@user_bp.route('/send-otp', methods=['POST'])
def send_otp():
    try:
        data = request.get_json() or {}
        phone = data.get('phone')
        if not phone:
            return jsonify({'error': 'Phone number is required'}), 400
        otp = send_otp_logic(user_bp.db, phone, role='user')
        return jsonify({'message': 'OTP sent successfully', 'otp': otp}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    try:
        data = request.get_json() or {}
        phone = data.get('phone')
        otp = data.get('otp')
        print(f"DEBUG: verify_otp request received - phone: {repr(phone)}, otp: {repr(otp)}, role: user")
        if not phone or not otp:
            return jsonify({'error': 'Phone number and OTP are required'}), 400
        if not OTPModel.verify_otp(user_bp.db, phone, otp, role='user'):
            return jsonify({'error': 'Invalid or expired OTP'}), 400
        user = UserModel.find_by_phone(user_bp.db, phone)
        if not user:
            UserModel.create_user(user_bp.db, phone)
            user = UserModel.find_by_phone(user_bp.db, phone)
        access_token = create_access_token(
            identity=str(user['_id']),
            additional_claims={'role': 'user'}
        )
        return jsonify({
            'message': 'OTP verified successfully',
            'token': access_token,
            'user_id': str(user['_id']),
            'user': _serialize_user(user)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/me', methods=['GET'])
@jwt_required()
@role_required('user')
def get_me():
    """Get current user profile (for pre-populating forms)."""
    try:
        user_id = get_jwt_identity()
        user = UserModel.find_by_id(user_bp.db, user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'user': _serialize_user(user)}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/update-profile', methods=['POST'])
@jwt_required()
@role_required('user')
def update_profile():
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        update_data = {}
        for key in ('name', 'date_of_birth', 'gender', 'email', 'accident_detection_enabled'):
            if key in data:
                update_data[key] = data[key]
        if not update_data:
            return jsonify({'error': 'No data provided for update'}), 400
        updated = UserModel.update_profile(user_bp.db, user_id, update_data)
        return jsonify({'message': 'Profile updated successfully', 'user': _serialize_user(updated)}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/update-location', methods=['POST'])
@jwt_required()
@role_required('user')
def update_location():
    """Save live location (after permission)."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        lat, lng = data.get('lat'), data.get('lng')
        if lat is None or lng is None:
            return jsonify({'error': 'lat and lng are required'}), 400
        UserModel.update_location(user_bp.db, user_id, float(lat), float(lng))
        return jsonify({'message': 'Location updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/request-emergency', methods=['POST'])
@jwt_required()
@role_required('user')
def request_emergency():
    """Create emergency request and auto-assign nearest ambulance (active preferred, else nearest)."""
    try:
        user_id = get_jwt_identity()
        # Check if user is blacklisted
        if UserModel.is_blacklisted(user_bp.db, user_id):
            return jsonify({
                'error': 'Your account has been blacklisted due to fake emergency requests. Please contact support.'
            }), 403
        data = request.get_json() or {}
        lat = data.get('lat')
        lng = data.get('lng')
        requested_ambulance_type = data.get('ambulance_type', 'any')  # any, basic_life, advance_life, icu_life
        if lat is None or lng is None:
            return jsonify({'error': 'lat and lng are required'}), 400
        lat, lng = float(lat), float(lng)
        UserModel.update_location(user_bp.db, user_id, lat, lng)
        request_id = RequestModel.create_request(user_bp.db, user_id, lat, lng, source='manual', requested_ambulance_type=requested_ambulance_type)
        # Get ambulances with location, excluding those with active assignments
        ambulances = AmbulanceModel.get_all_with_location(user_bp.db, exclude_assigned=True)
        nearest = find_nearest_ambulance(ambulances, lat, lng, prefer_active=True, requested_type=requested_ambulance_type)
        if nearest:
            RequestModel.assign_ambulance(user_bp.db, str(request_id), str(nearest['_id']), send_notification=True)
        req = RequestModel.find_by_id(user_bp.db, str(request_id))
        out = _serialize_request(req, user_bp.db)
        return jsonify({
            'message': 'Emergency request created successfully',
            'request_id': str(request_id),
            'request': out
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/my-request', methods=['GET'])
@jwt_required()
@role_required('user')
def my_request():
    """Get current active request (pending/assigned) with driver and ambulance details and live location for tracking."""
    try:
        user_id = get_jwt_identity()
        req = RequestModel.get_active_for_user(user_bp.db, user_id)
        out = _serialize_request(req, user_bp.db)
        if not out:
            return jsonify({'request': None, 'message': 'No active request'}), 200
        return jsonify({'request': out}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/cancel-request/<request_id>', methods=['POST'])
@jwt_required()
@role_required('user')
def cancel_request(request_id):
    """
    Cancel an active emergency request.
    - Only the requesting user can cancel their own request.
    - Cancellable only if status is 'pending' or 'assigned'.
    - Frees the ambulance back to 'active'.
    - Increments cancel_count; every 3rd cancellation adds 1 demerit point.
    """
    try:
        user_id = get_jwt_identity()

        # Validate ObjectId
        try:
            ObjectId(request_id)
        except Exception:
            return jsonify({'error': 'Invalid request ID'}), 400

        req = RequestModel.find_by_id(user_bp.db, request_id)
        if not req:
            return jsonify({'error': 'Request not found'}), 404

        # Only the owner can cancel
        if str(req.get('user_id')) != user_id:
            return jsonify({'error': 'Unauthorized'}), 403

        # Only cancellable if still active
        if req.get('status') not in ('pending', 'assigned'):
            return jsonify({'error': f"Cannot cancel a request with status '{req.get('status')}'"}), 400

        # Cancel the request
        RequestModel.cancel_request(user_bp.db, request_id)

        # Free the ambulance back to active (if one was assigned)
        if req.get('assigned_ambulance_id'):
            try:
                AmbulanceModel.update_status(user_bp.db, str(req['assigned_ambulance_id']), 'active')
            except Exception:
                pass  # Non-blocking

        # Increment cancel count and optionally award demerit
        new_count, demerit_added, updated_user = UserModel.increment_cancel_count(user_bp.db, user_id)

        # Build response
        remaining_before_demerit = 3 - (new_count % 3) if new_count % 3 != 0 else 3
        response = {
            'message': 'Request cancelled successfully.',
            'cancel_count': new_count,
            'remaining_before_demerit': remaining_before_demerit,
            'demerit_added': demerit_added,
        }
        if demerit_added and updated_user:
            response['demerit_points'] = updated_user.get('demerit_points', 0)
            response['is_blacklisted'] = updated_user.get('is_blacklisted', False)
            response['warning'] = (
                f"⚠️ You have been given a demerit point for excessive cancellations "
                f"({new_count} total). You now have {updated_user.get('demerit_points', 0)} demerit point(s)."
            )
        else:
            response['info'] = (
                f"You have cancelled {new_count} time(s). "
                f"{remaining_before_demerit} more cancellation(s) will result in a demerit point."
            )
        return jsonify(response), 200
    except Exception as e:
        return jsonify({'error': f'Failed to cancel request: {str(e)}'}), 500

