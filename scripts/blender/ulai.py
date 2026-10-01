# Al-Ula villa — stepped mud-brick massing with athil beam ends, small high windows, palm groves.
PREFIX = "Ulai"
MATS = {
    "mud": ("#cda878", 0.95, 0.0), "mud_d": ("#a37f52", 0.95, 0.0), "mud_l": ("#e0c396", 0.95, 0.0),
    "shadow": ("#2a2017", 0.9, 0.0), "wood": ("#6d4b29", 0.8, 0.0), "door": ("#7a4a22", 0.7, 0.0),
    "glass": ("#1d262b", 0.07, 0.5), "frame": ("#4a3421", 0.5, 0.3), "lattice": ("#5c3d20", 0.7, 0.0),
    "pave": ("#e1cfae", 0.9, 0.0), "court": ("#d2b98f", 0.9, 0.0), "lawn": ("#6d8a47", 0.95, 0.0),
    "water": ("#3a8fa8", 0.05, 0.0), "coping": ("#ecdcbd", 0.8, 0.0),
    "trunk": ("#7a5f45", 0.95, 0.0), "leaf": ("#5b7438", 0.8, 0.0),
}
BG = "#ecd9b8"


def mudblock(g, x0, y0, x1, y1, z0, z1, holes=None, beams="S", t=0.5):
    """A mud-brick mass: battered base band, beam ends, low parapet."""
    g.vol("mud", x0, y0, x1, y1, z0, z1, t=t, holes=holes or {}, sill="mud_d")
    g.band("mud_d", x0, y0, x1, y1, z0, 0.5, 0.08)
    for sd in beams:
        pl = {"S": y0, "N": y1, "W": x0, "E": x1}[sd]
        u0, u1 = (x0 + 0.3, x1 - 0.3) if sd in "SN" else (y0 + 0.3, y1 - 0.3)
        g.beam_row("wood", face(sd, pl), u0, u1, z1 - 0.45, step=0.62, dep=0.34, w=0.13)
    g.parapet("mud", x0, y0, x1, y1, z1, 0.6, 0.32)
    g.band("mud_d", x0, y0, x1, y1, z1 - 0.06, 0.1, 0.05)


def build(g):
    Z0 = 0.25
    g.box("pave", -17, -14, 0, 17, 14, Z0)
    g.box("lawn", -16.5, -13.5, Z0, -3.0, -10.8, Z0 + 0.06)
    g.box("lawn", 3.0, -13.5, Z0, 16.5, -10.8, Z0 + 0.06)
    g.box("lawn", -16.5, 9.6, Z0, 16.5, 13.5, Z0 + 0.06)
    g.box("court", -5.5, -2.5, Z0, 5.5, 4.5, Z0 + 0.03)

    fS = face("S", -9.4)
    # the street face steps up in three mud masses, as the old town does on its hill
    hS = [(-1.4, 1.4, Z0, 3.3, "door")]
    for x in (-8.2, -6.0, 6.0, 8.2):
        hS.append((x - 0.42, x + 0.42, 1.5, 2.7))
    for x in (-7.1, 7.1):
        hS.append((x - 0.35, x + 0.35, 4.3, 5.3))
    mudblock(g, -10, -9.4, 10, -4.0, Z0, 6.0, holes={
        "S": hS, "N": [(-5.5, 5.5, Z0 + 0.05, 3.3), (-4.5, 4.5, 4.2, 5.4)],
        "W": [(-8.2, -6.8, 1.5, 2.7)], "E": [(-8.2, -6.8, 1.5, 2.7)]})
    mudblock(g, -7.4, -4.0, 7.4, -0.5, 6.0, 8.6, holes={
        "S": [(-5.4, -4.4, 6.9, 8.0), (-1.6, 1.6, 6.9, 8.0), (4.4, 5.4, 6.9, 8.0)],
        "N": [(-4.0, 4.0, 6.9, 8.0)]}, beams="SN", t=0.45)
    mudblock(g, -3.6, -0.5, 3.6, 2.6, 8.6, 10.9,
             holes={"S": [(-2.4, 2.4, 9.4, 10.3)], "E": [(0.2, 1.6, 9.4, 10.3)]}, beams="S", t=0.4)
    # lattice shutters in the upper openings
    for a, b, z0, z1 in ((-5.4, -4.4, 6.9, 8.0), (4.4, 5.4, 6.9, 8.0)):
        g.lattice("lattice", face("S", -4.0), a, b, z0, z1, -0.3, -0.27, cell=0.14)
    # carved door under a timber lintel
    g.lbox("mud_d", fS, -1.8, -1.4, Z0, 3.6, 0, 0.12)
    g.lbox("mud_d", fS, 1.4, 1.8, Z0, 3.6, 0, 0.12)
    g.lbox("wood", fS, -2.1, 2.1, 3.3, 3.6, 0, 0.5)
    g.lattice("lattice", fS, -1.1, 1.1, 2.5, 3.2, -0.3, -0.27, cell=0.12)
    g.beam_row("wood", fS, -2.0, 2.0, 3.75, step=0.5, dep=0.52, w=0.14)

    # side wings framing a narrow shaded court, as the old alleys do
    for x0, x1, outer in ((-10, -5.5, "W"), (5.5, 10, "E")):
        inner = "E" if outer == "W" else "W"
        mudblock(g, x0, -4.0, x1, 9.2, Z0, 4.1, holes={
            outer: [(1.0, 1.9, 1.5, 2.7), (4.6, 5.5, 1.5, 2.7), (8.2, 9.1, 1.5, 2.7)],
            inner: [(-1.4, 6.6, Z0 + 0.05, 3.2)], "N": [(x0 + 1.3, x1 - 1.3, 1.5, 2.7)]},
                 beams=outer + "N", t=0.45)
    mudblock(g, -5.5, 4.5, 5.5, 9.2, Z0, 4.6,
             holes={"S": [(-4.4, 4.4, Z0 + 0.05, 3.3)], "N": [(-3.2, -2.2, 1.5, 2.7), (2.2, 3.2, 1.5, 2.7)]},
             beams="N", t=0.45)
    # palm-trunk shade over the court edge
    for x in [i * 1.5 - 4.5 for i in range(7)]:
        g.cyl("trunk", x, 3.6, Z0, 3.2, 0.2, 0.17, seg=8)
    g.box("wood", -4.9, 3.3, 3.2, 4.9, 3.9, 3.38)
    for y in [3.35 + i * 0.25 for i in range(3)]:
        g.box("wood", -4.9, y, 3.38, 4.9, y + 0.12, 3.5)

    g.pool(-2.4, -1.4, 2.4, 1.6, Z0 + 0.03)
    g.palm(-4.4, 2.6, 6.2, seed=1001)
    g.palm(4.4, 2.6, 5.8, seed=1002)
    for i, (x, y, h) in enumerate([(-13.6, -11.6, 7.4), (-10.4, -11.8, 6.6), (13.6, -11.6, 7.1),
                                   (10.4, -11.8, 6.4), (-14.2, 2.0, 6.8), (14.2, 1.0, 7.2),
                                   (-9.0, 11.4, 6.4), (0.0, 11.8, 7.0), (9.0, 11.4, 6.6)]):
        g.palm(x, y, h, seed=1010 + i)
    g.box("coping", -3.0, -14, Z0, 3.0, -9.4, Z0 + 0.02)

    g.anchor("stepped-mass", 0.0, -0.5, 11.0, "roof")
    g.anchor("athil-beams", -4.0, -9.6, 5.6, "wall")
    g.anchor("mud-brick", -8.0, -9.5, 3.4, "wall")
    g.anchor("high-window", -7.1, -4.1, 4.8, "wall")
    g.anchor("courtyard", 0.0, 0.5, 0.3, "court")


CAMERA = {"target": (0, 0, 4.4), "hero": (-35, 23, 50, 35), "thumb": (-30, 29, 44, 35),
          "detail": ((-4.0, -9.8, 4.6), -20, 8, 13, 48), "court": ((3.2, 7.4, 1.7), (-1.0, -2.0, 3.0), 22),
          "street": ((7.0, -13.2, 1.7), (0, -9.4, 4.2), 26)}
