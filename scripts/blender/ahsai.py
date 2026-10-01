# Al-Ahsa villa — oasis adobe with pointed arcades, carved door, gypsum relief, palm-frond roofs.
PREFIX = "Ahsai"
MATS = {
    "adobe": ("#d2a870", 0.95, 0.0), "adobe_d": ("#a67f4d", 0.95, 0.0), "gypsum": ("#f2ead6", 0.85, 0.0),
    "shadow": ("#2a2017", 0.9, 0.0), "wood": ("#6b4524", 0.8, 0.0), "door": ("#2f5c6e", 0.6, 0.0),
    "brass": ("#c99a3c", 0.4, 0.7), "glass": ("#1d262b", 0.07, 0.5), "frame": ("#4a3421", 0.5, 0.3),
    "lattice": ("#5c3d20", 0.7, 0.0), "pave": ("#e4d2b0", 0.9, 0.0), "court": ("#d6bd92", 0.9, 0.0),
    "lawn": ("#6d8a47", 0.95, 0.0), "water": ("#3a8fa8", 0.05, 0.0), "coping": ("#eee0c2", 0.8, 0.0),
    "trunk": ("#7a5f45", 0.95, 0.0), "leaf": ("#5b7438", 0.8, 0.0),
}
BG = "#ecdcba"


def gyp_panel(g, fr, a0, a1, b0, b1, d=0.05):
    """Carved gypsum relief panel — a lattice of plaster over a shadowed recess."""
    g.lbox("shadow", fr, a0, a1, b0, b1, -0.02, 0.0)
    g.lattice("gypsum", fr, a0, a1, b0, b1, 0.0, d, cell=0.2, bar=0.07)
    g.lbox("gypsum", fr, a0 - 0.1, a1 + 0.1, b1, b1 + 0.1, 0, d + 0.02)
    g.lbox("gypsum", fr, a0 - 0.1, a1 + 0.1, b0 - 0.1, b0, 0, d + 0.02)


def arch_win(g, fr, a0, a1, zs, rise, t):
    g.lbox("glass", fr, a0, a1, zs - 1.7, zs, -t * 0.6 - 0.03, -t * 0.6)
    g.poly("shadow", [(a0, zs)] + g.arch_pts(a0, a1, zs, rise, True) + [(a1, zs)], fr, -t * 0.6, -t * 0.55)
    g.arch_top("gypsum", fr, a0 - 0.16, a1 + 0.16, zs, rise, -0.02, 0.06, pointed=True)
    g.lbox("gypsum", fr, a0 - 0.16, a0, zs - 1.7, zs, 0, 0.06)
    g.lbox("gypsum", fr, a1, a1 + 0.16, zs - 1.7, zs, 0, 0.06)


def build(g):
    Z0 = 0.25
    T = 0.5
    g.box("pave", -17, -14, 0, 17, 14, Z0)
    g.box("lawn", -16.5, -13.5, Z0, -3.0, -11.0, Z0 + 0.06)
    g.box("lawn", 3.0, -13.5, Z0, 16.5, -11.0, Z0 + 0.06)
    g.box("lawn", -16.5, 11.0, Z0, 16.5, 13.5, Z0 + 0.06)

    fS = face("S", -10)
    wins = [(-9.4, -8.0), (-6.2, -4.8), (4.8, 6.2), (8.0, 9.4)]
    hS = [(-1.6, 1.6, Z0, 3.5, "door")]
    hS += [(a - 0.16, b + 0.16, 1.4, 4.1) for a, b in wins]
    hS += [(a, b, 5.1, 6.3) for a, b in wins]
    g.vol("adobe", -12.5, -10, 12.5, -5, Z0, 7.1, t=T, sill="adobe_d", holes={
        "S": hS, "N": [(-7, 7, Z0 + 0.05, 3.5), (-6, 6, 4.9, 6.4)],
        "W": [(-8.4, -7.0, 1.4, 3.1)], "E": [(-8.4, -7.0, 1.4, 3.1)]})
    for a, b in wins:
        arch_win(g, fS, a, b, 3.1, 1.0, T)
        gyp_panel(g, fS, a - 0.1, b + 0.1, 6.45, 6.85)
    g.band("adobe_d", -12.5, -10, 12.5, -5, Z0, 0.5, 0.08)
    g.band("adobe_d", -12.5, -10, 12.5, -5, 4.3, 0.16, 0.06)
    g.beam_row("wood", fS, -12.1, 12.1, 6.65, step=0.62, dep=0.36, w=0.14)
    # perforated adobe parapet
    for sd, pl, u0, u1 in (("S", -10, -12.5, 12.5), ("N", -5, -12.5, 12.5)):
        fr = face(sd, pl)
        hs = []
        a = u0 + 0.55
        while a < u1 - 0.65:
            hs.append((a, a + 0.26, 7.3, 7.9))
            a += 0.66
        g.wall("adobe", fr, u0, u1, 7.1, 8.3, 0.32, hs)
    g.parapet("adobe", -12.5, -10, 12.5, -5, 7.1, 1.2, 0.32, sides="WE")
    g.band("gypsum", -12.5, -10, 12.5, -5, 8.3, 0.12, 0.06)
    # carved door with brass studs under a pointed gypsum hood
    g.arch_top("gypsum", fS, -2.3, 2.3, 3.5, 1.4, -0.04, 0.12, pointed=True)
    g.poly("shadow", [(-1.6, 3.5)] + g.arch_pts(-1.6, 1.6, 3.5, 1.2, True) + [(1.6, 3.5)], fS, -0.34, -0.3)
    g.lbox("gypsum", fS, -2.3, -1.6, Z0, 3.5, 0, 0.12)
    g.lbox("gypsum", fS, 1.6, 2.3, Z0, 3.5, 0, 0.12)
    for z in (1.0, 1.9, 2.8):
        for x in (-1.0, -0.35, 0.35, 1.0):
            g.cyl("brass", x, -10.33, z, z + 0.07, 0.09, 0.09, seg=7)
    g.lbox("wood", fS, -0.05, 0.05, Z0, 3.5, -0.33, -0.3)

    # wings around a palm courtyard, with a pointed arcade on three sides
    for x0, x1, outer in ((-12.5, -7.5, "W"), (7.5, 12.5, "E")):
        inner = "E" if outer == "W" else "W"
        g.vol("adobe", x0, -5, x1, 10.5, Z0, 4.3, t=T, sill="adobe_d", holes={
            outer: [(0.8, 2.2, 1.4, 3.1), (5.0, 6.4, 1.4, 3.1), (9.2, 10.6, 1.4, 3.1)],
            inner: [(-2.6, 8.0, Z0 + 0.05, 3.4)], "N": [(x0 + 1.5, x1 - 1.5, 1.4, 3.1)]})
        fr = face(outer, x0 if outer == "W" else x1)
        for a in (0.8, 5.0, 9.2):
            arch_win(g, fr, a, a + 1.4, 3.1, 0.95, T)
        g.band("adobe_d", x0, -5, x1, 10.5, Z0, 0.5, 0.08)
        g.beam_row("wood", fr, -4.6, 10.1, 3.95, step=0.62, dep=0.34, w=0.13)
        g.parapet("adobe", x0, -5, x1, 10.5, 4.3, 0.7, 0.3)
        g.band("gypsum", x0, -5, x1, 10.5, 4.95, 0.1, 0.05)
        g.arcade("adobe", face(inner, x1 if outer == "W" else x0), -2.6, 8.0, Z0, 2.6, 1.0, 3.9, 0.4,
                 bay=2.3, pier=0.5, pointed=True)
    g.vol("adobe", -7.5, 6.5, 7.5, 10.5, Z0, 4.3, t=T, holes={"S": [(-6, 6, Z0 + 0.05, 3.4)]})
    g.parapet("adobe", -7.5, 6.5, 7.5, 10.5, 4.3, 0.7, 0.3)
    g.arcade("adobe", face("S", 6.5), -7.5, 7.5, Z0, 2.6, 1.0, 3.9, 0.4, bay=2.3, pier=0.5, pointed=True)
    g.arcade("adobe", face("N", -5), -7.5, 7.5, Z0, 2.6, 1.0, 3.9, 0.4, bay=2.3, pier=0.5, pointed=True)

    g.box("court", -7.5, -4.6, Z0, 7.5, 6.5, Z0 + 0.03)
    g.pool(-2.6, -0.6, 2.6, 3.0, Z0 + 0.03)
    for i, (x, y) in enumerate([(-5.4, 4.6), (5.4, 4.6), (-5.4, -2.6), (5.4, -2.6)]):
        g.palm(x, y, 6.6 - i * 0.3, seed=1101 + i)
    for i, (x, y, h) in enumerate([(-14.0, -11.8, 7.6), (-10.8, -12.0, 6.8), (14.0, -11.8, 7.3),
                                   (10.8, -12.0, 6.6), (-14.4, 3.0, 7.0), (14.4, 2.0, 7.4),
                                   (-8.0, 12.4, 6.6), (8.0, 12.4, 6.9)]):
        g.palm(x, y, h, seed=1110 + i)
    g.box("coping", -3.0, -14, Z0, 3.0, -10, Z0 + 0.02)

    g.anchor("pointed-arch", -5.5, -10.1, 3.6, "wall")
    g.anchor("gypsum-relief", 5.5, -10.1, 6.7, "wall")
    g.anchor("carved-door", 0.0, -10.1, 2.2, "wall")
    g.anchor("danchal", -9.0, -10.3, 6.65, "wall")
    g.anchor("palm-court", 0.0, 1.2, 0.3, "court")


CAMERA = {"target": (0, 0, 4.0), "hero": (-34, 24, 52, 35), "thumb": (-28, 30, 46, 35),
          "detail": ((-5.5, -10.4, 4.4), -20, 6, 14, 48), "court": ((6.6, 5.6, 1.7), (-2.0, -3.5, 2.8), 22),
          "street": ((7.6, -13.2, 1.7), (0, -10, 4.0), 26)}
