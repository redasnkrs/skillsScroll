"use client";

import { useState, useEffect } from "react";

export default function MaintenanceToggle() {
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    setIsOn(localStorage.getItem("maintenance") === "true");
  }, []);

  const toggle = () => {
    const newVal = !isOn;
    setIsOn(newVal);
    localStorage.setItem("maintenance", newVal.toString());
    // On dispatch un event pour que les autres composants soient au courant immédiatement
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <button 
      onClick={toggle}
      className={`w-full px-4 py-3 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${
        isOn 
          ? "bg-red-950/20 text-red-500 border-red-900/50 hover:bg-red-900/30" 
          : "bg-zinc-950 text-zinc-700 border-zinc-900 hover:text-zinc-500 hover:border-zinc-800"
      }`}
    >
      {isOn ? "Maintenance: Active" : "System: Locked"}
    </button>
  );
}
