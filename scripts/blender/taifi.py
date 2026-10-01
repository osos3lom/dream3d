# Taifi villa — granite mountain house: rough stone, white window frames, timber balcony, rose terraces.
PREFIX = "Taifi"
MATS = {
    "granite": ("#a89a8c", 0.95, 0.0), "granite_d": ("#7f7265", 0.95, 0.0), "rubble": ("#948476", 0.95, 0.0),
    "white": ("#f4efe4", 0.85, 0.0), "shadow": ("#211d19", 0.9, 0.0),
    "wood": ("#6b4524", 0.75, 0.0), "lattice": ("#54351c", 0.7, 0.0), "door": ("#3e5d7a", 0.6, 0.0),
    "glass": ("#1d262b", 0.07, 0.5), "frame": ("#f4efe4", 0.6, 0.0),
    "pave": ("#ded5c4", 0.9, 0.0), "court": ("#cfc5b1", 0.9, 0.0), "lawn": ("#5f7f41", 0.95, 0.0),
    "rose": ("#c2566b", 0.8, 0.0), "water": ("#3d93ac", 0.05, 0.0), "coping": ("#eee7d8", 0.8, 0.0),
    "trunk": ("#6b543c", 0.95, 0.0), "leaf": ("#4e6b3c", 0.85, 0.0),
}
BG = "#e4e4da"


def white_win(g, fr, a0, a1, b0, b1, t, sill=True):
    """Deep white-painted frame around a small granite-wall window."""
    g.lbox("glass", fr, a0, a1, b0, b1, -t * 0.6 - 0.03, -t * 0.6)
    for box in ((a0 - 0.24, a0, b0, b1 + 0.24), (a1, a1 + 0.24, b0, b1 + 0.24),
                (a0 - 0.24, a1 + 0.24, b1, b1 + 0.24)):
        g.lbox("white", fr, *box, -t * 0.6, 0.07)
    if sill:
        g.lbox("white", fr, a0 - 0.34, a1 + 0.34, b0 - 0.16, b0, -t * 0.6, 0.14)


def balcony(g, fr, uc, z0, w=3.0, h=2.3, dep=1.0):
    """Timber balcony — the Taif reading of a roshan, carried on stone corbels."""
    a0, a1 = uc - w / 2, uc + w / 2
    for a in (a0 + 0.3, uc, a1 - 0.3):
        g.lbox("granite_d", fr, a - 0.18, a + 0.18, z0 - 0.55, z0, 0, dep * 0.7)
    g.lbox("wood", fr, a0, a1, z0, z0 + 0.16, 0, dep)
    g.lbox("wood", fr, a0, a1, z0 + h, z0 + h + 0.22, 0, dep + 0.12)
    for a in (a0, a1 - 0.14):
        g.lbox("wood", fr, a, a + 0.14, z0, z0 + h, dep - 0.14, dep)
    g.lbox("wood", fr, a0, a1, z0 + 0.16, z0 + 1.0, dep - 0.1, dep)
    g.lattice("lattice", fr, a0 + 0.14, a1 - 0.14, z0 + 1.1, z0 + h, dep - 0.08, dep - 0.05, cell=0.16)
    for a, dd in ((a0, (0, 0.06)), (a1, (-0.06, 0))):
        sf = side_frame(fr, a)
        g.lbox("wood", sf, 0, dep, z0 + 0.16, z0 + 1.0, *dd)
        g.lattice("lattice", sf, 0.05, dep - 0.1, z0 + 1.1, z0 + h, *dd, cell=0.16)


def build(g):
    Z0 = 0.25
    TZ = 1.1
    g.box("pave", -17, -14, 0, 17, 14, Z0)
    g.box("lawn", -16.5, -13.5, Z0, -3.2, -11.0, Z0 + 0.06)
    g.box("lawn", 3.2, -13.5, Z0, 16.5, -11.0, Z0 + 0.06)
    # stepped rose terraces at the front
    for i in range(3):
        g.box("granite_d", -13 + i * 0.6, -11.0 + i * 0.55, Z0, 13 - i * 0.6, -10.5 + i * 0.55, Z0 + TZ * (i + 1) / 3)
        g.box("rose", -12.6 + i * 0.6, -10.5 + i * 0.55, Z0 + TZ * (i + 1) / 3 - 0.04,
              12.6 - i * 0.6, -10.0 + i * 0.55, Z0 + TZ * (i + 1) / 3 + 0.22)
    g.box("granite_d", -13, -9.4, Z0, 13, 12, TZ)
    g.box("court", -6, -2.0, TZ, 6, 5.5, TZ + 0.03)

    fS = face("S", -9.4)
    wins = [(-9.0, -7.6), (-6.0, -4.6), (4.6, 6.0), (7.6, 9.0)]
    hS = [(-1.5, 1.5, TZ, 3.5, "door")]
    hS += [(a, b, TZ + 1.1, TZ + 2.6) for a, b in wins]
    hS += [(a, b, TZ + 4.3, TZ + 5.8) for a, b in wins[:1] + wins[-1:]]
    g.vol("granite", -11, -9.4, 11, -2.0, TZ, TZ + 6.6, t=0.55, holes={
        "S": hS, "N": [(-6, 6, TZ + 0.05, TZ + 3.4), (-5, 5, TZ + 4.3, TZ + 5.9)],
        "W": [(-7.4, -6.0, TZ + 1.1, TZ + 2.6)], "E": [(-7.4, -6.0, TZ + 1.1, TZ + 2.6)]})
    g.stone_skin("rubble", fS, -11, 11, TZ, TZ + 6.4, seed=31, d=0.06, density=1.6, lo=0.3, hi=0.7)
    for a, b in wins:
        white_win(g, fS, a, b, TZ + 1.1, TZ + 2.6, 0.55)
    for a, b in wins[:1] + wins[-1:]:
        white_win(g, fS, a, b, TZ + 4.3, TZ + 5.8, 0.55)
    g.quoins("white", -11, -9.4, 11, -2.0, TZ, TZ + 6.6, w=0.55, step=0.78)
    g.band("white", -11, -9.4, 11, -2.0, TZ + 3.5, 0.16, 0.06)
    g.parapet("granite", -11, -9.4, 11, -2.0, TZ + 6.6, 0.75, 0.35)
    g.band("white", -11, -9.4, 11, -2.0, TZ + 6.55, 0.14, 0.07)
    # two balconies flanking the door
    balcony(g, fS, -2.8, TZ + 4.3)
    balcony(g, fS, 2.8, TZ + 4.3)
    g.lbox("white", fS, -1.9, -1.5, TZ, TZ + 3.8, 0, 0.12)
    g.lbox("white", fS, 1.5, 1.9, TZ, TZ + 3.8, 0, 0.12)
    g.lbox("white", fS, -1.9, 1.9, TZ + 3.5, TZ + 3.8, 0, 0.12)

    # wings
    for x0, x1, outer in ((-11, -6, "W"), (6, 11, "E")):
        inner = "E" if outer == "W" else "W"
        g.vol("granite", x0, -2.0, x1, 11, TZ, TZ + 3.9, t=0.5, holes={
            outer: [(0.6, 1.8, TZ + 1.1, TZ + 2.6), (4.6, 5.8, TZ + 1.1, TZ + 2.6),
                    (8.4, 9.6, TZ + 1.1, TZ + 2.6)],
            inner: [(-1.4, 6.0, TZ + 0.05, TZ + 3.2)], "N": [(x0 + 1.4, x1 - 1.4, TZ + 1.1, TZ + 2.6)]})
        fr = face(outer, x0 if outer == "W" else x1)
        g.stone_skin("rubble", fr, -1.8, 10.8, TZ, TZ + 3.7, seed=32 if outer == "W" else 33,
                     d=0.06, density=1.5, lo=0.3, hi=0.7)
        for a in (0.6, 4.6, 8.4):
            white_win(g, fr, a, a + 1.2, TZ + 1.1, TZ + 2.6, 0.5)
        g.parapet("granite", x0, -2.0, x1, 11, TZ + 3.9, 0.6, 0.3)
        g.band("white", x0, -2.0, x1, 11, TZ + 3.85, 0.12, 0.06)
    g.vol("granite", -6, 7, 6, 11, TZ, TZ + 3.9, t=0.5, holes={"S": [(-5, 5, TZ + 0.05, TZ + 3.2)]})
    g.parapet("granite", -6, 7, 6, 11, TZ + 3.9, 0.6, 0.3)

    g.pool(-2.6, 0.4, 2.6, 3.6, TZ + 0.03)
    for i, (x, y) in enumerate([(-4.8, 1.0), (4.8, 1.0), (-4.8, 4.6), (4.8, 4.6)]):
        g.canopy(x, y, 3.2, r=1.4, seed=800 + i)
    for i, (x, y, h) in enumerate([(-14.2, -12.0, 5.0), (14.2, -12.0, 4.8), (-14.6, 3.0, 5.2),
                                   (14.6, 2.0, 5.0), (-9.0, 12.8, 4.6), (9.0, 12.8, 4.8)]):
        g.conifer(x, y, h, r=1.5, tiers=3)
    g.box("coping", -3.2, -14, Z0, 3.2, -11, Z0 + 0.02)

    g.anchor("granite-wall", -8.0, -9.5, TZ + 2.0, "wall")
    g.anchor("white-frames", -5.3, -9.5, TZ + 1.9, "wall")
    g.anchor("balcony", -2.8, -10.4, TZ + 5.4, "wall")
    g.anchor("quoins", 11.1, -6.0, TZ + 3.4, "wall")
    g.anchor("rose-terrace", 0.0, 2.0, TZ + 0.3, "court")


CAMERA = {"target": (0, 0, 4.4), "hero": (-34, 22, 52, 35), "thumb": (-28, 28, 46, 35),
          "detail": ((-2.8, -10.6, 5.6), -18, 4, 12, 48), "court": ((3.4, 8.6, 2.8), (-1.0, -1.0, 4.2), 22),
          "street": ((7.6, -13.2, 1.7), (0, -9.4, 4.4), 26), "cut": 3.2}
