# Tihami villa — low coastal-plain mass, reed-shaded veranda, round thatch outbuildings.
PREFIX = "Tihami"
MATS = {
    "mud": ("#c99f6e", 0.95, 0.0), "mud_d": ("#9d7546", 0.95, 0.0), "lime": ("#f0e7d2", 0.85, 0.0),
    "red": ("#b8392c", 0.6, 0.0), "ochre": ("#e0ad3c", 0.6, 0.0), "teal": ("#2f7a6d", 0.6, 0.0),
    "shadow": ("#271c12", 0.9, 0.0), "reed": ("#b99a5f", 0.9, 0.0), "reed_d": ("#8e7343", 0.9, 0.0),
    "wood": ("#6b4524", 0.8, 0.0), "door": ("#2f7a6d", 0.6, 0.0),
    "glass": ("#1d262b", 0.07, 0.5), "frame": ("#4a3421", 0.5, 0.3),
    "pave": ("#e2d1ae", 0.9, 0.0), "court": ("#d2bc92", 0.9, 0.0), "lawn": ("#6f8a45", 0.95, 0.0),
    "water": ("#3a8fa8", 0.05, 0.0), "coping": ("#eddfc0", 0.8, 0.0),
    "trunk": ("#7a5f45", 0.95, 0.0), "leaf": ("#57753a", 0.8, 0.0),
}
BG = "#ebdcbc"
PAL = ["red", "ochre", "teal"]


def painted_base(g, fr, u0, u1, z0):
    """The painted skirt Tihama houses carry at ground level."""
    g.lbox("lime", fr, u0, u1, z0, z0 + 0.95, 0, 0.05)
    g.tri_row(PAL, fr, u0 + 0.1, u1 - 0.1, z0 + 0.1, 0.3, 0.26, 0.32, 0.05, 0.09)
    g.tri_row(PAL[::-1], fr, u0 + 0.25, u1 - 0.25, z0 + 0.5, 0.3, 0.26, 0.32, 0.05, 0.09, down=True)


def hut(g, cx, cy, r=2.2, wall=2.0, roof=3.2, seed=0):
    """Round storage hut: mud drum, painted ring, conical palm-frond roof."""
    g.drum("mud", cx, cy, 0.25, 0.25 + wall, r, 0.35, seg=20, gaps=((250, 290),))
    g.cyl("lime", cx, cy, 0.25 + wall - 0.5, 0.25 + wall - 0.2, r + 0.03, r + 0.03, seg=20)
    g.cyl("red", cx, cy, 0.25 + wall - 0.46, 0.25 + wall - 0.3, r + 0.06, r + 0.06, seg=20)
    g.thatch("reed", cx, cy, 0.25 + wall, roof, r, seg=20, rings=3, ring_m="reed_d")


def build(g):
    Z0 = 0.25
    g.box("pave", -17, -14, 0, 17, 14, Z0)
    g.box("lawn", -16.5, -13.5, Z0, -3.4, -11.0, Z0 + 0.06)
    g.box("lawn", 3.4, -13.5, Z0, 16.5, -11.0, Z0 + 0.06)
    g.box("lawn", -16.5, 9.6, Z0, 16.5, 13.5, Z0 + 0.06)
    g.box("court", -7, -2.0, Z0, 7, 5.0, Z0 + 0.03)

    fS = face("S", -9.6)
    # long, low, flat-roofed mass — the Tihama plain house
    hS = [(-1.7, 1.7, Z0, 3.2, "door")]
    for x in (-10.4, -8.0, -5.6, 5.6, 8.0, 10.4):
        hS.append((x - 0.5, x + 0.5, 1.5, 2.9))
    g.vol("mud", -12.5, -9.6, 12.5, -4.0, Z0, 4.7, t=0.55, sill="mud_d", holes={
        "S": hS, "N": [(-7.5, 7.5, Z0 + 0.05, 3.2)],
        "W": [(-8.2, -6.8, 1.5, 2.9)], "E": [(-8.2, -6.8, 1.5, 2.9)]})
    painted_base(g, fS, -12.5, 12.5, Z0)
    for x in (-10.4, -8.0, -5.6, 5.6, 8.0, 10.4):
        g.lbox("lime", fS, x - 0.7, x + 0.7, 2.9, 3.1, 0, 0.07)
    g.band("mud_d", -12.5, -9.6, 12.5, -4.0, 3.5, 0.14, 0.06)
    g.beam_row("wood", fS, -12.1, 12.1, 4.3, step=0.6, dep=0.4, w=0.14)
    g.parapet("mud", -12.5, -9.6, 12.5, -4.0, 4.7, 0.55, 0.34)
    g.lbox("lime", fS, -12.5, 12.5, 5.0, 5.25, -0.36, 0.05)
    # door with a painted surround
    g.lbox("lime", fS, -2.2, -1.7, Z0, 3.5, 0, 0.12)
    g.lbox("lime", fS, 1.7, 2.2, Z0, 3.5, 0, 0.12)
    g.lbox("lime", fS, -2.2, 2.2, 3.2, 3.5, 0, 0.12)
    g.tri_row(PAL, fS, -2.1, 2.1, 3.56, 0.28, 0.24, 0.3, 0.12, 0.16)

    # reed-shaded veranda along the court
    for x in [i * 2.0 - 6.0 for i in range(7)]:
        g.cyl("trunk", x, 3.2, Z0, 3.1, 0.18, 0.15, seg=8)
    g.box("wood", -6.4, 2.9, 3.1, 6.4, 3.5, 3.26)
    for y in [2.95 + i * 0.22 for i in range(3)]:
        g.box("reed", -6.4, y, 3.26, 6.4, y + 0.14, 3.38)
    g.box("reed_d", -6.4, 2.9, 3.38, 6.4, 3.5, 3.46)

    # side wings
    for x0, x1, outer in ((-12.5, -7.5, "W"), (7.5, 12.5, "E")):
        inner = "E" if outer == "W" else "W"
        g.vol("mud", x0, -4.0, x1, 9.2, Z0, 3.8, t=0.5, sill="mud_d", holes={
            outer: [(0.8, 1.9, 1.5, 2.9), (4.8, 5.9, 1.5, 2.9), (8.6, 9.7, 1.5, 2.9)],
            inner: [(-1.2, 7.0, Z0 + 0.05, 3.1)], "N": [(x0 + 1.4, x1 - 1.4, 1.5, 2.9)]})
        fr = face(outer, x0 if outer == "W" else x1)
        painted_base(g, fr, -3.8, 9.0, Z0)
        g.beam_row("wood", fr, -3.6, 8.8, 3.45, step=0.6, dep=0.38, w=0.13)
        g.parapet("mud", x0, -4.0, x1, 9.2, 3.8, 0.5, 0.3)
        g.lbox("lime", fr, -4.0, 9.2, 4.05, 4.25, -0.32, 0.05)
    g.vol("mud", -7.5, 5.2, 7.5, 9.2, Z0, 3.8, t=0.5, holes={"S": [(-6.4, 6.4, Z0 + 0.05, 3.1)]})
    g.parapet("mud", -7.5, 5.2, 7.5, 9.2, 3.8, 0.5, 0.3)

    # round thatch huts in the compound — kitchen and store
    hut(g, -9.8, 6.4, r=2.1, wall=1.9, roof=3.0, seed=1)
    hut(g, 9.8, 6.4, r=1.8, wall=1.8, roof=2.6, seed=2)

    g.pool(-2.8, -1.0, 2.8, 1.8, Z0 + 0.03)
    g.palm(-5.2, 0.6, 6.2, seed=1301)
    g.palm(5.2, 0.6, 5.8, seed=1302)
    for i, (x, y, h) in enumerate([(-14.2, -12.0, 7.2), (-10.8, -12.2, 6.4), (14.2, -12.0, 6.9),
                                   (10.8, -12.2, 6.2), (-14.6, 2.0, 6.6), (14.6, 1.0, 7.0),
                                   (-4.0, 11.8, 6.4), (4.0, 11.8, 6.7)]):
        g.palm(x, y, h, seed=1310 + i)
    g.box("coping", -3.4, -14, Z0, 3.4, -9.6, Z0 + 0.02)

    g.anchor("thatch-hut", -9.8, 6.4, 7.4, "roof")
    g.anchor("painted-base", -8.0, -9.7, 0.9, "wall")
    g.anchor("low-mass", 8.0, -9.7, 3.9, "wall")
    g.anchor("reed-veranda", 0.0, 3.2, 3.5, "roof")
    g.anchor("courtyard", 0.0, 0.5, 0.3, "court")


CAMERA = {"target": (0, 0, 3.2), "hero": (-34, 25, 50, 35), "thumb": (-28, 31, 44, 35),
          "detail": ((-8.0, -10.8, 2.6), -20, 6, 12, 45), "court": ((5.0, 7.8, 1.7), (-2.0, -2.0, 2.6), 22),
          "street": ((7.8, -13.2, 1.7), (0, -9.6, 3.2), 26)}
