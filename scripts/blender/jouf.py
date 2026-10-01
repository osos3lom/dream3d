# Jouf villa — coursed desert stone, a tapered Dumat-style tower, olive terraces.
PREFIX = "Jouf"
MATS = {
    "stone": ("#c6b291", 0.95, 0.0), "stone_dark": ("#9d8a6c", 0.95, 0.0), "rubble": ("#b3a083", 0.95, 0.0),
    "shadow": ("#241e18", 0.9, 0.0), "plaster": ("#eee4d2", 0.85, 0.0),
    "glass": ("#1e2a30", 0.07, 0.5), "frame": ("#4a3524", 0.5, 0.3), "wood": ("#6e4e2e", 0.8, 0.0),
    "door": ("#5b4026", 0.7, 0.0), "pave": ("#ddd0b6", 0.9, 0.0), "court": ("#cdbb99", 0.9, 0.0),
    "lawn": ("#6b8545", 0.95, 0.0), "water": ("#3d93ac", 0.05, 0.0), "coping": ("#eae0ca", 0.8, 0.0),
    "trunk": ("#6b543c", 0.95, 0.0), "leaf": ("#6a7f55", 0.85, 0.0),
}
BG = "#e8e2d2"


def coursed(g, x0, y0, x1, y1, z0, z1, step=0.62):
    """Horizontal stone coursing — a thin proud band every course."""
    z = z0 + step
    while z < z1 - 0.2:
        g.band("stone_dark", x0, y0, x1, y1, z, 0.07, 0.035)
        z += step


def build(g):
    Z0 = 0.25
    g.box("pave", -17, -14, 0, 17, 14, Z0)
    g.box("lawn", -16.5, -13.5, Z0, -3.0, -10.6, Z0 + 0.06)
    g.box("lawn", 3.0, -13.5, Z0, 16.5, -10.6, Z0 + 0.06)
    g.box("lawn", -16.5, -9.6, Z0, -12.6, 13.5, Z0 + 0.06)
    g.box("lawn", 12.6, -9.6, Z0, 16.5, 13.5, Z0 + 0.06)
    g.box("court", -6, -2.5, Z0, 6, 5.5, Z0 + 0.03)

    fS = face("S", -9)
    hS = [(-1.3, 1.3, Z0, 3.2, "door"), (-9.0, -5.6, 0.8, 3.0), (5.6, 9.0, 0.8, 3.0)]
    for x in (-8.2, -6.4, -4.6, 4.6, 6.4, 8.2):
        hS.append((x - 0.35, x + 0.35, 4.4, 5.6))
    g.vol("stone", -11, -9, 11, -2.5, Z0, 6.3, t=0.55, sill="stone_dark", holes={
        "S": hS, "N": [(-6, 6, Z0 + 0.05, 3.3), (-5, 5, 4.3, 5.7)],
        "W": [(-7.4, -6.0, 1.4, 2.9), (-7.2, -6.2, 4.4, 5.6)], "E": [(-7.4, -6.0, 1.4, 2.9)]})
    coursed(g, -11, -9, 11, -2.5, Z0, 6.3)
    g.stone_skin("rubble", fS, -11, 11, Z0, 1.6, seed=11, d=0.06, density=2.6)
    g.quoins("stone_dark", -11, -9, 11, -2.5, Z0, 6.3, w=0.55, step=0.72)
    g.parapet("stone", -11, -9, 11, -2.5, 6.3, 0.75, 0.35)
    g.band("stone_dark", -11, -9, 11, -2.5, 6.25, 0.14, 0.06)
    # lintelled stone doorway
    g.lbox("stone_dark", fS, -1.7, -1.3, Z0, 3.55, 0, 0.14)
    g.lbox("stone_dark", fS, 1.3, 1.7, Z0, 3.55, 0, 0.14)
    g.lbox("stone_dark", fS, -2.0, 2.0, 3.2, 3.55, 0, 0.2)
    g.lbox("plaster", fS, -2.1, 2.1, 3.55, 3.85, 0, 0.14)

    # tapered tower — the Dumat Al-Jandal minaret read as a stair burj
    for k in range(5):
        s = 1 - k * 0.09
        g.vol("stone", -1.9 * s, 5.5, 1.9 * s, 9.2, Z0 + k * 2.1, Z0 + (k + 1) * 2.1, t=0.45, roof=False,
              holes={"S": [(-0.35 * s, 0.35 * s, Z0 + k * 2.1 + 0.8, Z0 + k * 2.1 + 1.6, "shadow")]} if k else {})
        g.band("stone_dark", -1.9 * s, 5.5, 1.9 * s, 9.2, Z0 + (k + 1) * 2.1 - 0.12, 0.12, 0.06)
    g.box("stone", -1.3, 5.9, Z0 + 10.5, 1.3, 8.8, Z0 + 11.1)
    g.parapet("plaster", -1.4, 5.8, 1.4, 8.9, Z0 + 11.1, 0.45, 0.22)

    # side and rear wings
    for x0, x1, outer in ((-11, -6, "W"), (6, 11, "E")):
        inner = "E" if outer == "W" else "W"
        g.vol("stone", x0, -2.5, x1, 10, Z0, 4.0, t=0.5, sill="stone_dark", holes={
            outer: [(0.6, 1.7, 1.4, 2.9), (4.4, 5.5, 1.4, 2.9), (8.0, 9.1, 1.4, 2.9)],
            inner: [(-2.0, 5.6, Z0 + 0.05, 3.3)], "N": [(x0 + 1.4, x1 - 1.4, 1.4, 2.9)]})
        coursed(g, x0, -2.5, x1, 10, Z0, 4.0)
        g.stone_skin("rubble", face(outer, x0 if outer == "W" else x1), -2.2, 9.8, Z0, 1.6,
                     seed=12 if outer == "W" else 13, d=0.06, density=2.4)
        g.parapet("stone", x0, -2.5, x1, 10, 4.0, 0.6, 0.3)
    g.vol("stone", -6, 6, 6, 10, Z0, 4.0, t=0.5, holes={"S": [(-5, 5, Z0 + 0.05, 3.3)]})
    coursed(g, -6, 6, 6, 10, Z0, 4.0)
    g.parapet("stone", -6, 6, 6, 10, 4.0, 0.6, 0.3)

    g.pool(-2.6, -1.0, 2.6, 2.4, Z0 + 0.03)
    for i, (x, y) in enumerate([(-4.8, 4.0), (4.8, 4.0), (-4.8, 0.2), (4.8, 0.2)]):
        g.canopy(x, y, 3.4, r=1.5, seed=400 + i)
    for i, (x, y, h) in enumerate([(-14.0, -11.4, 4.2), (-10.6, -11.6, 3.8), (14.0, -11.4, 4.0),
                                   (10.6, -11.6, 3.6), (-14.4, 3.0, 4.2), (14.4, 2.0, 4.4),
                                   (-14.0, 11.0, 3.8), (14.0, 11.0, 4.0)]):
        g.canopy(x, y, h, r=1.7, seed=410 + i)
    g.box("coping", -3.0, -14, Z0, 3.0, -9, Z0 + 0.02)

    g.anchor("coursed-stone", -8.0, -9.1, 4.0, "wall")
    g.anchor("tower", 0.0, 7.4, Z0 + 11.6, "roof")
    g.anchor("quoins", -11.1, -8.0, 3.0, "wall")
    g.anchor("lintel", 0.0, -9.2, 3.4, "wall")
    g.anchor("olive-court", 0.0, 1.5, 0.3, "court")


CAMERA = {"target": (0, 0, 4.2), "hero": (-33, 22, 52, 35), "thumb": (-28, 28, 46, 35),
          "detail": ((-6.5, -9.4, 3.6), -22, 6, 13, 48), "court": ((3.4, 8.0, 1.7), (-1.0, -1.0, 3.2), 22),
          "street": ((7.2, -13.2, 1.7), (0, -9, 3.6), 26)}
