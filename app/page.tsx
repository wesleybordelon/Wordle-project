'use client';

import { useEffect, useState } from 'react';
import { Grid } from '@/components/Grid';
import { Keyboard } from '@/components/Keyboard';
import { StatsModal } from '@/components/StatsModal';
import { useGame } from '@/hooks/useGame';
import { useTheme } from '@/hooks/useTheme';
import { getStats } from '@/services/stats.service';
import { TileStatus, GAME_CONFIG } from '@/models';

export default function GamePage() {
  const {
    mode,
    guesses,
    results,
    gameStatus,
    currentGuess,
    message,
    isRevealing,
    showStats,
    setShowStats,
    solution,
    initGame,
    handleChar,
    handleDelete,
    handleEnter
  } = useGame();

  const { theme, toggleTheme, highContrast, toggleHighContrast } = useTheme();

  // Keyboard status logic
  const safeResults = isRevealing ? results.slice(0, -1) : results;
  const safeGuesses = isRevealing ? guesses.slice(0, -1) : guesses;
  const keyStatuses: Record<string, TileStatus> = {};

  safeResults.forEach((res, i) => {
    const guess = safeGuesses[i];
    res.forEach((status, j) => {
      const char = guess[j];
      const current = keyStatuses[char];
      if (status === 'correct') keyStatuses[char] = 'correct';
      else if (status === 'present' && current !== 'correct') keyStatuses[char] = 'present';
      else if (status === 'absent' && !current) keyStatuses[char] = 'absent';
    });
  });

  // Listen for physical keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing' || showStats || isRevealing) return;

      const key = e.key;
      if (key === 'Enter') handleEnter();
      else if (key === 'Backspace') handleDelete();
      else if (/^[a-zA-Z]$/.test(key) && key.length === 1 && !e.ctrlKey && !e.metaKey) {
        handleChar(key.toLowerCase());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, showStats, isRevealing, handleEnter, handleDelete, handleChar]);


  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="flex justify-start gap-2">
          <button className="icon-btn" onClick={() => setShowStats(true)}>📊</button>
          <button
            className="mode-pill"
            onClick={() => initGame(mode === 'daily' ? 'practice' : 'daily')}
          >
            {mode === 'daily' ? 'Daily' : 'Practice'}
          </button>
        </div>

        <h1 className="text-2xl font-bold text-center tracking-wider relative">
          WORDLEY
          {mode === 'practice' && <span className="text-[0.6rem] absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-orange-500 uppercase tracking-widest whitespace-nowrap">Practice</span>}
        </h1>

        <div className="flex justify-end gap-2">
          <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button className="icon-btn" onClick={toggleHighContrast} title="Toggle High Contrast">
            {highContrast ? '🎨' : '👁️'}
          </button>
        </div>
      </header>

      <main className="app-main">
        {message && (
          <div className="toast-message">
            {message}
          </div>
        )}

        <div className="flex-shrink-0 flex flex-col items-center justify-center py-2">
          <Grid
            guesses={guesses}
            currentGuess={currentGuess}
            results={results}
            maxGuesses={GAME_CONFIG.MAX_GUESSES}
            isRevealing={isRevealing}
            revealingRowIndex={guesses.length - 1} // if revealing, it's the last added guess? No, useGame adds it then sets revealing.
          // Wait, logic in useGame: 
          // setGuesses(newGuesses); setIsRevealing(true); 
          // So guesses.length is N. The revealing row is N-1.
          />
        </div>

        {/* Play Again UI overlay */}
        {(gameStatus !== 'playing' && !isRevealing && !showStats) && (
          <div className="play-again-panel">
            <div className="flex gap-4">
              <button
                className="btn-primary"
                onClick={() => initGame('practice', true)}
              >
                {mode === 'daily' ? 'Practice Mode' : 'New Game'}
              </button>
              {mode === 'practice' && (
                <button
                  className="btn-secondary"
                  onClick={() => initGame('daily')}
                >
                  Play Daily
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <div className="app-footer">
        <Keyboard
          onChar={handleChar}
          onDelete={handleDelete}
          onEnter={handleEnter}
          keyStatuses={keyStatuses}
        />
      </div>

      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        stats={getStats(mode)}
        solution={solution}
      />
    </div>
  );
}
