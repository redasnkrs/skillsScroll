"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin as supabase } from "@/lib/supabase";

const emojiMap: Record<string, string> = {
  "Action": "⚔️", "RPG": "🎭", "Strategy": "♟️", "Adventure": "🗺️",
  "Simulation": "🚜", "Sports": "⚽", "Racing": "🏎️", "Casual": "☕",
  "Indie": "💎", "Shooter": "🔫", "Horror": "👻", "Puzzle": "🧩",
  "Survival": "⛺", "Default": "📁"
};

async function getSteamData(gameName: string) {
  try {
    const searchRes = await fetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(gameName)}&l=english&cc=US`);
    const searchData = await searchRes.json();
    if (searchData.total > 0 && searchData.items[0]) {
      const appid = searchData.items[0].id;
      const detailsRes = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}`);
      const detailsData = await detailsRes.json();
      if (detailsData[appid].success) {
        const data = detailsData[appid].data;
        const mainGenre = data.genres?.[0]?.description || "Action";
        return {
          id: appid,
          name: data.name,
          category: mainGenre,
          imageUrl: `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`,
          icon: emojiMap[mainGenre] || emojiMap["Default"]
        };
      }
    }
  } catch (e) { console.error(e); }
  return null;
}

export async function addGameAuto(formData: FormData) {
  const inputName = formData.get("name") as string;
  if (!inputName) return { error: "Name required" };
  const steamData = await getSteamData(inputName);
  if (!steamData) return { error: "Game not found" };

  const catId = steamData.category.toLowerCase().replace(/\s+/g, "-");
  await supabase.from('categories').upsert({ id: catId, name: steamData.category, icon: steamData.icon });

  const gameId = steamData.name.toLowerCase().replace(/\s+/g, "-").replace(/'/g, '');
  const { error } = await supabase.from('games').insert({
    id: gameId, steam_id: steamData.id, name: steamData.name, category_id: catId, icon: steamData.icon, image_url: steamData.imageUrl
  });

  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}

export async function getSpeedrunData(gameName: string) {
  try {
    const gameRes = await fetch(`https://www.speedrun.com/api/v1/games?name=${encodeURIComponent(gameName)}`);
    const gameData = await gameRes.json();
    if (!gameData.data || gameData.data.length === 0) return [];
    const gameId = gameData.data[0].id;
    const categoryRes = await fetch(`https://www.speedrun.com/api/v1/games/${gameId}/categories`);
    const categoryData = await categoryRes.json();
    const topRuns = await Promise.all(
      categoryData.data.slice(0, 3).map(async (cat: any) => {
        const lbRes = await fetch(`https://www.speedrun.com/api/v1/leaderboards/${gameId}/category/${cat.id}?top=1&embed=players`);
        const lbData = await lbRes.json();
        if (!lbData.data || !lbData.data.runs || lbData.data.runs.length === 0) return null;
        const run = lbData.data.runs[0];
        const t = run.run.times.primary_t;
        const formattedTime = [Math.floor(t / 3600), Math.floor((t % 3600) / 60), Math.floor(t % 60)].map(v => v.toString().padStart(2, '0')).join(':');
        return { category: cat.name, player: lbData.data.players.data[0]?.names?.international || "Unknown", time: formattedTime, url: run.run.weblink };
      })
    );
    return topRuns.filter(Boolean);
  } catch (e) { return []; }
}

export async function getRedditTips(gameName: string) {
  try {
    const res = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(gameName)}+tips+guide&sort=relevance&t=all&limit=5`, { next: { revalidate: 3600 } });
    const data = await res.json();
    return data.data.children.map((child: any) => ({
      title: child.data.title, desc: child.data.selftext.substring(0, 250) + "...", author: child.data.author, score: child.data.score, url: `https://www.reddit.com${child.data.permalink}`
    }));
  } catch (e) { return []; }
}

export async function getSteamAchievements(steamId: number | null) {
  if (!steamId) return [];
  try {
    const url = `https://steamcommunity.com/stats/${steamId}/achievements/`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 86400 } });
    const html = await res.text();
    const achievements: any[] = [];
    const blocks = html.split(/<div class="achieveRow\s*">/);
    blocks.shift();
    blocks.forEach(block => {
      const name = block.match(/<h3>(.*?)<\/h3>/)?.[1]?.trim();
      const desc = block.match(/<h5>([\s\S]*?)<\/h5>/)?.[1]?.trim() || "";
      const icon = block.match(/<img src="(.*?)"/)?.[1];
      const pMatch = block.match(/<div class="achievePercent">(.*?)%<\/div>/);
      const rarity = pMatch ? parseFloat(pMatch[1]) : null;
      if (name && icon) {
        const isSecret = block.includes("achieveHidden") || desc.toLowerCase().includes("hidden achievement");
        
        // Texte de secours pour les secrets pour éviter le vide
        const finalDesc = desc || (isSecret ? "Classified information. Access restricted to authorized personnel only." : "No additional data found in this node.");

        achievements.push({ 
          name, 
          desc: finalDesc, 
          icon, 
          rarity, 
          isSecret: !!isSecret 
        });
      }
    });
    return achievements.sort((a, b) => (a.rarity || 0) - (b.rarity || 0));
  } catch (e) { return []; }
}

export async function getBuildsForGame(gameId: string) {
  const { data, error } = await supabase.from('builds').select('*').eq('game_id', gameId);
  return error ? [] : data;
}

export async function saveBuild(gameId: string, title: string, content: string) {
  const buildId = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const { error } = await supabase.from('builds').upsert({ id: buildId, game_id: gameId, title, content: content.startsWith("# ") ? content : `# ${title}\n\n${content}` });
  if (error) return { error: error.message };
  revalidatePath(`/game/${gameId}`);
  return { success: true };
}

export async function deleteGame(gameId: string) {
  const { error } = await supabase.from('games').delete().eq('id', gameId);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { success: true };
}

export async function deleteBuild(gameId: string, buildId: string) {
  const { error } = await supabase.from('builds').delete().eq('id', buildId);
  if (error) return { error: error.message };
  revalidatePath(`/game/${gameId}`);
  return { success: true };
}

export async function searchSteamGames(query: string) {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=english&cc=US`);
    const data = await res.json();
    return data.items?.slice(0, 5).map((item: any) => ({ id: item.id, name: item.name, imageUrl: `https://cdn.akamai.steamstatic.com/steam/apps/${item.id}/header.jpg` })) || [];
  } catch { return []; }
}
