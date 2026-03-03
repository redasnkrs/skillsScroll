import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import Image from "next/image";
import ContentTabs from "@/components/ContentTabs";
import { notFound } from "next/navigation";
import { getSpeedrunData, getRedditTips, getBuildsForGame, getSteamAchievements } from "@/app/actions";

async function getSteamNews(steamId: number | null) {
  if (!steamId) return [];
  try {
    const res = await fetch(
      `https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${steamId}&count=5&maxlength=300&format=json`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    return data.appnews.newsitems.map((item: any) => ({
      title: item.title,
      desc: item.contents.replace(/<[^>]*>/g, '').substring(0, 200) + "...",
      fullContent: item.contents,
      date: new Date(item.date * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      url: item.url
    }));
  } catch (e) {
    console.error("Steam News Fetch Error:", e);
    return [];
  }
}

export default async function GamePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const DATA_PATH = path.join(process.cwd(), "src/data/games.json");
  const file = await fs.readFile(DATA_PATH, "utf8");
  const games = JSON.parse(file);
  
  const game = games.find((g: any) => g.id === id);

  if (!game) {
    notFound();
  }

  // Quintuple fetch simultané (News, Speedrun, Reddit Tips, Local Builds, Achievements)
  const [steamNews, speedruns, redditTips, builds, achievements] = await Promise.all([
    getSteamNews(game.steamId),
    getSpeedrunData(game.name),
    getRedditTips(game.name),
    getBuildsForGame(id),
    getSteamAchievements(game.steamId)
  ]);

  return (
    <div className="max-w-5xl animate-in fade-in duration-700">
      <nav className="mb-12 flex justify-between items-center text-[10px] font-mono uppercase tracking-[0.4em]">
        <Link href="/" className="text-zinc-600 hover:text-white transition-colors">
          &larr; INDEX
        </Link>
        <span className="text-zinc-800">VAULT NODE / {game.id}</span>
      </nav>

      <header className="relative h-[400px] rounded-2xl overflow-hidden border border-zinc-900 group shadow-2xl">
        {game.imageUrl && (
          <Image
            src={game.imageUrl}
            alt={game.name}
            fill
            priority
            className="object-cover opacity-40 blur-[1px] scale-105 group-hover:scale-110 transition-transform duration-[2s]"
          />
        )}
        <div className="relative z-10 h-full p-12 flex flex-col justify-end bg-gradient-to-t from-black via-black/40 to-transparent">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl grayscale group-hover:grayscale-0 transition-all duration-500">{game.icon}</span>
            <div className="h-[1px] w-12 bg-zinc-700"></div>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase mb-4 leading-none">{game.name}</h1>
          <p className="text-sm font-mono text-zinc-500 uppercase tracking-[0.4em]">{game.category} Archives</p>
        </div>
      </header>

      <ContentTabs 
        steamNews={steamNews} 
        speedruns={speedruns} 
        redditTips={redditTips} 
        builds={builds} 
        achievements={achievements}
      />

      <footer className="mt-40 pt-12 border-t border-zinc-950 flex justify-between items-center text-[10px] font-mono text-zinc-800 uppercase tracking-[0.4em]">
        <span>Automated Data Node</span>
        <span>Secure Local Storage</span>
      </footer>
    </div>
  );
}
