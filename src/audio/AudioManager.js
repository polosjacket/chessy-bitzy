/**
 * AudioManager.js
 * ─────────────────────────────────────────────────────────────
 * Procedural 8-bit / ambient chiptune audio engine using the Web Audio API.
 * No external audio files required — all sounds are synthesized.
 *
 * Features:
 *  - Looping slow, ambient chiptune background music (menu & in-game themes)
 *  - Unique character "signature" jingles played on selection
 *  - SFX for moves, captures, check, and game over
 *  - Auto-queues music to start on first user interaction (browser policy)
 *  - Master volume & mute control
 */

export class AudioManager {
  constructor() {
    this._ctx        = null;
    this._masterGain = null;
    this._bgTimer    = null;
    this._playing    = false;
    this._muted      = false;
    this._volume     = 0.30;
    this._pendingTheme = null; // queued theme awaiting AudioContext
    this._initOnInteraction();
  }

  // ─── Init ─────────────────────────────────────────────────

  _initOnInteraction() {
    const resume = () => {
      if (!this._ctx) {
        this._createContext();
        // Play any queued background theme
        if (this._pendingTheme) {
          this._scheduleBackground(this._pendingTheme);
          this._pendingTheme = null;
        }
      } else if (this._ctx.state === 'suspended') {
        this._ctx.resume();
      }
      document.removeEventListener('click',   resume);
      document.removeEventListener('keydown', resume);
    };
    document.addEventListener('click',   resume);
    document.addEventListener('keydown', resume);
  }

  _createContext() {
    this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    this._masterGain = this._ctx.createGain();
    this._masterGain.gain.value = this._volume;
    this._masterGain.connect(this._ctx.destination);
  }

  // ─── Note Helpers ─────────────────────────────────────────

  _midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /**
   * Play a single note.
   * @param {number}  freq      - Frequency in Hz
   * @param {number}  startTime - AudioContext time to start
   * @param {number}  duration  - Note duration in seconds
   * @param {string}  type      - OscillatorType
   * @param {number}  gain      - Volume (0–1)
   */
  _playNote(freq, startTime, duration, type = 'triangle', gain = 0.15) {
    if (!this._ctx) return null;
    const osc = this._ctx.createOscillator();
    const g   = this._ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    // Soft ADSR envelope for ambient feel
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(gain, startTime + 0.08);          // slow attack
    g.gain.setValueAtTime(gain, startTime + duration * 0.6);
    g.gain.linearRampToValueAtTime(0, startTime + duration + 0.12);  // slow release

    osc.connect(g);
    g.connect(this._masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.2);
    return osc;
  }

  // ─── Background Music ─────────────────────────────────────

  /**
   * Slow, ambient chiptune themes.
   * Notes are MIDI numbers. -1 = rest.
   * BPM 72 (menu) / 65 (game) — slow and atmospheric.
   */
  _THEMES = {
    menu: {
      bpm: 72,  // gentle waltz-like pace
      // Pentatonic melody — floaty, dreamy
      melody: [
        60, -1, 64, -1,  67, -1, 72, -1,
        69, -1, 67, -1,  64, -1, 60, -1,
        62, -1, 65, -1,  69, -1, 65, -1,
        62, -1, 60, -1,  57, -1, 60, -1,
      ],
      // Low, slow bass pulses
      bass: [
        36, -1, 36, -1,  43, -1, 43, -1,
        41, -1, 41, -1,  38, -1, 38, -1,
        36, -1, 36, -1,  40, -1, 40, -1,
        43, -1, 43, -1,  43, -1, 43, -1,
      ],
      // Soft pad chords (slow arpeggio)
      pad: [
        48, 52, 55, -1,  48, 52, 55, -1,
        55, 59, 62, -1,  55, 59, 62, -1,
        53, 57, 60, -1,  53, 57, 60, -1,
        50, 53, 57, -1,  50, 53, 57, -1,
      ],
    },
    game: {
      bpm: 65,  // slow strategic tension
      // Minor key melody — focused, cinematic
      melody: [
        60, -1, 63, -1,  67, -1, 65, -1,
        63, -1, 60, -1,  58, -1, 60, -1,
        62, -1, 65, -1,  68, -1, 65, -1,
        63, -1, 60, -1,  57, -1, 60, -1,
      ],
      bass: [
        36, -1, 36, -1,  40, -1, 40, -1,
        39, -1, 39, -1,  36, -1, 36, -1,
        38, -1, 38, -1,  41, -1, 41, -1,
        39, -1, 39, -1,  36, -1, 36, -1,
      ],
      pad: [
        48, 51, 55, -1,  48, 51, 55, -1,
        52, 55, 58, -1,  52, 55, 58, -1,
        51, 55, 58, -1,  51, 55, 58, -1,
        48, 51, 55, -1,  48, 51, 55, -1,
      ],
    },
  };

  playBackground(theme = 'menu') {
    if (this._playing) this.stopBackground();
    if (!this._ctx) {
      // Queue for first user interaction
      this._pendingTheme = theme;
      return;
    }
    this._scheduleBackground(theme);
  }

  _scheduleBackground(theme = 'menu') {
    this._playing  = true;
    const data     = this._THEMES[theme];
    const beatLen  = 60 / data.bpm;
    const loopLen  = data.melody.length * beatLen;
    let   loopStart = this._ctx.currentTime + 0.3;

    const scheduleLoop = (startAt) => {
      // Melody — triangle wave (soft, flute-like)
      data.melody.forEach((midi, i) => {
        if (midi < 0) return;
        this._playNote(
          this._midiToFreq(midi),
          startAt + i * beatLen,
          beatLen * 1.6,
          'triangle',
          0.10,
        );
      });
      // Bass — sine wave (deep, smooth)
      data.bass.forEach((midi, i) => {
        if (midi < 0) return;
        this._playNote(
          this._midiToFreq(midi),
          startAt + i * beatLen,
          beatLen * 2.0,
          'sine',
          0.12,
        );
      });
      // Pad/chords — sine wave (airy, soft)
      data.pad.forEach((midi, i) => {
        if (midi < 0) return;
        this._playNote(
          this._midiToFreq(midi),
          startAt + i * beatLen,
          beatLen * 1.8,
          'sine',
          0.06,
        );
      });
    };

    scheduleLoop(loopStart);

    // Reschedule the loop just before it ends for seamless repeat
    this._bgTimer = setInterval(() => {
      if (!this._playing) return;
      loopStart += loopLen;
      scheduleLoop(loopStart);
    }, (loopLen - 0.3) * 1000);
  }

  stopBackground() {
    this._playing    = false;
    this._pendingTheme = null;
    if (this._bgTimer) { clearInterval(this._bgTimer); this._bgTimer = null; }
  }

  // ─── Character Signature Sounds ───────────────────────────

  _CHARACTER_SOUNDS = {
    // Team Mario
    K: { notes: [67, 71, 74, 79], type: 'triangle',  label: 'Mario'       },
    Q: { notes: [72, 76, 79, 84], type: 'sine',       label: 'Peach'       },
    R: { notes: [48, 50, 55, 48], type: 'square',     label: 'Donkey Kong' },
    B: { notes: [64, 67, 71, 67], type: 'triangle',   label: 'Luigi'       },
    N: { notes: [62, 65, 69, 65], type: 'triangle',   label: 'Yoshi'       },
    P: { notes: [60, 62, 64, 60], type: 'sine',       label: 'Toad'        },
    // Team Kirby
    k: { notes: [55, 53, 50, 48], type: 'sawtooth',   label: 'King Dedede' },
    q: { notes: [69, 71, 72, 71], type: 'sine',       label: 'Dark Matter' },
    r: { notes: [48, 52, 55, 52], type: 'square',     label: 'Bowser'      },
    b: { notes: [65, 69, 72, 69], type: 'triangle',   label: 'Magolor'     },
    n: { notes: [67, 65, 62, 60], type: 'triangle',   label: 'Meta Knight' },
    p: { notes: [60, 62, 60, 57], type: 'sine',       label: 'Waddle Dee'  },
  };

  playCharacterSound(pieceCode) {
    if (!this._ctx || this._muted) return;
    const sound = this._CHARACTER_SOUNDS[pieceCode];
    if (!sound) return;
    const now     = this._ctx.currentTime;
    const beatLen = 0.13; // slightly slower jingle
    sound.notes.forEach((midi, i) => {
      this._playNote(this._midiToFreq(midi), now + i * beatLen, beatLen * 1.2, sound.type, 0.20);
    });
  }

  // ─── Faction Select Sound ─────────────────────────────────

  playFactionSelect(faction = 'mario') {
    if (!this._ctx) return;
    const notes = faction === 'mario'
      ? [60, 64, 67, 72, 76]    // C-E-G-C-E  bright major
      : [57, 60, 63, 69, 72];   // A-C-Eb-A-C dark minor
    const now = this._ctx.currentTime;
    notes.forEach((midi, i) => {
      this._playNote(
        this._midiToFreq(midi),
        now + i * 0.12,
        0.28,
        faction === 'mario' ? 'triangle' : 'sawtooth',
        0.18,
      );
    });
  }

  // ─── Game SFX ─────────────────────────────────────────────

  playMove() {
    if (!this._ctx || this._muted) return;
    const now = this._ctx.currentTime;
    this._playNote(880, now,        0.07, 'sine',   0.12);
    this._playNote(660, now + 0.07, 0.07, 'sine',   0.08);
  }

  playCapture() {
    if (!this._ctx || this._muted) return;
    const now = this._ctx.currentTime;
    [880, 740, 622, 440].forEach((f, i) => {
      this._playNote(f, now + i * 0.07, 0.10, 'sawtooth', 0.15);
    });
  }

  playCheck() {
    if (!this._ctx || this._muted) return;
    const now = this._ctx.currentTime;
    [880, 880, 1100].forEach((f, i) => {
      this._playNote(f, now + i * 0.14, 0.12, 'triangle', 0.18);
    });
  }

  playGameOver(winner = 'white') {
    if (!this._ctx || this._muted) return;
    const now   = this._ctx.currentTime;
    const notes = winner === 'white'
      ? [60, 64, 67, 72, 76, 79, 84]
      : [72, 69, 65, 62, 57, 53, 48];
    notes.forEach((midi, i) => {
      this._playNote(this._midiToFreq(midi), now + i * 0.18, 0.25, 'triangle', 0.20);
    });
  }

  // ─── Volume & Mute ────────────────────────────────────────

  setVolume(vol) {
    this._volume = Math.max(0, Math.min(1, vol));
    if (this._masterGain) this._masterGain.gain.value = this._muted ? 0 : this._volume;
  }

  toggleMute() {
    this._muted = !this._muted;
    if (this._masterGain) {
      this._masterGain.gain.value = this._muted ? 0 : this._volume;
    }
    return this._muted;
  }
}

export const audio = new AudioManager();
