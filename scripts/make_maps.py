"""Schematic region maps for the five heritage styles (public/img/<id>/map.webp).

The outline of Saudi Arabia is a hand-simplified polygon — good enough to
show *where* a style belongs, not for navigation.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1180, 787
OUTLINE = [
    (34.95, 29.36), (36.07, 29.19), (36.75, 29.87), (37.99, 30.50), (37.00, 31.50), (39.00, 32.16),
    (40.40, 31.90), (42.00, 31.10), (44.70, 29.20), (46.40, 29.10), (47.70, 28.50), (48.42, 28.55),
    (48.80, 27.70), (49.30, 27.20), (50.10, 26.70), (50.20, 26.10), (50.10, 25.60), (50.60, 25.00),
    (50.80, 24.75), (51.60, 24.25), (52.60, 22.90), (55.10, 22.60), (55.60, 22.00), (55.00, 20.00),
    (52.00, 19.00), (49.10, 18.60), (47.50, 17.10), (46.70, 17.30), (44.20, 17.40), (43.30, 17.50),
    (43.00, 16.70), (42.60, 16.60), (42.30, 17.40), (41.50, 18.60), (40.80, 19.60), (40.30, 20.15),
    (39.60, 20.90), (39.15, 21.50), (39.00, 22.80), (38.50, 23.60), (38.05, 24.10), (37.25, 25.05),
    (36.45, 26.20), (35.70, 27.35), (35.10, 28.10), (34.60, 28.10), (34.80, 28.90),
]
CITIES = {
    "Riyadh": (46.72, 24.71), "Jeddah": (39.17, 21.54), "Makkah": (39.83, 21.42), "Madinah": (39.61, 24.47),
    "Abha": (42.50, 18.22), "Qatif": (50.01, 26.56), "Dammam": (50.10, 26.43), "Al-Ahsa": (49.59, 25.38),
    "Ha'il": (41.69, 27.52), "Tabuk": (36.57, 28.38), "Najran": (44.13, 17.49), "Buraydah": (43.97, 26.33),
    "Unaizah": (43.99, 26.08), "Sakaka": (40.21, 29.97), "Arar": (41.02, 30.98), "Rafha": (43.50, 29.62),
    "Al-Ula": (37.92, 26.61), "Taif": (40.42, 21.27), "Al-Baha": (41.47, 20.01), "Jazan": (42.55, 16.89),
    "Farasan": (42.12, 16.70), "Hofuf": (49.59, 25.38),
}
STYLES = {
    "najdi": {"centre": (45.2, 25.4), "r": (3.4, 2.6), "cities": ["Riyadh", "Buraydah", "Ha'il"], "label": "NAJD"},
    "salmani": {"centre": (46.72, 24.71), "r": (1.4, 1.1), "cities": ["Riyadh"], "label": "RIYADH"},
    "hijazi": {"centre": (39.4, 22.6), "r": (1.6, 3.0), "cities": ["Jeddah", "Makkah", "Madinah"], "label": "HIJAZ"},
    "asiri": {"centre": (42.6, 18.4), "r": (1.5, 1.3), "cities": ["Abha", "Najran"], "label": "ASIR"},
    "eastern": {"centre": (49.8, 25.9), "r": (1.2, 1.9), "cities": ["Qatif", "Dammam", "Al-Ahsa"], "label": "EASTERN PROVINCE"},
    "qassimi": {"centre": (43.8, 26.2), "r": (1.7, 1.4), "cities": ["Buraydah", "Unaizah"], "label": "QASSIM"},
    "haili": {"centre": (41.6, 27.5), "r": (2.1, 1.7), "cities": ["Ha'il"], "label": "HA'IL"},
    "jouf": {"centre": (40.0, 29.9), "r": (1.9, 1.4), "cities": ["Sakaka"], "label": "AL-JOUF"},
    "northern": {"centre": (42.2, 30.5), "r": (2.8, 1.2), "cities": ["Arar", "Rafha"], "label": "NORTHERN BORDERS"},
    "tabuki": {"centre": (36.9, 28.3), "r": (1.9, 1.7), "cities": ["Tabuk"], "label": "TABUK"},
    "ulai": {"centre": (37.92, 26.61), "r": (1.0, 0.9), "cities": ["Al-Ula"], "label": "AL-ULA"},
    "madani": {"centre": (39.61, 24.47), "r": (1.4, 1.3), "cities": ["Madinah"], "label": "MADINAH"},
    "taifi": {"centre": (40.42, 21.27), "r": (1.0, 0.9), "cities": ["Taif", "Makkah"], "label": "TAIF"},
    "bahi": {"centre": (41.47, 20.01), "r": (1.0, 0.9), "cities": ["Al-Baha"], "label": "AL-BAHA"},
    "tihami": {"centre": (41.9, 18.6), "r": (0.9, 1.7), "cities": ["Jazan", "Abha"], "label": "TIHAMA"},
    "jazani": {"centre": (42.6, 17.0), "r": (1.0, 0.8), "cities": ["Jazan"], "label": "JAZAN"},
    "farasani": {"centre": (42.12, 16.70), "r": (0.55, 0.45), "cities": ["Farasan", "Jazan"], "label": "FARASAN"},
    "najrani": {"centre": (44.13, 17.49), "r": (1.4, 1.1), "cities": ["Najran"], "label": "NAJRAN"},
    "ahsai": {"centre": (49.59, 25.38), "r": (1.2, 1.0), "cities": ["Hofuf", "Al-Ahsa"], "label": "AL-AHSA"},
}

NUDGE = {"Makkah": (10, 16), "Jeddah": (-10, -12), "Dammam": (10, 14), "Qatif": (10, -12),
         "Unaizah": (10, 14), "Hofuf": (-10, 14), "Farasan": (-10, 10), "Rafha": (10, 14),
         "Al-Ula": (-10, -2), "Al-Baha": (-10, 12)}
LON0, LON1, LAT0, LAT1 = 33.0, 57.5, 15.2, 33.2


def xy(lon, lat):
    return ((lon - LON0) / (LON1 - LON0) * W, (LAT1 - lat) / (LAT1 - LAT0) * H)


def font(size, bold=False):
    for name in (("georgiab.ttf" if bold else "georgia.ttf"), "DejaVuSerif.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def draw_map(sid, spec, out):
    img = Image.new("RGB", (W, H), "#f3ebdd")
    d = ImageDraw.Draw(img)
    # graticule
    for lon in range(34, 58, 2):
        d.line([xy(lon, LAT0), xy(lon, LAT1)], fill="#e6dcc8", width=1)
    for lat in range(16, 34, 2):
        d.line([xy(LON0, lat), xy(LON1, lat)], fill="#e6dcc8", width=1)
    # seas
    d.text(xy(36.2, 22.0), "RED SEA", fill="#9fb3bb", font=font(20), anchor="mm")
    d.text(xy(52.9, 27.9), "ARABIAN GULF", fill="#9fb3bb", font=font(20), anchor="mm")
    pts = [xy(*p) for p in OUTLINE]
    shadow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(shadow).polygon([(x + 6, y + 8) for x, y in pts], fill=90)
    img.paste("#d9ccb3", (0, 0), shadow.filter(ImageFilter.GaussianBlur(8)))
    d.polygon(pts, fill="#fbf6ec", outline="#8c7a61")
    d.line(pts + [pts[0]], fill="#8c7a61", width=2)
    # region halo
    cx, cy = xy(*spec["centre"])
    rx = spec["r"][0] / (LON1 - LON0) * W
    ry = spec["r"][1] / (LAT1 - LAT0) * H
    halo = Image.new("L", (W, H), 0)
    ImageDraw.Draw(halo).ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=150)
    img.paste("#b0492a", (0, 0), halo.filter(ImageFilter.GaussianBlur(18)))
    d = ImageDraw.Draw(img)
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], outline="#8f3a20", width=2)
    # cities
    for name, (lon, lat) in CITIES.items():
        x, y = xy(lon, lat)
        key = name in spec["cities"]
        r = 6 if key else 3
        d.ellipse([x - r, y - r, x + r, y + r], fill="#2b2219" if key else "#9a8a72")
        dx, dy = NUDGE.get(name, (10, -2))
        d.text((x + dx, y + dy), name, fill="#2b2219" if key else "#9a8a72", font=font(19 if key else 15, key),
               anchor="rm" if dx < 0 else "lm")
    d.text((cx, cy - ry - 22), spec["label"], fill="#8f3a20", font=font(26, True), anchor="mm")
    d.text((W - 36, H - 30), "Schematic — Kingdom of Saudi Arabia", fill="#9a8a72", font=font(16), anchor="rm")
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, "WEBP", quality=88)


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1] / "public" / "img"
    for sid, spec in STYLES.items():
        draw_map(sid, spec, root / sid / "map.webp")
        print("wrote", sid)
