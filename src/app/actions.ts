"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

const GAMES_PATH = path.join(process.cwd(), "src/data/games.json");
const CATS_PATH = path.join(process.cwd(), "src/data/categories.json");

// Mappeur intelligent Genre -> Emoji
const emojiMap: Record<string, string> = {
  "Action": "⚔️",
  "RPG": "🎭",
  "Strategy": "♟️",
  "Adventure": "🗺️",
  "Simulation": "🚜",
  "Sports": "⚽",
  "Racing": "🏎️",
  "Casual": "☕",
  "Indie": "💎",
  "Shooter": "🔫",
  "Horror": "👻",
  "Puzzle": "🧩",
  "Survival": "⛺",
  "Default": "📁"
};

async function getSteamData(gameName: string) {
  try {
    // 1. Recherche de l'ID du jeu
    const searchRes = await fetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(gameName)}&l=english&cc=US`);
    const searchData = await searchRes.json();

    if (searchData.total > 0 && searchData.items[0]) {
      const appid = searchData.items[0].id;
      
      // 2. Récupération des détails (genres)
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
  } catch (e) { console.error("Steam Fetch Error:", e); }
  return null;
}

export async function addGameAuto(formData: FormData) {
  const inputName = formData.get("name") as string;
  if (!inputName) return { error: "Name required" };

  const steamData = await getSteamData(inputName);
  if (!steamData) return { error: "Game not found" };

  // 1. Gérer les catégories automatiquement
  const catsFile = await fs.readFile(CATS_PATH, "utf8");
  const categories = JSON.parse(catsFile);
  const catId = steamData.category.toLowerCase().replace(/\s+/g, "-");

  if (!categories.find((c: any) => c.id === catId)) {
    categories.push({ id: catId, name: steamData.category, icon: steamData.icon });
    await fs.writeFile(CATS_PATH, JSON.stringify(categories, null, 2));
  }

  // 2. Ajouter le jeu
  const gamesFile = await fs.readFile(GAMES_PATH, "utf8");
  const games = JSON.parse(gamesFile);
  const gameId = steamData.name.toLowerCase().replace(/\s+/g, "-");

  if (games.find((g: any) => g.id === gameId)) {
    return { error: "Game already indexed" };
  }

  games.push({
    id: gameId,
    steamId: steamData.id,
    name: steamData.name,
    category: steamData.category,
    icon: steamData.icon,
    imageUrl: steamData.imageUrl
  });

  await fs.writeFile(GAMES_PATH, JSON.stringify(games, null, 2));
  revalidatePath("/");
  return { success: true };
}

export async function getSpeedrunData(gameName: string) {
  try {
    // 1. Trouver le jeu sur Speedrun.com
    const gameRes = await fetch(`https://www.speedrun.com/api/v1/games?name=${encodeURIComponent(gameName)}`);
    const gameData = await gameRes.json();
    
    if (!gameData.data || gameData.data.length === 0) return [];
    const gameId = gameData.data[0].id;

    // 2. Récupérer les catégories et les leaderboards (top 1)
    const categoryRes = await fetch(`https://www.speedrun.com/api/v1/games/${gameId}/categories`);
    const categoryData = await categoryRes.json();
    
    const topRuns = await Promise.all(
      categoryData.data.slice(0, 3).map(async (cat: any) => {
        const lbRes = await fetch(`https://www.speedrun.com/api/v1/leaderboards/${gameId}/category/${cat.id}?top=1&embed=players`);
        const lbData = await lbRes.json();
        
        if (!lbData.data || !lbData.data.runs || lbData.data.runs.length === 0) return null;
        
        const run = lbData.data.runs[0];

        const timeInSeconds = run.run.times.primary_t;
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        
        const formattedTime = [
          hours > 0 ? hours.toString().padStart(2, '0') : null,
          minutes.toString().padStart(2, '0'),
          seconds.toString().padStart(2, '0')
        ].filter(Boolean).join(':');

        return {
          category: cat.name,
          player: lbData.data.players.data[0]?.names?.international || "Unknown",
          time: formattedTime,
          date: new Date(run.run.date).toLocaleDateString('fr-FR'),
          url: run.run.weblink
        };
      })
    );

    return topRuns.filter(Boolean);
  } catch (e) {
    console.error("Speedrun API Error:", e);
    return [];
  }
}

export async function getRedditTips(gameName: string) {
  try {
    const res = await fetch(
      `https://www.reddit.com/search.json?q=${encodeURIComponent(gameName)}+tips+guide&sort=relevance&t=all&limit=5`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    
    return data.data.children.map((child: any) => ({
      title: child.data.title,
      desc: child.data.selftext.substring(0, 250) + "...",
      author: child.data.author,
      score: child.data.score,
      date: new Date(child.data.created_utc * 1000).toLocaleDateString('fr-FR'),
      url: `https://www.reddit.com${child.data.permalink}`
    }));
  } catch (e) {
    console.error("Reddit API Error:", e);
    return [];
  }
}

export async function getSteamAchievements(steamId: number | null) {
  if (!steamId) return [];
  try {
    const url = `https://steamcommunity.com/stats/${steamId}/achievements/`;
    const res = await fetch(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
      next: { revalidate: 86400 } 
    });
    const html = await res.text();

    const achievements: any[] = [];
    
    // Découpage par bloc de ligne de trophée (plus robuste)
    const blocks = html.split('<div class="achieveRow');
    blocks.shift(); // On enlève le premier morceau qui précède le premier trophée

    blocks.forEach(block => {
      const name = block.match(/<h3>(.*?)<\/h3>/)?.[1];
      const desc = block.match(/<h5>(.*?)<\/h5>/)?.[1];
      const icon = block.match(/<img src="(.*?)"/)?.[1];
      const percentMatch = block.match(/<div class="achievePercent">(.*?)%<\/div>/);
      const rarity = percentMatch ? parseFloat(percentMatch[1]) : null;

      if (name && icon) {
        achievements.push({
          name: name.trim(),
          desc: desc ? desc.trim() : "Secret achievement",
          icon: icon,
          rarity: rarity
        });
      }
    });

    return achievements;
  } catch (e) {
    console.error("Steam Achievements Scraping Error:", e);
    return [];
  }
}

export async function getBuildsForGame(gameId: string) {
  try {
    const buildsDir = path.join(process.cwd(), "src/data/builds", gameId);
    try {
      const files = await fs.readdir(buildsDir);
      const builds = await Promise.all(
        files.map(async (file) => {
          if (!file.endsWith(".md")) return null;
          const content = await fs.readFile(path.join(buildsDir, file), "utf8");
          const title = content.split('\n')[0].replace('# ', '');
          return {
            id: file.replace('.md', ''),
            title,
            content
          };
        })
      );
      return builds.filter(Boolean);
    } catch {
      return [];
    }
  } catch (e) {
    console.error("Builds read error:", e);
    return [];
  }
}

export async function saveBuild(gameId: string, title: string, content: string) {
  try {
    const buildsDir = path.join(process.cwd(), "src/data/builds", gameId);
    await fs.mkdir(buildsDir, { recursive: true });
    
    const fileName = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + ".md";
    const filePath = path.join(buildsDir, fileName);
    
    // On s'assure que le titre est bien en H1 au début du fichier
    const finalContent = content.startsWith("# ") ? content : `# ${title}\n\n${content}`;
    
    await fs.writeFile(filePath, finalContent);
    revalidatePath(`/game/${gameId}`);
    return { success: true };
  } catch (e) {
    console.error("Save build error:", e);
    return { error: "Failed to save build" };
  }
}

export async function deleteGame(gameId: string) {
  try {
    const file = await fs.readFile(GAMES_PATH, "utf8");
    const games = JSON.parse(file);
    const updatedGames = games.filter((g: any) => g.id !== gameId);
    await fs.writeFile(GAMES_PATH, JSON.stringify(updatedGames, null, 2));
    
    // Supprimer aussi le dossier de builds associé
    const buildsDir = path.join(process.cwd(), "src/data/builds", gameId);
    await fs.rm(buildsDir, { recursive: true, force: true });
    
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("Delete game error:", e);
    return { error: "Failed to delete game" };
  }
}

export async function deleteBuild(gameId: string, buildId: string) {
  try {
    const filePath = path.join(process.cwd(), "src/data/builds", gameId, `${buildId}.md`);
    await fs.unlink(filePath);
    revalidatePath(`/game/${gameId}`);
    return { success: true };
  } catch (e) {
    console.error("Delete build error:", e);
    return { error: "Failed to delete build" };
  }
}

export async function searchSteamGames(query: string) {
  if (!query || query.length < 2) return [];
  
  try {
    const res = await fetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=english&cc=US`);
    const data = await res.json();

    if (data.total > 0 && data.items) {
      return data.items.slice(0, 5).map((item: any) => ({
        id: item.id,
        name: item.name,
        imageUrl: `https://cdn.akamai.steamstatic.com/steam/apps/${item.id}/header.jpg`
      }));
    }
  } catch (e) {
    console.error("Steam Search Error:", e);
  }
  return [];
}
