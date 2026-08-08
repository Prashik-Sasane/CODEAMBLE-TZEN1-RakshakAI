import math

def haversine_distance(lat1, lng1, lat2, lng2):
    lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return c * 6371  # km

def ambulances_sorted_by_distance(ambulances, target_lat, target_lng):
    """Return list of (distance, ambulance) sorted by distance ascending."""
    out = []
    for amb in ambulances:
        loc = amb.get('current_location')
        if not loc:
            continue
        d = haversine_distance(target_lat, target_lng, loc['lat'], loc['lng'])
        out.append((d, amb))
    out.sort(key=lambda x: x[0])
    return out

def find_nearest_ambulance(ambulances, target_lat, target_lng, prefer_active=True, requested_type=None):
    """
    Returns the nearest ACTIVE ambulance only.
    Inactive ambulances are NEVER assigned regardless of prefer_active flag.
    ambulances: list of docs with current_location and status.
    requested_type: 'any', 'basic_life', 'advance_life', 'icu_life' - filters by ambulance_type.
    Returns None if no active ambulance is available.
    """
    sorted_list = ambulances_sorted_by_distance(ambulances, target_lat, target_lng)
    if not sorted_list:
        return None

    # ── HARD FILTER: only consider active ambulances ──────────
    active_only = [(d, amb) for d, amb in sorted_list if amb.get('status') == 'active']
    if not active_only:
        return None  # No active ambulance available — do NOT assign an inactive one

    # Filter by requested ambulance type (within active pool)
    if requested_type and requested_type != 'any':
        type_matched = [(d, amb) for d, amb in active_only if amb.get('ambulance_type') == requested_type]
        if type_matched:
            active_only = type_matched
        # If no type match, fall back to any active ambulance

    # Return the nearest active ambulance
    return active_only[0][1]
