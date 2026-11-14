"""Build the whole 'Plot Twist' scene: arena, ring, crowd, two wrestlers, animation, cameras.
Run:  python3 film/build.py           (uses the pip `bpy` module)  ->  film/out/scene.blend
"""
import bpy, bmesh, math, random, os
from mathutils import Matrix, Vector, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
os.makedirs(OUT, exist_ok=True)
R = math.radians
FPS, FRAMES = 24, 408
PLAT = 1.0          # ring platform height
rng = random.Random(7)

# ---------------------------------------------------------------- scene reset
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.fps = FPS
sc.frame_start, sc.frame_end = 1, FRAMES


def coll(name):
    c = bpy.data.collections.new(name)
    sc.collection.children.link(c)
    return c


C_SET, C_FIG, C_CROWD, C_CAM = coll("Set"), coll("Wrestlers"), coll("Crowd"), coll("Cameras")


def fcurves(idb):
    ad = idb.animation_data
    if not ad or not ad.action:
        return []
    from bpy_extras import anim_utils
    cb = anim_utils.action_get_channelbag_for_slot(ad.action, ad.action_slot)
    return list(cb.fcurves) if cb else []


# ---------------------------------------------------------------- materials
def mat(name, color, rough=0.5, metal=0.0, emit=None, estr=0.0, sss=0.0, coat=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if sss:
        b.inputs["Subsurface Weight"].default_value = sss
        b.inputs["Subsurface Radius"].default_value = (0.9, 0.35, 0.2)
        b.inputs["Subsurface Scale"].default_value = 0.02
    if coat:
        b.inputs["Coat Weight"].default_value = coat
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = estr
    return m


def objcolor_mat(name, rough=0.6):
    """Base colour comes from each object's .color (crowd shirts / skins)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    oi = nt.nodes.new("ShaderNodeObjectInfo")
    nt.links.new(oi.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rough
    return m


M = dict(
    skinA=mat("SkinBlonde", (0.80, 0.55, 0.42), 0.45, sss=0.15),
    skinB=mat("SkinCurly", (0.47, 0.28, 0.17), 0.45, sss=0.15),
    suitA=mat("SuitRed", (0.55, 0.02, 0.04), 0.25, coat=0.6),
    suitB=mat("SuitTeal", (0.0, 0.32, 0.36), 0.25, coat=0.6),
    bootA=mat("BootWhite", (0.8, 0.8, 0.82), 0.3),
    bootB=mat("BootBlack", (0.02, 0.02, 0.025), 0.3),
    blonde=mat("HairBlonde", (0.85, 0.62, 0.25), 0.35, coat=0.3),
    curly=mat("HairCurly", (0.06, 0.03, 0.015), 0.45, coat=0.2),
    eye=mat("Eye", (0.01, 0.01, 0.01), 0.05),
    lipsA=mat("LipsA", (0.6, 0.05, 0.08), 0.3),
    lipsB=mat("LipsB", (0.35, 0.06, 0.07), 0.3),
    mat_=mat("RingMat", (0.75, 0.76, 0.8), 0.7),
    apron=mat("Apron", (0.02, 0.02, 0.03), 0.6),
    rope=mat("Rope", (0.7, 0.03, 0.04), 0.4),
    post=mat("Post", (0.6, 0.6, 0.62), 0.2, metal=1.0),
    pad=mat("Pad", (0.03, 0.03, 0.04), 0.4),
    floor=mat("Floor", (0.015, 0.015, 0.02), 0.35),
    bleach=mat("Bleacher", (0.04, 0.04, 0.05), 0.5),
    barrier=mat("Barrier", (0.05, 0.05, 0.06), 0.3),
    truss=mat("Truss", (0.15, 0.15, 0.16), 0.3, metal=1.0),
    led=mat("LED", (0, 0, 0), 0.5, emit=(1.0, 0.25, 0.05), estr=4.0),
    led2=mat("LED2", (0, 0, 0), 0.5, emit=(0.15, 0.4, 1.0), estr=4.0),
    lamp=mat("Lamp", (0, 0, 0), 0.5, emit=(1, 0.92, 0.8), estr=40.0),
    shirt=objcolor_mat("CrowdShirt"),
    cskin=objcolor_mat("CrowdSkin", 0.5),
    mouth=mat("Mouth", (0.08, 0.01, 0.01), 0.6),
    title=mat("Title", (0, 0, 0), 0.5, emit=(1.0, 0.85, 0.2), estr=6.0),
)


# ---------------------------------------------------------------- mesh helpers
def ellipsoids(name, parts, segs=24, rings=14):
    """parts: list of (center, radii, material_index). Returns mesh."""
    bm = bmesh.new()
    for c, r, mi in parts:
        mtx = Matrix.Translation(c) @ Matrix.Diagonal((*r, 1))
        res = bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=rings, radius=1.0, matrix=mtx)
        for v in res["verts"]:
            for f in v.link_faces:
                f.material_index = mi
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    return me


def new_obj(name, data, coll, parent=None, loc=(0, 0, 0), mats=()):
    o = bpy.data.objects.new(name, data)
    coll.objects.link(o)
    if parent:
        o.parent = parent
    o.location = loc
    if data is not None:
        for m in mats:
            data.materials.append(m)
    return o


def box(name, size, loc, m, coll=C_SET, rot=(0, 0, 0)):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Diagonal((*size, 1)))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = new_obj(name, me, coll, loc=loc, mats=[m])
    o.rotation_euler = rot
    return o


def cyl(name, r, depth, loc, m, rot=(0, 0, 0), verts=24, coll=C_SET):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=verts, radius1=r, radius2=r, depth=depth)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = len(p.vertices) == 4
    o = new_obj(name, me, coll, loc=loc, mats=[m])
    o.rotation_euler = rot
    return o


# ---------------------------------------------------------------- arena + ring
box("Floor", (80, 80, 0.1), (0, 0, -0.05), M["floor"])
box("RingMat", (6.2, 6.2, 0.12), (0, 0, PLAT - 0.06), M["mat_"])
box("Apron", (6.4, 6.4, PLAT - 0.12), (0, 0, (PLAT - 0.12) / 2), M["apron"])
for i, (sx, sy) in enumerate([(1, 1), (1, -1), (-1, 1), (-1, -1)]):
    x, y = sx * 3.0, sy * 3.0
    cyl(f"Post{i}", 0.07, 1.6, (x, y, PLAT + 0.6), M["post"])
    cyl(f"Pad{i}", 0.11, 1.0, (x, y, PLAT + 0.7), M["pad"])
for k, h in enumerate((0.45, 0.85, 1.25)):
    z = PLAT + h
    for i, (a, b) in enumerate([((-3, -3), (3, -3)), ((3, -3), (3, 3)), ((3, 3), (-3, 3)), ((-3, 3), (-3, -3))]):
        mid = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z)
        rot = (0, R(90), 0) if a[1] == b[1] else (R(90), 0, 0)
        cyl(f"Rope{k}{i}", 0.025, 6.0, mid, M["rope"], rot=rot, verts=12)
# LED strips along the apron
for i, (pos, sz) in enumerate([((0, 3.21, 0.55), (6.4, 0.02, 0.18)), ((0, -3.21, 0.55), (6.4, 0.02, 0.18)),
                                ((3.21, 0, 0.55), (0.02, 6.4, 0.18)), ((-3.21, 0, 0.55), (0.02, 6.4, 0.18))]):
    box(f"ApronLED{i}", sz, pos, M["led"] if i % 2 == 0 else M["led2"])

# overhead truss with lamp panels
TZ = 7.5
for i, (pos, sz) in enumerate([((0, 4, TZ), (8.4, 0.3, 0.3)), ((0, -4, TZ), (8.4, 0.3, 0.3)),
                                ((4, 0, TZ), (0.3, 8.4, 0.3)), ((-4, 0, TZ), (0.3, 8.4, 0.3))]):
    box(f"Truss{i}", sz, pos, M["truss"])
for i in range(8):
    a = i / 8 * math.tau
    box(f"LampBox{i}", (0.5, 0.5, 0.15), (4 * math.cos(a) * 0.98, 4 * math.sin(a) * 0.98, TZ - 0.2), M["lamp"])

# bleachers + crowd barrier
ROWS, ROW0, ROWD, STEP = 4, 7.0, 0.95, 0.45
for side in range(4):
    rz = side * R(90)
    for r in range(ROWS):
        d = ROW0 + r * ROWD
        o = box(f"Bleacher{side}_{r}", (2 * (d + 0.5), ROWD, STEP * (r + 1)), (0, 0, 0), M["bleach"])
        o.location = Matrix.Rotation(rz, 3, "Z") @ Vector((0, d, STEP * (r + 1) / 2))
        o.rotation_euler = (0, 0, rz)
    o = box(f"Barrier{side}", (2 * ROW0 - 1, 0.08, 1.1), (0, 0, 0), M["barrier"])
    o.location = Matrix.Rotation(rz, 3, "Z") @ Vector((0, ROW0 - 0.75, 0.55))
    o.rotation_euler = (0, 0, rz)

# ---------------------------------------------------------------- wrestlers
JOINTS = ["pelvis", "spine", "chest", "neck", "head",
          "sh_L", "el_L", "hd_L", "sh_R", "el_R", "hd_R",
          "hip_L", "kn_L", "an_L", "hip_R", "kn_R", "an_R"]


def make_hair(kind, mi):
    parts = []
    if kind == "blonde":
        parts.append(((0, -0.012, 0.125), (0.106, 0.122, 0.128), mi))           # cap
        parts.append(((0, -0.085, -0.03), (0.098, 0.05, 0.19), mi))             # long hair down the back
        for sx in (-1, 1):
            parts.append(((sx * 0.085, -0.03, 0.0), (0.03, 0.06, 0.15), mi))    # side curtains
        parts.append(((0.02, 0.07, 0.205), (0.07, 0.05, 0.03), mi))             # side-swept fringe
    else:
        parts.append(((0, -0.012, 0.125), (0.104, 0.12, 0.126), mi))
        r2 = random.Random(3)
        n = 0
        while n < 170:
            v = Vector((r2.uniform(-1, 1), r2.uniform(-1, 1), r2.uniform(-1, 1)))
            if v.length > 1 or v.length < 0.2:
                continue
            v.normalize()
            p = Vector((v.x * 0.16, v.y * 0.155 - 0.03, v.z * 0.16 + 0.12))
            if p.y > 0.02 and p.z < 0.19:      # keep the face clear
                continue
            if p.z < -0.06 or (p.y > -0.02 and p.z < 0.02):
                continue
            rr = r2.uniform(0.032, 0.05)
            parts.append((tuple(p), (rr, rr, rr), mi))
            n += 1
    return parts


def make_figure(tag, skin, suit, boot, hair_kind, hair_m, lips_m, scale=1.0):
    root = new_obj(f"{tag}_root", None, C_FIG)
    root.empty_display_size = 0.3
    root.scale = (scale,) * 3
    J = {}

    def part(jn, parent, loc, parts, mats):
        me = ellipsoids(f"{tag}_{jn}", parts) if parts else None
        o = new_obj(f"{tag}_{jn}", me, C_FIG, parent=parent, loc=loc, mats=mats)
        o.rotation_mode = "XYZ"
        J[jn] = o
        return o

    S, K, B = 0, 1, 2   # suit, skin, boot material slots
    mats = [suit, skin, boot]
    pel = part("pelvis", root, (0, 0, 0.95), [((0, 0, 0), (0.165, 0.105, 0.12), S)], mats)
    sp = part("spine", pel, (0, 0, 0.05), [((0, 0, 0.11), (0.125, 0.09, 0.14), S)], mats)
    ch = part("chest", sp, (0, 0, 0.2),
              [((0, 0, 0.12), (0.165, 0.1, 0.15), S),
               ((-0.06, 0.06, 0.1), (0.068, 0.06, 0.065), S), ((0.06, 0.06, 0.1), (0.068, 0.06, 0.065), S),
               ((0, 0, 0.2), (0.17, 0.085, 0.07), K)], mats)                      # shoulders (skin)
    nk = part("neck", ch, (0, 0, 0.26), [((0, 0, 0.05), (0.048, 0.048, 0.075), K)], mats)
    hd_parts = [((0, 0.01, 0.11), (0.092, 0.108, 0.12), 0),
                ((0, 0.04, 0.035), (0.06, 0.07, 0.05), 0),                        # jaw
                ((-0.034, 0.104, 0.13), (0.013, 0.008, 0.016), 1), ((0.034, 0.104, 0.13), (0.013, 0.008, 0.016), 1),
                ((0, 0.103, 0.06), (0.026, 0.012, 0.011), 2),                     # lips
                ((0, 0.118, 0.1), (0.012, 0.012, 0.022), 0)]                      # nose
    hd = part("head", nk, (0, 0, 0.1), hd_parts, [skin, M["eye"], lips_m])
    hair = new_obj(f"{tag}_hair", ellipsoids(f"{tag}_hair", make_hair(hair_kind, 0), 16, 10), C_FIG,
                   parent=hd, mats=[hair_m])
    for side, sx in (("L", -1), ("R", 1)):
        sh = part(f"sh_{side}", ch, (sx * 0.19, 0, 0.19), [((0, 0, -0.14), (0.047, 0.047, 0.155), K)], mats)
        el = part(f"el_{side}", sh, (0, 0, -0.28), [((0, 0, -0.12), (0.04, 0.04, 0.135), K)], mats)
        part(f"hd_{side}", el, (0, 0, -0.25), [((0, 0.005, -0.06), (0.026, 0.045, 0.07), K)], mats)
        hp = part(f"hip_{side}", pel, (sx * 0.09, 0, -0.04),
                  [((0, 0, -0.06), (0.09, 0.09, 0.1), S), ((0, 0, -0.22), (0.074, 0.074, 0.23), K)], mats)
        kn = part(f"kn_{side}", hp, (0, 0, -0.43),
                  [((0, 0, -0.06), (0.06, 0.06, 0.1), K), ((0, 0, -0.24), (0.055, 0.055, 0.19), B)], mats)
        part(f"an_{side}", kn, (0, 0, -0.42), [((0, 0.05, -0.035), (0.048, 0.105, 0.04), B)], mats)
    J["root"] = root
    return J


A = make_figure("Blonde", M["skinA"], M["suitA"], M["bootA"], "blonde", M["blonde"], M["lipsA"], 1.0)
B = make_figure("Curly", M["skinB"], M["suitB"], M["bootB"], "curly", M["curly"], M["lipsB"], 0.96)

# ---------------------------------------------------------------- poses (degrees, figure-local, facing +Y)
# +X on a limb swings it forward, +X on the spine/head tilts it back; elbows/knees bend with +X / -X.
STAND = dict(sh_L=(0, 8, 0), sh_R=(0, -8, 0), el_L=(8, 0, 0), el_R=(8, 0, 0))


def P(base=None, **kw):
    p = dict(STAND)
    if base:
        p.update(base)
    p.update(kw)
    return p


def sym(x, y, z, side):
    return (x, y, z) if side == "R" else (x, -y, -z)


def arms(sh, el, hd=(0, 0, 0), only=None):
    d = {}
    for s in (only or ("L", "R")):
        d[f"sh_{s}"] = sym(*sh, s)
        d[f"el_{s}"] = sym(*el, s)
        d[f"hd_{s}"] = sym(*hd, s)
    return d


GUARD = P(spine=(-8, 0, 0), chest=(-6, 0, 0), neck=(8, 0, 0), head=(4, 0, 0),
          **arms((42, -22, -10), (105, 0, 15)),
          hip_L=(22, 0, 0), kn_L=(-38, 0, 0), an_L=(16, 0, 0),
          hip_R=(8, 0, 0), kn_R=(-30, 0, 0), an_R=(20, 0, 0))
GUARD_DN = P(GUARD, hip_L=(32, 0, 0), kn_L=(-55, 0, 0), an_L=(24, 0, 0), hip_R=(16, 0, 0), kn_R=(-46, 0, 0), an_R=(28, 0, 0))
LOCK = P(spine=(-22, 0, 0), chest=(-12, 0, 0), neck=(18, 0, 0), head=(10, 0, 0),
         sh_L=(80, 18, 0), el_L=(35, 0, 0), sh_R=(76, -5, 0), el_R=(48, 0, 0),
         hip_L=(30, 0, 0), kn_L=(-28, 0, 0), an_L=(5, 0, 0),
         hip_R=(-22, 0, 0), kn_R=(-12, 0, 0), an_R=(20, 0, 0))
LOCK_PUSH = P(LOCK, spine=(-30, 0, 0), hip_L=(38, 0, 0), kn_L=(-40, 0, 0), hip_R=(-32, 0, 0), kn_R=(-6, 0, 0), an_R=(30, 0, 0))
LOCK_BACK = P(LOCK, spine=(-10, 0, 0), chest=(-6, 0, 0), hip_L=(18, 0, 0), kn_L=(-35, 0, 0), hip_R=(-8, 0, 0), kn_R=(-30, 0, 0))
# Blonde grabs Curly's head with both hands
GRAB = P(spine=(-10, 0, 0), chest=(-6, 0, 0), neck=(4, 0, 0), head=(2, 0, 0),
         **arms((78, -30, 0), (78, 0, -20), (0, 0, 40)),
         hip_L=(20, 0, 0), kn_L=(-20, 0, 0), an_L=(0, 0, 0), hip_R=(-12, 0, 0), kn_R=(-8, 0, 0), an_R=(12, 0, 0))
KISS_A = P(GRAB, spine=(-6, 0, 0), chest=(-4, 0, 0), neck=(-8, 0, -6), head=(-12, 0, -12),
           **arms((70, -32, 0), (88, 0, -22), (0, 0, 45)))
# Curly: pulled in, then arms flung out in shock, then settle on Blonde's shoulders
PULLED = P(LOCK_BACK, spine=(-14, 0, 0), neck=(6, 0, 0), head=(4, 0, 0),
           **arms((60, -8, 0), (60, 0, 0)))
KISS_B_SHOCK = P(spine=(-10, 0, 0), chest=(-2, 0, 0), neck=(8, 0, 6), head=(10, 0, 12),
                 **arms((20, -82, 0), (12, 0, 0), (0, 0, 0)),
                 hip_L=(14, 0, 0), kn_L=(-12, 0, 0), hip_R=(-10, 0, 0), kn_R=(-4, 0, 0), an_R=(8, 0, 0),
                 an_L=(-2, 0, 0))
KISS_B_MELT = P(KISS_B_SHOCK, **arms((72, -14, 0), (58, 0, -10)), an_R=(14, 0, 0), kn_L=(-18, 0, 0))


def key_pose(F, frame, pose, loc, yaw, bob=0.0):
    root = F["root"]
    root.location = (loc[0], loc[1], PLAT + bob)
    root.rotation_euler = (0, 0, R(yaw))
    root.keyframe_insert("location", frame=frame)
    root.keyframe_insert("rotation_euler", frame=frame)
    for j in JOINTS:
        r = pose.get(j, (0, 0, 0))
        F[j].rotation_euler = tuple(R(v) for v in r)
        F[j].keyframe_insert("rotation_euler", frame=frame)


def placed(mid, ang, d):
    """Blonde at mid - d/2 along angle ang (deg), Curly opposite, facing each other."""
    a = R(ang)
    dx, dy = math.cos(a) * d / 2, math.sin(a) * d / 2
    pa, pb = (mid[0] - dx, mid[1] - dy), (mid[0] + dx, mid[1] + dy)
    yaw_a = ang - 90          # facing +Y rotated to face +ang direction
    yaw_b = ang + 90
    return pa, yaw_a, pb, yaw_b


def key_both(frame, mid, ang, d, pa_pose, pb_pose, bob_a=0.0, bob_b=0.0, off_a=0.0, off_b=0.0):
    pa, ya, pb, yb = placed(mid, ang, d)
    key_pose(A, frame, pa_pose, pa, ya + off_a, bob_a)
    key_pose(B, frame, pb_pose, pb, yb + off_b, bob_b)


# ---- shot 1: face-off, bouncing, closing in (1-72)
for f in range(1, 73, 6):
    t = (f - 1) / 72
    d = 2.6 - 1.2 * t
    up = (f // 6) % 2 == 0
    key_both(f, (0, 0), 0 + 6 * t, d,
             GUARD if up else GUARD_DN, GUARD_DN if up else GUARD,
             bob_a=0.0 if up else -0.06, bob_b=-0.06 if up else 0.0)
# ---- shot 2: lock-up and struggle (73-168)
key_both(76, (0, 0), 8, 1.2, GUARD, GUARD, -0.05, -0.05)
key_both(84, (0, 0), 10, 0.66, LOCK, LOCK)
seq = [(96, 22, LOCK_PUSH, LOCK_BACK, 0.03), (108, 38, LOCK_BACK, LOCK_PUSH, -0.02), (120, 55, LOCK, LOCK, 0.0),
       (132, 70, LOCK_PUSH, LOCK_BACK, 0.05), (146, 80, LOCK_BACK, LOCK_PUSH, -0.25), (158, 84, LOCK_BACK, LOCK_PUSH, -0.45),
       (168, 86, LOCK, LOCK, -0.5)]
for f, ang, pa, pb, shift in seq:
    a = R(ang)
    mid = (math.cos(a) * shift, math.sin(a) * shift)
    key_both(f, mid, ang, 0.66, pa, pb)
# ---- shot 3: Blonde grabs Curly's head and pulls her in (169-216)
a = R(86)
M0 = (math.cos(a) * -0.5, math.sin(a) * -0.5)
key_both(178, M0, 86, 0.62, GRAB, PULLED)
key_both(196, M0, 86, 0.56, GRAB, PULLED)
key_both(209, M0, 86, 0.5, KISS_A, P(PULLED, spine=(-12, 0, 0)))
# ---- shot 4: the kiss (217-276) and hold to the end
KD = float(os.environ.get("KD", 0.40))
key_both(214, M0, 86, KD + 0.02, KISS_A, KISS_B_SHOCK, off_a=0, off_b=0)
key_both(224, M0, 86, KD, KISS_A, KISS_B_SHOCK)
key_both(252, M0, 86, KD, KISS_A, KISS_B_SHOCK)
key_both(272, M0, 86, KD - 0.01, KISS_A, KISS_B_MELT)
key_both(408, M0, 86, KD - 0.01, KISS_A, KISS_B_MELT)

# ---------------------------------------------------------------- crowd
CROWD_SKINS = [(0.85, 0.62, 0.48), (0.65, 0.43, 0.3), (0.45, 0.28, 0.18), (0.28, 0.17, 0.1), (0.9, 0.72, 0.6)]
SHIRTS = [(0.6, 0.05, 0.05), (0.05, 0.1, 0.5), (0.8, 0.8, 0.8), (0.05, 0.05, 0.05), (0.8, 0.5, 0.05),
          (0.1, 0.4, 0.1), (0.4, 0.05, 0.45), (0.0, 0.35, 0.4), (0.7, 0.7, 0.1)]
HAIRS = [(0.05, 0.03, 0.02), (0.3, 0.18, 0.08), (0.75, 0.55, 0.25), (0.02, 0.02, 0.02), (0.5, 0.5, 0.5)]
me_body = ellipsoids("cBody", [((0, 0, 0.0), (0.2, 0.13, 0.32), 0), ((0, 0, -0.45), (0.17, 0.12, 0.3), 0)], 12, 8)
me_head = ellipsoids("cHead", [((0, 0, 0), (0.1, 0.11, 0.12), 0), ((0, -0.04, 0.06), (0.106, 0.098, 0.085), 1),
                                ((-0.035, 0.1, 0.025), (0.014, 0.01, 0.018), 2), ((0.035, 0.1, 0.025), (0.014, 0.01, 0.018), 2)], 12, 8)
me_arm = ellipsoids("cArm", [((0, 0, -0.27), (0.055, 0.055, 0.3), 0)], 10, 6)
me_mouth = ellipsoids("cMouth", [((0, 0, 0), (0.025, 0.01, 0.012), 0)], 8, 6)
hair_mats = []
for i, hc in enumerate(HAIRS):
    hair_mats.append(mat(f"CrowdHair{i}", hc, 0.5))
me_body.materials.append(M["shirt"])
me_arm.materials.append(M["shirt"])
me_mouth.materials.append(M["mouth"])
head_meshes = []
for i, hm in enumerate(hair_mats):
    h = me_head.copy()
    h.materials.append(M["cskin"])
    h.materials.append(hm)
    h.materials.append(M["eye"])
    head_meshes.append(h)

REACT = 280
crowd = []
for side in range(4):
    rz = side * R(90)
    rot = Matrix.Rotation(rz, 3, "Z")
    for r in range(ROWS):
        d = ROW0 + r * ROWD
        half = d - 0.3
        x = -half
        while x < half:
            x += rng.uniform(0.55, 0.75)
            if x > half:
                break
            p = rot @ Vector((x, d + rng.uniform(-0.12, 0.12), STEP * (r + 1)))
            h = rng.uniform(0.9, 1.08)
            body = new_obj("cBody", me_body, C_CROWD, loc=(p.x, p.y, p.z + 1.05 * h))
            body.color = (*rng.choice(SHIRTS), 1)
            # face the ring
            body.rotation_euler = (0, 0, math.atan2(-p.y, -p.x) - R(90) + rng.uniform(-0.3, 0.3))
            body.scale = (h,) * 3
            head = new_obj("cHead", head_meshes[rng.randrange(len(head_meshes))], C_CROWD, parent=body, loc=(0, 0, 0.46))
            head.color = (*rng.choice(CROWD_SKINS), 1)
            mouth = new_obj("cMouth", me_mouth, C_CROWD, parent=head, loc=(0, 0.105, -0.04))
            armL = new_obj("cArmL", me_arm, C_CROWD, parent=body, loc=(-0.2, 0, 0.24))
            armR = new_obj("cArmR", me_arm, C_CROWD, parent=body, loc=(0.2, 0, 0.24))
            for a_ in (armL, armR):
                a_.color = body.color
            crowd.append((body, head, mouth, armL, armR))

for body, head, mouth, armL, armR in crowd:
    base = body.location.copy()
    ph = rng.uniform(0, 12)
    energetic = rng.random() < 0.55
    react = REACT + rng.randint(0, 9)
    # cheering phase
    f = 1 + int(ph) % 10
    while f < react - 4:
        up = (f // 10) % 2 == 0
        bob = 0.06 if (up and energetic) else 0.0
        body.location = base + Vector((0, 0, bob))
        body.keyframe_insert("location", frame=f)
        if energetic:
            armR.rotation_euler = (R(rng.uniform(150, 175)) if up else R(rng.uniform(90, 130)), R(-10), 0)
            armL.rotation_euler = (R(rng.uniform(20, 60)) if up else R(rng.uniform(140, 170)), R(10), 0)
        else:
            armR.rotation_euler = (R(rng.uniform(5, 25)), R(-8), 0)
            armL.rotation_euler = (R(rng.uniform(5, 25)), R(8), 0)
        armR.keyframe_insert("rotation_euler", frame=f)
        armL.keyframe_insert("rotation_euler", frame=f)
        head.rotation_euler = (R(rng.uniform(-5, 8)), 0, R(rng.uniform(-10, 10)))
        head.keyframe_insert("rotation_euler", frame=f)
        f += rng.randint(8, 12)
    mouth.scale = (1, 1, 1)
    mouth.keyframe_insert("scale", frame=react)
    # the shock: jump up, hands up to the head, head back, mouth wide open
    body.location = base + Vector((0, 0, 0.12))
    body.keyframe_insert("location", frame=react + 5)
    body.location = base + Vector((0, 0, 0.05))
    body.keyframe_insert("location", frame=react + 12)
    styl = rng.random()
    if styl < 0.6:     # hands on head
        rR, rL = (R(165), R(28), 0), (R(165), R(-28), 0)
    elif styl < 0.85:  # arms thrown up
        rR, rL = (R(150), R(12), 0), (R(150), R(-12), 0)
    else:              # hands over mouth
        rR, rL = (R(120), R(-30), 0), (R(120), R(30), 0)
    armR.rotation_euler, armL.rotation_euler = rR, rL
    for a_ in (armR, armL):
        a_.keyframe_insert("rotation_euler", frame=react + 6)
        a_.keyframe_insert("rotation_euler", frame=FRAMES)
    head.rotation_euler = (R(-14), 0, R(rng.uniform(-6, 6)))
    head.keyframe_insert("rotation_euler", frame=react + 6)
    head.keyframe_insert("rotation_euler", frame=FRAMES)
    mouth.scale = (1.6, 1, 4.5)
    mouth.keyframe_insert("scale", frame=react + 6)
    body.keyframe_insert("location", frame=FRAMES)

# ---------------------------------------------------------------- lights + world
w = bpy.data.worlds.new("World")
sc.world = w
w.use_nodes = True
w.node_tree.nodes["Background"].inputs[0].default_value = (0.004, 0.005, 0.012, 1)
w.node_tree.nodes["Background"].inputs[1].default_value = 1.0


def light(name, kind, loc, energy, color, size=1.0, rot=(0, 0, 0), spot=None):
    ld = bpy.data.lights.new(name, kind)
    ld.energy = energy
    ld.color = color
    if kind == "AREA":
        ld.size = size
    if kind == "SPOT":
        ld.spot_size = R(spot or 40)
        ld.spot_blend = 0.4
        ld.shadow_soft_size = size
    o = new_obj(name, ld, C_SET, loc=loc)
    o.rotation_euler = rot
    return o


def aim(o, target):
    o.rotation_euler = (Vector(target) - o.location).to_track_quat("-Z", "Y").to_euler()


light("RingKey", "AREA", (0, 0, TZ - 0.4), 2600, (1.0, 0.93, 0.85), size=5.5)
for i, (c, col) in enumerate([((6, 6, 6), (1.0, 0.5, 0.25)), ((-6, -6, 6), (0.35, 0.5, 1.0)),
                               ((6, -6, 6), (1.0, 0.85, 0.7)), ((-6, 6, 6), (0.9, 0.3, 0.6))]):
    s = light(f"Spot{i}", "SPOT", c, 2200, col, size=0.3, spot=26)
    aim(s, (0, 0, PLAT + 1.0))
for side in range(4):   # crowd washes
    a = side * R(90)
    p = Vector((math.sin(a) * -4.0, math.cos(a) * 4.0, 6.5))
    s = light(f"CrowdWash{side}", "SPOT", p, 3500, (0.55, 0.65, 1.0) if side % 2 else (1.0, 0.75, 0.55), size=1.0, spot=95)
    aim(s, (math.sin(a) * -9.5, math.cos(a) * 9.5, 1.5))

# ---------------------------------------------------------------- cameras
def camera(name, lens, keys, dof=None, fstop=2.8):
    cd = bpy.data.cameras.new(name)
    cd.lens = lens
    cd.sensor_width = 36
    cd.clip_start = 0.05
    if dof:
        cd.dof.use_dof = True
        cd.dof.focus_object = dof
        cd.dof.aperture_fstop = fstop
    o = new_obj(name, cd, C_CAM)
    for f, loc, tgt in keys:
        o.location = loc
        aim(o, tgt)
        o.keyframe_insert("location", frame=f)
        o.keyframe_insert("rotation_euler", frame=f)
    # handheld feel (from the blender-film skill's camera-noise step)
    for fc in fcurves(o):
        if fc.data_path == "rotation_euler":
            n = fc.modifiers.new("NOISE")
            n.scale, n.strength, n.phase = 22, R(0.5), fc.array_index * 7.3
    return o


# focus helpers: empties that follow the heads
def follow_empty(name, target, offset=(0, 0, 0)):
    e = new_obj(name, None, C_CAM)
    c = e.constraints.new("COPY_LOCATION")
    c.target = target
    return e


focusA = follow_empty("FocusA", A["head"])
focusB = follow_empty("FocusB", B["head"])
H = PLAT + 1.6
km = Vector((M0[0], M0[1], H))
c1 = camera("Cam1_Wide", 24, [(1, (13, -10, 7.5), (0, 0, PLAT + 0.9)), (72, (9.0, -7.2, 5.0), (0, 0, PLAT + 1.0))])
c2 = camera("Cam2_Orbit", 35, [(73, (4.6, -3.2, PLAT + 1.5), (0, 0, PLAT + 1.2)),
                               (120, (5.2, 0.4, PLAT + 1.3), (0, 0, PLAT + 1.2)),
                               (168, (4.2, 2.6, PLAT + 1.2), (0, -0.2, PLAT + 1.2))], dof=focusA, fstop=4)
c3 = camera("Cam3_Close", 55, [(169, (1.9, -1.2, H - 0.05), (km.x, km.y, H - 0.1)),
                               (216, (1.6, -1.0, H - 0.05), (km.x, km.y, H - 0.08))], dof=focusA, fstop=2.2)
c4 = camera("Cam4_Kiss", 70, [(217, (km.x + 1.85, km.y + 0.05, H - 0.02), (km.x, km.y, H - 0.04)),
                              (276, (km.x + 1.45, km.y + 0.12, H - 0.02), (km.x, km.y, H - 0.04))], dof=focusB, fstop=2.0)
c5 = camera("Cam5_Crowd", 40, [(277, (3.0, -2.6, PLAT + 2.2), (-2.5, -8.6, 2.4)),
                               (336, (-2.0, -2.6, PLAT + 2.2), (-8.0, -7.0, 2.4))])
c6 = camera("Cam6_End", 30, [(337, (7.6, -2.2, 3.5), (km.x, km.y, PLAT + 1.1)),
                             (408, (6.2, -1.6, 3.2), (km.x, km.y, PLAT + 1.2))])
for f, cam in [(1, c1), (73, c2), (169, c3), (217, c4), (277, c5), (337, c6)]:
    mk = sc.timeline_markers.new(cam.name, frame=f)
    mk.camera = cam
sc.camera = c1

# title for the last shot, parented to that camera
cu = bpy.data.curves.new("Title", "FONT")
cu.body = "PLOT TWIST"
cu.align_x, cu.align_y = "CENTER", "CENTER"
cu.extrude = 0.02
cu.size = 0.16
title = new_obj("Title", cu, C_CAM, parent=c6, loc=(0, 0.40, -1.5), mats=[M["title"]])
title.scale = (0.01, 0.01, 0.01)
title.keyframe_insert("scale", frame=350)
title.scale = (1.15, 1.15, 1.15)
title.keyframe_insert("scale", frame=354)
title.scale = (1, 1, 1)
title.keyframe_insert("scale", frame=358)
title.keyframe_insert("scale", frame=408)
title.hide_render = True
title.keyframe_insert("hide_render", frame=349)
title.hide_render = False
title.keyframe_insert("hide_render", frame=350)

# ---------------------------------------------------------------- render settings
r = sc.render
r.engine = "CYCLES"
sc.cycles.device = "CPU"
sc.cycles.samples = 28
sc.cycles.use_adaptive_sampling = True
sc.cycles.adaptive_threshold = 0.04
sc.cycles.use_denoising = True
sc.cycles.max_bounces = 4
sc.cycles.diffuse_bounces = 2
sc.cycles.glossy_bounces = 2
sc.cycles.transmission_bounces = 2
sc.cycles.transparent_max_bounces = 4
r.resolution_x, r.resolution_y = 960, 540
r.resolution_percentage = 100
r.image_settings.file_format = "PNG"
sc.view_settings.view_transform = "AgX"
sc.view_settings.look = "AgX - Medium High Contrast"
sc.view_settings.exposure = 0.3

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "scene.blend"))
print("saved; crowd:", len(crowd))
