type HealthBarProps = {
    hp: number;
    maxhp: number;
    className?: string;
};

export function HealthBar({ hp, maxhp, className = "" }: HealthBarProps) {
    const pct = Math.max(0, Math.min(100, Math.round((hp / maxhp) * 100)));

    return (
        <div
            className={`relative w-full h-5 rounded-full bg-gray-700 overflow-hidden ${className}`}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            title={`${pct}%`}
        >
            <div
                className="h-full bg-green-500 transition-[width] duration-300 ease-out"
                style={{ width: `${pct}%` }}
            />

            {/* Centered label */}
            <div className="absolute h-full inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs font-semibold text-white drop-shadow-sm">
                    {hp}/{maxhp}
                </span>
            </div>
        </div>
    );
}
