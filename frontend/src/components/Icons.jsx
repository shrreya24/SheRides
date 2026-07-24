/**
 * SheRides Custom Icon Set
 * Style: monochrome line-art, 24×24 viewBox, stroke=currentColor,
 *        strokeWidth=2, strokeLinecap="round", strokeLinejoin="round"
 */

const SVG_BASE = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};

// ── 1. Steering Wheel (Rides) ────────────────────────────────────────────────
export const SteeringWheelIcon = ({ size = 24, className = '', ...props }) => (
    <svg
        width={size} height={size} viewBox="0 0 24 24"
        {...SVG_BASE} className={className} {...props}
    >
        {/* Outer ring */}
        <circle cx="12" cy="12" r="10" />
        {/* Inner hub */}
        <circle cx="12" cy="12" r="3" />
        {/* Three spokes: top, bottom-left, bottom-right */}
        <line x1="12" y1="9" x2="12" y2="2" />
        <line x1="9.6" y1="10.8" x2="3.5" y2="15" />
        <line x1="14.4" y1="10.8" x2="20.5" y2="15" />
        {/* Grip flats on outer ring */}
        <path d="M4 8.5 Q12 5 20 8.5" />
    </svg>
);

// ── 2. Shield Check (Safety / Verification) ──────────────────────────────────
export const ShieldCheckIcon = ({ size = 24, className = '', ...props }) => (
    <svg
        width={size} height={size} viewBox="0 0 24 24"
        {...SVG_BASE} className={className} {...props}
    >
        <path d="M12 2l8 3v6c0 5.5-3.8 10.7-8 12C7.8 21.7 4 16.5 4 11V5l8-3z" />
        <polyline points="9 12 11 14 15 10" />
    </svg>
);

// ── 3. Female User Profile ───────────────────────────────────────────────────
export const FemaleUserIcon = ({ size = 24, className = '', ...props }) => (
    <svg
        width={size} height={size} viewBox="0 0 24 24"
        {...SVG_BASE} className={className} {...props}
    >
        {/* Head */}
        <circle cx="12" cy="7" r="4" />
        {/* Shoulder silhouette – curved neckline */}
        <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
        {/* Venus symbol stem + crossbar */}
        <line x1="12" y1="11" x2="12" y2="15" />
        <line x1="9.5" y1="13.5" x2="14.5" y2="13.5" />
    </svg>
);

// ── 4. Map Pin / Destination Marker ─────────────────────────────────────────
export const MapPinIcon = ({ size = 24, className = '', ...props }) => (
    <svg
        width={size} height={size} viewBox="0 0 24 24"
        {...SVG_BASE} className={className} {...props}
    >
        {/* Teardrop body */}
        <path d="M12 22C12 22 4 15.5 4 9.5a8 8 0 0 1 16 0c0 6-8 12.5-8 12.5z" />
        {/* Inner dot */}
        <circle cx="12" cy="9.5" r="2.5" />
    </svg>
);

// ── 5. Chat Bubble (Messaging) ───────────────────────────────────────────────
export const ChatBubbleIcon = ({ size = 24, className = '', ...props }) => (
    <svg
        width={size} height={size} viewBox="0 0 24 24"
        {...SVG_BASE} className={className} {...props}
    >
        {/* Bubble body */}
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        {/* Three dots inside */}
        <circle cx="9" cy="11" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="11" r="1" fill="currentColor" stroke="none" />
        <circle cx="15" cy="11" r="1" fill="currentColor" stroke="none" />
    </svg>
);
