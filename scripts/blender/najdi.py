# Najdi villa — carved earthen masonry, furjat, shurfat and a tarma over the door.
PREFIX = "Najdi"
MATS = {
    "mud": ("#c49a6c", 0.95, 0.0), "mud_dark": ("#946a41", 0.95, 0.0), "shadow": ("#2a2019", 0.9, 0.0),
    "door": ("#2d6a6c", 0.6, 0.0), "door_paint": ("#e2c16b", 0.6, 0.0), "glass": ("#1c262c", 0.08, 0.5),
    "frame": ("#3b2d22", 0.5, 0.3), "pave": ("#dccaa6", 0.9, 0.0), "court": ("#cfb68d", 0.9, 0.0),
    "lawn": ("#6d8a47", 0.95, 0.0), "water": ("#3a8fa8", 0.05, 0.0), "coping": ("#e6d6b8", 0.8, 0.0),
    "trunk": ("#7a5f45", 0.95, 0.0), "leaf": ("#5b7438", 0.8, 0.0), "wood": ("#6b4a2b", 0.7, 0.0),
}
BG = "#eadcc4"


def crown(g, x0, y0, x1, y1, z, sides="SNEW", t=0.45, band=True, shurf="SNEW", p=1.5):
    """Furjat band (dark-backed so the triangles read as voids) + cap + parapet + shurfat."""
    top = z
    if band:
        for sd in sides:
            if sd in "SN":
                fr, u0, u1 = face(sd, y0 if sd == "S" else y1), x0, x1
            else:
                fr, u0, u1 = face(sd, x0 if sd == "W" else x1), y0 + t, y1 - t
            g.tri_band("mud", fr, u0, u1, z, 0.75, t, b=0.52, p=0.92)
            g.lbox("shadow", fr, u0, u1, z, z + 0.75, -t - 0.05, -t)
        top = z + 0.75
    g.box("mud", x0, y0, top, x1, y1, top + 0.35)
    g.parapet("mud", x0, y0, x1, y1, top + 0.35, 0.4, 0.32)
    zc = top + 0.75
    for sd in shurf:
        if sd in "SN":
            g.shurfat("mud", face(sd, y0 if sd == "S" else y1), x0 + 0.2, x1 - 0.2, zc, 0.32, w=0.56, h=0.6, p=p)
        else:
            g.shurfat("mud", face(sd, x0 if sd == "W" else x1), y0 + 0.5, y1 - 0.5, zc, 0.32, w=0.56, h=0.6, p=p)
    g.band("mud_dark", x0, y0, x1, y1, top + 0.3, 0.08, 0.05)


def build(g):
    Z0 = 0.25
    g.box("pave", -17, -14, 0, 17, 14, Z0)
    g.box("lawn", -16.5, -13.5, Z0, -2.6, -10.3, Z0 + 0.06)
    g.box("lawn", 2.6, -13.5, Z0, 16.5, -10.3, Z0 + 0.06)
    g.box("lawn", -16.5, -9.5, Z0, -12, 13.5, Z0 + 0.06)
    g.box("lawn", 12, -9.5, Z0, 16.5, 13.5, Z0 + 0.06)
    g.box("court", -6, -3, Z0, 6, 5, Z0 + 0.03)

    # front wing — two storeys, the street face
    fS = face("S", -9)
    hS = [(-1.3, 1.3, Z0, 3.3, "door")]
    hS += [(-9.6, -3.4, 0.55, 3.2), (3.4, 9.6, 0.55, 3.2)]
    for x in (-9.2, -7.6, -6.0, -4.4, 4.4, 6.0, 7.6, 9.2):
        hS.append((x - 0.25, x + 0.25, 4.3, 6.0))
    hN = [(-5.5, 5.5, Z0 + 0.05, 3.4), (-5.0, 5.0, 4.2, 5.9)]
    hW = [(-6.8, -5.2, 1.6, 2.8), (-6.6, -5.4, 4.6, 5.7)]
    hE = [(-6.8, -5.2, 1.6, 2.8), (-6.6, -5.4, 4.6, 5.7)]
    g.vol("mud", -11, -9, 11, -3, Z0, 6.4, t=0.45, holes={"S": hS, "N": hN, "W": hW, "E": hE}, sill="mud_dark")
    crown(g, -11, -9, 11, -3, 6.4)
    g.band("mud_dark", -11, -9, 11, -3, 3.75, 0.16, 0.05)
    g.band("mud_dark", -11, -9, 11, -3, Z0, 0.5, 0.06)
    # triangle niches over upper windows
    # deep-set frame around each glazed bay + cantilevered canopy over the door
    for a0, a1 in ((-9.6, -3.4), (3.4, 9.6)):
        g.lbox("mud_dark", fS, a0 - 0.25, a1 + 0.25, 3.2, 3.45, 0, 0.5)
        g.lbox("mud_dark", fS, a0 - 0.25, a1 + 0.25, 0.3, 0.55, 0, 0.5)
    g.lbox("frame", fS, -3.2, 3.2, 3.5, 3.72, 0, 2.4)
    # carved door: frame, painted triangles
    g.lbox("mud_dark", fS, -1.75, -1.3, Z0, 3.75, 0, 0.1)
    g.lbox("mud_dark", fS, 1.3, 1.75, Z0, 3.75, 0, 0.1)
    g.lbox("mud_dark", fS, -1.75, 1.75, 3.3, 3.75, 0, 0.1)
    for z in (0.9, 1.6, 2.3):
        g.tri_row(["door_paint"], fS, -1.1, 1.1, z, 0.35, 0.3, 0.37, -0.33, -0.3)
    g.lbox("door_paint", fS, -0.04, 0.04, Z0, 3.3, -0.33, -0.3)
    # tarma — projecting peephole box over the entrance
    g.lbox("mud_dark", fS, -1.5, 1.5, 3.8, 4.05, 0, 1.0)
    g.lbox("mud", fS, -1.6, 1.6, 4.05, 6.1, 0, 1.1)
    for a in (-1.05, -0.1, 0.85):
        g.lbox("shadow", fS, a, a + 0.2, 4.6, 5.5, 1.1, 1.13)
    g.shurfat("mud", fS, -1.55, 1.55, 6.1, 0.3, w=0.5, h=0.5, p=0.78, d_out=1.1)

    # side wings — single storey, glass opening to the court
    g.vol("mud", -11, -3, -6, 9, Z0, 3.9, t=0.45, sill="mud_dark", holes={
        "W": [(-0.2, 0.8, 1.6, 2.8), (3.5, 4.5, 1.6, 2.8), (6.8, 7.8, 1.6, 2.8)],
        "E": [(-2.4, 4.6, Z0 + 0.05, 3.3), (5.4, 8.2, 1.2, 3.0)], "N": [(-9.5, -7.5, 1.6, 2.8)]})
    crown(g, -11, -3, -6, 9, 3.9, sides="WN", shurf="")
    g.vol("mud", 6, -3, 11, 5, Z0, 3.9, t=0.45, sill="mud_dark", holes={
        "E": [(-0.6, 0.4, 1.6, 2.8), (2.6, 3.6, 1.6, 2.8)], "W": [(-2.4, 4.6, Z0 + 0.05, 3.3)]})
    crown(g, 6, -3, 11, 5, 3.9, sides="E", shurf="")
    g.vol("mud", -6, 5, 6, 9, Z0, 3.9, t=0.45, sill="mud_dark", holes={
        "S": [(-5.0, 5.0, Z0 + 0.05, 3.3)], "N": [(-3.5, -2.5, 1.6, 2.8), (2.5, 3.5, 1.6, 2.8)]})
    crown(g, -6, 5, 6, 9, 3.9, sides="N", shurf="")
    # corner tower (burj)
    g.vol("mud", 6, 5, 11, 9, Z0, 10.4, t=0.5, sill="mud_dark", holes={
        "S": [(8.0, 9.0, 5.0, 6.2), (8.1, 8.9, 7.7, 8.7)], "E": [(6.5, 7.5, 5.0, 6.2), (6.6, 7.4, 7.7, 8.7)],
        "N": [(8.0, 9.0, 5.0, 6.2)], "W": [(6.6, 7.4, 7.7, 8.7)]})
    crown(g, 6, 5, 11, 9, 10.4, p=1.0)
    for zb in (3.75, 7.0):
        g.band("mud_dark", 6, 5, 11, 9, zb, 0.16, 0.05)

    # courtyard: pool, planters, palms
    g.pool(-2.6, -1.0, 2.6, 2.6, Z0 + 0.03)
    g.box("mud_dark", -5.6, 3.6, Z0, -3.2, 4.6, Z0 + 0.6)
    g.box("mud_dark", 3.2, 3.6, Z0, 5.6, 4.6, Z0 + 0.6)
    g.palm(-4.4, 4.1, 6.2, seed=1)
    g.palm(4.4, 4.1, 5.6, seed=2)
    # wooden pergola over the court's south edge
    for x in [i * 0.6 - 5.4 for i in range(19)]:
        g.box("wood", x, -2.55, 3.35, x + 0.12, -0.6, 3.5)
    # grounds
    for i, (x, y, h) in enumerate([(-13.4, -10.6, 7.2), (13.4, -10.6, 7.0),
                                   (-13.5, 2.0, 6.8), (13.5, 1.0, 7.4), (-13.4, 10.4, 6.2), (13.4, 10.5, 6.6)]):
        g.palm(x, y, h, seed=10 + i)
    for i, x in enumerate((-7.5, -5.5, 5.5, 7.5)):
        g.shrub(x, -11.8, 0.6, seed=i)
    g.box("coping", -2.6, -14, Z0, 2.6, -9, Z0 + 0.02)

    g.anchor("shurfat", -5.0, -9.1, 8.3, "roof")
    g.anchor("furjat", -6.0, -9.0, 6.8, "wall")
    g.anchor("tarma", 0.0, -10.1, 5.1, "wall")
    g.anchor("courtyard", 0.0, 1.0, 0.3, "court")
    g.anchor("burj", 8.5, 7.0, 12.0, "roof")


CAMERA = {"target": (0, 0, 3.6), "hero": (-36, 24, 50, 35), "thumb": (-30, 30, 44, 35),
          "detail": ((0, -9.5, 5.2), -22, 10, 16, 50), "court": ((2.8, 4.2, 1.7), (-2.0, -3.2, 2.8), 22), "street": ((7.5, -13.2, 1.7), (0, -9, 3.6), 26)}
