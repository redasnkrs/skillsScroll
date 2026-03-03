import Link from "next/link";
import ContentTabs from "@/components/ContentTabs";
import GameHero from "@/components/GameHero";
import { notFound } from "next/navigation";
import { getSpeedrunData, getRedditTips, getBuildsForGame, getSteamAchievements } from "@/app/actions";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { serialize } from "next-mdx-remote/serialize";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = await params;
  const { data: game } = await supabase.from('games').select('*').eq('id', id).single();
  
  if (!game) return { title: "Game Not Found" };

  const ogUrl = new URL('https://skillscrolls.vercel.app/api/og');
  ogUrl.searchParams.set('title', game.name);
  ogUrl.searchParams.set('category', game.category_id);
  if (game.image_url) ogUrl.searchParams.set('image', game.image_url);

  return {
    title: `${game.name} | SkillScrolls`,
    description: `Technical archive for ${game.name}. Strategies, builds, news and speedruns.`,
    openGraph: {
      images: [ogUrl.toString()],
    },
  };
}

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
  } catch (e) { return []; }
}

export default async function GamePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const { data: game, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !game) {
    notFound();
  }

  // Quintuple fetch simultané
  const [steamNews, speedruns, redditTips, rawBuilds, achievements] = await Promise.all([
    getSteamNews(game.steam_id),
    getSpeedrunData(game.name),
    getRedditTips(game.name),
    getBuildsForGame(id),
    getSteamAchievements(game.steam_id)
  ]);

  // Sérialisation MDX pour chaque build
  const builds = await Promise.all(rawBuilds.map(async (build: any) => {
    const mdxSource = await serialize(build.content);
    return {
      ...build,
      mdxSource
    };
  }));

  return (
    <div className="max-w-5xl animate-in fade-in duration-700">
      <nav className="mb-12 flex justify-between items-center text-[10px] font-mono uppercase tracking-[0.4em]">
        <Link href="/" className="text-zinc-600 hover:text-white transition-colors">
          &larr; INDEX
        </Link>
        <span className="text-zinc-800">VAULT NODE / {game.id}</span>
      </nav>

      <GameHero game={game} />

      <ContentTabs 
        steamNews={steamNews} 
        speedruns={speedruns} 
        redditTips={redditTips} 
        builds={builds} 
        achievements={achievements}
      />

      <footer className="mt-40 pt-12 border-t border-zinc-950 flex justify-between items-center text-[10px] font-mono text-zinc-800 uppercase tracking-[0.4em]">
        <span>Automated Data Node</span>
        <span>Secure Cloud Storage</span>
      </footer>
    </div>
  );
}
