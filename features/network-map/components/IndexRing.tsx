import { STATUS_COLOR, STATUS_LABEL, toStatus } from "../status";

type Props = {
  value: number;
  size?: number;
};

const STROKE = 6;

// Кольцевой индикатор индекса эффективности (0–100).
export function IndexRing({ value, size = 96 }: Props) {
  const status = toStatus(value);
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (circumference * value) / 100;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        role="img"
        aria-label={`Индекс эффективности ${value}, ${STATUS_LABEL[status]}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-line"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          stroke={STATUS_COLOR[status]}
          strokeDasharray={`${filled} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-semibold text-2xl text-white tabular-nums leading-none">
          {value}
        </span>
        <span className="mt-1 text-[10px] text-muted uppercase tracking-wider">
          из 100
        </span>
      </div>
    </div>
  );
}
