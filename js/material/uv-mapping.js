// POV-Ray Web - UV coordinate computation per shape type
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

export function computeShapeUV(point, normal, shapeData, hitData) {
    switch (shapeData.shapeType) {
        case 'sphere': return sphereUV(point, shapeData);
        case 'cylinder': return cylinderUV(point, shapeData);
        case 'cone': return coneUV(point, shapeData);
        case 'box': return boxUV(point, normal, shapeData);
        case 'plane': return planeUV(point);
        case 'torus': return torusUV(point, shapeData);
        case 'disc': return discUV(point, shapeData);
        case 'triangle': return triangleUV(hitData);
        default: return planarUV(point);
    }
}

function sphereUV(point, shape) {
    const p = [
        point[0] - shape.center[0],
        point[1] - shape.center[1],
        point[2] - shape.center[2]
    ];
    const r = shape.radius || 1;
    const phi = Math.atan2(p[0], p[2]);
    const theta = Math.acos(Math.max(-1, Math.min(1, p[1] / r)));
    return [0.5 + phi / (2 * Math.PI), theta / Math.PI];
}

function cylinderUV(point, shape) {
    const base = shape.basePoint || [0, 0, 0];
    const cap = shape.capPoint || [0, 1, 0];
    const axis = [cap[0]-base[0], cap[1]-base[1], cap[2]-base[2]];
    const axisLen = Math.sqrt(axis[0]**2 + axis[1]**2 + axis[2]**2);
    if (axisLen < 1e-10) return [0, 0];

    const p = [point[0]-base[0], point[1]-base[1], point[2]-base[2]];
    const ad = [axis[0]/axisLen, axis[1]/axisLen, axis[2]/axisLen];
    const proj = p[0]*ad[0] + p[1]*ad[1] + p[2]*ad[2];
    const v = proj / axisLen;

    // Find angle around axis
    const perp = [p[0]-ad[0]*proj, p[1]-ad[1]*proj, p[2]-ad[2]*proj];
    const phi = Math.atan2(perp[0], perp[2]);
    return [0.5 + phi / (2 * Math.PI), v];
}

function coneUV(point, shape) {
    return cylinderUV(point, shape);
}

function boxUV(point, normal, shape) {
    const c1 = shape.corner1 || [0,0,0], c2 = shape.corner2 || [1,1,1];
    const sx = c2[0]-c1[0], sy = c2[1]-c1[1], sz = c2[2]-c1[2];
    const lx = (point[0]-c1[0])/sx, ly = (point[1]-c1[1])/sy, lz = (point[2]-c1[2])/sz;

    const ax = Math.abs(normal[0]), ay = Math.abs(normal[1]), az = Math.abs(normal[2]);
    if (ax >= ay && ax >= az) return [lz, ly]; // X face
    if (ay >= ax && ay >= az) return [lx, lz]; // Y face
    return [lx, ly]; // Z face
}

function planeUV(point) {
    return [point[0] - Math.floor(point[0]), point[2] - Math.floor(point[2])];
}

function torusUV(point, shape) {
    const R = shape.majorRadius || shape.R || 1;
    const phi = Math.atan2(point[2], point[0]);
    const distXZ = Math.sqrt(point[0]**2 + point[2]**2);
    const theta = Math.atan2(point[1], distXZ - R);
    return [0.5 + phi / (2 * Math.PI), 0.5 + theta / (2 * Math.PI)];
}

function discUV(point, shape) {
    const c = shape.center || [0,0,0];
    const dx = point[0]-c[0], dz = point[2]-c[2];
    const r = shape.radius || 1;
    const dist = Math.sqrt(dx*dx + dz*dz) / r;
    const angle = Math.atan2(dx, dz);
    return [0.5 + angle / (2 * Math.PI), dist];
}

function triangleUV(hitData) {
    if (hitData && hitData.u !== undefined) {
        return [hitData.u, hitData.v];
    }
    return [0, 0];
}

function planarUV(point) {
    return [point[0] - Math.floor(point[0]), point[2] - Math.floor(point[2])];
}
