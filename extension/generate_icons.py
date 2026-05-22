"""
Generate placeholder PNG icons for the extension.
Run once: python generate_icons.py
Requires: pip install Pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Install Pillow first: pip install Pillow")
    raise

import os

SIZES = [16, 32, 48, 128]
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "icons")
os.makedirs(OUTPUT_DIR, exist_ok=True)

BG_COLOR = (15, 17, 26)       # #0f111a
RING_COLOR = (96, 165, 250)   # #60a5fa blue
TEXT_COLOR = (255, 255, 255)


def make_icon(size: int):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background circle
    margin = max(1, size // 16)
    draw.ellipse([margin, margin, size - margin, size - margin], fill=BG_COLOR)

    # Ring
    ring_w = max(1, size // 10)
    draw.ellipse(
        [margin + ring_w, margin + ring_w, size - margin - ring_w, size - margin - ring_w],
        outline=RING_COLOR, width=ring_w
    )

    # "U" letter centered
    font_size = max(6, int(size * 0.45))
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except Exception:
        font = ImageFont.load_default()

    text = "U"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(
        ((size - tw) // 2 - bbox[0], (size - th) // 2 - bbox[1]),
        text, fill=TEXT_COLOR, font=font
    )

    path = os.path.join(OUTPUT_DIR, f"icon{size}.png")
    img.save(path, "PNG")
    print(f"Created {path}")


for s in SIZES:
    make_icon(s)

print("Icons generated successfully.")
