import Link from "next/link";
import Image from "next/image";
import SearchInput from "@/components/SearchInput";
import DeleteGameButton from "@/components/DeleteGameButton";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export default async function Home() {
  const [gamesRes, catsRes] = await Promise.all([
    supabase.from('games').select('*').order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('name')
  ]);

  const games = gamesRes.data || [];
  const categories = catsRes.data || [];

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-20">
        <h1 className="text-3xl font-black mb-4 tracking-tight uppercase">Private Knowledge Base</h1>
        <div className="h-1 w-12 bg-zinc-800"></div>
      </header>

      <SearchInput />

      <section className="mb-32 mt-20">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.4em]">Indexed Documents</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {games.map((game: any, idx: number) => (
            <div key={game.id} className="relative group">
              <DeleteGameButton gameId={game.id} />
              <Link 
                href={`/game/${game.id}`}
                className="block relative h-64 rounded-lg border border-zinc-900 bg-zinc-950 overflow-hidden hover:border-zinc-500 transition-all duration-500 shadow-2xl"
              >
                {game.image_url && (
                  <div className="absolute inset-0 z-0 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 opacity-20 group-hover:opacity-60">
                    <Image
                      src={game.image_url}
                      alt={game.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      priority={idx < 3}
                    />
                  </div>
                )}
                
                <div className="relative z-10 p-10 h-full flex flex-col justify-end bg-gradient-to-t from-black via-black/40 to-transparent">
                  <div className="text-2xl mb-4 grayscale group-hover:grayscale-0 transition-all">{game.icon}</div>
                  <h3 className="text-lg font-bold mb-1 text-white tracking-tight">{game.name}</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-medium">{game.category_id}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-32 border-t border-zinc-950 pt-20">
        <h2 className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.3em] mb-12">System Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat: any) => (
            <Link key={cat.id} href={`/archive/${cat.id}`} className="p-4 border border-zinc-900 rounded bg-zinc-950/40 hover:bg-zinc-900 transition-all flex items-center gap-4 group text-[11px] text-zinc-500 hover:text-zinc-200">
              <span className="grayscale group-hover:grayscale-0">{cat.icon}</span>
              <span className="font-bold uppercase tracking-widest">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
