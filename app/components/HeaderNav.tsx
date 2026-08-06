"use client";

import React from "react";
import { Short_Stack } from "next/font/google";

const handDrawn = Short_Stack({ weight: "400", subsets: ["latin"] });

interface HeaderNavProps {
  caseNumber: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  onOpenAccusation: () => void;
}

const DIFFICULTY_CONFIG = {
  easy: {
    label: "Junior",
    color: "bg-green-100 text-green-800 border-green-300",
  },
  medium: {
    label: "Lead",
    color: "bg-amber-100 text-amber-800 border-amber-300",
  },
  hard: { label: "Expert", color: "bg-red-100 text-red-800 border-red-300" },
};

export default function HeaderNav({
  caseNumber,
  title,
  difficulty,
  onOpenAccusation,
}: HeaderNavProps) {
  const userName =
    typeof window !== "undefined"
      ? localStorage.getItem("userName") || "Unknown"
      : "Unknown";

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
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${DIFFICULTY_CONFIG[difficulty].color}`}
          >
            {DIFFICULTY_CONFIG[difficulty].label} Detective
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-stone-700 font-medium">
            Det.{" "}
            <span className="text-blue-600 underline underline-offset-4 decoration-2">
              {userName}
            </span>
          </div>
          <button
            onClick={onOpenAccusation}
            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
          >
            File Accusation 🚨
          </button>
        </div>
      </div>
    </header>
  );
}
