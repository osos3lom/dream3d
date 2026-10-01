# Al-Baha villa — Sarat stone tower house ribbed with slate rain courses, juniper slopes.
PREFIX = "Bahi"
MATS = {
    "stone": ("#9a8d7c", 0.95, 0.0), "stone_d": ("#73685a", 0.95, 0.0), "quartz": ("#e2ddd0", 0.85, 0.0),
    "slate": ("#45423d", 0.8, 0.0), "shadow": ("#1f1c18", 0.9, 0.0),
    "wood": ("#6a4a2b", 0.75, 0.0), "door": ("#5a3c20", 0.7, 0.0),
    "glass": ("#1d262b", 0.07, 0.5), "frame": ("#e2ddd0", 0.6, 0.0),
    "pave": ("#d7cfc0", 0.9, 0.0), "court": ("#c6bdac", 0.9, 0.0), "lawn": ("#5a7a3f", 0.95, 0.0),
    "water": ("#3d93ac", 0.05, 0.0), "coping": ("#e9e3d5", 0.8, 0.0),
    "trunk": ("#5e4a38", 0.95, 0.0), "leaf": ("#3d5a33", 0.85, 0.0),
}
BG = "#dfe2db"


def ribbed(g, x0, y0, x1, y1, z0, z1, step=0.46):
    """Dense projecting slate courses — Al-Baha's rain armour, unpainted."""
    g.ribs("slate", x0, y0, x1, y1, z0, z1, step=step, h=0.07, p=0.14)


def tower(g, x0, y0, x1, y1, z0, floors, fh=2.9, wins=None):
    wins = wins or {}
    ins = 0.1
    for k in range(floors):
        a, b, c, d = x0 + ins * k, y0 + ins * k, x1 - ins * k, y1 - ins * k
        zb, zt = z0 + k * fh, z0 + (k + 1) * fh
        hs = {sd: [(u - 0.4, u + 0.4, zb + 0.95, zb + 2.0) for u in us] for sd, us in wins.items()}
        g.vol("stone", a, b, c, d, zb, zt, t=0.5, holes=hs, roof=False, frame="quartz")
        for sd, us in wins.items():
            pl = {"S": b, "N": d, "W": a, "E": c}[sd]
            fr = face(sd, pl)
            for u in us:
                g.lbox("quartz", fr, u - 0.58, u - 0.4, zb + 0.95, zb + 2.18, 0, 0.06)
                g.lbox("quartz", fr, u + 0.4, u + 0.58, zb + 0.95, zb + 2.18, 0, 0.06)
                g.lbox("quartz", fr, u - 0.58, u + 0.58, zb + 2.0, zb + 2.18, 0, 0.06)
        ribbed(g, a, b, c, d, zb + 0.2, zt - 0.7)
        g.band("quartz", a, b, c, d, zt - 0.14, 0.14, 0.06)
    k = floors - 1
    a, b, c, d = x0 + ins * k, y0 + ins * k, x1 - ins * k, y1 - ins * k
    zt = z0 + floors * fh
    g.box("stone", a, b, zt - 0.3, c, d, zt)
    g.parapet("quartz", a, b, c, d, zt, 0.5, 0.3)
    for sd, pl, u0, u1 in (("S", b, a, c), ("N", d, a, c), ("W", a, b, d), ("E", c, b, d)):
        g.shurfat("quartz", face(sd, pl), u0 + 0.15, u1 - 0.15, zt + 0.5, 0.3, w=0.46, h=0.46, p=0.85, steps=1)
    return zt


def build(g):
    Z0 = 0.25
    TZ = 1.3
    g.box("pave", -17, -14, 0, 17, 14, Z0)
    g.box("lawn", -16.5, -13.5, Z0, 2.4, -9.8, Z0 + 0.06)
    g.box("lawn", 9.0, -13.5, Z0, 16.5, -2.0, Z0 + 0.06)
    g.box("stone_d", -13, -2.4, Z0, 13, 12.5, TZ)
    ribbed(g, -13, -2.4, 13, 12.5, Z0, TZ, step=0.4)
    for i in range(5):
        g.box("stone_d", 3.4, -2.4 - (i + 1) * 0.55, Z0, 7.4, -2.4 - i * 0.55, TZ - i * 0.22)

    # glazed garden wing below the towers
    g.vol("stone", -12, -8.6, 2.6, -2.4, Z0, 3.8, t=0.45, frame="quartz", holes={
        "S": [(-11.2, -6.6, 0.5, 3.2), (-5.6, -1.0, 0.5, 3.2), (0.0, 1.9, 0.5, 3.2)],
        "W": [(-7.6, -3.2, 0.5, 3.2)]})
    ribbed(g, -12, -8.6, 2.6, -2.4, Z0, 3.6, step=0.5)
    g.parapet("quartz", -12, -8.6, 2.6, -2.4, 3.8, 0.75, 0.3, sides="SWE")
    g.band("slate", -12, -8.6, 2.6, -2.4, 3.7, 0.1, 0.11)

    zA = tower(g, -9.5, -2.4, -1.5, 5.8, TZ, 4, wins={"S": [-7.6, -3.4], "W": [0.2, 3.6], "E": [2.0], "N": [-5.5]})
    zB = tower(g, 0.5, 1.0, 6.6, 8.4, TZ, 3, wins={"S": [5.0], "E": [3.2, 6.2], "N": [3.4]})
    fB = face("S", 1.0)
    g.lbox("door", fB, 1.8, 3.2, TZ, TZ + 2.6, 0, 0.14)
    g.lbox("quartz", fB, 1.5, 1.8, TZ, TZ + 2.9, 0, 0.16)
    g.lbox("quartz", fB, 3.2, 3.5, TZ, TZ + 2.9, 0, 0.16)
    g.lbox("quartz", fB, 1.5, 3.5, TZ + 2.6, TZ + 2.9, 0, 0.16)
    g.lbox("wood", fB, 1.3, 3.7, TZ + 2.9, TZ + 3.1, 0, 0.85)

    g.pool(-11.6, 7.4, -3.4, 11.4, TZ)
    for i, (x, y, h) in enumerate([(-14.6, -11.0, 5.4), (-14.4, 4.0, 6.0), (14.4, -11.0, 5.2),
                                   (14.2, 7.0, 6.2), (9.6, 11.0, 5.0), (0.0, 11.4, 5.4),
                                   (-6.0, 11.6, 4.8)]):
        g.conifer(x, y, h, r=1.6)
    for i, x in enumerate((-10.0, -6.0, -2.0)):
        g.shrub(x, -10.6, 0.55, seed=900 + i)
    g.box("coping", 3.2, -14, Z0, 7.6, -5.0, Z0 + 0.02)

    g.anchor("slate-ribs", -9.6, 2.0, 6.0, "wall")
    g.anchor("stone-tower", -5.5, -2.5, zA - 0.8, "wall")
    g.anchor("white-frames", -7.6, -2.5, TZ + 1.5, "wall")
    g.anchor("merlons", -5.5, 2.0, zA + 0.9, "roof")
    g.anchor("terrace", -7.5, 9.4, TZ + 0.3, "court")


CAMERA = {"target": (0, 0, 5.0), "hero": (-34, 20, 52, 35), "thumb": (-28, 25, 46, 35),
          "detail": ((-5.5, -2.4, 10.0), -20, 8, 15, 45), "court": ((-12.6, 12.2, 3.2), (-3, 3, 6.2), 22),
          "street": ((5.6, -13.0, 1.7), (-3, -3, 4.6), 24), "cut": 3.0}
