# 📜 Implementation Plan: Chessy Bitzy

This document is the **living technical roadmap** for Chessy Bitzy. It is always kept in sync with `idea.md` and `changelog.md`.

---

## ✅ Phase 1: Project Setup & Core Logic
**Status: COMPLETE**

- [x] **1.1 Initialize Project:**
    - Created `package.json` with Vite, chess.js, Three.js, GSAP, Socket.io, Express, concurrently.
    - Created `vite.config.js` with Socket.io proxy to the Node.js backend.
- [x] **1.2 Chess Engine Integration:**
    - Created `src/logic/GameEngine.js` wrapping chess.js.
    - Event-driven API: `boardUpdate`, `moveMade`, `gameOver`, `gameStart`.
    - Random-move AI for 1-player mode.
- [x] **1.3 Server Setup:**
    - Created `server/index.js` (Express + Socket.io) for 2-player room management.

---

## ✅ Phase 2: 3D Board Rendering
**Status: COMPLETE**

- [x] **2.1 Three.js Boilerplate:**
    - Created `src/render/SceneManager.js` — Scene, PerspectiveCamera, WebGLRenderer.
    - 3 light types: AmbientLight (blue), DirectionalLight (white, shadows), 2x PointLight (accent rim).
    - OrbitControls with damping, polar angle limit, zoom limits.
- [x] **2.2 The Chessboard:**
    - Created `src/render/Board3D.js` — 8x8 BoxGeometry grid with algebraic square names.
    - Board base slab with border color.
- [x] **2.3 Raycasting & Selection:**
    - Created `src/render/InputHandler.js` — NDC mouse → raycaster → square name.
    - Selection (orange), valid moves (purple), last move (cyan) highlighting.

---

## ✅ Phase 3: Character Pieces & Emoji Sprites
**Status: COMPLETE**

- [x] **3.1 Character Configuration:**
    - Created `src/config/characters.js` — full FACTIONS data for Team Mario & Team Kirby.
    - 12 unique Nintendo-character-to-piece mappings with name, emoji, description.
- [x] **3.2 Emoji Sprite Rendering:**
    - Canvas-based emoji sprites with faction glow (orange/purple radial gradient).
    - `THREE.CanvasTexture` + `THREE.SpriteMaterial` (depthTest: false).
    - Sprites updated on every `boardUpdate` event.
- [x] **3.3 Pick & Place Mechanics:**
    - Piece "picking" on click with 1.2x scale up and elevation to y=1.0.
    - Real-time mouse tracking via 3D plane intersection.
    - Snap-back on invalid moves or cancellation.
    - Fixed chess.js rank array inversion (board[0] is rank 8).

---

## ✅ Phase 4: Audio System (8-bit Chiptune)
**Status: COMPLETE**

- [x] **4.1 AudioManager:**
    - Created `src/audio/AudioManager.js` — fully procedural, no external files.
    - Lazy AudioContext init on first user interaction (browser autoplay policy).
    - Signal chain: `OscillatorNode → GainNode (ADSR) → masterGain → destination`.
- [x] **4.2 Background Music:**
    - Menu theme: 140 BPM, 32-note melody + bass + arpeggio layers.
    - Game theme: 120 BPM, different harmonic progression.
    - Loops seamlessly using `setInterval` rescheduling.
- [x] **4.3 Character Sounds:**
    - 12 unique 4-note MIDI jingles (one per chess piece type).
    - Plays on piece selection click.
- [x] **4.4 Faction Sounds:**
    - Major arpeggio (happy) for Team Mario.
    - Minor arpeggio (ominous) for Team Kirby.
    - Plays on faction hover and click.
- [x] **4.5 Game SFX:**
    - Move: 2-note tick.
    - Capture: 4-note descending sawtooth burst.
    - Check: 3-note alert.
    - Checkmate: 7-note victory/defeat fanfare.
- [x] **4.6 Controls:**
    - Press `M` to toggle mute globally.
    - `setVolume(0–1)` API available.

---

## ✅ Phase 5: Tooltip System
**Status: COMPLETE**

- [x] **5.1 Global Tooltip Engine:**
    - Single `#global-tooltip` div injected into DOM by `initTooltips()`.
    - Event delegation via `mouseover`/`mousemove`/`mouseout` on `document`.
    - Follows cursor via `position: fixed` + `mousemove` coordinates.
    - Glassmorphic style: dark background, purple border, backdrop blur.
- [x] **5.2 Menu Button Tooltips:**
    - `data-tooltip` on 1P, 2P, and Start buttons with usage descriptions.
- [x] **5.3 Character Card Tooltips:**
    - Each faction card shows all 6 characters with emoji, name, and description.
- [x] **5.4 HUD Button Tooltips:**
    - Flip (🔄), Undo (↩), Menu (🏠) buttons all have informative tooltips.
- [x] **5.5 Player Panel Tooltips:**
    - Hovering the white/black player panels shows the full character roster.
- [x] **5.6 3D Piece Tooltips:**
    - 3D raycast hover detection on board squares and pieces.
    - Dynamic identification of characters and chess roles (e.g., "Meta Knight (Knight)").
    - Metadata display including character emoji, name, and role description.

---

## ✅ Phase 6: Documentation & Repository Setup
**Status: COMPLETE**

- [x] **6.1 Source Code Documentation:**
    - Created `docs/SOURCE_CODE.md` — module-level docs, method tables, algorithms, data flows.
- [x] **6.2 How-To Guide:**
    - Created `docs/HOWTO.md` — player guide + developer guide with learning path.
- [x] **6.3 Git Repository:**
    - Created `.gitignore` — covers Node.js, Vite, IDE, OS, and security files.
- [x] **6.4 Changelog:**
    - `changelog.md` updated after every session.

---

## 🔲 Phase 7: AI Upgrade (Minimax)
**Status: PLANNED**

- [ ] **7.1 Minimax with Alpha-Beta Pruning:**
    - Implement in `src/logic/AIPlayer.js` (new file, separate from engine).
    - Target depth: 3 (fast) or 4 (stronger).
- [ ] **7.2 Board Evaluation Function:**
    - Material scoring: `{ p:1, n:3, b:3.25, r:5, q:9, k:1000 }`.
    - Positional bonus tables (piece-square tables).
- [ ] **7.3 Difficulty Selection:**
    - Add a slider on the main menu (Easy/Medium/Hard mapped to Minimax depth 1/2/4).
- [ ] **7.4 Worker Thread:**
    - Move AI computation to a Web Worker to avoid blocking the main thread.

---

## 🔲 Phase 8: Online Multiplayer
**Status: PLANNED**

- [ ] **8.1 Room Code UI:**
    - Input field on the menu to enter/generate a room code.
- [ ] **8.2 Socket.io Client Integration:**
    - Connect `socket.io-client` in `main.js` for 2P online mode.
    - Handle `assignColor`, `opponentMove`, `playerCount`, `roomFull` events.
- [ ] **8.3 Opponent Move Application:**
    - When `opponentMove` arrives, call `engine.makeMove()` directly.
- [ ] **8.4 Reconnection Handling:**
    - Store FEN in room state; reconnecting player gets current board position.

---

## 🔲 Phase 9: 3D GLTF Character Models
**Status: PLANNED**

- [ ] **9.1 Asset Pipeline:**
    - Source or create low-poly GLTF models for each character type.
    - Store in `public/models/`.
- [ ] **9.2 ModelLoader:**
    - Create `src/render/ModelLoader.js` using `GLTFLoader`.
    - Cache loaded models to avoid duplicate network requests.
- [ ] **9.3 Piece Placement:**
    - Replace `THREE.Sprite` in `Board3D.js` with loaded models.
- [ ] **9.4 Move Animations:**
    - GSAP `gsap.to(piece.position)` for smooth glide between squares.
    - KO animation (scale to 0 + flash) for captured pieces.

---

## 🔲 Phase 10: Themed Arenas
**Status: PLANNED**

- [ ] **10.1 Arena Selector on Menu:**
    - Add a third row on the menu: "Choose Arena."
- [ ] **10.2 Arena Themes:**
    - Mushroom Kingdom: warm red/gold, mushroom props.
    - Dream Land: pink sky, star textures.
    - Bowser's Castle: dark lava, stone textures.
- [ ] **10.3 Dynamic Lighting per Arena:**
    - Each arena overrides SceneManager light colors and fog.
- [ ] **10.4 Skybox/Environment Maps:**
    - Use `THREE.CubeTextureLoader` or `PMREMGenerator` for reflective surfaces.

---
*Status: ✅ Phases 1–6 Complete | 🔲 Phases 7–10 Planned*
