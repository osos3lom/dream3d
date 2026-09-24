"""Turn the Blender renders into the app's image set (public/img/<id>/*.webp).

Usage: python scripts/compose_images.py <renders-dir>

Renders with a transparent background (hero, thumbnail, detail, plan) are
laid onto the viewer's warm paper tone; eye-level shots keep their sky.
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

STYLES = ["najdi", "salmani", "hijazi", "asiri", "eastern"]
# render name -> (published name, transparent?)
SHOTS = {
    "hero": ("hero", True),
    "thumbnail": ("thumbnail", True),
    "detail": ("artifacts", True),
    "plan": ("floor-plan", True),
    "court": ("interior", False),
    "street": ("daily-life", False),
}


def paper(size):
    w, h = size
    bg = Image.new("RGB", size, "#f1e9db")
    glow = Image.new("L", size, 0)
    ImageDraw.Draw(glow).ellipse([w * 0.08, h * 0.02, w * 0.92, h * 0.98], fill=255)
    bg.paste(Image.new("RGB", size, "#faf6ef"), (0, 0), glow.filter(ImageFilter.GaussianBlur(min(w, h) // 5)))
    return bg


def main(src):
    root = Path(__file__).resolve().parents[1] / "public" / "img"
    for sid in STYLES:
        for shot, (out, transparent) in SHOTS.items():
            f = src / f"{sid}-{shot}.png"
            if not f.exists():
                print("missing", f.name)
                continue
            im = Image.open(f).convert("RGBA")
            if transparent:
                base = paper(im.size).convert("RGBA")
                base.alpha_composite(im)
                im = base
            dest = root / sid / f"{out}.webp"
            dest.parent.mkdir(parents=True, exist_ok=True)
            im.convert("RGB").save(dest, "WEBP", quality=86, method=6)
            print("wrote", dest.relative_to(root.parent.parent))


if __name__ == "__main__":
    main(Path(sys.argv[1]))
