import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GamePhase, GameState, DecisionOption, CardStyle, HandOutcome } from './types';
import { drawCard, isNatural, shouldPlayerDraw, shouldBankerDraw, getWinner, calculateHandValue } from './constants';
import PlayingCard from './components/PlayingCard';
import DecisionControls from './components/DecisionControls';
import HelpModal from './components/HelpModal';
import WelcomeScreen from './components/WelcomeScreen';
import Roadmap from './components/Roadmap';
import { BookOpen, RotateCcw, Palette, Trophy, Volume2, VolumeX } from 'lucide-react';

// --- SYNTHESIZER ENGINE ---
// This replaces external MP3s with mathematically generated sound to guarantee playback.
class BaccaratSynth {
  ctx: AudioContext | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createEnvelope(gain: GainNode, start: number, duration: number, peak = 0.5) {
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  }

  playDeal() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1500;

    const gain = this.ctx.createGain();
    this.createEnvelope(gain, now, 0.08, 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  playCorrect() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
    this.createEnvelope(gain, now, 0.2, 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playWrong() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.2);
    this.createEnvelope(gain, now, 0.25, 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  playWin() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.frequency.value = freq;
      this.createEnvelope(gain, now + (i * 0.08), 0.3, 0.15);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + (i * 0.08));
      osc.stop(now + 0.5);
    });
  }

  playNatural() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [880, 1108, 1318, 1760].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      this.createEnvelope(gain, now + (i * 0.05), 0.4, 0.1);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + (i * 0.05));
      osc.stop(now + 0.6);
    });
  }
}

const synth = new BaccaratSynth();

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    playerHand: [],
    bankerHand: [],
    currentPhase: GamePhase.NATURAL_CHECK,
    phaseComplete: false,
    history: [],
    score: { correct: 0, incorrect: 0, handsPlayed: 0, peeks: 0, streak: 0 },
    feedback: { message: '', type: null },
  });

  const [cardStyle, setCardStyle] = useState<CardStyle>('modern');
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpTab, setHelpTab] = useState<'rules' | 'instructions'>('rules');
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState<boolean | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    const accepted = localStorage.getItem('baccarat_trainer_accepted');
    const muted = localStorage.getItem('baccarat_trainer_muted');
    setHasAcceptedDisclaimer(accepted === 'true');
    setIsMuted(muted === 'true');
  }, []);

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('baccarat_trainer_accepted', 'true');
    setHasAcceptedDisclaimer(true);
    // Initialize synth on user interaction
    synth.init();
    synth.playDeal();
  };

  // WebAudio will not reliably start until a user gesture occurs.
  // If a user previously accepted the disclaimer, we may skip the welcome screen,
  // which means `synth.init()` never runs and sound will never play.
  //
  // This ensures that *any* first user interaction after acceptance initializes/resumes audio.
  useEffect(() => {
    if (!hasAcceptedDisclaimer) return;

    const initOnGesture = () => {
      synth.init();
    };

    // Capture so this runs before React's onClick handlers.
    window.addEventListener('pointerdown', initOnGesture, { capture: true, once: true, passive: true });
    window.addEventListener('keydown', initOnGesture, { capture: true, once: true });

    return () => {
      window.removeEventListener('pointerdown', initOnGesture, true);
      window.removeEventListener('keydown', initOnGesture, true);
    };
  }, [hasAcceptedDisclaimer]);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem('baccarat_trainer_muted', String(newMuted));

    // Unmuting is a user gesture, so it's a safe time to ensure the AudioContext exists/resumed.
    if (!newMuted) {
      synth.init();
    }
  };

  const startNewHand = useCallback((shouldResetStats = false) => {
    const p1 = drawCard();
    const b1 = drawCard();
    const p2 = drawCard();
    const b2 = drawCard();

    if (!isMuted) {
      [0, 150, 300, 450].forEach(delay => {
        setTimeout(() => synth.playDeal(), delay);
      });
    }

    setGameState(prev => ({
      ...prev,
      playerHand: [p1, p2],
      bankerHand: [b1, b2],
      currentPhase: GamePhase.NATURAL_CHECK,
      phaseComplete: false,
      feedback: { 
        message: shouldResetStats ? 'Stats reset. Ready for analysis.' : 'Initial deal complete. Check for Naturals.', 
        type: 'neutral' 
      },
      score: shouldResetStats ? { correct: 0, incorrect: 0, handsPlayed: 0, peeks: 0, streak: 0 } : prev.score
    }));
  }, [isMuted]);

  useEffect(() => {
    if (hasAcceptedDisclaimer) {
      startNewHand();
    }
  }, [hasAcceptedDisclaimer, startNewHand]);

  const handlePeek = () => {
    const { playerHand, bankerHand, currentPhase, phaseComplete } = gameState;
    if (phaseComplete) return;

    let correctDecision = '';
    switch (currentPhase) {
      case GamePhase.NATURAL_CHECK:
        const hasNatural = isNatural(playerHand, bankerHand);
        if (hasNatural) {
          const pVal = calculateHandValue(playerHand);
          const bVal = calculateHandValue(bankerHand);
          if (pVal > bVal) correctDecision = DecisionOption.PLAYER_WIN;
          else if (bVal > pVal) correctDecision = DecisionOption.BANKER_WIN;
          else correctDecision = DecisionOption.TIE;
        } else {
          correctDecision = DecisionOption.NO_NATURALS;
        }
        break;
      case GamePhase.PLAYER_DRAW_CHECK:
        const pDraw = shouldPlayerDraw(playerHand);
        correctDecision = pDraw ? DecisionOption.DRAW : DecisionOption.STAND;
        break;
      case GamePhase.BANKER_DRAW_CHECK:
        const bDraw = shouldBankerDraw(bankerHand, playerHand);
        correctDecision = bDraw ? DecisionOption.DRAW : DecisionOption.STAND;
        break;
      case GamePhase.FINAL_OUTCOME:
        correctDecision = getWinner(playerHand, bankerHand);
        break;
    }

    setGameState(prev => ({
      ...prev,
      score: { ...prev.score, peeks: prev.score.peeks + 1 },
      feedback: { message: `Hint: The rule dictates ${correctDecision}`, type: 'neutral' }
    }));
  };

  const handleDecision = (decision: DecisionOption) => {
    const { playerHand, bankerHand, currentPhase } = gameState;
    let isCorrect = false;
    let nextPhase = currentPhase;
    let feedbackMsg = '';
    let autoProgress = false;
    let pHandUpdate = [...playerHand];
    let bHandUpdate = [...bankerHand];
    let soundType: 'deal' | 'correct' | 'wrong' | 'win' | 'natural' = 'correct';

    switch (currentPhase) {
      case GamePhase.NATURAL_CHECK:
        const hasNatural = isNatural(playerHand, bankerHand);
        if (hasNatural) {
          const pVal = calculateHandValue(playerHand);
          const bVal = calculateHandValue(bankerHand);
          let correct;
          if (pVal > bVal) correct = DecisionOption.PLAYER_WIN;
          else if (bVal > pVal) correct = DecisionOption.BANKER_WIN;
          else correct = DecisionOption.TIE;

          if (decision === correct) {
            isCorrect = true;
            soundType = 'natural';
            feedbackMsg = `Correct! ${decision} Natural.`;
            autoProgress = true;
          } else {
             isCorrect = false;
             feedbackMsg = `Incorrect. Result is ${correct}.`;
          }
        } else {
          if (decision === DecisionOption.NO_NATURALS) {
            isCorrect = true;
            feedbackMsg = "Correct. No naturals. Check Player draw.";
            nextPhase = GamePhase.PLAYER_DRAW_CHECK;
          } else {
            isCorrect = false;
            feedbackMsg = "Incorrect. No 8 or 9 is present.";
          }
        }
        break;

      case GamePhase.PLAYER_DRAW_CHECK:
        const pDraw = shouldPlayerDraw(playerHand);
        if ((decision === DecisionOption.DRAW && pDraw) || (decision === DecisionOption.STAND && !pDraw)) {
          isCorrect = true;
          feedbackMsg = pDraw ? "Correct. Player draws." : "Correct. Player stands.";
          if (pDraw) {
            const newCard = drawCard();
            pHandUpdate.push(newCard);
            setTimeout(() => !isMuted && synth.playDeal(), 150);
          }
          nextPhase = GamePhase.BANKER_DRAW_CHECK;
        } else {
          isCorrect = false;
          feedbackMsg = `Incorrect. Player total is ${calculateHandValue(playerHand)}. Rules: 0-5 Draw, 6-7 Stand.`;
        }
        break;

      case GamePhase.BANKER_DRAW_CHECK:
        const bDraw = shouldBankerDraw(bankerHand, playerHand);
        if ((decision === DecisionOption.DRAW && bDraw) || (decision === DecisionOption.STAND && !bDraw)) {
          isCorrect = true;
          feedbackMsg = bDraw ? "Correct. Banker draws." : "Correct. Banker stands.";
          if (bDraw) {
            const newCard = drawCard();
            bHandUpdate.push(newCard);
            setTimeout(() => !isMuted && synth.playDeal(), 150);
          }
          nextPhase = GamePhase.FINAL_OUTCOME;
        } else {
          isCorrect = false;
          feedbackMsg = "Incorrect. Refer to the Banker's Tableau.";
        }
        break;

      case GamePhase.FINAL_OUTCOME:
        const winner = getWinner(pHandUpdate, bHandUpdate);
        if (decision === winner) {
          isCorrect = true;
          soundType = 'win';
          feedbackMsg = `Winner: ${winner}. P: ${calculateHandValue(pHandUpdate)}, B: ${calculateHandValue(bHandUpdate)}.`;
          autoProgress = true;
        } else {
          isCorrect = false;
          feedbackMsg = `Incorrect. The winning hand is ${winner}.`;
        }
        break;
    }

    if (isCorrect) {
      if (!isMuted) {
        if (soundType === 'natural') synth.playNatural();
        else if (soundType === 'win') synth.playWin();
        else synth.playCorrect();
      }

      const winnerShortcut: Record<string, HandOutcome> = { 'PLAYER WIN': 'P', 'BANKER WIN': 'B', 'TIE': 'T' };
      const outcome = winnerShortcut[getWinner(pHandUpdate, bHandUpdate)];

      setGameState(prev => ({
        ...prev,
        playerHand: pHandUpdate,
        bankerHand: bHandUpdate,
        score: {
          ...prev.score,
          correct: prev.score.correct + 1,
          streak: prev.score.streak + 1,
          handsPlayed: autoProgress ? prev.score.handsPlayed + 1 : prev.score.handsPlayed
        },
        history: autoProgress ? [...prev.history, outcome] : prev.history,
        feedback: { message: feedbackMsg, type: 'success' },
        currentPhase: autoProgress ? prev.currentPhase : nextPhase,
        phaseComplete: autoProgress
      }));

      if (autoProgress) {
        setTimeout(() => startNewHand(), 2500);
      }
    } else {
      if (!isMuted) synth.playWrong();
      setGameState(prev => ({
        ...prev,
        score: { ...prev.score, incorrect: prev.score.incorrect + 1, streak: 0 },
        feedback: { message: feedbackMsg, type: 'error' }
      }));
    }
  };

  const resetStats = () => {
    if (window.confirm("Reset all statistics?")) {
      startNewHand(true);
      setGameState(prev => ({ ...prev, history: [] }));
    }
  };

  const toggleStyle = () => setCardStyle(prev => prev === 'modern' ? 'classic' : 'modern');
  const openHelp = (tab: 'rules' | 'instructions') => { setHelpTab(tab); setHelpModalOpen(true); };

  if (hasAcceptedDisclaimer === null) return <div className="h-full bg-gray-950" />;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-950 font-sans">
      {!hasAcceptedDisclaimer && <WelcomeScreen onAccept={handleAcceptDisclaimer} />}

      <header className="bg-black/80 backdrop-blur-xl border-b border-white/5 p-1 sm:p-4 z-50 shrink-0 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-row justify-between items-center gap-2">
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 font-serif whitespace-nowrap">
              Baccarat Master
            </h1>
            <div className="hidden sm:flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-amber-500/50 font-bold">
               <Trophy size={10} /> Streak: {gameState.score.streak}
            </div>
          </div>

          <div className="flex gap-2 sm:gap-6 text-xs sm:text-sm font-mono">
            <div className="bg-white/5 px-2 py-1 rounded border border-white/5 flex flex-col items-center min-w-[50px] sm:min-w-[70px]">
              <span className="text-[8px] text-gray-500 uppercase">Correct</span>
              <span className="text-green-400 font-bold">{gameState.score.correct}</span>
            </div>
            <div className="bg-white/5 px-2 py-1 rounded border border-white/5 flex flex-col items-center min-w-[50px] sm:min-w-[70px]">
              <span className="text-[8px] text-gray-500 uppercase">Mistakes</span>
              <span className="text-red-400 font-bold">{gameState.score.incorrect}</span>
            </div>
            <div className="bg-white/5 px-2 py-1 rounded border border-white/5 flex flex-col items-center min-w-[50px] sm:min-w-[70px]">
              <span className="text-[8px] text-gray-500 uppercase">Hands</span>
              <span className="text-white font-bold">{gameState.score.handsPlayed}</span>
            </div>
          </div>

          <div className="flex gap-1">
             <button onClick={toggleMute} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all" title={isMuted ? "Unmute" : "Mute"}>
               {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
             </button>
             <button onClick={toggleStyle} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Card Style">
               <Palette size={16} />
             </button>
             <button onClick={() => openHelp('rules')} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Rules">
               <BookOpen size={16} />
             </button>
             <button onClick={resetStats} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all" title="Reset Statistics">
               <RotateCcw size={16} />
             </button>
          </div>
        </div>
      </header>

      <div className="bg-black/30 border-b border-white/5 p-1 flex justify-center">
         <Roadmap history={gameState.history} />
      </div>

      <div className={`w-full py-1.5 text-[10px] sm:text-sm text-center font-bold uppercase tracking-widest transition-all duration-500 shrink-0 ${
        gameState.feedback.type === 'success' ? 'bg-green-600/20 text-green-400 border-b border-green-500/30 shadow-[inset_0_0_20px_rgba(34,197,94,0.1)]' :
        gameState.feedback.type === 'error' ? 'bg-red-600/20 text-red-400 border-b border-red-500/30 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]' :
        'bg-gray-900/50 text-gray-500 border-b border-white/5'
      }`}>
        {gameState.feedback.message || "Training Session Active"}
      </div>

      <main className="flex-1 relative flex flex-col landscape:flex-row lg:flex-row items-center justify-center gap-1 landscape:gap-4 lg:gap-12 p-2 overflow-hidden pb-28 sm:pb-0">
        <div className="absolute inset-0 bg-felt opacity-100 z-0 min-h-full">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-30 mix-blend-overlay"></div>
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"></div>
        </div>

        {/* BANKER AREA */}
        <div className="flex flex-col items-center justify-center gap-1 lg:gap-4 relative w-full lg:w-auto z-10">
           <div className="font-serif text-amber-200/30 font-bold uppercase tracking-[0.4em] mb-2 lg:mb-6 text-sm sm:text-lg lg:text-3xl select-none rotate-180">
             Banker
           </div>
           <div className="bg-black/20 p-2 sm:p-4 lg:p-8 rounded-[40px] border border-amber-500/10 backdrop-blur-sm relative z-10 shadow-2xl">
              <div className="flex flex-row-reverse gap-2 sm:gap-4">
                <PlayingCard card={gameState.bankerHand[0]} styleVariant={cardStyle} label="Card 1" index={1} />
                <PlayingCard card={gameState.bankerHand[1]} styleVariant={cardStyle} label="Card 2" index={3} />
                <PlayingCard card={gameState.bankerHand[2]} styleVariant={cardStyle} isPlaceholder={gameState.bankerHand.length < 3} label="3rd" index={5} />
              </div>
           </div>
        </div>

        <div className="w-1/2 h-px landscape:w-px landscape:h-32 lg:h-64 lg:w-px bg-white/5 shrink-0 z-10 my-2"></div>

        {/* PLAYER AREA */}
        <div className="flex flex-col items-center justify-center gap-1 lg:gap-4 relative w-full lg:w-auto z-10">
           <div className="font-serif text-blue-200/30 font-bold uppercase tracking-[0.4em] mb-2 lg:mb-6 text-sm sm:text-lg lg:text-3xl select-none rotate-180">
             Player
           </div>
           <div className="bg-black/20 p-2 sm:p-4 lg:p-8 rounded-[40px] border border-blue-500/10 backdrop-blur-sm relative z-10 shadow-2xl">
              <div className="flex flex-row gap-2 sm:gap-4">
                <PlayingCard card={gameState.playerHand[0]} styleVariant={cardStyle} label="Card 1" index={0} />
                <PlayingCard card={gameState.playerHand[1]} styleVariant={cardStyle} label="Card 2" index={2} />
                <PlayingCard card={gameState.playerHand[2]} styleVariant={cardStyle} isPlaceholder={gameState.playerHand.length < 3} label="3rd" index={4} />
              </div>
           </div>
        </div>
      </main>

      <DecisionControls 
        phase={gameState.currentPhase} 
        onDecision={handleDecision}
        onPeek={handlePeek}
        disabled={gameState.phaseComplete}
      />

      <HelpModal isOpen={helpModalOpen} onClose={() => setHelpModalOpen(false)} tab={helpTab} />
    </div>
  );
};

export default App;
