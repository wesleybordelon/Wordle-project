import { StatsModalProps } from '@/models';

export function StatsModal({ stats, isOpen, onClose, solution }: StatsModalProps) {
    if (!isOpen) return null;

    const maxDist = Math.max(...stats.distribution, 1);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white text-black p-6 rounded shadow-xl w-full max-w-sm relative flex flex-col gap-4">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-black font-bold text-xl px-2">
                    ✕
                </button>

                <h2 className="text-xl font-bold uppercase text-center">Statistics</h2>

                <div className="flex justify-between px-2 text-center">
                    <StatItem label="Played" value={stats.played} />
                    <StatItem label="Win %" value={stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0} />
                    <StatItem label="Streak" value={stats.currentStreak} />
                    <StatItem label="Max Streak" value={stats.maxStreak} />
                </div>

                <h3 className="text-sm font-bold uppercase mt-2">Guess Distribution</h3>
                <div className="flex flex-col gap-1">
                    {stats.distribution.map((count, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-bold">
                            <span className="w-2">{i + 1}</span>
                            <div
                                className={`h-5 ${count > 0 ? 'bg-gray-500' : 'bg-gray-200'} text-white flex items-center justify-end px-1 min-w-[1rem]`}
                                style={{ width: `${(count / maxDist) * 100}%` }}
                            >
                                {count}
                            </div>
                        </div>
                    ))}
                </div>

                {solution && (
                    <div className="mt-4 p-3 bg-gray-100 rounded text-center">
                        <p className="text-sm text-gray-600 uppercase">The word was</p>
                        <p className="text-2xl font-bold tracking-widest">{solution}</p>
                    </div>
                )}

            </div>
        </div>
    );
}

function StatItem({ label, value }: { label: string, value: number }) {
    return (
        <div className="flex flex-col">
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-xs text-gray-500 uppercase">{label}</span>
        </div>
    );
}
