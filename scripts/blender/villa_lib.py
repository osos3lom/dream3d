"""Procedural kit for the heritage-villa models.

Runs inside Blender (via the 3D Jutsu / Blender MCP worker). Geometry is
accumulated per material and committed as one mesh object per material, so
every mesh in the exported GLB carries exactly one material (the viewer's rim
shader patches a single material per mesh).

Conventions: metres, Z up, the street front faces -Y (glTF +Z, the viewer's
default camera side). Wall helpers work in a face frame (O, U, N): `a` runs
along the wall, `b` is world Z, `d` is distance along the outward normal.
"""
import bpy, bmesh, math, random


def _lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hexlin(h):
    h = h.lstrip("#")
    return tuple(_lin(int(h[i:i + 2], 16) / 255) for i in (0, 2, 4))


def make_mat(name, spec):
    hx, rough, metal = spec
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    c = hexlin(hx)
    nt = m.node_tree
    if nt:
        b = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
        if b:
            b.inputs["Base Color"].default_value = (*c, 1)
            b.inputs["Roughness"].default_value = rough
            b.inputs["Metallic"].default_value = metal
    m.diffuse_color = (*c, 1)
    m.roughness = rough
    return m


def face(side, plane):
    return {
        "S": ((0, plane, 0), (1, 0, 0), (0, -1, 0)),
        "N": ((0, plane, 0), (1, 0, 0), (0, 1, 0)),
        "W": ((plane, 0, 0), (0, 1, 0), (-1, 0, 0)),
        "E": ((plane, 0, 0), (0, 1, 0), (1, 0, 0)),
    }[side]


def side_frame(fr, a):
    """Frame perpendicular to `fr` at wall position `a` (a runs outward)."""
    O, U, N = fr
    return ((O[0] + U[0] * a, O[1] + U[1] * a, 0), N, U)


class G:
    def __init__(s, mats):
        s.mats = mats
        s.g = {}
        s.anchors = {}

    # ── primitives ──────────────────────────────────────────────
    def add(s, m, V, F):
        if m not in s.mats:
            raise KeyError("unknown material " + m)
        A = s.g.setdefault(m, ([], []))
        o = len(A[0])
        A[0].extend(V)
        A[1].extend([tuple(i + o for i in f) for f in F])

    def box(s, m, x0, y0, z0, x1, y1, z1):
        x0, x1 = min(x0, x1), max(x0, x1)
        y0, y1 = min(y0, y1), max(y0, y1)
        z0, z1 = min(z0, z1), max(z0, z1)
        V = [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
             (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]
        s.add(m, V, [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)])

    def poly(s, m, pts, fr, d0, d1):
        O, U, N = fr
        n = len(pts)
        V = []
        for d in (d0, d1):
            for a, b in pts:
                V.append((O[0] + U[0] * a + N[0] * d, O[1] + U[1] * a + N[1] * d, b))
        F = [tuple(range(n - 1, -1, -1)), tuple(range(n, 2 * n))]
        F += [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)]
        s.add(m, V, F)

    def lbox(s, m, fr, a0, a1, b0, b1, d0, d1):
        s.poly(m, [(a0, b0), (a1, b0), (a1, b1), (a0, b1)], fr, d0, d1)

    def cyl(s, m, cx, cy, z0, z1, r0, r1=None, seg=10, ox=0.0, oy=0.0):
        r1 = r0 if r1 is None else r1
        V = []
        for (z, r, dx, dy) in ((z0, r0, 0, 0), (z1, r1, ox, oy)):
            for i in range(seg):
                t = 2 * math.pi * i / seg
                V.append((cx + dx + r * math.cos(t), cy + dy + r * math.sin(t), z))
        F = [tuple(range(seg - 1, -1, -1)), tuple(range(seg, 2 * seg))]
        F += [(i, (i + 1) % seg, seg + (i + 1) % seg, seg + i) for i in range(seg)]
        s.add(m, V, F)

    def seg(s, m, p0, p1, w, th):
        dx, dy, dz = p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]
        L = math.sqrt(dx * dx + dy * dy + dz * dz) or 1
        d = (dx / L, dy / L, dz / L)
        sx, sy = -d[1], d[0]
        sl = math.sqrt(sx * sx + sy * sy) or 1
        sd = (sx / sl * w / 2, sy / sl * w / 2, 0)
        up = (d[1] * sd[2] - d[2] * sd[1], d[2] * sd[0] - d[0] * sd[2], d[0] * sd[1] - d[1] * sd[0])
        ul = math.sqrt(sum(c * c for c in up)) or 1
        up = tuple(c / ul * th / 2 for c in up)
        V = []
        for p in (p0, p1):
            for (a, b) in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
                V.append(tuple(p[i] + a * sd[i] + b * up[i] for i in range(3)))
        s.add(m, V, [(0, 1, 2, 3), (7, 6, 5, 4), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)])

    # ── walls & volumes ────────────────────────────────────────
    def wall(s, m, fr, u0, u1, z0, z1, t, holes=(), d_out=0.0):
        us = sorted({u0, u1, *[h[0] for h in holes], *[h[1] for h in holes]})
        zs = sorted({z0, z1, *[h[2] for h in holes], *[h[3] for h in holes]})
        us = [u for u in us if u0 <= u <= u1]
        zs = [z for z in zs if z0 <= z <= z1]
        for j in range(len(zs) - 1):
            cz = (zs[j] + zs[j + 1]) / 2
            run = None
            for i in range(len(us) - 1):
                cu = (us[i] + us[i + 1]) / 2
                solid = not any(h[0] < cu < h[1] and h[2] < cz < h[3] for h in holes)
                if solid and run is None:
                    run = us[i]
                if not solid and run is not None:
                    s.lbox(m, fr, run, us[i], zs[j], zs[j + 1], d_out - t, d_out)
                    run = None
            if run is not None:
                s.lbox(m, fr, run, us[-1], zs[j], zs[j + 1], d_out - t, d_out)

    def fill(s, fr, holes, t, glass="glass", frame="frame", depth=0.55, sill=None):
        for h in holes:
            kind = h[4] if len(h) > 4 else "glass"
            if kind == "open":
                continue
            a0, a1, b0, b1 = h[:4]
            dg = -t * depth
            if kind == "glass":
                s.lbox(glass, fr, a0, a1, b0, b1, dg - 0.03, dg)
                w = a1 - a0
                if w > 2.2:
                    n = max(1, int(w / 1.5))
                    for k in range(1, n + 1):
                        a = a0 + w * k / (n + 1)
                        s.lbox(frame, fr, a - 0.04, a + 0.04, b0, b1, dg - 0.06, dg + 0.03)
                if b1 - b0 > 2.6:
                    s.lbox(frame, fr, a0, a1, b1 - 0.55, b1 - 0.48, dg - 0.06, dg + 0.03)
                if sill:
                    s.lbox(sill, fr, a0 - 0.06, a1 + 0.06, b0 - 0.06, b0, dg, 0.06)
            else:
                s.lbox(kind, fr, a0, a1, b0, b1, dg - 0.08, dg)

    def vol(s, m, x0, y0, x1, y1, z0, z1, t=0.4, holes=None, roof=True, sill=None, glass="glass", frame="frame"):
        holes = holes or {}
        spans = {"S": (y0, x0, x1), "N": (y1, x0, x1), "W": (x0, y0 + t, y1 - t), "E": (x1, y0 + t, y1 - t)}
        for side, (plane, u0, u1) in spans.items():
            fr = face(side, plane)
            hs = holes.get(side, [])
            s.wall(m, fr, u0, u1, z0, z1, t, [h[:4] for h in hs])
            s.fill(fr, hs, t, glass=glass, frame=frame, sill=sill)
        if roof:
            s.box(m, x0, y0, z1 - 0.3, x1, y1, z1)

    def parapet(s, m, x0, y0, x1, y1, z, h, t, sides="SNEW"):
        if "S" in sides: s.box(m, x0, y0, z, x1, y0 + t, z + h)
        if "N" in sides: s.box(m, x0, y1 - t, z, x1, y1, z + h)
        if "W" in sides: s.box(m, x0, y0, z, x0 + t, y1, z + h)
        if "E" in sides: s.box(m, x1 - t, y0, z, x1, y1, z + h)

    def band(s, m, x0, y0, x1, y1, z, h, p=0.04):
        s.box(m, x0 - p, y0 - p, z, x1 + p, y0, z + h)
        s.box(m, x0 - p, y1, z, x1 + p, y1 + p, z + h)
        s.box(m, x0 - p, y0, z, x0, y1, z + h)
        s.box(m, x1, y0, z, x1 + p, y1, z + h)

    def ribs(s, m, x0, y0, x1, y1, z0, z1, step=0.45, h=0.06, p=0.12):
        z = z0 + step
        while z < z1 - 0.1:
            s.band(m, x0, y0, x1, y1, z, h, p)
            z += step

    # ── heritage motifs ────────────────────────────────────────
    def tri_band(s, m, fr, u0, u1, z, h, t, b=0.45, p=0.8, d_out=0.0):
        """Wall strip pierced by upward triangular openings (furjat)."""
        span = u1 - u0
        n = max(1, int((span - 0.4 + (p - b)) / p))
        start = u0 + (span - (n * p - (p - b))) / 2
        a = [start + i * p for i in range(n)]
        d0, d1 = d_out - t, d_out
        s.poly(m, [(u0, z), (a[0], z), (a[0] + b / 2, z + h), (u0, z + h)], fr, d0, d1)
        for i in range(n - 1):
            s.poly(m, [(a[i] + b, z), (a[i + 1], z), (a[i + 1] + b / 2, z + h), (a[i] + b / 2, z + h)], fr, d0, d1)
        s.poly(m, [(a[-1] + b, z), (u1, z), (u1, z + h), (a[-1] + b / 2, z + h)], fr, d0, d1)

    def shurfat(s, m, fr, u0, u1, z, t, w=0.7, h=0.8, p=1.1, steps=3, d_out=0.0):
        """Stepped triangular crenellations."""
        n = max(1, int((u1 - u0) / p))
        pp = (u1 - u0) / n
        for i in range(n):
            c = u0 + pp * (i + 0.5)
            for k in range(steps):
                wk = w * (1 - k / steps)
                s.lbox(m, fr, c - wk / 2, c + wk / 2, z + k * h / steps, z + (k + 1) * h / steps, d_out - t, d_out)
            wt = w / steps
            zt = z + h
            s.poly(m, [(c - wt / 2, zt), (c + wt / 2, zt), (c, zt + h / steps * 0.9)], fr, d_out - t, d_out)

    def tri_row(s, mats, fr, u0, u1, z, h, w, p, d0, d1, down=False):
        n = max(1, int((u1 - u0) / p))
        pp = (u1 - u0) / n
        for i in range(n):
            c = u0 + pp * (i + 0.5)
            m = mats[i % len(mats)]
            if down:
                s.poly(m, [(c - w / 2, z + h), (c, z), (c + w / 2, z + h)], fr, d0, d1)
            else:
                s.poly(m, [(c - w / 2, z), (c + w / 2, z), (c, z + h)], fr, d0, d1)

    def lattice(s, m, fr, a0, a1, b0, b1, d0, d1, cell=0.14, bar=0.03):
        a = a0
        while a <= a1 + 1e-6:
            s.lbox(m, fr, a - bar / 2, a + bar / 2, b0, b1, d0, d1)
            a += cell
        b = b0
        while b <= b1 + 1e-6:
            s.lbox(m, fr, a0, a1, b - bar / 2, b + bar / 2, d0, d1)
            b += cell

    def roshan(s, fr, uc, z0, w, h, dep, wood="wood", lat="lattice", shadow="shadow"):
        a0, a1 = uc - w / 2, uc + w / 2
        s.lbox(shadow, fr, a0, a1, z0, z0 + h, 0.0, 0.03)
        s.lbox(wood, fr, a0 - 0.1, a1 + 0.1, z0 - 0.22, z0, 0, dep + 0.1)
        s.lbox(wood, fr, a0 + 0.25, a1 - 0.25, z0 - 0.55, z0 - 0.22, 0, dep * 0.55)
        s.lbox(wood, fr, a0 - 0.15, a1 + 0.15, z0 + h, z0 + h + 0.18, 0, dep + 0.18)
        s.lbox(wood, fr, a0 - 0.05, a1 + 0.05, z0 + h + 0.18, z0 + h + 0.42, 0, dep + 0.05)
        for a in (a0, a1 - 0.09):
            s.lbox(wood, fr, a, a + 0.09, z0, z0 + h, dep - 0.09, dep)
        s.lbox(wood, fr, a0, a1, z0, z0 + 0.85, dep - 0.07, dep)
        s.lbox(wood, fr, a0, a1, z0 + 0.85, z0 + 0.95, dep - 0.09, dep + 0.02)
        s.lattice(lat, fr, a0 + 0.09, a1 - 0.09, z0 + 0.95, z0 + h, dep - 0.05, dep - 0.02)
        for a, dd in ((a0, (0, 0.05)), (a1, (-0.05, 0))):
            sf = side_frame(fr, a)
            s.lbox(wood, sf, 0, dep, z0, z0 + 0.85, *dd)
            s.lattice(lat, sf, 0.03, dep - 0.09, z0 + 0.95, z0 + h, *dd)

    # ── landscape ──────────────────────────────────────────────
    def palm(s, x, y, h, trunk="trunk", leaf="leaf", seed=0, fronds=11, L=3.0):
        r = random.Random(seed)
        lx, ly = r.uniform(-0.5, 0.5), r.uniform(-0.5, 0.5)
        n = 6
        for i in range(n):
            t0, t1 = i / n, (i + 1) / n
            s.cyl(trunk, x + lx * t0 * t0, y + ly * t0 * t0, h * t0, h * t1 + 0.02,
                  0.24 - 0.08 * t0, 0.24 - 0.08 * t1, seg=8,
                  ox=lx * (t1 * t1 - t0 * t0), oy=ly * (t1 * t1 - t0 * t0))
        top = (x + lx, y + ly, h)
        s.cyl(trunk, top[0], top[1], h - 0.1, h + 0.35, 0.22, 0.1, seg=8)
        for k in range(fronds):
            ang = 2 * math.pi * k / fronds + r.uniform(-0.2, 0.2)
            lift = r.uniform(0.2, 0.7)
            ll = L * r.uniform(0.85, 1.1)
            pts = []
            for i in range(6):
                t = i / 5
                pts.append((top[0] + math.cos(ang) * ll * t, top[1] + math.sin(ang) * ll * t,
                            h + 0.25 + lift * t * 1.4 - 1.9 * t * t))
            for i in range(5):
                w = 0.75 * (1 - 0.75 * i / 5)
                s.seg(leaf, pts[i], pts[i + 1], w, 0.04)

    def shrub(s, x, y, r=0.7, m="leaf", seed=0):
        rr = random.Random(seed)
        for i in range(3):
            s.cyl(m, x + rr.uniform(-0.3, 0.3), y + rr.uniform(-0.3, 0.3), 0.25, 0.25 + r * rr.uniform(0.8, 1.3),
                  r * rr.uniform(0.7, 1.0), r * 0.35, seg=8)

    def pool(s, x0, y0, x1, y1, z, coping="coping", water="water", w=0.35):
        s.box(water, x0, y0, z, x1, y1, z + 0.04)
        s.parapet(coping, x0 - w, y0 - w, x1 + w, y1 + w, z, 0.12, w)

    def anchor(s, name, x, y, z, snap):
        s.anchors[name] = (x, y, z, snap)


# ── scene plumbing ─────────────────────────────────────────────
def reset():
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.cameras):
        for d in list(coll):
            coll.remove(d)


def commit(g, prefix):
    col = bpy.context.scene.collection
    xs, ys, zs = [], [], []
    for k, (V, F) in g.g.items():
        me = bpy.data.meshes.new(prefix + "_" + k)
        me.from_pydata(V, [], F)
        me.update()
        bm = bmesh.new()
        bm.from_mesh(me)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        bm.to_mesh(me)
        bm.free()
        me.materials.append(make_mat(prefix + "_" + k, g.mats[k]))
        ob = bpy.data.objects.new(prefix + "_" + k, me)
        col.objects.link(ob)
        xs += [v[0] for v in V]; ys += [v[1] for v in V]; zs += [v[2] for v in V]
    bb = (min(xs), min(ys), min(zs), max(xs), max(ys), max(zs))
    dx, dy, dz = bb[3] - bb[0], bb[4] - bb[1], bb[5] - bb[2]
    anchors = {}
    for n, (x, y, z, snap) in g.anchors.items():
        # glTF: x → x, z(up) → y, y → -z; anchors are fractions of the box
        anchors[n] = [round((x - bb[0]) / dx, 3), round((z - bb[2]) / dz, 3), round((bb[4] - y) / dy, 3), snap]
    return {"bbox": [round(v, 2) for v in bb], "anchors": anchors,
            "verts": sum(len(v[0]) for v in g.g.values()), "objects": len(g.g)}


def stage(bg="#e8dcc8", sun_rot=(48, 0, -32), energy=5.5):
    col = bpy.context.scene.collection
    sun = bpy.data.lights.new("Key_Sun", "SUN")
    sun.energy = energy
    sun.angle = math.radians(1.5)
    try:
        sun.use_shadow = True
    except Exception:
        pass
    so = bpy.data.objects.new("Key_Sun", sun)
    so.rotation_euler = [math.radians(a) for a in sun_rot]
    col.objects.link(so)
    fill = bpy.data.lights.new("Fill_Sun", "SUN")
    fill.energy = 0.9
    fo = bpy.data.objects.new("Fill_Sun", fill)
    fo.rotation_euler = [math.radians(a) for a in (60, 0, 150)]
    col.objects.link(fo)
    sc = bpy.context.scene
    if sc.world is None:
        sc.world = bpy.data.worlds.new("World")
    w = sc.world
    c = hexlin(bg)
    w.color = c
    try:
        w.use_nodes = True
        bgn = next(n for n in w.node_tree.nodes if n.type == "BACKGROUND")
        bgn.inputs["Color"].default_value = (*c, 1)
        bgn.inputs["Strength"].default_value = 0.55
    except Exception:
        pass
    cam = bpy.data.cameras.new("Delivery_Camera")
    co = bpy.data.objects.new("Delivery_Camera", cam)
    col.objects.link(co)
    sc.camera = co
    return co


def aim(co, target, az, el, dist, lens=35):
    from mathutils import Vector
    a, e = math.radians(az), math.radians(el)
    pos = Vector(target) + dist * Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e)))
    co.location = pos
    co.rotation_euler = (Vector(target) - pos).to_track_quat("-Z", "Y").to_euler()
    co.data.lens = lens


def shoot(artifacts, name, w, h, samples=48, raytrace=True):
    """Render the active camera to a published PNG. Eye-level shots need
    raytrace=False to stay inside the worker's 5-minute budget."""
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE"
    sc.render.resolution_x, sc.render.resolution_y = w, h
    sc.render.resolution_percentage = 100
    try:
        sc.eevee.taa_render_samples = samples
    except Exception:
        pass
    try:
        sc.render.image_settings.media_type = "IMAGE"
    except Exception:
        pass
    sc.render.image_settings.file_format = "PNG"
    for vt in ("Khronos PBR Neutral", "Standard"):
        try:
            sc.view_settings.view_transform = vt
            break
        except Exception:
            pass
    for attr, val in (("use_raytracing", raytrace), ("use_shadows", True), ("use_gtao", True)):
        try:
            setattr(sc.eevee, attr, val)
        except Exception:
            pass
    tgt = artifacts.file(name=name, media_type="image/png")
    sc.render.filepath = tgt.path
    bpy.ops.render.render(write_still=True)
    tgt.publish()


def look(co, pos, target, lens=24):
    from mathutils import Vector
    co.location = Vector(pos)
    co.rotation_euler = (Vector(target) - Vector(pos)).to_track_quat("-Z", "Y").to_euler()
    co.data.lens = lens


def plan_cut(z_cut=2.4, poche="#3a3029"):
    """Slice every mesh at z_cut, cap the cut and paint the caps dark — a true plan section."""
    pm = make_mat("Plan_Poche", (poche, 0.9, 0.0))
    for ob in [o for o in bpy.data.objects if o.type == "MESH"]:
        me = ob.data
        me.materials.append(pm)
        slot = len(me.materials) - 1
        bm = bmesh.new()
        bm.from_mesh(me)
        geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
        res = bmesh.ops.bisect_plane(bm, geom=geom, plane_co=(0, 0, z_cut), plane_no=(0, 0, 1), clear_outer=True)
        cut_edges = [e for e in res["geom_cut"] if isinstance(e, bmesh.types.BMEdge)]
        if cut_edges:
            filled = bmesh.ops.holes_fill(bm, edges=cut_edges, sides=0)
            for f in filled["faces"]:
                f.material_index = slot
        bm.to_mesh(me)
        bm.free()


def render_shots(artifacts, ns, prefix, names, size=(1180, 787), samples=32, raytrace=True):
    """Render named shots (hero, thumbnail, detail, court, street, plan) for one villa.
    The worker has a 5-minute budget, so callers ask for two or three at a time."""
    sc = bpy.context.scene
    c = ns["CAMERA"]
    co = sc.camera
    w, h = size
    for n in names:
        sc.render.film_transparent = n in ("hero", "thumbnail", "detail", "plan")
        if n == "hero":
            aim(co, c["target"], *c["hero"])
        elif n == "thumbnail":
            aim(co, c["target"], *c["thumb"])
        elif n == "detail":
            aim(co, *c["detail"])
        elif n in ("court", "street"):
            look(co, *c[n])
        elif n == "plan":
            plan_cut(c.get("cut", 2.4))
            co.data.type = "ORTHO"
            co.data.ortho_scale = 43
            co.location = (0, 0, 60)
            co.rotation_euler = (0, 0, 0)
            co.data.clip_end = 200
        shoot(artifacts, prefix + "-" + n + ".png", *((520, 520) if n == "thumbnail" else (w, h)),
              samples=samples, raytrace=raytrace)
