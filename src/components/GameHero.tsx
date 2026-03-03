"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function GameHero({ game }: { game: any }) {
  return (
    <motion.header 
      layoutId={`game-card-${game.id}`}
      className="relative h-[400px] rounded-2xl overflow-hidden border border-zinc-900 group shadow-2xl"
    >
      {game.image_url && (
        <motion.div 
          layoutId={`game-image-${game.id}`}
          className="absolute inset-0 z-0 opacity-40 blur-[1px]"
        >
          <Image
            src={game.image_url}
            alt={game.name}
            fill
            priority
            className="object-cover scale-105"
          />
        </motion.div>
      )}
      <div className="relative z-10 h-full p-12 flex flex-col justify-end bg-gradient-to-t from-black via-black/40 to-transparent">
        <div className="flex items-center gap-4 mb-6">
          <motion.span layoutId={`game-icon-${game.id}`} className="text-4xl grayscale group-hover:grayscale-0 transition-all duration-500">
            {game.icon}
          </motion.span>
          <div className="h-[1px] w-12 bg-zinc-700"></div>
        </div>
        <motion.h1 layoutId={`game-title-${game.id}`} className="text-6xl font-black text-white tracking-tighter uppercase mb-4 leading-none">
          {game.name}
        </motion.h1>
        <p className="text-sm font-mono text-zinc-500 uppercase tracking-[0.4em]">{game.category_id} Archives</p>
      </div>
    </motion.header>
  );
}
