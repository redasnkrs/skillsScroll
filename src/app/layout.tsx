import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import fs from "fs/promises";
import path from "path";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillScrolls | Private Library",
  description: "Technical archives.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const GAMES_PATH = path.join(process.cwd(), "src/data/games.json");
  const CATS_PATH = path.join(process.cwd(), "src/data/categories.json");
  
  const gamesFile = await fs.readFile(GAMES_PATH, "utf8");
  const catsFile = await fs.readFile(CATS_PATH, "utf8");
  
  const games = JSON.parse(gamesFile);
  const categories = JSON.parse(catsFile);

  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#000000] text-zinc-300 flex min-h-screen`}>
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-zinc-900 flex flex-col fixed h-full bg-[#000000]">
          <div className="p-10">
            <Link href="/" className="text-sm font-bold tracking-[0.4em] flex items-center gap-3">
              <div className="w-2 h-2 bg-white"></div>
              SKILLSCROLLS
            </Link>
          </div>
          
          <nav className="flex-grow p-8 space-y-12">
            <div>
              <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em] px-2 mb-6">Archives</p>
              <ul className="space-y-1">
                {categories.map((cat: any) => (
                  <li key={cat.id}>
                    <Link href={`/archive/${cat.id}`} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-zinc-900 transition-colors text-xs font-medium text-zinc-400 hover:text-white">
                      <span className="grayscale group-hover:grayscale-0">{cat.icon}</span> {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em] px-2 mb-6">Collections</p>
              <ul className="space-y-1 italic">
                {games.slice(0, 5).map((game: any) => (
                  <li key={game.id}>
                    <Link href={`/?game=${game.id}`} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-zinc-900 transition-colors text-xs text-zinc-600 hover:text-zinc-400">
                      {game.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-grow ml-64 bg-[#050505] min-h-screen">
          <div className="max-w-5xl mx-auto p-12 lg:p-24">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
