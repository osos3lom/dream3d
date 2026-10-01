# Northern Borders villa — a low desert mass under tent-form canopies, rubble base, deep veranda.
PREFIX = "Northern"
MATS = {
    "plaster": ("#e9dcc2", 0.9, 0.0), "plaster_d": ("#c9b893", 0.9, 0.0), "rubble": ("#a7937a", 0.95, 0.0),
    "shadow": ("#272019", 0.9, 0.0), "tent": ("#6b5a43", 0.9, 0.0), "tent_d": ("#4a3c2b", 0.9, 0.0),
    "glass": ("#1f2a30", 0.07, 0.5), "frame": ("#3f3326", 0.5, 0.3), "wood": ("#73573a", 0.8, 0.0),
    "door": ("#5d4428", 0.7, 0.0), "pave": ("#ded2ba", 0.9, 0.0), "court": ("#cfc0a0", 0.9, 0.0),
    "lawn": ("#74874f", 0.95, 0.0), "water": ("#3d93ac", 0.05, 0.0), "coping": ("#eee5d2", 0.8, 0.0),
    "trunk": ("#6b543c", 0.95, 0.0), "leaf": ("#667c4c", 0.85, 0.0),
}
BG = "#ece3d0"


def tent_bay(g, x0, x1, y0, y1, zlow, zhigh):
    """A shade canopy pitched like a bedouin tent roof, on slim posts."""
    xm = (x0 + x1) / 2
    g.add("tent", [(x0, y0, zlow), (xm, y0, zhigh), (x1, y0, zlow),
                   (x0, y1, zlow), (xm, y1, zhigh), (x1, y1, zlow),
                   (x0, y0, zlow - 0.1), (xm, y0, zhigh - 0.1), (x1, y0, zlow - 0.1),
                   (x0, y1, zlow - 0.1), (xm, y1, zhigh - 0.1), (x1, y1, zlow - 0.1)],
          [(0, 1, 4, 3), (1, 2, 5, 4), (6, 9, 10, 7), (7, 10, 11, 8),
           (0, 3, 9, 6), (2, 8, 11, 5), (0, 6, 7, 1), (1, 7, 8, 2),
           (3, 4, 10, 9), (4, 5, 11, 10)])
    for x in (x0, xm, x1):
        for y in (y0, y1):
            z = zhigh if x == xm else zlow
            g.box("wood", x - 0.08, y - 0.08, 0.25, x + 0.08, y + 0.08, z)


def build(g):
    Z0 = 0.25
    g.box("pave", -17, -14, 0, 17, 14, Z0)
    g.box("lawn", -16.5, -13.5, Z0, -3.4, -10.8, Z0 + 0.06)
    g.box("lawn", 3.4, -13.5, Z0, 16.5, -10.8, Z0 + 0.06)
    g.box("lawn", -16.5, 9.4, Z0, 16.5, 13.5, Z0 + 0.06)
    g.box("court", -7, -2.0, Z0, 7, 4.5, Z0 + 0.03)

    fS = face("S", -9.5)
    # long low street block — horizontal emphasis, few and narrow openings
    hS = [(-1.6, 1.6, Z0, 3.2, "door")]
    for x in (-11.0, -8.6, -6.2, 6.2, 8.6, 11.0):
        hS.append((x - 0.45, x + 0.45, 1.5, 3.0))
    for x in (-10.2, -7.4, 7.4, 10.2):
        hS.append((x - 0.25, x + 0.25, 3.9, 4.7))
    g.vol("plaster", -13, -9.5, 13, -4.5, Z0, 5.1, t=0.55, sill="plaster_d", holes={
        "S": hS, "N": [(-8, 8, Z0 + 0.05, 3.3), (-6, 6, 3.9, 4.7)],
        "W": [(-8.6, -7.0, 1.5, 3.0)], "E": [(-8.6, -7.0, 1.5, 3.0)]})
    g.stone_skin("rubble", fS, -13, 13, Z0, 1.5, seed=21, d=0.07, density=2.8)
    g.band("plaster_d", -13, -9.5, 13, -4.5, 1.5, 0.14, 0.06)
    g.band("plaster_d", -13, -9.5, 13, -4.5, 3.5, 0.1, 0.05)
    g.parapet("plaster", -13, -9.5, 13, -4.5, 5.1, 0.55, 0.35)
    g.band("plaster_d", -13, -9.5, 13, -4.5, 5.05, 0.12, 0.06)
    # recessed entry under a tent canopy
    g.lbox("plaster_d", fS, -2.1, -1.6, Z0, 3.5, 0, 0.14)
    g.lbox("plaster_d", fS, 1.6, 2.1, Z0, 3.5, 0, 0.14)
    g.lbox("plaster_d", fS, -2.1, 2.1, 3.2, 3.5, 0, 0.14)
    tent_bay(g, -3.4, 3.4, -11.6, -9.4, 3.6, 4.6)

    # deep veranda onto the court, roofed by a long tent canopy
    for x in [i * 2.2 - 6.6 for i in range(7)]:
        g.box("wood", x - 0.1, 3.0, Z0, x + 0.1, 3.2, 3.3)
    tent_bay(g, -7.2, 7.2, 2.9, 4.6, 3.3, 4.0)

    # side wings, single storey
    for x0, x1, outer in ((-13, -8, "W"), (8, 13, "E")):
        inner = "E" if outer == "W" else "W"
        g.vol("plaster", x0, -4.5, x1, 9, Z0, 3.9, t=0.5, sill="plaster_d", holes={
            outer: [(1.0, 2.0, 1.5, 3.0), (5.0, 6.0, 1.5, 3.0), (9.4, 10.4, 1.5, 3.0)],
            inner: [(-1.0, 7.4, Z0 + 0.05, 3.2)], "N": [(x0 + 1.4, x1 - 1.4, 1.5, 3.0)]})
        g.stone_skin("rubble", face(outer, x0 if outer == "W" else x1), -4.2, 8.8, Z0, 1.5,
                     seed=22 if outer == "W" else 23, d=0.07, density=2.6)
        g.parapet("plaster", x0, -4.5, x1, 9, 3.9, 0.5, 0.3)
        g.band("plaster_d", x0, -4.5, x1, 9, 1.5, 0.12, 0.05)
    g.vol("plaster", -8, 5.5, 8, 9, Z0, 3.9, t=0.5, holes={"S": [(-6.6, 6.6, Z0 + 0.05, 3.2)]})
    g.parapet("plaster", -8, 5.5, 8, 9, 3.9, 0.5, 0.3)

    g.pool(-3.0, -1.2, 3.0, 1.8, Z0 + 0.03)
    for i, (x, y) in enumerate([(-5.6, 2.0), (5.6, 2.0)]):
        g.canopy(x, y, 3.2, r=1.5, seed=500 + i)
    for i, (x, y, h) in enumerate([(-14.4, -11.8, 3.9), (14.4, -11.8, 3.7), (-15.0, 2.0, 4.1),
                                   (15.0, 1.0, 4.0), (-9.0, 11.4, 3.6), (9.0, 11.4, 3.8),
                                   (-1.0, 11.8, 4.0)]):
        g.canopy(x, y, h, r=1.8, seed=510 + i)
    for i, x in enumerate((-5.0, -3.0, 3.0, 5.0)):
        g.shrub(x, -12.2, 0.6, seed=520 + i)
    g.box("coping", -3.4, -14, Z0, 3.4, -9.5, Z0 + 0.02)

    g.anchor("tent-canopy", 0.0, -10.5, 4.8, "roof")
    g.anchor("rubble-base", -9.0, -9.6, 0.9, "wall")
    g.anchor("long-mass", 8.0, -9.6, 4.2, "wall")
    g.anchor("veranda", 0.0, 3.6, 4.1, "roof")
    g.anchor("courtyard", 0.0, 0.5, 0.3, "court")


CAMERA = {"target": (0, 0, 3.0), "hero": (-33, 25, 50, 35), "thumb": (-28, 31, 44, 35),
          "detail": ((0, -11.0, 3.4), -18, 6, 13, 45), "court": ((5.4, 7.4, 1.7), (-1.0, -2.0, 2.8), 22),
          "street": ((8.0, -13.2, 1.7), (0, -9.5, 3.0), 26)}
