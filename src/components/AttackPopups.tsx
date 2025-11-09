'use client';
import { useEffect, useRef } from 'react';

export type AttackPopupProps = {
    move: any;
    damage: number;
    receiver: 'p' | 'o';
};

export default function AttackPopups({ move, damage, receiver }: AttackPopupProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const id = 'damage-pop-inline-kf';
        if (!document.getElementById(id)) {
            const style = document.createElement('style');
            style.id = id;
            style.textContent = `
@keyframes damagePopInline {
  0%   { opacity: 0; transform: translate(-50%, -50%) translateY(0) scale(0.9); }
  10%  { opacity: 1; transform: translate(-50%, -50%) translateY(-6px) scale(1.1); filter: brightness(1.8) saturate(1.2); }
  40%  { opacity: 1; filter: brightness(1.2) saturate(1.05); }
  70%  { opacity: 0.9; filter: brightness(1) saturate(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) translateY(-18px) scale(1.05); }
}

/* Straight diagonal with a little extra height at 70% + subtle spin/scale */
@keyframes diagBump {
  0%   { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 0; filter: brightness(1) saturate(1); }
  10%  { opacity: 1; filter: brightness(1.6) saturate(1.2); }
  70%  { transform: translate(var(--dx70), var(--dy70)) rotate(8deg) scale(1.15); }
  100% { transform: translate(var(--dx), var(--dy)) rotate(14deg) scale(1.1); opacity: 0; filter: brightness(1) saturate(1); }
}
.projectile {
  position: absolute;
  width: 140px; height: 140px;
  pointer-events: none; user-select: none;
  will-change: transform, opacity, filter;
  animation: diagBump var(--dur) ease-out forwards;
  /* Strong multi-layer glow for visibility on busy backgrounds */
  filter:
    drop-shadow(0 0 10px rgba(255,255,255,0.75))
    drop-shadow(0 0 22px rgba(255,255,255,0.55))
    drop-shadow(0 6px 10px rgba(0,0,0,0.45));
}
.damage-popup {
  position: absolute;
  pointer-events: none; user-select: none;
  animation: damagePopInline 2000ms ease-out forwards;
  font-weight: 900; font-size: 24px; letter-spacing: 0.02em;
  text-shadow:
    0 0 8px rgba(255,255,255,0.5),
    0 2px 10px rgba(0,0,0,0.45);
  padding: 2px 6px; border-radius: 4px;
  /* Bottom-right action banner */
@keyframes actionFade {
  0%   { opacity: 0; transform: translateY(8px); }
  10%  { opacity: 1; transform: translateY(0); }
  80%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(6px); }
}
.action-banner {
  
  z-9999
  max-width: 60vw;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(17,17,17,0.82);
  font-weight: 700;
  font-size: 64px;
  letter-spacing: 0.02em;
  line-height: 1.2;
  box-shadow:
    0 2px 10px rgba(0,0,0,0.35),
    0 0 10px rgba(255,255,255,0.08);
  animation: actionFade 2000ms ease-out forwards;
  pointer-events: none;
  user-select: none;
  will-change: opacity, transform;
}
.action-banner .move {
  color: #fde68a;
}

}
`;
            document.head.appendChild(style);
        }
    }, []);


    // Target anchor position: player at 1/3, opponent at 2/3
    const popupX = receiver === "p" ? "33vw" : "66vw";
    const popupY = receiver === "p" ? "66vh" : "33vh";

    const actor = receiver === 'o' ? 'Player' : 'Opponent';
    const actionText = `${actor} used ${move?.name ?? 'move'}`;

    // Projectile config:
    // Opponent target: start bottom-left, travel to top-right.
    // Player target: start top-right, travel to bottom-left.
    // Bump is slightly higher at 70% along the diagonal.
    const dur = 2000; // ms, sync with your popup delay sequence
    const projStyle: React.CSSProperties =
        receiver === 'o'
            ? {
                left: '4%', bottom: '6%',
                ['--dur' as any]: `${dur}ms`,
                // End travel vector
                ['--dx' as any]: '84vw',
                ['--dy' as any]: '-72vh',
                // 70% point a bit above the line (less negative Y = higher)
                ['--dx70' as any]: '58.8vw',  // 70% of dx
                ['--dy70' as any]: '-46.8vh', // 65% of |dy| → slightly higher than straight 70%
            }
            : {
                right: '4%', top: '6%',
                ['--dur' as any]: `${dur}ms`,
                ['--dx' as any]: '-84vw',
                ['--dy' as any]: '72vh',
                ['--dx70' as any]: '-58.8vw',
                ['--dy70' as any]: '46.8vh',
            };

    return (
        <>
            {/* Projectile */}
            <div className="projectile" style={projStyle}>
                <img
                    src={
                        move?.type === 'Fright'
                            ? '/magic_images/fright.png'
                            : move?.type === 'Fight'
                                ? '/magic_images/fight.png'
                                : '/magic_images/fairy.png'
                    }
                    alt="projectile"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        /* Optional extra inner glow to amplify visibility */
                        filter:
                            'drop-shadow(0 0 6px rgba(255,255,255,0.85)) drop-shadow(0 0 16px rgba(255,255,255,0.45))',
                    }}
                />
            </div>

            {/* Damage popup */}
            <div
                className="damage-popup"
                style={{
                    left: popupX,
                    top: popupY,
                    transform: 'translate(-50%, -50%)',
                    color: '#f87171',
                }}
                ref={ref}
            >
                -{damage}
            </div>
            {/* Action banner bottom-right */}
            <div className={[
                "action-banner absolute right-8 bottom-8 ",
                // valid z-index utility
                "z-10",
                // outline color by player.type
                move.type === "Fight"
                    ? "text-red-500"
                    : move.type === "Fairy"
                        ? "text-pink-500"
                        : move.type === "Fright"
                            ? "text-purple-900"
                            : " text-red-200", // Neutral / default
            ].join(" ")}
            >
                {actionText.replace(/\s+/g, ' ').trim().replace(
                    move?.name ?? 'move',
                    ''
                )}
                <span className="move">{move?.name ?? 'move'}</span>
            </div>

        </>
    );
}
