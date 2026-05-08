/**
 * AudioManager.js
 * ─────────────────────────────────────────────────────────────
 * Procedural 8-bit chiptune audio engine using the Web Audio API.
 * No external audio files required — all sounds are synthesized.
 *
 * Features:
 *  - Looping 8-bit background music (menu & in-game themes)
 *  - Unique character "signature" jingles played on selection
 *  - SFX for moves, captures, check, and game over
 *  - Master volume control
 */

export class AudioManager {
  constructor() {
    this._ctx       = null;
    this._masterGain = null;
    this._bgNodes   = [];
    this._bgTimer   = null;
    this._playing   = false;
    this._muted     = false;
    this._volume    = 0.35;
    this._initOnInteraction();
  }

  // ─── Init ─────────────────────────────────────────────────

  /** Lazy-init AudioContext on first user gesture (browser policy) */
  _initOnInteraction() {
    const resume = () => {
      if (!this._ctx) this._createContext();
      document.removeEventListener('click', resume);
      document.removeEventListener('keydown', resume);
    };
    document.addEventListener('click', resume);
    document.addEventListener('keydown', resume);
  }

  _createContext() {
    this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    this._masterGain = this._ctx.createGain();
    this._masterGain.gain.value = this._volume;
    this._masterGain.connect(this._ctx.destination);
  }

  // ─── Note Helpers ─────────────────────────────────────────

  /** Convert a MIDI note number to frequency (Hz) */
  _midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /**
   * Play a single oscillator note.
   * @param {number}  freq      - Frequency in Hz
   * @param {number}  startTime - AudioContext time to start
   * @param {number}  duration  - Note duration in seconds
   * @param {string}  type      - OscillatorType ('square','sawtooth','triangle','sine')
   * @param {number}  gain      - Volume (0–1)
   * @param {boolean} slide     - Portamento/glide effect
   */
  _playNote(freq, startTime, duration, type = 'square', gain = 0.18, slide = false) {
    if (!this._ctx) return null;
    const osc = this._ctx.createOscillator();
    const g   = this._ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (slide) {
      osc.frequency.linearRampToValueAtTime(freq * 1.05, startTime + duration);
    }

    // ADSR-lite envelope
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(gain, startTime + 0.01);
    g.gain.setValueAtTime(gain, startTime + duration * 0.7);
    g.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(g);
    g.connect(this._masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);

    return osc;
  }

  // ─── Background Music ─────────────────────────────────────

  /**
   * Note sequences for two themes.
   * Values are MIDI note numbers. -1 = rest.
   */
  _THEMES = {
    menu: {
      bpm: 140,
      melody: [64,67,71,74, 72,71,69,67, 66,65,64,62, 60,62,64,67,
               64,67,71,74, 72,74,76,77, 76,74,72,71, 69,67,66,64],
      bass:   [48,48,55,55, 53,53,50,50, 48,48,52,52, 55,55,55,55,
               48,48,55,55, 53,53,55,55, 52,52,50,50, 48,48,48,48],
    },
    game: {
      bpm: 120,
      melody: [60,64,67,72, 71,69,67,65, 64,67,69,72, 74,72,71,69,
               67,71,74,77, 76,74,72,71, 69,72,74,76, 77,76,74,72],
      bass:   [48,52,55,60, 58,57,55,53, 52,55,57,60, 62,60,58,57,
               55,59,62,65, 64,62,60,59, 57,60,62,64, 65,64,62,60],
    },
  };

  /** Start looping background music */
  playBackground(theme = 'menu') {
    if (this._playing) this.stopBackground();
    if (!this._ctx) {
      // Schedule after context is ready
      const wait = setInterval(() => {
        if (this._ctx) { clearInterval(wait); this._scheduleBackground(theme); }
      }, 100);
      return;
    }
    this._scheduleBackground(theme);
  }

  _scheduleBackground(theme = 'menu') {
    this._playing = true;
    const data    = this._THEMES[theme];
    const beatLen = 60 / data.bpm;
    const loopLen = data.melody.length * beatLen;
    let   loopStart = this._ctx.currentTime + 0.1;

    const scheduleLoop = (startAt) => {
      data.melody.forEach((midi, i) => {
        if (midi < 0) return;
        this._playNote(this._midiToFreq(midi), startAt + i * beatLen, beatLen * 0.88, 'square', 0.12);
      });
      data.bass.forEach((midi, i) => {
        if (midi < 0) return;
        this._playNote(this._midiToFreq(midi), startAt + i * beatLen, beatLen * 1.5, 'triangle', 0.10);
      });
      // Arpeggio layer
      data.melody.forEach((midi, i) => {
        if (midi < 0) return;
        const chord = [midi, midi + 4, midi + 7];
        chord.forEach((m, j) => {
          this._playNote(this._midiToFreq(m), startAt + i * beatLen + j * 0.04, beatLen * 0.3, 'square', 0.04);
        });
      });
    };

    scheduleLoop(loopStart);
    this._bgTimer = setInterval(() => {
      if (!this._playing) return;
      loopStart += loopLen;
      scheduleLoop(loopStart);
    }, (loopLen - 0.1) * 1000);
  }

  /** Stop background music */
  stopBackground() {
    this._playing = false;
    if (this._bgTimer) { clearInterval(this._bgTimer); this._bgTimer = null; }
  }

  // ─── Character Signature Sounds ───────────────────────────

  /**
   * Each character has a unique 4-note jingle played on hover/select.
   * Notes are MIDI numbers.
   */
  _CHARACTER_SOUNDS = {
    // Team Mario
    K: { notes: [67,71,74,79], type: 'square',   label: 'Mario'  },       // King – heroic fanfare
    Q: { notes: [72,76,79,84], type: 'triangle',  label: 'Peach'  },       // Queen – bright, high
    R: { notes: [48,50,55,48], type: 'sawtooth',  label: 'Donkey Kong' },  // Rook – heavy, low
    B: { notes: [64,67,71,67], type: 'square',    label: 'Luigi'  },       // Bishop – wobbly
    N: { notes: [62,65,69,65], type: 'square',    label: 'Yoshi'  },       // Knight – bouncy
    P: { notes: [60,62,64,60], type: 'triangle',  label: 'Toad'   },       // Pawn – short hop
    // Team Kirby
    k: { notes: [55,53,50,48], type: 'sawtooth',  label: 'King Dedede' },  // Black King – descending heavy
    q: { notes: [69,71,72,71], type: 'sine',      label: 'Dark Matter' },  // Black Queen – eerie sine
    r: { notes: [48,52,55,52], type: 'sawtooth',  label: 'Bowser'      },  // Black Rook – grinding
    b: { notes: [65,69,72,69], type: 'square',    label: 'Magolor'     },  // Black Bishop – magical
    n: { notes: [67,65,62,60], type: 'square',    label: 'Meta Knight' },  // Black Knight – quick descend
    p: { notes: [60,62,60,57], type: 'triangle',  label: 'Waddle Dee'  },  // Black Pawn – cute
  };

  /** Play a character's signature jingle */
  playCharacterSound(pieceCode) {
    if (!this._ctx || this._muted) return;
    const sound = this._CHARACTER_SOUNDS[pieceCode];
    if (!sound) return;
    const now     = this._ctx.currentTime;
    const beatLen = 0.10;
    sound.notes.forEach((midi, i) => {
      this._playNote(this._midiToFreq(midi), now + i * beatLen, beatLen * 0.85, sound.type, 0.22);
    });
  }

  // ─── Faction Select Sound ────────────────────────────────

  /** Ascending arpeggio for faction selection */
  playFactionSelect(faction = 'mario') {
    if (!this._ctx) return;
    const notes = faction === 'mario'
      ? [60, 64, 67, 72, 76]   // C-E-G-C-E  (bright major)
      : [57, 60, 63, 69, 72];  // A-C-Eb-A-C (dark minor)
    const now = this._ctx.currentTime;
    notes.forEach((midi, i) => {
      this._playNote(
        this._midiToFreq(midi),
        now + i * 0.08,
        0.18,
        faction === 'mario' ? 'square' : 'sawtooth',
        0.20
      );
    });
  }

  // ─── Game SFX ─────────────────────────────────────────────

  /** Short "tick" for a piece move */
  playMove() {
    if (!this._ctx || this._muted) return;
    const now = this._ctx.currentTime;
    this._playNote(880, now,        0.05, 'square', 0.15);
    this._playNote(660, now + 0.05, 0.05, 'square', 0.10);
  }

  /** Dramatic burst for a capture */
  playCapture() {
    if (!this._ctx || this._muted) return;
    const now = this._ctx.currentTime;
    [880, 740, 622, 440].forEach((f, i) => {
      this._playNote(f, now + i * 0.06, 0.09, 'sawtooth', 0.18);
    });
  }

  /** Alert jingle for check */
  playCheck() {
    if (!this._ctx || this._muted) return;
    const now = this._ctx.currentTime;
    [880, 880, 1100].forEach((f, i) => {
      this._playNote(f, now + i * 0.12, 0.10, 'square', 0.22);
    });
  }

  /** Victory fanfare for checkmate */
  playGameOver(winner = 'white') {
    if (!this._ctx || this._muted) return;
    const now   = this._ctx.currentTime;
    const notes = winner === 'white'
      ? [60, 64, 67, 72, 76, 79, 84]   // Ascending victory
      : [72, 69, 65, 62, 57, 53, 48];  // Descending defeat
    notes.forEach((midi, i) => {
      this._playNote(this._midiToFreq(midi), now + i * 0.14, 0.18, 'square', 0.22);
    });
  }

  // ─── Volume & Mute ───────────────────────────────────────

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
