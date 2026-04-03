// POV-Ray Web - Render manager: orchestrates GPU or CPU rendering
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import { createGPUContext } from '../gpu/gpu-context.js';
import { packScene } from '../gpu/scene-buffers.js';
import { WebGPUPipeline } from '../gpu/webgpu/pipeline.js';
import { WebGL2Pipeline } from '../gpu/webgl2/pipeline.js';
import { setupCamera } from './camera-rays.js';
import { traceScene } from './trace-cpu.js';
import { loadImage } from '../material/image-map.js';

function srgbByte(c) {
    c = Math.max(0, Math.min(1, c));
    c = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1/2.4) - 0.055;
    return Math.round(c * 255);
}

export class RenderManager {
    constructor(gpuCanvas, cpuCanvas) {
        this.gpuCanvas = gpuCanvas;
        this.cpuCanvas = cpuCanvas;
        this.gpuCtx = null;
        this.gpuPipeline = null;
        this.gl2Pipeline = null;
        this.running = false;
        this.backend = 'cpu';
        this.lastFrameDataURL = null;
    }

    async init() {
        this.gpuCtx = await createGPUContext(this.gpuCanvas);
        this.backend = this.gpuCtx.backend;

        if (this.backend === 'webgpu') {
            this.gpuPipeline = new WebGPUPipeline(this.gpuCtx);
            const shaderResp = await fetch('js/gpu/webgpu/shaders/trace.wgsl');
            const shaderSource = await shaderResp.text();
            await this.gpuPipeline.init(shaderSource);
        } else if (this.backend === 'webgl2') {
            this.gl2Pipeline = new WebGL2Pipeline(this.gpuCtx);
            await this.gl2Pipeline.init();
        }

        return this.backend;
    }

    async render(sceneData, width, height, forceBackend, aaSamples, onProgress, onStatus) {
        this.running = true;
        await this._preloadImages(sceneData);

        let useBackend = forceBackend || this.backend;

        // Auto-fallback to CPU if scene has shapes the GPU can't handle
        if ((useBackend === 'webgpu' || useBackend === 'webgl2') && !forceBackend) {
            const gpuShapes = new Set(['sphere','box','plane','cylinder','cone','torus','disc','triangle']);
            const hasUnsupported = this._flattenObjects(sceneData.objects)
                .some(obj => !gpuShapes.has(obj.shapeData.shapeType));
            if (hasUnsupported) {
                onStatus?.('Scene has CPU-only shapes — using CPU renderer');
                useBackend = 'cpu';
            }
        }

        if (useBackend === 'webgpu' && this.gpuPipeline) {
            return this._renderGPU(sceneData, width, height, aaSamples, onProgress, onStatus);
        }
        if (useBackend === 'webgl2' && this.gl2Pipeline) {
            return this._renderGL2(sceneData, width, height, onProgress, onStatus);
        }
        return this._renderCPU(sceneData, width, height, aaSamples, onProgress, onStatus);
    }

    _showCanvas(which) {
        if (which === 'gpu') {
            this.gpuCanvas.style.display = '';
            this.cpuCanvas.style.display = 'none';
        } else {
            this.gpuCanvas.style.display = 'none';
            this.cpuCanvas.style.display = '';
        }
    }

    async _renderGPU(sceneData, width, height, aaSamples, onProgress, onStatus) {
        this._showCanvas('gpu');
        this.gpuCanvas.width = width;
        this.gpuCanvas.height = height;

        onStatus?.('Packing scene for GPU...');
        const packed = packScene(sceneData);
        onStatus?.(`GPU: ${packed.objectCount} objects, ${packed.lightCount} lights`);

        this.gpuPipeline.uploadScene(packed, width, height);

        const maxSamples = aaSamples || 1;
        const startTime = performance.now();

        for (let s = 0; s < maxSamples; s++) {
            if (!this.running) break;
            this.gpuPipeline.renderSample(s);
            await this.gpuCtx.device.queue.onSubmittedWorkDone();
            onProgress?.((s + 1) / maxSamples);
        }

        // Read back framebuffer for save
        this.lastFrameDataURL = await this._readbackGPUFrame();

        const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
        onStatus?.(`WebGPU done in ${elapsed}s — ${packed.objectCount} objects, ${width}x${height}`);
    }

    async _renderGL2(sceneData, width, height, onProgress, onStatus) {
        this._showCanvas('gpu');
        this.gpuCanvas.width = width;
        this.gpuCanvas.height = height;

        onStatus?.('Packing scene for WebGL2...');
        const packed = packScene(sceneData);
        onStatus?.(`WebGL2: ${packed.objectCount} objects, ${packed.lightCount} lights`);

        this.gl2Pipeline.uploadScene(packed, width, height);

        const startTime = performance.now();
        this.gl2Pipeline.renderSample();
        this.lastFrameDataURL = this.gpuCanvas.toDataURL('image/png');
        onProgress?.(1);

        const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
        onStatus?.(`WebGL2 done in ${elapsed}s — ${packed.objectCount} objects, ${width}x${height}`);
    }

    async _renderCPU(sceneData, width, height, aaSamples, onProgress, onStatus) {
        this._showCanvas('cpu');
        this.cpuCanvas.width = width;
        this.cpuCanvas.height = height;
        const ctx = this.cpuCanvas.getContext('2d');

        const camSetup = setupCamera(sceneData.camera, width, height);
        camSetup.aaSamples = aaSamples || 1;
        const imageData = ctx.createImageData(width, height);
        const startTime = performance.now();

        onStatus?.('CPU rendering...');

        const renderer = traceScene(sceneData, camSetup, width, height, imageData, (progress) => {
            if (!this.running) return;
            onProgress?.(progress);
            const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
            onStatus?.(`CPU rendering... ${Math.round(progress * 100)}% (${elapsed}s)`);
        });

        await renderer.renderProgressive(ctx);
        this.lastFrameDataURL = this.cpuCanvas.toDataURL('image/png');

        const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
        onStatus?.(`CPU done in ${elapsed}s — ${sceneData.objects.length} objects, ${width}x${height}`);
    }

    async _readbackGPUFrame() {
        const device = this.gpuCtx.device;
        const pipeline = this.gpuPipeline;
        const w = pipeline.width, h = pipeline.height;
        const byteSize = w * h * 4 * 4;

        const readBuf = device.createBuffer({
            size: byteSize,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
        });

        const encoder = device.createCommandEncoder();
        encoder.copyBufferToBuffer(pipeline.framebufferGPU, 0, readBuf, 0, byteSize);
        device.queue.submit([encoder.finish()]);

        await readBuf.mapAsync(GPUMapMode.READ);
        const floats = new Float32Array(readBuf.getMappedRange().slice(0));
        readBuf.unmap();
        readBuf.destroy();

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(w, h);
        const px = imgData.data;
        for (let i = 0; i < w * h; i++) {
            const si = i * 4;
            px[si]     = srgbByte(floats[si]);
            px[si + 1] = srgbByte(floats[si + 1]);
            px[si + 2] = srgbByte(floats[si + 2]);
            px[si + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
        return canvas.toDataURL('image/png');
    }

    async _preloadImages(sceneData) {
        for (const obj of sceneData.objects) {
            if (obj.texture && obj.texture.pigment &&
                obj.texture.pigment.type === 'image_map' &&
                obj.texture.pigment.imageFile && !obj.texture.pigment._imageData) {
                obj.texture.pigment._imageData = await loadImage(obj.texture.pigment.imageFile);
            }
        }
    }

    _flattenObjects(objects) {
        const flat = [];
        for (const obj of objects) {
            if (obj.shapeData.shapeType === 'csg') {
                flat.push(...this._flattenObjects(obj.shapeData.children));
            } else {
                flat.push(obj);
            }
        }
        return flat;
    }

    getImageDataURL() {
        return this.lastFrameDataURL;
    }

    stop() {
        this.running = false;
    }
}
