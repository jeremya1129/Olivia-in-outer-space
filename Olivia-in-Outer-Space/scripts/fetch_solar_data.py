#!/usr/bin/env python3
"""
Olivia in Outer Space - Solar System Planetary Data Fetcher & Pipeline
Fetches celestial body data from the Open Solar System Bodies API,
normalizes attributes, enriches with toddler sensory hooks, and writes
to SQLite database (data/solar_system.db) and JSON (data/solar_system.json).
"""

import os
import sys
import json
import sqlite3
import argparse
import urllib.request
import urllib.error
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
DATA_DIR = PROJECT_ROOT / "data"
SCHEMA_PATH = DATA_DIR / "schema.sql"
DEFAULT_DB_PATH = DATA_DIR / "solar_system.db"
DEFAULT_JSON_PATH = DATA_DIR / "solar_system.json"
API_BASE_URL = "https://api.le-systeme-solaire.net/rest/bodies"

# Target Celestial Bodies Definition
CELESTIAL_TARGETS = [
    # Star
    {
        "id": "sun",
        "api_id": "soleil",
        "english_name": "Sun",
        "body_type": "Star",
        "category": "Star",
        "toddler_hook": "Big, bright, and super warm!",
        "primary_color_hex": "#FFD700",
        "nasa_asset_id": "PIA03149"
    },
    # Terrestrial Planets
    {
        "id": "mercury",
        "api_id": "mercure",
        "english_name": "Mercury",
        "body_type": "Planet",
        "category": "Terrestrial Planet",
        "toddler_hook": "Fastest little runner near the sun!",
        "primary_color_hex": "#A0A0A0",
        "nasa_asset_id": "PIA11245"
    },
    {
        "id": "venus",
        "api_id": "venus",
        "english_name": "Venus",
        "body_type": "Planet",
        "category": "Terrestrial Planet",
        "toddler_hook": "Super warm and cloudy yellow!",
        "primary_color_hex": "#F59E0B",
        "nasa_asset_id": "PIA00104"
    },
    {
        "id": "earth",
        "api_id": "terre",
        "english_name": "Earth",
        "body_type": "Planet",
        "category": "Terrestrial Planet",
        "toddler_hook": "Our home planet with blue oceans and green land!",
        "primary_color_hex": "#2B82C9",
        "nasa_asset_id": "PIA00114"
    },
    {
        "id": "mars",
        "api_id": "mars",
        "english_name": "Mars",
        "body_type": "Planet",
        "category": "Terrestrial Planet",
        "toddler_hook": "The dusty red planet with big rocks!",
        "primary_color_hex": "#D14024",
        "nasa_asset_id": "PIA02406"
    },
    # Giant Planets
    {
        "id": "jupiter",
        "api_id": "jupiter",
        "english_name": "Jupiter",
        "body_type": "Planet",
        "category": "Giant Planet",
        "toddler_hook": "The giant planet with a giant spinning storm!",
        "primary_color_hex": "#FFA726",
        "nasa_asset_id": "PIA02873"
    },
    {
        "id": "saturn",
        "api_id": "saturne",
        "english_name": "Saturn",
        "body_type": "Planet",
        "category": "Giant Planet",
        "toddler_hook": "The golden planet wearing giant hula hoops!",
        "primary_color_hex": "#E2BF7D",
        "nasa_asset_id": "PIA01486"
    },
    {
        "id": "uranus",
        "api_id": "uranus",
        "english_name": "Uranus",
        "body_type": "Planet",
        "category": "Giant Planet",
        "toddler_hook": "The chilly light-blue ice ball rolling on its side!",
        "primary_color_hex": "#72D7EE",
        "nasa_asset_id": "PIA18182"
    },
    {
        "id": "neptune",
        "api_id": "neptune",
        "english_name": "Neptune",
        "body_type": "Planet",
        "category": "Giant Planet",
        "toddler_hook": "Deep blue and windy ice world far, far away!",
        "primary_color_hex": "#274687",
        "nasa_asset_id": "PIA01492"
    },
    # Key Moons
    {
        "id": "moon",
        "api_id": "lune",
        "english_name": "The Moon",
        "body_type": "Moon",
        "category": "Key Moon",
        "toddler_hook": "Earth's glowing nightlight!",
        "primary_color_hex": "#E0E0E0",
        "nasa_asset_id": "PIA00405"
    },
    {
        "id": "phobos",
        "api_id": "phobos",
        "english_name": "Phobos",
        "body_type": "Moon",
        "category": "Key Moon",
        "toddler_hook": "A speedy potato-shaped moon tumbling around Mars!",
        "primary_color_hex": "#8D6E63",
        "nasa_asset_id": "PIA10368"
    },
    {
        "id": "deimos",
        "api_id": "deimos",
        "english_name": "Deimos",
        "body_type": "Moon",
        "category": "Key Moon",
        "toddler_hook": "A tiny floating space pebble dancing high above Mars!",
        "primary_color_hex": "#A1887F",
        "nasa_asset_id": "PIA11826"
    },
    {
        "id": "europa",
        "api_id": "europe",
        "english_name": "Europa",
        "body_type": "Moon",
        "category": "Key Moon",
        "toddler_hook": "A shiny icy moon with hidden splashy oceans underneath!",
        "primary_color_hex": "#B0BEC5",
        "nasa_asset_id": "PIA00502"
    },
    {
        "id": "ganymede",
        "api_id": "ganymede",
        "english_name": "Ganymede",
        "body_type": "Moon",
        "category": "Key Moon",
        "toddler_hook": "The giant king of moons, even bigger than Mercury!",
        "primary_color_hex": "#78909C",
        "nasa_asset_id": "PIA00583"
    },
    {
        "id": "callisto",
        "api_id": "callisto",
        "english_name": "Callisto",
        "body_type": "Moon",
        "category": "Key Moon",
        "toddler_hook": "An ancient crater-covered moon with sparkly spots!",
        "primary_color_hex": "#546E7A",
        "nasa_asset_id": "PIA03456"
    },
    {
        "id": "titan",
        "api_id": "titan",
        "english_name": "Titan",
        "body_type": "Moon",
        "category": "Key Moon",
        "toddler_hook": "A giant cozy moon with golden clouds and bubbly lakes!",
        "primary_color_hex": "#FFB74D",
        "nasa_asset_id": "PIA14680"
    },
    {
        "id": "enceladus",
        "api_id": "encelade",
        "english_name": "Enceladus",
        "body_type": "Moon",
        "category": "Key Moon",
        "toddler_hook": "A sparkling snowball moon that shoots geyser water fountains!",
        "primary_color_hex": "#ECEFF1",
        "nasa_asset_id": "PIA17202"
    },
    {
        "id": "triton",
        "api_id": "triton",
        "english_name": "Triton",
        "body_type": "Moon",
        "category": "Key Moon",
        "toddler_hook": "A freezing blue moon spinning backwards around Neptune!",
        "primary_color_hex": "#80DEEA",
        "nasa_asset_id": "PIA00317"
    },
    # Dwarf Planets
    {
        "id": "pluto",
        "api_id": "pluton",
        "english_name": "Pluto",
        "body_type": "Dwarf Planet",
        "category": "Dwarf Planet",
        "toddler_hook": "A tiny frozen world at the edge of space!",
        "primary_color_hex": "#C4A482",
        "nasa_asset_id": "PIA19952"
    },
    {
        "id": "ceres",
        "api_id": "ceres",
        "english_name": "Ceres",
        "body_type": "Dwarf Planet",
        "category": "Dwarf Planet",
        "toddler_hook": "A round rocky queen of the asteroids with bright glowing spots!",
        "primary_color_hex": "#9E9E9E",
        "nasa_asset_id": "PIA19547"
    }
]

# Verified astronomical baselines for complete fallback & validation
ASTRONOMICAL_BASELINES = {
    "sun": {
        "english_name": "Sun",
        "body_type": "Star",
        "parent_body": "Milky Way",
        "mean_radius_km": 696340.0,
        "mass_value": 1.989,
        "mass_exponent": 30,
        "gravity_m_s2": 274.0,
        "density_g_cm3": 1.408,
        "sideral_orbit_days": 84000000000.0,
        "sideral_rotation_hours": 609.12,
        "mean_temp_celsius": 5505.0,
        "number_of_moons": 8,
        "discovery_date": "Known to ancients",
        "discovered_by": "Known to ancients"
    },
    "mercury": {
        "english_name": "Mercury",
        "body_type": "Planet",
        "parent_body": "Sun",
        "mean_radius_km": 2439.7,
        "mass_value": 3.301,
        "mass_exponent": 23,
        "gravity_m_s2": 3.70,
        "density_g_cm3": 5.427,
        "sideral_orbit_days": 87.969,
        "sideral_rotation_hours": 1407.6,
        "mean_temp_celsius": 167.0,
        "number_of_moons": 0,
        "discovery_date": "Known to ancients",
        "discovered_by": "Known to ancients"
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
        "sideral_orbit_days": 224.701,
        "sideral_rotation_hours": -5832.5,
        "mean_temp_celsius": 464.0,
        "number_of_moons": 0,
        "discovery_date": "Known to ancients",
        "discovered_by": "Known to ancients"
    },
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
        "discovery_date": "Known to ancients",
        "discovered_by": "Known to ancients"
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
        "discovery_date": "Known to ancients",
        "discovered_by": "Known to ancients"
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
        "discovery_date": "Known to ancients",
        "discovered_by": "Known to ancients"
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
        "discovery_date": "Known to ancients",
        "discovered_by": "Known to ancients"
    },
    "uranus": {
        "english_name": "Uranus",
        "body_type": "Planet",
        "parent_body": "Sun",
        "mean_radius_km": 25362.0,
        "mass_value": 8.681,
        "mass_exponent": 25,
        "gravity_m_s2": 8.87,
        "density_g_cm3": 1.271,
        "sideral_orbit_days": 30685.4,
        "sideral_rotation_hours": -17.24,
        "mean_temp_celsius": -195.0,
        "number_of_moons": 28,
        "discovery_date": "13/03/1781",
        "discovered_by": "William Herschel"
    },
    "neptune": {
        "english_name": "Neptune",
        "body_type": "Planet",
        "parent_body": "Sun",
        "mean_radius_km": 24622.0,
        "mass_value": 1.024,
        "mass_exponent": 26,
        "gravity_m_s2": 11.15,
        "density_g_cm3": 1.638,
        "sideral_orbit_days": 60189.0,
        "sideral_rotation_hours": 16.11,
        "mean_temp_celsius": -200.0,
        "number_of_moons": 16,
        "discovery_date": "23/09/1846",
        "discovered_by": "Urbain Le Verrier & Johann Galle"
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
        "discovery_date": "Known to ancients",
        "discovered_by": "Known to ancients"
    },
    "phobos": {
        "english_name": "Phobos",
        "body_type": "Moon",
        "parent_body": "Mars",
        "mean_radius_km": 11.267,
        "mass_value": 1.065,
        "mass_exponent": 16,
        "gravity_m_s2": 0.0057,
        "density_g_cm3": 1.876,
        "sideral_orbit_days": 0.3189,
        "sideral_rotation_hours": 7.65,
        "mean_temp_celsius": -40.0,
        "number_of_moons": 0,
        "discovery_date": "18/08/1877",
        "discovered_by": "Asaph Hall"
    },
    "deimos": {
        "english_name": "Deimos",
        "body_type": "Moon",
        "parent_body": "Mars",
        "mean_radius_km": 6.2,
        "mass_value": 1.476,
        "mass_exponent": 15,
        "gravity_m_s2": 0.003,
        "density_g_cm3": 1.471,
        "sideral_orbit_days": 1.263,
        "sideral_rotation_hours": 30.31,
        "mean_temp_celsius": -40.0,
        "number_of_moons": 0,
        "discovery_date": "12/08/1877",
        "discovered_by": "Asaph Hall"
    },
    "europa": {
        "english_name": "Europa",
        "body_type": "Moon",
        "parent_body": "Jupiter",
        "mean_radius_km": 1560.8,
        "mass_value": 4.800,
        "mass_exponent": 22,
        "gravity_m_s2": 1.315,
        "density_g_cm3": 3.013,
        "sideral_orbit_days": 3.551,
        "sideral_rotation_hours": 85.23,
        "mean_temp_celsius": -171.0,
        "number_of_moons": 0,
        "discovery_date": "08/01/1610",
        "discovered_by": "Galileo Galilei"
    },
    "ganymede": {
        "english_name": "Ganymede",
        "body_type": "Moon",
        "parent_body": "Jupiter",
        "mean_radius_km": 2634.1,
        "mass_value": 1.482,
        "mass_exponent": 23,
        "gravity_m_s2": 1.428,
        "density_g_cm3": 1.936,
        "sideral_orbit_days": 7.155,
        "sideral_rotation_hours": 171.7,
        "mean_temp_celsius": -163.0,
        "number_of_moons": 0,
        "discovery_date": "07/01/1610",
        "discovered_by": "Galileo Galilei"
    },
    "callisto": {
        "english_name": "Callisto",
        "body_type": "Moon",
        "parent_body": "Jupiter",
        "mean_radius_km": 2410.3,
        "mass_value": 1.076,
        "mass_exponent": 23,
        "gravity_m_s2": 1.235,
        "density_g_cm3": 1.834,
        "sideral_orbit_days": 16.689,
        "sideral_rotation_hours": 400.5,
        "mean_temp_celsius": -139.0,
        "number_of_moons": 0,
        "discovery_date": "07/01/1610",
        "discovered_by": "Galileo Galilei"
    },
    "titan": {
        "english_name": "Titan",
        "body_type": "Moon",
        "parent_body": "Saturn",
        "mean_radius_km": 2574.7,
        "mass_value": 1.345,
        "mass_exponent": 23,
        "gravity_m_s2": 1.352,
        "density_g_cm3": 1.880,
        "sideral_orbit_days": 15.945,
        "sideral_rotation_hours": 382.69,
        "mean_temp_celsius": -179.0,
        "number_of_moons": 0,
        "discovery_date": "25/03/1655",
        "discovered_by": "Christiaan Huygens"
    },
    "enceladus": {
        "english_name": "Enceladus",
        "body_type": "Moon",
        "parent_body": "Saturn",
        "mean_radius_km": 252.1,
        "mass_value": 1.080,
        "mass_exponent": 20,
        "gravity_m_s2": 0.113,
        "density_g_cm3": 1.609,
        "sideral_orbit_days": 1.370,
        "sideral_rotation_hours": 32.89,
        "mean_temp_celsius": -198.0,
        "number_of_moons": 0,
        "discovery_date": "28/08/1789",
        "discovered_by": "William Herschel"
    },
    "triton": {
        "english_name": "Triton",
        "body_type": "Moon",
        "parent_body": "Neptune",
        "mean_radius_km": 1353.4,
        "mass_value": 2.140,
        "mass_exponent": 22,
        "gravity_m_s2": 0.779,
        "density_g_cm3": 2.061,
        "sideral_orbit_days": -5.877,
        "sideral_rotation_hours": -141.05,
        "mean_temp_celsius": -235.0,
        "number_of_moons": 0,
        "discovery_date": "10/10/1846",
        "discovered_by": "William Lassell"
    },
    "pluto": {
        "english_name": "Pluto",
        "body_type": "Dwarf Planet",
        "parent_body": "Sun",
        "mean_radius_km": 1188.3,
        "mass_value": 1.303,
        "mass_exponent": 22,
        "gravity_m_s2": 0.62,
        "density_g_cm3": 1.854,
        "sideral_orbit_days": 90560.0,
        "sideral_rotation_hours": -153.29,
        "mean_temp_celsius": -229.0,
        "number_of_moons": 5,
        "discovery_date": "18/02/1930",
        "discovered_by": "Clyde Tombaugh"
    },
    "ceres": {
        "english_name": "Ceres",
        "body_type": "Dwarf Planet",
        "parent_body": "Sun",
        "mean_radius_km": 469.7,
        "mass_value": 9.393,
        "mass_exponent": 20,
        "gravity_m_s2": 0.28,
        "density_g_cm3": 2.162,
        "sideral_orbit_days": 1681.63,
        "sideral_rotation_hours": 9.074,
        "mean_temp_celsius": -106.0,
        "number_of_moons": 0,
        "discovery_date": "01/01/1801",
        "discovered_by": "Giuseppe Piazzi"
    }
}

def fetch_body_api(api_id: str, api_key: str = None) -> dict:
    """Queries the Open Solar System Bodies API for a specific celestial body."""
    url = f"{API_BASE_URL}/{api_id}"
    headers = {"User-Agent": "OliviaSpaceSolarFetcher/1.0"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))

def normalize_solar_body(api_data: dict, target: dict) -> dict:
    """Normalizes raw API body data using required extraction and mapping rules."""
    slug = target["id"]
    base = ASTRONOMICAL_BASELINES.get(slug, {})

    # Extract mass components: massValue and massExponent
    mass = api_data.get("mass") or {}
    mass_val = mass.get("massValue")
    mass_exp = mass.get("massExponent")
    if mass_val is None:
        mass_val = base.get("mass_value")
    if mass_exp is None:
        mass_exp = base.get("mass_exponent")

    # Determine parent_body from aroundPlanet.planet
    around = api_data.get("aroundPlanet")
    parent_body = None
    if isinstance(around, dict):
        parent_body = around.get("planet")
    elif isinstance(around, str):
        parent_body = around

    if not parent_body:
        if target["body_type"] in ("Planet", "Dwarf Planet"):
            parent_body = "Sun"
        elif target["body_type"] == "Star":
            parent_body = "Milky Way"
        else:
            parent_body = base.get("parent_body", "Sun")

    # Convert avgTemp Kelvin to Celsius: K - 273.15
    avg_temp_k = api_data.get("avgTemp")
    if avg_temp_k is not None:
        mean_temp_c = round(avg_temp_k - 273.15, 2)
    else:
        mean_temp_c = base.get("mean_temp_celsius")

    # Count moons
    moons_arr = api_data.get("moons")
    if isinstance(moons_arr, list):
        number_of_moons = len(moons_arr)
    else:
        number_of_moons = base.get("number_of_moons", 0)

    # Physical parameters with baseline fallbacks for guaranteed non-null values
    mean_radius = api_data.get("meanRadius")
    if mean_radius is None:
        mean_radius = base.get("mean_radius_km")

    gravity = api_data.get("gravity")
    if gravity is None:
        gravity = base.get("gravity_m_s2")

    density = api_data.get("density")
    if density is None:
        density = base.get("density_g_cm3")

    sideral_orbit = api_data.get("sideralOrbit")
    if sideral_orbit is None:
        sideral_orbit = base.get("sideral_orbit_days")

    sideral_rotation = api_data.get("sideralRotation")
    if sideral_rotation is None:
        sideral_rotation = base.get("sideral_rotation_hours")

    discovery_date = api_data.get("discoveryDate") or base.get("discovery_date", "Known to ancients")
    discovered_by = api_data.get("discoveredBy") or base.get("discovered_by", "Known to ancients")
    english_name = api_data.get("englishName") or target["english_name"]

    return {
        "id": slug,
        "english_name": english_name,
        "body_type": target["body_type"],
        "parent_body": parent_body,
        "mean_radius_km": float(mean_radius),
        "mass_value": float(mass_val),
        "mass_exponent": int(mass_exp),
        "gravity_m_s2": float(gravity),
        "density_g_cm3": float(density),
        "sideral_orbit_days": float(sideral_orbit),
        "sideral_rotation_hours": float(sideral_rotation),
        "mean_temp_celsius": float(mean_temp_c),
        "number_of_moons": int(number_of_moons),
        "discovery_date": str(discovery_date),
        "discovered_by": str(discovered_by),
        "toddler_hook": target["toddler_hook"],
        "primary_color_hex": target["primary_color_hex"],
        "real_image_path": f"assets/images/real/{slug}.jpg",
        "thumbnail_image_path": f"assets/images/thumbnails/{slug}_thumb.jpg",
        "nasa_asset_id": target["nasa_asset_id"]
    }

def get_baseline_record(target: dict) -> dict:
    """Returns guaranteed non-null baseline record for target body."""
    slug = target["id"]
    base = ASTRONOMICAL_BASELINES[slug]
    return {
        "id": slug,
        "english_name": base["english_name"],
        "body_type": target["body_type"],
        "parent_body": base["parent_body"],
        "mean_radius_km": float(base["mean_radius_km"]),
        "mass_value": float(base["mass_value"]),
        "mass_exponent": int(base["mass_exponent"]),
        "gravity_m_s2": float(base["gravity_m_s2"]),
        "density_g_cm3": float(base["density_g_cm3"]),
        "sideral_orbit_days": float(base["sideral_orbit_days"]),
        "sideral_rotation_hours": float(base["sideral_rotation_hours"]),
        "mean_temp_celsius": float(base["mean_temp_celsius"]),
        "number_of_moons": int(base["number_of_moons"]),
        "discovery_date": str(base["discovery_date"]),
        "discovered_by": str(base["discovered_by"]),
        "toddler_hook": target["toddler_hook"],
        "primary_color_hex": target["primary_color_hex"],
        "real_image_path": f"assets/images/real/{slug}.jpg",
        "thumbnail_image_path": f"assets/images/thumbnails/{slug}_thumb.jpg",
        "nasa_asset_id": target["nasa_asset_id"]
    }

def init_db(db_path: Path, schema_path: Path):
    """Initializes the SQLite database with the schema."""
    db_path.parent.mkdir(parents=True, exist_ok=True)
    if not schema_path.exists():
        raise FileNotFoundError(f"Schema file not found at: {schema_path}")

    schema_sql = schema_path.read_text(encoding="utf-8")
    conn = sqlite3.connect(db_path)
    with conn:
        conn.executescript(schema_sql)
    return conn

def store_records_in_db(conn: sqlite3.Connection, records: list):
    """Inserts or replaces all normalized records into celestial_bodies table."""
    insert_sql = """
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
        conn.executemany(insert_sql, records)

def verify_non_nulls(records: list, db_path: Path):
    """Rigorous verification that all fields in all records and SQLite table are non-null."""
    columns = [
        "id", "english_name", "body_type", "parent_body", "mean_radius_km",
        "mass_value", "mass_exponent", "gravity_m_s2", "density_g_cm3",
        "sideral_orbit_days", "sideral_rotation_hours", "mean_temp_celsius",
        "number_of_moons", "discovery_date", "discovered_by", "toddler_hook",
        "primary_color_hex", "real_image_path", "thumbnail_image_path", "nasa_asset_id"
    ]

    # Verify JSON records
    for rec in records:
        for col in columns:
            if rec.get(col) is None:
                raise ValueError(f"Record '{rec.get('id')}' has null value for column '{col}'")

    # Verify SQLite DB
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM celestial_bodies")
    total_db_count = cursor.fetchone()[0]

    null_checks = " OR ".join([f"{col} IS NULL" for col in columns])
    cursor.execute(f"SELECT COUNT(*) FROM celestial_bodies WHERE {null_checks}")
    null_count = cursor.fetchone()[0]
    conn.close()

    if null_count > 0:
        raise ValueError(f"Database contains {null_count} rows with null values!")

    return total_db_count, null_count

def run():
    parser = argparse.ArgumentParser(description="Fetch and normalize solar system planetary data.")
    parser.add_argument("--api-key", default=os.environ.get("SOLAR_SYSTEM_API_KEY"), help="API Bearer Key for Open Solar System Bodies")
    parser.add_argument("--offline", action="store_true", help="Force offline baseline mode")
    parser.add_argument("--db-path", default=DEFAULT_DB_PATH, type=Path, help="Target SQLite DB path")
    parser.add_argument("--json-path", default=DEFAULT_JSON_PATH, type=Path, help="Target JSON path")
    args = parser.parse_args()

    print("======================================================================")
    print("  Olivia in Outer Space - Solar System Data Fetcher & Ingestion")
    print("======================================================================")

    # Step 1: Initialize Database
    print(f"\n[1/4] Initializing database at: {args.db_path} via {SCHEMA_PATH.name}")
    conn = init_db(args.db_path, SCHEMA_PATH)

    # Step 2: Fetch and Normalize
    print("\n[2/4] Fetching and normalizing primary celestial bodies (20 bodies)...")
    normalized_records = []
    api_available = True

    for target in CELESTIAL_TARGETS:
        slug = target["id"]
        api_id = target["api_id"]
        record = None

        if not args.offline and api_available:
            try:
                raw_data = fetch_body_api(api_id, api_key=args.api_key)
                record = normalize_solar_body(raw_data, target)
                print(f"  [API] Fetched {record['english_name']} ({slug}) [{target['category']}]")
            except urllib.error.HTTPError as e:
                if e.code == 401 and api_available:
                    print("  [!] API requires an API key (HTTP 401). Falling back seamlessly to curated baseline.")
                    api_available = False
            except Exception as e:
                pass

        if not record:
            record = get_baseline_record(target)
            print(f"  [Baseline] Loaded {record['english_name']} ({slug}) [{target['category']}]")

        normalized_records.append(record)

    # Step 3: Insert into SQLite
    print(f"\n[3/4] Inserting {len(normalized_records)} normalized records into SQLite...")
    store_records_in_db(conn, normalized_records)
    conn.close()

    # Step 4: Export to JSON
    print(f"\n[4/4] Exporting to UTF-8 indented JSON at: {args.json_path}")
    args.json_path.parent.mkdir(parents=True, exist_ok=True)
    args.json_path.write_text(json.dumps(normalized_records, indent=2, ensure_ascii=False), encoding="utf-8")

    # Step 5: Verification
    total_db, null_count = verify_non_nulls(normalized_records, args.db_path)
    print("\n======================================================================")
    print(f"  Verification Complete: {total_db} records stored, {null_count} nulls detected.")
    print("======================================================================")

    conn = sqlite3.connect(args.db_path)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, english_name, body_type, parent_body, mean_radius_km, gravity_m_s2, mean_temp_celsius, number_of_moons, primary_color_hex
        FROM celestial_bodies
        ORDER BY 
            CASE body_type 
                WHEN 'Star' THEN 1 
                WHEN 'Planet' THEN 2 
                WHEN 'Moon' THEN 3 
                ELSE 4 
            END,
            mean_radius_km DESC
    """)
    rows = cursor.fetchall()
    print("\n--- Summary of Populated Celestial Bodies ---")
    print(f"{'ID':<11} | {'English Name':<14} | {'Type':<12} | {'Parent':<10} | {'Radius (km)':>11} | {'Grav (m/s^2)':>12} | {'Temp (C)':>8} | {'Moons':>5} | {'Color':<7}")
    print("-" * 105)
    for r in rows:
        print(f"{r[0]:<11} | {r[1]:<14} | {r[2]:<12} | {r[3]:<10} | {r[4]:>11.1f} | {r[5]:>12.2f} | {r[6]:>8.1f} | {r[7]:>5} | {r[8]:<7}")
    conn.close()

if __name__ == "__main__":
    run()
