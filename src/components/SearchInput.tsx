"use client";

import { useState, useEffect, useRef } from "react";
import { searchSteamGames, addGameAuto } from "@/app/actions";
import { toast } from "sonner";

export default function SearchInput() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      const results = await searchSteamGames(query);
      setSuggestions(results);
      setIsSearching(false);
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = async (formData: FormData) => {
    const res = await addGameAuto(formData);
    if (res.success) {
      toast.success("Intelligence Synchronized", {
        description: "The game node has been successfully integrated into the library."
      });
      setQuery("");
    } else {
      toast.error("Synchronization Failure", {
        description: res.error || "An unknown error occurred during archiving."
      });
    }
  };

  return (
    <section className="mb-24 bg-zinc-950 p-12 rounded-2xl border border-zinc-900 border-dashed">
      <div className="max-w-md mx-auto text-center" ref={containerRef}>
        <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.4em] mb-8">One-Tap Archiving</p>
        
        <form action={handleAction} className="flex flex-col gap-6 relative">
          <div className="relative">
            <input 
              name="name" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search & Add Game..." 
              className="w-full bg-transparent border-b border-zinc-800 text-xl py-4 text-center focus:border-white outline-none text-white font-light tracking-tight transition-colors"
              autoComplete="off"
              required
            />
            
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden z-50 shadow-2xl">
                {suggestions.map((game) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => {
                      setQuery(game.name);
                      setSuggestions([]);
                    }}
                    className="w-full flex items-center gap-4 p-3 hover:bg-zinc-800 text-left transition-colors border-b border-zinc-800 last:border-0"
                  >
                    <img src={game.imageUrl} alt={game.name} className="w-16 h-8 object-cover rounded" />
                    <span className="text-xs text-zinc-300 font-medium truncate">{game.name}</span>
                  </button>
                ))}
              </div>
            )}
            
            {isSearching && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-zinc-700 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="text-[10px] font-bold uppercase tracking-[0.2em] px-8 py-4 border border-zinc-800 bg-zinc-900 hover:bg-white hover:text-black transition-all rounded-full self-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSearching}
          >
            Add to Library +
          </button>
        </form>
      </div>
    </section>
  );
}
