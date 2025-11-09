import { useEffect, useRef } from "react";

type AttackPopupProps = {
    move: any;
    damage: number;
    receiver: "p" | "o";
};

export function AttackPopups({ move, damage, receiver }: AttackPopupProps) {
    const ref = useRef<HTMLDivElement>(null);

    // Target anchor position: player at 1/3, opponent at 2/3
    const anchorX = receiver === "p" ? "33.3333%" : "66.6667%";
    const anchorY = receiver === "p" ? "66.6667%" : "33.3333%";

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Inject keyframes once per mount if not present
        const styleId = "damage-pop-inline-kf";
        if (!document.getElementById(styleId)) {
            const style = document.createElement("style");
            style.id = styleId;
            style.textContent = `
@keyframes damagePopInline {
  0%   { opacity: 0; transform: translate(-50%, -50%) translateY(0) scale(0.9); }
  10%  { opacity: 1; transform: translate(-50%, -50%) translateY(-6px) scale(1.05); }
  40%  { opacity: 1; filter: brightness(1.6); }
  70%  { opacity: 0.8; filter: brightness(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) translateY(-18px) scale(1.05); }
}`;
            document.head.appendChild(style);
        }

        // Listen for animation end if parent wants to remove later
        const onEnd = () => {
            // optional: el.remove(); or signal parent via a callback if you add one
        };
        el.addEventListener("animationend", onEnd);
        return () => el.removeEventListener("animationend", onEnd);
    }, []);

    return (
        <div
            // parent should be position: relative to scope absolute coords
            style={{
                position: "absolute",
                left: anchorX,
                top: anchorY,
                transform: "translate(-50%, -50%)", // center on the anchor point
                pointerEvents: "none",
                userSelect: "none",
                animation: "damagePopInline 600ms ease-out forwards",
                // visual style
                color: "#f87171",
                fontWeight: 800,
                fontSize: "80px",
                letterSpacing: "0.02em",
                textShadow:
                    "0 1px 0 rgba(0,0,0,.45), 0 0 10px rgba(255,255,255,.35)",
                padding: "2px 6px",
                borderRadius: "4px",
            }}
            ref={ref}
        >
            -{damage}
        </div>
    );
}
