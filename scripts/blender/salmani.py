# Salmani villa — contemporary Riyadh reinterpretation: cleaner geometry, deep shadow lines, modular facade.
PREFIX = "Salmani"
MATS = {
    "stone": ("#dcc9a6", 0.85, 0.0), "stone_dark": ("#bea37b", 0.85, 0.0), "shadow": ("#2b2622", 0.9, 0.0),
    "glass": ("#22303a", 0.06, 0.5), "frame": ("#2f2b27", 0.4, 0.6), "wood": ("#8a6440", 0.6, 0.0),
    "pave": ("#e4d6bc", 0.9, 0.0), "lawn": ("#6b8a46", 0.95, 0.0), "water": ("#4a9fc0", 0.05, 0.0),
    "coping": ("#efe4cf", 0.8, 0.0), "trunk": ("#7a5f45", 0.95, 0.0), "leaf": ("#5b7438", 0.8, 0.0),
}
BG = "#e9e0cf"


def tri_crown(g, x0, y0, x1, y1, z, sides="SNEW", t=0.5):
    """Crisp, small-scale triangle band — the Najdi furjat redrawn as a modern relief."""
    for sd in sides:
        if sd in "SN":
            fr, u0, u1 = face(sd, y0 if sd == "S" else y1), x0, x1
        else:
            fr, u0, u1 = face(sd, x0 if sd == "W" else x1), y0 + t, y1 - t
        g.tri_band("stone", fr, u0, u1, z, 0.5, t, b=0.34, p=0.58)
        g.lbox("shadow", fr, u0, u1, z, z + 0.5, -t - 0.04, -t)
    g.parapet("stone", x0, y0, x1, y1, z + 0.5, 0.3, t)
    g.band("stone_dark", x0, y0, x1, y1, z + 0.5, 0.05, 0.03)


def grooves(z0, z1, u0, u1, step=1.2, h=0.07):
    out, z = [], z0 + step
    while z < z1 - 0.3:
        out.append((u0, u1, z, z + h, "shadow"))
        z += step
    return out


def build(g):
    Z0 = 0.25
    g.box("pave", -17, -14, 0, 17, 14, Z0)
    g.box("lawn", -16.5, -13.5, Z0, 5.8, -10.2, Z0 + 0.06)
    g.box("lawn", 12.8, -13.5, Z0, 16.5, 13.5, Z0 + 0.06)
    g.box("lawn", -16.5, -9.6, Z0, -13.2, 13.5, Z0 + 0.06)

    # glazed ground-floor pavilion, set back under the cantilever
    g.box("glass", -10, -6, Z0, 5, -5.95, 3.85)
    g.box("glass", -10.05, -6, Z0, -10, 2, 3.85)
    for x in [-10 + i * 1.5 for i in range(11)]:
        g.box("frame", x - 0.04, -6.08, Z0, x + 0.04, -5.95, 3.85)
    g.box("stone_dark", -10.3, -6.3, Z0, 5.3, 2, Z0 + 0.12)

    # cantilevered first floor: vertical slot windows = deep shadow lines
    slots = [(x - 0.22, x + 0.22, 4.3, 7.05) for x in [-11.2 + i * 1.6 for i in range(12)]]
    g.vol("stone", -12, -8.5, 7, 3, 3.85, 7.65, t=0.55, holes={
        "S": slots, "W": [(-7.5, -7.06, 4.3, 7.05), (-5.9, -5.46, 4.3, 7.05), (-4.3, -3.86, 4.3, 7.05)],
        "N": [(-1, 6, 4.3, 7.05)]})
    g.box("stone", -12, -8.5, 3.85, 7, 3, 4.2)
    tri_crown(g, -12, -8.5, 7, 3, 7.65)

    # entry tower with a deep portal and full-height slits
    fS = face("S", -7)
    g.vol("stone", 7, -7, 11.5, 1, Z0, 9.6, t=0.5, holes={
        "S": [(7.9, 10.6, Z0, 5.0, "open"), (8.45, 8.75, 5.8, 9.0), (9.1, 9.4, 5.8, 9.0), (9.75, 10.05, 5.8, 9.0)],
        "E": [(-6.0, -5.7, 1.5, 8.6), (-4.6, -4.3, 1.5, 8.6), (-3.2, -2.9, 1.5, 8.6)] + grooves(Z0, 9.6, -2.4, 0.5)})
    g.box("stone_dark", 7.9, -5.6, Z0, 10.6, -5.4, 5.0)
    g.box("wood", 8.6, -5.66, Z0, 9.9, -5.6, 3.6)
    g.box("glass", 8.1, -5.66, 3.8, 10.4, -5.6, 4.85)
    g.box("stone", 7.9, -6.5, Z0, 8.05, -5.4, 5.0)
    g.box("stone", 10.45, -6.5, Z0, 10.6, -5.4, 5.0)
    g.box("stone", 7.9, -6.5, 4.85, 10.6, -5.4, 5.0)
    g.lbox("stone_dark", fS, 7.6, 10.9, 5.0, 5.3, 0, 0.35)
    tri_crown(g, 7, -7, 11.5, 1, 9.6)

    # rear two-storey block facing the pool court
    g.vol("stone", -12, 3, -3, 11, Z0, 7.65, t=0.5, holes={
        "E": [(4.4, 10.4, Z0 + 0.05, 3.5), (4.4, 10.4, 4.2, 7.0)],
        "W": grooves(Z0, 7.65, 3.5, 10.5),
        "N": [(-10.8, -10.4, 1.2, 6.8), (-9.6, -9.2, 1.2, 6.8), (-8.4, -8.0, 1.2, 6.8)]})
    tri_crown(g, -12, 3, -3, 11, 7.65)
    # modular vertical fins on the court face
    fE = face("E", -3)
    for y in [3.6 + i * 0.8 for i in range(10)]:
        g.lbox("stone_dark", fE, y, y + 0.14, 4.0, 7.3, 0, 0.6)

    # pool court: deck, pool, pergola
    g.box("wood", -2.8, 2.6, Z0, 12, 4.2, Z0 + 0.1)
    g.pool(-2.2, 4.8, 11.2, 8.6, Z0)
    for x in [-2.6 + i * 0.5 for i in range(18)]:
        g.box("frame", x, 9.2, 3.3, x + 0.08, 11.6, 3.45)
    for x in (-2.6, 5.9):
        for y in (9.2, 11.5):
            g.box("frame", x, y, Z0, x + 0.12, y + 0.12, 3.45)
    g.box("frame", -2.6, 9.2, 3.2, 6.0, 9.32, 3.35)
    g.box("frame", -2.6, 11.5, 3.2, 6.0, 11.62, 3.35)
    g.box("stone_dark", 11.8, 2.6, Z0, 12.2, 12, 1.6)

    for i, (x, y, h) in enumerate([(-13.4, -10.7, 7.4), (-9.0, -10.8, 6.2), (-4.5, -10.8, 7.0),
                                   (13.4, -10.6, 7.0), (13.5, 6.0, 6.6), (-13.6, 1.0, 6.8), (-13.5, 10.5, 7.2)]):
        g.palm(x, y, h, seed=30 + i)
    for i, x in enumerate((0.5, 2.0, 3.5)):
        g.shrub(x, -11.4, 0.55, seed=40 + i)
    g.box("coping", 6.2, -14, Z0, 12.2, -7, Z0 + 0.02)

    g.anchor("shadow-lines", -4.0, -8.5, 5.6, "wall")
    g.anchor("cantilever", -9.0, -8.5, 4.0, "wall")
    g.anchor("triangle-crown", -2.0, -8.4, 8.0, "roof")
    g.anchor("portal", 9.25, -7.0, 3.0, "wall")
    g.anchor("pool-court", 4.5, 6.7, 0.3, "court")


CAMERA = {"target": (0, 0, 3.8), "hero": (-32, 22, 50, 35), "thumb": (-28, 28, 44, 35),
          "detail": ((9.2, -7, 5.0), -25, 8, 15, 45), "court": ((10.8, 9.8, 1.7), (-3, 5, 3.5), 24), "street": ((-1, -13.3, 1.7), (3, -6, 3.8), 24)}
