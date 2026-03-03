import Link from "next/link";
import fs from "fs/promises";
import path from "path";
import { addGameAuto } from "./actions";

export default async function Home() {
  const GAMES_PATH = path.join(process.cwd(), "src/data/games.json");
  const CATS_PATH = path.join(process.cwd(), "src/data/categories.json");
  
  const gamesFile = await fs.readFile(GAMES_PATH, "utf8");
  const catsFile = await fs.readFile(CATS_PATH, "utf8");
  
  const games = JSON.parse(gamesFile);
  const categories = JSON.parse(catsFile);

  return (
    <div className="max-w-5xl">
      <header className="mb-20">
        <h1 className="text-3xl font-black mb-4 tracking-tight uppercase">Private Knowledge Base</h1>
        <div className="h-1 w-12 bg-zinc-800"></div>
      </header>

      {/* Ajout Auto - Champ unique */}
      <section className="mb-24 bg-zinc-950 p-12 rounded-2xl border border-zinc-900 border-dashed">
        <div className="max-w-md mx-auto text-center">
          <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.4em] mb-8">One-Tap Archiving</p>
          <form action={addGameAuto} className="flex flex-col gap-6">
            <input 
              name="name" 
              placeholder="Search & Add Game..." 
              className="bg-transparent border-b border-zinc-800 text-xl py-4 text-center focus:border-white outline-none text-white font-light tracking-tight transition-colors"
              required
            />
            <button 
              type="submit" 
              className="text-[10px] font-bold uppercase tracking-[0.2em] px-8 py-4 border border-zinc-800 bg-zinc-900 hover:bg-white hover:text-black transition-all rounded-full self-center"
            >
              Add to Library +
            </button>
          </form>
        </div>
      </section>

      {/* Grid de Jeux */}
      <section className="mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {games.map((game: any) => (
            <Link 
              key={game.id} 
              href={`/?game=${game.id}`}
              className="group relative h-64 rounded-lg border border-zinc-900 bg-zinc-950 overflow-hidden hover:border-zinc-500 transition-all duration-500"
            >
              {game.imageUrl && (
                <div 
                  className="absolute inset-0 z-0 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 opacity-20 group-hover:opacity-60"
                  style={{ backgroundImage: `url(${game.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
              )}
              <div className="relative z-10 p-10 h-full flex flex-col justify-end bg-gradient-to-t from-black via-black/20 to-transparent">
                <div className="text-2xl mb-4 grayscale group-hover:grayscale-0 transition-all">{game.icon}</div>
                <h3 className="text-lg font-bold mb-1 text-white tracking-tight">{game.name}</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-medium">{game.category}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Liste des Catégories Créées Auto */}
      <section className="mb-32 border-t border-zinc-900 pt-20">
        <h2 className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.3em] mb-12">Detected Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat: any) => (
            <Link key={cat.id} href={`/archive/${cat.id}`} className="p-4 border border-zinc-900 rounded bg-zinc-950/40 hover:bg-zinc-900 transition-all flex items-center gap-4 group">
              <span className="text-lg grayscale group-hover:grayscale-0">{cat.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
