"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import CombinedLandingView from "./components/LandingView";
import DossierView from "./components/DossierView";

export default function Home() {
  const [gameState, setGameState] = useState<"setup" | "playing">("setup");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [userName, setUserName] = useState("");

  const handleStartGame = (
    selectedDifficulty: "easy" | "medium" | "hard",
    name: string
  ) => {
    setDifficulty(selectedDifficulty);
    setUserName(name);
    setGameState("playing");
  };

  return (
    <main className="min-h-screen bg-stone-50">
      <AnimatePresence mode="wait">
        {gameState === "setup" && (
          <CombinedLandingView onStartGame={handleStartGame} />
        )}

        {gameState === "playing" && <DossierView difficulty={difficulty} />}
      </AnimatePresence>
    </main>
  );
}
