"use client";

export function YouTube({ id }: { id: string }) {
  return (
    <div className="my-8 aspect-video w-full overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950 shadow-2xl">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export function StatBlock({ label, value, color = "white" }: { label: string, value: string, color?: string }) {
  return (
    <div className="my-4 flex items-center justify-between rounded-xl border border-zinc-900 bg-zinc-950/50 p-4">
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</span>
      <span className="font-mono text-sm font-bold" style={{ color }}>{value}</span>
    </div>
  );
}

export function Callout({ children, type = "info" }: { children: React.ReactNode, type?: "info" | "warning" | "danger" }) {
  const colors = {
    info: "border-zinc-800 bg-zinc-900/20 text-zinc-400",
    warning: "border-amber-900/50 bg-amber-950/10 text-amber-500",
    danger: "border-red-900/50 bg-red-950/10 text-red-500"
  };

  return (
    <div className={`my-6 rounded-xl border p-6 text-sm leading-relaxed italic ${colors[type]}`}>
      {children}
    </div>
  );
}
