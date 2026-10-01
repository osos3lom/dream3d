# Madani villa — black harrah basalt banded with white plaster, timber screens, pointed arches.
PREFIX = "Madani"
MATS = {
    "basalt": ("#3c3a38", 0.9, 0.0), "basalt_d": ("#2a2826", 0.9, 0.0), "white": ("#f3eee2", 0.85, 0.0),
    "white_d": ("#d9d0bd", 0.85, 0.0), "shadow": ("#1b1917", 0.9, 0.0),
    "wood": ("#6a4526", 0.75, 0.0), "lattice": ("#54351c", 0.7, 0.0), "door": ("#3f6b58", 0.6, 0.0),
    "glass": ("#1d262b", 0.07, 0.5), "frame": ("#3a2a1c", 0.5, 0.3),
    "pave": ("#ded6c6", 0.9, 0.0), "court": ("#cdc4b1", 0.9, 0.0), "lawn": ("#6b8a46", 0.95, 0.0),
    "water": ("#3d93ac", 0.05, 0.0), "coping": ("#efe9db", 0.8, 0.0),
    "trunk": ("#7a5f45", 0.95, 0.0), "leaf": ("#5b7438", 0.8, 0.0),
}
BG = "#e6e3da"


def harrah(g, x0, y0, x1, y1, z0, z1, first=1.9, step=1.5, h=0.45):
    """Basalt base with white plaster bands marking each lift."""
    g.band("white", x0, y0, x1, y1, first, h, 0.05)
    z = first + step
    while z < z1 - 0.2:
        g.band("white", x0, y0, x1, y1, z, h * 0.6, 0.05)
        z += step


def screen_win(g, fr, a0, a1, b0, b1, t):
    """Timber screen set in front of recessed glazing."""
    g.lbox("glass", fr, a0, a1, b0, b1, -t * 0.7 - 0.03, -t * 0.7)
    g.lattice("lattice", fr, a0, a1, b0, b1, -t * 0.3 - 0.05, -t * 0.3, cell=0.16, bar=0.04)
    g.lbox("wood", fr, a0 - 0.1, a1 + 0.1, b0 - 0.1, b0, -t * 0.3, 0.05)
    g.lbox("wood", fr, a0 - 0.1, a1 + 0.1, b1, b1 + 0.1, -t * 0.3, 0.05)


def build(g):
    Z0 = 0.25
    g.box("pave", -17, -14, 0, 17, 14, Z0)
    g.box("lawn", -16.5, -13.5, Z0, -3.0, -10.6, Z0 + 0.06)
    g.box("lawn", 3.0, -13.5, Z0, 16.5, -10.6, Z0 + 0.06)
    g.box("lawn", -16.5, 10.6, Z0, 16.5, 13.5, Z0 + 0.06)
    g.box("court", -6, -2.5, Z0, 6, 5.0, Z0 + 0.03)

    fS = face("S", -9)
    wins = [(-8.6, -6.6), (-4.4, -2.4), (2.4, 4.4), (6.6, 8.6)]
    hS = [(-1.6, 1.6, Z0, 3.6, "door")]
    hS += [(a, b, 1.3, 3.3, "open") for a, b in wins]
    hS += [(a, b, 4.6, 6.6, "open") for a, b in wins]
    g.vol("basalt", -10.5, -9, 10.5, -2.5, Z0, 7.4, t=0.55, holes={
        "S": hS, "N": [(-6, 6, Z0 + 0.05, 3.5), (-5, 5, 4.6, 6.4)],
        "W": [(-7.0, -5.4, 1.3, 3.3, "open")], "E": [(-7.0, -5.4, 1.3, 3.3, "open")]})
    for a, b in wins:
        screen_win(g, fS, a, b, 1.3, 3.3, 0.55)
        screen_win(g, fS, a, b, 4.6, 6.6, 0.55)
    for sd, pl in (("W", -10.5), ("E", 10.5)):
        screen_win(g, face(sd, pl), -7.0, -5.4, 1.3, 3.3, 0.55)
    harrah(g, -10.5, -9, 10.5, -2.5, Z0, 7.4)
    g.quoins("white", -10.5, -9, 10.5, -2.5, Z0, 1.9, w=0.5, step=0.7)
    # pointed-arch entrance in white against the dark wall
    g.arch_top("white", fS, -2.2, 2.2, 3.6, 1.5, -0.05, 0.12, pointed=True)
    g.poly("shadow", [(-1.6, 3.6)] + g.arch_pts(-1.6, 1.6, 3.6, 1.3, True) + [(1.6, 3.6)], fS, -0.34, -0.3)
    g.lbox("white", fS, -2.2, -1.6, Z0, 3.6, 0, 0.12)
    g.lbox("white", fS, 1.6, 2.2, Z0, 3.6, 0, 0.12)
    g.lbox("wood", fS, -1.6, 1.6, 3.6, 3.78, 0, 0.9)
    # white crown with pointed merlons
    g.lbox("white", fS, -10.5, 10.5, 7.4, 7.95, -0.36, 0.05)
    g.parapet("white", -10.5, -9, 10.5, -2.5, 7.4, 0.55, 0.36)
    for sd, pl, u0, u1 in (("S", -9, -10.5, 10.5), ("N", -2.5, -10.5, 10.5)):
        g.shurfat("white", face(sd, pl), u0 + 0.3, u1 - 0.3, 7.95, 0.3, w=0.5, h=0.62, p=0.95, steps=1)

    # minaret-like stair tower at the rear corner
    g.vol("basalt", 7.0, 5.5, 10.2, 9.5, Z0, 11.0, t=0.45, holes={
        "S": [(8.0, 9.2, 5.0, 6.4, "open"), (8.2, 9.0, 7.6, 8.8, "open")],
        "E": [(6.6, 7.8, 5.0, 6.4, "open")]})
    harrah(g, 7.0, 5.5, 10.2, 9.5, Z0, 11.0)
    screen_win(g, face("S", 5.5), 8.0, 9.2, 5.0, 6.4, 0.45)
    g.lbox("white", face("S", 5.5), 7.0, 10.2, 11.0, 11.45, -0.3, 0.05)
    g.parapet("white", 7.0, 5.5, 10.2, 9.5, 11.0, 0.5, 0.3)
    for sd, pl, u0, u1 in (("S", 5.5, 7.0, 10.2), ("E", 10.2, 5.5, 9.5), ("W", 7.0, 5.5, 9.5)):
        g.shurfat("white", face(sd, pl), u0 + 0.2, u1 - 0.2, 11.5, 0.28, w=0.42, h=0.5, p=0.8, steps=1)

    # wings with a pointed arcade onto the court
    for x0, x1, outer in ((-10.5, -6, "W"), (6, 10.5, "E")):
        inner = "E" if outer == "W" else "W"
        g.vol("basalt", x0, -2.5, x1, 5.5 if outer == "E" else 10, Z0, 4.3, t=0.5, holes={
            outer: [(0.6, 2.0, 1.3, 3.2, "open"), (4.6, 6.0, 1.3, 3.2, "open")],
            inner: [(-2.0, 4.6, Z0 + 0.05, 3.3)]})
        fr = face(outer, x0 if outer == "W" else x1)
        for a in (0.6, 4.6):
            screen_win(g, fr, a, a + 1.4, 1.3, 3.2, 0.5)
        harrah(g, x0, -2.5, x1, 5.5 if outer == "E" else 10, Z0, 4.3, first=1.9, step=1.6)
        g.lbox("white", fr, -2.4, 9.8, 4.3, 4.75, -0.3, 0.05)
        g.parapet("white", x0, -2.5, x1, 5.5 if outer == "E" else 10, 4.3, 0.5, 0.3)
    g.vol("basalt", -6, 6, 6, 10, Z0, 4.3, t=0.5, holes={"S": [(-5, 5, Z0 + 0.05, 3.3)]})
    g.parapet("white", -6, 6, 6, 10, 4.3, 0.5, 0.3)
    g.arcade("white", face("S", -2.5), -6, 6, Z0, 2.7, 1.1, 4.1, 0.45, bay=2.4, pier=0.5, pointed=True)

    g.pool(-2.6, 0.2, 2.6, 3.4, Z0 + 0.03)
    g.palm(-4.8, 1.2, 6.0, seed=701)
    g.palm(4.8, 1.2, 5.6, seed=702)
    for i, (x, y, h) in enumerate([(-13.8, -11.4, 6.9), (13.8, -11.4, 6.7), (-14.4, 3.0, 6.4),
                                   (14.4, 2.0, 7.0), (-8.0, 12.0, 6.2), (8.0, 12.0, 6.5)]):
        g.palm(x, y, h, seed=710 + i)
    for i, x in enumerate((-5.6, -3.6, 3.6, 5.6)):
        g.shrub(x, -11.8, 0.6, seed=720 + i)
    g.box("coping", -3.0, -14, Z0, 3.0, -9, Z0 + 0.02)

    g.anchor("basalt-bands", -8.0, -9.1, 2.1, "wall")
    g.anchor("timber-screen", -3.4, -9.1, 5.6, "wall")
    g.anchor("pointed-arch", 0.0, -9.1, 4.4, "wall")
    g.anchor("white-crown", 5.0, -9.1, 8.5, "roof")
    g.anchor("riwaq-court", 0.0, 1.5, 0.3, "court")


CAMERA = {"target": (0, 0, 4.2), "hero": (-34, 22, 52, 35), "thumb": (-28, 28, 46, 35),
          "detail": ((-3.4, -9.4, 5.0), -20, 6, 13, 48), "court": ((3.4, 8.0, 1.7), (-1.0, -1.5, 3.2), 22),
          "street": ((7.6, -13.2, 1.7), (0, -9, 4.0), 26)}
