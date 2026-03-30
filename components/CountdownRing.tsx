"use client";

interface CountdownRingProps {
  seconds: number;
  total: number;
  size?: number;
}

export default function CountdownRing({ seconds, total, size = 64 }: CountdownRingProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? seconds / total : 0;
  const dashOffset = circumference * (1 - progress);

  const color = progress > 0.5 ? "#00e5a0" : progress > 0.25 ? "#facc15" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={4}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
        />
      </svg>
      {/* Seconds label */}
      <span
        className="absolute text-xs font-bold tabular-nums"
        style={{ color }}
      >
        {seconds}
      </span>
    </div>
  );
}
