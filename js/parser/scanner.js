// POV-Ray Web - Scanner: wraps tokenizer, resolves keywords and symbols
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

import { RAW_TOKEN } from './tokenizer.js';
import {
    RESERVED_WORDS, FLOAT_TOKEN, STRING_LITERAL_TOKEN, IDENTIFIER_TOKEN,
    END_OF_FILE_TOKEN, LEFT_ANGLE_TOKEN, RIGHT_ANGLE_TOKEN, LEFT_CURLY_TOKEN,
    RIGHT_CURLY_TOKEN, LEFT_PAREN_TOKEN, RIGHT_PAREN_TOKEN, LEFT_SQUARE_TOKEN,
    RIGHT_SQUARE_TOKEN, COMMA_TOKEN, PERIOD_TOKEN, SEMI_COLON_TOKEN,
    PLUS_TOKEN, DASH_TOKEN, STAR_TOKEN, SLASH_TOKEN, EQUALS_TOKEN,
    EXCLAMATION_TOKEN, AMPERSAND_TOKEN, BAR_TOKEN, HAT_TOKEN, COLON_TOKEN,
    QUESTION_TOKEN, PERCENT_TOKEN, AT_TOKEN, HASH_TOKEN, TILDE_TOKEN,
    REL_GE_TOKEN, REL_LE_TOKEN, REL_NE_TOKEN, BACK_SLASH_TOKEN,
    FLOAT_ID_TOKEN, VECTOR_ID_TOKEN, COLOUR_ID_TOKEN, STRING_ID_TOKEN,
    OBJECT_ID_TOKEN, TEXTURE_ID_TOKEN, PIGMENT_ID_TOKEN, NORMAL_ID_TOKEN,
    FINISH_ID_TOKEN, INTERIOR_ID_TOKEN, MEDIA_ID_TOKEN, CAMERA_ID_TOKEN,
    MATERIAL_ID_TOKEN, TRANSFORM_ID_TOKEN, ARRAY_ID_TOKEN, DICTIONARY_ID_TOKEN,
    MACRO_ID_TOKEN, FUNCT_ID_TOKEN, SPLINE_ID_TOKEN, FOG_ID_TOKEN,
    RAINBOW_ID_TOKEN, SKYSPHERE_ID_TOKEN, COLOUR_MAP_ID_TOKEN,
    PIGMENT_MAP_ID_TOKEN, NORMAL_MAP_ID_TOKEN, TEXTURE_MAP_ID_TOKEN,
    DENSITY_MAP_ID_TOKEN, SLOPE_MAP_ID_TOKEN
} from './reserved-words.js';
import { SYMBOL_TYPE } from './symbol-table.js';

const PUNCT_MAP = new Map([
    ['<', LEFT_ANGLE_TOKEN], ['>', RIGHT_ANGLE_TOKEN],
    ['{', LEFT_CURLY_TOKEN], ['}', RIGHT_CURLY_TOKEN],
    ['(', LEFT_PAREN_TOKEN], [')', RIGHT_PAREN_TOKEN],
    ['[', LEFT_SQUARE_TOKEN], [']', RIGHT_SQUARE_TOKEN],
    [',', COMMA_TOKEN], ['.', PERIOD_TOKEN], [';', SEMI_COLON_TOKEN],
    ['+', PLUS_TOKEN], ['-', DASH_TOKEN], ['*', STAR_TOKEN],
    ['/', SLASH_TOKEN], ['=', EQUALS_TOKEN], ['!', EXCLAMATION_TOKEN],
    ['&', AMPERSAND_TOKEN], ['|', BAR_TOKEN], ['^', HAT_TOKEN],
    [':', COLON_TOKEN], ['?', QUESTION_TOKEN], ['%', PERCENT_TOKEN],
    ['@', AT_TOKEN], ['#', HASH_TOKEN], ['~', TILDE_TOKEN],
    ['\\', BACK_SLASH_TOKEN],
    ['>=', REL_GE_TOKEN], ['<=', REL_LE_TOKEN], ['!=', REL_NE_TOKEN],
]);

const SYMBOL_TYPE_TO_TOKEN = new Map([
    [SYMBOL_TYPE.FLOAT, FLOAT_ID_TOKEN],
    [SYMBOL_TYPE.VECTOR, VECTOR_ID_TOKEN],
    [SYMBOL_TYPE.COLOUR, COLOUR_ID_TOKEN],
    [SYMBOL_TYPE.STRING, STRING_ID_TOKEN],
    [SYMBOL_TYPE.OBJECT, OBJECT_ID_TOKEN],
    [SYMBOL_TYPE.TEXTURE, TEXTURE_ID_TOKEN],
    [SYMBOL_TYPE.PIGMENT, PIGMENT_ID_TOKEN],
    [SYMBOL_TYPE.NORMAL, NORMAL_ID_TOKEN],
    [SYMBOL_TYPE.FINISH, FINISH_ID_TOKEN],
    [SYMBOL_TYPE.INTERIOR, INTERIOR_ID_TOKEN],
    [SYMBOL_TYPE.MEDIA, MEDIA_ID_TOKEN],
    [SYMBOL_TYPE.CAMERA, CAMERA_ID_TOKEN],
    [SYMBOL_TYPE.MATERIAL, MATERIAL_ID_TOKEN],
    [SYMBOL_TYPE.TRANSFORM, TRANSFORM_ID_TOKEN],
    [SYMBOL_TYPE.ARRAY, ARRAY_ID_TOKEN],
    [SYMBOL_TYPE.DICTIONARY, DICTIONARY_ID_TOKEN],
    [SYMBOL_TYPE.MACRO, MACRO_ID_TOKEN],
    [SYMBOL_TYPE.FUNCTION, FUNCT_ID_TOKEN],
    [SYMBOL_TYPE.SPLINE, SPLINE_ID_TOKEN],
    [SYMBOL_TYPE.FOG, FOG_ID_TOKEN],
    [SYMBOL_TYPE.RAINBOW, RAINBOW_ID_TOKEN],
    [SYMBOL_TYPE.SKYSPHERE, SKYSPHERE_ID_TOKEN],
    [SYMBOL_TYPE.COLOUR_MAP, COLOUR_MAP_ID_TOKEN],
    [SYMBOL_TYPE.PIGMENT_MAP, PIGMENT_MAP_ID_TOKEN],
    [SYMBOL_TYPE.NORMAL_MAP, NORMAL_MAP_ID_TOKEN],
    [SYMBOL_TYPE.TEXTURE_MAP, TEXTURE_MAP_ID_TOKEN],
    [SYMBOL_TYPE.DENSITY_MAP, DENSITY_MAP_ID_TOKEN],
    [SYMBOL_TYPE.SLOPE_MAP, SLOPE_MAP_ID_TOKEN],
]);

export class Scanner {
    // Accepts either a Tokenizer instance or a flat raw token array
    constructor(tokenizerOrTokens, symbolTable) {
        this._symbolTable = symbolTable;
        this._putback = null;
        this._current = null;
        this._currentFile = '<scene>';
        this._currentLine = 1;

        if (Array.isArray(tokenizerOrTokens)) {
            // Flat token array from preprocessor (Pass 2 mode)
            this._tokens = tokenizerOrTokens;
            this._pos = 0;
            this._tokenizer = null;
            this._tokenQueue = null;
        } else {
            // Tokenizer instance (legacy single-pass mode)
            this._tokenizer = tokenizerOrTokens;
            this._tokens = null;
            this._tokenQueue = [];
        }
    }

    // Push tokens to front of queue (legacy mode only)
    pushTokens(tokens) {
        if (this._tokenQueue) {
            this._tokenQueue = tokens.concat(this._tokenQueue);
        }
    }

    _nextRaw() {
        // Flat array mode
        if (this._tokens) {
            while (this._pos < this._tokens.length) {
                const tok = this._tokens[this._pos++];
                // Handle source markers from preprocessor
                if (tok.type === 'SOURCE_MARKER') {
                    this._currentFile = tok.fileName;
                    this._currentLine = tok.line;
                    continue;
                }
                return tok;
            }
            return { type: RAW_TOKEN.EOF, value: null, line: 0, col: 0, fileName: this._currentFile };
        }

        // Legacy tokenizer mode
        if (this._tokenQueue && this._tokenQueue.length > 0) {
            return this._tokenQueue.shift();
        }
        return this._tokenizer.next();
    }

    getToken() {
        if (this._putback) {
            this._current = this._putback;
            this._putback = null;
            return this._current;
        }

        const raw = this._nextRaw();

        switch (raw.type) {
            case RAW_TOKEN.NUMBER:
                this._current = {
                    id: FLOAT_TOKEN, value: raw.value,
                    line: raw.line, col: raw.col, fileName: raw.fileName
                };
                break;

            case RAW_TOKEN.STRING:
                this._current = {
                    id: STRING_LITERAL_TOKEN, value: raw.value,
                    line: raw.line, col: raw.col, fileName: raw.fileName
                };
                break;

            case RAW_TOKEN.IDENTIFIER: {
                // Check reserved words first
                const tokenId = RESERVED_WORDS.get(raw.value);
                if (tokenId !== undefined) {
                    this._current = {
                        id: tokenId, value: raw.value,
                        line: raw.line, col: raw.col, fileName: raw.fileName
                    };
                } else {
                    // Check symbol table
                    const sym = this._symbolTable.lookup(raw.value);
                    if (sym) {
                        const symTokenId = SYMBOL_TYPE_TO_TOKEN.get(sym.type) || IDENTIFIER_TOKEN;
                        this._current = {
                            id: symTokenId, value: sym.value, name: raw.value,
                            line: raw.line, col: raw.col, fileName: raw.fileName
                        };
                    } else {
                        this._current = {
                            id: IDENTIFIER_TOKEN, value: raw.value,
                            line: raw.line, col: raw.col, fileName: raw.fileName
                        };
                    }
                }
                break;
            }

            case RAW_TOKEN.HASH_DIRECTIVE: {
                const tokenId = RESERVED_WORDS.get(raw.value);
                this._current = {
                    id: tokenId || IDENTIFIER_TOKEN, value: raw.value,
                    isDirective: true,
                    line: raw.line, col: raw.col, fileName: raw.fileName
                };
                break;
            }

            case RAW_TOKEN.PUNCT: {
                const tokenId = PUNCT_MAP.get(raw.value);
                this._current = {
                    id: tokenId || IDENTIFIER_TOKEN, value: raw.value,
                    line: raw.line, col: raw.col, fileName: raw.fileName
                };
                break;
            }

            case RAW_TOKEN.EOF:
                this._current = {
                    id: END_OF_FILE_TOKEN, value: null,
                    line: raw.line, col: raw.col, fileName: raw.fileName
                };
                break;
        }

        return this._current;
    }

    ungetToken() {
        this._putback = this._current;
    }

    currentToken() {
        return this._current;
    }

    peek() {
        const token = this.getToken();
        this.ungetToken();
        return token;
    }
}
