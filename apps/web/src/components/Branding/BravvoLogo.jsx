import React from 'react';

/**
 * BravvoLogo Component - High Fidelity Recreation
 * 
 * Design matches the user reference:
 * - Icon: 3 Isometric Folders stacked.
 *   - Back: Darkest Grey (#1A1A1B)
 *   - Middle: Dark Grey (#333333)
 *   - Front: Vibrant Orange Gradient (#FF6600 -> #FF8833) with drop shadow.
 * - Typography:
 *   - "Bravvo": Small, UPPERCASE, wide tracking, positioned cleanly above.
 *   - "Binder": Large, Title Case, Heavy font weight.
 */
export function BravvoLogo({ className = "", iconOnly = false, color = "white" }) {
    return (
        <div className={`flex items-center gap-3 select-none ${className}`}>
            {/* 3D Folder Stack Icon */}
            <svg width="42" height="42" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 filter drop-shadow-md">
                <defs>
                    <linearGradient id="folderBright" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#FF9955" />
                        <stop offset="50%" stopColor="#FF6600" />
                        <stop offset="100%" stopColor="#CC5200" />
                    </linearGradient>
                    <filter id="dropshadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                        <feOffset dx="2" dy="2" result="offsetblur" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.3" />
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Back Folder (Darkest) - Offset Top-Right */}
                <path d="M35 15 H65 L70 22 H85 C87.76 22 90 24.24 90 27 V75 C90 77.76 87.76 80 85 80 H35 C32.24 80 30 77.76 30 75 V20 C30 17.24 32.24 15 35 15Z"
                    fill="#1A1A1B" stroke="#2A2A2A" strokeWidth="1" />

                {/* Middle Folder (Dark Grey) - Offset Middle */}
                <path d="M25 20 H55 L60 27 H75 C77.76 27 80 29.24 80 32 V80 C80 82.76 77.76 85 75 85 H25 C22.24 85 20 82.76 20 80 V25 C20 22.24 22.24 20 25 20Z"
                    fill="#333333" stroke="#444444" strokeWidth="1" />

                {/* Front Folder (Brand Orange) - Front */}
                <g filter="url(#dropshadow)">
                    <path d="M15 25 H45 L50 32 H65 C67.76 32 70 34.24 70 37 V85 C70 87.76 67.76 90 65 90 H15 C12.24 90 10 87.76 10 85 V30 C10 27.24 12.24 25 15 25Z"
                        fill="url(#folderBright)" />
                    {/* Inner Crease/Highlight for depth */}
                    <path d="M10 37 H70" stroke="white" strokeOpacity="0.15" strokeWidth="1" />
                </g>
            </svg>

            {/* Typography Stack */}
            {!iconOnly && (
                <div className="flex flex-col justify-center">
                    <span
                        className="text-[10px] uppercase tracking-[0.25em] font-medium leading-tight font-sans"
                        style={{ color: "#9CA3AF" }} // Light gray for subtle "Bravvo"
                    >
                        Bravvo
                    </span>
                    <span
                        className="text-[26px] font-bold leading-[0.85] tracking-tight font-sans"
                        style={{ color: color }}
                    >
                        Binder
                    </span>
                </div>
            )}
        </div>
    );
}

export default BravvoLogo;
