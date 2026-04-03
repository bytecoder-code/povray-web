// POV-Ray Web - CPU reference ray tracer
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import { vec3Dot, vec3Scale, vec3Add, vec3Sub, vec3Normalize, vec3Negate, vec3Reflect, vec3Mul, vec3Cross, vec3Length } from '../math/vector.js';
import { transformPoint, transformDirection, transformNormal } from '../math/matrix.js';
import { createRay } from './ray.js';
import { getShapeFunctions } from '../shapes/shape-registry.js';
import { evaluatePattern, sampleColorMap } from '../material/pattern.js';
import { noise3d, dNoise } from '../material/noise.js';
import { sampleImageMap, computeUV } from '../material/image-map.js';
import { applyWarps } from '../material/warp.js';
import { buildBVH } from '../bvh/builder.js';
import { traverseBVH } from '../bvh/traversal.js';

const EPSILON = 1e-6;
const MAX_TRACE_LEVEL = 5;

export function traceScene(sceneData, camSetup, width, height, imageData, onProgress) {
    const pixels = imageData.data;
    let pixelsDone = 0;
    const totalPixels = width * height;

    // Build BVH for acceleration
    const bvh = buildBVH(sceneData.objects);

    // Anti-aliasing: use UI setting, or increase for DOF
    const aaSamples = camSetup.aperture > 0
        ? Math.max(camSetup.aaSamples || 1, camSetup.blurSamples || 10)
        : (camSetup.aaSamples || 1);

    // Create context object for trace functions
    const ctx = { scene: sceneData, bvh };

    function traceRow(y) {
        for (let x = 0; x < width; x++) {
            let color;
            if (aaSamples > 1) {
                color = [0, 0, 0];
                for (let s = 0; s < aaSamples; s++) {
                    const jx = (Math.random() - 0.5) * 0.5;
                    const jy = (Math.random() - 0.5) * 0.5;
                    const ray = generatePrimaryRay(camSetup, x, y, width, height, jx, jy);
                    const c = traceRay(ctx, ray, 0);
                    color[0] += c[0]; color[1] += c[1]; color[2] += c[2];
                }
                color[0] /= aaSamples; color[1] /= aaSamples; color[2] /= aaSamples;
            } else {
                const ray = generatePrimaryRay(camSetup, x, y, width, height);
                color = traceRay(ctx, ray, 0);
            }

            const idx = (y * width + x) * 4;
            pixels[idx]     = toDisplayByte(color[0]);
            pixels[idx + 1] = toDisplayByte(color[1]);
            pixels[idx + 2] = toDisplayByte(color[2]);
            pixels[idx + 3] = 255;
        }
        pixelsDone += width;
        if (onProgress && y % 10 === 0) {
            onProgress(pixelsDone / totalPixels);
        }
    }

    return {
        renderAll() {
            for (let y = 0; y < height; y++) traceRow(y);
        },
        async renderProgressive(renderCtx) {
            for (let y = 0; y < height; y++) {
                traceRow(y);
                if (y % 4 === 0) {
                    renderCtx.putImageData(imageData, 0, 0);
                    await new Promise(r => setTimeout(r, 0));
                }
            }
            renderCtx.putImageData(imageData, 0, 0);
        }
    };
}

function toDisplayByte(c) {
    return Math.min(255, Math.max(0, Math.round(c * 255)));
}

function generatePrimaryRay(camSetup, x, y, width, height, jitterX = 0, jitterY = 0) {
    const px = (x + 0.5 + jitterX) / width - 0.5;
    const py = 0.5 - (y + 0.5 + jitterY) / height;

    let dir;
    const type = camSetup.cameraType || 'perspective';

    if (type === 'orthographic') {
        const sx = px * camSetup.orthoWidth;
        const sy = py * camSetup.orthoHeight;
        const origin = vec3Add(camSetup.location,
            vec3Add(vec3Scale(camSetup.right, sx), vec3Scale(camSetup.up, sy)));
        return createRay(origin, [...camSetup.direction]);
    }

    if (type === 'fisheye') {
        const fov = (camSetup.halfFovRad * 2) || Math.PI;
        const r = Math.sqrt(px * px + py * py) * 2;
        if (r > 1) return createRay([...camSetup.location], [0, 0, 1]); // outside circle
        const theta = r * fov / 2;
        const phi = Math.atan2(py, px);
        dir = vec3Normalize(vec3Add(
            vec3Add(
                vec3Scale(camSetup.direction, Math.cos(theta)),
                vec3Scale(camSetup.right, Math.sin(theta) * Math.cos(phi))
            ),
            vec3Scale(camSetup.up, Math.sin(theta) * Math.sin(phi))
        ));
        return createRay([...camSetup.location], dir);
    }

    if (type === 'spherical') {
        const lon = px * Math.PI * 2;
        const lat = py * Math.PI;
        dir = vec3Normalize(vec3Add(
            vec3Add(
                vec3Scale(camSetup.direction, Math.cos(lat) * Math.cos(lon)),
                vec3Scale(camSetup.right, Math.cos(lat) * Math.sin(lon))
            ),
            vec3Scale(camSetup.up, Math.sin(lat))
        ));
        return createRay([...camSetup.location], dir);
    }

    if (type === 'panoramic') {
        const lon = px * Math.PI;
        const lat = py * Math.PI / 2;
        dir = vec3Normalize(vec3Add(
            vec3Add(
                vec3Scale(camSetup.direction, Math.cos(lat) * Math.cos(lon)),
                vec3Scale(camSetup.right, Math.cos(lat) * Math.sin(lon))
            ),
            vec3Scale(camSetup.up, Math.sin(lat))
        ));
        return createRay([...camSetup.location], dir);
    }

    // Default: perspective
    const tanHalfFov = Math.tan(camSetup.halfFovRad);
    const sx = px * 2 * tanHalfFov * camSetup.aspectRatio;
    const sy = py * 2 * tanHalfFov;
    dir = vec3Normalize(vec3Add(
        vec3Add(camSetup.direction, vec3Scale(camSetup.right, sx)),
        vec3Scale(camSetup.up, sy)
    ));

    // Focal blur (depth of field)
    if (camSetup.aperture > 0 && camSetup.focalDist > 0) {
        const focalPoint = vec3Add(camSetup.location, vec3Scale(dir, camSetup.focalDist / vec3Dot(dir, camSetup.direction)));
        // Random point on lens disc
        const r = Math.sqrt(Math.random()) * camSetup.aperture;
        const theta = Math.random() * 2 * Math.PI;
        const lensOffset = vec3Add(
            vec3Scale(camSetup.right, r * Math.cos(theta)),
            vec3Scale(camSetup.up, r * Math.sin(theta))
        );
        const newOrigin = vec3Add(camSetup.location, lensOffset);
        const newDir = vec3Normalize(vec3Sub(focalPoint, newOrigin));
        return createRay(newOrigin, newDir);
    }

    return createRay([...camSetup.location], dir);
}

function traceRay(ctx, ray, depth) {
    if (depth >= MAX_TRACE_LEVEL) return [...ctx.scene.background].slice(0, 3);

    const hit = findClosestIntersection(ctx, ray);
    if (!hit) return [...ctx.scene.background].slice(0, 3);

    return shade(ctx, ray, hit, depth);
}

function findClosestIntersection(ctx, ray) {
    // Use BVH for scenes with many objects
    if (ctx.bvh && ctx.scene.objects.length > 4) {
        return findClosestWithBVH(ctx, ray);
    }
    return findClosestLinear(ctx, ray);
}

function findClosestWithBVH(ctx, ray) {
    const objects = ctx.scene.objects;
    return traverseBVH(ctx.bvh, ray, (idx, maxT) => {
        const obj = objects[idx];
        return intersectObject(ray, obj, maxT);
    });
}

function findClosestLinear(ctx, ray) {
    let closest = null;
    let closestT = Infinity;
    const objects = ctx.scene.objects;

    for (const obj of objects) {
        const result = intersectObject(ray, obj, closestT);
        if (result && result.t < closestT) {
            closestT = result.t;
            closest = result;
        }
    }

    return closest;
}

function shade(ctx, ray, hit, depth) {
    const scene = ctx.scene;
    const texture = hit.object.texture || { pigment: { type: 'solid', color: [1, 1, 1, 0, 0] }, finish: defaultFinish() };
    const pigmentColor = evaluatePigment(texture.pigment, hit.point);
    const finish = texture.finish || defaultFinish();

    const surfaceColor = [pigmentColor[0], pigmentColor[1], pigmentColor[2]];
    const filter = pigmentColor[3] || 0;
    const transmit = pigmentColor[4] || 0;

    let N = [...hit.normal];
    if (texture.normal && texture.normal.type !== 'none') {
        N = perturbNormal(N, hit.point, texture.normal);
    }

    const V = vec3Negate(ray.direction);

    let color = computeAmbient(surfaceColor, finish, scene.globalSettings);
    color = vec3Add(color, computeDirectLighting(ctx, hit.point, N, V, surfaceColor, finish, scene.lightSources));

    color = addReflection(ctx, ray, hit.point, N, V, finish, color, depth);
    color = addTransparency(ctx, ray, hit, N, surfaceColor, filter, transmit, color, depth);

    if (scene.fog) {
        color = applyFog(color, scene.fog, ray.origin, hit.point, hit.t);
    }

    return color;
}

function computeAmbient(surfaceColor, finish, globals) {
    let color = vec3Mul(surfaceColor, globals.ambientLight);
    color = vec3Scale(color, finish.ambient ? (finish.ambient[0] + finish.ambient[1] + finish.ambient[2]) / 3 : 0.1);
    if (finish.emission) {
        color = vec3Add(color, vec3Mul(surfaceColor, finish.emission));
    }
    return color;
}

function computeShadowFraction(ctx, light, point, N) {
    if (light.shadowless) return 1;

    if (light.areaLight) {
        const al = light.areaLight;
        const samples = Math.max(1, al.size1) * Math.max(1, al.size2);
        let lit = 0;
        for (let si = 0; si < al.size1; si++) {
            for (let sj = 0; sj < al.size2; sj++) {
                const u = (si + (al.jitter ? Math.random() : 0.5)) / al.size1 - 0.5;
                const v = (sj + (al.jitter ? Math.random() : 0.5)) / al.size2 - 0.5;
                const samplePos = vec3Add(light.location,
                    vec3Add(vec3Scale(al.axis1, u), vec3Scale(al.axis2, v)));
                const toSample = vec3Sub(samplePos, point);
                const sDist = vec3Length(toSample);
                const sDir = vec3Scale(toSample, 1 / sDist);
                const sRay = createRay(vec3Add(point, vec3Scale(N, EPSILON)), sDir);
                if (!isInShadow(ctx, sRay, sDist)) lit++;
            }
        }
        return lit / samples;
    }

    const toLight = vec3Sub(light.location, point);
    const lightDist = Math.sqrt(vec3Dot(toLight, toLight));
    const L = vec3Scale(toLight, 1 / lightDist);
    const shadowRay = createRay(vec3Add(point, vec3Scale(N, EPSILON)), L);
    return isInShadow(ctx, shadowRay, lightDist) ? 0 : 1;
}

function computeLightAttenuation(light, L, lightDist) {
    let atten = 1;

    if (light.type === 'spotlight' && light.pointAt) {
        const spotDir = vec3Normalize(vec3Sub(light.pointAt, light.location));
        const cosAngle = vec3Dot(vec3Negate(L), spotDir);
        const cosRadius = Math.cos(light.radius * Math.PI / 180);
        const cosFalloff = Math.cos(light.falloff * Math.PI / 180);
        if (cosAngle < cosFalloff) return 0;
        if (cosAngle < cosRadius) {
            atten *= Math.pow((cosAngle - cosFalloff) / (cosRadius - cosFalloff), light.tightness || 1);
        }
    }

    if (light.fadeDistance && light.fadePower) {
        atten *= Math.min(1, Math.pow(light.fadeDistance / lightDist, light.fadePower));
    }

    return atten;
}

function computeDirectLighting(ctx, point, N, V, surfaceColor, finish, lights) {
    let color = [0, 0, 0];

    for (const light of lights) {
        const toLight = vec3Sub(light.location, point);
        const lightDist = Math.sqrt(vec3Dot(toLight, toLight));
        const L = vec3Scale(toLight, 1 / lightDist);
        const NdotL = vec3Dot(N, L);
        if (NdotL <= 0) continue;

        const shadow = computeShadowFraction(ctx, light, point, N);
        if (shadow <= 0) continue;

        const atten = computeLightAttenuation(light, L, lightDist) * shadow;
        if (atten <= 0) continue;

        const lightColor = light.color || [1, 1, 1];

        // Diffuse
        if (finish.diffuse > 0) {
            const diff = finish.diffuse * Math.pow(NdotL, finish.brilliance || 1) * atten;
            color = vec3Add(color, vec3Scale(vec3Mul(surfaceColor, lightColor), diff));
        }

        // Phong specular
        if (finish.phong > 0) {
            const R = vec3Reflect(vec3Negate(L), N);
            const spec = finish.phong * Math.pow(Math.max(0, vec3Dot(R, V)), finish.phongSize) * atten;
            if (finish.metallic > 0) {
                color = vec3Add(color, vec3Scale(vec3Mul(surfaceColor, lightColor), spec * finish.metallic));
                color = vec3Add(color, vec3Scale(lightColor, spec * (1 - finish.metallic)));
            } else {
                color = vec3Add(color, vec3Scale(lightColor, spec));
            }
        }

        // Blinn specular
        if (finish.specular > 0) {
            const H = vec3Normalize(vec3Add(L, V));
            const spec = finish.specular * Math.pow(Math.max(0, vec3Dot(N, H)), 1 / Math.max(0.001, finish.roughness)) * atten;
            color = vec3Add(color, vec3Scale(lightColor, spec));
        }
    }

    return color;
}

function addReflection(ctx, ray, point, N, V, finish, color, depth) {
    const reflMax = finish.reflection ? finish.reflection.max : [0, 0, 0];
    if (depth >= MAX_TRACE_LEVEL - 1 || (reflMax[0] <= 0 && reflMax[1] <= 0 && reflMax[2] <= 0)) {
        return color;
    }

    let reflWeight = reflMax;
    if (finish.reflection && finish.reflection.fresnel) {
        const reflMin = finish.reflection.min || [0, 0, 0];
        const fresnel = schlickFresnel(Math.max(0, vec3Dot(V, N)), 1.5);
        reflWeight = vec3Add(reflMin, vec3Scale(vec3Sub(reflMax, reflMin), fresnel));
    }

    const reflDir = vec3Reflect(ray.direction, N);
    const reflRay = createRay(vec3Add(point, vec3Scale(N, EPSILON)), reflDir);
    const reflColor = traceRay(ctx, reflRay, depth + 1);
    return vec3Add(color, vec3Mul(reflColor, reflWeight));
}

function addTransparency(ctx, ray, hit, N, surfaceColor, filter, transmit, color, depth) {
    const transparency = filter + transmit;
    if (depth >= MAX_TRACE_LEVEL - 1 || transparency <= 0.01) return color;

    const interior = hit.object.interior;
    const ior = interior ? interior.ior : 1.5;
    const entering = vec3Dot(ray.direction, hit.normal) < 0;
    const eta = entering ? 1.0 / ior : ior;
    const cosI = -vec3Dot(ray.direction, N);
    const sin2T = eta * eta * (1 - cosI * cosI);

    let transColor;
    if (sin2T <= 1) {
        const cosT = Math.sqrt(1 - sin2T);
        const refractDir = vec3Normalize(vec3Add(
            vec3Scale(ray.direction, eta),
            vec3Scale(N, eta * cosI - cosT)
        ));
        const refractRay = createRay(vec3Sub(hit.point, vec3Scale(N, EPSILON)), refractDir);
        transColor = traceRay(ctx, refractRay, depth + 1);
    } else {
        const reflDir = vec3Reflect(ray.direction, N);
        const reflRay = createRay(vec3Add(hit.point, vec3Scale(N, EPSILON)), reflDir);
        transColor = traceRay(ctx, reflRay, depth + 1);
    }

    if (filter > 0) {
        color = vec3Add(vec3Scale(color, 1 - filter), vec3Scale(vec3Mul(transColor, surfaceColor), filter));
    }
    if (transmit > 0) {
        color = vec3Add(vec3Scale(color, 1 - transmit), vec3Scale(transColor, transmit));
    }
    return color;
}

function schlickFresnel(cosI, ior) {
    let r0 = (1 - ior) / (1 + ior);
    r0 = r0 * r0;
    const x = 1 - cosI;
    return r0 + (1 - r0) * x * x * x * x * x;
}

function perturbNormal(N, point, normalData) {
    const bumpSize = normalData.bumpSize || 1.0;
    const type = normalData.type;
    let dx, dy, dz;

    if (type === 'bumps') {
        const grad = dNoise(point[0], point[1], point[2]);
        dx = grad[0]; dy = grad[1]; dz = grad[2];
    } else if (type === 'dents') {
        const grad = dNoise(point[0], point[1], point[2]);
        const n = noise3d(point[0], point[1], point[2]);
        const scale = n * n;
        dx = grad[0] * scale; dy = grad[1] * scale; dz = grad[2] * scale;
    } else if (type === 'wrinkles') {
        dx = 0; dy = 0; dz = 0;
        let amp = 1, freq = 1;
        for (let i = 0; i < 6; i++) {
            const grad = dNoise(point[0]*freq, point[1]*freq, point[2]*freq);
            dx += grad[0] * amp; dy += grad[1] * amp; dz += grad[2] * amp;
            amp *= 0.5; freq *= 2;
        }
    } else if (type === 'waves') {
        const d = Math.sqrt(point[0]*point[0] + point[2]*point[2]);
        const freq = normalData.frequency || 1;
        const v = Math.cos(d * freq * Math.PI * 2) * 0.5;
        if (d > 0.001) {
            dx = v * point[0] / d; dy = 0; dz = v * point[2] / d;
        } else { dx = 0; dy = 0; dz = 0; }
    } else if (type === 'ripples') {
        const d = Math.sqrt(point[0]*point[0] + point[2]*point[2]);
        const freq = normalData.frequency || 1;
        const v = -Math.sin(d * freq * Math.PI * 2) * 0.5;
        if (d > 0.001) {
            dx = v * point[0] / d; dy = 0; dz = v * point[2] / d;
        } else { dx = 0; dy = 0; dz = 0; }
    } else {
        // Generic noise-based
        const grad = dNoise(point[0], point[1], point[2]);
        dx = grad[0]; dy = grad[1]; dz = grad[2];
    }

    const perturbed = [
        N[0] + dx * bumpSize,
        N[1] + dy * bumpSize,
        N[2] + dz * bumpSize
    ];
    return vec3Normalize(perturbed);
}

function applyFog(color, fog, rayOrigin, hitPoint, t) {
    const fogColor = fog.colour ? fog.colour.slice(0, 3) : [0.5, 0.5, 0.5];
    const fogDist = fog.distance || 1;

    if (fog.type === 2) {
        // Ground fog
        const fogAlt = fog.fogAlt || 0;
        const fogOffset = fog.fogOffset || 0;
        const y0 = rayOrigin[1];
        const y1 = hitPoint[1];
        const yMin = Math.min(y0, y1);
        const yMax = Math.max(y0, y1);
        // Simplified ground fog: stronger below fogOffset
        const belowFraction = Math.max(0, Math.min(1, (fogOffset - yMin) / (yMax - yMin + 0.001)));
        const density = 1 - Math.exp(-t * belowFraction / fogDist);
        return vec3Add(vec3Scale(color, 1 - density), vec3Scale(fogColor, density));
    }

    // Uniform fog (type 1)
    const density = 1 - Math.exp(-t / fogDist);
    return vec3Add(vec3Scale(color, 1 - density), vec3Scale(fogColor, density));
}

// Intersect a single object, returning a world-space hit or null
function intersectObject(ray, obj, maxT) {
    const shapeFns = getShapeFunctions(obj.shapeData.shapeType);
    if (!shapeFns) return null;

    // CSG handles its own child transforms
    if (obj.shapeData.shapeType === 'csg') {
        let localRay = ray;
        if (obj.transform) {
            localRay = createRay(
                transformPoint(obj.transform.inverse, ray.origin),
                transformDirection(obj.transform.inverse, ray.direction)
            );
        }
        const hit = shapeFns.intersect(localRay, obj.shapeData);
        if (!hit || hit.t >= maxT) return null;
        let worldPoint = hit.point, worldNormal = hit.normal;
        if (obj.transform) {
            worldPoint = transformPoint(obj.transform.matrix, hit.point);
            worldNormal = vec3Normalize(transformNormal(obj.transform.inverse, hit.normal));
        }
        const textureObj = (hit.object && hit.object.texture) ? hit.object : obj;
        return { t: hit.t, point: worldPoint, normal: worldNormal, object: textureObj, hitData: hit };
    }

    // Transform ray to object space
    let localRay = ray;
    if (obj.transform) {
        localRay = createRay(
            transformPoint(obj.transform.inverse, ray.origin),
            transformDirection(obj.transform.inverse, ray.direction)
        );
    }

    const hit = shapeFns.intersect(localRay, obj.shapeData);
    if (!hit || hit.t >= maxT) return null;

    let worldPoint, worldNormal;
    if (obj.transform) {
        worldPoint = transformPoint(obj.transform.matrix, hit.point);
        worldNormal = vec3Normalize(transformNormal(obj.transform.inverse,
            shapeFns.normal(hit.point, obj.shapeData, hit)));
    } else {
        worldPoint = hit.point;
        worldNormal = shapeFns.normal(hit.point, obj.shapeData, hit);
    }

    return { t: hit.t, point: worldPoint, normal: worldNormal, object: obj, hitData: hit };
}

function isInShadow(ctx, shadowRay, maxDist) {
    for (const obj of ctx.scene.objects) {
        if (obj.flags && obj.flags.noShadow) continue;
        const hit = intersectObject(shadowRay, obj, maxDist);
        if (hit && hit.t > EPSILON) return true;
    }
    return false;
}

function evaluatePigment(pigment, point) {
    if (!pigment) return [1, 1, 1, 0, 0];
    if (pigment.type === 'solid') return pigment.color;

    // Apply warp transforms to the evaluation point
    let p = point;
    if (pigment.warps) {
        p = applyWarps(p, pigment.warps);
    }

    if (pigment.type === 'checker' && pigment.colors && pigment.colors.length >= 2) {
        const val = evaluatePattern('checker', p, pigment);
        return val === 0 ? pigment.colors[0] : pigment.colors[1];
    }

    if (pigment.type === 'image_map' && pigment._imageData) {
        const mapType = pigment.mapType || 0;
        const uv = computeUV(p, mapType);
        return sampleImageMap(pigment._imageData, uv[0], uv[1], pigment.interpolate || 0);
    }

    if (pigment.type === 'pattern') {
        const val = evaluatePattern(pigment.patternType, p, pigment);
        if (pigment.colorMap && pigment.colorMap.length >= 2) {
            return sampleColorMap(pigment.colorMap, val);
        }
        return [val, val, val, 0, 0];
    }

    return pigment.color || [1, 1, 1, 0, 0];
}

function defaultFinish() {
    return {
        diffuse: 0.6,
        brilliance: 1.0,
        specular: 0.0,
        roughness: 0.05,
        phong: 0.0,
        phongSize: 40.0,
        metallic: 0.0,
        ambient: [0.1, 0.1, 0.1],
        emission: [0, 0, 0],
        reflection: { min: [0, 0, 0], max: [0, 0, 0], falloff: 1, fresnel: false, metallic: 0 }
    };
}
