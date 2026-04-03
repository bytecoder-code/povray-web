// POV-Ray Web - Image map loading and sampling
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

const imageCache = new Map();

export async function loadImage(url) {
    if (imageCache.has(url)) return imageCache.get(url);

    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, img.width, img.height);
            const result = { width: img.width, height: img.height, data: data.data };
            imageCache.set(url, result);
            resolve(result);
        };
        img.onerror = () => {
            console.warn(`Failed to load image: ${url}`);
            // Return 2x2 magenta checkerboard as error indicator
            const result = {
                width: 2, height: 2,
                data: new Uint8ClampedArray([255,0,255,255, 0,0,0,255, 0,0,0,255, 255,0,255,255])
            };
            imageCache.set(url, result);
            resolve(result);
        };
        img.src = url;
    });
}

export function sampleImageMap(imageData, u, v, interpolate = 0) {
    if (!imageData) return [1, 0, 1, 0, 0]; // magenta = missing

    // Wrap UV to [0,1]
    u = u - Math.floor(u);
    v = v - Math.floor(v);

    const w = imageData.width, h = imageData.height;
    const px = u * (w - 1), py = (1 - v) * (h - 1);

    if (interpolate >= 2) {
        // Bilinear interpolation
        const x0 = Math.floor(px), y0 = Math.floor(py);
        const x1 = Math.min(x0 + 1, w - 1), y1 = Math.min(y0 + 1, h - 1);
        const fx = px - x0, fy = py - y0;

        const c00 = getPixel(imageData, x0, y0);
        const c10 = getPixel(imageData, x1, y0);
        const c01 = getPixel(imageData, x0, y1);
        const c11 = getPixel(imageData, x1, y1);

        return [
            (c00[0]*(1-fx)*(1-fy) + c10[0]*fx*(1-fy) + c01[0]*(1-fx)*fy + c11[0]*fx*fy),
            (c00[1]*(1-fx)*(1-fy) + c10[1]*fx*(1-fy) + c01[1]*(1-fx)*fy + c11[1]*fx*fy),
            (c00[2]*(1-fx)*(1-fy) + c10[2]*fx*(1-fy) + c01[2]*(1-fx)*fy + c11[2]*fx*fy),
            0, 0
        ];
    }

    // Nearest neighbor
    const ix = Math.round(px), iy = Math.round(py);
    return getPixel(imageData, Math.min(ix, w - 1), Math.min(iy, h - 1));
}

function getPixel(imageData, x, y) {
    const i = (y * imageData.width + x) * 4;
    return [
        imageData.data[i] / 255,
        imageData.data[i + 1] / 255,
        imageData.data[i + 2] / 255,
        0, 0
    ];
}

// Compute UV from 3D point based on map_type
export function computeUV(point, mapType) {
    const x = point[0], y = point[1], z = point[2];

    switch (mapType) {
        case 0: // Planar (default)
            return [x - Math.floor(x), z - Math.floor(z)];

        case 1: // Spherical
        {
            const len = Math.sqrt(x*x + y*y + z*z);
            if (len < 1e-10) return [0.5, 0.5];
            const phi = Math.atan2(x, z);
            const theta = Math.acos(Math.max(-1, Math.min(1, y / len)));
            return [0.5 + phi / (2 * Math.PI), theta / Math.PI];
        }

        case 2: // Cylindrical
        {
            const phi = Math.atan2(x, z);
            return [0.5 + phi / (2 * Math.PI), y - Math.floor(y)];
        }

        case 5: // Toroidal
        {
            const phi = Math.atan2(x, z);
            const r = Math.sqrt(x*x + z*z);
            const theta = Math.atan2(y, r - 1);
            return [0.5 + phi / (2 * Math.PI), 0.5 + theta / (2 * Math.PI)];
        }

        default: // Planar
            return [x - Math.floor(x), z - Math.floor(z)];
    }
}
