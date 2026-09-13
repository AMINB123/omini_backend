export default function Logo({ withText = true }: { withText?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <svg width="32" height="32" viewBox="-27 -27 54 54" role="img" aria-label="Omini">
        <circle
          r="18"
          fill="none"
          stroke="#8134AF"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="31.4 9.4"
          strokeDashoffset="0"
          transform="rotate(-90)"
        />
        <circle
          r="18"
          fill="none"
          stroke="#25D366"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="31.4 9.4"
          strokeDashoffset="-37.7"
          transform="rotate(-90)"
        />
        <circle
          r="18"
          fill="none"
          stroke="#229ED9"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="31.4 9.4"
          strokeDashoffset="-75.4"
          transform="rotate(-90)"
        />
        <path
          d="M0,-7 L1.8,-1.8 L7,0 L1.8,1.8 L0,7 L-1.8,1.8 L-7,0 L-1.8,-1.8 Z"
          fill="#05070A"
        />
      </svg>
      {withText && (
        <span className="text-xl font-bold text-ink" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          Omini
        </span>
      )}
    </div>
  );
}