import React from 'react';
import { GamePhase, DecisionOption } from '../types';
import { Eye } from 'lucide-react';

interface DecisionControlsProps {
  phase: GamePhase;
  onDecision: (decision: DecisionOption) => void;
  onPeek: () => void;
  disabled: boolean;
}

const Button: React.FC<{ onClick: () => void; children: React.ReactNode; color?: 'blue' | 'red' | 'green' | 'yellow'; disabled: boolean }> = ({ 
  onClick, 
  children, 
  color = 'blue',
  disabled
}) => {
  // Adjusted: smaller padding/text for mobile
  const baseClasses = "flex-1 py-3 px-2 sm:py-4 sm:px-6 rounded-lg font-bold shadow-lg transition-transform active:scale-95 text-xs sm:text-sm md:text-base uppercase tracking-wider";
  
  const colors = {
    blue: "bg-blue-600 hover:bg-blue-500 text-white border-b-4 border-blue-800",
    red: "bg-red-600 hover:bg-red-500 text-white border-b-4 border-red-800",
    green: "bg-emerald-600 hover:bg-emerald-500 text-white border-b-4 border-emerald-800",
    yellow: "bg-amber-500 hover:bg-amber-400 text-black border-b-4 border-amber-700"
  };

  const disabledClass = "opacity-50 cursor-not-allowed transform-none";

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseClasses} ${disabled ? disabledClass : colors[color]}`}
    >
      {children}
    </button>
  );
};

const HeaderWithPeek = ({ text, onPeek, disabled }: { text: string, onPeek: () => void, disabled: boolean }) => (
    <div className="flex items-center justify-center gap-2 mb-2 relative w-full">
      <h3 className="text-white text-center font-medium text-xs sm:text-base">{text}</h3>
      <button 
        onClick={onPeek} 
        disabled={disabled}
        className="p-1.5 text-amber-400/80 hover:text-amber-300 hover:bg-white/5 rounded-full transition-colors absolute right-0 sm:right-auto sm:relative"
        title="Peek Answer"
      >
        <Eye size={16} className="sm:w-5 sm:h-5" />
      </button>
    </div>
);

const DecisionControls: React.FC<DecisionControlsProps> = ({ phase, onDecision, onPeek, disabled }) => {
  
  const renderContent = () => {
    switch (phase) {
      case GamePhase.NATURAL_CHECK:
        return (
          <div className="flex flex-col gap-1 sm:gap-2 w-full max-w-2xl">
            <HeaderWithPeek text="Step 1: Is there a Natural Winner (8 or 9)?" onPeek={onPeek} disabled={disabled} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <Button color="red" disabled={disabled} onClick={() => onDecision(DecisionOption.BANKER_WIN)}>Banker Win</Button>
              <Button color="blue" disabled={disabled} onClick={() => onDecision(DecisionOption.PLAYER_WIN)}>Player Win</Button>
              <Button color="green" disabled={disabled} onClick={() => onDecision(DecisionOption.TIE)}>Tie (Natural)</Button>
              <Button color="yellow" disabled={disabled} onClick={() => onDecision(DecisionOption.NO_NATURALS)}>No Naturals</Button>
            </div>
          </div>
        );
      
      case GamePhase.PLAYER_DRAW_CHECK:
        return (
          <div className="flex flex-col gap-1 sm:gap-2 w-full max-w-md">
            <HeaderWithPeek text="Step 2: Does PLAYER draw a 3rd card?" onPeek={onPeek} disabled={disabled} />
            <div className="flex gap-2 sm:gap-4">
              <Button color="green" disabled={disabled} onClick={() => onDecision(DecisionOption.DRAW)}>Player Draw</Button>
              <Button color="red" disabled={disabled} onClick={() => onDecision(DecisionOption.STAND)}>Player Stand</Button>
            </div>
          </div>
        );

      case GamePhase.BANKER_DRAW_CHECK:
        return (
          <div className="flex flex-col gap-1 sm:gap-2 w-full max-w-md">
            <HeaderWithPeek text="Step 3: Does BANKER draw a 3rd card?" onPeek={onPeek} disabled={disabled} />
            <div className="flex gap-2 sm:gap-4">
              <Button color="green" disabled={disabled} onClick={() => onDecision(DecisionOption.DRAW)}>Banker Draw</Button>
              <Button color="red" disabled={disabled} onClick={() => onDecision(DecisionOption.STAND)}>Banker Stand</Button>
            </div>
          </div>
        );

      case GamePhase.FINAL_OUTCOME:
        return (
          <div className="flex flex-col gap-1 sm:gap-2 w-full max-w-xl">
            <HeaderWithPeek text="Final Step: What is the outcome?" onPeek={onPeek} disabled={disabled} />
             <div className="flex gap-2 sm:gap-4">
              <Button color="red" disabled={disabled} onClick={() => onDecision(DecisionOption.BANKER_WIN)}>Banker Win</Button>
              <Button color="blue" disabled={disabled} onClick={() => onDecision(DecisionOption.PLAYER_WIN)}>Player Win</Button>
              <Button color="green" disabled={disabled} onClick={() => onDecision(DecisionOption.TIE)}>Tie</Button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm border-t border-white/10 mt-auto z-10 shrink-0 fixed sm:sticky bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom)]">
      {renderContent()}
    </div>
  );
};

export default DecisionControls;
