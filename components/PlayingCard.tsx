import React from 'react';
import { Card, CardStyle, Suit } from '../types';

interface PlayingCardProps {
  card?: Card;
  styleVariant: CardStyle;
  isPlaceholder?: boolean;
  label?: string;
  index?: number; // Used for staggered animation
}

const SuitIcon: React.FC<{ suit: Suit; className?: string }> = ({ suit, className }) => {
  const isRed = suit === Suit.HEARTS || suit === Suit.DIAMONDS;
  const colorClass = isRed ? "text-red-600" : "text-slate-900";
  
  const paths = {
    [Suit.HEARTS]: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
    [Suit.DIAMONDS]: "M12 2L2 12l10 10 10-10L12 2z",
    [Suit.CLUBS]: "M12,2c-0.8,0-1.5,0.7-1.5,1.5c0,0.4,0.2,0.8,0.5,1.1c-1.4,0.3-2.5,1.5-2.5,3c0,1,0.5,1.9,1.3,2.4 c-0.8,0.5-1.3,1.4-1.3,2.4c0,1.5,1.2,2.8,2.8,2.8c0.3,0,0.6-0.1,0.9-0.2c-0.3,1.3-0.8,2.5-1.7,3.5h3.1c-0.9-1-1.4-2.2-1.7-3.5 c0.3,0.1,0.6,0.2,0.9,0.2c1.6,0,2.8-1.3,2.8-2.8c0-1-0.5-1.9-1.3-2.4c0.8-0.5,1.3-1.4,1.3-2.4c0-1.5-1.1-2.7-2.5-3 c0.3-0.3,0.5-0.7,0.5-1.1C13.5,2.7,12.8,2,12,2z", 
    [Suit.SPADES]: "M12,2c-4.5,5.5-7,8.5-7,12c0,3.3,2.7,6,6,6c0.3,0,0.6,0,0.9-0.1c-0.3,1.4-0.8,2.6-1.9,3.6h4c-1.1-1-1.6-2.2-1.9-3.6 c0.3,0.1,0.6,0.1,0.9,0.1c3.3,0,6-2.7,6-6C19,10.5,16.5,7.5,12,2z"
  };

  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={`${colorClass} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={paths[suit]} />
    </svg>
  );
};

const CardBackPattern: React.FC = () => (
    <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="cardPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="2" fill="white" />
                    <path d="M0 10h20M10 0v20" stroke="white" strokeWidth="0.5" opacity="0.5" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cardPattern)" />
        </svg>
    </div>
);

const PlayingCard: React.FC<PlayingCardProps> = ({ card, styleVariant, isPlaceholder, label, index = 0 }) => {
  const sizeClasses = "w-20 h-28 xs:w-24 xs:h-36 md:w-28 md:h-40 lg:w-32 lg:h-48";
  
  if (isPlaceholder || !card) {
    return (
      <div className={`${sizeClasses} border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center transition-all duration-700 relative overflow-hidden group shadow-2xl`}>
        <CardBackPattern />
        <div className="absolute inset-2 border border-white/5 rounded-lg"></div>
        {label && <span className="text-white/10 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] z-10">{label}</span>}
      </div>
    );
  }

  const isRed = card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS;
  const isFaceCard = ['K', 'Q', 'J'].includes(card.rank);
  const textColor = isRed ? 'text-red-600' : 'text-slate-900';
  const animationDelay = `${index * 150}ms`;

  return (
    <div 
      className={`${sizeClasses} rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] select-none overflow-hidden animate-in fade-in slide-in-from-top-20 slide-in-from-left-10 duration-500 ease-out`}
      style={{ animationDelay }}
    >
      {styleVariant === 'modern' ? (
        <div className="h-full w-full bg-white relative ring-1 ring-black/5">
          <div className="absolute top-1.5 left-2 flex flex-col items-center leading-none">
            <span className={`text-xl sm:text-3xl font-bold tracking-tighter ${textColor}`}>{card.rank}</span>
            <SuitIcon suit={card.suit} className="w-3 h-3 sm:w-5 sm:h-5 mt-0.5" />
          </div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
             <SuitIcon suit={card.suit} className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 drop-shadow-sm z-10" />
          </div>

          <div className="absolute bottom-1.5 right-2 flex flex-col items-center leading-none transform rotate-180">
            <span className={`text-xl sm:text-3xl font-bold tracking-tighter ${textColor}`}>{card.rank}</span>
            <SuitIcon suit={card.suit} className="w-3 h-3 sm:w-5 sm:h-5 mt-0.5" />
          </div>
        </div>
      ) : (
        <div className="h-full w-full bg-[#fdfbf7] relative border border-gray-300">
           <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
           <div className="absolute inset-1 border border-black/5 rounded-lg pointer-events-none"></div>

          <div className="absolute top-1.5 left-2 flex flex-col items-center leading-none">
            <span className={`text-xl sm:text-3xl font-serif font-black ${textColor}`}>{card.rank}</span>
            <SuitIcon suit={card.suit} className="w-3 h-3 sm:w-5 sm:h-5 mt-0.5" />
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center">
                <SuitIcon suit={card.suit} className={`w-12 h-12 sm:w-20 sm:h-20 ${textColor}`} />
          </div>

          <div className="absolute bottom-1.5 right-2 flex flex-col items-center leading-none transform rotate-180">
            <span className={`text-xl sm:text-3xl font-serif font-black ${textColor}`}>{card.rank}</span>
            <SuitIcon suit={card.suit} className="w-3 h-3 sm:w-5 sm:h-5 mt-0.5" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayingCard;