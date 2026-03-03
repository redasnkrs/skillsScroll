import Link from "next/link";

export default function CategoryPage({ title, items }: { title: string, items: any[] }) {
  return (
    <div className="max-w-4xl min-h-screen">
      <header className="mb-20">
        <p className="text-[10px] font-mono text-zinc-600 mb-4 uppercase tracking-[0.4em]">Index / Archives</p>
        <h1 className="text-5xl font-black uppercase tracking-tight mb-8">{title}</h1>
        <div className="flex gap-4 items-center">
          <span className="text-[10px] font-mono text-zinc-500 uppercase px-2 py-1 border border-zinc-900 rounded">
            {items.length} Entries found
          </span>
          <div className="h-[1px] flex-grow bg-zinc-900"></div>
        </div>
      </header>

      <div className="space-y-12">
        {items.map((item, idx) => (
          <article key={idx} className="group relative">
            <div className="flex items-start gap-12">
              <span className="text-xs font-mono text-zinc-800 font-bold mt-2">
                {(idx + 1).toString().padStart(3, '0')}
              </span>
              <div className="flex-grow">
                <div className="flex justify-between items-baseline mb-4">
                  <h2 className="text-xl font-bold text-zinc-200 group-hover:text-white transition-colors tracking-tight">
                    {item.title}
                  </h2>
                  <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest italic font-medium">
                    {item.category || title}
                  </span>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-2xl border-l border-zinc-900 pl-6 group-hover:border-zinc-700 transition-colors">
                  {item.description}
                </p>
                <div className="mt-6 flex items-center gap-4 opacity-30 group-hover:opacity-100 transition-opacity">
                   <div className="h-[1px] w-8 bg-zinc-700"></div>
                   <Link href={`/game/${item.id}`} className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                     Open Archive Node &rarr;
                   </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <footer className="mt-32 pt-12 border-t border-zinc-900 flex justify-between items-center text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
        <span>Vault Access Logged</span>
        <span>Reda's Digital Repository</span>
      </footer>
    </div>
  );
}
