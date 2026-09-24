# Hijazi villa — coral-stone tower house with stacked rawashin, timber coursing and lattice screens.
PREFIX = "Hijazi"
MATS = {
    "coral": ("#ebe2ce", 0.9, 0.0), "coral_course": ("#d2c4a6", 0.9, 0.0), "timber": ("#5a3b22", 0.8, 0.0),
    "wood": ("#7a5230", 0.7, 0.0), "lattice": ("#6a4428", 0.7, 0.0), "shutter": ("#3f6a55", 0.6, 0.0),
    "shadow": ("#231a14", 0.9, 0.0), "glass": ("#1f2b33", 0.06, 0.5), "frame": ("#3a2a1c", 0.5, 0.2),
    "door": ("#5a3b22", 0.7, 0.0), "pave": ("#e6dcc8", 0.9, 0.0), "lawn": ("#6b8a46", 0.95, 0.0),
    "water": ("#3f9bbd", 0.05, 0.0), "coping": ("#f1e9da", 0.8, 0.0), "trunk": ("#7a5f45", 0.95, 0.0),
    "leaf": ("#5b7438", 0.8, 0.0),
}
BG = "#e6e2d6"


def screen(g, fr, a0, a1, b0, b1, t):
    """High ventilation screen: lattice set into a wall opening, dark behind."""
    g.lattice("lattice", fr, a0, a1, b0, b1, -t * 0.5 - 0.03, -t * 0.5, cell=0.12, bar=0.028)
    g.lbox("shadow", fr, a0, a1, b0, b1, -t - 0.03, -t)


def build(g):
    Z0 = 0.25
    T = 0.45
    top = 10.75
    g.box("pave", -17, -14, 0, 17, 14, Z0)
    g.box("lawn", -16.5, -13.5, Z0, -2.4, -9.8, Z0 + 0.06)
    g.box("lawn", 2.4, -13.5, Z0, 16.5, -9.8, Z0 + 0.06)
    g.box("lawn", -16.5, 6.5, Z0, 16.5, 13.5, Z0 + 0.06)

    vent_S = [(-8.2, -7.0, 9.6, 10.2), (7.0, 8.2, 9.6, 10.2), (-8.2, -7.0, 6.1, 6.7), (7.0, 8.2, 6.1, 6.7)]
    vent_EW = [(-5.8, -4.4, 6.1, 6.7), (-5.8, -4.4, 9.6, 10.2), (1.2, 3.6, 6.1, 6.7), (1.2, 3.6, 9.6, 10.2)]
    holes = {
        "S": [(-1.2, 1.2, Z0, 3.3, "door"), (-7.8, -3.2, 0.6, 3.2), (3.2, 7.8, 0.6, 3.2),
              (-8.2, -7.0, 4.4, 5.6, "shutter"), (7.0, 8.2, 4.4, 5.6, "shutter"),
              (-8.2, -7.0, 7.9, 9.1, "shutter"), (7.0, 8.2, 7.9, 9.1, "shutter")] + [v + ("open",) for v in vent_S],
        "N": [(-6, 6, Z0 + 0.05, 3.3), (-4.5, -2.5, 4.4, 6.0), (2.5, 4.5, 4.4, 6.0)],
        "E": [(-5.8, -4.4, 1.2, 3.0), (1.2, 3.6, 1.2, 3.0)] + [v + ("open",) for v in vent_EW],
        "W": [(-5.8, -4.4, 1.2, 3.0), (1.2, 3.6, 1.2, 3.0)] + [v + ("open",) for v in vent_EW],
    }
    g.vol("coral", -9, -7, 9, 5, Z0, top, t=T, holes=holes, sill="coral_course")
    for v in vent_S:
        screen(g, face("S", -7), *v, T)
    for sd, pl in (("E", 9), ("W", -9)):
        for v in vent_EW:
            screen(g, face(sd, pl), *v, T)
    # timber tie-beams (takalil) coursing the coral stone
    z = 3.7
    while z < top - 0.2:
        g.band("timber", -9, -7, 9, 5, z, 0.1, 0.035)
        z += 1.15
    g.band("coral_course", -9, -7, 9, 5, Z0, 0.55, 0.06)
    for zf in (3.75, 7.25):
        g.band("coral_course", -9, -7, 9, 5, zf - 0.05, 0.22, 0.07)

    # carved door surround
    fS = face("S", -7)
    g.lbox("wood", fS, -1.6, -1.2, Z0, 3.7, 0, 0.12)
    g.lbox("wood", fS, 1.2, 1.6, Z0, 3.7, 0, 0.12)
    g.lbox("wood", fS, -1.6, 1.6, 3.3, 3.7, 0, 0.18)
    g.lattice("lattice", fS, -1.0, 1.0, 2.5, 3.2, -0.3, -0.27, cell=0.1)

    # rawashin — stacked on the street front, tall one on axis
    for x in (-5.0, 5.0):
        g.roshan(fS, x, 4.3, 2.4, 2.6, 0.75)
        g.roshan(fS, x, 7.8, 2.4, 2.4, 0.75)
    g.roshan(fS, 0.0, 4.3, 2.6, 5.9, 0.9)
    for sd, pl in (("E", 9), ("W", -9)):
        g.roshan(face(sd, pl), -1.4, 4.3, 2.2, 5.9, 0.75)

    # lattice parapet around the roof terrace
    for sd, pl, u0, u1 in (("S", -7, -9, 9), ("N", 5, -9, 9), ("E", 9, -6.7, 4.7), ("W", -9, -6.7, 4.7)):
        fr = face(sd, pl)
        n = int((u1 - u0) / 2.0)
        hs = []
        for i in range(n):
            c = u0 + (u1 - u0) * (i + 0.5) / n
            hs.append((c - 0.7, c + 0.7, top + 0.2, top + 0.95))
        g.wall("coral", fr, u0, u1, top, top + 1.2, 0.3, hs)
        for h in hs:
            g.lattice("lattice", fr, *h, -0.17, -0.14, cell=0.12)
    g.band("timber", -9, -7, 9, 5, top + 1.2, 0.08, 0.04)

    # roof pavilion + pergola
    g.vol("coral", -3, -1, 4, 4, top, top + 2.9, t=0.3, holes={"S": [(-2.4, 3.4, top + 0.05, top + 2.4)]})
    for y in [-6.4 + i * 0.5 for i in range(11)]:
        g.box("wood", -3, y, top + 2.5, 4, y + 0.1, top + 2.62)
    for x in (-3, 3.88):
        g.box("wood", x, -6.5, top, x + 0.12, -6.38, top + 2.62)

    # rear garden
    g.pool(-5, 7.6, 5, 10.6, Z0 + 0.06)
    for x in [-5 + i * 0.5 for i in range(21)]:
        g.box("lattice", x, 11.4, 2.9, x + 0.08, 13.0, 3.0)
    for x in (-5, 4.9):
        g.box("wood", x, 11.4, Z0, x + 0.12, 11.52, 3.0)
        g.box("wood", x, 12.9, Z0, x + 0.12, 13.02, 3.0)
    for i, (x, y, h) in enumerate([(-13.4, -10.6, 7.6), (13.4, -10.6, 7.0), (-13.5, 0.0, 6.4), (13.5, 1.5, 7.2),
                                   (-10.5, 10.4, 6.8), (10.5, 10.4, 6.2)]):
        g.palm(x, y, h, seed=50 + i)
    for i, x in enumerate((-7.0, -4.5, 4.5, 7.0)):
        g.shrub(x, -11.2, 0.6, seed=60 + i)
    g.box("coping", -2.4, -14, Z0, 2.4, -7, Z0 + 0.02)

    g.anchor("roshan", 0.0, -7.9, 7.2, "wall")
    g.anchor("coral-coursing", -8.6, -7.0, 4.9, "wall")
    g.anchor("ventilation-screens", 9.0, -5.1, 9.9, "wall")
    g.anchor("lattice-parapet", 5.0, -6.9, 11.6, "roof")
    g.anchor("roof-majlis", 0.5, 1.5, 13.7, "roof")


CAMERA = {"target": (0, 0, 5.2), "hero": (-34, 20, 52, 35), "thumb": (-28, 24, 46, 35),
          "detail": ((0, -7.5, 7.0), -18, 6, 16, 45), "court": ((9.0, 12.2, 1.7), (-1, 5, 5.0), 22), "street": ((6.5, -13.2, 1.7), (0, -7, 5.5), 24)}
