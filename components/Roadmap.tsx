import React from 'react';
import { HandOutcome } from '../types';

interface RoadmapProps {
  history: HandOutcome[];
}

const Roadmap: React.FC<RoadmapProps> = ({ history }) => {
  // Show last 24 hands
  const displayHistory = history.slice(-24);

  return (
    <div className="flex gap-1.5 p-2 bg-black/40 rounded-xl border border-white/5 overflow-hidden">
      {displayHistory.length === 0 ? (
        <div className="flex items-center justify-center w-full py-1">
          <span className="text-[10px] text-gray-600 uppercase tracking-widest">History will appear here</span>
        </div>
      ) : (
        displayHistory.map((outcome, i) => (
          <div 
            key={i}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border animate-in fade-in zoom-in duration-500
              ${outcome === 'P' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 
                outcome === 'B' ? 'bg-red-600/20 border-red-500 text-red-400' : 
                'bg-emerald-600/20 border-emerald-500 text-emerald-400'}
            `}
          >
            {outcome}
          </div>
        ))
      )}
    </div>
  );
};

export default Roadmap;