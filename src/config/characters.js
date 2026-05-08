/**
 * characters.js
 * Maps FEN piece codes to Nintendo-inspired character data for each faction.
 */

export const FACTIONS = {
  mario: {
    name: 'Team Mario',
    color: 'White',
    emoji: '🍄',
    theme: {
      primary:   '#e52b2b',
      secondary: '#f5a623',
    },
    pieces: {
      K: { name: 'Mario',       emoji: '👨‍🔧', description: 'King of the Mushroom Kingdom' },
      Q: { name: 'Peach',       emoji: '👸',   description: 'Princess of the Mushroom Kingdom' },
      R: { name: 'Donkey Kong', emoji: '🦍',   description: 'Mighty guardian of the board' },
      B: { name: 'Luigi',       emoji: '🧤',   description: 'The Green Machine' },
      N: { name: 'Yoshi',       emoji: '🦖',   description: 'Swift and nimble rider' },
      P: { name: 'Toad',        emoji: '🍄',   description: 'Brave little pawn' },
    },
  },
  kirby: {
    name: 'Team Kirby',
    color: 'Black',
    emoji: '🐧',
    theme: {
      primary:   '#7b5ef8',
      secondary: '#38d9f5',
    },
    pieces: {
      k: { name: 'King Dedede', emoji: '🐧',   description: 'Self-proclaimed king of Dream Land' },
      q: { name: 'Dark Matter', emoji: '👁️',   description: 'Mysterious and powerful queen' },
      r: { name: 'Bowser',      emoji: '🐢',   description: 'The Koopa King' },
      b: { name: 'Magolor',     emoji: '🧙',   description: 'The magical bishop' },
      n: { name: 'Meta Knight', emoji: '⚔️',   description: 'Masked knight of the board' },
      p: { name: 'Waddle Dee',  emoji: '⭐️',  description: 'Loyal foot soldier' },
    },
  },
};

/**
 * Returns character data for a given piece FEN code and faction.
 */
export function getCharacter(pieceCode) {
  for (const faction of Object.values(FACTIONS)) {
    if (faction.pieces[pieceCode]) {
      return { ...faction.pieces[pieceCode], faction };
    }
  }
  return null;
}
