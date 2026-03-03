"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import DeleteGameButton from "./DeleteGameButton";

export default function GameCard({ game, priority }: { game: any, priority: boolean }) {
  return (
    <div className="relative group">
      <DeleteGameButton gameId={game.id} />
      <Link href={`/game/${game.id}`}>
        <motion.div 
          layoutId={`game-card-${game.id}`}
          className="block relative h-64 rounded-lg border border-zinc-900 bg-zinc-950 overflow-hidden hover:border-zinc-500 transition-all duration-500 shadow-2xl"
        >
          {game.image_url && (
            <motion.div 
              layoutId={`game-image-${game.id}`}
              className="absolute inset-0 z-0 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 opacity-20 group-hover:opacity-60"
            >
              <Image
                src={game.image_url}
                alt={game.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority={priority}
              />
            </motion.div>
          )}
          
          <div className="relative z-10 p-10 h-full flex flex-col justify-end bg-gradient-to-t from-black via-black/40 to-transparent">
            <motion.div layoutId={`game-icon-${game.id}`} className="text-2xl mb-4 grayscale group-hover:grayscale-0 transition-all">
              {game.icon}
            </motion.div>
            <motion.h3 layoutId={`game-title-${game.id}`} className="text-lg font-bold mb-1 text-white tracking-tight">
              {game.name}
            </motion.h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-medium">{game.category_id}</p>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}
