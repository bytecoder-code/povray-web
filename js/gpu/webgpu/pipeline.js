// POV-Ray Web - WebGPU compute pipeline setup and rendering
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

function linearToSRGB(c) {
    c = Math.max(0, Math.min(1, c));
    return Math.round((c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1/2.4) - 0.055) * 255);
}

export class WebGPUPipeline {
    constructor(gpuCtx) {
        this.device = gpuCtx.device;
        this.context = gpuCtx.context;
        this.format = gpuCtx.format;
        this.canvas = gpuCtx.canvas;
        this.pipeline = null;
        this.bindGroup = null;
        this.framebufferGPU = null;
        this.framebufferRead = null;
        this.globalsBuffer = null;
        this.countsBuffer = null;
        this.blitPipeline = null;
        this.blitBindGroup = null;
        this.width = 0;
        this.height = 0;
    }

    async init(shaderSource) {
        const device = this.device;
        this.shaderModule = device.createShaderModule({ code: shaderSource });

        this.pipeline = device.createComputePipeline({
            layout: 'auto',
            compute: { module: this.shaderModule, entryPoint: 'main' }
        });

        // Blit shader reads flat f32 framebuffer
        const blitShader = device.createShaderModule({
            code: `
                @group(0) @binding(0) var<storage, read> fb: array<f32>;
                @group(0) @binding(1) var<uniform> dims: vec2u;

                struct VSOut {
                    @builtin(position) pos: vec4f,
                    @location(0) uv: vec2f,
                }

                @vertex fn vs(@builtin(vertex_index) i: u32) -> VSOut {
                    var pos = array<vec2f, 6>(
                        vec2f(-1, -1), vec2f(1, -1), vec2f(-1, 1),
                        vec2f(-1, 1), vec2f(1, -1), vec2f(1, 1)
                    );
                    var out: VSOut;
                    out.pos = vec4f(pos[i], 0, 1);
                    out.uv = pos[i] * 0.5 + 0.5;
                    return out;
                }

                @fragment fn fs(inp: VSOut) -> @location(0) vec4f {
                    let x = u32(inp.uv.x * f32(dims.x));
                    let y = u32((1.0 - inp.uv.y) * f32(dims.y));
                    let idx = (y * dims.x + x) * 4u;
                    let total = arrayLength(&fb);
                    if (idx + 3u >= total) { return vec4f(0, 0, 0, 1); }
                    return vec4f(fb[idx], fb[idx+1u], fb[idx+2u], fb[idx+3u]);
                }
            `
        });

        this.blitPipeline = device.createRenderPipeline({
            layout: 'auto',
            vertex: { module: blitShader, entryPoint: 'vs' },
            fragment: {
                module: blitShader,
                entryPoint: 'fs',
                targets: [{ format: this.format }]
            },
            primitive: { topology: 'triangle-list' }
        });
    }

    uploadScene(packedScene, width, height) {
        const device = this.device;
        this.width = width;
        this.height = height;

        const createBuf = (data, usage) => {
            const size = Math.max(16, Math.ceil(data.byteLength / 4) * 4);
            const buf = device.createBuffer({ size, usage, mappedAtCreation: true });
            if (data instanceof Uint32Array) {
                new Uint32Array(buf.getMappedRange()).set(data);
            } else {
                new Float32Array(buf.getMappedRange()).set(data);
            }
            buf.unmap();
            return buf;
        };

        // Globals uniform (32 floats = 128 bytes)
        const g = new Float32Array(32);
        const bg = packedScene.globalsBuffer;
        const cam = packedScene.cameraBuffer;
        g[0] = bg[0]; g[1] = bg[1]; g[2] = bg[2]; // bg
        g[4] = bg[4]; g[5] = bg[5]; g[6] = bg[6]; // ambient
        g[8] = bg[8]; g[9] = width; g[10] = height; g[11] = 0; // maxTrace, w, h, sample
        g[12] = cam[0]; g[13] = cam[1]; g[14] = cam[2]; // cam pos
        g[16] = cam[4]; g[17] = cam[5]; g[18] = cam[6]; g[19] = cam[21]; // lookAt + hasLookAt
        g[20] = cam[8]; g[21] = cam[9]; g[22] = cam[10]; // dir
        g[24] = cam[12]; g[25] = cam[13]; g[26] = cam[14]; // up
        g[28] = cam[16]; g[29] = cam[17]; g[30] = cam[18]; g[31] = cam[20]; // right + angle

        this.globalsBuffer = createBuf(g, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);

        const objBuf = createBuf(packedScene.objectBuffer, GPUBufferUsage.STORAGE);
        const matBuf = createBuf(packedScene.materialBuffer, GPUBufferUsage.STORAGE);
        const ltBuf = createBuf(packedScene.lightBuffer, GPUBufferUsage.STORAGE);

        this.countsBuffer = createBuf(
            new Uint32Array([packedScene.objectCount, packedScene.lightCount, 0, 0]),
            GPUBufferUsage.UNIFORM
        );

        // Framebuffer: flat f32 array, 4 floats per pixel
        const fbSize = width * height * 4 * 4;
        this.framebufferGPU = device.createBuffer({
            size: fbSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
        });

        const dimsBuf = createBuf(new Uint32Array([width, height, 0, 0]), GPUBufferUsage.UNIFORM);

        this.bindGroup = device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.globalsBuffer } },
                { binding: 1, resource: { buffer: objBuf } },
                { binding: 2, resource: { buffer: matBuf } },
                { binding: 3, resource: { buffer: ltBuf } },
                { binding: 4, resource: { buffer: this.framebufferGPU } },
                { binding: 5, resource: { buffer: this.countsBuffer } },
            ]
        });

        this.blitBindGroup = device.createBindGroup({
            layout: this.blitPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.framebufferGPU } },
                { binding: 1, resource: { buffer: dimsBuf } },
            ]
        });
    }

    renderSample(sampleIndex) {
        const device = this.device;

        device.queue.writeBuffer(this.globalsBuffer, 11 * 4, new Float32Array([sampleIndex]));

        const encoder = device.createCommandEncoder();

        const compute = encoder.beginComputePass();
        compute.setPipeline(this.pipeline);
        compute.setBindGroup(0, this.bindGroup);
        compute.dispatchWorkgroups(Math.ceil(this.width / 8), Math.ceil(this.height / 8));
        compute.end();

        const renderPass = encoder.beginRenderPass({
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                loadOp: 'clear',
                storeOp: 'store'
            }]
        });
        renderPass.setPipeline(this.blitPipeline);
        renderPass.setBindGroup(0, this.blitBindGroup);
        renderPass.draw(6);
        renderPass.end();

        device.queue.submit([encoder.finish()]);
    }

    async readbackFrameAsDataURL() {
        const device = this.device;
        const w = this.width, h = this.height;
        const byteSize = w * h * 4 * 4; // 4 floats per pixel

        // Create a mappable readback buffer
        const readBuf = device.createBuffer({
            size: byteSize,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
        });

        const encoder = device.createCommandEncoder();
        encoder.copyBufferToBuffer(this.framebufferGPU, 0, readBuf, 0, byteSize);
        device.queue.submit([encoder.finish()]);

        await readBuf.mapAsync(GPUMapMode.READ);
        const floats = new Float32Array(readBuf.getMappedRange().slice(0));
        readBuf.unmap();
        readBuf.destroy();

        // Convert linear float RGBA to sRGB 8-bit
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(w, h);
        const px = imgData.data;

        for (let i = 0; i < w * h; i++) {
            const si = i * 4;
            px[si]     = linearToSRGB(floats[si]);
            px[si + 1] = linearToSRGB(floats[si + 1]);
            px[si + 2] = linearToSRGB(floats[si + 2]);
            px[si + 3] = 255;
        }

        ctx.putImageData(imgData, 0, 0);
        return canvas.toDataURL('image/png');
    }

    blitToCanvas() {
        const encoder = this.device.createCommandEncoder();
        const renderPass = encoder.beginRenderPass({
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                loadOp: 'clear',
                storeOp: 'store'
            }]
        });
        renderPass.setPipeline(this.blitPipeline);
        renderPass.setBindGroup(0, this.blitBindGroup);
        renderPass.draw(6);
        renderPass.end();
        this.device.queue.submit([encoder.finish()]);
    }
}
