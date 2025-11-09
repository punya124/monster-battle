'use client';
import { useMemo } from 'react';

type StaticBackgroundProps = {
    // Optional list of direct image URLs; can be one or many
    backgrounds?: string[];
    // Optional: pick a specific index; defaults to random each render
    index?: number;
    className?: string;
    children?: React.ReactNode;
};

// Example default list with your provided link repeated
const DEFAULT_BG = [
    'https://pixabay.com/illustrations/ai-generated-background-space-7787717/',
];

export default function StaticBackground({
    backgrounds = DEFAULT_BG,
    index,
    className = '',
    children,
}: StaticBackgroundProps) {
    const url = useMemo(() => {
        if (!backgrounds.length) return null;
        if (typeof index === 'number' && index >= 0 && index < backgrounds.length) {
            return backgrounds[index];
        }
        // random pick if no index provided
        return backgrounds[Math.floor(Math.random() * backgrounds.length)];
    }, [backgrounds, index]);

    const bgStyle: React.CSSProperties = url
        ? {
            backgroundImage: `url(${url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
        }
        : {};

    return (
        <div
            className={['relative w-screen h-screen', className].join(' ')}
            style={{
                ...(bgStyle ?? {}),
                backgroundSize: 'cover',         // or 'contain' to avoid any cropping
                backgroundPosition: 'center',    // keep centered
                backgroundRepeat: 'no-repeat',   // prevent tiling
            }}
            role="img"
            aria-label={url ? 'Background image' : 'No background'}
        >
            {/* Optional overlay for contrast */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,.15), rgba(0,0,0,.35))',
                    pointerEvents: 'none',
                }}
            />
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {children}
            </div>
        </div>

    );
}
