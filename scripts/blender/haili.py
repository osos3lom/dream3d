# Ha'ili villa — fortress mass with round corner towers and painted geometric surrounds.
PREFIX = "Haili"
MATS = {
    "mud": ("#c99a68", 0.95, 0.0), "mud_dark": ("#9c7244", 0.95, 0.0), "shadow": ("#2a2019", 0.9, 0.0),
    "white": ("#f0e7d6", 0.8, 0.0), "red": ("#b8392c", 0.6, 0.0), "green": ("#2f6b4a", 0.6, 0.0),
    "ochre": ("#e0ad3c", 0.6, 0.0), "door": ("#7d4a26", 0.7, 0.0),
    "glass": ("#1c262c", 0.08, 0.5), "frame": ("#3b2d22", 0.5, 0.3), "wood": ("#7d5a35", 0.8, 0.0),
    "pave": ("#e2d2b2", 0.9, 0.0), "court": ("#d3bc94", 0.9, 0.0), "lawn": ("#6d8a47", 0.95, 0.0),
    "water": ("#3a8fa8", 0.05, 0.0), "coping": ("#eadcc0", 0.8, 0.0),
    "trunk": ("#7a5f45", 0.95, 0.0), "leaf": ("#5b7438", 0.8, 0.0),
}
BG = "#ead9bd"
PAL = ["red", "ochre", "green", "white"]


def painted_frame(g, fr, a0, a1, b0, b1):
    """White band around an opening, with a diamond row above and below."""
    for box in ((a0 - 0.22, a0, b0 - 0.22, b1 + 0.22), (a1, a1 + 0.22, b0 - 0.22, b1 + 0.22),
                (a0 - 0.22, a1 + 0.22, b0 - 0.22, b0), (a0 - 0.22, a1 + 0.22, b1, b1 + 0.22)):
        g.lbox("white", fr, *box, 0, 0.05)
    g.tri_row(PAL[:3], fr, a0 - 0.22, a1 + 0.22, b1 + 0.24, 0.22, 0.2, 0.24, 0.05, 0.09)
    g.tri_row(PAL[:3][::-1], fr, a0 - 0.22, a1 + 0.22, b0 - 0.48, 0.22, 0.2, 0.24, 0.05, 0.09, down=True)


def tower(g, cx, cy, z0, z1, r=2.3):
    """Round corner burj with a painted collar and stepped cap."""
    g.cyl("mud", cx, cy, z0, z1, r, r * 0.88, seg=22)
    g.cyl("mud_dark", cx, cy, z1 - 0.22, z1 + 0.1, r * 0.9, r * 0.95, seg=22)
    g.cyl("mud", cx, cy, z1 + 0.1, z1 + 0.95, r * 0.95, r * 0.9, seg=22)
    for k, m in enumerate(PAL[:3]):
        g.cyl(m, cx, cy, z1 - 1.5 + k * 0.26, z1 - 1.5 + k * 0.26 + 0.2, r * 0.92, r * 0.92, seg=22)
    for i in range(14):
        a = 2 * 3.14159 * i / 14
        x, y = cx + r * 0.9 * math.cos(a), cy + r * 0.9 * math.sin(a)
        g.box("white", x - 0.2, y - 0.2, z1 + 0.95, x + 0.2, y + 0.2, z1 + 1.5)


def build(g):
    Z0 = 0.25
    g.box("pave", -17, -14, 0, 17, 14, Z0)
    g.box("lawn", -16.5, -13.5, Z0, -3.0, -10.6, Z0 + 0.06)
    g.box("lawn", 3.0, -13.5, Z0, 16.5, -10.6, Z0 + 0.06)
    g.box("lawn", -16.5, 10.6, Z0, 16.5, 13.5, Z0 + 0.06)
    g.box("court", -6, -2.5, Z0, 6, 5, Z0 + 0.03)

    fS = face("S", -8.5)
    wins_S = [(-8.6, -7.4), (-5.4, -4.2), (4.2, 5.4), (7.4, 8.6)]
    hS = [(-1.5, 1.5, Z0, 3.5, "door")]
    hS += [(a, b, 1.5, 3.0) for a, b in wins_S]
    hS += [(a + 0.15, b - 0.15, 4.6, 6.0) for a, b in wins_S]
    g.vol("mud", -10.5, -8.5, 10.5, -2.5, Z0, 7.0, t=0.55, holes={
        "S": hS, "N": [(-6, 6, Z0 + 0.05, 3.4), (-5, 5, 4.4, 6.0)],
        "W": [(-6.6, -5.2, 1.5, 3.0)], "E": [(-6.6, -5.2, 1.5, 3.0)]})
    for a, b in wins_S:
        painted_frame(g, fS, a, b, 1.5, 3.0)
        painted_frame(g, fS, a + 0.15, b - 0.15, 4.6, 6.0)
    g.band("mud_dark", -10.5, -8.5, 10.5, -2.5, 3.8, 0.18, 0.05)
    # painted frieze under the parapet, then a white stepped crown
    g.lbox("white", fS, -10.5, 10.5, 6.15, 6.95, -0.3, 0.05)
    g.tri_row(PAL[:3], fS, -10.4, 10.4, 6.25, 0.3, 0.27, 0.32, 0.05, 0.09)
    g.tri_row(PAL[:3][::-1], fS, -10.2, 10.2, 6.6, 0.3, 0.27, 0.32, 0.05, 0.09, down=True)
    g.parapet("mud", -10.5, -8.5, 10.5, -2.5, 7.0, 0.9, 0.35)
    for sd, pl, u0, u1 in (("S", -8.5, -10.5, 10.5), ("N", -2.5, -10.5, 10.5)):
        g.shurfat("white", face(sd, pl), u0 + 0.3, u1 - 0.3, 7.9, 0.3, w=0.5, h=0.5, p=0.9, steps=1)

    # door: carved timber under a painted panel
    g.lbox("mud_dark", fS, -1.95, -1.5, Z0, 3.95, 0, 0.12)
    g.lbox("mud_dark", fS, 1.5, 1.95, Z0, 3.95, 0, 0.12)
    g.lbox("white", fS, -2.3, 2.3, 3.95, 4.85, 0, 0.12)
    g.tri_row(PAL[:3], fS, -2.2, 2.2, 4.05, 0.32, 0.28, 0.34, 0.12, 0.16)
    g.tri_row(PAL[:3][::-1], fS, -2.0, 2.0, 4.45, 0.32, 0.28, 0.34, 0.12, 0.16, down=True)
    for z in (0.9, 1.8, 2.7):
        g.lbox("ochre", fS, -1.2, 1.2, z, z + 0.1, -0.36, -0.33)

    tower(g, -10.5, -8.5, Z0, 9.2)
    tower(g, 10.5, -8.5, Z0, 9.2)

    # side and rear wings around the court
    for x0, x1, outer in ((-10.5, -6, "W"), (6, 10.5, "E")):
        inner = "E" if outer == "W" else "W"
        g.vol("mud", x0, -2.5, x1, 10, Z0, 4.1, t=0.5, holes={
            outer: [(0.4, 1.6, 1.5, 3.0), (4.4, 5.6, 1.5, 3.0), (8.0, 9.2, 1.5, 3.0)],
            inner: [(-2.0, 5.6, Z0 + 0.05, 3.4)], "N": [(x0 + 1.4, x1 - 1.4, 1.5, 3.0)]})
        fr = face(outer, x0 if outer == "W" else x1)
        for a in (0.4, 4.4, 8.0):
            painted_frame(g, fr, a, a + 1.2, 1.5, 3.0)
        g.parapet("mud", x0, -2.5, x1, 10, 4.1, 0.7, 0.3)
        g.band("mud_dark", x0, -2.5, x1, 10, 4.05, 0.12, 0.05)
    g.vol("mud", -6, 6, 6, 10, Z0, 4.1, t=0.5, holes={"S": [(-5, 5, Z0 + 0.05, 3.4)]})
    g.parapet("mud", -6, 6, 6, 10, 4.1, 0.7, 0.3)

    g.pool(-2.6, -0.8, 2.6, 2.6, Z0 + 0.03)
    g.palm(-4.8, 3.6, 6.1, seed=301)
    g.palm(4.8, 3.6, 5.7, seed=302)
    for i, (x, y, h) in enumerate([(-13.8, -11.4, 7.0), (13.8, -11.4, 6.8), (-14.2, 3.0, 6.5),
                                   (14.2, 2.0, 7.0), (-8.0, 12.0, 6.2), (8.0, 12.0, 6.6)]):
        g.palm(x, y, h, seed=310 + i)
    for i, x in enumerate((-6.0, -4.0, 4.0, 6.0)):
        g.shrub(x, -12.0, 0.6, seed=320 + i)
    g.box("coping", -3.0, -14, Z0, 3.0, -8.5, Z0 + 0.02)

    g.anchor("painted-surround", -5.0, -8.6, 5.3, "wall")
    g.anchor("burj", -10.5, -8.5, 10.6, "roof")
    g.anchor("frieze", 3.0, -8.6, 6.6, "wall")
    g.anchor("door", 0.0, -8.6, 2.2, "wall")
    g.anchor("courtyard", 0.0, 1.0, 0.3, "court")


CAMERA = {"target": (0, 0, 4.0), "hero": (-34, 22, 52, 35), "thumb": (-28, 28, 46, 35),
          "detail": ((-5, -9.0, 5.2), -20, 6, 14, 48), "court": ((3.2, 7.6, 1.7), (-1.0, -1.5, 3.2), 22),
          "street": ((7.5, -13.2, 1.7), (0, -8.5, 4.0), 26)}
