"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type Step = "name" | "warning" | "difficulty";
type Difficulty = "easy" | "medium" | "hard";

interface CombinedLandingProps {
  onStartGame: (difficulty: Difficulty, userName: string) => void;
}

export default function CombinedLandingView({
  onStartGame,
}: CombinedLandingProps) {
  const [step, setStep] = useState<Step>("name");
  const [userName, setUserName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty | null>(null);

  const handleStartGame = () => {
    if (selectedDifficulty && userName.trim()) {
      try {
        localStorage.setItem("userName", userName.trim());
      } catch {
        // Ignore localStorage access errors
      }
      onStartGame(selectedDifficulty, userName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-parchment-main flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <AnimatePresence mode="wait">
          {step === "name" && (
            <NameStep
              userName={userName}
              onUserNameChange={setUserName}
              onNext={() => setStep("warning")}
            />
          )}

          {step === "warning" && (
            <WarningStep
              agreed={agreed}
              onAgreedChange={setAgreed}
              onBack={() => setStep("name")}
              onNext={() => setStep("difficulty")}
            />
          )}

          {step === "difficulty" && (
            <DifficultyStep
              selectedDifficulty={selectedDifficulty}
              onSelectDifficulty={setSelectedDifficulty}
              onBack={() => setStep("warning")}
              onStart={handleStartGame}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface NameStepProps {
  userName: string;
  onUserNameChange: (name: string) => void;
  onNext: () => void;
}

function NameStep({ userName, onUserNameChange, onNext }: NameStepProps) {
  const isNameValid = Boolean(userName.trim());

  return (
    <motion.div
      key="name"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-parchment-card rounded-2xl shadow-xl border-2 border-stone-800 overflow-hidden"
    >
      <div className="p-8 text-center">
        <div className="mb-8">
          <div className="inline-block bg-stone-800 text-parchment-main px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 border border-stone-800">
            Who did it?
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 mb-3">
            What should you be called?
          </h1>
          <p className="text-stone-700 font-semibold text-sm">
            Enter your name to begin your investigation
          </p>
        </div>

        <div className="mb-8">
          <input
            type="text"
            value={userName}
            onChange={(e) => onUserNameChange(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 text-lg bg-parchment-main border-2 border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800 text-stone-900 font-bold placeholder:text-stone-400 shadow-inner"
            onKeyDown={(e) => e.key === "Enter" && isNameValid && onNext()}
          />
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!isNameValid}
          className={`w-full py-3.5 rounded-xl font-bold transition-all border-2 border-stone-800 shadow-md ${
            isNameValid
              ? "bg-stone-800 hover:bg-stone-900 text-parchment-main cursor-pointer active:scale-[0.99]"
              : "bg-stone-300 text-stone-500 border-stone-400 cursor-not-allowed"
          }`}
        >
          Continue Investigation
        </button>
      </div>
    </motion.div>
  );
}

interface WarningStepProps {
  agreed: boolean;
  onAgreedChange: (agreed: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}

function WarningStep({
  agreed,
  onAgreedChange,
  onBack,
  onNext,
}: WarningStepProps) {
  return (
    <motion.div
      key="warning"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-parchment-card rounded-2xl shadow-xl border-2 border-stone-800 overflow-hidden"
    >
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center shrink-0">
              <span className="text-parchment-main font-black text-sm">!</span>
            </div>
            <h1 className="text-2xl font-extrabold text-stone-900">
              Content Advisory
            </h1>
          </div>

          <div className="space-y-4 text-stone-800 font-semibold leading-relaxed">
            <p>
              This game contains material depicting criminal acts and violence.
              Some case details may include references to self-harm and
              psychological distress.
            </p>
            <p className="text-sm text-stone-600 italic">
              All investigative scenarios are fiction.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-parchment-main border-2 border-stone-800 rounded-xl mb-8">
          <input
            type="checkbox"
            id="consent"
            checked={agreed}
            onChange={(e) => onAgreedChange(e.target.checked)}
            className="w-5 h-5 mt-0.5 accent-stone-800 cursor-pointer"
          />
          <label
            htmlFor="consent"
            className="text-stone-900 font-bold text-sm cursor-pointer leading-snug"
          >
            I acknowledge the content advisory and agree to proceed with the
            game.
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3.5 border-2 border-stone-800 rounded-xl font-bold text-stone-900 bg-parchment-main hover:bg-parchment-card transition-colors cursor-pointer shadow-sm"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!agreed}
            className={`flex-1 py-3.5 rounded-xl font-bold transition-all border-2 border-stone-800 shadow-md ${
              agreed
                ? "bg-stone-800 hover:bg-stone-900 text-parchment-main cursor-pointer active:scale-[0.99]"
                : "bg-stone-300 text-stone-500 border-stone-400 cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </motion.div>
  );
}

interface DifficultyStepProps {
  selectedDifficulty: Difficulty | null;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onBack: () => void;
  onStart: () => void;
}

const DIFFICULTY_LEVELS = [
  {
    id: "easy" as const,
    title: "Junior Detective",
    description: "Clear evidence, reliable witnesses.",
    time: "10s forensic, 15s subpoenas",
  },
  {
    id: "medium" as const,
    title: "Lead Investigator",
    description: "Standard procedures with some investigative challenges.",
    time: "30s forensic, 60s subpoenas",
  },
  {
    id: "hard" as const,
    title: "Special Agent",
    description: "Complex cases with unreliable sources and limited evidence.",
    time: "60s forensic, 45s subpoenas",
  },
];

function DifficultyStep({
  selectedDifficulty,
  onSelectDifficulty,
  onBack,
  onStart,
}: DifficultyStepProps) {
  return (
    <motion.div
      key="difficulty"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-parchment-card rounded-2xl shadow-xl border-2 border-stone-800 overflow-hidden"
    >
      <div className="p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-stone-900 mb-2">
            Select Case Difficulty
          </h1>
        </div>

        <div className="space-y-4 mb-8">
          {DIFFICULTY_LEVELS.map((level) => {
            const isSelected = selectedDifficulty === level.id;
            return (
              <button
                key={level.id}
                type="button"
                onClick={() => onSelectDifficulty(level.id)}
                className={`w-full p-5 rounded-xl border-2 text-left transition-all cursor-pointer shadow-sm ${
                  isSelected
                    ? "border-stone-800 bg-stone-800 text-parchment-main"
                    : "border-stone-800 bg-parchment-main text-stone-900 hover:bg-parchment-card"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3
                      className={`text-lg font-extrabold mb-1 ${
                        isSelected ? "text-parchment-main" : "text-stone-900"
                      }`}
                    >
                      {level.title}
                    </h3>
                    <p
                      className={`text-xs font-semibold ${
                        isSelected ? "text-stone-300" : "text-stone-700"
                      }`}
                    >
                      {level.description}
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "border-parchment-main bg-parchment-main"
                        : "border-stone-800 bg-parchment-card"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-stone-800" />
                    )}
                  </div>
                </div>
                <div
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isSelected ? "text-stone-400" : "text-stone-600"
                  }`}
                >
                  {level.time}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3.5 border-2 border-stone-800 rounded-xl font-bold text-stone-900 bg-parchment-main hover:bg-parchment-card transition-colors cursor-pointer shadow-sm"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onStart}
            disabled={!selectedDifficulty}
            className={`flex-1 py-3.5 rounded-xl font-bold transition-all border-2 border-stone-800 shadow-md ${
              selectedDifficulty
                ? "bg-stone-800 hover:bg-stone-900 text-parchment-main cursor-pointer active:scale-[0.99]"
                : "bg-stone-300 text-stone-500 border-stone-400 cursor-not-allowed"
            }`}
          >
            Begin Investigation
          </button>
        </div>
      </div>
    </motion.div>
  );
}
