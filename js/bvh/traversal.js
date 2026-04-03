// POV-Ray Web - CPU BVH traversal
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import { intersectAABB } from './aabb.js';

export function traverseBVH(bvh, ray, testObject) {
    if (!bvh) return null;

    let closest = null;
    let closestT = Infinity;

    const stack = [bvh];
    while (stack.length > 0) {
        const node = stack.pop();

        if (!intersectAABB(ray, node.bbox, closestT)) continue;

        if (node.objects) {
            // Leaf node
            for (const idx of node.objects) {
                const hit = testObject(idx, closestT);
                if (hit && hit.t < closestT) {
                    closestT = hit.t;
                    closest = hit;
                }
            }
        } else {
            // Inner node - push both children (nearer first for early termination)
            if (node.left) stack.push(node.left);
            if (node.right) stack.push(node.right);
        }
    }

    return closest;
}
