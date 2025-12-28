import { useState, useEffect, useCallback } from 'react';
import { GameMode, GameStatus, TileStatus, GAME_CONFIG } from '@/models';
import {
    loadGameState,
    saveGameState,
    clearGameState,
} from '@/services/storage.service';
import {
    fetchNewPuzzle,
    submitGuess
} from '@/services/game.service';
import { updateStats } from '@/services/stats.service';
import { getWinMessage, getLossMessage } from '@/lib/word-logic';

export function useGame() {
    // State
    const [mode, setMode] = useState<GameMode>('daily');
    const [puzzleId, setPuzzleId] = useState<string>('');
    const [guesses, setGuesses] = useState<string[]>([]);
    const [results, setResults] = useState<TileStatus[][]>([]);
    const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
    const [solution, setSolution] = useState<string | undefined>(undefined);

    // UI State
    const [currentGuess, setCurrentGuess] = useState('');
    const [message, setMessage] = useState('');
    const [isRevealing, setIsRevealing] = useState(false);
    const [showStats, setShowStats] = useState(false);

    // --- Helpers ---
    const showMessage = useCallback((msg: string, temporary = true) => {
        setMessage(msg);
        if (temporary) {
            const transientMessages = ["Not enough letters", "Not in word list", "Invalid guess", "Error submitting guess"];
            if (transientMessages.includes(msg)) {
                setTimeout(() => setMessage(''), 1500);
            }
        }
    }, []);

    // --- Initialization ---
    const initGame = useCallback(async (targetMode: GameMode, forceNew: boolean = false) => {
        setMode(targetMode);
        setGameStatus('playing');
        setGuesses([]);
        setResults([]);
        setCurrentGuess('');
        setSolution(undefined);
        setMessage('');

        if (forceNew) {
            clearGameState(targetMode);
        }

        try {
            let pid = '';
            let saved = !forceNew ? loadGameState(targetMode) : null;

            // Priority: Resume existing game if valid
            if (saved && saved.gameStatus === 'playing') {
                pid = saved.puzzleId;
                setPuzzleId(pid);
                setGuesses(saved.guesses);
                setResults(saved.results || []);
                setGameStatus('playing');
                return;
            }

            // Otherwise, fetch a new puzzle
            const data = await fetchNewPuzzle(targetMode);
            pid = data.puzzleId;
            setPuzzleId(pid);

            // Re-check saved state against the new puzzleId (relevant for Daily mode)
            if (saved && saved.puzzleId === pid) {
                setGuesses(saved.guesses);
                setGameStatus(saved.gameStatus);
                setResults(saved.results || []);
                if (saved.gameStatus !== 'playing') {
                    setShowStats(true);
                }
            } else {
                clearGameState(targetMode);
            }
        } catch (e) {
            console.error('Failed to init game', e);
            showMessage('Failed to load game');
        }
    }, [showMessage]);

    // Initial Load Effect (Run once)
    useEffect(() => {
        initGame('daily');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Persistence Side Effect ---
    useEffect(() => {
        if (!puzzleId) return;
        saveGameState({
            puzzleId,
            guesses,
            gameStatus,
            lastPlayedTs: Date.now(),
            results,
        }, mode);
    }, [guesses, gameStatus, puzzleId, results, mode]);

    // --- Input Handling ---
    const handleChar = useCallback((char: string) => {
        if (gameStatus !== 'playing' || isRevealing || showStats) return;
        if (currentGuess.length < GAME_CONFIG.WORD_LENGTH) {
            setCurrentGuess(prev => prev + char);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameStatus, isRevealing, showStats, currentGuess]);

    const handleDelete = useCallback(() => {
        if (gameStatus !== 'playing' || isRevealing || showStats) return;
        setCurrentGuess(prev => prev.slice(0, -1));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameStatus, isRevealing, showStats]);

    const handleEnter = useCallback(async () => {
        if (gameStatus !== 'playing' || isRevealing || showStats) return;

        if (currentGuess.length !== GAME_CONFIG.WORD_LENGTH) {
            showMessage("Not enough letters");
            return;
        }

        try {
            const data = await submitGuess(currentGuess, puzzleId, guesses.length);

            if (!data.isValid) {
                if (data.reason === 'invalid_practice_session') {
                    showMessage("Session expired. Starting new game...");
                    setTimeout(() => initGame('practice', true), 1500);
                    return;
                }
                showMessage(data.reason === 'not_in_wordlist' ? 'Not in word list' : 'Invalid guess');
                return;
            }

            // Valid Guess - Animate
            setIsRevealing(true);
            const newGuesses = [...guesses, currentGuess];
            const newResults = [...results, data.result];

            setGuesses(newGuesses);
            setResults(newResults);
            setCurrentGuess('');

            setTimeout(() => {
                setIsRevealing(false);

                if (data.isWin) {
                    setGameStatus('won');
                    showMessage(getWinMessage(newGuesses.length));
                    updateStats(true, newGuesses.length, puzzleId, mode);
                    setTimeout(() => setShowStats(true), GAME_CONFIG.ANIMATION_DELAY_MS);
                } else if (data.isGameOver || newGuesses.length >= GAME_CONFIG.MAX_GUESSES) {
                    setGameStatus('lost');
                    updateStats(false, 0, puzzleId, mode);
                    if (data.answer) {
                        setSolution(data.answer.toUpperCase());
                    }
                    showMessage(getLossMessage(data.answer), false);
                    setTimeout(() => setShowStats(true), GAME_CONFIG.ANIMATION_DELAY_MS);
                }
            }, GAME_CONFIG.REVEAL_TIME_MS * GAME_CONFIG.WORD_LENGTH + 400); // 300*5 = 1500 + buffer

        } catch (e) {
            console.error(e);
            showMessage("Error submitting guess");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentGuess, gameStatus, isRevealing, showStats, guesses, puzzleId, mode, results, initGame, showMessage]);

    return {
        mode,
        gameStatus,
        guesses,
        results,
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
    };
}
