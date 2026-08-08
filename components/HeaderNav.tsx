"use client";

import React, { useState, useEffect } from "react";
import { Short_Stack } from "next/font/google";
import CharacterAvatar from "./CharacterAvatar";

const handDrawn = Short_Stack({ weight: "400", subsets: ["latin"] });

interface HeaderNavProps {
  caseNumber: string | number;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  onOpenAccusation: () => void;
}

const DIFFICULTY_CONFIG: Record<
  "easy" | "medium" | "hard",
  { label: string; color: string }
> = {
  easy: {
    label: "Junior",
    color: "bg-green-100 text-green-800 border-green-300",
  },
  medium: {
    label: "Lead",
    color: "bg-amber-100 text-amber-800 border-amber-300",
  },
  hard: {
    label: "Expert",
    color: "bg-red-100 text-red-800 border-red-300",
  },
};

export default function HeaderNav({
  caseNumber,
  title,
  difficulty = "easy",
  onOpenAccusation,
}: HeaderNavProps) {
  const [userName, setUserName] = useState("Unknown");

  useEffect(() => {
    try {
      const storedName = localStorage.getItem("userName");
      if (storedName) {
        setUserName(storedName);
      }
    } catch {}
  }, []);

  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.easy;

  return (
    <header
      className={`${handDrawn.className} sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200 px-6 py-4 shadow-sm`}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-wide">
              Case #{caseNumber}
            </h1>
            <p className="text-sm text-stone-600">{title}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}
          >
            {config.label} Detective
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <CharacterAvatar
              seed={userName}
              className="w-10 h-10 rounded-full overflow-hidden object-cover"
            />
            <div className="text-stone-700 font-medium">
              Det.{" "}
              <span className="text-blue-600 underline underline-offset-4 decoration-2">
                {userName}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAccusation}
            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            File Accusation
          </button>
        </div>
      </div>
    </header>
  );
}
