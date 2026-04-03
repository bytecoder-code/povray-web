// POV-Ray Web - Camera ray generation
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import { createRay } from './ray.js';
import { vec3Normalize, vec3Add, vec3Scale, vec3Sub, vec3Cross, vec3Length, vec3Dot } from '../math/vector.js';

export function setupCamera(camera, width, height) {
    const aspectRatio = width / height;
    let direction = [...camera.direction];
    let up = [...camera.up];
    let right = [...camera.right];

    // Handle look_at
    if (camera.lookAt) {
        direction = vec3Normalize(vec3Sub(camera.lookAt, camera.location));
        // Use sky for look_at orientation. If up was set to non-default
        // but sky wasn't explicitly changed, use up as the sky hint.
        let sky = [...camera.sky];
        const upNonDefault = up[0] !== 0 || up[1] !== 1 || up[2] !== 0;
        const skyDefault = sky[0] === 0 && sky[1] === 1 && sky[2] === 0;
        if (upNonDefault && skyDefault) sky = [...up];
        right = vec3Normalize(vec3Cross(direction, sky));
        right = vec3Scale(right, aspectRatio);
        up = vec3Normalize(vec3Cross(right, direction));
    }

    // Compute field of view
    let fov = camera.angle;
    if (fov <= 0) {
        // Default: compute from direction length and right vector
        const dirLen = vec3Length(direction);
        const rightLen = vec3Length(right);
        fov = 2 * Math.atan2(rightLen * 0.5, dirLen) * 180 / Math.PI;
    }

    const halfFovRad = (fov * 0.5) * Math.PI / 180;
    const viewDist = 0.5 / Math.tan(halfFovRad);

    // Focal blur parameters
    let focalDist = 0, aperture = 0, blurSamples = 0;
    if (camera.aperture > 0) {
        aperture = camera.aperture;
        if (camera.focalPoint) {
            focalDist = vec3Length(vec3Sub(camera.focalPoint, camera.location));
        } else {
            focalDist = vec3Length(vec3Sub(camera.lookAt || [0,0,0], camera.location));
        }
        blurSamples = camera.blurSamples || 10;
    }

    return {
        location: camera.location,
        direction: vec3Normalize(direction),
        up: vec3Normalize(up),
        right: vec3Normalize(vec3Scale(right, 1)),
        viewDist,
        aspectRatio,
        halfFovRad,
        aperture,
        focalDist,
        blurSamples,
        cameraType: camera.type || 'perspective',
        orthoWidth: vec3Length(right),
        orthoHeight: vec3Length(up)
    };
}

export function generateRay(camSetup, x, y, width, height) {
    // Map pixel to normalized coordinates [-0.5, 0.5]
    const px = (x + 0.5) / width - 0.5;
    const py = 0.5 - (y + 0.5) / height;

    // Scale by aspect ratio and field of view
    const tanHalfFov = Math.tan(camSetup.halfFovRad);
    const sx = px * 2 * tanHalfFov * camSetup.aspectRatio;
    const sy = py * 2 * tanHalfFov;

    // Ray direction = direction + sx * right + sy * up
    const dir = vec3Normalize(vec3Add(
        vec3Add(camSetup.direction, vec3Scale(camSetup.right, sx)),
        vec3Scale(camSetup.up, sy)
    ));

    return createRay([...camSetup.location], dir);
}
