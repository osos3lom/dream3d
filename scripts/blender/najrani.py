# Najrani villa — tall mud tower with white gypsum drip caps, stepped levels, oasis palms.
PREFIX = "Najrani"
MATS = {
    "mud": ("#c08c56", 0.95, 0.0), "mud_d": ("#96693a", 0.95, 0.0), "white": ("#f4efe1", 0.85, 0.0),
    "shadow": ("#271c12", 0.9, 0.0), "wood": ("#6b4524", 0.8, 0.0), "door": ("#7b4320", 0.7, 0.0),
    "glass": ("#1d262b", 0.07, 0.5), "frame": ("#4a3421", 0.5, 0.3), "lattice": ("#5c3d20", 0.7, 0.0),
    "pave": ("#e3cfa9", 0.9, 0.0), "court": ("#d4b887", 0.9, 0.0), "lawn": ("#6d8a47", 0.95, 0.0),
    "water": ("#3a8fa8", 0.05, 0.0), "coping": ("#ecdcbb", 0.8, 0.0),
    "trunk": ("#7a5f45", 0.95, 0.0), "leaf": ("#5b7438", 0.8, 0.0),
}
BG = "#ead6ae"


def drip_cap(g, x0, y0, x1, y1, z, sides="SNEW", h=0.5, p=0.14):
    """The white gypsum cap that sheds rain off a Najrani wall head."""
    g.band("white", x0, y0, x1, y1, z, h, p)
    for sd in sides:
        pl = {"S": y0 - p, "N": y1 + p, "W": x0 - p, "E": x1 + p}[sd]
        u0, u1 = (x0 - p, x1 + p) if sd in "SN" else (y0 - p, y1 + p)
        n = max(1, int((u1 - u0) / 0.78))
        pp = (u1 - u0) / n
        fr = face(sd, pl)
        for i in range(n):
            c = u0 + pp * (i + 0.5)
            g.poly("white", [(c - pp * 0.42, z + h), (c + pp * 0.42, z + h), (c, z + h + 0.42)], fr, -0.1, 0.0)


def win_cap(g, fr, a0, a1, b0, b1):
    """Small window ringed in white gypsum, the Najran signature."""
    for box in ((a0 - 0.2, a0, b0 - 0.2, b1 + 0.2), (a1, a1 + 0.2, b0 - 0.2, b1 + 0.2),
                (a0 - 0.2, a1 + 0.2, b0 - 0.2, b0), (a0 - 0.2, a1 + 0.2, b1, b1 + 0.2)):
        g.lbox("white", fr, *box, 0, 0.06)
    c = (a0 + a1) / 2
    g.poly("white", [(c - 0.4, b1 + 0.22), (c + 0.4, b1 + 0.22), (c, b1 + 0.66)], fr, 0, 0.05)


def build(g):
    Z0 = 0.25
    g.box("pave", -17, -14, 0, 17, 14, Z0)
    g.box("lawn", -16.5, -13.5, Z0, -3.2, -10.8, Z0 + 0.06)
    g.box("lawn", 3.2, -13.5, Z0, 16.5, -10.8, Z0 + 0.06)
    g.box("lawn", -16.5, 9.8, Z0, 16.5, 13.5, Z0 + 0.06)
    g.box("court", -6, -2.5, Z0, 6, 5.0, Z0 + 0.03)

    # the tall tower — five tapering mud levels, each capped in white
    fS = face("S", -9)
    levels = [(Z0, 3.3), (3.3, 6.2), (6.2, 8.9), (8.9, 11.4), (11.4, 13.6)]
    for k, (zb, zt) in enumerate(levels):
        ins = k * 0.22
        x0, x1 = -5.4 + ins, 5.4 - ins
        y0, y1 = -9 + ins * 0.6, -3.4 - ins * 0.6
        hs = {}
        if k == 0:
            hs["S"] = [(-1.5, 1.5, Z0, 3.0, "door")]
        else:
            us = [-3.0, 0.0, 3.0] if k < 3 else [-1.7, 1.7]
            hs["S"] = [(u - 0.45, u + 0.45, zb + 0.9, zb + 2.0) for u in us]
            hs["E"] = [(y0 + 1.6, y0 + 2.6, zb + 0.9, zb + 2.0)]
            hs["W"] = [(y0 + 1.6, y0 + 2.6, zb + 0.9, zb + 2.0)]
        g.vol("mud", x0, y0, x1, y1, zb, zt, t=0.5, holes=hs, roof=(k == len(levels) - 1), sill="mud_d")
        if k:
            for sd, pl in (("S", y0), ("E", x1), ("W", x0)):
                fr = face(sd, pl)
                for h in hs.get(sd, []):
                    win_cap(g, fr, h[0], h[1], h[2], h[3])
        drip_cap(g, x0, y0, x1, y1, zt - 0.5 if k < len(levels) - 1 else zt, "SNEW" if k == len(levels) - 1 else "SEW")
    # ground-floor door
    g.lbox("white", fS, -1.9, -1.5, Z0, 3.3, 0, 0.14)
    g.lbox("white", fS, 1.5, 1.9, Z0, 3.3, 0, 0.14)
    g.lbox("white", fS, -1.9, 1.9, 3.0, 3.3, 0, 0.14)
    g.lattice("lattice", fS, -1.1, 1.1, 2.2, 2.9, -0.3, -0.27, cell=0.13)
    g.beam_row("wood", fS, -2.0, 2.0, 3.45, step=0.5, dep=0.5, w=0.14)

    # low wings flanking the tower, each with its own drip cap
    for x0, x1, outer in ((-11, -5.4, "W"), (5.4, 11, "E")):
        inner = "E" if outer == "W" else "W"
        g.vol("mud", x0, -9, x1, 9.4, Z0, 4.2, t=0.5, sill="mud_d", holes={
            outer: [(0.6, 1.5, 1.4, 2.6), (4.4, 5.3, 1.4, 2.6), (8.2, 9.1, 1.4, 2.6),
                    (12.0, 12.9, 1.4, 2.6)],
            inner: [(5.8, 13.0, Z0 + 0.05, 3.2)],
            "S": [((x0 + x1) / 2 - 0.5, (x0 + x1) / 2 + 0.5, 1.4, 2.6)],
            "N": [(x0 + 1.3, x1 - 1.3, 1.4, 2.6)]})
        fr = face(outer, x0 if outer == "W" else x1)
        for a in (0.6, 4.4, 8.2, 12.0):
            win_cap(g, fr, a, a + 0.9, 1.4, 2.6)
        win_cap(g, face("S", -9), (x0 + x1) / 2 - 0.5, (x0 + x1) / 2 + 0.5, 1.4, 2.6)
        g.band("mud_d", x0, -9, x1, 9.4, Z0, 0.45, 0.08)
        g.beam_row("wood", fr, -8.6, 9.0, 3.85, step=0.62, dep=0.34, w=0.13)
        drip_cap(g, x0, -9, x1, 9.4, 4.2, outer + "SN")
    g.vol("mud", -5.4, 5.4, 5.4, 9.4, Z0, 4.2, t=0.5, holes={"S": [(-4.4, 4.4, Z0 + 0.05, 3.2)]})
    drip_cap(g, -5.4, 5.4, 5.4, 9.4, 4.2, "N")

    g.pool(-2.6, -0.6, 2.6, 2.8, Z0 + 0.03)
    g.palm(-4.6, 3.6, 6.4, seed=1201)
    g.palm(4.6, 3.6, 6.0, seed=1202)
    for i, (x, y, h) in enumerate([(-13.8, -11.6, 7.4), (-10.6, -11.8, 6.6), (13.8, -11.6, 7.1),
                                   (10.6, -11.8, 6.4), (-14.2, 2.0, 6.8), (14.2, 1.0, 7.2),
                                   (-8.0, 11.8, 6.5), (8.0, 11.8, 6.8)]):
        g.palm(x, y, h, seed=1210 + i)
    for i, x in enumerate((-4.0, -2.0, 2.0, 4.0)):
        g.shrub(x, -11.4, 0.6, seed=1220 + i)
    g.box("coping", -3.2, -14, Z0, 3.2, -9, Z0 + 0.02)

    g.anchor("drip-cap", 0.0, -8.5, 13.9, "roof")
    g.anchor("mud-tower", 0.0, -8.6, 9.6, "wall")
    g.anchor("white-window", -3.0, -8.8, 4.8, "wall")
    g.anchor("beam-row", -8.0, -9.1, 3.85, "wall")
    g.anchor("courtyard", 0.0, 1.0, 0.3, "court")


CAMERA = {"target": (0, 0, 5.4), "hero": (-35, 20, 54, 35), "thumb": (-30, 25, 48, 35),
          "detail": ((0, -9.4, 7.2), -18, 4, 13, 45), "court": ((3.4, 8.0, 1.7), (-1.0, -1.0, 3.4), 22),
          "street": ((7.2, -13.2, 1.7), (0, -9, 6.0), 26)}
