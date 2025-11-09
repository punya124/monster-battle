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
  10%  { opacity: 1; transform: translate(-50%, -50%) translateY(-6px) scale(1.05); }
  40%  { opacity: 1; filter: brightness(1.6); }
  70%  { opacity: 0.8; filter: brightness(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) translateY(-18px) scale(1.05); }
}

/* Straight diagonal with a little extra height at 70% */
@keyframes diagBump {
  0%   { transform: translate(0, 0); opacity: 0; }
  10%  { opacity: 1; }
  70%  { transform: translate(var(--dx70), var(--dy70)); }  /* slight 'higher' bump */
  100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
}
.projectile {
  position: absolute;
  width: 64px; height: 64px;
  pointer-events: none; user-select: none;
  will-change: transform, opacity;
  animation: diagBump var(--dur) ease-out forwards;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,.35));
}
.damage-popup {
  position: absolute;
  pointer-events: none; user-select: none;
  animation: damagePopInline 600ms ease-out forwards;
  font-weight: 800; font-size: 20px; letter-spacing: 0.02em;
  text-shadow: 0 1px 0 rgba(0,0,0,.45), 0 0 10px rgba(255,255,255,.35);
  padding: 2px 6px; border-radius: 4px; 
}
`;
            document.head.appendChild(style);
        }
    }, []);

    // Target anchor position: player at 1/3, opponent at 2/3
    const popupX = receiver === "p" ? "33.3333%" : "66.6667%";
    const popupY = receiver === "p" ? "66.6667%" : "33.3333%";

    // Projectile config:
    // Opponent target: start bottom-left, travel to top-right.
    // Player target: start top-right, travel to bottom-left.
    // Bump is slightly higher at 70% along the diagonal.
    const dur = 1000; // ms, sync with your popup delay sequence
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
                <img src={
                    move?.type === 'Fright'
                        ? '/magic_images/fright.png'
                        : move?.type === 'Fight'
                            ? '/magic_images/fight.png'
                            : '/magic_images/fairy.png' // Neutral and any other fallback
                } alt="projectile" style={{ width: '200%', height: '200%', objectFit: 'contain' }} />
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
        </>
    );
}
