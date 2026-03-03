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
