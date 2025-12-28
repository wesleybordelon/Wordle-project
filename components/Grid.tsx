import { GridProps, RowProps, TileProps } from '@/models';

export function Grid({ guesses, currentGuess, results, maxGuesses, isRevealing, revealingRowIndex }: GridProps) {
    const empties = maxGuesses > guesses.length ? Array.from(Array(maxGuesses - 1 - guesses.length)) : [];

    return (
        <div className="flex flex-col gap-[var(--tile-gap)]" role="grid" aria-label="Game Grid">
            {/* Completed rows */}
            {
                guesses.map((guess, i) => (
                    <Row
                        key={i}
                        word={guess}
                        result={results[i]}
                        isRevealing={isRevealing && revealingRowIndex === i}
                    />
                ))
            }

            {/* Current row (if game not over) */}
            {
                guesses.length < maxGuesses && (
                    <Row word={currentGuess} isCurrent />
                )
            }

            {/* Empty rows */}
            {
                empties.map((_, i) => (
                    <Row key={`empty-${i}`} word="" />
                ))
            }
        </div >
    );
}


function Row({ word, result, isCurrent, isRevealing }: RowProps) {
    const letters = word.split('');
    const empties = Array.from(Array(5 - letters.length));

    return (
        <div className="flex gap-1.5 justify-center" role="row">
            {letters.map((char, i) => (
                <Tile
                    key={i}
                    char={char}
                    status={result?.[i]}
                    isRevealing={isRevealing}
                    animationDelay={isRevealing ? `${i * 300}ms` : undefined}
                />
            ))}
            {empties.map((_, i) => (
                <Tile key={`e-${i}`} char="" />
            ))}
        </div>
    );
}


function Tile({ char, status, isFilled, isRevealing, animationDelay }: TileProps) {
    let className = "tile-base ";

    if (isRevealing && status) {
        className += `animate-reveal-${status} `;
    } else if (status) {
        className += `tile-${status}`;
    } else if (char) {
        className += "tile-filled";
    } else {
        className += "tile-empty";
    }

    return (
        <div className={className} style={{ animationDelay }}>
            {char}
        </div>
    );
}
