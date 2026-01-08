"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LevelSelectorProps {
  onSelect: (difficulty: "easy" | "medium" | "hard") => void;
}

export default function LevelSelector({ onSelect }: LevelSelectorProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const levels = [
    {
      id: "easy",
      label: "Junior Detective",
      desc: "Forensic time 10s. Subpoena time 30s. Clearer witness statements.",
      color: "border-green-800 text-green-900",
    },
    {
      id: "medium",
      label: "Lead Investigator",
      desc: "Forensic time 30s. Subpoena time 60s. Clear witness statements",
      color: "border-amber-700 text-amber-900",
    },
    {
      id: "hard",
      label: "Special Agent",
      desc: "Forensic time 60s. Subpoena time 60s. Unreliable witnesses",
      color: "border-red-900 text-red-950",
    },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full bg-[#fdf6e3] border-[12px] border-stone-900 p-12 shadow-[20px_20px_0px_rgba(0,0,0,0.3)] relative"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <div className="w-24 h-24 border-4 border-stone-900 rounded-full flex items-center justify-center font-black text-4xl">
            TOP SECRECY
          </div>
        </div>

        <header className="mb-12 border-b-4 border-stone-900 pb-6">
          <p className="text-red-700 font-black uppercase tracking-[0.3em] text-xs mb-2">
            Protocol Selection Required
          </p>
          <h1 className="text-6xl font-black uppercase tracking-tighter text-stone-900">
            Case Difficulty
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {levels.map((level) => (
            <motion.button
              key={level.id}
              whileHover={{ y: -5, x: 2 }}
              onHoverStart={() => setHovered(level.id)}
              onHoverEnd={() => setHovered(null)}
              onClick={() => onSelect(level.id as any)}
              className={`p-6 border-4 bg-white/50 text-left transition-all ${
                hovered === level.id
                  ? `${level.color} shadow-[8px_8px_0px_currentColor]`
                  : "border-stone-300 text-stone-400 grayscale"
              }`}
            >
              <p className="font-mono text-[10px] uppercase mb-4 opacity-50">
                Lvl_{level.id.toUpperCase()}
              </p>
              <h3 className="font-black text-2xl uppercase leading-none mb-4">
                {level.label}
              </h3>
              <p className="text-xs font-bold leading-relaxed normal-case">
                {level.desc}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
