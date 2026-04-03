// POV-Ray Web — Main GPU ray tracing compute shader
// Uses flat f32 arrays to avoid WGSL struct alignment issues

struct Globals {
    bg_r: f32, bg_g: f32, bg_b: f32, _p0: f32,
    amb_r: f32, amb_g: f32, amb_b: f32, _p1: f32,
    maxTrace: f32, width: f32, height: f32, sampleIdx: f32,
    cam_px: f32, cam_py: f32, cam_pz: f32, _p2: f32,
    cam_lx: f32, cam_ly: f32, cam_lz: f32, hasLookAt: f32,
    cam_dx: f32, cam_dy: f32, cam_dz: f32, _p3: f32,
    cam_ux: f32, cam_uy: f32, cam_uz: f32, _p4: f32,
    cam_rx: f32, cam_ry: f32, cam_rz: f32, cam_angle: f32,
}

// Object buffer: OBJECT_STRIDE=64 floats per object
// [0]=shapeType [1]=matIdx [2..3]=pad
// [4..19]=transform(4x4) [20..35]=invTransform(4x4)
// [36..63]=shape params

// Material buffer: MAT_STRIDE=32 floats per material
// [0]=pigmentType [1..3]=color1 rgb [4..6]=color2 rgb [7]=pad
// [8]=diffuse [9]=brilliance [10]=specular [11]=roughness
// [12..14]=ambient rgb [15]=phong [16]=phongSize [17]=metallic
// [18..20]=reflMax rgb [21..31]=reserved

// Light buffer: LIGHT_STRIDE=16 floats per light
// [0..2]=position [3]=type [4..6]=color [7]=castShadow
// [8..10]=pointAt [11]=radius [12]=falloff [13]=tightness

@group(0) @binding(0) var<uniform> globals: Globals;
@group(0) @binding(1) var<storage, read> objs: array<f32>;
@group(0) @binding(2) var<storage, read> mats: array<f32>;
@group(0) @binding(3) var<storage, read> lts: array<f32>;
@group(0) @binding(4) var<storage, read_write> framebuffer: array<f32>;
@group(0) @binding(5) var<uniform> counts: vec4u;

const EPSILON: f32 = 1e-4;
const OBJ_STRIDE: u32 = 64u;
const MAT_STRIDE: u32 = 32u;
const LT_STRIDE: u32 = 16u;

struct Ray { origin: vec3f, dir: vec3f, }
struct Hit { t: f32, px: f32, py: f32, pz: f32, nx: f32, ny: f32, nz: f32, matIdx: u32, valid: bool, }

fn obj(i: u32, f: u32) -> f32 { return objs[i * OBJ_STRIDE + f]; }
fn mat(i: u32, f: u32) -> f32 { return mats[i * MAT_STRIDE + f]; }
fn lt(i: u32, f: u32) -> f32 { return lts[i * LT_STRIDE + f]; }

fn getTransform(i: u32) -> mat4x4f {
    let b = i * OBJ_STRIDE + 4u;
    return mat4x4f(
        vec4f(objs[b], objs[b+1], objs[b+2], objs[b+3]),
        vec4f(objs[b+4], objs[b+5], objs[b+6], objs[b+7]),
        vec4f(objs[b+8], objs[b+9], objs[b+10], objs[b+11]),
        vec4f(objs[b+12], objs[b+13], objs[b+14], objs[b+15])
    );
}

fn getInvTransform(i: u32) -> mat4x4f {
    let b = i * OBJ_STRIDE + 20u;
    return mat4x4f(
        vec4f(objs[b], objs[b+1], objs[b+2], objs[b+3]),
        vec4f(objs[b+4], objs[b+5], objs[b+6], objs[b+7]),
        vec4f(objs[b+8], objs[b+9], objs[b+10], objs[b+11]),
        vec4f(objs[b+12], objs[b+13], objs[b+14], objs[b+15])
    );
}

fn transformRay(ray: Ray, invM: mat4x4f) -> Ray {
    var r: Ray;
    let o4 = invM * vec4f(ray.origin, 1.0);
    let d4 = invM * vec4f(ray.dir, 0.0);
    r.origin = o4.xyz;
    r.dir = d4.xyz;
    return r;
}

fn transformNormalBack(n: vec3f, invM: mat4x4f) -> vec3f {
    return normalize(vec3f(
        invM[0][0]*n.x + invM[0][1]*n.y + invM[0][2]*n.z,
        invM[1][0]*n.x + invM[1][1]*n.y + invM[1][2]*n.z,
        invM[2][0]*n.x + invM[2][1]*n.y + invM[2][2]*n.z
    ));
}

fn generateRay(px: f32, py: f32) -> Ray {
    var ray: Ray;
    let w = globals.width;
    let h = globals.height;
    let aspect = w / h;
    let camPos = vec3f(globals.cam_px, globals.cam_py, globals.cam_pz);

    var fwd = vec3f(globals.cam_dx, globals.cam_dy, globals.cam_dz);
    var up = vec3f(globals.cam_ux, globals.cam_uy, globals.cam_uz);
    var right = vec3f(globals.cam_rx, globals.cam_ry, globals.cam_rz);

    if (globals.hasLookAt > 0.5) {
        let lookAt = vec3f(globals.cam_lx, globals.cam_ly, globals.cam_lz);
        fwd = normalize(lookAt - camPos);
        right = normalize(cross(fwd, vec3f(0.0, 1.0, 0.0)));
        up = normalize(cross(right, fwd));
    }

    var fov = globals.cam_angle;
    if (fov <= 0.0) { fov = 67.38; }
    let tanHalf = tan(fov * 0.5 * 3.14159265 / 180.0);

    let sx = (px / w - 0.5) * 2.0 * tanHalf * aspect;
    let sy = (0.5 - py / h) * 2.0 * tanHalf;

    ray.origin = camPos;
    ray.dir = normalize(fwd + right * sx + up * sy);
    return ray;
}

fn intersectSphere(ray: Ray, idx: u32) -> Hit {
    var hit: Hit; hit.valid = false;
    let b = idx * OBJ_STRIDE + 36u;
    let center = vec3f(objs[b], objs[b+1], objs[b+2]);
    let radius = objs[b+3];

    let oc = ray.origin - center;
    let a = dot(ray.dir, ray.dir);
    let half_b = dot(oc, ray.dir);
    let c = dot(oc, oc) - radius * radius;
    let disc = half_b * half_b - a * c;
    if (disc < 0.0) { return hit; }

    let sqrtD = sqrt(disc);
    var t = (-half_b - sqrtD) / a;
    if (t < EPSILON) { t = (-half_b + sqrtD) / a; }
    if (t < EPSILON) { return hit; }

    let p = ray.origin + ray.dir * t;
    let n = normalize(p - center);
    hit.t = t; hit.px = p.x; hit.py = p.y; hit.pz = p.z;
    hit.nx = n.x; hit.ny = n.y; hit.nz = n.z;
    hit.valid = true;
    return hit;
}

fn intersectBox(ray: Ray, idx: u32) -> Hit {
    var hit: Hit; hit.valid = false;
    let b = idx * OBJ_STRIDE + 36u;
    let bmin = vec3f(objs[b], objs[b+1], objs[b+2]);
    let bmax = vec3f(objs[b+4], objs[b+5], objs[b+6]);

    var tMin: f32 = -1e30; var tMax: f32 = 1e30;
    var nAxis: i32 = 0; var nSign: f32 = 1.0;

    for (var i = 0; i < 3; i++) {
        let invD = 1.0 / ray.dir[i];
        var t1 = (bmin[i] - ray.origin[i]) * invD;
        var t2 = (bmax[i] - ray.origin[i]) * invD;
        var s: f32 = -1.0;
        if (t1 > t2) { let tmp = t1; t1 = t2; t2 = tmp; s = 1.0; }
        if (t1 > tMin) { tMin = t1; nAxis = i; nSign = s; }
        if (t2 < tMax) { tMax = t2; }
        if (tMin > tMax) { return hit; }
    }

    var t = tMin;
    if (t < EPSILON) { t = tMax; nSign = -nSign; }
    if (t < EPSILON) { return hit; }

    let p = ray.origin + ray.dir * t;
    var n = vec3f(0.0);
    if (nAxis == 0) { n.x = nSign; }
    else if (nAxis == 1) { n.y = nSign; }
    else { n.z = nSign; }

    hit.t = t; hit.px = p.x; hit.py = p.y; hit.pz = p.z;
    hit.nx = n.x; hit.ny = n.y; hit.nz = n.z;
    hit.valid = true;
    return hit;
}

fn intersectPlane(ray: Ray, idx: u32) -> Hit {
    var hit: Hit; hit.valid = false;
    let b = idx * OBJ_STRIDE + 36u;
    let normal = vec3f(objs[b], objs[b+1], objs[b+2]);
    let dist = objs[b+3];

    let denom = dot(ray.dir, normal);
    if (abs(denom) < 1e-12) { return hit; }

    let t = (dist - dot(ray.origin, normal)) / denom;
    if (t < EPSILON) { return hit; }

    let p = ray.origin + ray.dir * t;
    hit.t = t; hit.px = p.x; hit.py = p.y; hit.pz = p.z;
    hit.nx = normal.x; hit.ny = normal.y; hit.nz = normal.z;
    hit.valid = true;
    return hit;
}

fn intersectCylinder(ray: Ray, idx: u32) -> Hit {
    var hit: Hit; hit.valid = false;
    let b = idx * OBJ_STRIDE + 36u;
    let base = vec3f(objs[b], objs[b+1], objs[b+2]);
    let cap = vec3f(objs[b+4], objs[b+5], objs[b+6]);
    let radius = objs[b+7];

    let axis = cap - base;
    let axisLen = length(axis);
    if (axisLen < 1e-10) { return hit; }
    let axisDir = axis / axisLen;

    let o = ray.origin - base;
    let dDotA = dot(ray.dir, axisDir);
    let oDotA = dot(o, axisDir);

    let dPerp = ray.dir - axisDir * dDotA;
    let oPerp = o - axisDir * oDotA;

    let a = dot(dPerp, dPerp);
    let half_b = dot(oPerp, dPerp);
    let c = dot(oPerp, oPerp) - radius * radius;
    let disc = half_b * half_b - a * c;
    if (disc < 0.0) { return hit; }

    let sqrtD = sqrt(disc);
    var bestT: f32 = 1e30;
    var bestType: i32 = 0;

    for (var s = 0; s < 2; s++) {
        var t: f32;
        if (s == 0) { t = (-half_b - sqrtD) / a; }
        else { t = (-half_b + sqrtD) / a; }
        if (t < EPSILON || t >= bestT) { continue; }
        let h = oDotA + t * dDotA;
        if (h >= 0.0 && h <= axisLen) { bestT = t; bestType = 0; }
    }

    // Caps
    if (abs(dDotA) > 1e-12) {
        let tBase = -oDotA / dDotA;
        if (tBase > EPSILON && tBase < bestT) {
            let hp = oPerp + dPerp * tBase;
            if (dot(hp, hp) <= radius * radius) { bestT = tBase; bestType = 1; }
        }
        let tCap = (axisLen - oDotA) / dDotA;
        if (tCap > EPSILON && tCap < bestT) {
            let hp = oPerp + dPerp * tCap;
            if (dot(hp, hp) <= radius * radius) { bestT = tCap; bestType = 2; }
        }
    }

    if (bestT >= 1e29) { return hit; }
    let p = ray.origin + ray.dir * bestT;
    var n: vec3f;
    if (bestType == 1) { n = -axisDir; }
    else if (bestType == 2) { n = axisDir; }
    else {
        let v = p - base;
        let proj = dot(v, axisDir);
        let onAxis = base + axisDir * proj;
        n = normalize(p - onAxis);
    }

    hit.t = bestT; hit.px = p.x; hit.py = p.y; hit.pz = p.z;
    hit.nx = n.x; hit.ny = n.y; hit.nz = n.z;
    hit.valid = true;
    return hit;
}

fn intersectCone(ray: Ray, idx: u32) -> Hit {
    var hit: Hit; hit.valid = false;
    let b = idx * OBJ_STRIDE + 36u;
    let base = vec3f(objs[b], objs[b+1], objs[b+2]);
    let r0 = objs[b+3];
    let cap = vec3f(objs[b+4], objs[b+5], objs[b+6]);
    let r1 = objs[b+7];

    let axis = cap - base;
    let h = length(axis);
    if (h < 1e-10) { return hit; }
    let axisDir = axis / h;
    let dr = r1 - r0;
    let k = dr / h;

    let o = ray.origin - base;
    let dDotA = dot(ray.dir, axisDir);
    let oDotA = dot(o, axisDir);
    let dPerp = ray.dir - axisDir * dDotA;
    let oPerp = o - axisDir * oDotA;
    let rAtO = r0 + k * oDotA;

    let a = dot(dPerp, dPerp) - k*k*dDotA*dDotA;
    let half_b = dot(oPerp, dPerp) - k*rAtO*dDotA;
    let c = dot(oPerp, oPerp) - rAtO*rAtO;
    let disc = half_b*half_b - a*c;
    if (disc < 0.0) { return hit; }

    let sqrtD = sqrt(disc);
    var bestT: f32 = 1e30;
    var bestType: i32 = 0;

    for (var s = 0; s < 2; s++) {
        var t: f32;
        if (s == 0) { t = (-half_b - sqrtD) / a; }
        else { t = (-half_b + sqrtD) / a; }
        if (t < EPSILON || t >= bestT) { continue; }
        let axisPos = oDotA + t * dDotA;
        if (axisPos >= 0.0 && axisPos <= h) { bestT = t; bestType = 0; }
    }

    // Caps
    if (abs(dDotA) > 1e-12) {
        let tBase = -oDotA / dDotA;
        if (tBase > EPSILON && tBase < bestT) {
            let hp = oPerp + dPerp * tBase;
            if (dot(hp, hp) <= r0*r0) { bestT = tBase; bestType = 1; }
        }
        let tCap = (h - oDotA) / dDotA;
        if (tCap > EPSILON && tCap < bestT) {
            let hp = oPerp + dPerp * tCap;
            if (dot(hp, hp) <= r1*r1) { bestT = tCap; bestType = 2; }
        }
    }

    if (bestT >= 1e29) { return hit; }
    let p = ray.origin + ray.dir * bestT;
    var n: vec3f;
    if (bestType == 1) { n = -axisDir; }
    else if (bestType == 2) { n = axisDir; }
    else {
        let v = p - base;
        let proj = dot(v, axisDir);
        let onAxis = base + axisDir * proj;
        let radial = normalize(p - onAxis);
        let slopeAngle = atan2(dr, h);
        n = normalize(radial * cos(slopeAngle) - axisDir * sin(slopeAngle));
    }

    hit.t = bestT; hit.px = p.x; hit.py = p.y; hit.pz = p.z;
    hit.nx = n.x; hit.ny = n.y; hit.nz = n.z;
    hit.valid = true;
    return hit;
}

fn intersectTorus(ray: Ray, idx: u32) -> Hit {
    var hit: Hit; hit.valid = false;
    let b = idx * OBJ_STRIDE + 36u;
    let R = objs[b];     // major radius
    let r = objs[b+1u];  // minor radius
    let R2 = R * R;
    let r2 = r * r;

    let ox = ray.origin.x; let oy = ray.origin.y; let oz = ray.origin.z;
    let dx = ray.dir.x; let dy = ray.dir.y; let dz = ray.dir.z;

    let dDotd = dx*dx + dy*dy + dz*dz;
    let oDotd = ox*dx + oy*dy + oz*dz;
    let oDoto = ox*ox + oy*oy + oz*oz;
    let k = oDoto - R2 - r2;

    // Quartic: at^4 + bt^3 + ct^2 + dt + e = 0
    let qa = dDotd * dDotd;
    let qb = 4.0 * dDotd * oDotd;
    let qc = 2.0 * dDotd * k + 4.0 * oDotd * oDotd + 4.0 * R2 * dy * dy;
    let qd = 4.0 * k * oDotd + 8.0 * R2 * oy * dy;
    let qe = k * k - 4.0 * R2 * (r2 - oy * oy);

    // Solve via depressed quartic / Ferrari's method (simplified)
    // Normalize
    let B = qb / qa; let C = qc / qa; let D = qd / qa; let E = qe / qa;
    let B4 = B / 4.0;
    let p = C - 6.0 * B4 * B4;
    let q = D - 2.0 * C * B4 + 8.0 * B4 * B4 * B4;
    let rv = E - D * B4 + C * B4 * B4 - 3.0 * B4 * B4 * B4 * B4;

    // If q is near zero, solve biquadratic
    var bestT: f32 = 1e30;
    if (abs(q) < 1e-8) {
        let disc = p * p - 4.0 * rv;
        if (disc >= 0.0) {
            let sqrtDisc = sqrt(disc);
            let y1 = (-p + sqrtDisc) * 0.5;
            let y2 = (-p - sqrtDisc) * 0.5;
            if (y1 >= 0.0) {
                let s = sqrt(y1);
                let t1 = s - B4; let t2 = -s - B4;
                if (t1 > EPSILON && t1 < bestT) { bestT = t1; }
                if (t2 > EPSILON && t2 < bestT) { bestT = t2; }
            }
            if (y2 >= 0.0) {
                let s = sqrt(y2);
                let t1 = s - B4; let t2 = -s - B4;
                if (t1 > EPSILON && t1 < bestT) { bestT = t1; }
                if (t2 > EPSILON && t2 < bestT) { bestT = t2; }
            }
        }
    } else {
        // Ferrari: solve resolvent cubic z^3 - p/2*z^2 - rv*z + (p*rv/2 - q^2/8) = 0
        // Use simplified cubic solution
        let ca = 1.0; let cb = -p * 0.5; let cc = -rv; let cd = p * rv * 0.5 - q * q / 8.0;
        // Depressed cubic: t^3 + At + B
        let p3 = cb / 3.0;
        let A3 = (cc - cb*cb/3.0) / 3.0;
        let B2 = (cd - cb*cc/3.0 + 2.0*cb*cb*cb/27.0) / 2.0;
        let disc3 = B2*B2 + A3*A3*A3;
        var z: f32 = 0.0;
        if (disc3 >= 0.0) {
            let sq = sqrt(disc3);
            let u3 = -B2 + sq; let v3 = -B2 - sq;
            z = sign(u3)*pow(abs(u3), 1.0/3.0) + sign(v3)*pow(abs(v3), 1.0/3.0) - p3;
        } else {
            let m = 2.0 * sqrt(-A3);
            let theta = acos(clamp(-B2 / (A3 * m * 0.5), -1.0, 1.0)) / 3.0;
            z = m * cos(theta) - p3;
        }

        let u2 = 2.0 * z - p;
        if (u2 >= 0.0) {
            let u = sqrt(u2);
            let vv = q / (2.0 * u);
            // Two quadratics: t^2 + ut + (z-v) = 0 and t^2 - ut + (z+v) = 0
            let disc1 = u * u - 4.0 * (z - vv);
            let disc2 = u * u - 4.0 * (z + vv);
            if (disc1 >= 0.0) {
                let sq1 = sqrt(disc1);
                let t1 = (-u + sq1) * 0.5 - B4;
                let t2 = (-u - sq1) * 0.5 - B4;
                if (t1 > EPSILON && t1 < bestT) { bestT = t1; }
                if (t2 > EPSILON && t2 < bestT) { bestT = t2; }
            }
            if (disc2 >= 0.0) {
                let sq2 = sqrt(disc2);
                let t1 = (u + sq2) * 0.5 - B4;
                let t2 = (u - sq2) * 0.5 - B4;
                if (t1 > EPSILON && t1 < bestT) { bestT = t1; }
                if (t2 > EPSILON && t2 < bestT) { bestT = t2; }
            }
        }
    }

    if (bestT >= 1e29) { return hit; }
    let pt = ray.origin + ray.dir * bestT;
    // Torus normal
    let distXZ = sqrt(pt.x * pt.x + pt.z * pt.z);
    var n: vec3f;
    if (distXZ > 1e-10) {
        let ringX = R * pt.x / distXZ;
        let ringZ = R * pt.z / distXZ;
        n = normalize(vec3f(pt.x - ringX, pt.y, pt.z - ringZ));
    } else {
        n = vec3f(0.0, 1.0, 0.0);
    }
    hit.t = bestT; hit.px = pt.x; hit.py = pt.y; hit.pz = pt.z;
    hit.nx = n.x; hit.ny = n.y; hit.nz = n.z;
    hit.valid = true;
    return hit;
}

fn intersectDisc(ray: Ray, idx: u32) -> Hit {
    var hit: Hit; hit.valid = false;
    let b = idx * OBJ_STRIDE + 36u;
    let center = vec3f(objs[b], objs[b+1], objs[b+2]);
    let normal = vec3f(objs[b+4], objs[b+5], objs[b+6]);
    let radius = objs[b+7];

    let denom = dot(ray.dir, normal);
    if (abs(denom) < 1e-12) { return hit; }
    let t = dot(center - ray.origin, normal) / denom;
    if (t < EPSILON) { return hit; }

    let p = ray.origin + ray.dir * t;
    let v = p - center;
    let d2 = dot(v, v);
    if (d2 > radius * radius) { return hit; }

    hit.t = t; hit.px = p.x; hit.py = p.y; hit.pz = p.z;
    hit.nx = normal.x; hit.ny = normal.y; hit.nz = normal.z;
    hit.valid = true;
    return hit;
}

fn intersectTriangleGPU(ray: Ray, idx: u32) -> Hit {
    var hit: Hit; hit.valid = false;
    let b = idx * OBJ_STRIDE + 36u;
    let p1 = vec3f(objs[b], objs[b+1], objs[b+2]);
    let p2 = vec3f(objs[b+4], objs[b+5], objs[b+6]);
    let p3 = vec3f(objs[b+8], objs[b+9], objs[b+10]);

    let e1 = p2 - p1;
    let e2 = p3 - p1;
    let h = cross(ray.dir, e2);
    let a = dot(e1, h);
    if (abs(a) < 1e-12) { return hit; }

    let f = 1.0 / a;
    let s = ray.origin - p1;
    let u = f * dot(s, h);
    if (u < 0.0 || u > 1.0) { return hit; }

    let q = cross(s, e1);
    let v = f * dot(ray.dir, q);
    if (v < 0.0 || u + v > 1.0) { return hit; }

    let t = f * dot(e2, q);
    if (t < EPSILON) { return hit; }

    let p = ray.origin + ray.dir * t;
    let n = normalize(cross(e1, e2));
    hit.t = t; hit.px = p.x; hit.py = p.y; hit.pz = p.z;
    hit.nx = n.x; hit.ny = n.y; hit.nz = n.z;
    hit.valid = true;
    return hit;
}

fn intersectQuadric(ray: Ray, idx: u32) -> Hit {
    var hit: Hit; hit.valid = false;
    let b = idx * OBJ_STRIDE + 36u;
    let A = objs[b]; let B = objs[b+1u]; let C = objs[b+2u]; let D = objs[b+3u];
    let E = objs[b+4u]; let F = objs[b+5u]; let G = objs[b+6u]; let H = objs[b+7u];
    let I = objs[b+8u]; let J = objs[b+9u];

    let ox = ray.origin.x; let oy = ray.origin.y; let oz = ray.origin.z;
    let dx = ray.dir.x; let dy = ray.dir.y; let dz = ray.dir.z;

    let qa = A*dx*dx + E*dy*dy + H*dz*dz + B*dx*dy + C*dx*dz + F*dy*dz;
    let qb = 2.0*(A*ox*dx + E*oy*dy + H*oz*dz) +
             B*(ox*dy + oy*dx) + C*(ox*dz + oz*dx) + F*(oy*dz + oz*dy) +
             D*dx + G*dy + I*dz;
    let qc = A*ox*ox + E*oy*oy + H*oz*oz +
             B*ox*oy + C*ox*oz + F*oy*oz +
             D*ox + G*oy + I*oz + J;

    var t: f32;
    if (abs(qa) < 1e-12) {
        if (abs(qb) < 1e-12) { return hit; }
        t = -qc / qb;
    } else {
        let disc = qb*qb - 4.0*qa*qc;
        if (disc < 0.0) { return hit; }
        let sq = sqrt(disc);
        t = (-qb - sq) / (2.0*qa);
        if (t < EPSILON) { t = (-qb + sq) / (2.0*qa); }
    }
    if (t < EPSILON) { return hit; }

    let p = ray.origin + ray.dir * t;
    let n = normalize(vec3f(
        2.0*A*p.x + B*p.y + C*p.z + D,
        B*p.x + 2.0*E*p.y + F*p.z + G,
        C*p.x + F*p.y + 2.0*H*p.z + I
    ));
    hit.t = t; hit.px = p.x; hit.py = p.y; hit.pz = p.z;
    hit.nx = n.x; hit.ny = n.y; hit.nz = n.z;
    hit.valid = true;
    return hit;
}

fn superEval(p: vec3f, e: f32, n: f32) -> f32 {
    let ax = abs(p.x); let ay = abs(p.y); let az = abs(p.z);
    let twoOverE = 2.0 / e;
    let twoOverN = 2.0 / n;
    let inner = pow(ax, twoOverE) + pow(az, twoOverE);
    return pow(inner, e / n) + pow(ay, twoOverN) - 1.0;
}

fn intersectSuperellipsoid(ray: Ray, idx: u32) -> Hit {
    var hit: Hit; hit.valid = false;
    let b = idx * OBJ_STRIDE + 36u;
    let e = objs[b]; let n = objs[b+1u];

    // Bounding box [-1,1]^3 slab test
    var tEntry: f32 = 0.0; var tExit: f32 = 20.0;
    for (var i = 0; i < 3; i++) {
        if (abs(ray.dir[i]) < 1e-12) {
            if (ray.origin[i] < -1.0 || ray.origin[i] > 1.0) { return hit; }
        } else {
            let inv = 1.0 / ray.dir[i];
            var t1 = (-1.0 - ray.origin[i]) * inv;
            var t2 = (1.0 - ray.origin[i]) * inv;
            if (t1 > t2) { let tmp = t1; t1 = t2; t2 = tmp; }
            tEntry = max(tEntry, t1);
            tExit = min(tExit, t2);
            if (tEntry > tExit) { return hit; }
        }
    }
    tEntry = max(tEntry, EPSILON);

    // Ray march with bisection
    let steps = 128u;
    let dt = (tExit - tEntry) / f32(steps);
    var prevVal = superEval(ray.origin + ray.dir * tEntry, e, n);

    for (var i = 1u; i <= steps; i++) {
        let t = tEntry + f32(i) * dt;
        let p = ray.origin + ray.dir * t;
        let val = superEval(p, e, n);
        if (prevVal > 0.0 && val <= 0.0) {
            // Bisect
            var tLo = tEntry + f32(i - 1u) * dt;
            var tHi = t;
            for (var j = 0u; j < 15u; j++) {
                let tm = (tLo + tHi) * 0.5;
                if (superEval(ray.origin + ray.dir * tm, e, n) > 0.0) { tLo = tm; } else { tHi = tm; }
            }
            let ft = (tLo + tHi) * 0.5;
            if (ft < EPSILON) { prevVal = val; continue; }
            let fp = ray.origin + ray.dir * ft;
            // Numerical gradient for normal
            let dd: f32 = 0.001;
            let fn0 = superEval(fp, e, n);
            let fn_n = normalize(vec3f(
                superEval(fp + vec3f(dd, 0, 0), e, n) - fn0,
                superEval(fp + vec3f(0, dd, 0), e, n) - fn0,
                superEval(fp + vec3f(0, 0, dd), e, n) - fn0
            ));
            hit.t = ft; hit.px = fp.x; hit.py = fp.y; hit.pz = fp.z;
            hit.nx = fn_n.x; hit.ny = fn_n.y; hit.nz = fn_n.z;
            hit.valid = true;
            return hit;
        }
        prevVal = val;
    }
    return hit;
}

fn traceRay(ray: Ray) -> Hit {
    var closest: Hit;
    closest.t = 1e30; closest.valid = false;
    let objCount = counts.x;

    for (var i = 0u; i < objCount; i++) {
        let shapeType = u32(obj(i, 0u));
        let invM = getInvTransform(i);
        let localRay = transformRay(ray, invM);

        var hit: Hit;
        switch (shapeType) {
            case 1u: { hit = intersectSphere(localRay, i); }
            case 2u: { hit = intersectBox(localRay, i); }
            case 3u: { hit = intersectPlane(localRay, i); }
            case 4u: { hit = intersectCylinder(localRay, i); }
            case 5u: { hit = intersectCone(localRay, i); }
            case 6u: { hit = intersectTorus(localRay, i); }
            case 7u: { hit = intersectDisc(localRay, i); }
            case 8u: { hit = intersectTriangleGPU(localRay, i); }
            case 9u: { hit = intersectQuadric(localRay, i); }
            case 10u: { hit = intersectSuperellipsoid(localRay, i); }
            default: { continue; }
        }

        if (hit.valid && hit.t < closest.t) {
            let m = getTransform(i);
            let localP = vec3f(hit.px, hit.py, hit.pz);
            let localN = vec3f(hit.nx, hit.ny, hit.nz);
            let worldP = (m * vec4f(localP, 1.0)).xyz;
            let worldN = transformNormalBack(localN, invM);

            closest.t = hit.t;
            closest.px = worldP.x; closest.py = worldP.y; closest.pz = worldP.z;
            closest.nx = worldN.x; closest.ny = worldN.y; closest.nz = worldN.z;
            closest.matIdx = i;
            closest.valid = true;
        }
    }

    return closest;
}

fn shadowTest(origin: vec3f, lightPos: vec3f) -> bool {
    let toLight = lightPos - origin;
    let lightDist = length(toLight);
    var shadowRay: Ray;
    shadowRay.origin = origin;
    shadowRay.dir = toLight / lightDist;

    let objCount = counts.x;
    for (var i = 0u; i < objCount; i++) {
        let shapeType = u32(obj(i, 0u));
        let invM = getInvTransform(i);
        let localRay = transformRay(shadowRay, invM);

        var hit: Hit;
        switch (shapeType) {
            case 1u: { hit = intersectSphere(localRay, i); }
            case 2u: { hit = intersectBox(localRay, i); }
            case 3u: { hit = intersectPlane(localRay, i); }
            case 4u: { hit = intersectCylinder(localRay, i); }
            case 5u: { hit = intersectCone(localRay, i); }
            case 6u: { hit = intersectTorus(localRay, i); }
            case 7u: { hit = intersectDisc(localRay, i); }
            case 8u: { hit = intersectTriangleGPU(localRay, i); }
            case 9u: { hit = intersectQuadric(localRay, i); }
            case 10u: { hit = intersectSuperellipsoid(localRay, i); }
            default: { continue; }
        }

        if (hit.valid && hit.t > EPSILON && hit.t < lightDist) { return true; }
    }
    return false;
}

// Simple GPU hash noise
fn hash3(p: vec3f) -> f32 {
    var q = fract(p * vec3f(0.1031, 0.1030, 0.0973));
    q += dot(q, q.yzx + 33.33);
    return fract((q.x + q.y) * q.z);
}

fn gpuNoise3d(p: vec3f) -> f32 {
    let i = floor(p);
    let f = fract(p);
    let u = f * f * (3.0 - 2.0 * f); // smoothstep

    return mix(mix(mix(hash3(i + vec3f(0,0,0)), hash3(i + vec3f(1,0,0)), u.x),
                   mix(hash3(i + vec3f(0,1,0)), hash3(i + vec3f(1,1,0)), u.x), u.y),
               mix(mix(hash3(i + vec3f(0,0,1)), hash3(i + vec3f(1,0,1)), u.x),
                   mix(hash3(i + vec3f(0,1,1)), hash3(i + vec3f(1,1,1)), u.x), u.y), u.z);
}

fn evaluatePigment(mi: u32, point: vec3f) -> vec3f {
    let pType = u32(mat(mi, 0u));
    let c1 = vec3f(mat(mi, 1u), mat(mi, 2u), mat(mi, 3u));
    if (pType == 0u) { return c1; } // solid
    if (pType == 1u) { // checker
        let c2 = vec3f(mat(mi, 4u), mat(mi, 5u), mat(mi, 6u));
        let ix = i32(floor(point.x + 0.00001));
        let iy = i32(floor(point.y + 0.00001));
        let iz = i32(floor(point.z + 0.00001));
        if (((ix + iy + iz) % 2 + 2) % 2 == 0) { return c1; }
        return c2;
    }
    if (pType == 2u) { // gradient (along Y by default)
        let c2 = vec3f(mat(mi, 4u), mat(mi, 5u), mat(mi, 6u));
        let v = fract(point.y);
        return mix(c1, c2, v);
    }
    if (pType == 3u) { // bozo/noise
        let c2 = vec3f(mat(mi, 4u), mat(mi, 5u), mat(mi, 6u));
        let v = gpuNoise3d(point);
        return mix(c1, c2, v);
    }
    return c1;
}

fn perturbNormalGPU(N: vec3f, point: vec3f, bumpSize: f32) -> vec3f {
    let d: f32 = 0.01;
    let n0 = gpuNoise3d(point);
    let dx = gpuNoise3d(point + vec3f(d, 0, 0)) - n0;
    let dy = gpuNoise3d(point + vec3f(0, d, 0)) - n0;
    let dz = gpuNoise3d(point + vec3f(0, 0, d)) - n0;
    return normalize(N + vec3f(dx, dy, dz) * bumpSize / d);
}

fn applyFogGPU(color: vec3f, t: f32) -> vec3f {
    let fogDist = globals.cam_angle; // reuse slot 31 for fog distance (0 = no fog)
    // Simple check: if we stored fog data, apply it
    // For now, fog distance is encoded in material slot 22 of first object... skip complex encoding
    // Just use a simple distance-based fade to background
    return color; // fog handled by CPU path for full accuracy
}

fn shade(hit: Hit, ray: Ray) -> vec3f {
    let mi = hit.matIdx;
    let point = vec3f(hit.px, hit.py, hit.pz);
    var N = vec3f(hit.nx, hit.ny, hit.nz);
    let V = -ray.dir;

    // Bump mapping: mat slot 21 = bump size (0 = no bumps)
    let bumpSize = mat(mi, 21u);
    if (bumpSize > 0.001) {
        N = perturbNormalGPU(N, point, bumpSize);
    }

    let surfaceColor = evaluatePigment(mi, point);
    let ambR = mat(mi, 12u); let ambG = mat(mi, 13u); let ambB = mat(mi, 14u);
    var color = surfaceColor * vec3f(ambR, ambG, ambB);

    let diffuseK = mat(mi, 8u);
    let specularK = mat(mi, 10u);
    let roughness = max(0.001, mat(mi, 11u));
    let phongK = mat(mi, 15u);
    let phongSize = mat(mi, 16u);

    let lightCount = counts.y;
    for (var i = 0u; i < lightCount; i++) {
        let lPos = vec3f(lt(i, 0u), lt(i, 1u), lt(i, 2u));
        let lColor = vec3f(lt(i, 4u), lt(i, 5u), lt(i, 6u));
        let castShadow = lt(i, 7u);

        let L = normalize(lPos - point);
        let NdotL = dot(N, L);
        if (NdotL <= 0.0) { continue; }

        let shadowOrigin = point + N * EPSILON;
        if (castShadow > 0.5 && shadowTest(shadowOrigin, lPos)) { continue; }

        // Diffuse
        if (diffuseK > 0.0) {
            color += surfaceColor * lColor * diffuseK * NdotL;
        }

        // Phong
        if (phongK > 0.0) {
            let R = reflect(-L, N);
            let RdotV = max(dot(R, V), 0.0);
            color += lColor * phongK * pow(RdotV, phongSize);
        }

        // Blinn specular
        if (specularK > 0.0) {
            let H = normalize(L + V);
            let NdotH = max(dot(N, H), 0.0);
            color += lColor * specularK * pow(NdotH, 1.0 / roughness);
        }
    }

    return color;
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3u) {
    let x = gid.x;
    let y = gid.y;
    let w = u32(globals.width);
    let h = u32(globals.height);
    if (x >= w || y >= h) { return; }

    // Jitter for progressive AA
    let sampleIdx = globals.sampleIdx;
    let jx = hash3(vec3f(f32(x), f32(y), sampleIdx * 1.37)) - 0.5;
    let jy = hash3(vec3f(f32(x), f32(y), sampleIdx * 2.71)) - 0.5;
    let ray = generateRay(f32(x) + 0.5 + jx * 0.5, f32(y) + 0.5 + jy * 0.5);
    var color = vec3f(globals.bg_r, globals.bg_g, globals.bg_b);

    let hit = traceRay(ray);
    if (hit.valid) {
        color = shade(hit, ray);

        // One-bounce reflection
        let mi = hit.matIdx;
        let reflR = mat(mi, 18u); let reflG = mat(mi, 19u); let reflB = mat(mi, 20u);
        let reflStr = reflR + reflG + reflB;
        if (reflStr > 0.01) {
            let N = vec3f(hit.nx, hit.ny, hit.nz);
            let reflDir = reflect(ray.dir, N);
            var reflRay: Ray;
            reflRay.origin = vec3f(hit.px, hit.py, hit.pz) + N * EPSILON;
            reflRay.dir = reflDir;
            let reflHit = traceRay(reflRay);
            let reflMul = vec3f(reflR, reflG, reflB);
            if (reflHit.valid) {
                color += shade(reflHit, reflRay) * reflMul;
            } else {
                color += vec3f(globals.bg_r, globals.bg_g, globals.bg_b) * reflMul;
            }
        }
    }

    color = clamp(color, vec3f(0.0), vec3f(1.0));

    let idx = (y * w + x) * 4u;
    // Progressive accumulation for multi-sample AA
    if (sampleIdx > 0.5) {
        let prevR = framebuffer[idx];
        let prevG = framebuffer[idx + 1u];
        let prevB = framebuffer[idx + 2u];
        let n = sampleIdx + 1.0;
        let invN = 1.0 / n;
        framebuffer[idx]      = prevR + (color.r - prevR) * invN;
        framebuffer[idx + 1u] = prevG + (color.g - prevG) * invN;
        framebuffer[idx + 2u] = prevB + (color.b - prevB) * invN;
    } else {
        framebuffer[idx] = color.r;
        framebuffer[idx + 1u] = color.g;
        framebuffer[idx + 2u] = color.b;
    }
    framebuffer[idx + 3u] = 1.0;
}
