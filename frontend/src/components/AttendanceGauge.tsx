import { cn } from '../lib/utils';

import type { AttendanceStatusKey } from '../lib/api';

interface AttendanceGaugeProps {
  percentage: number;
  statusKey: AttendanceStatusKey;
  className?: string;
}

/** Semicircle speedometer: red &lt;65%, yellow 65–74%, green ≥75%. */
export function AttendanceGauge({ percentage, statusKey, className }: AttendanceGaugeProps) {
  const pct = Math.max(0, Math.min(100, Number(percentage) || 0));
  const cx = 100;
  const cy = 88;
  const R = 72;
  const sw = 14;

  const angleForPct = (p: number) => Math.PI * (1 - p / 100);
  const polar = (p: number) => {
    const a = angleForPct(p);
    return { x: cx + R * Math.cos(a), y: cy - R * Math.sin(a) };
  };

  const arcPath = (fromPct: number, toPct: number) => {
    const large = Math.abs(toPct - fromPct) > 50 ? 1 : 0;
    const s = polar(fromPct);
    const e = polar(toPct);
    return `M ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const needle = polar(pct);
  const labelColor =
    statusKey === 'safe'
      ? 'text-emerald-400'
      : statusKey === 'condonation'
        ? 'text-amber-400'
        : 'text-red-400';

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <svg viewBox="0 0 200 108" className="w-full max-w-[320px] h-auto drop-shadow-lg">
        <defs>
          <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(239,68,68,0.45)" />
            <stop offset="64%" stopColor="rgba(234,179,8,0.5)" />
            <stop offset="75%" stopColor="rgba(34,197,94,0.55)" />
            <stop offset="100%" stopColor="rgba(34,197,94,0.75)" />
          </linearGradient>
        </defs>
        <path
          d={arcPath(0, 100)}
          fill="none"
          stroke="url(#trackGrad)"
          strokeWidth={sw}
          strokeLinecap="round"
        />
        {[65, 75].map((mark) => {
          const outer = polar(mark);
          const ix = cx + (R - sw - 4) * Math.cos(angleForPct(mark));
          const iy = cy - (R - sw - 4) * Math.sin(angleForPct(mark));
          return (
            <g key={mark}>
              <line
                x1={ix}
                y1={iy}
                x2={outer.x}
                y2={outer.y}
                stroke="rgba(255,255,255,0.45)"
                strokeWidth="2"
              />
              <text
                x={outer.x + (mark === 65 ? -18 : 10)}
                y={outer.y + 4}
                fill="rgba(156,163,175,0.95)"
                fontSize="10"
              >
                {mark}%
              </text>
            </g>
          );
        })}
        <text x={polar(0).x - 6} y={polar(0).y + 20} fill="rgba(156,163,175,0.85)" fontSize="9">
          0%
        </text>
        <text x={polar(100).x - 6} y={polar(100).y + 20} fill="rgba(156,163,175,0.85)" fontSize="9">
          100%
        </text>
        <circle cx={cx} cy={cy} r="8" fill="#1f2937" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        <line
          x1={cx}
          y1={cy}
          x2={needle.x}
          y2={needle.y}
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx={needle.x} cy={needle.y} r="4" fill="white" />
      </svg>
      <div className="mt-2 text-center space-y-1">
        <p className={cn('text-4xl font-bold tabular-nums', labelColor)}>{pct.toFixed(2)}%</p>
        <p className="text-sm text-gray-400">Overall attendance</p>
        <p
          className={cn(
            'text-xs font-medium uppercase tracking-wide',
            statusKey === 'safe' && 'text-emerald-400/90',
            statusKey === 'condonation' && 'text-amber-400/90',
            statusKey === 'detention' && 'text-red-400/90'
          )}
        >
          {statusKey === 'safe' && 'Safe zone — 75% and above'}
          {statusKey === 'condonation' && 'Condonation zone — 65% to 74%'}
          {statusKey === 'detention' && 'Detention risk — below 65%'}
        </p>
      </div>
    </div>
  );
}
