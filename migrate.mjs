import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('🚀 Starting migration...');

  // 1. Categories
  try {
    const catsData = await fs.readFile('src/data/categories.json', 'utf8');
    const cats = JSON.parse(catsData);
    console.log(`- Migrating ${cats.length} categories...`);
    for (const cat of cats) {
      await supabase.from('categories').upsert({
        id: cat.id,
        name: cat.name,
        icon: cat.icon
      });
    }
  } catch (e) { console.log('No categories to migrate or error:', e.message); }

  // 2. Games
  try {
    const gamesData = await fs.readFile('src/data/games.json', 'utf8');
    const games = JSON.parse(gamesData);
    console.log(`- Migrating ${games.length} games...`);
    for (const game of games) {
      await supabase.from('games').upsert({
        id: game.id,
        steam_id: game.steamId,
        name: game.name,
        category_id: game.category.toLowerCase().replace(/\s+/g, "-"),
        icon: game.icon,
        image_url: game.imageUrl
      });
    }
  } catch (e) { console.log('No games to migrate or error:', e.message); }

  // 3. Builds
  try {
    const buildsDir = 'src/data/builds';
    const gameFolders = await fs.readdir(buildsDir);
    console.log(`- Migrating builds from ${gameFolders.length} game folders...`);
    for (const gameId of gameFolders) {
      const dirPath = path.join(buildsDir, gameId);
      const stat = await fs.stat(dirPath);
      if (!stat.isDirectory()) continue;

      const files = await fs.readdir(dirPath);
      for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const content = await fs.readFile(path.join(dirPath, file), 'utf8');
        const title = content.split('\n')[0].replace('# ', '');
        await supabase.from('builds').upsert({
          id: file.replace('.md', ''),
          game_id: gameId,
          title: title,
          content: content
        });
      }
    }
  } catch (e) { console.log('No builds to migrate or error:', e.message); }

  console.log('✅ Migration complete!');
}

migrate();
