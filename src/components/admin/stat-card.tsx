interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  accent: string;
  barColor: string;
}

export function StatCard({ label, value, sub, accent, barColor }: StatCardProps) {
  return (
    <div className="rounded-xl border border-exam-border bg-exam-white p-4.5">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-exam-muted">
        {label}
      </div>
      <div className="mb-1 text-[30px] font-black leading-none text-exam-text">
        {value}
      </div>
      <div className="text-xs text-exam-muted">{sub}</div>
      <div className={`mt-2.5 h-0.5 rounded-full ${accent}`}>
        <div className={`h-full w-[65%] rounded-full ${barColor}`} />
      </div>
    </div>
  );
}
