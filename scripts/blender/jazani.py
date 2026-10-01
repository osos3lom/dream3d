# Jazani villa — conical thatch "oshah" drums clustered with a painted mud qasabah tower.
PREFIX = "Jazani"
MATS = {
    "mud": ("#c4915c", 0.95, 0.0), "mud_d": ("#966b3c", 0.95, 0.0), "lime": ("#f3ebd8", 0.85, 0.0),
    "red": ("#bf3b2c", 0.6, 0.0), "ochre": ("#e4b23a", 0.6, 0.0), "green": ("#2f7a4e", 0.6, 0.0),
    "blue": ("#2d5f94", 0.6, 0.0), "shadow": ("#261b11", 0.9, 0.0),
    "reed": ("#c3a364", 0.9, 0.0), "reed_d": ("#8f7240", 0.9, 0.0), "reed_l": ("#d9bd83", 0.9, 0.0),
    "wood": ("#6b4524", 0.8, 0.0), "door": ("#bf3b2c", 0.6, 0.0),
    "glass": ("#1d262b", 0.07, 0.5), "frame": ("#4a3421", 0.5, 0.3),
    "pave": ("#e0d2b2", 0.9, 0.0), "court": ("#cfbc95", 0.9, 0.0), "lawn": ("#5f8a3f", 0.95, 0.0),
    "water": ("#3a9fa8", 0.05, 0.0), "coping": ("#eee2c6", 0.8, 0.0),
    "trunk": ("#7a5f45", 0.95, 0.0), "leaf": ("#4d7a34", 0.8, 0.0),
}
BG = "#e7dcc0"
PAL = ["red", "ochre", "green", "blue"]


def oshah(g, cx, cy, r=3.0, wall=2.4, roof=4.6, door=None, rings=4):
    """The Jazan round hut: painted mud drum under a tall conical thatch."""
    gaps = (door,) if door else ()
    g.drum("mud", cx, cy, 0.25, 0.25 + wall, r, 0.4, seg=24, gaps=gaps)
    for k, m in enumerate(PAL[:3]):
        z = 0.25 + wall - 1.25 + k * 0.32
        g.cyl("lime", cx, cy, z, z + 0.26, r + 0.03, r + 0.03, seg=24)
        g.cyl(m, cx, cy, z + 0.05, z + 0.21, r + 0.06, r + 0.06, seg=24)
    g.thatch("reed", cx, cy, 0.25 + wall, roof, r, seg=24, rings=rings, ring_m="reed_d")
    g.cyl("reed_l", cx, cy, 0.25 + wall + roof * 0.86, 0.25 + wall + roof + 0.5, 0.1, 0.05, seg=8)


def build(g):
    Z0 = 0.25
    g.box("pave", -17, -14, 0, 17, 14, Z0)
    g.box("lawn", -16.5, -13.5, Z0, -3.6, -10.8, Z0 + 0.06)
    g.box("lawn", 3.6, -13.5, Z0, 16.5, -10.8, Z0 + 0.06)
    g.box("lawn", -16.5, 9.0, Z0, 16.5, 13.5, Z0 + 0.06)
    g.box("court", -7.5, -3.5, Z0, 7.5, 5.5, Z0 + 0.03)

    # three oshah drums — the main one on the street axis
    oshah(g, 0, -7.0, r=3.4, wall=2.6, roof=5.4, door=(250, 290), rings=5)
    oshah(g, -8.2, -5.6, r=2.6, wall=2.2, roof=4.0, rings=4)
    oshah(g, 8.2, -5.6, r=2.6, wall=2.2, roof=4.0, rings=4)
    # painted door panel on the main drum
    fS = face("S", -10.4)
    g.lbox("lime", fS, -1.5, 1.5, Z0, 3.0, 0, 0.06)
    g.lbox("door", fS, -1.0, 1.0, Z0, 2.5, 0.06, 0.1)
    g.tri_row(PAL, fS, -1.5, 1.5, 2.56, 0.3, 0.26, 0.32, 0.06, 0.1)

    # the qasabah — a painted mud tower linking the drums to the family wing
    for k, (zb, zt) in enumerate([(Z0, 3.2), (3.2, 6.0), (6.0, 8.5)]):
        ins = k * 0.2
        g.vol("mud", -2.2 + ins, 1.0 + ins, 2.2 - ins, 5.2 - ins, zb, zt, t=0.45, roof=(k == 2),
              holes={"S": [(-0.5, 0.5, zb + 0.9, zb + 2.0)]} if k else {})
        if k:
            fr = face("S", 1.0 + ins)
            g.lbox("lime", fr, -0.85, 0.85, zb + 0.78, zb + 2.16, 0, 0.06)
            g.lbox("shadow", fr, -0.5, 0.5, zb + 0.9, zb + 2.0, -0.42, -0.38)
            g.tri_row(PAL, fr, -0.85, 0.85, zb + 2.2, 0.24, 0.2, 0.26, 0.06, 0.1)
        g.band("lime", -2.2 + ins, 1.0 + ins, 2.2 - ins, 5.2 - ins, zt - 0.34, 0.3, 0.07)
    g.parapet("mud", -2.0, 1.2, 2.0, 5.0, 8.5, 0.5, 0.26)
    for sd, pl, u0, u1 in (("S", 1.2, -2.0, 2.0), ("E", 2.0, 1.2, 5.0), ("W", -2.0, 1.2, 5.0), ("N", 5.0, -2.0, 2.0)):
        g.shurfat("lime", face(sd, pl), u0 + 0.1, u1 - 0.1, 9.0, 0.26, w=0.4, h=0.42, p=0.72, steps=1)

    # family wing behind, with a painted frieze and deep veranda
    g.vol("mud", -11, 5.2, 11, 9.4, Z0, 4.4, t=0.5, sill="mud_d", holes={
        "S": [(-9.0, -5.6, 0.9, 3.0), (-3.4, 3.4, 0.9, 3.0), (5.6, 9.0, 0.9, 3.0)],
        "N": [(-7.0, -5.8, 1.4, 2.8), (-0.6, 0.6, 1.4, 2.8), (5.8, 7.0, 1.4, 2.8)]})
    frN = face("S", 5.2)
    g.lbox("lime", frN, -11, 11, 4.4, 5.05, -0.32, 0.05)
    g.tri_row(PAL, frN, -10.8, 10.8, 4.5, 0.3, 0.26, 0.32, 0.05, 0.09)
    g.tri_row(PAL[::-1], frN, -10.6, 10.6, 4.84, 0.26, 0.24, 0.3, 0.05, 0.09, down=True)
    g.parapet("mud", -11, 5.2, 11, 9.4, 4.4, 0.65, 0.3)
    for x in [i * 2.4 - 8.4 for i in range(8)]:
        g.cyl("trunk", x, 3.6, Z0, 3.3, 0.19, 0.16, seg=8)
    g.box("wood", -8.8, 3.3, 3.3, 8.8, 3.9, 3.46)
    for y in [3.35 + i * 0.24 for i in range(3)]:
        g.box("reed", -8.8, y, 3.46, 8.8, y + 0.15, 3.58)
    g.box("reed_d", -8.8, 3.3, 3.58, 8.8, 3.9, 3.66)

    g.pool(-3.0, -1.6, 3.0, 1.4, Z0 + 0.03)
    for i, (x, y) in enumerate([(-6.0, 1.0), (6.0, 1.0)]):
        g.palm(x, y, 6.4 - i * 0.4, seed=1401 + i)
    for i, (x, y, h) in enumerate([(-14.0, -11.8, 7.4), (-11.0, -12.0, 6.6), (14.0, -11.8, 7.1),
                                   (11.0, -12.0, 6.4), (-14.6, 2.0, 6.8), (14.6, 1.0, 7.2),
                                   (-7.0, 11.6, 6.6), (7.0, 11.6, 6.9)]):
        g.palm(x, y, h, seed=1410 + i)
    for i, x in enumerate((-4.6, -2.6, 2.6, 4.6)):
        g.shrub(x, -12.2, 0.6, seed=1420 + i)
    g.box("coping", -3.6, -14, Z0, 3.6, -10.6, Z0 + 0.02)

    g.anchor("oshah", 0.0, -7.0, 8.6, "roof")
    g.anchor("painted-ring", -8.2, -8.2, 2.0, "wall")
    g.anchor("qasabah", 0.0, 1.0, 8.8, "roof")
    g.anchor("frieze", 0.0, 5.1, 4.7, "wall")
    g.anchor("courtyard", 0.0, 0.0, 0.3, "court")


CAMERA = {"target": (0, -1.0, 3.8), "hero": (-33, 23, 52, 35), "thumb": (-28, 29, 46, 35),
          "detail": ((-4.6, -10.0, 3.0), -24, 8, 12, 45), "court": ((6.4, 0.0, 1.7), (-1.0, 4.0, 3.2), 22),
          "street": ((7.4, -13.4, 1.7), (0, -8.0, 4.6), 26)}
