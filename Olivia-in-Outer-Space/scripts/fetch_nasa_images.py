#!/usr/bin/env python3
"""
Olivia in Outer Space - NASA Spacecraft Imagery Fetcher & Optimization Pipeline
Queries the NASA Image and Video Library API for true-color spacecraft photography,
downloads the imagery, generates optimized WebP display assets and thumbnails,
and updates SQLite and JSON databases.
"""

import os
import sys
import time
import json
import sqlite3
import shutil
import argparse
import urllib.request
import urllib.parse
import urllib.error
from pathlib import Path
from PIL import Image

# Base Paths
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
DATA_DIR = PROJECT_ROOT / "data"
ASSETS_DIR = PROJECT_ROOT / "assets"
REAL_IMAGERY_DIR = ASSETS_DIR / "real_imagery"
PUBLIC_IMAGERY_DIR = PROJECT_ROOT / "public" / "assets" / "real_imagery"
SOLAR_DB_PATH = DATA_DIR / "solar_system.db"
SOLAR_JSON_PATH = DATA_DIR / "solar_system.json"
CELESTIAL_DB_PATH = DATA_DIR / "celestial_bodies.db"
CELESTIAL_JSON_PATH = DATA_DIR / "celestial_bodies.json"

NASA_SEARCH_API = "https://images-api.nasa.gov/search"

# Curated queries prioritizing authentic spacecraft photography over art/logos
CURATED_QUERIES = {
    "sun": ["Sun SDO AIA 304", "Sun atmospheric imaging assembly", "PIA03149"],
    "mercury": ["MESSENGER Mercury enhanced color", "PIA18147", "PIA11245"],
    "venus": ["Venus Magellan radar", "PIA00220", "Venus Akatsuki", "PIA00104"],
    "earth": ["Earth blue marble Apollo", "Earth EPIC full disc", "PIA00114"],
    "moon": ["Moon Apollo full disc", "Moon LRO true color", "PIA00405"],
    "mars": ["Mars global view Viking", "Mars Hubble true color", "PIA13215", "PIA02406"],
    "jupiter": ["Jupiter Juno true color", "Jupiter Cassini", "PIA21775", "PIA02873"],
    "saturn": ["Saturn Cassini full view rings", "PIA17199", "PIA01486"],
    "uranus": ["Uranus Voyager 2 true color", "PIA00032", "PIA18182"],
    "neptune": ["Neptune Voyager 2 full disk", "8910708", "PIA01492"],
    "pluto": ["Pluto New Horizons high resolution color", "PIA19857", "PIA19952"],
    "phobos": ["PIA10368", "Phobos Mars Express", "Phobos spacecraft observation"],
    "deimos": ["PIA11826", "Deimos Viking", "Deimos spacecraft observation"],
    "europa": ["Europa Galileo spacecraft", "PIA00847", "PIA00502"],
    "ganymede": ["Ganymede Galileo spacecraft", "PIA00498", "PIA00583"],
    "callisto": ["Callisto Galileo spacecraft", "PIA03456"],
    "titan": ["Titan Cassini spacecraft", "PIA12615", "PIA14680"],
    "enceladus": ["Enceladus Cassini spacecraft", "PIA12662", "PIA17202"],
    "triton": ["Triton Voyager 2", "PIA18668", "PIA00317"],
    "ceres": ["Ceres Dawn spacecraft", "PIA12031", "PIA19547"]
}

def request_with_retry(url: str, max_retries: int = 3, timeout: int = 15) -> bytes:
    """Performs HTTP GET with exponential backoff retries."""
    headers = {"User-Agent": "OliviaSpaceNASAImagePipeline/1.0"}
    req = urllib.request.Request(url, headers=headers)
    for attempt in range(1, max_retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as response:
                return response.read()
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as e:
            if attempt == max_retries:
                raise RuntimeError(f"Failed to fetch {url} after {max_retries} attempts: {e}")
            wait_time = attempt * 2
            print(f"    [!] Error fetching ({e}). Retrying in {wait_time}s...")
            time.sleep(wait_time)

def find_nasa_image_url(body_id: str, default_nasa_id: str = None) -> tuple:
    """Queries NASA API and returns (nasa_id, image_download_url, title)."""
    queries = CURATED_QUERIES.get(body_id, [f"{body_id} spacecraft observation"])
    if default_nasa_id and default_nasa_id not in queries:
        queries.append(default_nasa_id)

    for q in queries:
        url = f"{NASA_SEARCH_API}?q={urllib.parse.quote(q)}&media_type=image"
        try:
            raw_bytes = request_with_retry(url, max_retries=2, timeout=10)
            data = json.loads(raw_bytes.decode("utf-8"))
            items = data.get("collection", {}).get("items", [])
            if not items:
                continue

            for item in items[:5]:
                data_info = item.get("data", [{}])[0]
                nasa_id = data_info.get("nasa_id")
                title = data_info.get("title", "")
                collection_href = item.get("href")

                if not collection_href or not nasa_id:
                    continue

                col_bytes = request_with_retry(collection_href, max_retries=2, timeout=10)
                assets_list = json.loads(col_bytes.decode("utf-8"))

                # Prefer large.jpg (fast, high quality) then orig.jpg/orig.png then medium.jpg
                preferred_url = None
                for candidate in assets_list:
                    if candidate.endswith("~large.jpg") or candidate.endswith("/large.jpg"):
                        preferred_url = candidate
                        break

                if not preferred_url:
                    for candidate in assets_list:
                        if any(candidate.endswith(ext) for ext in ("~orig.jpg", "orig.jpg", "~orig.png", "orig.png")):
                            preferred_url = candidate
                            break

                if not preferred_url:
                    for candidate in assets_list:
                        if candidate.endswith("~medium.jpg") or candidate.endswith(".jpg") or candidate.endswith(".png"):
                            preferred_url = candidate
                            break

                if preferred_url:
                    return nasa_id, preferred_url, title

        except Exception as e:
            continue

    raise RuntimeError(f"Could not find any NASA imagery asset for body '{body_id}'")

def download_and_optimize(body_id: str, image_url: str, output_dir: Path) -> dict:
    """Downloads original image and creates display.webp (1200 max) and thumb.webp (256 max)."""
    output_dir.mkdir(parents=True, exist_ok=True)
    orig_path = output_dir / "original.jpg"
    display_path = output_dir / "display.webp"
    thumb_path = output_dir / "thumb.webp"

    # Step A: Download Original Image
    img_bytes = request_with_retry(image_url, max_retries=3, timeout=30)
    orig_path.write_bytes(img_bytes)

    # Step B: Open and Process with Pillow
    with Image.open(orig_path) as img:
        # Convert RGBA/CMYK/Palette to RGB
        if img.mode != "RGB":
            img = img.convert("RGB")

        # Create 1200x1200 proportional display image
        display_img = img.copy()
        display_img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
        display_img.save(display_path, "WEBP", quality=85, method=4)

        # Create 256x256 proportional thumbnail
        thumb_img = img.copy()
        thumb_img.thumbnail((256, 256), Image.Resampling.LANCZOS)
        thumb_img.save(thumb_path, "WEBP", quality=85, method=4)

    # Mirror to public directory for direct frontend static serving
    pub_body_dir = PUBLIC_IMAGERY_DIR / body_id
    pub_body_dir.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(display_path, pub_body_dir / "display.webp")
    shutil.copyfile(thumb_path, pub_body_dir / "thumb.webp")

    return {
        "display_rel": f"assets/real_imagery/{body_id}/display.webp",
        "thumb_rel": f"assets/real_imagery/{body_id}/thumb.webp",
        "orig_size_bytes": len(img_bytes),
        "display_size_bytes": display_path.stat().st_size,
        "thumb_size_bytes": thumb_path.stat().st_size
    }

def update_databases(updates: list):
    """Updates SQLite databases and JSON data files with new paths and NASA IDs."""
    # 1. Update solar_system.json
    if SOLAR_JSON_PATH.exists():
        solar_records = json.loads(SOLAR_JSON_PATH.read_text(encoding="utf-8"))
        update_map = {u["id"]: u for u in updates}
        for rec in solar_records:
            bid = rec["id"]
            if bid in update_map:
                rec["real_image_path"] = update_map[bid]["real_image_path"]
                rec["thumbnail_image_path"] = update_map[bid]["thumbnail_image_path"]
                rec["nasa_asset_id"] = update_map[bid]["nasa_asset_id"]
        SOLAR_JSON_PATH.write_text(json.dumps(solar_records, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"  [+] Updated JSON: {SOLAR_JSON_PATH}")

    # 2. Update solar_system.db
    if SOLAR_DB_PATH.exists():
        conn = sqlite3.connect(SOLAR_DB_PATH)
        with conn:
            for u in updates:
                conn.execute(
                    "UPDATE celestial_bodies SET real_image_path = ?, thumbnail_image_path = ?, nasa_asset_id = ? WHERE id = ?",
                    (u["real_image_path"], u["thumbnail_image_path"], u["nasa_asset_id"], u["id"])
                )
        conn.close()
        print(f"  [+] Updated SQLite DB: {SOLAR_DB_PATH}")

    # 3. Synchronize celestial_bodies.json and .db if present
    if CELESTIAL_JSON_PATH.exists():
        c_records = json.loads(CELESTIAL_JSON_PATH.read_text(encoding="utf-8"))
        update_map = {u["id"]: u for u in updates}
        for rec in c_records:
            bid = rec["id"]
            if bid in update_map:
                rec["real_image_path"] = update_map[bid]["real_image_path"]
                rec["thumbnail_image_path"] = update_map[bid]["thumbnail_image_path"]
                rec["nasa_asset_id"] = update_map[bid]["nasa_asset_id"]
        CELESTIAL_JSON_PATH.write_text(json.dumps(c_records, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"  [+] Updated JSON: {CELESTIAL_JSON_PATH}")

    if CELESTIAL_DB_PATH.exists():
        conn = sqlite3.connect(CELESTIAL_DB_PATH)
        with conn:
            for u in updates:
                conn.execute(
                    "UPDATE celestial_bodies SET real_image_path = ?, thumbnail_image_path = ?, nasa_asset_id = ? WHERE id = ?",
                    (u["real_image_path"], u["thumbnail_image_path"], u["nasa_asset_id"], u["id"])
                )
        conn.close()
        print(f"  [+] Updated SQLite DB: {CELESTIAL_DB_PATH}")

def verify_all_assets(updates: list):
    """Verifies that all WebP display and thumb images exist, are non-empty, and valid."""
    print("\n--- Verifying WebP Image Assets ---")
    verified_count = 0
    for u in updates:
        bid = u["id"]
        body_dir = REAL_IMAGERY_DIR / bid
        disp_p = body_dir / "display.webp"
        thum_p = body_dir / "thumb.webp"

        assert disp_p.exists() and disp_p.stat().st_size > 0, f"Missing or empty {disp_p}"
        assert thum_p.exists() and thum_p.stat().st_size > 0, f"Missing or empty {thum_p}"

        # Verify Pillow can open the generated WebP files
        with Image.open(disp_p) as d_im:
            disp_w, disp_h = d_im.size
            assert d_im.format == "WEBP", f"Invalid format for {disp_p}"
        with Image.open(thum_p) as t_im:
            thum_w, thum_h = t_im.size
            assert t_im.format == "WEBP", f"Invalid format for {thum_p}"

        print(f"  * {bid:<10} | NASA ID: {u['nasa_asset_id']:<15} | Display: {disp_w}x{disp_h} ({disp_p.stat().st_size // 1024} KB) | Thumb: {thum_w}x{thum_h} ({thum_p.stat().st_size // 1024} KB)")
        verified_count += 1

    print(f"\nAll {verified_count} celestial bodies successfully processed and verified!")

def run():
    parser = argparse.ArgumentParser(description="Fetch and optimize NASA spacecraft photography.")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of bodies to process (for testing)")
    args = parser.parse_args()

    print("======================================================================")
    print("  Olivia in Outer Space - NASA Spacecraft Imagery Pipeline")
    print("======================================================================")

    REAL_IMAGERY_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_IMAGERY_DIR.mkdir(parents=True, exist_ok=True)

    if not SOLAR_JSON_PATH.exists():
        raise FileNotFoundError(f"Cannot find solar system JSON at: {SOLAR_JSON_PATH}")

    bodies = json.loads(SOLAR_JSON_PATH.read_text(encoding="utf-8"))
    if args.limit:
        bodies = bodies[:args.limit]

    print(f"\nProcessing {len(bodies)} celestial bodies from {SOLAR_JSON_PATH.name}...")

    updates = []
    start_total = time.time()

    for idx, body in enumerate(bodies, 1):
        bid = body["id"]
        name = body.get("english_name", bid.title())
        nasa_asset_id = body.get("nasa_asset_id")

        print(f"\n[{idx}/{len(bodies)}] Querying authentic photography for {name} ({bid})...")
        try:
            nasa_id, image_url, title = find_nasa_image_url(bid, default_nasa_id=nasa_asset_id)
            print(f"  -> Found NASA ID: {nasa_id} | '{title[:60]}'")
            print(f"  -> Downloading: {image_url.split('/')[-1]}...")

            body_dir = REAL_IMAGERY_DIR / bid
            opt_info = download_and_optimize(bid, image_url, body_dir)

            print(f"  -> Saved WebP: {opt_info['display_size_bytes'] // 1024} KB (display), {opt_info['thumb_size_bytes'] // 1024} KB (thumb)")

            updates.append({
                "id": bid,
                "real_image_path": opt_info["display_rel"],
                "thumbnail_image_path": opt_info["thumb_rel"],
                "nasa_asset_id": nasa_id
            })
        except Exception as e:
            print(f"  [ERROR] Failed processing {name}: {e}")
            raise e

    print(f"\nDone downloading & optimizing {len(updates)} images in {time.time() - start_total:.1f}s.")

    # Update Databases
    print("\nUpdating SQLite database and JSON catalog...")
    update_databases(updates)

    # Verify All Images
    verify_all_assets(updates)

if __name__ == "__main__":
    run()
