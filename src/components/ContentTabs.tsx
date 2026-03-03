"use client";

import { useState } from "react";

const tabs = ["News", "Speedrun", "Tips"];

export default function ContentTabs({ steamNews, speedruns, redditTips }: { steamNews: any[], speedruns: any[], redditTips: any[] }) {
  const [activeTab, setActiveTab] = useState("News");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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
      <div className="flex gap-8 border-b border-zinc-900 mb-10">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setExpandedIndex(null);
            }}
            className={`pb-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative ${
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
        {/* Speedrun Tab */}
        {activeTab === "Speedrun" && (
          <div className="overflow-hidden border border-zinc-900 rounded-lg bg-zinc-950/20 animate-in fade-in duration-500">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/50 border-b border-zinc-900">
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Category</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Player</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Time</th>
                  <th className="p-4 text-right pr-8 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {speedruns.length > 0 ? (
                  speedruns.map((run, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="p-4 text-xs font-bold text-zinc-200">{run.category}</td>
                      <td className="p-4 text-xs text-zinc-400">{run.player}</td>
                      <td className="p-4 text-xs font-mono text-white">{run.time}</td>
                      <td className="p-4 text-right pr-8">
                        <a href={run.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                          RECORD &rarr;
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
                      No speedrun data indexed
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* News Tab */}
        {activeTab === "News" && steamNews.map((item, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <article key={idx} className={`group p-8 border border-zinc-900 rounded-lg transition-all ${isExpanded ? "bg-zinc-900/40 border-zinc-700" : "bg-zinc-950/20 hover:bg-zinc-900/40"}`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-zinc-200 group-hover:text-white transition-colors max-w-xl">{item.title}</h3>
                <span className="text-[10px] font-mono text-zinc-800 group-hover:text-zinc-600 transition-colors shrink-0">{item.date}</span>
              </div>
              {isExpanded ? (
                <div className="text-sm text-zinc-400 leading-relaxed font-light animate-in fade-in slide-in-from-top-2 duration-500" dangerouslySetInnerHTML={{ __html: formatSteamContent(item.fullContent) }} />
              ) : (
                <p className="text-sm text-zinc-500 leading-relaxed line-clamp-3 italic">"{item.desc}"</p>
              )}
              <div className="mt-8 flex items-center gap-6">
                <button onClick={() => setExpandedIndex(isExpanded ? null : idx)} className="text-[10px] font-bold uppercase tracking-widest text-white border-b border-zinc-700 hover:border-white transition-all pb-1">
                  {isExpanded ? "Close Reader" : "Read Full Entry"}
                </button>
              </div>
            </article>
          );
        })}

        {/* Tips Tab (Reddit) */}
        {activeTab === "Tips" && redditTips.map((tip, idx) => (
          <article key={idx} className="group p-8 border border-zinc-900 rounded-lg bg-zinc-950/20 hover:bg-zinc-900/40 transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-zinc-200 group-hover:text-white transition-colors max-w-xl">{tip.title}</h3>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-zinc-800 uppercase">u/{tip.author}</span>
                <span className="text-[10px] font-mono text-emerald-900 font-bold">+{tip.score} UPVOTES</span>
              </div>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed line-clamp-4 italic mb-6">"{tip.desc}"</p>
            <a href={tip.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-white transition-colors border-b border-zinc-900 hover:border-white pb-1">
              Read Community Discussion &rarr;
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
