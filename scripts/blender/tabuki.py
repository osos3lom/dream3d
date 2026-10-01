# Tabuki villa — banded stone and plaster, round arches, castle corner towers.
PREFIX = "Tabuki"
MATS = {
    "stone": ("#b89c78", 0.95, 0.0), "plaster": ("#f0e8d8", 0.85, 0.0), "stone_d": ("#8f7657", 0.95, 0.0),
    "shadow": ("#241d16", 0.9, 0.0), "glass": ("#1e2a30", 0.07, 0.5), "frame": ("#44331f", 0.5, 0.3),
    "wood": ("#6f4e2d", 0.8, 0.0), "door": ("#56391f", 0.7, 0.0),
    "pave": ("#e0d3b9", 0.9, 0.0), "court": ("#d2c0a0", 0.9, 0.0), "lawn": ("#6d8a47", 0.95, 0.0),
    "water": ("#3d93ac", 0.05, 0.0), "coping": ("#efe5d1", 0.8, 0.0),
    "trunk": ("#7a5f45", 0.95, 0.0), "leaf": ("#5b7438", 0.8, 0.0),
}
BG = "#ebe2cf"


def banded(g, x0, y0, x1, y1, z0, z1, step=1.05, h=0.34):
    """Alternating stone and plaster courses — the Tabuk castle wall."""
    z = z0
    while z < z1 - 0.1:
        g.band("plaster", x0, y0, x1, y1, z, min(h, z1 - z), 0.05)
        z += step


def arch_win(g, fr, a0, a1, zs, rise, t):
    """Round-arched window: glass in the rectangle, plaster arch over it."""
    g.lbox("glass", fr, a0, a1, zs - 1.6, zs, -t * 0.55 - 0.03, -t * 0.55)
    g.arch_top("plaster", fr, a0 - 0.18, a1 + 0.18, zs, rise, -0.02, 0.06)
    g.lbox("plaster", fr, a0 - 0.18, a0, zs - 1.6, zs, 0, 0.06)
    g.lbox("plaster", fr, a1, a1 + 0.18, zs - 1.6, zs, 0, 0.06)
    g.poly("shadow", [(a0, zs)] + g.arch_pts(a0, a1, zs, rise) + [(a1, zs)], fr, -t * 0.55, -t * 0.5)


def build(g):
    Z0 = 0.25
    g.box("pave", -17, -14, 0, 17, 14, Z0)
    g.box("lawn", -16.5, -13.5, Z0, -3.0, -10.6, Z0 + 0.06)
    g.box("lawn", 3.0, -13.5, Z0, 16.5, -10.6, Z0 + 0.06)
    g.box("lawn", -16.5, 10.4, Z0, 16.5, 13.5, Z0 + 0.06)
    g.box("court", -6, -2.5, Z0, 6, 5.0, Z0 + 0.03)

    fS = face("S", -9)
    wins = [(-8.4, -7.2), (-5.4, -4.2), (4.2, 5.4), (7.2, 8.4)]
    hS = [(-1.5, 1.5, Z0, 3.4, "door")]
    hS += [(a - 0.18, b + 0.18, 1.3, 3.9) for a, b in wins]
    hS += [(a, b, 4.9, 6.1) for a, b in wins]
    g.vol("stone", -10.5, -9, 10.5, -2.5, Z0, 6.6, t=0.55, holes={
        "S": hS, "N": [(-6, 6, Z0 + 0.05, 3.4), (-5, 5, 4.6, 6.0)],
        "W": [(-7.0, -5.6, 1.4, 3.0)], "E": [(-7.0, -5.6, 1.4, 3.0)]})
    banded(g, -10.5, -9, 10.5, -2.5, Z0, 6.6)
    for a, b in wins:
        arch_win(g, fS, a, b, 2.9, 1.0, 0.55)
        g.lbox("plaster", fS, a - 0.16, b + 0.16, 4.72, 4.9, 0, 0.06)
    g.quoins("plaster", -10.5, -9, 10.5, -2.5, Z0, 6.6, w=0.55, step=0.8)
    g.parapet("stone", -10.5, -9, 10.5, -2.5, 6.6, 0.9, 0.35)
    for sd, pl, u0, u1 in (("S", -9, -10.5, 10.5), ("N", -2.5, -10.5, 10.5)):
        fr = face(sd, pl)
        g.lbox("plaster", fr, u0, u1, 6.6, 6.95, -0.36, 0.04)
        g.shurfat("plaster", fr, u0 + 0.3, u1 - 0.3, 7.5, 0.33, w=0.52, h=0.5, p=1.0, steps=1)
    # arched entrance
    g.arch_top("plaster", fS, -2.0, 2.0, 3.4, 1.2, -0.04, 0.1)
    g.poly("shadow", [(-1.5, 3.4)] + g.arch_pts(-1.5, 1.5, 3.4, 1.0) + [(1.5, 3.4)], fS, -0.32, -0.28)
    g.lbox("plaster", fS, -2.0, -1.5, Z0, 3.4, 0, 0.1)
    g.lbox("plaster", fS, 1.5, 2.0, Z0, 3.4, 0, 0.1)

    # castle corner towers
    for cx in (-10.5, 10.5):
        g.vol("stone", cx - 2.0, -9, cx + 2.0, -5.0, Z0, 9.0, t=0.5, holes={
            "S": [(cx - 0.3, cx + 0.3, 5.2, 6.4, "shadow"), (cx - 0.3, cx + 0.3, 7.0, 7.9, "shadow")]})
        banded(g, cx - 2.0, -9, cx + 2.0, -5.0, Z0, 9.0)
        g.quoins("plaster", cx - 2.0, -9, cx + 2.0, -5.0, Z0, 9.0, w=0.5, step=0.8)
        g.parapet("stone", cx - 2.0, -9, cx + 2.0, -5.0, 9.0, 0.8, 0.32)
        for sd, pl, u0, u1 in (("S", -9, cx - 2.0, cx + 2.0), ("E", cx + 2.0, -9, -5.0), ("W", cx - 2.0, -9, -5.0)):
            g.shurfat("plaster", face(sd, pl), u0 + 0.2, u1 - 0.2, 9.8, 0.3, w=0.48, h=0.46, p=0.9, steps=1)

    # wings
    for x0, x1, outer in ((-10.5, -6, "W"), (6, 10.5, "E")):
        inner = "E" if outer == "W" else "W"
        g.vol("stone", x0, -2.5, x1, 10, Z0, 4.2, t=0.5, holes={
            outer: [(0.6, 1.8, 1.4, 3.0), (4.4, 5.6, 1.4, 3.0), (8.0, 9.2, 1.4, 3.0)],
            inner: [(-2.0, 5.6, Z0 + 0.05, 3.4)], "N": [(x0 + 1.4, x1 - 1.4, 1.4, 3.0)]})
        banded(g, x0, -2.5, x1, 10, Z0, 4.2)
        g.parapet("stone", x0, -2.5, x1, 10, 4.2, 0.55, 0.3)
    g.vol("stone", -6, 6, 6, 10, Z0, 4.2, t=0.5, holes={"S": [(-5, 5, Z0 + 0.05, 3.4)]})
    banded(g, -6, 6, 6, 10, Z0, 4.2)
    g.parapet("stone", -6, 6, 6, 10, 4.2, 0.55, 0.3)

    g.pool(-2.6, -0.8, 2.6, 2.6, Z0 + 0.03)
    g.palm(-4.8, 3.6, 6.0, seed=601)
    g.palm(4.8, 3.6, 5.6, seed=602)
    for i, (x, y, h) in enumerate([(-13.8, -11.4, 6.8), (13.8, -11.4, 6.6), (-14.4, 3.0, 6.4),
                                   (14.4, 2.0, 6.9), (-8.0, 12.0, 6.1), (8.0, 12.0, 6.4)]):
        g.palm(x, y, h, seed=610 + i)
    for i, x in enumerate((-5.6, -3.6, 3.6, 5.6)):
        g.shrub(x, -11.8, 0.6, seed=620 + i)
    g.box("coping", -3.0, -14, Z0, 3.0, -9, Z0 + 0.02)

    g.anchor("stone-bands", -6.0, -9.1, 2.0, "wall")
    g.anchor("round-arch", -4.8, -9.1, 3.6, "wall")
    g.anchor("corner-tower", -10.5, -9.0, 9.9, "roof")
    g.anchor("quoins", 10.6, -4.0, 3.2, "wall")
    g.anchor("courtyard", 0.0, 1.0, 0.3, "court")


CAMERA = {"target": (0, 0, 4.0), "hero": (-34, 23, 52, 35), "thumb": (-28, 29, 46, 35),
          "detail": ((-5, -9.4, 3.8), -20, 5, 13, 48), "court": ((3.2, 7.8, 1.7), (-1.0, -1.5, 3.2), 22),
          "street": ((7.6, -13.2, 1.7), (0, -9, 3.8), 26)}
