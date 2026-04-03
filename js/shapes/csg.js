// POV-Ray Web - CSG (Constructive Solid Geometry) intersection
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// Handles union, intersection, difference, merge

import { vec3Add, vec3Scale, vec3Negate, vec3Normalize } from '../math/vector.js';
import { transformPoint, transformDirection, transformNormal } from '../math/matrix.js';
import { createRay } from '../render/ray.js';
import { getShapeFunctions } from './shape-registry.js';

export function intersectCSG(ray, csg) {
    switch (csg.csgType) {
        case 'union': return intersectUnion(ray, csg);
        case 'merge': return intersectUnion(ray, csg); // Merge treated as union for now
        case 'intersection': return intersectCSGIntersection(ray, csg);
        case 'difference': return intersectDifference(ray, csg);
        default: return null;
    }
}

function intersectChild(ray, child) {
    const shapeFns = getShapeFunctions(child.shapeData.shapeType);
    if (!shapeFns) return null;

    let localRay = ray;
    if (child.transform) {
        const origin = transformPoint(child.transform.inverse, ray.origin);
        const direction = transformDirection(child.transform.inverse, ray.direction);
        localRay = createRay(origin, direction);
    }

    const hit = shapeFns.intersect(localRay, child.shapeData);
    if (!hit) return null;

    let worldPoint, worldNormal;
    if (child.transform) {
        worldPoint = transformPoint(child.transform.matrix, hit.point);
        const localNormal = shapeFns.normal(hit.point, child.shapeData, hit);
        worldNormal = vec3Normalize(transformNormal(child.transform.inverse, localNormal));
    } else {
        worldPoint = hit.point;
        worldNormal = shapeFns.normal(hit.point, child.shapeData, hit);
    }

    return {
        t: hit.t,
        point: worldPoint,
        normal: worldNormal,
        object: child,
        hitData: hit
    };
}

function isInsideChild(point, child) {
    const shapeFns = getShapeFunctions(child.shapeData.shapeType);
    if (!shapeFns || !shapeFns.inside) return false;

    let localPoint = point;
    if (child.transform) {
        localPoint = transformPoint(child.transform.inverse, point);
    }

    let result = shapeFns.inside(localPoint, child.shapeData);
    if (child.flags && child.flags.inverse) result = !result;
    return result;
}

function intersectUnion(ray, csg) {
    let closest = null;
    let closestT = Infinity;

    for (const child of csg.children) {
        if (child.shapeData.shapeType === 'csg') {
            const hit = intersectCSG(ray, child.shapeData);
            if (hit && hit.t < closestT) {
                closestT = hit.t;
                closest = hit;
            }
        } else {
            const hit = intersectChild(ray, child);
            if (hit && hit.t < closestT) {
                closestT = hit.t;
                closest = hit;
            }
        }
    }

    return closest;
}

function intersectCSGIntersection(ray, csg) {
    // For CSG intersection: find the hit that's inside ALL other children
    const children = csg.children;
    let best = null;
    let bestT = Infinity;

    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        let hit;
        if (child.shapeData.shapeType === 'csg') {
            hit = intersectCSG(ray, child.shapeData);
        } else {
            hit = intersectChild(ray, child);
        }
        if (!hit) continue;

        // Check if hit point is inside all other children
        let insideAll = true;
        for (let j = 0; j < children.length; j++) {
            if (j === i) continue;
            if (!isInsideChild(hit.point, children[j])) {
                insideAll = false;
                break;
            }
        }

        if (insideAll && hit.t < bestT) {
            bestT = hit.t;
            best = hit;
        }
    }

    return best;
}

function intersectDifference(ray, csg) {
    // difference { A, B } = A minus B
    // Hit must be on A and outside B, or on B and inside A
    const children = csg.children;
    if (children.length < 2) return intersectUnion(ray, csg);

    const objA = children[0];

    // Get hit on A
    let hitA;
    if (objA.shapeData.shapeType === 'csg') {
        hitA = intersectCSG(ray, objA.shapeData);
    } else {
        hitA = intersectChild(ray, objA);
    }

    if (!hitA) return null;

    // Check if the hit point on A is outside all subtracted objects
    let insideSubtracted = false;
    for (let i = 1; i < children.length; i++) {
        if (isInsideChild(hitA.point, children[i])) {
            insideSubtracted = true;
            break;
        }
    }

    if (!insideSubtracted) return hitA;

    // If inside subtracted, try to find hit on subtracted surface where inside A
    let best = null;
    let bestT = Infinity;

    for (let i = 1; i < children.length; i++) {
        let hitB;
        if (children[i].shapeData.shapeType === 'csg') {
            hitB = intersectCSG(ray, children[i].shapeData);
        } else {
            hitB = intersectChild(ray, children[i]);
        }
        if (!hitB) continue;

        if (isInsideChild(hitB.point, objA) && hitB.t < bestT) {
            bestT = hitB.t;
            // Flip normal for the subtracted surface
            best = { ...hitB, normal: vec3Negate(hitB.normal) };
        }
    }

    return best;
}

export function normalCSG(point, csg, hitData) {
    // Normal is computed during intersection
    return hitData ? hitData.normal : [0, 1, 0];
}

export function bboxCSG(csg) {
    let min = [Infinity, Infinity, Infinity];
    let max = [-Infinity, -Infinity, -Infinity];

    for (const child of csg.children) {
        const shapeFns = getShapeFunctions(child.shapeData.shapeType);
        if (!shapeFns) continue;
        const bb = shapeFns.bbox(child.shapeData);
        for (let i = 0; i < 3; i++) {
            min[i] = Math.min(min[i], bb.min[i]);
            max[i] = Math.max(max[i], bb.max[i]);
        }
    }

    return { min, max };
}

export function insideCSG(point, csg) {
    switch (csg.csgType) {
        case 'union':
        case 'merge':
            return csg.children.some(c => isInsideChild(point, c));
        case 'intersection':
            return csg.children.every(c => isInsideChild(point, c));
        case 'difference':
            if (csg.children.length < 2) return false;
            if (!isInsideChild(point, csg.children[0])) return false;
            for (let i = 1; i < csg.children.length; i++) {
                if (isInsideChild(point, csg.children[i])) return false;
            }
            return true;
        default:
            return false;
    }
}
