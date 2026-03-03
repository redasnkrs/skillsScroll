"use client";

import { useState } from "react";

const tabs = ["News", "Speedrun", "Tips"];

export default function ContentTabs({ steamNews }: { steamNews: any[] }) {
  const [activeTab, setActiveTab] = useState("News");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const staticContent: Record<string, any[]> = {
    Speedrun: [
      { date: "02.03.2026", title: "Any% Unrestricted: 12:45", desc: "New world record using the recently discovered Limgrave skip." },
      { date: "25.02.2026", title: "Glitchless Route Optimization", desc: "Saving 15 seconds in the mid-game through better stamina management." }
    ],
    Tips: [
      { date: "01.03.2026", title: "Boss Strategy: Malenia", desc: "Detailed breakdown of the Waterfowl Dance evasion timing." },
      { date: "24.02.2026", title: "Hidden Mechanics Explained", desc: "How poise works under the hood and how to exploit it." }
    ]
  };

  const getActiveItems = () => {
    if (activeTab === "News") return steamNews;
    return staticContent[activeTab] || [];
  };

  const items = getActiveItems();

  // Fonction pour "nettoyer" grossièrement le BBCode/HTML de Steam pour l'affichage
  const formatSteamContent = (html: string) => {
    return html
      .replace(/\[img\](.*?)\[\/img\]/g, '') // Enlever les images BBCode pour la sobriété
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
        {items.length > 0 ? (
          items.map((item, idx) => {
            const isExpanded = expandedIndex === idx && activeTab === "News";
            
            return (
              <article 
                key={idx} 
                className={`group p-8 border border-zinc-900 rounded-lg transition-all ${
                  isExpanded ? "bg-zinc-900/40 border-zinc-700" : "bg-zinc-950/20 hover:bg-zinc-900/40"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-zinc-200 group-hover:text-white transition-colors max-w-xl">
                    {item.title}
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-800 group-hover:text-zinc-600 transition-colors shrink-0">
                    {item.date}
                  </span>
                </div>

                {isExpanded ? (
                  <div 
                    className="text-sm text-zinc-400 leading-relaxed font-light animate-in fade-in slide-in-from-top-2 duration-500"
                    dangerouslySetInnerHTML={{ __html: formatSteamContent(item.fullContent) }}
                  />
                ) : (
                  <p className="text-sm text-zinc-500 leading-relaxed line-clamp-3 italic">
                    {item.desc}
                  </p>
                )}

                <div className="mt-8 flex items-center gap-6">
                  {activeTab === "News" && (
                    <button 
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="text-[10px] font-bold uppercase tracking-widest text-white border-b border-zinc-700 hover:border-white transition-all pb-1"
                    >
                      {isExpanded ? "Close Reader" : "Read Full Entry"}
                    </button>
                  )}
                  
                  {item.url && (
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      Steam Link &rarr;
                    </a>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <div className="py-20 text-center border border-dashed border-zinc-900 rounded-lg text-zinc-700 text-xs font-mono uppercase tracking-widest">
            No entries found in this archive node
          </div>
        )}
      </div>
    </div>
  );
}
