"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Short_Stack } from "next/font/google";

const handDrawn = Short_Stack({
  weight: "400",
  subsets: ["latin"],
});

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
      } catch {}
      onStartGame(selectedDifficulty, userName.trim());
    }
  };

  return (
    <div
      className={`${handDrawn.className} min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center p-4`}
    >
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
      className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden"
    >
      <div className="p-8 text-center">
        <div className="mb-8">
          <div className="inline-block bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wide mb-4">
            Who did it?
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-3">
            What should you be called?
          </h1>
          <p className="text-stone-600">
            Enter your name to begin your investigation
          </p>
        </div>

        <div className="mb-8">
          <input
            type="text"
            value={userName}
            onChange={(e) => onUserNameChange(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 text-lg border-2 border-stone-300 rounded-lg focus:outline-none focus:border-stone-400 text-stone-800"
            onKeyDown={(e) => e.key === "Enter" && isNameValid && onNext()}
          />
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!isNameValid}
          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
            isNameValid
              ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              : "bg-stone-300 text-stone-500 cursor-not-allowed"
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
      className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden"
    >
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 font-bold">!</span>
            </div>
            <h1 className="text-2xl font-bold text-stone-900">
              Content Advisory
            </h1>
          </div>

          <div className="space-y-4 text-stone-700">
            <p>
              This game contains material depicting criminal acts and violence.
              Some case details may include references to self-harm and
              psychological distress.
            </p>
            <p className="text-sm text-stone-600">
              All investigative scenarios are fiction.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-lg mb-8">
          <input
            type="checkbox"
            id="consent"
            checked={agreed}
            onChange={(e) => onAgreedChange(e.target.checked)}
            className="w-5 h-5 mt-1 cursor-pointer"
          />
          <label htmlFor="consent" className="text-stone-700 cursor-pointer">
            I acknowledge the content advisory and agree to proceed with the
            game.
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 border-2 border-stone-300 rounded-lg font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!agreed}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              agreed
                ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                : "bg-stone-300 text-stone-500 cursor-not-allowed"
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
    color: "border-green-200 bg-green-50 hover:bg-green-100",
    selectedBg: "bg-green-100/80",
    dotColor: "border-blue-500 bg-blue-500",
  },
  {
    id: "medium" as const,
    title: "Lead Investigator",
    description: "Standard procedures with some investigative challenges.",
    time: "30s forensic, 60s subpoenas",
    color: "border-amber-200 bg-amber-50 hover:bg-amber-100",
    selectedBg: "bg-amber-100/80",
    dotColor: "border-blue-500 bg-blue-500",
  },
  {
    id: "hard" as const,
    title: "Special Agent",
    description: "Complex cases with unreliable sources and limited evidence.",
    time: "60s forensic, 45s subpoenas",
    color: "border-red-200 bg-red-50 hover:bg-red-100",
    selectedBg: "bg-red-100/80",
    dotColor: "border-blue-500 bg-blue-500",
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
      className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden"
    >
      <div className="p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-stone-900 mb-3">
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
                className={`w-full p-6 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  level.color
                } ${isSelected ? level.selectedBg : ""}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">
                      {level.title}
                    </h3>
                    <p className="text-sm text-stone-600 mb-3">
                      {level.description}
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? level.dotColor : "border-stone-300"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <div className="text-sm font-medium text-stone-700">
                  {level.time}
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 border-2 border-stone-300 rounded-lg font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onStart}
            disabled={!selectedDifficulty}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              selectedDifficulty
                ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                : "bg-stone-300 text-stone-500 cursor-not-allowed"
            }`}
          >
            Begin Investigation
          </button>
        </div>
      </div>
    </motion.div>
  );
}
