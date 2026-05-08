/**
 * HUD.js
 * Manages all DOM-based UI elements (turn indicator, move list, status).
 */

export class HUD {
  constructor() {
    this.turnIndicator = document.getElementById('turn-indicator');
    this.gameStatus    = document.getElementById('game-status');
    this.moveList      = document.getElementById('move-list');
    this.playerWhite   = document.getElementById('player-white');
    this.playerBlack   = document.getElementById('player-black');
    this._moveCount    = 0;
  }

  /**
   * Update turn display based on chess turn ('w' or 'b').
   */
  setTurn(turn) {
    const isWhite = turn === 'w';
    this.turnIndicator.textContent = isWhite ? "White's Turn 🍄" : "Black's Turn 🐧";
    this.playerWhite.classList.toggle('active-turn', isWhite);
    this.playerBlack.classList.toggle('active-turn', !isWhite);
  }

  /**
   * Display a status message (e.g. Check!, Checkmate, etc.)
   */
  setStatus(message, type = 'info') {
    this.gameStatus.textContent = message;
    this.gameStatus.style.color = type === 'danger' ? '#e8445a'
                                : type === 'warn'   ? '#f5a623'
                                : '#38d9f5';
  }

  /**
   * Append a move to the move history panel.
   */
  addMove(move) {
    this._moveCount++;
    const item = document.createElement('div');
    item.className = 'move-item';

    const num  = document.createElement('span');
    num.className = 'move-num';
    num.textContent = this._moveCount;

    const san  = document.createElement('span');
    san.textContent = move.san;

    item.appendChild(num);
    item.appendChild(san);
    this.moveList.appendChild(item);
    this.moveList.scrollTop = this.moveList.scrollHeight;
  }

  /**
   * Reset the HUD to initial state.
   */
  reset() {
    this._moveCount = 0;
    this.moveList.innerHTML = '';
    this.gameStatus.textContent = '';
    this.setTurn('w');
  }

  /**
   * Update player panel labels based on faction config.
   */
  setFactions(whiteFaction, blackFaction) {
    const wName   = this.playerWhite.querySelector('.player-name');
    const wAvatar = this.playerWhite.querySelector('.player-avatar');
    const bName   = this.playerBlack.querySelector('.player-name');
    const bAvatar = this.playerBlack.querySelector('.player-avatar');
    if (wName)   wName.textContent   = whiteFaction.name;
    if (wAvatar) wAvatar.textContent = whiteFaction.emoji;
    if (bName)   bName.textContent   = blackFaction.name;
    if (bAvatar) bAvatar.textContent = blackFaction.emoji;
  }
}
