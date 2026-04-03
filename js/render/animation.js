// POV-Ray Web - Animation support
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)

export class AnimationController {
    constructor() {
        this.initialFrame = 1;
        this.finalFrame = 1;
        this.initialClock = 0;
        this.finalClock = 1;
        this.currentFrame = 1;
        this.playing = false;
        this.fps = 15;
        this._onFrame = null;
        this._timer = null;
    }

    configure(config) {
        if (config.initialFrame !== undefined) this.initialFrame = config.initialFrame;
        if (config.finalFrame !== undefined) this.finalFrame = config.finalFrame;
        if (config.initialClock !== undefined) this.initialClock = config.initialClock;
        if (config.finalClock !== undefined) this.finalClock = config.finalClock;
        this.currentFrame = this.initialFrame;
    }

    get totalFrames() {
        return Math.max(1, this.finalFrame - this.initialFrame + 1);
    }

    get isAnimation() {
        return this.finalFrame > this.initialFrame;
    }

    clockForFrame(frame) {
        if (this.totalFrames <= 1) return this.initialClock;
        const t = (frame - this.initialFrame) / (this.finalFrame - this.initialFrame);
        return this.initialClock + t * (this.finalClock - this.initialClock);
    }

    get clock() {
        return this.clockForFrame(this.currentFrame);
    }

    get clockDelta() {
        if (this.totalFrames <= 1) return 0;
        return (this.finalClock - this.initialClock) / (this.finalFrame - this.initialFrame);
    }

    play(onFrame) {
        this._onFrame = onFrame;
        this.playing = true;
        this.currentFrame = this.initialFrame;
        this._tick();
    }

    stop() {
        this.playing = false;
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
    }

    async _tick() {
        if (!this.playing || this.currentFrame > this.finalFrame) {
            this.playing = false;
            return;
        }

        if (this._onFrame) {
            await this._onFrame(this.currentFrame, this.clock);
        }

        this.currentFrame++;
        if (this.currentFrame <= this.finalFrame) {
            this._timer = setTimeout(() => this._tick(), 1000 / this.fps);
        } else {
            this.playing = false;
        }
    }
}
