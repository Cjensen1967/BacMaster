import { Suit, Card } from './types';

export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const SUITS = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES];

// Generate a random card (infinite deck simulation)
export const drawCard = (): Card => {
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  
  let value = 0;
  if (['10', 'J', 'Q', 'K'].includes(rank)) {
    value = 0;
  } else if (rank === 'A') {
    value = 1;
  } else {
    value = parseInt(rank);
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    rank,
    suit,
    value
  };
};

export const calculateHandValue = (hand: Card[]): number => {
  const total = hand.reduce((acc, card) => acc + card.value, 0);
  return total % 10;
};

// --- LOGIC ENGINE ---

export const isNatural = (playerHand: Card[], bankerHand: Card[]): boolean => {
  const pVal = calculateHandValue(playerHand);
  const bVal = calculateHandValue(bankerHand);
  return pVal >= 8 || bVal >= 8;
};

export const shouldPlayerDraw = (playerHand: Card[]): boolean => {
  // Player draws on 0-5, Stands on 6-9
  // Note: Natural check happens before this, so 8-9 are handled there technically,
  // but standard rule is 0-5 draw.
  const val = calculateHandValue(playerHand);
  return val <= 5;
};

export const shouldBankerDraw = (bankerHand: Card[], playerHand: Card[]): boolean => {
  const bVal = calculateHandValue(bankerHand);
  
  // If Player didn't draw a 3rd card
  if (playerHand.length === 2) {
    return bVal <= 5; // Banker draws 0-5, stands 6-9
  }

  // If Player DID draw a 3rd card
  const player3rdCardValue = playerHand[2].value;

  if (bVal <= 2) return true; // Always draw 0-2
  if (bVal === 3) return player3rdCardValue !== 8; // Draw unless P's 3rd is 8
  if (bVal === 4) return [2, 3, 4, 5, 6, 7].includes(player3rdCardValue);
  if (bVal === 5) return [4, 5, 6, 7].includes(player3rdCardValue);
  if (bVal === 6) return [6, 7].includes(player3rdCardValue);
  
  return false; // Stand on 7 (8/9 handled by natural check earlier)
};

export const getWinner = (playerHand: Card[], bankerHand: Card[]): 'PLAYER WIN' | 'BANKER WIN' | 'TIE' => {
  const pVal = calculateHandValue(playerHand);
  const bVal = calculateHandValue(bankerHand);
  if (pVal > bVal) return 'PLAYER WIN';
  if (bVal > pVal) return 'BANKER WIN';
  return 'TIE';
};