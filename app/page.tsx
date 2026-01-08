"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Short_Stack } from "next/font/google";
import LandingView from "./components/LandingView";
import BriefingView from "./components/BriefingView";
import LevelSelector from "./components/LevelSelector"; // Import the new component
import DossierView from "./components/DossierView";

const handDrawn = Short_Stack({
  weight: "400",
  subsets: ["latin"],
});

export default function Home() {
  // Steps: 1 (Landing), 2 (Briefing), 3 (Level Selection), 4 (Main Game)
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );

  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    if (savedName) setName(savedName);
  }, []);

  const handleNameUpdate = (newName: string) => {
    setName(newName);
    localStorage.setItem("userName", newName);
  };

  const handleLevelSelect = (level: "easy" | "medium" | "hard") => {
    setDifficulty(level);
    setStep(4); // Move to the Dossier
  };

  return (
    <main
      className={`${
        handDrawn.className
      } min-h-screen relative flex items-center justify-center overflow-hidden p-4 
      ${
        step >= 3
          ? "bg-[#1a1a1a]"
          : "bg-[#e5e5e1] transition-colors duration-1000"
      }`}
    >
      {/* Procedural Desk Texture (Visible from Level Selector onwards) */}
      {step >= 3 && (
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: `radial-gradient(circle at 50% 50%, #444 0%, #000 100%)`,
            filter: "contrast(120%) brightness(80%)",
          }}
        />
      )}

      <div className="relative w-full max-w-6xl h-auto min-h-[600px] z-10">
        <AnimatePresence mode="wait">
          {step === 1 && <LandingView onProceed={() => setStep(2)} />}

          {step === 2 && (
            <BriefingView
              name={name}
              onNameChange={handleNameUpdate}
              agreed={agreed}
              onAgreeChange={setAgreed}
              onEnterScene={() => setStep(3)} // Proceed to Level Selector
            />
          )}

          {step === 3 && <LevelSelector onSelect={handleLevelSelect} />}

          {step === 4 && (
            <DossierView
              difficulty={difficulty} // Passing difficulty to the game logic
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
