import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import fs from "fs/promises";
import path from "path";
import "./globals.css";
import MaintenanceToggle from "@/components/MaintenanceToggle";
import { Toaster } from "sonner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillScrolls | Technical Archive",
  description: "Advanced gaming knowledge base.",
};

async function getStats() {
  try {
    const GAMES_PATH = path.join(process.cwd(), "src/data/games.json");
    const CATS_PATH = path.join(process.cwd(), "src/data/categories.json");
    const BUILDS_BASE_PATH = path.join(process.cwd(), "src/data/builds");

    const [gamesFile, catsFile] = await Promise.all([
      fs.readFile(GAMES_PATH, "utf8"),
      fs.readFile(CATS_PATH, "utf8")
    ]);

    const games = JSON.parse(gamesFile);
    const categories = JSON.parse(catsFile);
    
    let totalBuilds = 0;
    try {
      const gameFolders = await fs.readdir(BUILDS_BASE_PATH);
      for (const folder of gameFolders) {
        const files = await fs.readdir(path.join(BUILDS_BASE_PATH, folder));
        totalBuilds += files.filter(f => f.endsWith('.md')).length;
      }
    } catch (e) { /* no builds yet */ }

    return { 
      gamesCount: games.length, 
      catsCount: categories.length, 
      buildsCount: totalBuilds,
      games,
      categories
    };
  } catch (e) {
    return { gamesCount: 0, catsCount: 0, buildsCount: 0, games: [], categories: [] };
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const stats = await getStats();

  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#000000] text-zinc-300 flex min-h-screen`}>
        {/* Sidebar - Control Center Style */}
        <aside className="w-72 border-r border-zinc-900 flex flex-col fixed h-full bg-[#000000] z-40 overflow-hidden">
          {/* Header & System Pulse */}
          <div className="p-8 border-b border-zinc-900">
            <Link href="/" className="group flex flex-col gap-1">
              <span className="text-[10px] font-mono text-zinc-600 tracking-[0.5em] group-hover:text-zinc-400 transition-colors">V.2026.03</span>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-25"></div>
                </div>
                <h1 className="text-sm font-black tracking-[0.2em] text-white uppercase">SkillScrolls</h1>
              </div>
            </Link>
          </div>
          
          <nav className="flex-grow p-6 space-y-10 overflow-y-auto no-scrollbar">
            {/* Sections Dynamiques */}
            <div>
              <div className="flex justify-between items-center px-2 mb-4">
                <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.3em]">Data Sections</p>
                <span className="text-[9px] font-mono text-zinc-800">{stats.catsCount} Nodes</span>
              </div>
              <ul className="space-y-1">
                {stats.categories.map((cat: any) => (
                  <li key={cat.id}>
                    <Link href={`/archive/${cat.id}`} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-950 transition-all group border border-transparent hover:border-zinc-900">
                      <span className="text-[11px] font-medium text-zinc-500 group-hover:text-zinc-200 flex items-center gap-3">
                        <span className="grayscale group-hover:grayscale-0 transition-all opacity-50 group-hover:opacity-100">{cat.icon}</span>
                        {cat.name}
                      </span>
                      <div className="w-1 h-1 bg-zinc-800 rounded-full group-hover:bg-zinc-400 transition-colors"></div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links / Recent */}
            <div>
              <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.3em] px-2 mb-4">Quick Access</p>
              <ul className="space-y-1 italic">
                {stats.games.slice(0, 6).map((game: any) => (
                  <li key={game.id}>
                    <Link href={`/game/${game.id}`} className="flex items-center gap-3 px-3 py-2 text-[11px] text-zinc-600 hover:text-zinc-300 hover:translate-x-1 transition-all duration-300">
                      <span className="text-zinc-800 font-mono">/</span> {game.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* System Monitor (Stats) */}
            <div className="pt-4 border-t border-zinc-900/50">
              <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.3em] px-2 mb-6">Archive Monitor</p>
              <div className="space-y-4 px-2">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-zinc-600">Games Indexed</span>
                    <span className="text-zinc-400">{stats.gamesCount}</span>
                  </div>
                  <div className="h-[2px] bg-zinc-900 w-full overflow-hidden">
                    <div className="h-full bg-zinc-700 w-[65%]"></div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-zinc-600">Build Modules</span>
                    <span className="text-zinc-400">{stats.buildsCount}</span>
                  </div>
                  <div className="h-[2px] bg-zinc-900 w-full overflow-hidden">
                    <div className="h-full bg-zinc-700 w-[40%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Bottom Maintenance */}
          <div className="p-6 border-t border-zinc-900 bg-zinc-950/20">
            <MaintenanceToggle />
            <div className="mt-4 flex justify-between items-center px-2">
              <span className="text-[8px] font-mono text-zinc-800 tracking-tighter uppercase">Sync Status: Optimal</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
                <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
                <div className="w-1 h-1 bg-zinc-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow ml-72 bg-[#050505] min-h-screen">
          <div className="max-w-5xl mx-auto p-12 lg:p-24 animate-in fade-in duration-1000">
            {children}
          </div>
        </main>
        
        <Toaster theme="dark" position="bottom-right" richColors toastOptions={{
          style: { background: '#090a0c', border: '1px solid #18181b', color: '#d4d4d8' }
        }} />
      </body>
    </html>
  );
}
