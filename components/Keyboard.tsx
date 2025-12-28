import { KeyboardProps } from '@/models';

const KEYS = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace']
];

export function Keyboard({ onChar, onDelete, onEnter, keyStatuses }: KeyboardProps) {

    const getKeyClass = (key: string) => {
        // Special keys styling
        if (key === 'Enter' || key === 'Backspace') {
            return "key-special";
        }

        const status = keyStatuses[key];
        if (status === 'correct') return "key-correct";
        if (status === 'present') return "key-present";
        if (status === 'absent') return "key-absent";

        return "key-default"; // default
    };

    const handleDisplay = (key: string) => {
        if (key === 'Backspace') return '⌫';
        if (key === 'Enter') return 'ENTER';
        return key;
    };

    return (
        <div className="w-full max-w-lg mx-auto flex flex-col gap-2 p-2">
            {KEYS.map((row, i) => (
                <div key={i} className="flex gap-1 justify-center">
                    {row.map(key => (
                        <button
                            key={key}
                            onClick={() => {
                                if (key === 'Enter') onEnter();
                                else if (key === 'Backspace') onDelete();
                                else onChar(key);
                            }}
                            className={`key-btn ${getKeyClass(key)}`}
                            style={{ height: 'var(--key-height)', fontSize: 'clamp(0.9rem, 2vh, 1.25rem)' }}
                        >
                            {handleDisplay(key)}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
}
