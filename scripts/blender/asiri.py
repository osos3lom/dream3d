# Asiri villa — stone towers with slate rain ribs, Al-Qatt painted friezes and qamariya lights.
PREFIX = "Asiri"
MATS = {
    "stone": ("#86735f", 0.95, 0.0), "stone_base": ("#6f604f", 0.95, 0.0), "slate": ("#3d3a36", 0.8, 0.0),
    "white": ("#f3efe6", 0.8, 0.0), "red": ("#b8392c", 0.6, 0.0), "green": ("#3c7a4a", 0.6, 0.0),
    "yellow": ("#e1b43b", 0.6, 0.0), "blue": ("#2e5c8e", 0.6, 0.0), "qamar": ("#f0c96a", 0.3, 0.0),
    "glass": ("#1f2a33", 0.06, 0.5), "frame": ("#f3efe6", 0.6, 0.0), "door": ("#6a4a2e", 0.7, 0.0),
    "shadow": ("#211c18", 0.9, 0.0), "pave": ("#cfc1a8", 0.9, 0.0), "lawn": ("#627f42", 0.95, 0.0),
    "water": ("#3f8fa8", 0.05, 0.0), "coping": ("#e9e2d4", 0.8, 0.0), "trunk": ("#5e4a38", 0.95, 0.0),
    "leaf": ("#3f5a34", 0.85, 0.0),
}
BG = "#dfe1da"
QATT = ["red", "yellow", "green", "blue"]


def juniper(g, x, y, h, seed=0):
    g.cyl("trunk", x, y, 0.2, h * 0.35, 0.18, 0.12, seg=7)
    for k in range(3):
        z0 = h * (0.25 + 0.22 * k)
        r = 1.5 * (1 - 0.25 * k)
        g.cyl("leaf", x, y, z0, z0 + h * 0.4, r, 0.05, seg=9)


def window(g, fr, a0, a1, b0, b1):
    """White-painted surround, a qamariya light above, and a painted triangle row."""
    g.lbox("white", fr, a0 - 0.2, a0, b0 - 0.2, b1 + 0.2, 0, 0.05)
    g.lbox("white", fr, a1, a1 + 0.2, b0 - 0.2, b1 + 0.2, 0, 0.05)
    g.lbox("white", fr, a0 - 0.2, a1 + 0.2, b0 - 0.2, b0, 0, 0.05)
    g.lbox("white", fr, a0 - 0.2, a1 + 0.2, b1, b1 + 0.2, 0, 0.05)
    c = (a0 + a1) / 2
    g.poly("white", [(c - 0.55, b1 + 0.25), (c + 0.55, b1 + 0.25), (c, b1 + 0.85)], fr, 0, 0.04)
    g.poly("qamar", [(c - 0.35, b1 + 0.33), (c + 0.35, b1 + 0.33), (c, b1 + 0.7)], fr, 0.04, 0.06)
    g.tri_row(QATT, fr, a0 - 0.2, a1 + 0.2, b0 - 0.42, 0.2, 0.18, 0.2, 0.0, 0.07, down=True)


def tower(g, x0, y0, x1, y1, z0, floors, fh=3.0, wins=None):
    wins = wins or {}
    ins = 0.12
    for k in range(floors):
        a, b = x0 + ins * k, y0 + ins * k
        c, d = x1 - ins * k, y1 - ins * k
        zb, zt = z0 + k * fh, z0 + (k + 1) * fh
        hs = {}
        for sd, us in wins.items():
            hs[sd] = [(u - 0.45, u + 0.45, zb + 1.0, zb + 2.2) for u in us]
        g.vol("stone", a, b, c, d, zb, zt, t=0.5, holes=hs, roof=False, frame="white")
        for sd, us in wins.items():
            pl = {"S": b, "N": d, "W": a, "E": c}[sd]
            for u in us:
                window(g, face(sd, pl), u - 0.45, u + 0.45, zb + 1.0, zb + 2.2)
        g.ribs("slate", a, b, c, d, zb + 0.15, zt - 0.9, step=0.5, h=0.06, p=0.13)
        g.band("white", a, b, c, d, zt - 0.08, 0.16, 0.05)
    k = floors - 1
    a, b, c, d = x0 + ins * k, y0 + ins * k, x1 - ins * k, y1 - ins * k
    zt = z0 + floors * fh
    g.box("stone", a, b, zt - 0.3, c, d, zt)
    # Al-Qatt frieze band under the parapet
    for sd, pl, u0, u1 in (("S", b, a, c), ("N", d, a, c), ("W", a, b, d), ("E", c, b, d)):
        fr = face(sd, pl)
        g.lbox("white", fr, u0, u1, zt - 0.95, zt - 0.1, 0, 0.04)
        g.tri_row(QATT, fr, u0 + 0.1, u1 - 0.1, zt - 0.9, 0.34, 0.3, 0.34, 0.04, 0.08)
        g.tri_row(QATT[::-1], fr, u0 + 0.27, u1 - 0.27, zt - 0.5, 0.34, 0.3, 0.34, 0.04, 0.08, down=True)
    g.parapet("white", a, b, c, d, zt, 0.5, 0.3)
    for sd, pl, u0, u1 in (("S", b, a, c), ("N", d, a, c), ("W", a, b, d), ("E", c, b, d)):
        g.shurfat("white", face(sd, pl), u0 + 0.1, u1 - 0.1, zt + 0.5, 0.3, w=0.55, h=0.55, p=0.9, steps=1)
    return zt


def build(g):
    Z0 = 0.25
    TZ = 1.45
    g.box("pave", -17, -14, 0, 17, 14, Z0)
    g.box("lawn", -16.5, -13.5, Z0, 3.2, -9.5, Z0 + 0.06)
    g.box("lawn", 9.5, -13.5, Z0, 16.5, -2.5, Z0 + 0.06)
    # stone terrace — the mountain-village plinth
    g.box("stone_base", -13, -2, Z0, 13, 12.5, TZ)
    g.ribs("slate", -13, -2, 13, 12.5, Z0, TZ, step=0.4, h=0.05, p=0.08)
    for i in range(6):
        g.box("stone_base", 4.0, -2.0 - (i + 1) * 0.5, Z0, 8.0, -2.0 - i * 0.5, TZ - i * 0.2)

    # modern glazed wing with a painted roof terrace
    g.vol("stone", -12, -8.5, 3, -2, Z0, 3.85, t=0.45, frame="white", holes={
        "S": [(-11.2, -6.2, 0.45, 3.3), (-5.4, -0.4, 0.45, 3.3), (0.4, 2.3, 0.45, 3.3)],
        "W": [(-7.8, -3.0, 0.45, 3.3)]})
    fS = face("S", -8.5)
    g.lbox("white", fS, -12, 3, 3.85, 4.75, -0.3, 0.04)
    g.tri_row(QATT, fS, -11.9, 2.9, 3.95, 0.34, 0.3, 0.36, 0.04, 0.08)
    g.tri_row(QATT[::-1], fS, -11.7, 2.7, 4.35, 0.34, 0.3, 0.36, 0.04, 0.08, down=True)
    g.parapet("white", -12, -8.5, 3, -2, 3.85, 0.9, 0.3, sides="SWE")
    g.band("slate", -12, -8.5, 3, -2, 3.75, 0.08, 0.1)

    # the two towers
    zA = tower(g, -9, -2, -1, 6, TZ, 4, wins={"S": [-7.0, -3.0], "W": [0.0, 3.5], "E": [2.0], "N": [-5.0]})
    zB = tower(g, 0, 1, 6, 8, TZ, 3, wins={"S": [4.5], "E": [3.0, 6.0], "N": [3.0]})
    # door into tower B with painted surround
    fB = face("S", 1)
    g.wall("stone", fB, 0.6, 2.9, TZ, TZ + 0.1, 0.01)
    g.lbox("door", fB, 1.2, 2.6, TZ, TZ + 2.7, 0, 0.12)
    g.lbox("white", fB, 0.9, 2.9, TZ + 2.7, TZ + 3.0, 0, 0.14)
    g.lbox("white", fB, 0.9, 1.2, TZ, TZ + 2.7, 0, 0.14)
    g.lbox("white", fB, 2.6, 2.9, TZ, TZ + 2.7, 0, 0.14)
    g.tri_row(QATT, fB, 0.9, 2.9, TZ + 2.75, 0.22, 0.2, 0.25, 0.14, 0.17)

    # terrace garden and pool
    g.pool(-11.5, 7.5, -3.0, 11.5, TZ)
    for i, (x, y, h) in enumerate([(-14.6, -11.0, 5.6), (-14.4, 4.5, 6.2), (14.4, -11.0, 5.4), (14.2, 8.0, 6.4),
                                   (9.5, 10.5, 5.0), (-1.5, 11.0, 5.2)]):
        juniper(g, x, y, h, seed=i)
    for i, x in enumerate((-10.0, -6.0, -2.0)):
        g.shrub(x, -11.3, 0.55, seed=70 + i)
    g.box("coping", 3.8, -14, Z0, 8.2, -5.0, Z0 + 0.02)

    g.anchor("slate-ribs", -9.0, 2.0, 6.5, "wall")
    g.anchor("al-qatt", -5.0, -2.4, zA - 0.6, "wall")
    g.anchor("qamariya", -7.0, -2.1, TZ + 3.0 + 2.8, "wall")
    g.anchor("crenellations", -5.0, 2.0, zA + 0.9, "roof")
    g.anchor("painted-terrace", -4.5, -5.5, 4.6, "roof")


CAMERA = {"target": (0, 0, 5.0), "hero": (-34, 20, 52, 35), "thumb": (-28, 24, 46, 35),
          "detail": ((-5, -2, 11.0), -20, 8, 16, 45), "court": ((-12.3, 12.0, 3.3), (-3, 3, 6.5), 22), "street": ((6.0, -13.0, 1.7), (-3, -3, 5.0), 24), "cut": 3.2}
