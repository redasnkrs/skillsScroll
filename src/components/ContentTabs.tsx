"use client";

import { useState, useEffect } from "react";
import { saveBuild, deleteBuild } from "@/app/actions";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import ConfirmModal from "./ConfirmModal";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote";
import { YouTube, StatBlock, Callout } from "./mdx";

const mdxComponents = { YouTube, StatBlock, Callout };

const tabs = ["News", "Speedrun", "Tips", "Builds", "Achievements"];

export default function ContentTabs({ 
  steamNews, 
  speedruns, 
  redditTips, 
  builds,
  achievements
}: { 
  steamNews: any[], 
  speedruns: any[], 
  redditTips: any[],
  builds: any[],
  achievements: any[]
}) {
  const params = useParams();
  const gameId = params.id as string;

  const [activeTab, setActiveTab] = useState("News");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [activeBuild, setActiveBuild] = useState<any | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [buildToDelete, setBuildToDelete] = useState<string | null>(null);
  
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");

  useEffect(() => {
    const checkMode = () => {
      setIsMaintenance(localStorage.getItem("maintenance") === "true");
    };
    checkMode();
    const interval = setInterval(checkMode, 1000);
    return () => clearInterval(interval);
  }, []);

  const autoFixContent = () => {
    let fixed = draftContent;
    fixed = fixed.replace(/\[\$\{DIA-SOURCE\}\]\(dia:\/\/timestamp\?start=.*?\)/g, '');
    fixed = fixed.replace(/dia:\/\/timestamp\?start=.*?(?=\s|$)/g, '');
    fixed = fixed.replace(/^(?![#\-\*\s\d])([A-Z].{2,50})$/gm, '## $1');
    fixed = fixed.replace(/^## ## /gm, '## ');
    fixed = fixed.replace(/^## # /gm, '# ');
    fixed = fixed.replace(/^[ \t]*[*-][ \t]+/gm, '- ');
    fixed = fixed.replace(/(\- .*)\n\n(?=\- )/g, '$1\n');
    const techPatterns = ["Act \\d+", "Level \\d+", "Honor Mode", "Dark Urge", "DEX", "STR", "WIS", "CON", "CHA", "INT", "Gloomstalker", "Assassin", "Fighter", "Cleric", "Sharpshooter", "Titanstring", "Risky Ring", "Nautiloid", "Underdark", "Grymforge", "Moonrise", "Baldur's Gate", "Bloodlust", "Elixir", "Feat", "Longstrider", "Sneak Attack", "Action Surge"];
    techPatterns.forEach(pattern => {
      const reg = new RegExp(`\\b(${pattern})\\b(?![^*]*\\*\\*)`, 'gi');
      fixed = fixed.replace(reg, '**$1**');
    });
    fixed = fixed.replace(/\n{3,}/g, '\n\n');
    fixed = fixed.replace(/^-{3,}$/gm, '---\n');
    fixed = fixed.replace(/^(## .*)\.$/gm, '$1');
    setDraftContent(fixed.trim());
    toast.success("Intelligence Refined", { description: "Technical data has been automatically formatted." });
  };

  const handleSave = async () => {
    if (!draftTitle || !draftContent) return;
    const res = await saveBuild(gameId, draftTitle, draftContent);
    if (res.success) {
      toast.success("Module Archived", { description: "Technical build data committed to permanent storage." });
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const executeDelete = async () => {
    if (!buildToDelete) return;
    const res = await deleteBuild(gameId, buildToDelete);
    if (res.success) {
      toast.success("Data Module Purged", { description: "The build has been removed from archives." });
      setTimeout(() => window.location.reload(), 1500);
    }
    setBuildToDelete(null);
  };

  const formatSteamContent = (html: string) => {
    return html.replace(/\[img\](.*?)\[\/img\]/g, '').replace(/\[b\]/g, '<strong>').replace(/\[\/b\]/g, '</strong>').replace(/\[i\]/g, '<em>').replace(/\[\/i\]/g, '</em>').replace(/\[url=(.*?)\](.*?)\[\/url\]/g, '<a href="$1" target="_blank" class="text-white underline">$2</a>').replace(/\n/g, '<br />');
  };

  return (
    <div className="mt-12">
      <div className="flex gap-8 border-b border-zinc-900 mb-10 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setExpandedIndex(null); setActiveBuild(null); setIsDrafting(false); }}
            className={`pb-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative whitespace-nowrap ${activeTab === tab ? "text-white" : "text-zinc-700 hover:text-zinc-400"}`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"></div>}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* Achievements Tab */}
        {activeTab === "Achievements" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
            {achievements.length > 0 ? achievements.map((ach, idx) => (
              <div key={idx} className="flex gap-6 p-6 border border-zinc-900 rounded-xl bg-zinc-950/20 group hover:bg-zinc-900/40 transition-all cursor-default">
                <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-zinc-800 grayscale group-hover:grayscale-0 transition-all duration-500">
                  <Image src={ach.icon} alt={ach.name} fill className="object-cover" />
                </div>
                <div className="flex flex-col justify-center flex-grow">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors uppercase tracking-tight">{ach.name}</h4>
                    {ach.rarity !== null && (
                      <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{ach.rarity}%</span>
                    )}
                  </div>
                  <div className="relative mt-2 min-h-[1.5rem]">
                    <p className={`text-xs leading-relaxed italic transition-all duration-700 ${
                      ach.isSecret ? "text-zinc-800 blur-md group-hover:blur-none group-hover:text-zinc-400 select-none" : "text-zinc-500"
                    }`}>{ach.desc}</p>
                    {ach.isSecret && (
                      <div className="absolute inset-0 flex items-center justify-start pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
                        <span className="px-2 py-0.5 rounded border border-zinc-800 bg-zinc-950 text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600">[ Data Classifiée ]</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )) : <div className="col-span-2 py-32 text-center border border-dashed border-zinc-900 rounded-xl text-zinc-800 text-[10px] font-mono uppercase tracking-[0.4em]">No synchronization with Steam Community Trophies</div>}
          </div>
        )}

        {/* Builds Tab - WITH MDX Support */}
        {activeTab === "Builds" && (
          <div className="animate-in fade-in duration-500">
            {!activeBuild && !isDrafting && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {builds.map((build) => (
                  <div key={build.id} className="relative group">
                    {isMaintenance && (
                      <button onClick={() => { setBuildToDelete(build.id); setIsDeleteModalOpen(true); }} className="absolute top-4 right-4 z-20 w-6 h-6 rounded-full bg-red-900/50 text-red-200 flex items-center justify-center hover:bg-red-600 transition-all border border-red-900 shadow-xl opacity-0 group-hover:opacity-100">×</button>
                    )}
                    <button onClick={() => setActiveBuild(build)} className="w-full p-10 border border-zinc-900 rounded-xl bg-zinc-950/20 hover:bg-zinc-900/40 transition-all text-left">
                      <span className="text-[10px] font-mono text-zinc-700 uppercase mb-4 block tracking-[0.3em]">Technical Guide</span>
                      <h3 className="text-2xl font-black text-zinc-200 group-hover:text-white transition-colors tracking-tight uppercase leading-tight">{build.title}</h3>
                      <div className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-all">Execute Access &rarr;</div>
                    </button>
                  </div>
                ))}
                <button onClick={() => setIsDrafting(true)} className="p-10 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center hover:bg-zinc-900/20 transition-all group">
                  <span className="text-3xl mb-4 text-zinc-700 group-hover:text-white transition-colors">+</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400">Initialize New Data Module</span>
                </button>
              </div>
            )}

            {isDrafting && (
              <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                  <button onClick={() => setIsDrafting(false)} className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-600 hover:text-white">&larr; ABORT DRAFT</button>
                  <div className="flex gap-4">
                    <button onClick={autoFixContent} className="px-6 py-2 rounded-full border border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all">Auto-Fix & Format</button>
                    <button onClick={handleSave} className="px-6 py-2 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all">Commit to Archive</button>
                  </div>
                </div>
                <input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} placeholder="ARCHIVE_TITLE" className="w-full bg-transparent border-b border-zinc-900 py-4 text-2xl font-black uppercase tracking-tighter text-white outline-none focus:border-zinc-500" />
                <textarea value={draftContent} onChange={(e) => setDraftContent(e.target.value)} placeholder="PASTE RAW README / NOTES HERE... (Support MDX like <YouTube id='...' />)" className="w-full h-[500px] bg-zinc-950 p-8 rounded-2xl border border-zinc-900 font-mono text-sm text-zinc-400 outline-none focus:border-zinc-700 resize-none" />
              </div>
            )}

            {activeBuild && (
              <div className="animate-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                  <button onClick={() => setActiveBuild(null)} className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-600 hover:text-white flex items-center gap-3 transition-colors">&larr; Return to Manifest</button>
                  {isMaintenance && (
                    <button onClick={() => { setBuildToDelete(activeBuild.id); setIsDeleteModalOpen(true); }} className="text-[10px] font-bold uppercase tracking-[0.4em] text-red-900 hover:text-red-500 transition-colors">Terminate Module [DEL]</button>
                  )}
                </div>
                <div className="mdx-content bg-black p-12 lg:p-20 rounded-3xl border border-zinc-900 leading-relaxed font-light text-zinc-400 shadow-2xl">
                  {activeBuild.mdxSource && (
                    <MDXRemote {...activeBuild.mdxSource} components={mdxComponents} />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <ConfirmModal 
          isOpen={isDeleteModalOpen}
          title="Data Module Erasure"
          message="Confirm permanent deletion of this build guide? This process cannot be reversed once initialized."
          onConfirm={executeDelete}
          onCancel={() => { setIsDeleteModalOpen(false); setBuildToDelete(null); }}
        />

        {/* Speedrun, News, Tips unchanged */}
        {activeTab === "Speedrun" && (
          <div className="overflow-hidden border border-zinc-900 rounded-xl bg-zinc-950/20 animate-in fade-in duration-500">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-zinc-900/50 border-b border-zinc-900"><th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Category</th><th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Player</th><th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Time</th><th className="p-6 text-right pr-10 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Proof</th></tr></thead>
              <tbody className="divide-y divide-zinc-900">
                {speedruns.length > 0 ? speedruns.map((run, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="p-6 text-xs font-bold text-zinc-300">{run.category}</td>
                    <td className="p-6 text-xs text-zinc-500 italic">u/{run.player}</td>
                    <td className="p-6 text-xs font-mono text-white">{run.time}</td>
                    <td className="p-6 text-right pr-10"><a href={run.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-white transition-colors border-b border-zinc-900 hover:border-white pb-1">DATA &rarr;</a></td>
                  </tr>
                )) : <tr><td colSpan={4} className="p-20 text-center text-[10px] font-mono text-zinc-800 uppercase tracking-widest">No speedrun data found</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "News" && steamNews.map((item, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <article key={idx} className={`group p-10 border border-zinc-900 rounded-xl transition-all ${isExpanded ? "bg-zinc-900/40 border-zinc-700" : "bg-zinc-950/20 hover:bg-zinc-900/40"}`}>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-zinc-200 group-hover:text-white transition-colors max-w-xl tracking-tight">{item.title}</h3>
                <span className="text-[10px] font-mono text-zinc-800 group-hover:text-zinc-600 transition-colors shrink-0">{item.date}</span>
              </div>
              {isExpanded ? <div className="text-sm text-zinc-400 leading-relaxed font-light animate-in fade-in slide-in-from-top-2 duration-500" dangerouslySetInnerHTML={{ __html: formatSteamContent(item.fullContent) }} /> : <p className="text-sm text-zinc-500 leading-relaxed line-clamp-3 italic opacity-60">"{item.desc}"</p>}
              <div className="mt-10 flex items-center gap-6"><button onClick={() => setExpandedIndex(isExpanded ? null : idx)} className="text-[10px] font-bold uppercase tracking-widest text-white border-b border-zinc-800 hover:border-white transition-all pb-1">{isExpanded ? "Terminate Session" : "Access Intelligence"}</button></div>
            </article>
          );
        })}

        {activeTab === "Tips" && redditTips.map((tip, idx) => (
          <article key={idx} className="group p-10 border border-zinc-900 rounded-xl bg-zinc-950/20 hover:bg-zinc-900/40 transition-all">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-zinc-200 group-hover:text-white transition-colors max-w-xl tracking-tight">{tip.title}</h3>
              <div className="flex flex-col items-end"><span className="text-[10px] font-mono text-zinc-800 uppercase">u/{tip.author}</span><span className="text-[10px] font-mono text-white font-bold mt-1 tracking-tighter">SCORE: {tip.score}</span></div>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed line-clamp-4 italic mb-8 opacity-60">"{tip.desc}"</p>
            <a href={tip.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-white transition-colors border-b border-zinc-900 hover:border-white pb-1">Connect to Source &rarr;</a>
          </article>
        ))}
      </div>
    </div>
  );
}
