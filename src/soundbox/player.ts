/* -*- mode: javascript; tab-width: 4; indent-tabs-mode: nil; -*-
*
* Copyright (c) 2011-2013 Marcus Geelnard
*
* This software is provided 'as-is', without any express or implied
* warranty. In no event will the authors be held liable for any damages
* arising from the use of this software.
*
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
*
* 1. The origin of this software must not be misrepresented; you must not
*    claim that you wrote the original software. If you use this software
*    in a product, an acknowledgment in the product documentation would be
*    appreciated but is not required.
*
* 2. Altered source versions must be plainly marked as such, and must not be
*    misrepresented as being the original software.
*
* 3. This notice may not be removed or altered from any source
*    distribution.
*
*
* 2019 Altered by Frederik Petersen for js13k game Tanky McTankface
* - Typescript
*
*/

// tslint:disable: no-bitwise
export class CPlayer {

    // ------------------------------------------
    // Private members
    // ------------------------------------------

    // Array of oscillator functions
    private oscillators = [
        this.osc_sin,
        this.osc_square,
        this.osc_saw,
        this.osc_tri,
    ];

    // Private variables set up by init()
    private song: any;

    private lastRow: number;

    private currentCol: number;

    private numWords: number;

    private mixBuf: Int32Array;

    // ------------------------------------------
    // Initialization
    // ------------------------------------------

    public constructor(song: any) {
        // Define the song
        this.song = song;

        // Init iteration state variables
        this.lastRow = song.endPattern;
        this.currentCol = 0;

        // Prepare song info
        this.numWords = song.rowLen * song.patternLen * (this.lastRow + 1) * 2;

        // Create work buffer (initially cleared)
        this.mixBuf = new Int32Array(this.numWords);
    }

    // ------------------------------------------
    // Public methods
    // ------------------------------------------

    // Generate audio data for a single track
    public generate() {

        // Put performance critical items in local variables
        const chnBuf = new Int32Array(this.numWords);
        const instr: any = this.song.songData[this.currentCol];
        const rowLen: number = this.song.rowLen;
        const patternLen: number = this.song.patternLen;

        // Clear effect state
        let low = 0;
        let band = 0;
        let high = 0;
        let lsample = 0;
        let filterActive = false;

        // Clear note cache.
        let noteCache = [];

        // Patterns
        for (let p = 0; p <= this.lastRow; ++p) {
            const cp = instr.p[p];

            // Pattern rows
            for (let row = 0; row < patternLen; ++row) {
                // Execute effect command.
                const cmdNo = cp ? instr.c[cp - 1].f[row] : 0;
                if (cmdNo) {
                    instr.i[cmdNo - 1] = instr.c[cp - 1].f[row + patternLen] || 0;

                    // Clear the note cache since the instrument has changed.
                    if (cmdNo < 16) {
                        noteCache = [];
                    }
                }

                // Put performance critical instrument properties in local variables
                const oscLFO = this.oscillators[instr.i[15]];
                const lfoAmt = instr.i[16] / 512;
                const lfoFreq = Math.pow(2, instr.i[17] - 9) / rowLen;
                const fxLFO = instr.i[18];
                const fxFilter = instr.i[19];
                const fxFreq = instr.i[20] * 43.23529 * 3.141592 / 44100;
                const q = 1 - instr.i[21] / 255;
                const dist = instr.i[22] * 1e-5;
                const drive = instr.i[23] / 32;
                const panAmt = instr.i[24] / 512;
                const panFreq = 6.283184 * Math.pow(2, instr.i[25] - 9) / rowLen;
                const dlyAmt = instr.i[26] / 255;
                const dly = instr.i[27] * rowLen & ~1;  // Must be an even number

                // Calculate start sample number for this row in the pattern
                const rowStartSample = (p * patternLen + row) * rowLen;

                // Generate notes for this pattern row
                for (let col = 0; col < 4; ++col) {
                    const n = cp ? instr.c[cp - 1].n[row + col * patternLen] : 0;
                    if (n) {
                        if (!noteCache[n]) {
                            noteCache[n] = this.createNote(instr.i, n, rowLen);
                        }

                        // Copy note from the note cache
                        const noteBuf = noteCache[n];
                        for (let j = 0, i = rowStartSample * 2; j < noteBuf.length; j++ , i += 2) {
                            chnBuf[i] += noteBuf[j];
                        }
                    }
                }

                // Perform effects for this pattern row
                for (let j = 0; j < rowLen; j++) {
                    // Dry mono-sample
                    const k = (rowStartSample + j) * 2;
                    let rsample = chnBuf[k];

                    // We only do effects if we have some sound input
                    if (rsample || filterActive) {
                        // State variable filter
                        let f = fxFreq;
                        if (fxLFO) {
                            f *= oscLFO(lfoFreq * k) * lfoAmt + 0.5;
                        }
                        f = 1.5 * Math.sin(f);
                        low += f * band;
                        high = q * (rsample - band) - low;
                        band += f * high;
                        rsample = fxFilter === 3 ? band : fxFilter === 1 ? high : low;

                        // Distortion
                        if (dist) {
                            rsample *= dist;
                            rsample = rsample < 1 ? rsample > -1 ? this.osc_sin(rsample * .25) : -1 : 1;
                            rsample /= dist;
                        }

                        // Drive
                        rsample *= drive;

                        // Is the filter active (i.e. still audiable)?
                        filterActive = rsample * rsample > 1e-5;

                        // Panning
                        const t = Math.sin(panFreq * k) * panAmt + 0.5;
                        lsample = rsample * (1 - t);
                        rsample *= t;
                    } else {
                        lsample = 0;
                    }

                    // Delay is always done, since it does not need sound input
                    if (k >= dly) {
                        // Left channel = left + right[-p] * t
                        lsample += chnBuf[k - dly + 1] * dlyAmt;

                        // Right channel = right + left[-p] * t
                        rsample += chnBuf[k - dly] * dlyAmt;
                    }

                    // Store in stereo channel buffer (needed for the delay effect)
                    chnBuf[k] = lsample | 0;
                    chnBuf[k + 1] = rsample | 0;

                    // ...and add to stereo mix buffer
                    this.mixBuf[k] += lsample | 0;
                    this.mixBuf[k + 1] += rsample | 0;
                }
            }
        }

        // Next iteration. Return progress (1.0 == done!).
        this.currentCol++;
        return this.currentCol / this.song.numChannels;
    }

    // Create a WAVE formatted Uint8Array from the generated audio data
    public createWave() {
        // Create WAVE header
        const headerLen = 44;
        const l1 = headerLen + this.numWords * 2 - 8;
        const l2 = l1 - 36;
        const wave = new Uint8Array(headerLen + this.numWords * 2);
        wave.set(
            [82, 73, 70, 70,
                l1 & 255, (l1 >> 8) & 255, (l1 >> 16) & 255, (l1 >> 24) & 255,
                87, 65, 86, 69, 102, 109, 116, 32, 16, 0, 0, 0, 1, 0, 2, 0,
                68, 172, 0, 0, 16, 177, 2, 0, 4, 0, 16, 0, 100, 97, 116, 97,
                l2 & 255, (l2 >> 8) & 255, (l2 >> 16) & 255, (l2 >> 24) & 255],
        );

        // Append actual wave data
        for (let i = 0, idx = headerLen; i < this.numWords; ++i) {
            // Note: We clamp here
            let y = this.mixBuf[i];
            y = y < -32767 ? -32767 : (y > 32767 ? 32767 : y);
            wave[idx++] = y & 255;
            wave[idx++] = (y >> 8) & 255;
        }

        // Return the WAVE formatted typed array
        return wave;
    }

    // Get n samples of wave data at time t [s]. Wave data in range [-2,2].
    public getData(t: number, n: number) {
        const i = 2 * Math.floor(t * 44100);
        const d = new Array(n);
        for (let j = 0; j < 2 * n; j += 1) {
            const k = i + j;
            d[j] = t > 0 && k < this.mixBuf.length ? this.mixBuf[k] / 32768 : 0;
        }
        return d;
    }

    // ------------------------------------------
    // Private methods
    // ------------------------------------------

    // Oscillators
    private osc_sin(value: number) {
        return Math.sin(value * 6.283184);
    }

    private osc_saw(value: number) {
        return 2 * (value % 1) - 1;
    }

    private osc_square(value: number) {
        return (value % 1) < 0.5 ? 1 : -1;
    }

    private osc_tri(value: number) {
        const v2 = (value % 1) * 4;
        if (v2 < 2) {
            return v2 - 1;
        }
        return 3 - v2;
    }

    private getnotefreq(n: number) {
        // 174.61.. / 44100 = 0.003959503758 (F3)
        return 0.003959503758 * Math.pow(2, (n - 128) / 12);
    }

    private createNote(instri: number[], n: number, rowLen: number) {
        const osc1 = this.oscillators[instri[0]];
        const o1vol = instri[1];
        const o1xenv = instri[3];
        const osc2 = this.oscillators[instri[4]];
        const o2vol = instri[5];
        const o2xenv = instri[8];
        const noiseVol = instri[9];
        const attack = instri[10] * instri[10] * 4;
        const sustain = instri[11] * instri[11] * 4;
        const release = instri[12] * instri[12] * 4;
        const releaseInv = 1 / release;
        let arp = instri[13];
        const arpInterval = rowLen * Math.pow(2, 2 - instri[14]);

        const noteBuf = new Int32Array(attack + sustain + release);

        // Re-trig oscillators
        let c1 = 0;
        let c2 = 0;

        let o1t = 0;
        let o2t = 0;

        // Generate one note (attack + sustain + release)
        for (let j = 0, j2 = 0; j < attack + sustain + release; j++ , j2++) {
            if (j2 >= 0) {
                // Switch arpeggio note.
                arp = (arp >> 8) | ((arp & 255) << 4);
                j2 -= arpInterval;

                // Calculate note frequencies for the oscillators
                o1t = this.getnotefreq(n + (arp & 15) + instri[2] - 128);
                o2t = this.getnotefreq(n + (arp & 15) + instri[6] - 128) * (1 + 0.0008 * instri[7]);
            }

            // Envelope
            let e = 1;
            if (j < attack) {
                e = j / attack;
            } else if (j >= attack + sustain) {
                e -= (j - attack - sustain) * releaseInv;
            }

            // Oscillator 1
            let t = o1t;
            if (o1xenv) {
                t *= e * e;
            }
            c1 += t;
            let rsample = osc1(c1) * o1vol;

            // Oscillator 2
            t = o2t;
            if (o2xenv) {
                t *= e * e;
            }
            c2 += t;
            rsample += osc2(c2) * o2vol;

            // Noise oscillator
            if (noiseVol) {
                rsample += (2 * Math.random() - 1) * noiseVol;
            }

            // Add to (mono) channel buffer
            noteBuf[j] = (80 * rsample * e) | 0;
        }

        return noteBuf;
    }

}
