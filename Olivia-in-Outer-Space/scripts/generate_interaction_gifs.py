import os
import math
import random
from PIL import Image, ImageDraw

OUTPUT_DIR = "public/assets/cartoons/interactions"
os.makedirs(OUTPUT_DIR, exist_ok=True)

OLIVIA_FACE = "public/assets/cartoons/characters/olivia_cartoon_circle.png"
ANNA_FACE = "public/assets/cartoons/characters/anna_cartoon_circle.png"

olivia_face_img = Image.open(OLIVIA_FACE).convert("RGBA")
anna_face_img = Image.open(ANNA_FACE).convert("RGBA")

CANVAS_SIZE = 360
NUM_FRAMES = 10
FRAME_DURATION = 120  # ms (1.2s total loop)

# Seeded star field for consistent twinkling
random.seed(42)
STARS = [
    (random.randint(8, CANVAS_SIZE - 8), random.randint(8, CANVAS_SIZE - 8), random.choice([1, 1.5, 2]), random.random() * math.pi * 2)
    for _ in range(40)
]

def draw_starry_bg(draw, frame_idx):
    draw.rectangle([0, 0, CANVAS_SIZE, CANVAS_SIZE], fill=(11, 15, 28, 255))
    for sx, sy, sr, phase in STARS:
        brightness = 0.5 + 0.5 * math.sin(phase + frame_idx * (2 * math.pi / NUM_FRAMES))
        alpha = int(120 + 135 * brightness)
        r = sr if brightness > 0.5 else max(0.8, sr * 0.7)
        color = (255, 255, 230, alpha)
        draw.ellipse([sx - r, sy - r, sx + r, sy + r], fill=color)

def draw_astronaut(draw_canvas, face_img, is_olivia, cx, cy, size=105, bob=0, wave_arm=False, arm_angle=0, jump_y=0, rot=0):
    """
    Renders an astronaut character with helmet, suit, and face image.
    Supports waving, bobbing, jumping, and rotation.
    """
    suit_accent = (56, 189, 248) if is_olivia else (192, 132, 252) # Cyan vs Lilac
    w = size
    h = int(size * 1.25)
    
    char_img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    c_draw = ImageDraw.Draw(char_img)
    
    head_cx = w // 2
    head_cy = int(h * 0.35) + bob
    head_r = int(w * 0.28)
    
    body_top = head_cy + head_r - int(w * 0.08)
    body_w = int(w * 0.44)
    body_h = int(h * 0.40)
    
    # Life support backpack
    c_draw.rounded_rectangle([head_cx - body_w//2 - 6, body_top + 4, head_cx + body_w//2 + 6, body_top + body_h - 4],
                            radius=6, fill=(148, 163, 184, 255), outline=(51, 65, 85, 255), width=2)

    # Suit Torso
    c_draw.rounded_rectangle([head_cx - body_w//2, body_top, head_cx + body_w//2, body_top + body_h],
                            radius=int(w * 0.08), fill=(241, 245, 249, 255), outline=(51, 65, 85, 255), width=3)
    
    # Accent Stripe
    c_draw.rectangle([head_cx - body_w//2 + 3, body_top + int(body_h * 0.45), head_cx + body_w//2 - 3, body_top + int(body_h * 0.58)],
                     fill=suit_accent + (255,))
    
    # Mission Patch on chest
    patch_w, patch_h = int(w * 0.16), int(w * 0.09)
    patch_x = head_cx - patch_w // 2
    patch_y = body_top + int(body_h * 0.18)
    c_draw.rounded_rectangle([patch_x, patch_y, patch_x + patch_w, patch_y + patch_h],
                            radius=3, fill=(236, 253, 245, 255), outline=(16, 185, 129, 255), width=1)
    
    # Legs & Boots
    leg_w = int(body_w * 0.36)
    leg_h = int(h * 0.22)
    left_leg_x = head_cx - body_w//2 + 2
    right_leg_x = head_cx + body_w//2 - leg_w - 2
    leg_y = body_top + body_h - 4
    # Left
    c_draw.rounded_rectangle([left_leg_x, leg_y, left_leg_x + leg_w, leg_y + leg_h],
                            radius=4, fill=(241, 245, 249, 255), outline=(51, 65, 85, 255), width=2)
    c_draw.ellipse([left_leg_x - 3, leg_y + leg_h - 8, left_leg_x + leg_w + 3, leg_y + leg_h + 3],
                   fill=(71, 85, 105, 255))
    # Right
    c_draw.rounded_rectangle([right_leg_x, leg_y, right_leg_x + leg_w, leg_y + leg_h],
                            radius=4, fill=(241, 245, 249, 255), outline=(51, 65, 85, 255), width=2)
    c_draw.ellipse([right_leg_x - 3, leg_y + leg_h - 8, right_leg_x + leg_w + 3, leg_y + leg_h + 3],
                   fill=(71, 85, 105, 255))

    # Arms
    arm_w = int(w * 0.14)
    if wave_arm:
        arm_ox = head_cx - body_w//2 if is_olivia else head_cx + body_w//2
        hand_x = arm_ox - 14 if is_olivia else arm_ox + 14
        hand_y = body_top - 12 + int(math.sin(arm_angle) * 10)
        c_draw.line([(arm_ox, body_top + 10), (hand_x, hand_y)], fill=(241, 245, 249, 255), width=arm_w)
        c_draw.ellipse([hand_x - 7, hand_y - 7, hand_x + 7, hand_y + 7],
                       fill=suit_accent + (255,), outline=(51, 65, 85, 255), width=2)
    else:
        arm_ox = head_cx - body_w//2 if is_olivia else head_cx + body_w//2
        hand_x = arm_ox - 10 if is_olivia else arm_ox + 10
        hand_y = body_top + int(body_h * 0.5) + int(math.sin(arm_angle) * 5)
        c_draw.line([(arm_ox, body_top + 10), (hand_x, hand_y)], fill=(241, 245, 249, 255), width=arm_w)
        c_draw.ellipse([hand_x - 6, hand_y - 6, hand_x + 6, hand_y + 6],
                       fill=suit_accent + (255,), outline=(51, 65, 85, 255), width=2)

    # Collar Ring
    collar_rx = int(head_r * 0.72)
    collar_ry = int(w * 0.07)
    c_draw.ellipse([head_cx - collar_rx, head_cy + head_r - collar_ry - 2, head_cx + collar_rx, head_cy + head_r + collar_ry - 2],
                   fill=suit_accent + (255,), outline=(30, 41, 59, 255), width=2)

    # Helmet Shell
    c_draw.ellipse([head_cx - head_r, head_cy - head_r, head_cx + head_r, head_cy + head_r],
                   fill=(248, 250, 252, 255), outline=(51, 65, 85, 255), width=3)
    
    # Visor Ellipse Frame
    vrx = int(head_r * 0.80)
    vry = int(head_r * 0.72)
    c_draw.ellipse([head_cx - vrx, head_cy - vry, head_cx + vrx, head_cy + vry],
                   fill=(15, 23, 42, 255), outline=(71, 85, 105, 255), width=2)
    
    # Face inside visor
    face_size = int(vrx * 1.85)
    resized_face = face_img.resize((face_size, face_size), Image.Resampling.LANCZOS)
    
    mask = Image.new("L", (w, h), 0)
    m_draw = ImageDraw.Draw(mask)
    m_draw.ellipse([head_cx - vrx + 2, head_cy - vry + 2, head_cx + vrx - 2, head_cy + vry - 2], fill=255)
    
    face_canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    face_canvas.paste(resized_face, (head_cx - face_size // 2, head_cy - face_size // 2), resized_face)
    char_img.paste(face_canvas, (0, 0), mask)
    
    # Visor Glass Glare
    c_draw.arc([head_cx - vrx + 5, head_cy - vry + 3, head_cx + vrx - 5, head_cy - 1],
               start=200, end=340, fill=(255, 255, 255, 180), width=3)

    if rot != 0:
        char_img = char_img.rotate(rot, resample=Image.Resampling.BICUBIC, expand=True)

    # Paste into canvas
    paste_x = int(cx - char_img.width // 2)
    paste_y = int(cy - char_img.height // 2 + jump_y)
    draw_canvas.paste(char_img, (paste_x, paste_y), char_img)

def draw_sparkle(draw, x, y, size=10, color=(255, 235, 100, 255)):
    draw.line([(x - size, y), (x + size, y)], fill=color, width=2)
    draw.line([(x, y - size), (x, y + size)], fill=color, width=2)
    draw.ellipse([x - size//3, y - size//3, x + size//3, y + size//3], fill=(255, 255, 255, 255))

def draw_heart(draw, cx, cy, size=12, color=(244, 63, 94, 255)):
    s = size
    r = s // 2
    draw.ellipse([cx - s, cy - r, cx, cy + r], fill=color)
    draw.ellipse([cx, cy - r, cx + s, cy + r], fill=color)
    draw.polygon([(cx - s + 1, cy + 2), (cx + s - 1, cy + 2), (cx, cy + s + 3)], fill=color)

def save_gif(frames, filename):
    filepath = os.path.join(OUTPUT_DIR, filename)
    p_frames = [f.convert("P", palette=Image.Palette.ADAPTIVE) for f in frames]
    p_frames[0].save(
        filepath,
        save_all=True,
        append_images=p_frames[1:],
        duration=FRAME_DURATION,
        loop=0,
        optimize=True
    )
    print(f"Generated {filename} ({os.path.getsize(filepath) // 1024} KB)")

# =========================================================================
# 1. SUN — "Warm Sunshine Hug!"
# =========================================================================
def gen_sun():
    frames = []
    for i in range(NUM_FRAMES):
        t = i / NUM_FRAMES
        angle_step = t * (2 * math.pi)
        img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE))
        draw = ImageDraw.Draw(img)
        draw_starry_bg(draw, i)
        
        scx, scy = 180, 135
        sr = 62 + int(math.sin(angle_step * 2) * 3)
        
        flare_rot = angle_step
        for deg in range(0, 360, 30):
            rad = math.radians(deg) + flare_rot
            fx1 = scx + int(math.cos(rad) * (sr - 5))
            fy1 = scy + int(math.sin(rad) * (sr - 5))
            fx_tip = scx + int(math.cos(rad) * (sr + 22 + math.sin(angle_step * 3 + deg) * 5))
            fy_tip = scy + int(math.sin(rad) * (sr + 22 + math.sin(angle_step * 3 + deg) * 5))
            draw.line([(fx1, fy1), (fx_tip, fy_tip)], fill=(253, 224, 71, 230), width=6)
        
        draw.ellipse([scx - sr - 8, scy - sr - 8, scx + sr + 8, scy + sr + 8], fill=(251, 191, 36, 120))
        draw.ellipse([scx - sr, scy - sr, scx + sr, scy + sr], fill=(245, 158, 11, 255), outline=(254, 240, 138, 255), width=3)
        
        # Cheeks & Face
        draw.ellipse([scx - 30, scy + 8, scx - 14, scy + 24], fill=(234, 88, 12, 140))
        draw.ellipse([scx + 14, scy + 8, scx + 30, scy + 24], fill=(234, 88, 12, 140))
        draw.ellipse([scx - 26, scy - 10, scx - 16, scy + 2], fill=(120, 53, 15, 255))
        draw.ellipse([scx + 16, scy - 10, scx + 26, scy + 2], fill=(120, 53, 15, 255))
        draw.ellipse([scx - 23, scy - 8, scx - 19, scy - 4], fill=(255, 255, 255, 255))
        draw.ellipse([scx + 19, scy - 8, scx + 23, scy - 4], fill=(255, 255, 255, 255))
        draw.arc([scx - 20, scy + 2, scx + 20, scy + 26], start=10, end=170, fill=(120, 53, 15, 255), width=4)
        
        hug_reach = int(math.sin(angle_step) * 10)
        draw.arc([70 - hug_reach, 100, scx, 220], start=80, end=200, fill=(253, 224, 71, 220), width=9)
        draw.ellipse([75 - hug_reach, 190, 95 - hug_reach, 210], fill=(251, 191, 36, 255))
        draw.arc([scx, 100, 290 + hug_reach, 220], start=340, end=100, fill=(253, 224, 71, 220), width=9)
        draw.ellipse([265 + hug_reach, 190, 285 + hug_reach, 210], fill=(251, 191, 36, 255))

        olivia_x = 80 + int(math.sin(angle_step) * 6)
        anna_x = 280 - int(math.sin(angle_step) * 6)
        draw_astronaut(img, olivia_face_img, True, cx=olivia_x, cy=245, size=95, wave_arm=True, arm_angle=angle_step)
        draw_astronaut(img, anna_face_img, False, cx=anna_x, cy=245, size=95, wave_arm=True, arm_angle=angle_step + math.pi)

        draw_heart(draw, 140, 215 - int(t * 30), size=9)
        draw_heart(draw, 220, 205 - int((t + 0.3) % 1.0 * 30), size=11)
        draw_heart(draw, 180, 275 - int((t + 0.6) % 1.0 * 25), size=8)

        frames.append(img)
    save_gif(frames, "sun.gif")

# =========================================================================
# 2. MERCURY — "Zoom Zoom Fast!"
# =========================================================================
def gen_mercury():
    frames = []
    for i in range(NUM_FRAMES):
        t = i / NUM_FRAMES
        angle_step = t * (2 * math.pi)
        img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE))
        draw = ImageDraw.Draw(img)
        draw_starry_bg(draw, i)

        mcx = 180 + int(math.sin(angle_step) * 60)
        mcy = 110 + int(math.cos(angle_step * 2) * 10)
        mr = 38
        
        for dash_y in [90, 110, 130]:
            dash_x1 = mcx - 70 if math.cos(angle_step) > 0 else mcx + 40
            dash_x2 = dash_x1 + 35
            draw.line([(dash_x1, dash_y), (dash_x2, dash_y)], fill=(226, 232, 240, 180), width=3)
        
        draw.ellipse([mcx - mr, mcy - mr, mcx + mr, mcy + mr], fill=(148, 163, 184, 255), outline=(203, 213, 225, 255), width=2)
        draw.ellipse([mcx - 18, mcy - 12, mcx - 6, mcy], fill=(100, 116, 139, 220))
        draw.ellipse([mcx + 8, mcy - 6, mcx + 22, mcy + 8], fill=(100, 116, 139, 220))
        draw.ellipse([mcx - 8, mcy + 10, mcx + 4, mcy + 22], fill=(100, 116, 139, 220))
        draw_sparkle(draw, mcx + 30, mcy - 25, size=8)

        run_bob_o = int(abs(math.sin(angle_step * 2)) * 14)
        run_bob_a = int(abs(math.cos(angle_step * 2)) * 14)
        draw_astronaut(img, olivia_face_img, True, cx=90, cy=245 - run_bob_o, size=95, wave_arm=True, arm_angle=angle_step * 2)
        draw_astronaut(img, anna_face_img, False, cx=270, cy=245 - run_bob_a, size=95, wave_arm=True, arm_angle=angle_step * 2 + math.pi)

        draw.line([(60, 298), (120, 298)], fill=(56, 189, 248, 180), width=3)
        draw.line([(240, 298), (300, 298)], fill=(192, 132, 252, 180), width=3)

        frames.append(img)
    save_gif(frames, "mercury.gif")

# =========================================================================
# 3. VENUS — "Blow the Clouds!"
# =========================================================================
def gen_venus():
    frames = []
    for i in range(NUM_FRAMES):
        t = i / NUM_FRAMES
        angle_step = t * (2 * math.pi)
        img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE))
        draw = ImageDraw.Draw(img)
        draw_starry_bg(draw, i)

        vcx, vcy = 180, 125
        vr = 55
        
        draw.ellipse([vcx - vr, vcy - vr, vcx + vr, vcy + vr], fill=(245, 158, 11, 255), outline=(254, 240, 138, 255), width=2)
        for b_off in [-25, 0, 25]:
            swirl_x = int(math.sin(angle_step + b_off) * 12)
            draw.arc([vcx - vr + 6, vcy + b_off - 12 + swirl_x//2, vcx + vr - 6, vcy + b_off + 12 + swirl_x//2],
                     start=180, end=360, fill=(254, 240, 138, 180), width=6)

        for c_idx in range(4):
            c_phase = (t + c_idx * 0.25) % 1.0
            cx_cloud = int(70 + c_phase * 110) if c_idx % 2 == 0 else int(290 - c_phase * 110)
            cy_cloud = int(220 - c_phase * 95)
            cr = int(12 + math.sin(c_phase * math.pi) * 8)
            draw.ellipse([cx_cloud - cr, cy_cloud - cr, cx_cloud + cr, cy_cloud + cr], fill=(254, 249, 195, 210))
            draw.ellipse([cx_cloud - cr + 4, cy_cloud - cr - 4, cx_cloud + cr - 4, cy_cloud + cr - 10], fill=(255, 255, 255, 230))

        bob = int(math.sin(angle_step) * 5)
        draw_astronaut(img, olivia_face_img, True, cx=75, cy=245 + bob, size=95, wave_arm=True, arm_angle=angle_step)
        draw_astronaut(img, anna_face_img, False, cx=285, cy=245 - bob, size=95, wave_arm=True, arm_angle=angle_step + math.pi)

        draw_sparkle(draw, 180, 70, size=8)
        draw_sparkle(draw, 140, 175, size=7)
        draw_sparkle(draw, 220, 175, size=7)

        frames.append(img)
    save_gif(frames, "venus.gif")

# =========================================================================
# 4. EARTH — "Wave Hello!"
# =========================================================================
def gen_earth():
    frames = []
    for i in range(NUM_FRAMES):
        t = i / NUM_FRAMES
        angle_step = t * (2 * math.pi)
        img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE))
        draw = ImageDraw.Draw(img)
        draw_starry_bg(draw, i)

        ecx, ecy = 180, 125
        er = 62
        
        draw.ellipse([ecx - er, ecy - er, ecx + er, ecy + er], fill=(14, 165, 233, 255), outline=(56, 189, 248, 255), width=3)
        draw.ellipse([ecx - 35, ecy - 30, ecx - 5, ecy + 15], fill=(34, 197, 94, 255))
        draw.ellipse([ecx + 5, ecy - 38, ecx + 40, ecy - 5], fill=(34, 197, 94, 255))
        draw.ellipse([ecx - 15, ecy + 15, ecx + 25, ecy + 42], fill=(34, 197, 94, 255))
        
        # Face
        draw.ellipse([ecx - 22, ecy - 10, ecx - 12, ecy], fill=(15, 23, 42, 255))
        draw.ellipse([ecx + 12, ecy - 10, ecx + 22, ecy], fill=(15, 23, 42, 255))
        draw.arc([ecx - 15, ecy + 4, ecx + 15, ecy + 22], start=10, end=170, fill=(15, 23, 42, 255), width=3)
        draw.ellipse([ecx - 26, ecy + 2, ecx - 16, ecy + 12], fill=(244, 63, 94, 130))
        draw.ellipse([ecx + 16, ecy + 2, ecx + 26, ecy + 12], fill=(244, 63, 94, 130))
        
        # Earth Glove Wave
        wave_y = int(math.sin(angle_step) * 12)
        hand_x = ecx + er + 14
        hand_y = ecy - 10 + wave_y
        draw.line([(ecx + er - 6, ecy + 10), (hand_x, hand_y)], fill=(241, 245, 249, 255), width=8)
        draw.ellipse([hand_x - 9, hand_y - 9, hand_x + 9, hand_y + 9], fill=(248, 250, 252, 255), outline=(51, 65, 85, 255), width=2)
        draw.ellipse([hand_x - 4, hand_y - 14, hand_x + 4, hand_y - 6], fill=(248, 250, 252, 255))

        draw_astronaut(img, olivia_face_img, True, cx=75, cy=245, size=95, wave_arm=True, arm_angle=angle_step * 2)
        draw_astronaut(img, anna_face_img, False, cx=285, cy=245, size=95, wave_arm=True, arm_angle=angle_step * 2 + math.pi)

        draw_sparkle(draw, hand_x + 18, hand_y - 12, size=9)
        draw_sparkle(draw, 75, 175, size=8)
        draw_sparkle(draw, 285, 175, size=8)

        frames.append(img)
    save_gif(frames, "earth.gif")

# =========================================================================
# 5. MARS — "Drive the Rover!"
# =========================================================================
def gen_mars():
    frames = []
    for i in range(NUM_FRAMES):
        t = i / NUM_FRAMES
        angle_step = t * (2 * math.pi)
        img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE))
        draw = ImageDraw.Draw(img)
        draw_starry_bg(draw, i)

        mcx, mcy = 180, 95
        mr = 46
        draw.ellipse([mcx - mr, mcy - mr, mcx + mr, mcy + mr], fill=(239, 68, 68, 255), outline=(252, 165, 165, 255), width=2)
        draw.ellipse([mcx - 14, mcy - mr, mcx + 14, mcy - mr + 10], fill=(255, 255, 255, 240))
        draw.arc([mcx - 25, mcy - 5, mcx + 25, mcy + 25], start=160, end=320, fill=(185, 28, 28, 255), width=5)

        rover_y = 260 + int(math.sin(angle_step * 2) * 6)
        
        # Red Martian hill
        draw.ellipse([-50, 270, CANVAS_SIZE + 50, 420], fill=(185, 28, 28, 255), outline=(220, 38, 38, 255), width=3)
        
        rcx, rcy = 180, rover_y
        draw.rounded_rectangle([rcx - 70, rcy - 20, rcx + 70, rcy + 15], radius=8, fill=(226, 232, 240, 255), outline=(51, 65, 85, 255), width=3)
        draw.rectangle([rcx - 65, rcy - 5, rcx + 65, rcy + 8], fill=(239, 68, 68, 255))
        
        antenna_sway = int(math.sin(angle_step) * 6)
        draw.line([(rcx - 45, rcy - 20), (rcx - 45 + antenna_sway, rcy - 48)], fill=(100, 116, 139, 255), width=3)
        draw.polygon([(rcx - 45 + antenna_sway, rcy - 48), (rcx - 25 + antenna_sway, rcy - 42), (rcx - 45 + antenna_sway, rcy - 36)],
                     fill=(250, 204, 21, 255))

        for wx in [-55, -20, 15, 50]:
            draw.ellipse([rcx + wx - 11, rcy + 10, rcx + wx + 11, rcy + 32], fill=(30, 41, 59, 255), outline=(148, 163, 184, 255), width=2)
            draw.ellipse([rcx + wx - 4, rcy + 17, rcx + wx + 4, rcy + 25], fill=(255, 255, 255, 255))

        for px_off in [-80, -95]:
            p_size = 6 + int(math.sin(angle_step + px_off) * 3)
            draw.ellipse([rcx + px_off, rcy + 18, rcx + px_off + p_size, rcy + 18 + p_size], fill=(239, 68, 68, 160))

        draw_astronaut(img, olivia_face_img, True, cx=rcx - 30, cy=rcy - 42, size=75, wave_arm=True, arm_angle=angle_step * 2)
        draw_astronaut(img, anna_face_img, False, cx=rcx + 30, cy=rcy - 42, size=75, wave_arm=True, arm_angle=angle_step * 2 + math.pi)

        frames.append(img)
    save_gif(frames, "mars.gif")

# =========================================================================
# 6. JUPITER — "Spin the Great Red Spot!"
# =========================================================================
def gen_jupiter():
    frames = []
    for i in range(NUM_FRAMES):
        t = i / NUM_FRAMES
        angle_step = t * (2 * math.pi)
        img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE))
        draw = ImageDraw.Draw(img)
        draw_starry_bg(draw, i)

        jcx, jcy = 180, 125
        jr = 66
        
        draw.ellipse([jcx - jr, jcy - jr, jcx + jr, jcy + jr], fill=(251, 146, 60, 255), outline=(254, 215, 170, 255), width=3)
        draw.rectangle([jcx - jr + 6, jcy - 35, jcx + jr - 6, jcy - 18], fill=(254, 243, 199, 210))
        draw.rectangle([jcx - jr + 4, jcy - 8, jcx + jr - 4, jcy + 10], fill=(217, 119, 6, 220))
        draw.rectangle([jcx - jr + 8, jcy + 22, jcx + jr - 8, jcy + 40], fill=(254, 243, 199, 210))
        
        spot_x = jcx + int(math.sin(angle_step) * 32)
        spot_y = jcy + 18
        draw.ellipse([spot_x - 16, spot_y - 10, spot_x + 16, spot_y + 10], fill=(220, 38, 38, 255), outline=(254, 202, 202, 255), width=2)
        draw.arc([spot_x - 10, spot_y - 6, spot_x + 10, spot_y + 6], start=0, end=270, fill=(254, 242, 242, 255), width=2)

        spin_rot_o = int(math.sin(angle_step) * 20)
        spin_rot_a = int(-math.sin(angle_step) * 20)
        draw_astronaut(img, olivia_face_img, True, cx=75, cy=245, size=95, wave_arm=True, arm_angle=angle_step, rot=spin_rot_o)
        draw_astronaut(img, anna_face_img, False, cx=285, cy=245, size=95, wave_arm=True, arm_angle=angle_step + math.pi, rot=spin_rot_a)

        draw_sparkle(draw, spot_x, spot_y - 18, size=8)
        draw_sparkle(draw, 180, 50, size=9)

        frames.append(img)
    save_gif(frames, "jupiter.gif")

# =========================================================================
# 7. SATURN — "Spin Like the Rings!"
# =========================================================================
def gen_saturn():
    frames = []
    for i in range(NUM_FRAMES):
        t = i / NUM_FRAMES
        angle_step = t * (2 * math.pi)
        img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE))
        draw = ImageDraw.Draw(img)
        draw_starry_bg(draw, i)

        scx, scy = 180, 125
        sr = 52
        
        rx_rad = 135
        ry_rad = 38
        draw.ellipse([scx - rx_rad, scy - ry_rad, scx + rx_rad, scy + ry_rad],
                     outline=(251, 191, 36, 180), width=12)
        draw.ellipse([scx - rx_rad + 8, scy - ry_rad + 3, scx + rx_rad - 8, scy + ry_rad - 3],
                     outline=(254, 240, 138, 220), width=5)

        draw.ellipse([scx - sr, scy - sr, scx + sr, scy + sr], fill=(245, 158, 11, 255), outline=(254, 243, 199, 255), width=2)
        draw.arc([scx - sr + 5, scy - 15, scx + sr - 5, scy + 15], start=0, end=180, fill=(254, 240, 138, 180), width=5)

        draw.arc([scx - rx_rad, scy - ry_rad, scx + rx_rad, scy + ry_rad],
                 start=0, end=180, fill=(251, 191, 36, 255), width=14)
        draw.arc([scx - rx_rad + 6, scy - ry_rad + 2, scx + rx_rad - 6, scy + ry_rad - 2],
                 start=0, end=180, fill=(254, 240, 138, 255), width=6)

        spark_angle = angle_step
        sx_sp = scx + int(math.cos(spark_angle) * rx_rad)
        sy_sp = scy + int(math.sin(spark_angle) * ry_rad)
        draw_sparkle(draw, sx_sp, sy_sp, size=10)

        bob_o = int(math.sin(angle_step) * 8)
        bob_a = int(math.cos(angle_step) * 8)
        draw_astronaut(img, olivia_face_img, True, cx=75, cy=245 + bob_o, size=95, wave_arm=True, arm_angle=angle_step)
        draw_astronaut(img, anna_face_img, False, cx=285, cy=245 + bob_a, size=95, wave_arm=True, arm_angle=angle_step + math.pi)

        frames.append(img)
    save_gif(frames, "saturn.gif")

# =========================================================================
# 8. URANUS — "Sideways Roll!"
# =========================================================================
def gen_uranus():
    frames = []
    for i in range(NUM_FRAMES):
        t = i / NUM_FRAMES
        angle_step = t * (2 * math.pi)
        img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE))
        draw = ImageDraw.Draw(img)
        draw_starry_bg(draw, i)

        ucx, ucy = 180, 125
        ur = 52
        
        draw.ellipse([ucx - 22, ucy - ur - 28, ucx + 22, ucy + ur + 28], outline=(165, 243, 252, 200), width=6)
        draw.ellipse([ucx - ur, ucy - ur, ucx + ur, ucy + ur], fill=(56, 189, 248, 255), outline=(186, 230, 253, 255), width=2)
        band_x = ucx + int(math.sin(angle_step) * 18)
        draw.line([(band_x, ucy - ur + 4), (band_x, ucy + ur - 4)], fill=(224, 242, 254, 200), width=6)

        roll_rot = int(t * 360)
        draw_astronaut(img, olivia_face_img, True, cx=75, cy=245, size=95, rot=roll_rot)
        draw_astronaut(img, anna_face_img, False, cx=285, cy=245, size=95, rot=-roll_rot)

        draw_sparkle(draw, 180, 50, size=8)
        draw_sparkle(draw, 180, 200, size=8)

        frames.append(img)
    save_gif(frames, "uranus.gif")

# =========================================================================
# 9. NEPTUNE — "Super-Wind Dance!"
# =========================================================================
def gen_neptune():
    frames = []
    for i in range(NUM_FRAMES):
        t = i / NUM_FRAMES
        angle_step = t * (2 * math.pi)
        img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE))
        draw = ImageDraw.Draw(img)
        draw_starry_bg(draw, i)

        ncx, ncy = 180, 125
        nr = 54
        
        draw.ellipse([ncx - nr, ncy - nr, ncx + nr, ncy + nr], fill=(37, 99, 235, 255), outline=(96, 165, 250, 255), width=3)
        draw.arc([ncx - nr + 8, ncy - 20, ncx + nr - 8, ncy + 5], start=160, end=320, fill=(255, 255, 255, 220), width=4)
        draw.ellipse([ncx - 18, ncy + 15, ncx + 6, ncy + 27], fill=(30, 58, 138, 255))

        for wind_i in range(5):
            wind_phase = (t + wind_i * 0.2) % 1.0
            wx1 = int(wind_phase * (CANVAS_SIZE + 100) - 50)
            wy = 60 + wind_i * 45
            wx2 = wx1 + 70
            draw.line([(wx1, wy), (wx2, wy)], fill=(186, 230, 253, 190), width=3)
            draw.arc([wx2 - 15, wy - 10, wx2 + 5, wy + 10], start=0, end=200, fill=(224, 242, 254, 220), width=3)

        glide_o = int(math.sin(angle_step) * 12)
        glide_a = int(math.cos(angle_step) * 12)
        draw_astronaut(img, olivia_face_img, True, cx=75, cy=245 + glide_o, size=95, wave_arm=True, arm_angle=angle_step)
        draw_astronaut(img, anna_face_img, False, cx=285, cy=245 + glide_a, size=95, wave_arm=True, arm_angle=angle_step + math.pi)

        frames.append(img)
    save_gif(frames, "neptune.gif")

# =========================================================================
# 10. MOON — "Sleepy Yawn!"
# =========================================================================
def gen_moon():
    frames = []
    for i in range(NUM_FRAMES):
        t = i / NUM_FRAMES
        angle_step = t * (2 * math.pi)
        img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE))
        draw = ImageDraw.Draw(img)
        draw_starry_bg(draw, i)

        mcx, mcy = 180, 125
        mr = 55
        
        draw.ellipse([mcx - mr - 6, mcy - mr - 6, mcx + mr + 6, mcy + mr + 6], fill=(254, 240, 138, 70))
        draw.ellipse([mcx - mr, mcy - mr, mcx + mr, mcy + mr], fill=(241, 245, 249, 255), outline=(203, 213, 225, 255), width=2)
        draw.ellipse([mcx - 30, mcy - 15, mcx - 16, mcy - 2], fill=(203, 213, 225, 180))
        draw.ellipse([mcx - 10, mcy + 18, mcx + 4, mcy + 30], fill=(203, 213, 225, 180))
        
        draw.arc([mcx + 6, mcy - 8, mcx + 18, mcy + 2], start=180, end=360, fill=(71, 85, 105, 255), width=3)
        draw.arc([mcx + 24, mcy - 8, mcx + 36, mcy + 2], start=180, end=360, fill=(71, 85, 105, 255), width=3)
        yawn_r = 6 + int(math.sin(angle_step) * 4)
        draw.ellipse([mcx + 16, mcy + 10 - yawn_r//2, mcx + 28, mcy + 10 + yawn_r//2], fill=(71, 85, 105, 255))
        
        cap_sway = int(math.sin(angle_step) * 8)
        draw.polygon([(mcx - 20, mcy - mr + 6), (mcx + 25, mcy - mr + 6), (mcx - 35 + cap_sway, mcy - mr - 35)],
                     fill=(99, 102, 241, 255))
        draw.ellipse([mcx - 42 + cap_sway, mcy - mr - 42, mcx - 28 + cap_sway, mcy - mr - 28], fill=(253, 224, 71, 255))

        for z_i, (zx_off, zy_off) in enumerate([(10, -20), (25, -40), (40, -65)]):
            z_drift = int(t * 15)
            draw.text((mcx + zx_off, mcy + zy_off - z_drift), "Z", fill=(199, 210, 254, 230))

        bob = int(math.sin(angle_step) * 5)
        draw_astronaut(img, olivia_face_img, True, cx=75, cy=245 + bob, size=95, wave_arm=False)
        draw_astronaut(img, anna_face_img, False, cx=285, cy=245 - bob, size=95, wave_arm=False)

        frames.append(img)
    save_gif(frames, "moon.gif")

# =========================================================================
# 11. PHOBOS — "Potato Tumble!"
# =========================================================================
def gen_phobos():
    frames = []
    for i in range(NUM_FRAMES):
        t = i / NUM_FRAMES
        angle_step = t * (2 * math.pi)
        img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE))
        draw = ImageDraw.Draw(img)
        draw_starry_bg(draw, i)

        pcx, pcy = 180, 125
        tumble_rot = t * 360
        
        p_canvas = Image.new("RGBA", (140, 140), (0, 0, 0, 0))
        p_draw = ImageDraw.Draw(p_canvas)
        p_draw.ellipse([20, 35, 120, 105], fill=(161, 98, 7, 255), outline=(202, 138, 4, 255), width=3)
        p_draw.ellipse([35, 20, 105, 115], fill=(161, 98, 7, 255))
        p_draw.ellipse([45, 50, 75, 80], fill=(113, 63, 18, 255), outline=(202, 138, 4, 255), width=2)
        p_draw.ellipse([85, 42, 98, 55], fill=(113, 63, 18, 255))
        p_draw.ellipse([70, 85, 82, 97], fill=(113, 63, 18, 255))
        
        p_canvas = p_canvas.rotate(tumble_rot, resample=Image.Resampling.BICUBIC)
        img.paste(p_canvas, (pcx - 70, pcy - 70), p_canvas)

        draw_astronaut(img, olivia_face_img, True, cx=75, cy=245, size=95, wave_arm=True, arm_angle=angle_step, rot=int(math.sin(angle_step)*25))
        draw_astronaut(img, anna_face_img, False, cx=285, cy=245, size=95, wave_arm=True, arm_angle=angle_step + math.pi, rot=int(-math.sin(angle_step)*25))

        draw_sparkle(draw, 180, 40, size=8)

        frames.append(img)
    save_gif(frames, "phobos.gif")

# =========================================================================
# 12. DEIMOS — "Tiny Pebble Dance!"
# =========================================================================
def gen_deimos():
    frames = []
    for i in range(NUM_FRAMES):
        t = i / NUM_FRAMES
        angle_step = t * (2 * math.pi)
        img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE))
        draw = ImageDraw.Draw(img)
        draw_starry_bg(draw, i)

        hop_t = (math.sin(angle_step) + 1) / 2
        dcx = int(115 + hop_t * 130)
        dcy = int(220 - math.sin(hop_t * math.pi) * 90)
        dr = 18
        
        draw.ellipse([dcx - dr, dcy - dr, dcx + dr, dcy + dr], fill=(180, 83, 9, 255), outline=(245, 158, 11, 255), width=2)
        draw.ellipse([dcx - 6, dcy - 6, dcx + 4, dcy + 4], fill=(120, 53, 15, 200))
        draw.ellipse([dcx - 7, dcy - 4, dcx - 3, dcy], fill=(255, 255, 255, 255))
        draw.ellipse([dcx + 3, dcy - 4, dcx + 7, dcy], fill=(255, 255, 255, 255))
        draw.arc([dcx - 4, dcy, dcx + 4, dcy + 5], start=0, end=180, fill=(255, 255, 255, 255), width=2)

        draw_sparkle(draw, dcx, dcy - 22, size=7)

        draw_astronaut(img, olivia_face_img, True, cx=75, cy=245, size=95, wave_arm=True, arm_angle=angle_step)
        draw_astronaut(img, anna_face_img, False, cx=285, cy=245, size=95, wave_arm=True, arm_angle=angle_step + math.pi)

        frames.append(img)
    save_gif(frames, "deimos.gif")

# =========================================================================
# 13. EUROPA — "Secret Ocean Splash!"
# =========================================================================
def gen_europa():
    frames = []
    for i in range(NUM_FRAMES):
        t = i / NUM_FRAMES
        angle_step = t * (2 * math.pi)
        img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE))
        draw = ImageDraw.Draw(img)
        draw_starry_bg(draw, i)

        ecx, ecy = 180, 135
        er = 55
        
        draw.ellipse([ecx - er, ecy - er, ecx + er, ecy + er], fill=(224, 242, 254, 255), outline=(186, 230, 253, 255), width=2)
        draw.line([(ecx - 35, ecy - 25), (ecx + 20, ecy + 30)], fill=(185, 28, 28, 180), width=3)
        draw.line([(ecx - 20, ecy + 25), (ecx + 40, ecy - 15)], fill=(185, 28, 28, 180), width=3)

        geyser_h = 75 + int(math.sin(angle_step * 2) * 20)
        draw.line([(ecx, ecy - er), (ecx, ecy - er - geyser_h)], fill=(56, 189, 248, 220), width=10)
        draw.line([(ecx, ecy - er), (ecx, ecy - er - geyser_h + 10)], fill=(255, 255, 255, 255), width=4)

        for drop_i in range(8):
            drop_angle = (drop_i / 8) * (2 * math.pi) + angle_step
            drop_dist = 30 + int(t * 50) % 50
            drop_x = ecx + int(math.cos(drop_angle) * drop_dist)
            drop_y = (ecy - er - geyser_h + 10) + int(math.sin(drop_angle) * (drop_dist // 2))
            draw.ellipse([drop_x - 5, drop_y - 5, drop_x + 5, drop_y + 5], fill=(125, 211, 252, 230), outline=(255, 255, 255, 255), width=1)

        splash_jump = int(abs(math.sin(angle_step * 2)) * 14)
        draw_astronaut(img, olivia_face_img, True, cx=75, cy=245, size=95, jump_y=-splash_jump, wave_arm=True, arm_angle=angle_step * 2)
        draw_astronaut(img, anna_face_img, False, cx=285, cy=245, size=95, jump_y=-splash_jump, wave_arm=True, arm_angle=angle_step * 2 + math.pi)

        frames.append(img)
    save_gif(frames, "europa.gif")

# =========================================================================
# 14. GANYMEDE — "Giant King Stomp!"
# =========================================================================
def gen_ganymede():
    frames = []
    for i in range(NUM_FRAMES):
        t = i / NUM_FRAMES
        angle_step = t * (2 * math.pi)
        img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE))
        draw = ImageDraw.Draw(img)
        draw_starry_bg(draw, i)

        gcx, gcy = 180, 130
        gr = 65
        
        draw.ellipse([gcx - gr, gcy - gr, gcx + gr, gcy + gr], fill=(148, 163, 184, 255), outline=(203, 213, 225, 255), width=3)
        draw.arc([gcx - 40, gcy - 20, gcx + 20, gcy + 35], start=30, end=180, fill=(71, 85, 105, 220), width=5)
        draw.arc([gcx - 10, gcy - 45, gcx + 50, gcy + 10], start=120, end=270, fill=(71, 85, 105, 220), width=5)

        crown_y = gcy - gr - 8
        draw.polygon([(gcx - 30, crown_y), (gcx - 35, crown_y - 25), (gcx - 15, crown_y - 12), (gcx, crown_y - 30),
                      (gcx + 15, crown_y - 12), (gcx + 35, crown_y - 25), (gcx + 30, crown_y)],
                     fill=(250, 204, 21, 255), outline=(202, 138, 4, 255), width=2)
        draw.ellipse([gcx - 2, crown_y - 10, gcx + 2, crown_y - 6], fill=(239, 68, 68, 255))
        draw.ellipse([gcx - 20, crown_y - 8, gcx - 16, crown_y - 4], fill=(59, 130, 246, 255))
        draw.ellipse([gcx + 16, crown_y - 8, gcx + 20, crown_y - 4], fill=(59, 130, 246, 255))

        shock_r = int((t * 120)) % 100
        draw.ellipse([gcx - shock_r, 260 - shock_r//4, gcx + shock_r, 260 + shock_r//4],
                     outline=(250, 204, 21, int(255 * (1 - shock_r / 100))), width=3)

        stomp_bounce = int(abs(math.sin(angle_step * 2)) * 18)
        draw_astronaut(img, olivia_face_img, True, cx=75, cy=245, size=95, jump_y=-stomp_bounce, wave_arm=True, arm_angle=angle_step * 2)
        draw_astronaut(img, anna_face_img, False, cx=285, cy=245, size=95, jump_y=-stomp_bounce, wave_arm=True, arm_angle=angle_step * 2 + math.pi)

        frames.append(img)
    save_gif(frames, "ganymede.gif")

# =========================================================================
# 15. CALLISTO — "Tap the Craters!"
# =========================================================================
def gen_callisto():
    frames = []
    for i in range(NUM_FRAMES):
        t = i / NUM_FRAMES
        angle_step = t * (2 * math.pi)
        img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE))
        draw = ImageDraw.Draw(img)
        draw_starry_bg(draw, i)

        ccx, ccy = 180, 125
        cr = 60
        
        draw.ellipse([ccx - cr, ccy - cr, ccx + cr, ccy + cr], fill=(71, 85, 105, 255), outline=(148, 163, 184, 255), width=2)
        
        craters = [
            (ccx - 25, ccy - 20, 12, (56, 189, 248)),
            (ccx + 22, ccy - 22, 14, (250, 204, 21)),
            (ccx - 10, ccy + 18, 15, (244, 63, 94)),
            (ccx + 28, ccy + 15, 11, (52, 211, 153))
        ]
        
        active_crater = int(t * len(craters)) % len(craters)
        for idx, (cx_c, cy_c, r_c, col) in enumerate(craters):
            is_active = (idx == active_crater)
            ring_col = col + (255,) if is_active else (203, 213, 225, 140)
            fill_col = col + (180,) if is_active else (51, 65, 85, 255)
            draw.ellipse([cx_c - r_c, cy_c - r_c, cx_c + r_c, cy_c + r_c], fill=fill_col, outline=ring_col, width=3)
            if is_active:
                draw_sparkle(draw, cx_c, cy_c, size=10, color=col + (255,))

        draw_astronaut(img, olivia_face_img, True, cx=75, cy=245, size=95, wave_arm=True, arm_angle=angle_step * 2)
        draw_astronaut(img, anna_face_img, False, cx=285, cy=245, size=95, wave_arm=True, arm_angle=angle_step * 2 + math.pi)

        frames.append(img)
    save_gif(frames, "callisto.gif")

# =========================================================================
# 16. TITAN — "Pop the Moon Bubbles!"
# =========================================================================
def gen_titan():
    frames = []
    for i in range(NUM_FRAMES):
        t = i / NUM_FRAMES
        angle_step = t * (2 * math.pi)
        img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE))
        draw = ImageDraw.Draw(img)
        draw_starry_bg(draw, i)

        tcx, tcy = 180, 125
        tr = 58
        
        draw.ellipse([tcx - tr - 6, tcy - tr - 6, tcx + tr + 6, tcy + tr + 6], fill=(251, 146, 60, 90))
        draw.ellipse([tcx - tr, tcy - tr, tcx + tr, tcy + tr], fill=(245, 158, 11, 255), outline=(254, 215, 170, 255), width=2)
        
        for b_i in range(6):
            b_phase = (t + b_i * (1.0 / 6)) % 1.0
            bx = int(60 + b_i * 45 + math.sin(b_phase * math.pi * 2) * 12)
            by = int(280 - b_phase * 180)
            br = 12
            draw.ellipse([bx - br, by - br, bx + br, by + br], fill=(251, 146, 60, 140), outline=(254, 240, 138, 220), width=2)
            draw.arc([bx - br + 3, by - br + 3, bx + br - 3, by - 2], start=200, end=330, fill=(255, 255, 255, 230), width=2)
            if b_phase > 0.85:
                draw_sparkle(draw, bx, by, size=8, color=(254, 240, 138, 255))

        draw_astronaut(img, olivia_face_img, True, cx=75, cy=245, size=95, wave_arm=True, arm_angle=angle_step * 2)
        draw_astronaut(img, anna_face_img, False, cx=285, cy=245, size=95, wave_arm=True, arm_angle=angle_step * 2 + math.pi)

        frames.append(img)
    save_gif(frames, "titan.gif")

# =========================================================================
# 17. ENCELADUS — "Jump with the Geyser!"
# =========================================================================
def gen_enceladus():
    frames = []
    for i in range(NUM_FRAMES):
        t = i / NUM_FRAMES
        angle_step = t * (2 * math.pi)
        img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE))
        draw = ImageDraw.Draw(img)
        draw_starry_bg(draw, i)

        ecx, ecy = 180, 220
        er = 50
        
        geyser_h = 130 + int(math.sin(angle_step * 2) * 25)
        draw.line([(ecx - 30, ecy - er + 10), (ecx - 85, ecy - er - geyser_h)], fill=(56, 189, 248, 220), width=12)
        draw.line([(ecx - 30, ecy - er + 10), (ecx - 85, ecy - er - geyser_h + 10)], fill=(255, 255, 255, 255), width=5)
        draw.line([(ecx + 30, ecy - er + 10), (ecx + 85, ecy - er - geyser_h)], fill=(56, 189, 248, 220), width=12)
        draw.line([(ecx + 30, ecy - er + 10), (ecx + 85, ecy - er - geyser_h + 10)], fill=(255, 255, 255, 255), width=5)

        draw.ellipse([ecx - er, ecy - er, ecx + er, ecy + er], fill=(248, 250, 252, 255), outline=(186, 230, 253, 255), width=3)
        draw.line([(ecx - 22, ecy - 10), (ecx - 14, ecy + 25)], fill=(14, 165, 233, 230), width=3)
        draw.line([(ecx - 6, ecy - 12), (ecx + 2, ecy + 28)], fill=(14, 165, 233, 230), width=3)
        draw.line([(ecx + 12, ecy - 10), (ecx + 18, ecy + 24)], fill=(14, 165, 233, 230), width=3)

        boost_y = int(math.sin(angle_step * 2) * 16)
        draw_astronaut(img, olivia_face_img, True, cx=95, cy=110 + boost_y, size=95, wave_arm=True, arm_angle=angle_step * 2)
        draw_astronaut(img, anna_face_img, False, cx=265, cy=110 + boost_y, size=95, wave_arm=True, arm_angle=angle_step * 2 + math.pi)

        draw_sparkle(draw, 95, 80 + boost_y, size=9)
        draw_sparkle(draw, 265, 80 + boost_y, size=9)

        frames.append(img)
    save_gif(frames, "enceladus.gif")

# =========================================================================
# 18. TRITON — "Backwards Moon Step!"
# =========================================================================
def gen_triton():
    frames = []
    for i in range(NUM_FRAMES):
        t = i / NUM_FRAMES
        angle_step = t * (2 * math.pi)
        img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE))
        draw = ImageDraw.Draw(img)
        draw_starry_bg(draw, i)

        tcx = int(CANVAS_SIZE - t * CANVAS_SIZE)
        tcy = 120
        tr = 50
        
        draw.ellipse([tcx - tr, tcy - tr, tcx + tr, tcy + tr], fill=(251, 146, 60, 255), outline=(254, 205, 211, 255), width=2)
        draw.ellipse([tcx - 20, tcy - 15, tcx - 8, tcy - 4], fill=(244, 63, 94, 160))
        draw.ellipse([tcx + 5, tcy - 18, tcx + 18, tcy - 5], fill=(244, 63, 94, 160))
        draw.ellipse([tcx - 10, tcy + 10, tcx + 6, tcy + 22], fill=(244, 63, 94, 160))
        
        draw_sparkle(draw, tcx, tcy - 40, size=10, color=(244, 114, 182, 255))

        walk_slide_o = int(math.sin(angle_step) * 12)
        walk_slide_a = int(math.cos(angle_step) * 12)
        draw_astronaut(img, olivia_face_img, True, cx=80 + walk_slide_o, cy=245, size=95, wave_arm=True, arm_angle=angle_step * 2)
        draw_astronaut(img, anna_face_img, False, cx=280 + walk_slide_a, cy=245, size=95, wave_arm=True, arm_angle=angle_step * 2 + math.pi)

        draw.line([(50, 298), (110, 298)], fill=(244, 114, 182, 190), width=3)
        draw.line([(250, 298), (310, 298)], fill=(192, 132, 252, 190), width=3)

        frames.append(img)
    save_gif(frames, "triton.gif")

# =========================================================================
# 19. PLUTO — "Touch Pluto Heart!"
# =========================================================================
def gen_pluto():
    frames = []
    for i in range(NUM_FRAMES):
        t = i / NUM_FRAMES
        angle_step = t * (2 * math.pi)
        img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE))
        draw = ImageDraw.Draw(img)
        draw_starry_bg(draw, i)

        pcx, pcy = 180, 125
        pr = 52
        
        draw.ellipse([pcx - pr, pcy - pr, pcx + pr, pcy + pr], fill=(217, 119, 6, 255), outline=(254, 215, 170, 255), width=2)
        
        heart_scale = 16 + int(math.sin(angle_step * 2) * 4)
        draw_heart(draw, pcx, pcy + 8, size=heart_scale, color=(255, 241, 242, 255))
        draw_heart(draw, pcx, pcy + 8, size=heart_scale + 4, color=(244, 63, 94, 90))

        draw_heart(draw, pcx - 25, pcy - 20 - int(t * 25), size=8)
        draw_heart(draw, pcx + 25, pcy - 30 - int((t + 0.5) % 1.0 * 25), size=9)

        draw_astronaut(img, olivia_face_img, True, cx=75, cy=245, size=95, wave_arm=True, arm_angle=angle_step)
        draw_astronaut(img, anna_face_img, False, cx=285, cy=245, size=95, wave_arm=True, arm_angle=angle_step + math.pi)

        draw_sparkle(draw, pcx, pcy + 8, size=8)

        frames.append(img)
    save_gif(frames, "pluto.gif")

# =========================================================================
# 20. CERES — "Make the Spots Glow!"
# =========================================================================
def gen_ceres():
    frames = []
    for i in range(NUM_FRAMES):
        t = i / NUM_FRAMES
        angle_step = t * (2 * math.pi)
        img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE))
        draw = ImageDraw.Draw(img)
        draw_starry_bg(draw, i)

        ccx, ccy = 180, 125
        cr = 50
        
        draw.ellipse([ccx - cr, ccy - cr, ccx + cr, ccy + cr], fill=(100, 116, 139, 255), outline=(148, 163, 184, 255), width=2)
        draw.ellipse([ccx - 28, ccy - 12, ccx - 14, ccy + 2], fill=(71, 85, 105, 220))
        draw.ellipse([ccx + 12, ccy + 10, ccx + 26, ccy + 24], fill=(71, 85, 105, 220))

        spot_glow = 8 + int(math.sin(angle_step * 2) * 5)
        draw.ellipse([ccx - spot_glow - 6, ccy - spot_glow - 4, ccx + spot_glow + 6, ccy + spot_glow + 4],
                     fill=(254, 240, 138, 120))
        draw.ellipse([ccx - 6, ccy - 4, ccx + 6, ccy + 4], fill=(255, 255, 255, 255))
        draw.ellipse([ccx + 7, ccy - 2, ccx + 12, ccy + 3], fill=(254, 240, 138, 255))
        
        draw_sparkle(draw, ccx, ccy, size=16 + spot_glow, color=(254, 240, 138, 255))

        draw_astronaut(img, olivia_face_img, True, cx=75, cy=245, size=95, wave_arm=True, arm_angle=angle_step)
        draw_astronaut(img, anna_face_img, False, cx=285, cy=245, size=95, wave_arm=True, arm_angle=angle_step + math.pi)

        frames.append(img)
    save_gif(frames, "ceres.gif")

# =========================================================================
# 21. DEFAULT — Cosmic Celebration High-Five!
# =========================================================================
def gen_default():
    frames = []
    for i in range(NUM_FRAMES):
        t = i / NUM_FRAMES
        angle_step = t * (2 * math.pi)
        img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE))
        draw = ImageDraw.Draw(img)
        draw_starry_bg(draw, i)

        scx, scy = 180, 115
        sr = 50 + int(math.sin(angle_step * 2) * 4)
        draw.ellipse([scx - sr, scy - sr, scx + sr, scy + sr], fill=(168, 85, 247, 255), outline=(216, 180, 254, 255), width=3)
        draw_heart(draw, scx, scy, size=14, color=(250, 204, 21, 255))

        for conf_i in range(8):
            conf_rad = math.radians(conf_i * 45) + angle_step
            conf_dist = 65 + int(math.sin(angle_step + conf_i) * 15)
            cx_c = scx + int(math.cos(conf_rad) * conf_dist)
            cy_c = scy + int(math.sin(conf_rad) * conf_dist)
            draw_sparkle(draw, cx_c, cy_c, size=7)

        bob = int(math.sin(angle_step * 2) * 8)
        draw_astronaut(img, olivia_face_img, True, cx=75, cy=245 + bob, size=95, wave_arm=True, arm_angle=angle_step * 2)
        draw_astronaut(img, anna_face_img, False, cx=285, cy=245 - bob, size=95, wave_arm=True, arm_angle=angle_step * 2 + math.pi)

        frames.append(img)
    save_gif(frames, "default.gif")

def main():
    generators = [
        gen_sun, gen_mercury, gen_venus, gen_earth, gen_mars,
        gen_jupiter, gen_saturn, gen_uranus, gen_neptune,
        gen_moon, gen_phobos, gen_deimos, gen_europa,
        gen_ganymede, gen_callisto, gen_titan, gen_enceladus,
        gen_triton, gen_pluto, gen_ceres, gen_default
    ]
    print(f"Generating {len(generators)} animated interaction GIFs...")
    for gen in generators:
        gen()
    print("All interaction GIFs generated successfully!")

if __name__ == "__main__":
    main()
