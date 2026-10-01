# Farasani villa — coral stone under deeply carved gypsum facade panels, Red Sea islands.
PREFIX = "Farasani"
MATS = {
    "gypsum": ("#f6f0e2", 0.85, 0.0), "carve": ("#fbf7ee", 0.8, 0.0), "coral": ("#d8c8a8", 0.95, 0.0),
    "coral_d": ("#b4a384", 0.95, 0.0), "shadow": ("#2b2419", 0.9, 0.0),
    "wood": ("#6a4728", 0.8, 0.0), "door": ("#2f6e8e", 0.55, 0.0), "teal": ("#2f8f8a", 0.6, 0.0),
    "glass": ("#1e2b33", 0.06, 0.5), "frame": ("#55402a", 0.6, 0.0),
    "pave": ("#e8dcc2", 0.9, 0.0), "court": ("#dccba6", 0.9, 0.0), "lawn": ("#6f8f4a", 0.95, 0.0),
    "water": ("#2fa5bd", 0.05, 0.0), "coping": ("#f3ecdc", 0.8, 0.0),
    "trunk": ("#7a5f45", 0.95, 0.0), "leaf": ("#5b7438", 0.8, 0.0),
}
BG = "#e4ece9"


def rosette(g, fr, cx, z, r=0.42, d0=0.06, d1=0.12, petals=8):
    """A carved gypsum rosette — the Farasan facade's recurring medallion."""
    for i in range(petals):
        a = 2 * math.pi * i / petals
        g.poly("carve", [(cx + r * 0.25 * math.cos(a), z + r * 0.25 * math.sin(a)),
                         (cx + r * math.cos(a + 0.35), z + r * math.sin(a + 0.35)),
                         (cx + r * math.cos(a - 0.35), z + r * math.sin(a - 0.35))], fr, d0, d1)


def carved_panel(g, fr, a0, a1, b0, b1, seed=0):
    """Deeply carved gypsum field: recessed ground, lattice, rosettes, border."""
    g.lbox("shadow", fr, a0, a1, b0, b1, -0.03, 0.0)
    g.lattice("carve", fr, a0 + 0.1, a1 - 0.1, b0 + 0.1, b1 - 0.1, 0.0, 0.06, cell=0.26, bar=0.09)
    for box in ((a0 - 0.1, a0 + 0.08, b0 - 0.1, b1 + 0.1), (a1 - 0.08, a1 + 0.1, b0 - 0.1, b1 + 0.1),
                (a0 - 0.1, a1 + 0.1, b1 - 0.08, b1 + 0.1), (a0 - 0.1, a1 + 0.1, b0 - 0.1, b0 + 0.08)):
        g.lbox("gypsum", fr, *box, 0, 0.1)
    n = max(1, int((a1 - a0) / 1.1))
    for i in range(n):
        rosette(g, fr, a0 + (a1 - a0) * (i + 0.5) / n, (b0 + b1) / 2, r=0.36)


def build(g):
    Z0 = 0.25
    T = 0.5
    g.box("pave", -17, -14, 0, 17, 14, Z0)
    g.box("lawn", -16.5, -13.5, Z0, -3.0, -11.0, Z0 + 0.06)
    g.box("lawn", 3.0, -13.5, Z0, 16.5, -11.0, Z0 + 0.06)
    g.box("lawn", -16.5, 10.6, Z0, 16.5, 13.5, Z0 + 0.06)
    g.box("court", -6.5, -2.5, Z0, 6.5, 5.5, Z0 + 0.03)

    fS = face("S", -9.5)
    wins = [(-8.6, -7.0), (-5.0, -3.4), (3.4, 5.0), (7.0, 8.6)]
    hS = [(-1.6, 1.6, Z0, 3.4, "door")]
    hS += [(a, b, 1.5, 3.3) for a, b in wins]
    hS += [(a + 0.2, b - 0.2, 4.9, 6.1) for a, b in wins]
    g.vol("gypsum", -11.5, -9.5, 11.5, -2.5, Z0, 7.2, t=T, sill="coral_d", holes={
        "S": hS, "N": [(-6.5, 6.5, Z0 + 0.05, 3.4), (-5, 5, 4.8, 6.2)],
        "W": [(-7.6, -6.2, 1.5, 3.3)], "E": [(-7.6, -6.2, 1.5, 3.3)]})
    # coral base course, then the carved gypsum fields
    g.lbox("coral", fS, -11.5, 11.5, Z0, 1.15, 0, 0.07)
    g.stone_skin("coral_d", fS, -11.5, 11.5, Z0, 1.15, seed=41, d=0.1, density=2.4)
    for a, b in wins:
        g.lbox("gypsum", fS, a - 0.18, a, 1.5, 3.3, 0, 0.07)
        g.lbox("gypsum", fS, b, b + 0.18, 1.5, 3.3, 0, 0.07)
        g.arch_top("gypsum", fS, a - 0.18, b + 0.18, 3.3, 0.8, -0.02, 0.07)
    carved_panel(g, fS, -8.9, -3.1, 3.5, 4.5, seed=1)
    carved_panel(g, fS, 3.1, 8.9, 3.5, 4.5, seed=2)
    carved_panel(g, fS, -10.9, -2.2, 6.3, 7.0, seed=3)
    carved_panel(g, fS, 2.2, 10.9, 6.3, 7.0, seed=4)
    g.band("coral_d", -11.5, -9.5, 11.5, -2.5, 4.62, 0.12, 0.05)
    # decorative crown: pierced parapet over a carved cornice
    for sd, pl, u0, u1 in (("S", -9.5, -11.5, 11.5), ("N", -2.5, -11.5, 11.5)):
        fr = face(sd, pl)
        hs = []
        a = u0 + 0.5
        while a < u1 - 0.6:
            hs.append((a, a + 0.3, 7.5, 8.1))
            a += 0.7
        g.wall("gypsum", fr, u0, u1, 7.2, 8.5, 0.3, hs)
        g.lbox("carve", fr, u0, u1, 8.5, 8.75, -0.34, 0.06)
        g.shurfat("gypsum", fr, u0 + 0.3, u1 - 0.3, 8.75, 0.3, w=0.46, h=0.48, p=0.95, steps=1)
    g.parapet("gypsum", -11.5, -9.5, 11.5, -2.5, 7.2, 1.3, 0.3, sides="WE")
    # the great carved doorway
    g.arch_top("gypsum", fS, -2.5, 2.5, 3.4, 1.5, -0.05, 0.14)
    g.poly("shadow", [(-1.6, 3.4)] + g.arch_pts(-1.6, 1.6, 3.4, 1.2) + [(1.6, 3.4)], fS, -0.34, -0.3)
    g.lbox("gypsum", fS, -2.5, -1.6, Z0, 3.4, 0, 0.14)
    g.lbox("gypsum", fS, 1.6, 2.5, Z0, 3.4, 0, 0.14)
    rosette(g, fS, -2.05, 2.2, r=0.34, d0=0.14, d1=0.2)
    rosette(g, fS, 2.05, 2.2, r=0.34, d0=0.14, d1=0.2)
    g.lbox("teal", fS, -1.6, 1.6, Z0, 3.4, -0.3, -0.27)
    g.lbox("wood", fS, -0.06, 0.06, Z0, 3.4, -0.34, -0.3)

    # wings around the court
    for x0, x1, outer in ((-11.5, -6.5, "W"), (6.5, 11.5, "E")):
        inner = "E" if outer == "W" else "W"
        g.vol("gypsum", x0, -2.5, x1, 10.5, Z0, 4.3, t=T, sill="coral_d", holes={
            outer: [(0.8, 2.2, 1.5, 3.3), (5.0, 6.4, 1.5, 3.3), (9.2, 10.6, 1.5, 3.3)],
            inner: [(-2.0, 7.8, Z0 + 0.05, 3.4)], "N": [(x0 + 1.4, x1 - 1.4, 1.5, 3.3)]})
        fr = face(outer, x0 if outer == "W" else x1)
        g.lbox("coral", fr, -2.5, 10.5, Z0, 1.15, 0, 0.07)
        g.stone_skin("coral_d", fr, -2.5, 10.5, Z0, 1.15, seed=42 if outer == "W" else 43, d=0.1, density=2.2)
        for a in (0.8, 5.0, 9.2):
            g.arch_top("gypsum", fr, a - 0.18, a + 1.58, 3.3, 0.8, -0.02, 0.07)
        carved_panel(g, fr, -1.6, 9.8, 3.55, 4.1)
        g.parapet("gypsum", x0, -2.5, x1, 10.5, 4.3, 0.7, 0.3)
        g.lbox("carve", fr, -2.5, 10.5, 4.95, 5.15, -0.32, 0.05)
    g.vol("gypsum", -6.5, 6.5, 6.5, 10.5, Z0, 4.3, t=T, holes={"S": [(-5.4, 5.4, Z0 + 0.05, 3.4)]})
    g.parapet("gypsum", -6.5, 6.5, 6.5, 10.5, 4.3, 0.7, 0.3)
    g.arcade("gypsum", face("S", -2.5), -6.5, 6.5, Z0, 2.7, 1.0, 4.0, 0.4, bay=2.2, pier=0.45, pointed=False)

    g.pool(-2.8, 0.4, 2.8, 3.6, Z0 + 0.03)
    g.palm(-5.0, 1.0, 6.2, seed=1501)
    g.palm(5.0, 1.0, 5.8, seed=1502)
    for i, (x, y, h) in enumerate([(-13.8, -11.8, 7.2), (13.8, -11.8, 6.9), (-14.4, 3.0, 6.6),
                                   (14.4, 2.0, 7.1), (-8.0, 12.2, 6.4), (8.0, 12.2, 6.7)]):
        g.palm(x, y, h, seed=1510 + i)
    for i, x in enumerate((-5.0, -3.0, 3.0, 5.0)):
        g.shrub(x, -12.2, 0.6, seed=1520 + i)
    g.box("coping", -3.0, -14, Z0, 3.0, -9.5, Z0 + 0.02)

    g.anchor("carved-gypsum", -6.0, -9.6, 4.0, "wall")
    g.anchor("coral-base", 8.0, -9.6, 0.7, "wall")
    g.anchor("great-door", 0.0, -9.6, 3.4, "wall")
    g.anchor("pierced-crown", 4.0, -9.6, 8.3, "roof")
    g.anchor("courtyard", 0.0, 1.5, 0.3, "court")


CAMERA = {"target": (0, 0, 4.0), "hero": (-34, 23, 52, 35), "thumb": (-28, 29, 46, 35),
          "detail": ((-3.0, -10.0, 4.4), -18, 4, 11, 48), "court": ((5.6, 8.4, 1.7), (-1.5, -1.5, 3.0), 22),
          "street": ((7.6, -13.2, 1.7), (0, -9.5, 4.2), 26)}
