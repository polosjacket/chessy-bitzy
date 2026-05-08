/**
 * GameEngine.js
 * Core chess logic wrapper using chess.js.
 * Handles state, validation, history, and AI moves.
 */

import { Chess } from 'chess.js';

export class GameEngine {
  constructor() {
    this.chess = new Chess();
    this.selectedSquare = null;
    this.gameMode = null; // '1p' or '2p'
    this.playerFaction = 'mario'; // 'mario' (white) or 'kirby' (black)
    this.listeners = {};
  }

  /** Start a new game */
  start(mode, playerFaction = 'mario') {
    this.chess = new Chess();
    this.gameMode = mode;
    this.playerFaction = playerFaction;
    this.selectedSquare = null;
    this._emit('gameStart', { mode, playerFaction });
    this._emit('boardUpdate', this.getState());
  }

  /** Get the full game state snapshot */
  getState() {
    return {
      board:     this.chess.board(),
      turn:      this.chess.turn(),         // 'w' or 'b'
      fen:       this.chess.fen(),
      pgn:       this.chess.pgn(),
      history:   this.chess.history({ verbose: true }),
      isCheck:   this.chess.isCheck(),
      isCheckmate: this.chess.isCheckmate(),
      isStalemate: this.chess.isStalemate(),
      isDraw:    this.chess.isDraw(),
      isGameOver: this.chess.isGameOver(),
    };
  }

  /** Get all valid moves for a given square */
  getValidMoves(square) {
    return this.chess.moves({ square, verbose: true });
  }

  /** Attempt to make a move. Returns the move object or null. */
  makeMove(from, to, promotion = 'q') {
    try {
      const move = this.chess.move({ from, to, promotion });
      if (move) {
        this._emit('moveMade', move);
        this._emit('boardUpdate', this.getState());

        if (this.chess.isGameOver()) {
          this._emit('gameOver', this.getState());
        } else if (this.gameMode === '1p' && this.chess.turn() === 'b') {
          // Trigger AI after a short delay
          setTimeout(() => this._makeAIMove(), 500);
        }
      }
      return move;
    } catch {
      return null;
    }
  }

  /** Undo the last move (or last two moves in 1P mode) */
  undoMove() {
    this.chess.undo();
    if (this.gameMode === '1p') this.chess.undo(); // also undo AI's move
    this._emit('boardUpdate', this.getState());
  }

  /** Simple AI: pick a random legal move */
  _makeAIMove() {
    const moves = this.chess.moves({ verbose: true });
    if (!moves.length) return;
    const move = moves[Math.floor(Math.random() * moves.length)];
    this.makeMove(move.from, move.to, move.promotion || 'q');
  }

  /** Register an event listener */
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return this;
  }

  /** Internal emitter */
  _emit(event, data) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  }
}
