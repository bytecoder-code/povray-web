// POV-Ray Web - SAH-based BVH construction
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import { mergeAABB, surfaceArea, centroid } from './aabb.js';
import { getShapeFunctions } from '../shapes/shape-registry.js';
import { transformPoint } from '../math/matrix.js';

export function buildBVH(objects) {
    if (objects.length === 0) return null;

    const entries = objects.map((obj, idx) => {
        const shapeFns = getShapeFunctions(obj.shapeData.shapeType);
        let bbox;
        if (shapeFns && shapeFns.bbox) {
            bbox = shapeFns.bbox(obj.shapeData);
        } else {
            bbox = { min: [-1e5, -1e5, -1e5], max: [1e5, 1e5, 1e5] };
        }
        // Transform bbox corners to world space
        if (obj.transform) {
            bbox = transformBBox(bbox, obj.transform.matrix);
        }
        return { obj, bbox, index: idx, centroid: centroid(bbox) };
    });

    return buildNode(entries, 0);
}

function buildNode(entries, depth) {
    if (entries.length <= 2) {
        // Leaf
        let bbox = entries[0].bbox;
        for (let i = 1; i < entries.length; i++) {
            bbox = mergeAABB(bbox, entries[i].bbox);
        }
        return { bbox, objects: entries.map(e => e.index), left: null, right: null };
    }

    // Find best split axis using SAH
    let nodeBBox = entries[0].bbox;
    for (let i = 1; i < entries.length; i++) {
        nodeBBox = mergeAABB(nodeBBox, entries[i].bbox);
    }

    let bestCost = Infinity;
    let bestAxis = 0;
    let bestSplit = 0;

    for (let axis = 0; axis < 3; axis++) {
        entries.sort((a, b) => a.centroid[axis] - b.centroid[axis]);

        for (let i = 1; i < entries.length; i++) {
            let leftBox = entries[0].bbox;
            for (let j = 1; j < i; j++) leftBox = mergeAABB(leftBox, entries[j].bbox);

            let rightBox = entries[i].bbox;
            for (let j = i + 1; j < entries.length; j++) rightBox = mergeAABB(rightBox, entries[j].bbox);

            const cost = i * surfaceArea(leftBox) + (entries.length - i) * surfaceArea(rightBox);
            if (cost < bestCost) {
                bestCost = cost;
                bestAxis = axis;
                bestSplit = i;
            }
        }
    }

    entries.sort((a, b) => a.centroid[bestAxis] - b.centroid[bestAxis]);
    const left = buildNode(entries.slice(0, bestSplit), depth + 1);
    const right = buildNode(entries.slice(bestSplit), depth + 1);

    return {
        bbox: mergeAABB(left.bbox, right.bbox),
        objects: null,
        left,
        right
    };
}

function transformBBox(bbox, matrix) {
    // Transform all 8 corners and compute the AABB of the result
    const corners = [
        [bbox.min[0], bbox.min[1], bbox.min[2]],
        [bbox.max[0], bbox.min[1], bbox.min[2]],
        [bbox.min[0], bbox.max[1], bbox.min[2]],
        [bbox.max[0], bbox.max[1], bbox.min[2]],
        [bbox.min[0], bbox.min[1], bbox.max[2]],
        [bbox.max[0], bbox.min[1], bbox.max[2]],
        [bbox.min[0], bbox.max[1], bbox.max[2]],
        [bbox.max[0], bbox.max[1], bbox.max[2]],
    ];
    let min = [Infinity, Infinity, Infinity];
    let max = [-Infinity, -Infinity, -Infinity];
    for (const c of corners) {
        const t = transformPoint(matrix, c);
        for (let i = 0; i < 3; i++) {
            min[i] = Math.min(min[i], t[i]);
            max[i] = Math.max(max[i], t[i]);
        }
    }
    return { min, max };
}
