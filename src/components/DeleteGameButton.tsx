"use client";

import { deleteGame } from "@/app/actions";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import ConfirmModal from "./ConfirmModal";

export default function DeleteGameButton({ gameId }: { gameId: string }) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkMode = () => {
      setIsMaintenance(localStorage.getItem("maintenance") === "true");
    };
    checkMode();
    const interval = setInterval(checkMode, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isMaintenance) return null;

  const handleDelete = async () => {
    const res = await deleteGame(gameId);
    if (res.success) {
      toast.success("Node terminated successfully", {
        description: `Entry ${gameId} has been purged from archives.`
      });
    } else {
      toast.error("Termination failed", {
        description: "An error occurred during the purge sequence."
      });
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-red-900/80 text-white flex items-center justify-center hover:bg-red-600 transition-all border border-red-500 shadow-xl opacity-0 group-hover:opacity-100"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <ConfirmModal 
        isOpen={isModalOpen}
        title="Node Termination"
        message={`Are you sure you want to permanently purge ${gameId} and all associated data from the library?`}
        onConfirm={handleDelete}
        onCancel={() => setIsModalOpen(false)}
      />
    </>
  );
}
