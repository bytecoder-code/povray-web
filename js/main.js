// POV-Ray Web - Application bootstrap and orchestrator
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import { Parser } from './parser/parser.js';
import { RenderManager } from './render/render-manager.js';
import { loadPovz } from './io/povz-loader.js';

// Load bundled includes - try static import, fall back to dynamic
let STANDARD_INCLUDES = {};
try {
    const mod = await import('./include/include-bundle.js');
    STANDARD_INCLUDES = mod.STANDARD_INCLUDES || {};
    console.log(`Loaded ${Object.keys(STANDARD_INCLUDES).length} bundled includes`);
} catch (e) {
    console.warn('Failed to load bundled includes:', e);
}

let povzIncludes = new Map(); // text includes (.inc/.pov) from bundle or user-created
let povzAssets = new Map();   // binary assets (images, .obj, .df3, etc.) from bundle
let currentIncludeFile = null;

const gpuCanvas = document.getElementById('gpu-canvas');
const cpuCanvas = document.getElementById('cpu-canvas');
const editor = document.getElementById('scene-editor');
const includeEditor = document.getElementById('include-editor');
const includeSelect = document.getElementById('include-select');
const includeCount = document.getElementById('include-count');
const btnRender = document.getElementById('btn-render');
const btnStop = document.getElementById('btn-stop');
const btnLoad = document.getElementById('btn-load');
const fileInput = document.getElementById('file-input');
const inputWidth = document.getElementById('input-width');
const inputHeight = document.getElementById('input-height');
const selectBackend = document.getElementById('select-backend');
const selectAA = document.getElementById('select-aa');
const statusText = document.getElementById('status-text');
const progressBar = document.getElementById('progress-bar');

let renderManager = null;

async function init() {
    // Init GPU context
    renderManager = new RenderManager(gpuCanvas, cpuCanvas);
    try {
        const backend = await renderManager.init();
        const name = backend === 'webgpu' ? 'WebGPU' : backend === 'webgl2' ? 'WebGL2' : 'CPU';
        statusText.textContent = `Ready (${name})`;
        if (backend !== 'webgpu') {
            selectBackend.querySelector('[value="webgpu"]').disabled = true;
        }
        if (backend !== 'webgl2' && backend !== 'webgpu') {
            selectBackend.querySelector('[value="webgl2"]').disabled = true;
        }
    } catch (e) {
        console.warn('GPU init failed, using CPU:', e);
        statusText.textContent = 'Ready (CPU)';
        selectBackend.querySelector('[value="webgpu"]').disabled = true;
    }

    // Check for ?file= query parameter (shell integration)
    const params = new URLSearchParams(location.search);
    const fileUrl = params.get('file');
    if (fileUrl) {
        await loadFromUrl(fileUrl);
        // Auto-render when loaded from URL
        if (editor.value && editor.value.trim()) {
            await startRender();
        }
    }
}

// Also listen for postMessage from parent shell (vis5d pattern)
window.addEventListener('message', async (e) => {
    if (e.data && e.data.type === 'load-file' && e.data.url) {
        await loadFromUrl(e.data.url);
        if (editor.value && editor.value.trim()) {
            await startRender();
        }
    }
});

async function loadFromUrl(url) {
    statusText.textContent = 'Loading scene...';
    try {
        const resp = await fetch(url);
        if (!resp.ok) { statusText.textContent = `Failed to load: ${resp.status}`; return; }

        if (url.endsWith('.povz')) {
            const buffer = await resp.arrayBuffer();
            const { mainPov, includes, assets } = await loadPovz(buffer);
            editor.value = mainPov.text;
            povzIncludes = includes;
            povzAssets = assets;
            currentIncludeFile = null;
            updateIncludeUI();
            updateAssetsUI();
            statusText.textContent = `Loaded: ${mainPov.name} (${includes.size} includes, ${assets.size} assets)`;
        } else {
            editor.value = await resp.text();
            povzIncludes = new Map();
            povzAssets = new Map();
            currentIncludeFile = null;
            updateIncludeUI();
            updateAssetsUI();
            statusText.textContent = 'Scene loaded. Click Render.';
        }
    } catch (e) {
        statusText.textContent = `Load error: ${e.message}`;
        console.error('Load failed:', url, e);
    }
}

const btnSave = document.getElementById('btn-save');

btnRender.addEventListener('click', startRender);
btnStop.addEventListener('click', stopRender);
btnSave.addEventListener('click', saveImage);

btnLoad.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.endsWith('.povz')) {
        const buffer = await file.arrayBuffer();
        const { mainPov, includes, assets } = await loadPovz(buffer);
        editor.value = mainPov.text;
        povzIncludes = includes;
        povzAssets = assets;
        currentIncludeFile = null;
        updateIncludeUI();
        updateAssetsUI();
        statusText.textContent = `Loaded: ${file.name} (${includes.size} includes, ${assets.size} assets)`;
    } else {
        const reader = new FileReader();
        reader.onload = () => {
            editor.value = reader.result;
            povzIncludes = new Map();
            povzAssets = new Map();
            currentIncludeFile = null;
            updateIncludeUI();
            updateAssetsUI();
            statusText.textContent = `Loaded: ${file.name}`;
        };
        reader.readAsText(file);
    }
});

// --- Tab switching ---
document.querySelectorAll('#editor-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('#editor-tabs .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
});

// --- Include file management ---
function updateIncludeUI() {
    includeSelect.innerHTML = '';
    if (povzIncludes.size === 0) {
        includeSelect.innerHTML = '<option value="">No includes loaded</option>';
        includeEditor.value = '';
        includeEditor.disabled = true;
        currentIncludeFile = null;
    } else {
        includeEditor.disabled = false;
        for (const name of [...povzIncludes.keys()].sort()) {
            if (typeof povzIncludes.get(name) !== 'string') continue; // skip binary
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            includeSelect.appendChild(opt);
        }
        if (!currentIncludeFile || !povzIncludes.has(currentIncludeFile)) {
            currentIncludeFile = includeSelect.value;
        }
        includeSelect.value = currentIncludeFile;
        includeEditor.value = povzIncludes.get(currentIncludeFile) || '';
    }
    const textCount = [...povzIncludes.values()].filter(v => typeof v === 'string').length;
    includeCount.textContent = textCount > 0 ? `(${textCount})` : '';
}

// Save current include editor content before switching
function saveCurrentInclude() {
    if (currentIncludeFile && povzIncludes.has(currentIncludeFile)) {
        povzIncludes.set(currentIncludeFile, includeEditor.value);
    }
}

includeSelect.addEventListener('change', () => {
    saveCurrentInclude();
    currentIncludeFile = includeSelect.value;
    includeEditor.value = povzIncludes.get(currentIncludeFile) || '';
});

document.getElementById('btn-add-include').addEventListener('click', () => {
    const name = prompt('Include filename (e.g. mycolors.inc):');
    if (!name) return;
    saveCurrentInclude();
    povzIncludes.set(name, '// ' + name + '\n');
    currentIncludeFile = name;
    updateIncludeUI();
});

document.getElementById('btn-del-include').addEventListener('click', () => {
    if (!currentIncludeFile) return;
    povzIncludes.delete(currentIncludeFile);
    currentIncludeFile = null;
    updateIncludeUI();
});

// Auto-save include content on blur
includeEditor.addEventListener('blur', saveCurrentInclude);

// --- Assets tab ---
const assetsList = document.getElementById('assets-list');
const assetCount = document.getElementById('asset-count');

function updateAssetsUI() {
    assetsList.innerHTML = '';
    if (povzAssets.size === 0) {
        assetsList.innerHTML = '<div class="asset-empty">No assets loaded. Load a .povz bundle to see referenced images, meshes, and data files.</div>';
        assetCount.textContent = '';
        return;
    }
    assetCount.textContent = `(${povzAssets.size})`;

    for (const [name, data] of [...povzAssets.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
        const item = document.createElement('div');
        item.className = 'asset-item';

        const ext = name.split('.').pop().toLowerCase();
        const icon = getAssetIcon(ext);
        const size = formatAssetSize(data.byteLength || data.length || 0);
        const type = getAssetType(ext);

        let html = `<div class="asset-icon">${icon}</div>
            <div class="asset-info">
                <div class="asset-name">${name}</div>
                <div class="asset-meta">${type} — ${size}</div>
            </div>`;

        // Image preview for supported formats
        if (['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(ext)) {
            try {
                const blob = new Blob([data], { type: `image/${ext === 'jpg' ? 'jpeg' : ext}` });
                const url = URL.createObjectURL(blob);
                html += `<img class="asset-preview" src="${url}" alt="${name}">`;
            } catch {}
        }

        item.innerHTML = html;
        assetsList.appendChild(item);
    }
}

function getAssetIcon(ext) {
    const icons = {
        png: '\u{1F5BC}', jpg: '\u{1F5BC}', jpeg: '\u{1F5BC}', gif: '\u{1F5BC}',
        bmp: '\u{1F5BC}', tga: '\u{1F5BC}',
        obj: '\u{1F4D0}', df3: '\u{1F4CA}',
        map: '\u{1F3A8}', pot: '\u{1F30A}',
        ttf: '\u{1F524}',
    };
    return icons[ext] || '\u{1F4C4}';
}

function getAssetType(ext) {
    const types = {
        png: 'PNG image', jpg: 'JPEG image', jpeg: 'JPEG image', gif: 'GIF image',
        bmp: 'Bitmap image', tga: 'Targa image',
        obj: 'Wavefront mesh', df3: 'Density file',
        map: 'Color map', pot: 'Potential file',
        ttf: 'TrueType font',
    };
    return types[ext] || ext.toUpperCase() + ' file';
}

function formatAssetSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const logOutput = document.getElementById('log-output');
const logBadge = document.getElementById('log-badge');
let logText = '';

// Viewport tab switching
document.querySelectorAll('#viewport-tabs .vtab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('#viewport-tabs .vtab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.vtab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('vtab-' + tab.dataset.vtab).classList.add('active');
    });
});

const btnCopyLog = document.getElementById('btn-copy-log');
btnCopyLog.addEventListener('click', () => {
    navigator.clipboard.writeText(logText).then(() => {
        const orig = btnCopyLog.textContent;
        btnCopyLog.textContent = '\u2713 Copied';
        btnCopyLog.style.color = '#4caf50';
        setTimeout(() => { btnCopyLog.textContent = orig; btnCopyLog.style.color = ''; }, 1500);
    });
});

document.getElementById('btn-clear-log').addEventListener('click', () => {
    logText = '';
    logOutput.innerHTML = '';
    logBadge.style.display = 'none';
});

function appendLog(msg, level = 'info') {
    logText += msg + '\n';
    const span = document.createElement('span');
    span.className = `log-${level}`;
    span.textContent = msg + '\n';
    logOutput.appendChild(span);
    logOutput.scrollTop = logOutput.scrollHeight;
}

function showLogBadge(count) {
    logBadge.textContent = count;
    logBadge.style.display = '';
}

function showError(title, details, warnings) {
    appendLog(`=== ${title} ===`, 'error');
    if (details) appendLog(details, 'error');
    if (warnings && warnings.length > 0) {
        for (const w of warnings) appendLog(w, 'warn');
        showLogBadge(warnings.length);
    }
}

function hideError() {
    // No-op — log tab persists
}

async function startRender() {
    if (!renderManager) {
        console.error('startRender: renderManager not initialized');
        statusText.textContent = 'Error: renderer not ready';
        return;
    }
    btnRender.disabled = true;
    btnStop.disabled = false;
    progressBar.style.width = '0%';
    logText = '';
    logOutput.innerHTML = '';
    logBadge.style.display = 'none';

    const width = parseInt(inputWidth.value) || 640;
    const height = parseInt(inputHeight.value) || 480;

    const sceneText = editor.value;

    // Capture console.warn for parser warnings
    const warnings = [];
    const origWarn = console.warn;
    console.warn = (...args) => {
        const msg = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
        warnings.push(msg);
        origWarn.apply(console, args);
    };

    try {
        statusText.textContent = 'Parsing...';
        saveCurrentInclude();
        const parser = new Parser({ baseUrl: location.href, bundledIncludes: STANDARD_INCLUDES });
        if (povzIncludes && povzIncludes.size > 0) {
            for (const [name, content] of povzIncludes) {
                if (typeof content === 'string') {
                    parser._includeCache.set(name, content);
                }
            }
        }
        await parser.preloadIncludes(sceneText);
        const sceneData = await parser.parse(sceneText);

        console.log(`Parsed: ${sceneData.objects.length} objects, ${sceneData.lightSources.length} lights`);

        if (sceneData.objects.length === 0 && sceneData.lightSources.length === 0) {
            showError('No objects or lights in scene',
                'The parser completed but found no renderable objects.',
                warnings);
            statusText.textContent = 'Parse complete — no objects found';
            return;
        }

        statusText.textContent = `Parsed: ${sceneData.objects.length} objects, ${sceneData.lightSources.length} lights`;

        // Show warnings but still render
        if (warnings.length > 0) {
            showError(`Rendered with ${warnings.length} warning(s)`, null, warnings);
        }

        const forceBackend = selectBackend.value === 'auto' ? null : selectBackend.value;
        const aaSamples = parseInt(selectAA.value) || 1;
        await renderManager.render(
            sceneData, width, height, forceBackend, aaSamples,
            (progress) => {
                progressBar.style.width = `${Math.round(progress * 100)}%`;
            },
            (msg) => {
                statusText.textContent = msg;
            }
        );

        progressBar.style.width = '100%';
    } catch (e) {
        showError('Render Error', e.message, warnings);
        statusText.textContent = `Error: ${e.message}`;
        console.error(e);
    } finally {
        console.warn = origWarn;
        btnRender.disabled = false;
        btnStop.disabled = true;
    }
}

function stopRender() {
    renderManager?.stop();
    statusText.textContent = 'Stopped';
    btnRender.disabled = false;
    btnStop.disabled = true;
}

function saveImage() {
    const dataURL = renderManager?.getImageDataURL();
    if (!dataURL) {
        statusText.textContent = 'Nothing to save — render first';
        return;
    }

    const now = new Date();
    const ts = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') + '_' +
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0') +
        String(now.getSeconds()).padStart(2, '0');

    const link = document.createElement('a');
    link.download = `${ts}.png`;
    link.href = dataURL;
    link.click();
}

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        startRender();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveImage();
    }
});

init();
