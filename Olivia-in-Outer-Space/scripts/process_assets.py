#!/usr/bin/env python3
"""
Olivia in Outer Space - Asset Processing Pipeline
Processes raw reference photos of Anna, Olivia, and the toy rocket into cartoon reference assets.
"""

import sys
import argparse
from pathlib import Path

# Base project paths
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
ASSETS_DIR = PROJECT_ROOT / "assets"
RAW_DIR = ASSETS_DIR / "raw_references"
CARTOONS_DIR = ASSETS_DIR / "cartoons"
REFERENCES_DIR = CARTOONS_DIR / "references"
AUDIO_DIR = ASSETS_DIR / "audio"
BG_DIR = ASSETS_DIR / "backgrounds"

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}

def get_pillow():
    try:
        from PIL import Image, ImageOps, ImageFilter
        return Image, ImageOps, ImageFilter
    except ImportError:
        print("[!] Error: Pillow is required. Please install it using:")
        print("    pip install Pillow")
        sys.exit(1)

def detect_and_crop_subject(img, center_square=True):
    width, height = img.size
    if img.mode == "RGBA":
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
            width, height = img.size

    if center_square and width != height:
        min_dim = min(width, height)
        left = (width - min_dim) // 2
        top = (height - min_dim) // 2
        right = left + min_dim
        bottom = top + min_dim
        img = img.crop((left, top, right, bottom))

    return img

def apply_alpha_transparency(img, remove_solid_backdrop=False, tolerance=30):
    rgba = img.convert("RGBA")
    if not remove_solid_backdrop:
        return rgba

    w, h = rgba.size
    corners = [
        rgba.getpixel((0, 0)),
        rgba.getpixel((w - 1, 0)),
        rgba.getpixel((0, h - 1)),
        rgba.getpixel((w - 1, h - 1)),
    ]
    avg_r = sum(c[0] for c in corners) // 4
    avg_g = sum(c[1] for c in corners) // 4
    avg_b = sum(c[2] for c in corners) // 4

    datas = rgba.getdata()
    new_data = []
    for item in datas:
        diff = ((item[0] - avg_r) ** 2 + (item[1] - avg_g) ** 2 + (item[2] - avg_b) ** 2) ** 0.5
        if diff < tolerance:
            new_data.append((item[0], item[1], item[2], 0))
        elif diff < tolerance * 1.5:
            alpha = int(255 * ((diff - tolerance) / (tolerance * 0.5)))
            new_data.append((item[0], item[1], item[2], min(item[3], alpha)))
        else:
            new_data.append(item)

    rgba.putdata(new_data)
    return rgba

def process_single_image(input_path: Path, output_dir: Path, max_size=1024, auto_alpha=False):
    Image, ImageOps, _ = get_pillow()
    output_dir.mkdir(parents=True, exist_ok=True)
    out_file = output_dir / f"{input_path.stem}.png"

    try:
        with Image.open(input_path) as raw_img:
            img = ImageOps.exif_transpose(raw_img)
            cropped = detect_and_crop_subject(img, center_square=True)
            processed = apply_alpha_transparency(cropped, remove_solid_backdrop=auto_alpha)

            if processed.width > max_size or processed.height > max_size:
                processed.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)

            processed.save(out_file, format="PNG", optimize=True)
            print(f"  [+] {input_path.name} -> {out_file.relative_to(CARTOONS_DIR)} ({processed.width}x{processed.height} RGBA)")
            return out_file
    except Exception as e:
        print(f"  [-] Failed to process {input_path.name}: {e}")
        return None

def process_all_references(max_size=1024, auto_alpha=False):
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    REFERENCES_DIR.mkdir(parents=True, exist_ok=True)

    photos = [
        f for f in RAW_DIR.rglob('*')
        if f.is_file() and f.suffix.lower() in SUPPORTED_EXTENSIONS
    ]

    print(f"\n========================================================")
    print(f"  Olivia in Outer Space - Asset Reference Processor")
    print(f"  Input Directory:  {RAW_DIR}")
    print(f"  Output Directory: {REFERENCES_DIR}")
    print(f"  Max Dimensions:   {max_size}x{max_size} (PNG RGBA)")
    print(f"========================================================")

    if not photos:
        print(f"\n[!] No photos found in {RAW_DIR}.")
        return []

    print(f"\nFound {len(photos)} photo(s) across subfolders:")
    processed_files = []
    for photo in photos:
        rel_dir = photo.parent.relative_to(RAW_DIR)
        target_out_dir = REFERENCES_DIR / rel_dir
        target_out_dir.mkdir(parents=True, exist_ok=True)

        res = process_single_image(photo, target_out_dir, max_size=max_size, auto_alpha=auto_alpha)
        if res:
            processed_files.append(res)

    print(f"\nProcessing complete! Successfully generated {len(processed_files)} reference PNG(s).")
    return processed_files

def generate_svg_placeholders():
    """Generates authentic cartoon SVGs for Olivia, Anna, and the Little Tikes Adventure Rocket."""
    print("Generating authentic cartoon SVGs matching references...")
    char_dir = CARTOONS_DIR / "characters"
    cockpit_dir = CARTOONS_DIR / "cockpit"
    char_dir.mkdir(parents=True, exist_ok=True)
    cockpit_dir.mkdir(parents=True, exist_ok=True)

    # Olivia: Golden caramel curls, cheeky tongue out, big hazel eyes, ladybug astronaut patch
    olivia_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="200" height="220">
  <!-- Hair: Curls behind helmet -->
  <g id="curls-back">
    <circle cx="58" cy="85" r="22" fill="#d97706"/>
    <circle cx="52" cy="115" r="20" fill="#b45309"/>
    <circle cx="142" cy="85" r="22" fill="#d97706"/>
    <circle cx="148" cy="115" r="20" fill="#b45309"/>
  </g>
  <!-- Helmet Outer -->
  <circle cx="100" cy="85" r="54" fill="#f8fafc" stroke="#334155" stroke-width="5"/>
  <ellipse cx="100" cy="132" rx="40" ry="10" fill="#38bdf8" stroke="#0369a1" stroke-width="3"/>
  <!-- Helmet Bubble Visor -->
  <ellipse cx="100" cy="85" rx="42" ry="38" fill="#0f172a" stroke="#475569" stroke-width="3.5"/>
  <ellipse cx="100" cy="85" rx="40" ry="36" fill="#38bdf8" opacity="0.3"/>
  <!-- Face -->
  <g id="face">
    <!-- Golden curly bangs -->
    <path d="M72,62 Q85,50 100,60 Q115,50 128,62 Q120,55 100,53 Q80,55 72,62 Z" fill="#d97706"/>
    <circle cx="74" cy="68" r="8" fill="#f59e0b"/>
    <circle cx="126" cy="68" r="8" fill="#f59e0b"/>
    <!-- Big Sparkling Hazel Eyes -->
    <ellipse cx="85" cy="80" rx="5" ry="7" fill="#451a03"/>
    <ellipse cx="115" cy="80" rx="5" ry="7" fill="#451a03"/>
    <circle cx="87" cy="78" r="2" fill="#ffffff"/>
    <circle cx="117" cy="78" r="2" fill="#ffffff"/>
    <!-- Cute Button Nose -->
    <ellipse cx="100" cy="88" rx="2.5" ry="1.5" fill="#f43f5e" opacity="0.4"/>
    <!-- Cheeky Tongue Out Expression! -->
    <path d="M92,94 Q100,99 108,94" stroke="#0f172a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M96,96 C96,106 104,106 104,96 Z" fill="#f43f5e" stroke="#be123c" stroke-width="1.5"/>
    <line x1="100" y1="96" x2="100" y2="102" stroke="#be123c" stroke-width="1"/>
    <!-- Rosy Cheeks -->
    <circle cx="77" cy="90" r="6" fill="#f43f5e" opacity="0.5"/>
    <circle cx="123" cy="90" r="6" fill="#f43f5e" opacity="0.5"/>
  </g>
  <!-- Visor Reflection -->
  <path d="M68,70 Q95,58 126,66" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8"/>
  <!-- Space Suit Body -->
  <path d="M50,140 Q100,165 150,140 L160,195 Q100,215 40,195 Z" fill="#f1f5f9" stroke="#334155" stroke-width="4"/>
  <!-- Ladybug Mission Patch -->
  <g id="ladybug-patch" transform="translate(75, 155)">
    <rect x="0" y="0" width="50" height="24" rx="6" fill="#ecfdf5" stroke="#10b981" stroke-width="2"/>
    <circle cx="14" cy="12" r="7" fill="#ef4444"/>
    <circle cx="14" cy="8" r="3" fill="#0f172a"/>
    <circle cx="12" cy="11" r="1.5" fill="#0f172a"/>
    <circle cx="16" cy="11" r="1.5" fill="#0f172a"/>
    <circle cx="14" cy="15" r="1.5" fill="#0f172a"/>
    <text x="36" y="16" font-family="sans-serif" font-size="9" font-weight="900" fill="#0284c7" text-anchor="middle">PILOT</text>
  </g>
  <text x="100" y="200" font-family="sans-serif" font-size="12" font-weight="900" fill="#0284c7" text-anchor="middle">OLIVIA</text>
</svg>"""

    # Anna: Straight silky flaxen-blonde bob with straight bangs, sweet younger smile
    anna_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="200" height="220">
  <!-- Hair: Straight blonde bob behind helmet -->
  <path d="M52,70 L50,125 Q65,135 75,120 L75,70 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
  <path d="M148,70 L150,125 Q135,135 125,120 L125,70 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
  <!-- Helmet Outer -->
  <circle cx="100" cy="85" r="54" fill="#f8fafc" stroke="#334155" stroke-width="5"/>
  <ellipse cx="100" cy="132" rx="40" ry="10" fill="#c084fc" stroke="#7e22ce" stroke-width="3"/>
  <!-- Helmet Bubble Visor -->
  <ellipse cx="100" cy="85" rx="42" ry="38" fill="#0f172a" stroke="#475569" stroke-width="3.5"/>
  <ellipse cx="100" cy="85" rx="40" ry="36" fill="#c084fc" opacity="0.3"/>
  <!-- Face -->
  <g id="face">
    <!-- Straight blonde fringe bangs across forehead -->
    <path d="M68,64 L68,76 Q84,80 100,76 Q116,80 132,76 L132,64 Z" fill="#fef08a" stroke="#eab308" stroke-width="2"/>
    <!-- Sweet Big Eyes -->
    <ellipse cx="85" cy="83" rx="5" ry="6.5" fill="#451a03"/>
    <ellipse cx="115" cy="83" rx="5" ry="6.5" fill="#451a03"/>
    <circle cx="87" cy="81" r="2" fill="#ffffff"/>
    <circle cx="117" cy="81" r="2" fill="#ffffff"/>
    <!-- Cute nose -->
    <ellipse cx="100" cy="90" rx="2" ry="1.5" fill="#f43f5e" opacity="0.4"/>
    <!-- Sweet Gentle Smile -->
    <path d="M92,97 Q100,105 108,97" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <!-- Rosy Chubby Cheeks -->
    <circle cx="76" cy="92" r="6" fill="#f43f5e" opacity="0.55"/>
    <circle cx="124" cy="92" r="6" fill="#f43f5e" opacity="0.55"/>
  </g>
  <!-- Visor Reflection -->
  <path d="M68,70 Q95,58 126,66" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8"/>
  <!-- Space Suit Body -->
  <path d="M50,140 Q100,165 150,140 L160,195 Q100,215 40,195 Z" fill="#f1f5f9" stroke="#334155" stroke-width="4"/>
  <!-- Ladybug Mission Patch -->
  <g id="ladybug-patch" transform="translate(75, 155)">
    <rect x="0" y="0" width="50" height="24" rx="6" fill="#ecfdf5" stroke="#10b981" stroke-width="2"/>
    <circle cx="14" cy="12" r="7" fill="#ef4444"/>
    <circle cx="14" cy="8" r="3" fill="#0f172a"/>
    <circle cx="12" cy="11" r="1.5" fill="#0f172a"/>
    <circle cx="16" cy="11" r="1.5" fill="#0f172a"/>
    <circle cx="14" cy="15" r="1.5" fill="#0f172a"/>
    <text x="36" y="16" font-family="sans-serif" font-size="8" font-weight="900" fill="#9333ea" text-anchor="middle">NAV</text>
  </g>
  <text x="100" y="200" font-family="sans-serif" font-size="12" font-weight="900" fill="#9333ea" text-anchor="middle">ANNA</text>
</svg>"""

    # Little Tikes Adventure Rocket Replica SVG:
    # Bulbous white hull, charcoal nosecone, purple starry dome window with bolts,
    # Little Tikes red oval badge, orange telescope, orange handle, blue steering wheel,
    # red toddler crayon scribbles, and scalloped cloud base!
    rocket_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">
  <!-- Scalloped Charcoal Cloud Launch Base -->
  <g id="cloud-base" fill="#475569" stroke="#334155" stroke-width="3">
    <ellipse cx="60" cy="205" rx="30" ry="18"/>
    <ellipse cx="100" cy="210" rx="36" ry="20"/>
    <ellipse cx="140" cy="205" rx="30" ry="18"/>
  </g>
  <!-- Rocket Outer Fins -->
  <path d="M55,145 L25,185 L58,180 Z" fill="#f8fafc" stroke="#64748b" stroke-width="3"/>
  <path d="M145,145 L175,185 L142,180 Z" fill="#f8fafc" stroke="#64748b" stroke-width="3"/>
  <!-- Front Center Fin Handle -->
  <path d="M96,155 L104,155 L106,195 L94,195 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/>

  <!-- Main Bulbous White Rocket Capsule Body -->
  <path d="M100,32 C135,65 148,125 146,180 L54,180 C52,125 65,65 100,32 Z" fill="#f8fafc" stroke="#64748b" stroke-width="4"/>

  <!-- Charcoal/Dark Nosecone -->
  <path d="M100,32 C118,52 126,70 128,80 L72,80 C74,70 82,52 100,32 Z" fill="#1e293b" stroke="#0f172a" stroke-width="3"/>

  <!-- Charming Red Crayon Scribbles by Olivia! -->
  <g id="crayon-scribbles" stroke="#ef4444" stroke-width="2.2" fill="none" opacity="0.75" stroke-linecap="round">
    <path d="M68,95 Q75,82 85,92 T95,84 T110,90"/>
    <path d="M64,110 Q78,102 72,118 T88,112 T76,126"/>
    <path d="M125,95 Q135,105 128,118 T136,128"/>
    <path d="M115,165 Q125,172 135,166"/>
  </g>

  <!-- Large Purple Starry Bubble Porthole Window -->
  <circle cx="100" cy="120" r="34" fill="#ffffff" stroke="#94a3b8" stroke-width="4"/>
  <!-- Bolts on Window Ring -->
  <circle cx="100" cy="89" r="2.5" fill="#475569"/>
  <circle cx="100" cy="151" r="2.5" fill="#475569"/>
  <circle cx="69" cy="120" r="2.5" fill="#475569"/>
  <circle cx="131" cy="120" r="2.5" fill="#475569"/>
  <circle cx="78" cy="98" r="2.5" fill="#475569"/>
  <circle cx="122" cy="98" r="2.5" fill="#475569"/>
  <circle cx="78" cy="142" r="2.5" fill="#475569"/>
  <circle cx="122" cy="142" r="2.5" fill="#475569"/>

  <!-- Purple Deep Space Glass Dome -->
  <circle cx="100" cy="120" r="28" fill="#3b0764"/>
  <!-- Stars Inside Window -->
  <circle cx="92" cy="112" r="1.5" fill="#ffffff"/>
  <circle cx="112" cy="116" r="1.5" fill="#ffffff"/>
  <circle cx="104" cy="128" r="1.2" fill="#ffffff"/>
  <circle cx="88" cy="124" r="1" fill="#fde047"/>
  <!-- Bubble Highlight -->
  <path d="M84,106 Q100,98 116,104" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>

  <!-- Red Little Tikes Oval Badge -->
  <g id="badge" transform="translate(132, 112)">
    <rect x="0" y="0" width="18" height="11" rx="5.5" fill="#dc2626" stroke="#ffffff" stroke-width="1.2"/>
    <text x="9" y="8" font-family="sans-serif" font-size="5" font-weight="900" fill="#ffffff" text-anchor="middle">OLIVIA</text>
  </g>

  <!-- Orange Corrugated Handle & Side Telescope -->
  <rect x="135" y="88" width="6" height="16" rx="3" fill="#f97316" stroke="#c2410c" stroke-width="1.5"/>
  <circle cx="138" cy="92" r="1" fill="#ffffff"/>
  <circle cx="138" cy="96" r="1" fill="#ffffff"/>
  <circle cx="138" cy="100" r="1" fill="#ffffff"/>

  <!-- Orange Telescope Nozzle on Left -->
  <path d="M60,158 L46,164 L46,176 L60,172 Z" fill="#f97316" stroke="#c2410c" stroke-width="2"/>
  <ellipse cx="46" cy="170" rx="3" ry="6" fill="#fb923c"/>

  <!-- Blue Steering Wheel on Side Door Hatch -->
  <circle cx="128" cy="168" r="9" fill="#1d4ed8" stroke="#1e40af" stroke-width="2"/>
  <circle cx="128" cy="168" r="4" fill="#f8fafc"/>
  <line x1="128" y1="159" x2="128" y2="177" stroke="#ffffff" stroke-width="1.5"/>
  <line x1="119" y1="168" x2="137" y2="168" stroke="#ffffff" stroke-width="1.5"/>
</svg>"""

    (char_dir / "olivia_cartoon.svg").write_text(olivia_svg, encoding="utf-8")
    (char_dir / "anna_cartoon.svg").write_text(anna_svg, encoding="utf-8")
    (cockpit_dir / "adventure_rocket.svg").write_text(rocket_svg, encoding="utf-8")
    print("  [+] Created assets/cartoons/characters/olivia_cartoon.svg")
    print("  [+] Created assets/cartoons/characters/anna_cartoon.svg")
    print("  [+] Created assets/cartoons/cockpit/adventure_rocket.svg")

def scan_assets():
    print(f"\n--- Olivia in Outer Space: Asset Inventory ---")
    subdirs = [
        ("Raw References", RAW_DIR),
        ("Cartoons / References", REFERENCES_DIR),
        ("Cartoons / Characters", CARTOONS_DIR / "characters"),
        ("Cartoons / Cockpit", CARTOONS_DIR / "cockpit"),
        ("Audio / Voice", AUDIO_DIR / "voice"),
        ("Audio / SFX", AUDIO_DIR / "sfx"),
        ("Backgrounds", BG_DIR),
    ]
    for label, path in subdirs:
        if path.exists():
            files = [f.name for f in path.rglob('*') if f.is_file() and not f.name.endswith(".md")]
            print(f"[{label}] ({len(files)} files)")
            for f in files[:8]:
                print(f"   • {f}")
            if len(files) > 8:
                print(f"   ... and {len(files) - 8} more")
        else:
            print(f"[{label}] (Directory does not exist)")

def main():
    parser = argparse.ArgumentParser(
        description="Process raw photo references of Anna, Olivia, and the rocket for Olivia in Outer Space."
    )
    parser.add_argument("--max-size", type=int, default=1024, help="Max dimension for downscaling (default: 1024)")
    parser.add_argument("--auto-alpha", action="store_true", help="Attempt automatic backdrop transparency keying")
    parser.add_argument("--scan", action="store_true", help="Print an inventory of project assets")
    parser.add_argument("--placeholders", action="store_true", help="Generate SVG placeholders")
    args = parser.parse_args()

    if args.scan:
        scan_assets()
        return

    if args.placeholders:
        generate_svg_placeholders()
        return

    process_all_references(max_size=args.max_size, auto_alpha=args.auto_alpha)

if __name__ == "__main__":
    main()
