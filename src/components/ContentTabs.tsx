"use client";

import { useState } from "react";

const tabs = ["News", "Speedrun", "Tips", "Builds"];

export default function ContentTabs({ 
  steamNews, 
  speedruns, 
  redditTips, 
  builds 
}: { 
  steamNews: any[], 
  speedruns: any[], 
  redditTips: any[],
  builds: any[]
}) {
  const [activeTab, setActiveTab] = useState("News");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [activeBuild, setActiveBuild] = useState<any | null>(null);

  const formatMarkdown = (md: string) => {
    return md
      .replace(/^# (.*$)/gm, '<h1 class="text-4xl font-black uppercase tracking-tighter mb-8 mt-12 text-white border-b-4 border-zinc-900 pb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold uppercase tracking-[0.2em] mb-6 mt-16 text-zinc-100 flex items-center gap-4"><span class="w-2 h-2 bg-white"></span>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mb-4 mt-10 text-zinc-300 italic">$1</h3>')
      .replace(/^\- (.*$)/gm, '<div class="flex gap-3 mb-2 text-zinc-400"><span class="text-zinc-700">•</span><span>$1</span></div>')
      .replace(/^\* (.*$)/gm, '<div class="flex gap-3 mb-2 text-zinc-400"><span class="text-zinc-700">•</span><span>$1</span></div>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-zinc-50 font-bold">$1</strong>')
      .replace(/---/g, '<hr class="border-zinc-900 my-12" />')
      .replace(/\n/g, '<br />');
  };

  const formatSteamContent = (html: string) => {
    return html
      .replace(/\[img\](.*?)\[\/img\]/g, '')
      .replace(/\[b\]/g, '<strong>').replace(/\[\/b\]/g, '</strong>')
      .replace(/\[i\]/g, '<em>').replace(/\[\/i\]/g, '</em>')
      .replace(/\[url=(.*?)\](.*?)\[\/url\]/g, '<a href="$1" target="_blank" class="text-white underline">$2</a>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="mt-12">
      <div className="flex gap-8 border-b border-zinc-900 mb-10 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setExpandedIndex(null);
              setActiveBuild(null);
            }}
            className={`pb-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative whitespace-nowrap ${
              activeTab === tab ? "text-white" : "text-zinc-700 hover:text-zinc-400"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"></div>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === "Builds" && (
          <div className="animate-in fade-in duration-500">
            {!activeBuild ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {builds.length > 0 ? (
                  builds.map((build) => (
                    <button
                      key={build.id}
                      onClick={() => setActiveBuild(build)}
                      className="p-10 border border-zinc-900 rounded-xl bg-zinc-950/20 hover:bg-zinc-900/40 transition-all text-left group"
                    >
                      <span className="text-[10px] font-mono text-zinc-700 uppercase mb-4 block tracking-[0.3em]">Module / Build Guide</span>
                      <h3 className="text-2xl font-black text-zinc-200 group-hover:text-white transition-colors tracking-tight uppercase leading-tight">{build.title}</h3>
                      <div className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-all">
                        Execute Access Sequence &rarr;
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="col-span-2 py-32 text-center border border-dashed border-zinc-900 rounded-xl text-zinc-800 text-[10px] font-mono uppercase tracking-[0.4em]">
                    No technical data indexed for this node
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
                <button 
                  onClick={() => setActiveBuild(null)}
                  className="mb-12 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-600 hover:text-white flex items-center gap-3 transition-colors"
                >
                  &larr; Return to Manifest
                </button>
                <div 
                  className="prose prose-invert max-w-none bg-black p-12 lg:p-20 rounded-3xl border border-zinc-900 leading-relaxed font-light text-zinc-400 shadow-2xl"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(activeBuild.content) }}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === "Speedrun" && (
          <div className="overflow-hidden border border-zinc-900 rounded-xl bg-zinc-950/20 animate-in fade-in duration-500">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/50 border-b border-zinc-900">
                  <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Category</th>
                  <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Player</th>
                  <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Time</th>
                  <th className="p-6 text-right pr-10 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {speedruns.length > 0 ? (
                  speedruns.map((run, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="p-6 text-xs font-bold text-zinc-300">{run.category}</td>
                      <td className="p-6 text-xs text-zinc-500 italic">u/{run.player}</td>
                      <td className="p-6 text-xs font-mono text-white">{run.time}</td>
                      <td className="p-6 text-right pr-10">
                        <a href={run.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-white transition-colors border-b border-zinc-900 hover:border-white pb-1">
                          DATA &rarr;
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="p-20 text-center text-[10px] font-mono text-zinc-800 uppercase tracking-widest">No speedrun data found</td></tr>
                )}
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
              {isExpanded ? (
                <div className="text-sm text-zinc-400 leading-relaxed font-light animate-in fade-in slide-in-from-top-2 duration-500" dangerouslySetInnerHTML={{ __html: formatSteamContent(item.fullContent) }} />
              ) : (
                <p className="text-sm text-zinc-500 leading-relaxed line-clamp-3 italic opacity-60">"{item.desc}"</p>
              )}
              <div className="mt-10 flex items-center gap-6">
                <button onClick={() => setExpandedIndex(isExpanded ? null : idx)} className="text-[10px] font-bold uppercase tracking-widest text-white border-b border-zinc-800 hover:border-white transition-all pb-1">
                  {isExpanded ? "Terminate Session" : "Access Intelligence"}
                </button>
              </div>
            </article>
          );
        })}

        {activeTab === "Tips" && redditTips.map((tip, idx) => (
          <article key={idx} className="group p-10 border border-zinc-900 rounded-xl bg-zinc-950/20 hover:bg-zinc-900/40 transition-all">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-zinc-200 group-hover:text-white transition-colors max-w-xl tracking-tight">{tip.title}</h3>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-zinc-800 uppercase">u/{tip.author}</span>
                <span className="text-[10px] font-mono text-white font-bold mt-1 tracking-tighter">SCORE: {tip.score}</span>
              </div>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed line-clamp-4 italic mb-8 opacity-60">"{tip.desc}"</p>
            <a href={tip.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-white transition-colors border-b border-zinc-900 hover:border-white pb-1">
              Connect to Source &rarr;
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
