#!/usr/bin/env python3
"""
Olivia in Outer Space - Planetary Data Ingestion Pipeline
Fetches physical & astronomical data from the Open Solar System Bodies API,
supplements it with toddler-friendly sensory hooks, and outputs both an SQLite
database and a normalized JSON file.
"""

import os
import sys
import json
import sqlite3
import argparse
import urllib.request
import urllib.error
from pathlib import Path

# Base Paths
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
DATA_DIR = PROJECT_ROOT / "data"
DEFAULT_SCHEMA_PATH = DATA_DIR / "schema.sql"
DEFAULT_DB_PATH = DATA_DIR / "celestial_bodies.db"
DEFAULT_JSON_PATH = DATA_DIR / "celestial_bodies.json"
API_BASE_URL = "https://api.le-systeme-solaire.net/rest/bodies"

# Curated toddler-friendly hooks, colors, and NASA reference IDs
TODDLER_HOOKS = {
    "earth": {
        "api_id": "terre",
        "english_name": "Earth",
        "toddler_hook": "Our wonderful home planet with oceans, trees, and puppies! Wave hello to Earth!",
        "primary_color_hex": "#4BA3E3",
        "real_image_path": "assets/images/real/earth.jpg",
        "thumbnail_image_path": "assets/images/thumbnails/earth_thumb.jpg",
        "nasa_asset_id": "PIA00114"
    },
    "moon": {
        "api_id": "lune",
        "english_name": "The Moon",
        "toddler_hook": "Earth's glowing nightlight! Give a big, sleepy space yawn with the Moon!",
        "primary_color_hex": "#E0E0E0",
        "real_image_path": "assets/images/real/moon.jpg",
        "thumbnail_image_path": "assets/images/thumbnails/moon_thumb.jpg",
        "nasa_asset_id": "PIA00405"
    },
    "mars": {
        "api_id": "mars",
        "english_name": "Mars",
        "toddler_hook": "The rusty red planet with rocky hills! Drive the Mars Rover vroom vroom!",
        "primary_color_hex": "#E2583E",
        "real_image_path": "assets/images/real/mars.jpg",
        "thumbnail_image_path": "assets/images/thumbnails/mars_thumb.jpg",
        "nasa_asset_id": "PIA02406"
    },
    "saturn": {
        "api_id": "saturne",
        "english_name": "Saturn",
        "toddler_hook": "The golden planet wearing giant glittery rings! Stand up and spin like the rings!",
        "primary_color_hex": "#E4C568",
        "real_image_path": "assets/images/real/saturn.jpg",
        "thumbnail_image_path": "assets/images/thumbnails/saturn_thumb.jpg",
        "nasa_asset_id": "PIA01486"
    },
    "jupiter": {
        "api_id": "jupiter",
        "english_name": "Jupiter",
        "toddler_hook": "The king of planets with a big swirling storm spot! Spin the great red spot!",
        "primary_color_hex": "#FFA726",
        "real_image_path": "assets/images/real/jupiter.jpg",
        "thumbnail_image_path": "assets/images/thumbnails/jupiter_thumb.jpg",
        "nasa_asset_id": "PIA02873"
    },
    "sun": {
        "api_id": "soleil",
        "english_name": "The Sun",
        "toddler_hook": "The gigantic bright warm star that lights up our day! Feel the warm sunshine!",
        "primary_color_hex": "#FCD34D",
        "real_image_path": "assets/images/real/sun.jpg",
        "thumbnail_image_path": "assets/images/thumbnails/sun_thumb.jpg",
        "nasa_asset_id": "PIA03149"
    },
    "venus": {
        "api_id": "venus",
        "english_name": "Venus",
        "toddler_hook": "The sparkling morning star wrapped in yellow clouds! Blow a gentle breeze!",
        "primary_color_hex": "#F59E0B",
        "real_image_path": "assets/images/real/venus.jpg",
        "thumbnail_image_path": "assets/images/thumbnails/venus_thumb.jpg",
        "nasa_asset_id": "PIA00104"
    },
    "mercury": {
        "api_id": "mercure",
        "english_name": "Mercury",
        "toddler_hook": "Fastest little speedster planet zooming around the Sun! Zoom zoom fast!",
        "primary_color_hex": "#94A3B8",
        "real_image_path": "assets/images/real/mercury.jpg",
        "thumbnail_image_path": "assets/images/thumbnails/mercury_thumb.jpg",
        "nasa_asset_id": "PIA11245"
    }
}

# Verified astronomical reference baseline (used as fallback when API key is not present)
ASTRONOMICAL_BASELINE = {
    "earth": {
        "english_name": "Earth",
        "body_type": "Planet",
        "parent_body": "Sun",
        "mean_radius_km": 6371.0,
        "mass_value": 5.972,
        "mass_exponent": 24,
        "gravity_m_s2": 9.807,
        "density_g_cm3": 5.514,
        "sideral_orbit_days": 365.256,
        "sideral_rotation_hours": 23.934,
        "mean_temp_celsius": 15.0,
        "number_of_moons": 1,
        "discovery_date": "Known to the ancients",
        "discovered_by": "Known to the ancients"
    },
    "moon": {
        "english_name": "The Moon",
        "body_type": "Moon",
        "parent_body": "Earth",
        "mean_radius_km": 1737.4,
        "mass_value": 7.342,
        "mass_exponent": 22,
        "gravity_m_s2": 1.62,
        "density_g_cm3": 3.344,
        "sideral_orbit_days": 27.322,
        "sideral_rotation_hours": 655.72,
        "mean_temp_celsius": -20.0,
        "number_of_moons": 0,
        "discovery_date": "Known to the ancients",
        "discovered_by": "Known to the ancients"
    },
    "mars": {
        "english_name": "Mars",
        "body_type": "Planet",
        "parent_body": "Sun",
        "mean_radius_km": 3389.5,
        "mass_value": 6.417,
        "mass_exponent": 23,
        "gravity_m_s2": 3.721,
        "density_g_cm3": 3.934,
        "sideral_orbit_days": 686.98,
        "sideral_rotation_hours": 24.623,
        "mean_temp_celsius": -63.0,
        "number_of_moons": 2,
        "discovery_date": "Known to the ancients",
        "discovered_by": "Known to the ancients"
    },
    "saturn": {
        "english_name": "Saturn",
        "body_type": "Planet",
        "parent_body": "Sun",
        "mean_radius_km": 58232.0,
        "mass_value": 5.683,
        "mass_exponent": 26,
        "gravity_m_s2": 10.44,
        "density_g_cm3": 0.687,
        "sideral_orbit_days": 10759.22,
        "sideral_rotation_hours": 10.656,
        "mean_temp_celsius": -140.0,
        "number_of_moons": 146,
        "discovery_date": "Known to the ancients",
        "discovered_by": "Known to the ancients"
    },
    "jupiter": {
        "english_name": "Jupiter",
        "body_type": "Planet",
        "parent_body": "Sun",
        "mean_radius_km": 69911.0,
        "mass_value": 1.898,
        "mass_exponent": 27,
        "gravity_m_s2": 24.79,
        "density_g_cm3": 1.326,
        "sideral_orbit_days": 4332.59,
        "sideral_rotation_hours": 9.925,
        "mean_temp_celsius": -110.0,
        "number_of_moons": 95,
        "discovery_date": "Known to the ancients",
        "discovered_by": "Known to the ancients"
    },
    "sun": {
        "english_name": "The Sun",
        "body_type": "Star",
        "parent_body": None,
        "mean_radius_km": 696340.0,
        "mass_value": 1.989,
        "mass_exponent": 30,
        "gravity_m_s2": 274.0,
        "density_g_cm3": 1.408,
        "sideral_orbit_days": 0.0,
        "sideral_rotation_hours": 609.12,
        "mean_temp_celsius": 5505.0,
        "number_of_moons": 0,
        "discovery_date": "Known to the ancients",
        "discovered_by": "Known to the ancients"
    },
    "venus": {
        "english_name": "Venus",
        "body_type": "Planet",
        "parent_body": "Sun",
        "mean_radius_km": 6051.8,
        "mass_value": 4.867,
        "mass_exponent": 24,
        "gravity_m_s2": 8.87,
        "density_g_cm3": 5.243,
        "sideral_orbit_days": 224.7,
        "sideral_rotation_hours": -5832.5,
        "mean_temp_celsius": 464.0,
        "number_of_moons": 0,
        "discovery_date": "Known to the ancients",
        "discovered_by": "Known to the ancients"
    },
    "mercury": {
        "english_name": "Mercury",
        "body_type": "Planet",
        "parent_body": "Sun",
        "mean_radius_km": 2439.7,
        "mass_value": 3.301,
        "mass_exponent": 23,
        "gravity_m_s2": 3.7,
        "density_g_cm3": 5.427,
        "sideral_orbit_days": 87.969,
        "sideral_rotation_hours": 1407.6,
        "mean_temp_celsius": 167.0,
        "number_of_moons": 0,
        "discovery_date": "Known to the ancients",
        "discovered_by": "Known to the ancients"
    }
}

def fetch_body_from_api(api_id: str, api_key: str = None):
    """Fetches a single body from the Open Solar System Bodies API."""
    url = f"{API_BASE_URL}/{api_id}"
    headers = {"User-Agent": "OliviaSpaceApp/1.0"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=12) as response:
        return json.loads(response.read().decode("utf-8"))

def normalize_api_record(api_data: dict, body_slug: str, hook_info: dict) -> dict:
    """Normalizes raw API response into the clean celestial_bodies schema."""
    mass = api_data.get("mass") or {}
    mass_val = mass.get("massValue")
    mass_exp = mass.get("massExponent")

    around = api_data.get("aroundPlanet") or {}
    parent = around.get("planet") if isinstance(around, dict) else None

    # avgTemp in API is in Kelvin -> convert to Celsius: °C = K - 273.15
    avg_temp_k = api_data.get("avgTemp")
    temp_c = round(avg_temp_k - 273.15, 1) if avg_temp_k is not None else None

    moons_data = api_data.get("moons")
    moons_count = len(moons_data) if isinstance(moons_data, list) else 0

    return {
        "id": body_slug,
        "english_name": api_data.get("englishName") or hook_info.get("english_name"),
        "body_type": api_data.get("bodyType", "Planet"),
        "parent_body": parent or ("Sun" if api_data.get("bodyType") == "Planet" else None),
        "mean_radius_km": api_data.get("meanRadius"),
        "mass_value": mass_val,
        "mass_exponent": mass_exp,
        "gravity_m_s2": api_data.get("gravity"),
        "density_g_cm3": api_data.get("density"),
        "sideral_orbit_days": api_data.get("sideralOrbit"),
        "sideral_rotation_hours": api_data.get("sideralRotation"),
        "mean_temp_celsius": temp_c,
        "number_of_moons": moons_count,
        "discovery_date": api_data.get("discoveryDate") or "Known to ancients",
        "discovered_by": api_data.get("discoveredBy") or "Known to ancients",
        "toddler_hook": hook_info.get("toddler_hook"),
        "primary_color_hex": hook_info.get("primary_color_hex"),
        "real_image_path": hook_info.get("real_image_path"),
        "thumbnail_image_path": hook_info.get("thumbnail_image_path"),
        "nasa_asset_id": hook_info.get("nasa_asset_id")
    }

def init_sqlite_database(db_path: Path, schema_path: Path):
    """Executes schema.sql to ensure celestial_bodies table exists."""
    db_path.parent.mkdir(parents=True, exist_ok=True)
    schema_sql = schema_path.read_text(encoding="utf-8")
    
    conn = sqlite3.connect(db_path)
    with conn:
        conn.executescript(schema_sql)
    return conn

def insert_records_to_sqlite(conn: sqlite3.Connection, records: list):
    """Inserts or replaces celestial bodies into the SQLite database."""
    query = """
    INSERT OR REPLACE INTO celestial_bodies (
        id, english_name, body_type, parent_body, mean_radius_km,
        mass_value, mass_exponent, gravity_m_s2, density_g_cm3,
        sideral_orbit_days, sideral_rotation_hours, mean_temp_celsius,
        number_of_moons, discovery_date, discovered_by, toddler_hook,
        primary_color_hex, real_image_path, thumbnail_image_path, nasa_asset_id
    ) VALUES (
        :id, :english_name, :body_type, :parent_body, :mean_radius_km,
        :mass_value, :mass_exponent, :gravity_m_s2, :density_g_cm3,
        :sideral_orbit_days, :sideral_rotation_hours, :mean_temp_celsius,
        :number_of_moons, :discovery_date, :discovered_by, :toddler_hook,
        :primary_color_hex, :real_image_path, :thumbnail_image_path, :nasa_asset_id
    )
    """
    with conn:
        conn.executemany(query, records)

def run_ingestion(api_key: str = None, force_offline: bool = False, db_path: Path = DEFAULT_DB_PATH, json_path: Path = DEFAULT_JSON_PATH):
    print("==========================================================")
    print("  Olivia in Outer Space - Planetary Data Ingestion Script")
    print("==========================================================")

    # 1. Initialize SQLite Database with schema.sql
    print(f"\n[1/3] Initializing SQLite database at: {db_path}")
    conn = init_sqlite_database(db_path, DEFAULT_SCHEMA_PATH)

    # 2. Ingest Data for all celestial bodies
    records = []
    print("\n[2/3] Fetching and enriching planetary data...")

    for slug, hook_info in TODDLER_HOOKS.items():
        api_id = hook_info["api_id"]
        record = None

        if not force_offline:
            try:
                raw_data = fetch_body_from_api(api_id, api_key=api_key)
                record = normalize_api_record(raw_data, slug, hook_info)
                print(f"  [API] Fetched {record['english_name']} ({slug}) from OpenData API")
            except urllib.error.HTTPError as e:
                if e.code == 401 and slug == list(TODDLER_HOOKS.keys())[0]:
                    print("  [!] Notice: Open Solar System Bodies API requires a free Bearer key.")
                    print("      Using curated astronomical physical baseline values for ingestion.")
            except Exception as e:
                pass

        if not record:
            # Fallback to astronomical physical baseline with toddler hooks
            base = ASTRONOMICAL_BASELINE[slug]
            record = {
                "id": slug,
                "english_name": base["english_name"],
                "body_type": base["body_type"],
                "parent_body": base["parent_body"],
                "mean_radius_km": base["mean_radius_km"],
                "mass_value": base["mass_value"],
                "mass_exponent": base["mass_exponent"],
                "gravity_m_s2": base["gravity_m_s2"],
                "density_g_cm3": base["density_g_cm3"],
                "sideral_orbit_days": base["sideral_orbit_days"],
                "sideral_rotation_hours": base["sideral_rotation_hours"],
                "mean_temp_celsius": base["mean_temp_celsius"],
                "number_of_moons": base["number_of_moons"],
                "discovery_date": base["discovery_date"],
                "discovered_by": base["discovered_by"],
                "toddler_hook": hook_info["toddler_hook"],
                "primary_color_hex": hook_info["primary_color_hex"],
                "real_image_path": hook_info["real_image_path"],
                "thumbnail_image_path": hook_info["thumbnail_image_path"],
                "nasa_asset_id": hook_info["nasa_asset_id"]
            }
            print(f"  [Baseline] Ingested {record['english_name']} ({slug}) with toddler hooks")

        records.append(record)

    # 3. Store in SQLite Database
    insert_records_to_sqlite(conn, records)
    print(f"\n[3/3] Successfully inserted {len(records)} records into {db_path.name}")

    # 4. Output Normalized JSON file
    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(records, indent=2), encoding="utf-8")
    print(f"  [+] Saved normalized JSON file: {json_path}")

    # Verification query
    cursor = conn.cursor()
    cursor.execute("SELECT id, english_name, body_type, mean_radius_km, gravity_m_s2, number_of_moons FROM celestial_bodies")
    rows = cursor.fetchall()
    print("\n--- Verified SQLite Table Records ---")
    for r in rows:
        print(f"  * {r[0]:<8} | {r[1]:<12} | Type: {r[2]:<7} | Radius: {r[3]:>8.1f} km | Grav: {r[4]:>5.2f} m/s^2 | Moons: {r[5]}")

    conn.close()
    return records

def main():
    parser = argparse.ArgumentParser(description="Ingest planetary data into SQLite and JSON.")
    parser.add_argument("--api-key", default=os.environ.get("SOLAR_SYSTEM_API_KEY"), help="Optional API key for Open Solar System Bodies API")
    parser.add_argument("--offline", action="store_true", help="Force offline baseline mode")
    parser.add_argument("--db-path", default=DEFAULT_DB_PATH, type=Path, help="Target SQLite database path")
    parser.add_argument("--json-path", default=DEFAULT_JSON_PATH, type=Path, help="Target JSON output path")
    args = parser.parse_args()

    run_ingestion(
        api_key=args.api_key,
        force_offline=args.offline,
        db_path=args.db_path,
        json_path=args.json_path
    )

if __name__ == "__main__":
    main()
