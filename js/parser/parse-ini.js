// POV-Ray Web - .ini file parser for render configuration
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

export function parseIni(text) {
    const config = {
        width: 640,
        height: 480,
        inputFileName: null,
        outputFileName: null,
        antialias: false,
        antialiasThreshold: 0.3,
        antialiasDepth: 2,
        samplingMethod: 1,
        quality: 9,
        initialFrame: 1,
        finalFrame: 1,
        initialClock: 0,
        finalClock: 1,
        subsetStartFrame: 1,
        subsetEndFrame: null,
        libraryPath: [],
        display: true,
        verbose: false,
        pauseWhenDone: false,
        boundingThreshold: 25,
        jitter: false,
        jitterAmount: 1.0,
    };

    const lines = text.split('\n');
    let currentSection = '';

    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith(';') || line.startsWith('#')) continue;

        // Section headers [Section]
        if (line.startsWith('[') && line.includes(']')) {
            currentSection = line.slice(1, line.indexOf(']')).trim();
            continue;
        }

        // Key=Value or Key Value or +Key/-Key
        if (line.startsWith('+') || line.startsWith('-')) {
            const flag = line.startsWith('+');
            const key = line.slice(1).trim().toLowerCase();
            switch (key) {
                case 'a': config.antialias = flag; break;
                case 'd': config.display = flag; break;
                case 'v': config.verbose = flag; break;
                case 'p': config.pauseWhenDone = flag; break;
                case 'j': config.jitter = flag; break;
            }
            continue;
        }

        const eqIdx = line.indexOf('=');
        if (eqIdx < 0) continue;

        const key = line.slice(0, eqIdx).trim().toLowerCase().replace(/[\s_]/g, '');
        const value = line.slice(eqIdx + 1).trim();

        switch (key) {
            case 'width': case 'w': config.width = parseInt(value) || 640; break;
            case 'height': case 'h': config.height = parseInt(value) || 480; break;
            case 'inputfilename': case 'input': config.inputFileName = value; break;
            case 'outputfilename': case 'output': config.outputFileName = value; break;
            case 'antialias': config.antialias = value.toLowerCase() === 'on' || value === 'true'; break;
            case 'antialiasthreshold': config.antialiasThreshold = parseFloat(value); break;
            case 'antialiasdepth': config.antialiasDepth = parseInt(value); break;
            case 'samplingmethod': config.samplingMethod = parseInt(value); break;
            case 'quality': case 'q': config.quality = parseInt(value); break;
            case 'initialframe': config.initialFrame = parseInt(value); break;
            case 'finalframe': config.finalFrame = parseInt(value); break;
            case 'initialclock': config.initialClock = parseFloat(value); break;
            case 'finalclock': config.finalClock = parseFloat(value); break;
            case 'subsetstartframe': config.subsetStartFrame = parseInt(value); break;
            case 'subsetendframe': config.subsetEndFrame = parseInt(value); break;
            case 'librarypath': config.libraryPath.push(value); break;
            case 'boundingthreshold': config.boundingThreshold = parseInt(value); break;
            case 'jitteramount': config.jitterAmount = parseFloat(value); break;
        }
    }

    return config;
}
