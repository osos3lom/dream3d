# Eastern Coastal villa — coral & gypsum courtyard house, carved gypsum screens, danchal beams, badgir.
import math as _m
import random as _r

PREFIX = "Eastern"
MATS = {
    "gypsum": ("#efe8d8", 0.85, 0.0), "screen": ("#f7f2e7", 0.8, 0.0), "coral": ("#cbb997", 0.95, 0.0),
    "coral_dark": ("#a9977a", 0.95, 0.0), "wood": ("#6f4b2e", 0.8, 0.0), "door": ("#2f6e8e", 0.55, 0.0),
    "shadow": ("#2a241e", 0.9, 0.0), "glass": ("#1f2c34", 0.06, 0.5), "frame": ("#5b4128", 0.6, 0.0),
    "court_a": ("#e2d3b5", 0.85, 0.0), "court_b": ("#c6b08b", 0.85, 0.0), "pave": ("#e6dac3", 0.9, 0.0),
    "lawn": ("#6b8a46", 0.95, 0.0), "water": ("#2f95b8", 0.05, 0.0), "coping": ("#f1e9da", 0.8, 0.0),
    "trunk": ("#7a5f45", 0.95, 0.0), "leaf": ("#5b7438", 0.8, 0.0),
}
BG = "#e3e6e2"


def coral_skin(g, fr, u0, u1, z0, z1, seed):
    """Proud coral-stone course with irregular blocks, the texture of Qatif walls."""
    g.lbox("coral", fr, u0, u1, z0, z1, 0, 0.06)
    rr = _r.Random(seed)
    for _ in range(int((u1 - u0) * 2.2)):
        a = rr.uniform(u0, u1 - 0.4)
        b = rr.uniform(z0 + 0.05, z1 - 0.3)
        g.lbox("coral_dark", fr, a, a + rr.uniform(0.25, 0.5), b, b + rr.uniform(0.15, 0.25), 0.06, 0.09)


def gypsum_screen(g, fr, a0, a1, b0, b1, t):
    """Carved gypsum grille: a coarse diagonal-feel lattice with glass behind."""
    g.lbox("glass", fr, a0, a1, b0, b1, -t * 0.7 - 0.03, -t * 0.7)
    g.lattice("screen", fr, a0, a1, b0, b1, -t * 0.35 - 0.06, -t * 0.35, cell=0.22, bar=0.06)


def pointed_arcade(g, fr, u0, u1, zs, za, ztop, t, bay=2.0, pier=0.5):
    n = int((u1 - u0) / bay)
    w = (u1 - u0) / n
    k = 0.85
    for i in range(n):
        a0 = u0 + i * w + pier / 2
        a1 = u0 + (i + 1) * w - pier / 2
        mid = (a0 + a1) / 2
        g.lbox("gypsum", fr, u0 + i * w - pier / 2 if i else u0, a0, 0.25, ztop, -t, 0)
        L, R = [], []
        for j in range(9):
            s = j / 8
            z = zs + (za - zs) * _m.sin(s * _m.pi / 2 * k) / _m.sin(_m.pi / 2 * k)
            L.append((a0 + (mid - a0) * s, z))
            R.append((a1 - (a1 - mid) * s, z))
        g.poly("gypsum", [(a0, zs)] + L[1:] + [(mid, ztop), (a0, ztop)], fr, -t, 0)
        g.poly("gypsum", [(a1, ztop), (mid, ztop)] + R[::-1][:-1] + [(a1, zs)], fr, -t, 0)
    g.lbox("gypsum", fr, u1 - pier / 2, u1, 0.25, ztop, -t, 0)


def build(g):
    Z0 = 0.25
    T = 0.45
    g.box("pave", -17, -14, 0, 17, 14, Z0)
    g.box("lawn", -16.5, -13.5, Z0, -2.6, -11.0, Z0 + 0.06)
    g.box("lawn", 2.6, -13.5, Z0, 16.5, -11.0, Z0 + 0.06)
    g.box("lawn", -16.5, 11.0, Z0, 16.5, 13.5, Z0 + 0.06)

    # front wing — two storeys
    fS = face("S", -10)
    up = [x for x in (-10.5, -7.0, -3.5, 3.5, 7.0, 10.5)]
    hS = [(-1.4, 1.4, Z0, 3.4, "door")] + [(x - 0.6, x + 0.6, 1.3, 3.1, "open") for x in (-9.0, -5.0, 5.0, 9.0)]
    hS += [(x - 0.9, x + 0.9, 4.3, 6.6, "open") for x in up]
    g.vol("gypsum", -13, -10, 13, -5, Z0, 7.45, t=T, holes={
        "S": hS, "N": [(-7.5, 7.5, Z0 + 0.05, 3.4), (-6, 6, 4.3, 6.6)],
        "W": [(-8.2, -6.8, 1.3, 3.1), (-8.2, -6.8, 4.3, 6.6)], "E": [(-8.2, -6.8, 1.3, 3.1)]})
    for h in hS[1:]:
        gypsum_screen(g, fS, *h[:4], T)
    coral_skin(g, fS, -13, -1.6, Z0, 1.25, 1)
    coral_skin(g, fS, 1.6, 13, Z0, 1.25, 2)
    # door with a pointed gypsum hood
    g.lbox("gypsum", fS, -1.8, -1.4, Z0, 3.4, 0, 0.14)
    g.lbox("gypsum", fS, 1.4, 1.8, Z0, 3.4, 0, 0.14)
    g.poly("gypsum", [(-2.0, 3.4), (2.0, 3.4), (0, 4.4)], fS, 0, 0.16)
    g.poly("shadow", [(-1.4, 3.5), (1.4, 3.5), (0, 4.2)], fS, 0.16, 0.18)
    for zz in (0.8, 1.7, 2.6):
        g.lbox("coral_dark", fS, -1.2, 1.2, zz, zz + 0.08, -0.33, -0.3)
    # danchal (mangrove) beam ends under the roof line
    x = -12.6
    while x < 12.7:
        g.seg("wood", (x, -10.0, 6.95), (x, -10.4, 6.95), 0.15, 0.15)
        x += 0.6
    # perforated gypsum parapet
    for sd, pl, u0, u1 in (("S", -10, -13, 13), ("N", -5, -13, 13)):
        fr = face(sd, pl)
        hs = []
        a = u0 + 0.5
        while a < u1 - 0.6:
            hs.append((a, a + 0.28, 7.75, 8.03))
            hs.append((a + 0.25, a + 0.53, 8.15, 8.43)) if a + 0.53 < u1 - 0.3 else None
            a += 0.6
        g.wall("gypsum", fr, u0, u1, 7.45, 8.7, 0.3, hs)
    g.parapet("gypsum", -13, -10, 13, -5, 7.45, 1.25, 0.3, sides="WE")
    g.band("coral", -13, -10, 13, -5, 7.4, 0.1, 0.05)

    # badgir — wind tower rising from the front wing
    g.vol("gypsum", 9, -9.5, 12, -6.5, 7.45, 12.4, t=0.3, holes={
        sd: [(u - 0.2, u + 0.2, 9.0, 11.7, "shadow") for u in us]
        for sd, us in (("S", (9.8, 10.5, 11.2)), ("N", (9.8, 10.5, 11.2)), ("W", (-8.7, -8.0, -7.3)), ("E", (-8.7, -8.0, -7.3)))})
    g.parapet("gypsum", 9, -9.5, 12, -6.5, 12.4, 0.35, 0.25)
    for sd, pl, u0, u1 in (("S", -9.5, 9, 12), ("N", -6.5, 9, 12), ("W", 9, -9.5, -6.5), ("E", 12, -9.5, -6.5)):
        g.shurfat("gypsum", face(sd, pl), u0 + 0.1, u1 - 0.1, 12.75, 0.25, w=0.4, h=0.45, p=0.75, steps=1)

    # side and rear wings — single storey around the court
    for x0, x1, outer in ((-13, -8, "W"), (8, 13, "E")):
        inner = "E" if outer == "W" else "W"
        g.vol("gypsum", x0, -5, x1, 10, Z0, 4.05, t=T, holes={
            outer: [(-1.0, 0.2, 1.3, 3.1, "open"), (3.4, 4.6, 1.3, 3.1, "open"), (7.4, 8.6, 1.3, 3.1, "open")],
            inner: [(-3.0, 5.0, Z0 + 0.05, 3.2)], "N": [(x0 + 1.5, x1 - 1.5, 1.3, 3.1)]})
        fr = face(outer, x0 if outer == "W" else x1)
        for a in (-1.0, 3.4, 7.4):
            gypsum_screen(g, fr, a, a + 1.2, 1.3, 3.1, T)
        coral_skin(g, fr, -4.5, 9.5, Z0, 1.25, 5 if outer == "W" else 6)
        g.parapet("gypsum", x0, -5, x1, 10, 4.05, 0.6, 0.3)
        y = -4.6
        while y < 9.7:
            g.seg("wood", (x0 if outer == "W" else x1, y, 3.6), ((x0 - 0.4) if outer == "W" else (x1 + 0.4), y, 3.6), 0.14, 0.14)
            y += 0.6
    g.vol("gypsum", -8, 6, 8, 10, Z0, 4.05, t=T, holes={"S": [(-6.5, 6.5, Z0 + 0.05, 3.2)]})
    g.parapet("gypsum", -8, 6, 8, 10, 4.05, 0.6, 0.3)
    coral_skin(g, face("N", 10), -13, 13, Z0, 1.25, 7)

    # riwaq — pointed arcade along the front wing's court face
    fr = face("S", -3.2)
    pointed_arcade(g, fr, -8, 8, 2.5, 3.35, 3.65, 0.45)
    g.box("gypsum", -8, -5, 3.65, 8, -2.75, 4.05)
    g.parapet("gypsum", -8, -5, 8, -2.75, 4.05, 0.6, 0.25, sides="S")

    # Qatif court: two-tone paving, pool, palms
    for i in range(16):
        for j in range(9):
            m = "court_a" if (i + j) % 2 == 0 else "court_b"
            g.box(m, -8 + i, -2.75 + j * 0.97, Z0, -7 + i, -2.75 + (j + 1) * 0.97, Z0 + 0.03)
    g.pool(-2.2, 0.6, 2.2, 3.8, Z0 + 0.03)
    g.palm(-5.5, 3.5, 6.4, seed=81)
    g.palm(5.5, 3.5, 5.8, seed=82)
    for i, (x, y, h) in enumerate([(-13.6, -10.9, 7.8), (-10.4, -11.0, 6.4), (13.6, -10.9, 7.4), (10.4, -11.0, 6.6),
                                   (-13.6, 5.0, 7.0), (13.6, 4.0, 7.6), (-8.0, 10.9, 6.4), (8.0, 10.9, 6.8)]):
        g.palm(x, y, h, seed=90 + i)
    g.box("coping", -2.6, -14, Z0, 2.6, -10, Z0 + 0.02)

    g.anchor("coral-course", -8.0, -10.0, 0.8, "wall")
    g.anchor("gypsum-screens", 7.0, -10.0, 5.4, "wall")
    g.anchor("danchal", -3.0, -10.3, 6.95, "wall")
    g.anchor("badgir", 10.5, -8.0, 12.6, "roof")
    g.anchor("riwaq-court", 0.0, 1.0, 0.3, "court")


CAMERA = {"target": (0, 0, 3.8), "hero": (-34, 24, 50, 35), "thumb": (-28, 30, 44, 35),
          "detail": ((0, -10, 5.0), -20, 8, 17, 45), "court": ((6.8, 1.0, 1.7), (-3, -3.2, 2.6), 22), "street": ((7.0, -13.2, 1.7), (0, -10, 4.0), 26)}
