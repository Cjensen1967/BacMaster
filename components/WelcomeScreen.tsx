import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface WelcomeScreenProps {
  onAccept: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950 px-4">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-lg w-full bg-gray-900 border border-amber-500/20 rounded-2xl shadow-2xl p-8 text-center">
        {/* Logo / Title */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 mb-2">
            Baccarat Master
          </h1>
          <p className="text-amber-500/60 uppercase tracking-[0.3em] text-xs font-bold">
            Elite Training Simulator
          </p>
        </div>

        {/* Requirements */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-2">
              <span className="text-amber-400 font-bold text-lg">18+</span>
            </div>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Age Required</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-2">
              <ShieldCheck className="text-blue-400 w-6 h-6" />
            </div>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Secure Trainer</span>
          </div>
        </div>

        {/* Disclaimer Text */}
        <div className="space-y-4 mb-10 text-gray-400 text-sm leading-relaxed text-left bg-black/30 p-4 rounded-lg border border-white/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-500 shrink-0 w-5 h-5 mt-0.5" />
            <p>
              This application is a <strong className="text-gray-200">training simulator only</strong>. It is intended for individuals of legal gambling age in their respective jurisdiction.
            </p>
          </div>
          <p className="pl-8 italic text-xs text-gray-500 border-l border-amber-500/20">
            Practice or success at social casino gaming does not imply future success at real money gambling. No real money or prizes can be won here.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={onAccept}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-[1.02] active:scale-95"
        >
          Agree & Enter Trainer
        </button>
        
        <p className="mt-6 text-[10px] text-gray-600 uppercase tracking-widest">
          By entering, you confirm you are 18+ and accept our terms.
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;