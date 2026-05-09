# 📝 Changelog: Chessy Bitzy

All notable changes and commands executed during the development of **Chessy Bitzy** will be documented in this file. The latest changes are always at the top.

---

## [2026-05-09] - Bug Fix 4: Escape Key Cancellation

### ✨ New Feature: Keyboard Cancellation
- **Escape to Deselect:** Pressing the `Escape` key while carrying a piece now instantly cancels the selection and snaps the piece back to its original square.
- **Improved UX:** Provides a fast, tactile way to abort a move without needing to click the original square.

### 🐛 Bug Fix 5: Tooltip Visibility
- **Off-Screen Prevention:** Tooltips for buttons at the bottom of the screen (like the Start button) now intelligently flip to appear above the cursor.
- **Layout Reflow:** Added a manual reflow trigger (`void tip.offsetHeight`) to ensure the tooltip's dimensions are calculated correctly even on the very first frame of appearance.
- **Bounding Safety:** Added window boundary checks to keep the tooltip fully within the viewport at all times.

### ⌨️ Updated Shortcuts
| Key | Action |
|-----|--------|
| `M` | Toggle audio mute |
| `Esc` | Cancel piece selection / Snap piece back |
| Mouse Scroll | Zoom camera in/out |
| Click + Drag | Rotate camera |

### 📁 Files Modified
- `src/main.js` — Added `Escape` key listener to handle piece deselection.

---

## [2026-05-09] - Phase 5.5: 3D Piece Tooltips

### ✨ New Feature: 3D Piece Identification
- **Hover Tooltips:** Hovering over any piece on the 3D board (player or opponent) now displays a glassmorphic tooltip showing the character's name, emoji, their chess role (e.g., Knight, Bishop), and their description.
- **Improved Clarity:** This ensures players always know which Nintendo character corresponds to which chess piece during the heat of battle.
- **Smart Hiding:** The tooltip system intelligently balances 3D scene hovers with existing DOM element hovers to ensure a seamless UI experience.

### 📁 Files Modified
- `src/render/InputHandler.js` — Added `onSquareHover` callback support.
- `src/main.js` — Implemented `onSquareHover` logic to query engine state and update the global tooltip with character metadata.

### 🛠 Commands
- `snyk_code_scan`: ✅ 0 security issues found.

---

## [2026-05-09] - Bug Fix 3: Index Mapping & Drag-and-Drop Gameplay

### 🐛 Bugs Fixed
#### Bug: The "Unclickable Piece" bug was still occurring
- **Root Cause:** The `state.board` array from `chess.js` uses a reversed index format where `board[0]` represents Rank 8. `main.js` was doing `rank = parseInt(square[1]) - 1`. If the user clicked `a1` (a White piece), it would look up `board[0][0]`, which is `a8` (a Black piece). Because it thought the player clicked an enemy piece, it rejected the click.
- **Fix in `src/main.js`:** Corrected the rank lookup formula to `rank = 8 - parseInt(square[1])`. The engine now correctly identifies the piece you clicked on.

### ✨ New Feature: "Pick and Place" Gameplay
Overhauled the movement system to a satisfying drag-and-drop style:
- **Click to Pick:** Clicking a piece "picks it up", scaling it to `1.2x` and elevating it to `y=1.0`. The game highlights all valid destination squares.
- **Mouse Tracking:** The picked piece follows the mouse cursor smoothly in 3D space using a flat `THREE.Plane` raycast intersection.
- **Click to Place:** Clicking a valid square drops the piece onto the new square. Clicking an invalid square or the original square snaps the piece back to its original location (`cancelPick`).

### 📁 Files Modified
- `src/main.js` — Fixed coordinate array inversion bug; integrated `pickPiece`, `cancelPick`, and `dropPiece` logic.
- `src/render/Board3D.js` — Added piece tracking states (`pickedSprite`, `pickedSquareOrigin`), and disabled raycast interference for the currently held piece.
- `src/render/InputHandler.js` — Added mathematical Plane intersection to translate mouse coordinates directly to 3D space for the picked piece.

### 🛠 Commands
- `snyk_code_scan`: ✅ 0 security issues found.

---

## [2026-05-09] - Bug Fix 2: Hover Highlight & Direct Piece Clicking

### 🐛 Bugs Fixed
#### Bug: Still couldn't click pieces reliably
- **Root Cause:** The raycaster in `InputHandler.js` was only intersecting against the `squareMeshes` (the board squares) on the `y=0` plane. The 2D emoji sprites hover at `y=0.7`. Clicking the top half of a tall sprite would cause the raycast to either miss the square underneath it completely or hit the square *behind* it due to the camera angle, resulting in selecting the wrong square or nothing.
- **Fix:**
  - In `Board3D.js`, assigned `userData.square` directly to the piece sprites.
  - Added `getInteractiveMeshes()` to return both squares and sprites for the raycaster.
  - In `InputHandler.js`, the raycaster now hits the sprites directly, retrieving the correct square name regardless of camera angle.

#### Enhancement: Hover Highlight
- Added a hover effect to give immediate feedback when pointing at a valid, clickable square/piece.
- Implemented `_onMove` in `InputHandler.js` to trigger `setHover(square)` in `Board3D.js`.
- The hovered square slightly brightens (emissive `0x222222`), and the piece sprite scales up (`1.0` vs default `0.85`), making it extremely clear which piece you are targeting before you click.

### 📁 Files Modified
- `src/render/Board3D.js` — Added `userData.square` to sprites, `setHover()`, `_clearHover()`, and `getInteractiveMeshes()`.
- `src/render/InputHandler.js` — Changed raycast target to interactive meshes and added `_onMove` hover logic.

---

## [2026-05-09] - Bug Fixes: Click Interaction & Audio

### 🐛 Bugs Fixed

#### Bug 1: Chess pieces could not be clicked or moved
- **Root Cause:** The 3D board coordinate system was inverted. chess.js `board[0]` = rank 8, but the square meshes placed at `row=0` were named `a1–h1` (rank 1) and positioned at `z=-3.5` (the far/black side). Pieces from chess.js rank 8 were also placed at `z=-3.5`, so visually they appeared on rank 1 squares but were registered by the engine as rank 8 squares. Clicking a white pawn (near camera) returned a square like `e8` → engine rejected selection.
- **Fix in `src/render/Board3D.js`:**
  - Squares now placed at `z=(7-row)-3.5` so rank 1 (white's side) is at `z=+3.5` (near camera).
  - Piece sprites now placed at `z=rankIdx-3.5` with correct square name `FILE+(8-rankIdx)`.

#### Bug 2: Music did not auto-play when the game started
- **Root Cause:** Browser autoplay policy blocks `AudioContext` creation until a user gesture. The `AudioManager` was calling `playBackground()` before any interaction, with no queue mechanism.
- **Fix in `src/audio/AudioManager.js`:** Added `_pendingTheme` queue. When `playBackground()` is called before a click, it stores the theme. On first user click/keypress, `_initOnInteraction()` creates the AudioContext and immediately plays the queued theme.

#### Enhancement: Slower, more ambient music
- Reduced BPM: **72 BPM** (menu), **65 BPM** (game) — down from 140/120.
- Changed waveforms: **triangle** melody + **sine** bass/pad (replaces square/sawtooth).
- Added slow ADSR envelopes (80ms attack, 120ms release) for a softer, more atmospheric sound.
- Added a third "pad" layer with slow chord arpeggios for harmonic depth.
- Character jingles also slowed slightly (0.13s per note).

### 📁 Files Modified
- `src/render/Board3D.js` — Coordinate system fixed for squares and pieces.
- `src/audio/AudioManager.js` — Music queue, slower BPM, ambient waveforms.
- `src/main.js` — Clarified boot comment; audio queuing now self-contained.

### 🛠 Commands
- `snyk_code_scan`: ✅ 0 security issues found.

---

## [2026-05-09] - Phases 4–6: Audio, Tooltips, Docs & Repo Setup

### 🚀 Milestones
- **Phase 4: 8-bit Audio System** — Fully procedural chiptune using Web Audio API.
- **Phase 5: Tooltip System** — Global hover tooltips on all menu icons and characters.
- **Phase 6: Documentation & Repo** — SOURCE_CODE.md, HOWTO.md, .gitignore.

### 📁 Files Created / Updated
- `src/audio/AudioManager.js` — Procedural 8-bit chiptune engine (menu/game themes, 12 character jingles, faction arpeggios, game SFX, master volume/mute).
- `src/main.js` — Rewired to integrate AudioManager, global tooltip system, faction hover sounds, keyboard mute shortcut (`M`).
- `src/style.css` — Added `.global-tooltip` glassmorphic styles.
- `docs/SOURCE_CODE.md` — Full module-level technical documentation.
- `docs/HOWTO.md` — Player + developer guide with learning path.
- `.gitignore` — Comprehensive exclusions for Node.js, Vite, IDE, OS, security.
- `idea.md` — Updated with Audio System section, Documentation section, expanded Roadmap.
- `plan.md` — Fully rewritten to show ✅ completed and 🔲 planned phases.

### 🛠 Commands & Operations
- `snyk_code_scan`: ✅ 0 security issues found (rescanned after all changes).

---
*Status: ✅ Phases 1–6 Complete | 🔲 Phases 7–10 Planned*

---

## [2026-05-09] - Phase 1: Project Initialization & Core Build

### 🚀 Milestone: Full Phase 1-3 Implementation
- **Created `package.json`**: Configured with Vite, chess.js, Three.js, GSAP, Socket.io, Express, concurrently.
- **Created `vite.config.js`**: Vite setup with Socket.io proxy to Node.js backend.
- **Created `index.html`**: Full main menu + game screen HTML structure.
- **Created `src/style.css`**: Full CSS design system (dark theme, glassmorphism, animations).
- **Created `src/config/characters.js`**: Nintendo character-to-piece mapping for Team Mario & Team Kirby.
- **Created `src/logic/GameEngine.js`**: Chess engine wrapper (chess.js) with AI, events, undo.
- **Created `src/render/SceneManager.js`**: Three.js scene, camera, lights, OrbitControls.
- **Created `src/render/Board3D.js`**: 3D board grid with emoji piece sprites and square highlighting.
- **Created `src/render/InputHandler.js`**: Raycasting mouse input for square selection.
- **Created `src/ui/HUD.js`**: DOM-based HUD controller (turn, moves, status, factions).
- **Created `src/main.js`**: Application entry point wiring all modules together.
- **Created `server/index.js`**: Express + Socket.io server for 2-player online rooms.

### 🛠 Commands & Operations
- `npm install`: Installed 140 packages.
- `snyk_code_scan`: 0 security issues found.
- `npm run dev`: Dev server running at `http://localhost:5173`.

---
*Status: ✅ Phase 1-3 Complete. Game is playable locally.*

---

## [2026-05-09] - Initial Setup

### 🚀 Milestone: Project Conceptualization
- **Created `idea.md`**: Outlined the core concept, character mapping (Mario, Kirby, etc.), and technical stack.
- **Created `plan.md`**: Developed a 6-phase implementation roadmap including Three.js integration, AI, and Multiplayer.
- **Updated `idea.md`**: Added a Project Tracking section to officially include `changelog.md`.

### 🛠 Commands & Operations
- `list_dir`: Inspected the workspace directory `/Users/kids/Documents/GitHub/chessy-bitzy`.
- `write_to_file`: Created `idea.md`.
- `write_to_file`: Created `plan.md`.
- `multi_replace_file_content`: Updated `idea.md`.
- `write_to_file`: Created `changelog.md`.
