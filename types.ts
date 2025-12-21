export enum Suit {
  HEARTS = '♥',
  DIAMONDS = '♦',
  CLUBS = '♣',
  SPADES = '♠'
}

export interface Card {
  id: string;
  rank: string;
  value: number; // Baccarat value (0-9)
  suit: Suit;
}

export enum GamePhase {
  NATURAL_CHECK = 1,
  PLAYER_DRAW_CHECK = 2,
  BANKER_DRAW_CHECK = 3,
  FINAL_OUTCOME = 4
}

export enum DecisionOption {
  BANKER_WIN = 'BANKER WIN',
  PLAYER_WIN = 'PLAYER WIN',
  TIE = 'TIE',
  NO_NATURALS = 'NO NATURALS',
  DRAW = 'DRAW',
  STAND = 'STAND'
}

export type HandOutcome = 'P' | 'B' | 'T';

export interface GameState {
  playerHand: Card[];
  bankerHand: Card[];
  currentPhase: GamePhase;
  phaseComplete: boolean;
  history: HandOutcome[];
  score: {
    correct: number;
    incorrect: number;
    handsPlayed: number;
    peeks: number;
    streak: number;
  };
  feedback: {
    message: string;
    type: 'success' | 'error' | 'neutral' | null;
  };
}

export type CardStyle = 'classic' | 'modern';