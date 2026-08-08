from flask import Blueprint, request, jsonify
import urllib.request
import urllib.error
import json

hospitals_bp = Blueprint('hospitals', __name__)

OVERPASS_MIRRORS = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]

def init_hospitals_routes(app):
    app.register_blueprint(hospitals_bp, url_prefix='/hospitals')


@hospitals_bp.route('/nearby', methods=['GET'])
def nearby_hospitals():
    """
    Proxy Overpass API requests through the backend so the browser IP
    is never rate-limited or blocked by Overpass.

    Query params: lat, lng, radius (metres, default 10000)
    """
    try:
        lat = request.args.get('lat')
        lng = request.args.get('lng')
        radius = request.args.get('radius', 10000)

        if not lat or not lng:
            return jsonify({'error': 'lat and lng are required'}), 400

        lat = float(lat)
        lng = float(lng)
        radius = int(radius)

        # Broad query: hospitals + clinics + doctors for Indian cities
        query = (
            f'[out:json][timeout:30];'
            f'nwr["amenity"~"^(hospital|clinic|doctors|health_centre|healthcare)$"]'
            f'(around:{radius},{lat},{lng});'
            f'out center;'
        )

        headers = {
            'User-Agent': 'RakshakEmergencySystem/1.0 (emergency-response-app)',
            'Content-Type': 'text/plain',
            'Accept': 'application/json',
        }

        last_error = None
        for mirror_url in OVERPASS_MIRRORS:
            try:
                req = urllib.request.Request(
                    mirror_url,
                    data=query.encode('utf-8'),
                    headers=headers,
                    method='POST'
                )
                with urllib.request.urlopen(req, timeout=20) as resp:
                    raw = resp.read().decode('utf-8')
                    data = json.loads(raw)

                elements = data.get('elements', [])
                if not elements:
                    continue  # try next mirror

                seen = set()
                out = []
                for el in elements:
                    center = el.get('center') or el
                    plat = center.get('lat')
                    plng = center.get('lon') or center.get('lng')
                    if not plat or not plng:
                        continue

                    tags = el.get('tags', {})
                    name = (
                        tags.get('name') or
                        tags.get('name:en') or
                        tags.get('official_name') or
                        tags.get('operator') or
                        'Hospital'
                    )

                    key = f"{round(plat,5)},{round(plng,5)}"
                    if key not in seen:
                        seen.add(key)
                        out.append({'name': name, 'lat': plat, 'lng': plng})

                if not out:
                    continue

                # Sort by distance, return top 15
                out.sort(key=lambda h: (h['lat'] - lat)**2 + (h['lng'] - lng)**2)
                return jsonify({'hospitals': out[:15], 'count': len(out[:15])}), 200

            except Exception as e:
                last_error = str(e)
                continue  # try next mirror

        # All mirrors failed
        return jsonify({
            'hospitals': [],
            'count': 0,
            'warning': f'No hospitals found from Overpass. Last error: {last_error}'
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
