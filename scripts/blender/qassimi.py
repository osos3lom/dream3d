# Qassimi villa — Najd of the north: battered buttress piers, slit parapet, palm-trunk riwaq.
PREFIX = "Qassimi"
MATS = {
    "mud": ("#cfa470", 0.95, 0.0), "mud_dark": ("#a07a4c", 0.95, 0.0), "shadow": ("#2a2019", 0.9, 0.0),
    "door": ("#2f5f4a", 0.6, 0.0), "paint": ("#d8452f", 0.6, 0.0), "paint2": ("#e8c24e", 0.6, 0.0),
    "glass": ("#1c262c", 0.08, 0.5), "frame": ("#3b2d22", 0.5, 0.3), "wood": ("#7d5a35", 0.8, 0.0),
    "pave": ("#e2d2b2", 0.9, 0.0), "court": ("#d3bc94", 0.9, 0.0), "lawn": ("#6d8a47", 0.95, 0.0),
    "water": ("#3a8fa8", 0.05, 0.0), "coping": ("#eadcc0", 0.8, 0.0),
    "trunk": ("#7a5f45", 0.95, 0.0), "leaf": ("#5b7438", 0.8, 0.0),
}
BG = "#ecdfc6"


def pier(g, fr, x, z0, z1, w=0.8, dep=0.6, steps=3):
    """Battered buttress — depth falls away as it rises."""
    dz = (z1 - z0) / steps
    for k in range(steps):
        g.lbox("mud", fr, x - w / 2 + k * 0.05, x + w / 2 - k * 0.05,
               z0 + k * dz, z0 + (k + 1) * dz, 0, dep * (1 - k * 0.28))


def slit_parapet(g, x0, y0, x1, y1, z, h=1.3, t=0.34):
    """Parapet pierced by tall narrow slits, capped by a dark string course."""
    for sd, pl, u0, u1 in (("S", y0, x0, x1), ("N", y1, x0, x1), ("W", x0, y0, y1), ("E", x1, y0, y1)):
        fr = face(sd, pl)
        hs = []
        a = u0 + 0.6
        while a < u1 - 0.7:
            hs.append((a, a + 0.18, z + 0.35, z + h - 0.3))
            a += 0.62
        g.wall("mud", fr, u0, u1, z, z + h, t, hs)
    g.band("mud_dark", x0, y0, x1, y1, z + h - 0.12, 0.12, 0.05)


def build(g):
    Z0 = 0.25
    g.box("pave", -17, -14, 0, 17, 14, Z0)
    g.box("lawn", -16.5, -13.5, Z0, -2.8, -10.4, Z0 + 0.06)
    g.box("lawn", 2.8, -13.5, Z0, 16.5, -10.4, Z0 + 0.06)
    g.box("lawn", -16.5, -9.6, Z0, -12.4, 13.5, Z0 + 0.06)
    g.box("lawn", 12.4, -9.6, Z0, 16.5, 13.5, Z0 + 0.06)
    g.box("court", -6.5, -3, Z0, 6.5, 5.5, Z0 + 0.03)

    fS = face("S", -9)
    hS = [(-1.4, 1.4, Z0, 3.4, "door"), (-9.4, -4.4, 0.6, 3.1), (4.4, 9.4, 0.6, 3.1)]
    for x in (-8.4, -6.4, -4.4, 4.4, 6.4, 8.4):
        hS.append((x - 0.3, x + 0.3, 4.3, 5.9))
    g.vol("mud", -11, -9, 11, -3, Z0, 6.2, t=0.5, sill="mud_dark", holes={
        "S": hS, "N": [(-6, 6, Z0 + 0.05, 3.4), (-5, 5, 4.2, 5.8)],
        "W": [(-7, -5.4, 1.4, 3.0), (-6.8, -5.6, 4.3, 5.9)], "E": [(-7, -5.4, 1.4, 3.0)]})
    for x in (-10.2, -2.6, 2.6, 10.2):
        pier(g, fS, x, Z0, 6.2, 0.9, 0.65)
    slit_parapet(g, -11, -9, 11, -3, 6.2)
    g.band("mud_dark", -11, -9, 11, -3, 3.6, 0.16, 0.05)
    g.band("mud_dark", -11, -9, 11, -3, Z0, 0.45, 0.07)
    # carved and painted door
    g.lbox("mud_dark", fS, -1.85, -1.4, Z0, 3.85, 0, 0.12)
    g.lbox("mud_dark", fS, 1.4, 1.85, Z0, 3.85, 0, 0.12)
    g.lbox("mud_dark", fS, -1.85, 1.85, 3.4, 3.85, 0, 0.12)
    for z in (0.8, 1.5, 2.2, 2.9):
        g.tri_row(["paint", "paint2"], fS, -1.2, 1.2, z, 0.3, 0.26, 0.31, -0.35, -0.32)
    g.lbox("paint2", fS, -0.05, 0.05, Z0, 3.4, -0.35, -0.32)
    g.lbox("wood", fS, -2.2, 2.2, 3.85, 4.1, 0, 0.9)

    # side and rear wings
    g.vol("mud", -11, -3, -6.5, 9.5, Z0, 3.9, t=0.5, sill="mud_dark", holes={
        "W": [(0, 1.0, 1.4, 3.0), (3.6, 4.6, 1.4, 3.0), (7.2, 8.2, 1.4, 3.0)],
        "E": [(-2.4, 5.2, Z0 + 0.05, 3.3)], "N": [(-9.6, -7.6, 1.4, 3.0)]})
    slit_parapet(g, -11, -3, -6.5, 9.5, 3.9, 1.0, 0.3)
    g.vol("mud", 6.5, -3, 11, 9.5, Z0, 3.9, t=0.5, sill="mud_dark", holes={
        "E": [(0, 1.0, 1.4, 3.0), (3.6, 4.6, 1.4, 3.0), (7.2, 8.2, 1.4, 3.0)],
        "W": [(-2.4, 5.2, Z0 + 0.05, 3.3)]})
    slit_parapet(g, 6.5, -3, 11, 9.5, 3.9, 1.0, 0.3)
    g.vol("mud", -6.5, 5.5, 6.5, 9.5, Z0, 4.6, t=0.5, sill="mud_dark", holes={
        "S": [(-5.4, 5.4, Z0 + 0.05, 3.4)], "N": [(-3.6, -2.6, 1.4, 3.0), (2.6, 3.6, 1.4, 3.0)]})
    slit_parapet(g, -6.5, 5.5, 6.5, 9.5, 4.6, 1.1, 0.3)

    # riwaq of palm-trunk columns along the court's north edge
    for x in [i * 1.6 - 5.6 for i in range(8)]:
        g.cyl("trunk", x, 4.6, Z0, 3.4, 0.24, 0.2, seg=9)
        g.box("wood", x - 0.3, 4.3, 3.4, x + 0.3, 4.9, 3.6)
    g.box("wood", -6.2, 4.25, 3.6, 6.2, 4.95, 3.78)
    for y in [4.3 + i * 0.5 for i in range(2)]:
        g.box("wood", -6.2, y, 3.78, 6.2, y + 0.12, 3.9)

    g.pool(-2.8, -1.2, 2.8, 2.4, Z0 + 0.03)
    g.palm(-5.2, 1.0, 6.4, seed=201)
    g.palm(5.2, 1.0, 5.9, seed=202)
    for i, (x, y, h) in enumerate([(-13.8, -11.0, 7.2), (13.8, -11.0, 6.9), (-14.2, 2.0, 6.6),
                                   (14.2, 1.0, 7.2), (-13.6, 10.6, 6.3), (13.6, 10.6, 6.7)]):
        g.palm(x, y, h, seed=210 + i)
    for i, x in enumerate((-7.6, -5.6, 5.6, 7.6)):
        g.shrub(x, -11.9, 0.6, seed=220 + i)
    g.box("coping", -2.8, -14, Z0, 2.8, -9, Z0 + 0.02)

    g.anchor("buttress", -10.2, -9.6, 3.2, "wall")
    g.anchor("slit-parapet", -5.0, -9.1, 7.2, "roof")
    g.anchor("painted-door", 0.0, -9.1, 2.2, "wall")
    g.anchor("riwaq", 0.0, 4.6, 3.9, "roof")
    g.anchor("courtyard", 0.0, 0.5, 0.3, "court")


CAMERA = {"target": (0, 0, 3.5), "hero": (-35, 24, 50, 35), "thumb": (-30, 30, 44, 35),
          "detail": ((-6, -9.5, 4.2), -24, 8, 15, 48), "court": ((3.0, -2.0, 1.7), (-1.0, 5.0, 3.0), 22),
          "street": ((7.2, -13.2, 1.7), (0, -9, 3.4), 26)}
