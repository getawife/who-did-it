"use client";

import React, { useState, useEffect } from "react";
import CharacterAvatar from "./CharacterAvatar";

interface HeaderNavProps {
  caseNumber: string | number;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  onOpenAccusation: () => void;
}

export default function HeaderNav({
  caseNumber,
  title,
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

  return (
    <header className="sticky top-0 z-40 bg-parchment-card/95 backdrop-blur-md border-b-2 border-stone-800 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-stone-900 tracking-wide">
                Case #{caseNumber}
              </h1>
            </div>
            <p className="text-sm font-semibold text-stone-700">{title}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <CharacterAvatar
              seed={userName}
              className="w-10 h-10 rounded-full border-2 border-stone-800 overflow-hidden object-cover"
            />
            <div className="text-stone-900 font-bold text-sm">
              Det.{" "}
              <span className="text-stone-900 font-extrabold underline underline-offset-4 decoration-2">
                {userName}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAccusation}
            className="px-5 py-2.5 bg-stone-800 hover:bg-stone-900 text-parchment-main border-2 border-stone-800 rounded-xl font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            File Accusation
          </button>
        </div>
      </div>
    </header>
  );
}
