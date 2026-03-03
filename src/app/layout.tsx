import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import MaintenanceToggle from "@/components/MaintenanceToggle";
import { Toaster } from "sonner";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import PageTransition from "@/components/PageTransition";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillScrolls | Technical Archive",
  description: "Advanced gaming knowledge base.",
};

async function getSidebarData() {
  const [catsRes, gamesRes, buildsCountRes] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('games').select('*').order('created_at', { ascending: false }).limit(6),
    supabase.from('builds').select('*', { count: 'exact', head: true })
  ]);

  return {
    categories: catsRes.data || [],
    recentGames: gamesRes.data || [],
    gamesCount: (await supabase.from('games').select('*', { count: 'exact', head: true })).count || 0,
    buildsCount: buildsCountRes.count || 0
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const data = await getSidebarData();

  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#000000] text-zinc-300 flex min-h-screen`}>
        <aside className="w-72 border-r border-zinc-900 flex flex-col fixed h-full bg-[#000000] z-40">
          <div className="p-8 border-b border-zinc-900">
            <Link href="/" className="group flex flex-col gap-1">
              <span className="text-[10px] font-mono text-zinc-600 tracking-[0.5em]">V.2026.03</span>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <h1 className="text-sm font-black tracking-[0.2em] text-white uppercase">SkillScrolls</h1>
              </div>
            </Link>
          </div>
          
          <nav className="flex-grow p-6 space-y-10 overflow-y-auto no-scrollbar">
            <div>
              <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.3em] px-2 mb-4">Data Sections</p>
              <ul className="space-y-1">
                {data.categories.map((cat: any) => (
                  <li key={cat.id}>
                    <Link href={`/archive/${cat.id}`} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-950 transition-all group border border-transparent hover:border-zinc-900 text-[11px] text-zinc-500 hover:text-zinc-200">
                      <span className="flex items-center gap-3">
                        <span className="grayscale group-hover:grayscale-0">{cat.icon}</span>
                        {cat.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.3em] px-2 mb-4">Quick Access</p>
              <ul className="space-y-1 italic">
                {data.recentGames.map((game: any) => (
                  <li key={game.id}>
                    <Link href={`/game/${game.id}`} className="flex items-center gap-3 px-3 py-2 text-[11px] text-zinc-600 hover:text-zinc-300 transition-all">
                      <span className="text-zinc-800 font-mono">/</span> {game.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-zinc-900/50">
              <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.3em] px-2 mb-6">Archive Monitor</p>
              <div className="space-y-4 px-2">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-zinc-600">Games Indexed</span>
                  <span className="text-zinc-400">{data.gamesCount}</span>
                </div>
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-zinc-600">Build Modules</span>
                  <span className="text-zinc-400">{data.buildsCount}</span>
                </div>
              </div>
            </div>
          </nav>

          <div className="p-6 border-t border-zinc-900 bg-zinc-950/20">
            <MaintenanceToggle />
          </div>
        </aside>

        <main className="flex-grow ml-72 bg-[#050505] min-h-screen">
          <div className="max-w-5xl mx-auto p-12 lg:p-24 overflow-hidden">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
        
        <Toaster theme="dark" position="bottom-right" richColors toastOptions={{
          style: { background: '#090a0c', border: '1px solid #18181b', color: '#d4d4d8' }
        }} />
      </body>
    </html>
  );
}
