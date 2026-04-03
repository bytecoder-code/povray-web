// POV-Ray Web - .povz bundle loader
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
//
// .povz format: a ZIP file containing a main .pov scene and any local
// include files (.inc, images, data) it depends on. The main .pov file
// is the first .pov found at the root of the archive.

export async function loadPovz(arrayBuffer) {
    const entries = await unzip(arrayBuffer);

    // Find the main .pov file (first .pov at root level)
    let mainPov = null;
    const includes = new Map(); // text files (.pov, .inc)
    const assets = new Map();   // binary files (images, .obj, .df3, etc.)

    const textExts = ['.pov', '.inc', '.ini', '.txt'];
    const isText = (name) => textExts.some(e => name.toLowerCase().endsWith(e));

    for (const [name, data] of entries) {
        if (!mainPov && name.endsWith('.pov') && !name.includes('/')) {
            mainPov = { name, text: new TextDecoder().decode(data) };
        } else if (isText(name)) {
            includes.set(name, new TextDecoder().decode(data));
        } else {
            assets.set(name, data);
        }
    }

    // Fallback: if no root-level .pov, take the first .pov anywhere
    if (!mainPov) {
        for (const [name, data] of entries) {
            if (name.endsWith('.pov')) {
                mainPov = { name, text: new TextDecoder().decode(data) };
                break;
            }
        }
    }

    if (!mainPov) {
        throw new Error('No .pov file found in .povz archive');
    }

    return { mainPov, includes, assets };
}

// Minimal ZIP reader (no external dependencies)
// Supports stored (0) and deflated (8) entries
async function unzip(buffer) {
    const view = new DataView(buffer);
    const entries = new Map();

    let offset = 0;
    while (offset < buffer.byteLength - 4) {
        const sig = view.getUint32(offset, true);
        if (sig !== 0x04034b50) break; // Not a local file header

        const method = view.getUint16(offset + 8, true);
        const compSize = view.getUint32(offset + 18, true);
        const uncompSize = view.getUint32(offset + 22, true);
        const nameLen = view.getUint16(offset + 26, true);
        const extraLen = view.getUint16(offset + 28, true);

        const nameBytes = new Uint8Array(buffer, offset + 30, nameLen);
        const name = new TextDecoder().decode(nameBytes);

        const dataStart = offset + 30 + nameLen + extraLen;
        const compData = new Uint8Array(buffer, dataStart, compSize);

        let fileData;
        if (method === 0) {
            // Stored
            fileData = compData;
        } else if (method === 8) {
            // Deflated — use DecompressionStream
            const ds = new DecompressionStream('deflate-raw');
            const writer = ds.writable.getWriter();
            const reader = ds.readable.getReader();

            writer.write(compData);
            writer.close();

            const chunks = [];
            let totalLen = 0;
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                totalLen += value.length;
            }
            fileData = new Uint8Array(totalLen);
            let pos = 0;
            for (const chunk of chunks) {
                fileData.set(chunk, pos);
                pos += chunk.length;
            }
        } else {
            // Unsupported compression
            fileData = compData;
        }

        // Skip directories
        if (!name.endsWith('/')) {
            entries.set(name, fileData);
        }

        offset = dataStart + compSize;
    }

    return entries;
}

// Create a .povz file from a main .pov and its dependencies
export async function createPovz(mainPovName, mainPovText, includes) {
    // Simple ZIP writer (store method only for simplicity)
    const files = [[mainPovName, new TextEncoder().encode(mainPovText)]];
    for (const [name, data] of includes) {
        const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
        files.push([name, bytes]);
    }

    // Calculate total size
    let totalSize = 0;
    const headers = [];
    for (const [name, data] of files) {
        const nameBytes = new TextEncoder().encode(name);
        totalSize += 30 + nameBytes.length + data.length; // local header + data
        totalSize += 46 + nameBytes.length; // central directory entry
        headers.push({ name, nameBytes, data });
    }
    totalSize += 22; // end of central directory

    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    let localOffset = 0;
    let centralOffset = 0;
    const centralEntries = [];

    // Write local file headers + data
    for (const { nameBytes, data } of headers) {
        const entryOffset = localOffset;
        view.setUint32(localOffset, 0x04034b50, true); // local file header sig
        view.setUint16(localOffset + 4, 20, true); // version needed
        view.setUint16(localOffset + 8, 0, true); // compression: stored
        view.setUint32(localOffset + 18, data.length, true); // compressed size
        view.setUint32(localOffset + 22, data.length, true); // uncompressed size
        view.setUint16(localOffset + 26, nameBytes.length, true); // name length
        bytes.set(nameBytes, localOffset + 30);
        bytes.set(data, localOffset + 30 + nameBytes.length);
        localOffset += 30 + nameBytes.length + data.length;
        centralEntries.push({ nameBytes, data, entryOffset });
    }

    // Write central directory
    const centralStart = localOffset;
    for (const { nameBytes, data, entryOffset } of centralEntries) {
        view.setUint32(localOffset, 0x02014b50, true); // central dir sig
        view.setUint16(localOffset + 4, 20, true); // version made by
        view.setUint16(localOffset + 6, 20, true); // version needed
        view.setUint16(localOffset + 10, 0, true); // compression: stored
        view.setUint32(localOffset + 20, data.length, true); // compressed size
        view.setUint32(localOffset + 24, data.length, true); // uncompressed size
        view.setUint16(localOffset + 28, nameBytes.length, true); // name length
        view.setUint32(localOffset + 42, entryOffset, true); // local header offset
        bytes.set(nameBytes, localOffset + 46);
        localOffset += 46 + nameBytes.length;
    }

    // End of central directory
    view.setUint32(localOffset, 0x06054b50, true);
    view.setUint16(localOffset + 8, files.length, true); // entries on disk
    view.setUint16(localOffset + 10, files.length, true); // total entries
    view.setUint32(localOffset + 12, localOffset - centralStart, true); // central dir size
    view.setUint32(localOffset + 16, centralStart, true); // central dir offset

    return buffer;
}
