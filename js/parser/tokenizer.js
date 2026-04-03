// POV-Ray Web - Character-level tokenizer
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// Produces raw tokens: NUMBER, STRING, IDENTIFIER, PUNCT, HASH_DIRECTIVE, EOF

export const RAW_TOKEN = {
    NUMBER: 'NUMBER',
    STRING: 'STRING',
    IDENTIFIER: 'IDENTIFIER',
    PUNCT: 'PUNCT',
    HASH_DIRECTIVE: 'HASH_DIRECTIVE',
    EOF: 'EOF'
};

export class Tokenizer {
    constructor(source, fileName = '<inline>') {
        this._sources = [{ text: source, pos: 0, line: 1, col: 1, fileName }];
        this._putback = null;
    }

    get _src() { return this._sources[this._sources.length - 1]; }
    get fileName() { return this._src.fileName; }
    get line() { return this._src.line; }
    get col() { return this._src.col; }

    pushSource(text, fileName) {
        this._sources.push({ text, pos: 0, line: 1, col: 1, fileName });
    }

    popSource() {
        if (this._sources.length <= 1) return false;
        this._sources.pop();
        return true;
    }

    unget(token) {
        this._putback = token;
    }

    _peek() {
        const s = this._src;
        return s.pos < s.text.length ? s.text[s.pos] : null;
    }

    _advance() {
        const s = this._src;
        const ch = s.text[s.pos++];
        if (ch === '\n') { s.line++; s.col = 1; }
        else { s.col++; }
        return ch;
    }

    _skipWhitespaceAndComments() {
        while (true) {
            const s = this._src;
            if (s.pos >= s.text.length) return;
            const ch = s.text[s.pos];

            // Whitespace
            if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
                this._advance();
                continue;
            }

            // Line comment //
            if (ch === '/' && s.pos + 1 < s.text.length && s.text[s.pos + 1] === '/') {
                while (s.pos < s.text.length && s.text[s.pos] !== '\n') this._advance();
                continue;
            }

            // Block comment /* */
            if (ch === '/' && s.pos + 1 < s.text.length && s.text[s.pos + 1] === '*') {
                this._advance(); this._advance(); // skip /*
                let depth = 1;
                while (s.pos < s.text.length && depth > 0) {
                    if (s.text[s.pos] === '/' && s.pos + 1 < s.text.length && s.text[s.pos + 1] === '*') {
                        depth++;
                        this._advance(); this._advance();
                    } else if (s.text[s.pos] === '*' && s.pos + 1 < s.text.length && s.text[s.pos + 1] === '/') {
                        depth--;
                        this._advance(); this._advance();
                    } else {
                        this._advance();
                    }
                }
                continue;
            }

            break;
        }
    }

    next() {
        if (this._putback) {
            const t = this._putback;
            this._putback = null;
            return t;
        }

        this._skipWhitespaceAndComments();

        const s = this._src;
        if (s.pos >= s.text.length) {
            // Try popping source stack
            if (this._sources.length > 1) {
                this._sources.pop();
                return this.next();
            }
            return { type: RAW_TOKEN.EOF, value: null, line: s.line, col: s.col, fileName: s.fileName };
        }

        const line = s.line, col = s.col, fileName = s.fileName;
        const ch = s.text[s.pos];

        // Number literal
        if (ch >= '0' && ch <= '9' || (ch === '.' && s.pos + 1 < s.text.length && s.text[s.pos + 1] >= '0' && s.text[s.pos + 1] <= '9')) {
            return this._readNumber(line, col, fileName);
        }

        // String literal
        if (ch === '"') {
            return this._readString(line, col, fileName);
        }

        // Hash directive
        if (ch === '#') {
            this._advance();
            this._skipWhitespaceAndComments();
            if (s.pos < s.text.length && this._isIdentStart(s.text[s.pos])) {
                const word = this._readWord();
                return { type: RAW_TOKEN.HASH_DIRECTIVE, value: word, line, col, fileName };
            }
            return { type: RAW_TOKEN.PUNCT, value: '#', line, col, fileName };
        }

        // Identifier or keyword
        if (this._isIdentStart(ch)) {
            const word = this._readWord();
            return { type: RAW_TOKEN.IDENTIFIER, value: word, line, col, fileName };
        }

        // Multi-char operators
        if (ch === '>' && s.pos + 1 < s.text.length && s.text[s.pos + 1] === '=') {
            this._advance(); this._advance();
            return { type: RAW_TOKEN.PUNCT, value: '>=', line, col, fileName };
        }
        if (ch === '<' && s.pos + 1 < s.text.length && s.text[s.pos + 1] === '=') {
            this._advance(); this._advance();
            return { type: RAW_TOKEN.PUNCT, value: '<=', line, col, fileName };
        }
        if (ch === '!' && s.pos + 1 < s.text.length && s.text[s.pos + 1] === '=') {
            this._advance(); this._advance();
            return { type: RAW_TOKEN.PUNCT, value: '!=', line, col, fileName };
        }

        // Single-char punctuation
        this._advance();
        return { type: RAW_TOKEN.PUNCT, value: ch, line, col, fileName };
    }

    _isIdentStart(ch) {
        return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_';
    }

    _isIdentChar(ch) {
        return this._isIdentStart(ch) || (ch >= '0' && ch <= '9');
    }

    _readWord() {
        const s = this._src;
        let word = '';
        while (s.pos < s.text.length && this._isIdentChar(s.text[s.pos])) {
            word += this._advance();
        }
        return word;
    }

    _readNumber(line, col, fileName) {
        const s = this._src;
        let num = '';
        // Integer part
        while (s.pos < s.text.length && s.text[s.pos] >= '0' && s.text[s.pos] <= '9') {
            num += this._advance();
        }
        // Decimal part
        if (s.pos < s.text.length && s.text[s.pos] === '.') {
            num += this._advance();
            while (s.pos < s.text.length && s.text[s.pos] >= '0' && s.text[s.pos] <= '9') {
                num += this._advance();
            }
        }
        // Exponent
        if (s.pos < s.text.length && (s.text[s.pos] === 'e' || s.text[s.pos] === 'E')) {
            num += this._advance();
            if (s.pos < s.text.length && (s.text[s.pos] === '+' || s.text[s.pos] === '-')) {
                num += this._advance();
            }
            while (s.pos < s.text.length && s.text[s.pos] >= '0' && s.text[s.pos] <= '9') {
                num += this._advance();
            }
        }
        return { type: RAW_TOKEN.NUMBER, value: parseFloat(num), line, col, fileName };
    }

    _readString(line, col, fileName) {
        const s = this._src;
        this._advance(); // skip opening "
        let str = '';
        while (s.pos < s.text.length && s.text[s.pos] !== '"') {
            if (s.text[s.pos] === '\\' && s.pos + 1 < s.text.length) {
                this._advance();
                const esc = this._advance();
                switch (esc) {
                    case 'n': str += '\n'; break;
                    case 't': str += '\t'; break;
                    case '\\': str += '\\'; break;
                    case '"': str += '"'; break;
                    default: str += '\\' + esc; break;
                }
            } else {
                str += this._advance();
            }
        }
        if (s.pos < s.text.length) this._advance(); // skip closing "
        return { type: RAW_TOKEN.STRING, value: str, line, col, fileName };
    }
}
