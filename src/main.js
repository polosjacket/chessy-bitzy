/**
 * main.js
 * Application entry point.
 * Wires together the menu, game engine, 3D renderer, HUD, and Audio.
 */

import './style.css';
import { GameEngine }    from './logic/GameEngine.js';
import { SceneManager }  from './render/SceneManager.js';
import { Board3D }       from './render/Board3D.js';
import { InputHandler }  from './render/InputHandler.js';
import { HUD }           from './ui/HUD.js';
import { FACTIONS }      from './config/characters.js';
import { audio }         from './audio/AudioManager.js';

// ─── State ────────────────────────────────────────────────
let engine        = null;
let sceneManager  = null;
let board3D       = null;
let inputHandler  = null;
let hud           = null;
let selectedSquare = null;
let chosenMode     = '1p';
let chosenFaction  = 'mario';

// ─── Screen helpers ───────────────────────────────────────
const showScreen = (id) => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'screen-menu') audio.playBackground('menu');
  if (id === 'screen-game') audio.playBackground('game');
};

// ─── Tooltip System ──────────────────────────────────────
function initTooltips() {
  // Create floating tooltip element
  const tip = document.createElement('div');
  tip.id = 'global-tooltip';
  tip.className = 'global-tooltip';
  document.body.appendChild(tip);

  let hideTimer = null;

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (!target) return;
    clearTimeout(hideTimer);
    tip.innerHTML = target.dataset.tooltip;
    tip.classList.add('visible');
    
    // Force immediate layout reflow so offsetWidth/Height are updated
    // before the next mousemove or before the browser paints.
    void tip.offsetHeight;
  });

  document.addEventListener('mousemove', (e) => {
    if (!tip.classList.contains('visible')) return;

    const tipRect = tip.getBoundingClientRect();
    const tipWidth = tipRect.width || tip.offsetWidth || 200;
    const tipHeight = tipRect.height || tip.offsetHeight || 100;
    
    let x = e.clientX + 20;
    let y = e.clientY + 20;
    
    // Flip horizontal if hitting right edge
    if (x + tipWidth > window.innerWidth - 20) {
      x = e.clientX - tipWidth - 20;
    }
    
    // Flip vertical if hitting bottom edge
    if (y + tipHeight > window.innerHeight - 20) {
      y = e.clientY - tipHeight - 20;
    }
    
    // Final safety bounds to keep tooltip fully on screen
    x = Math.max(10, Math.min(x, window.innerWidth - tipWidth - 10));
    y = Math.max(10, Math.min(y, window.innerHeight - tipHeight - 10));

    tip.style.left = `${x}px`;
    tip.style.top  = `${y}px`;
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (!target) return;
    hideTimer = setTimeout(() => tip.classList.remove('visible'), 120);
  });
}

// ─── Menu Logic ───────────────────────────────────────────
const btn1P        = document.getElementById('btn-1p');
const btn2P        = document.getElementById('btn-2p');
const btnStart     = document.getElementById('btn-start');
const factionCards = document.querySelectorAll('.faction-card');

// Add tooltips to mode buttons
btn1P.setAttribute('data-tooltip',
  '<strong>🎮 1 Player Mode</strong><br>You play against the computer AI.<br>Perfect for solo practice!');
btn2P.setAttribute('data-tooltip',
  '<strong>👥 2 Player Mode</strong><br>Two players take turns on this screen.<br>Challenge a friend locally!');
btnStart.setAttribute('data-tooltip',
  '<strong>✨ Start Game</strong><br>Begin a new match with your current settings.');

// Mode selection
btn1P.addEventListener('click', () => {
  chosenMode = '1p';
  btn1P.style.outline = '3px solid #f5a623';
  btn2P.style.outline = '';
  audio.playMove();
});
btn2P.addEventListener('click', () => {
  chosenMode = '2p';
  btn2P.style.outline = '3px solid #7b5ef8';
  btn1P.style.outline = '';
  audio.playMove();
});

// Faction cards: tooltip + sound on hover
factionCards.forEach(card => {
  const faction = FACTIONS[card.dataset.faction];
  if (faction) {
    const pieceList = Object.entries(faction.pieces)
      .map(([code, c]) => `<span>${c.emoji} <b>${c.name}</b> — ${c.description}</span>`)
      .join('<br>');
    card.setAttribute('data-tooltip',
      `<strong>${faction.emoji} ${faction.name}</strong><br><br>${pieceList}`);

    // Play faction sound on hover
    card.addEventListener('mouseenter', () => {
      audio.playFactionSelect(card.dataset.faction);
    });
  }

  card.addEventListener('click', () => {
    factionCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    chosenFaction = card.dataset.faction;
    audio.playFactionSelect(chosenFaction);
  });
});

// ─── HUD Button Tooltips ─────────────────────────────────
document.getElementById('btn-flip')?.setAttribute('data-tooltip',
  '<strong>🔄 Flip Board</strong><br>Rotate the camera 180° to view from the other side.');
document.getElementById('btn-undo')?.setAttribute('data-tooltip',
  '<strong>↩ Undo Move</strong><br>Take back your last move.<br>In 1P mode, also undoes the AI\'s response.');
document.getElementById('btn-menu')?.setAttribute('data-tooltip',
  '<strong>🏠 Main Menu</strong><br>Return to the main menu.<br>Current game progress will be lost.');

btnStart.addEventListener('click', () => startGame());

// ─── Game Init ────────────────────────────────────────────
function startGame() {
  showScreen('screen-game');
  engine = new GameEngine();

  if (!sceneManager) {
    const canvas = document.getElementById('game-canvas');
    sceneManager  = new SceneManager(canvas);
    board3D       = new Board3D(sceneManager.scene);
    inputHandler  = new InputHandler(
      sceneManager.camera,
      sceneManager.renderer,
      board3D,
      onSquareClick,
      onSquareHover
    );
  }

  hud = new HUD();
  const whiteFaction = FACTIONS[chosenFaction];
  const blackFaction = Object.values(FACTIONS).find(f => f !== whiteFaction);
  hud.setFactions(whiteFaction, blackFaction);
  hud.reset();

  // Attach piece tooltips to HUD panels
  _setPiecesTooltips(whiteFaction, blackFaction);

  engine
    .on('boardUpdate', (state) => {
      board3D.updatePieces(state.board, chosenFaction);
      hud.setTurn(state.turn);
      if (state.isCheckmate) {
        const winner = state.turn === 'w' ? 'black' : 'white';
        hud.setStatus(`🏆 Checkmate! ${winner === 'white' ? '🍄 White' : '🐧 Black'} wins!`, 'danger');
        audio.playGameOver(winner);
      } else if (state.isDraw || state.isStalemate) {
        hud.setStatus('🤝 Draw!', 'warn');
      } else if (state.isCheck) {
        hud.setStatus('⚠️ Check!', 'warn');
        audio.playCheck();
      } else {
        hud.setStatus('');
      }
    })
    .on('moveMade', (move) => {
      hud.addMove(move);
      board3D.clearHighlights();
      board3D.highlightSquares([move.from, move.to], 'lastmove');
      selectedSquare = null;
      if (move.captured) audio.playCapture();
      else               audio.playMove();
    });

  engine.start(chosenMode, chosenFaction);
}

// ─── Piece Tooltips on the Board ─────────────────────────
function _setPiecesTooltips(whiteFaction, blackFaction) {
  const whitePanel = document.getElementById('player-white');
  const blackPanel = document.getElementById('player-black');

  const buildPieceTip = (faction) =>
    Object.entries(faction.pieces)
      .map(([, c]) => `${c.emoji} <b>${c.name}</b> — ${c.description}`)
      .join('<br>');

  if (whitePanel) whitePanel.setAttribute('data-tooltip',
    `<strong>${whiteFaction.emoji} ${whiteFaction.name}</strong><br><br>${buildPieceTip(whiteFaction)}`);
  if (blackPanel) blackPanel.setAttribute('data-tooltip',
    `<strong>${blackFaction.emoji} ${blackFaction.name}</strong><br><br>${buildPieceTip(blackFaction)}`);
}

function onSquareClick(square) {
  if (!engine) return;
  const state = engine.getState();

  if (chosenMode === '1p' && state.turn === 'b') return;

  if (!selectedSquare) {
    const file  = square.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank  = 8 - parseInt(square[1]); // Fix chess.js rank array inversion
    const piece = state.board[rank]?.[file];

    const isPlayerTurn = (state.turn === 'w' && piece?.color === 'w') ||
                         (state.turn === 'b' && piece?.color === 'b');
    if (!piece || !isPlayerTurn) return;

    // Play character sound on selection
    const pieceCode = piece.color === 'w'
      ? piece.type.toUpperCase()
      : piece.type.toLowerCase();
    audio.playCharacterSound(pieceCode);

    board3D.pickPiece(square);

    selectedSquare = square;
    const validMoves = engine.getValidMoves(square).map(m => m.to);
    board3D.clearHighlights();
    board3D.highlightSquares([square], 'selected');
    board3D.highlightSquares(validMoves, 'valid');
  } else {
    if (square === selectedSquare) {
      selectedSquare = null;
      board3D.cancelPick();
      board3D.clearHighlights();
      return;
    }
    const moved = engine.makeMove(selectedSquare, square);
    if (!moved) {
      const state2 = engine.getState();
      const file   = square.charCodeAt(0) - 'a'.charCodeAt(0);
      const rank   = 8 - parseInt(square[1]);
      const piece  = state2.board[rank]?.[file];
      if (piece && piece.color === state2.turn) {
        const pieceCode = piece.color === 'w'
          ? piece.type.toUpperCase()
          : piece.type.toLowerCase();
        audio.playCharacterSound(pieceCode);
        
        board3D.cancelPick();
        board3D.pickPiece(square);
        
        selectedSquare = square;
        const validMoves = engine.getValidMoves(square).map(m => m.to);
        board3D.clearHighlights();
        board3D.highlightSquares([square], 'selected');
        board3D.highlightSquares(validMoves, 'valid');
      } else {
        board3D.cancelPick();
        selectedSquare = null;
        board3D.clearHighlights();
      }
    } else {
      // Valid move!
      board3D.dropPiece();
    }
  }
}

/** 
 * Handles square/piece hover in the 3D scene.
 * Updates the global DOM tooltip with character and chess role information.
 */
function onSquareHover(square, e) {
  const tip = document.getElementById('global-tooltip');
  if (!tip || !engine) return;

  if (!square) {
    // Only hide if the mouse isn't over a DOM element with a tooltip
    const overDomTip = e.target.closest('[data-tooltip]');
    if (!overDomTip) tip.classList.remove('visible');
    return;
  }

  const state = engine.getState();
  const file  = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank  = 8 - parseInt(square[1]);
  const piece = state.board[rank]?.[file];

  if (piece) {
    const whiteFaction = FACTIONS[chosenFaction];
    const blackFaction = Object.values(FACTIONS).find(f => f !== whiteFaction);
    const faction = piece.color === 'w' ? whiteFaction : blackFaction;
    
    // Get Nintendo character data from our config
    const pieceKey = piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
    const charData = faction.pieces[pieceKey];

    if (charData) {
      const typeMap = { p:'Pawn', n:'Knight', b:'Bishop', r:'Rook', q:'Queen', k:'King' };
      const roleName = typeMap[piece.type.toLowerCase()];
      
      // Update glassmorphic tooltip content
      tip.innerHTML = `
        <strong>${charData.emoji} ${charData.name}</strong> (${roleName})<br>
        <small style="opacity: 0.8">${charData.description}</small>
      `;
      tip.classList.add('visible');
    }
  } else {
    // Clear tooltip if hovering an empty square
    const overDomTip = e.target.closest('[data-tooltip]');
    if (!overDomTip) tip.classList.remove('visible');
  }
}

// ─── HUD Buttons ─────────────────────────────────────────
document.getElementById('btn-flip').addEventListener('click', () => {
  if (sceneManager) sceneManager.flipCamera();
  audio.playMove();
});
document.getElementById('btn-undo').addEventListener('click', () => {
  if (engine) {
    engine.undoMove();
    selectedSquare = null;
    board3D?.cancelPick();
    board3D?.clearHighlights();
    audio.playMove();
  }
});
document.getElementById('btn-menu').addEventListener('click', () => {
  showScreen('screen-menu');
  selectedSquare = null;
  board3D?.clearHighlights();
});

// ─── Volume & Interaction (keyboard shortcuts) ───────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'm' || e.key === 'M') {
    const muted = audio.toggleMute();
    console.log(`🔊 Audio ${muted ? 'muted' : 'unmuted'}`);
  }
  
  if (e.key === 'Escape') {
    if (selectedSquare) {
      board3D?.cancelPick();
      board3D?.clearHighlights();
      selectedSquare = null;
      audio.playMove(); // Play a small click to confirm cancel
    }
  }
});

// ─── Boot ─────────────────────────────────────────────────
// Queue the menu music; it will auto-start on the first user
// click or keypress (required by browser autoplay policy).
initTooltips();
audio.playBackground('menu'); // queued — fires on first interaction
