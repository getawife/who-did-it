// CombinedLandingView.tsx - Single unified flow
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Short_Stack } from "next/font/google";

const handDrawn = Short_Stack({
  weight: "400",
  subsets: ["latin"],
});

interface CombinedLandingProps {
  onStartGame: (
    difficulty: "easy" | "medium" | "hard",
    userName: string
  ) => void;
}

export default function CombinedLandingView({
  onStartGame,
}: CombinedLandingProps) {
  const [step, setStep] = useState<"name" | "warning" | "difficulty">("name");
  const [userName, setUserName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "easy" | "medium" | "hard" | null
  >(null);

  const handleNameSubmit = () => {
    if (userName.trim()) {
      setStep("warning");
    }
  };

  const handleWarningAgree = () => {
    if (agreed) {
      setStep("difficulty");
    }
  };

  const handleStartGame = () => {
    if (selectedDifficulty && userName.trim()) {
      localStorage.setItem("userName", userName.trim());
      onStartGame(selectedDifficulty, userName.trim());
    }
  };

  return (
    <div
      className={`${handDrawn.className} min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center p-4`}
    >
      <div className="max-w-2xl w-full">
        <AnimatePresence mode="wait">
          {/* Name Input Step */}
          {step === "name" && (
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
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 text-lg border-2 border-stone-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-stone-800"
                    onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                  />
                </div>

                <button
                  onClick={handleNameSubmit}
                  disabled={!userName.trim()}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    userName.trim()
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-stone-300 text-stone-500 cursor-not-allowed"
                  }`}
                >
                  Continue Investigation
                </button>
              </div>
            </motion.div>
          )}

          {/* Warning Step */}
          {step === "warning" && (
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
                      This game contains material depicting criminal acts and
                      violence. Some case details may include references to
                      self-harm and psychological distress.
                    </p>
                    <p className="text-sm text-stone-600">
                      All investigative scenarios are developed using artifical
                      intelligence.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-lg mb-8">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-5 h-5 mt-1"
                  />
                  <label
                    htmlFor="consent"
                    className="text-stone-700 cursor-pointer"
                  >
                    I acknowledge the content advisory and agree to proceed with
                    the game.
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep("name")}
                    className="flex-1 py-3 border-2 border-stone-300 rounded-lg font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleWarningAgree}
                    disabled={!agreed}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                      agreed
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-stone-300 text-stone-500 cursor-not-allowed"
                    }`}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Difficulty Selection Step */}
          {step === "difficulty" && (
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
                  <p className="text-stone-600">
                    Choose your investigation protocol level
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    {
                      id: "easy",
                      title: "Junior Detective",
                      description:
                        "Clear evidence, reliable witnesses. Recommended for first-time investigators.",
                      time: "10s forensic, 15s subpoenas",
                      color:
                        "border-green-200 bg-green-50 hover:border-green-300",
                    },
                    {
                      id: "medium",
                      title: "Lead Investigator",
                      description:
                        "Standard procedures with some investigative challenges.",
                      time: "30s forensic, 60s subpoenas",
                      color:
                        "border-amber-200 bg-amber-50 hover:border-amber-300",
                    },
                    {
                      id: "hard",
                      title: "Special Agent",
                      description:
                        "Complex cases with unreliable sources and limited evidence.",
                      time: "60s forensic, 45s subpoenas",
                      color: "border-red-200 bg-red-50 hover:border-red-300",
                    },
                  ].map((level) => (
                    <button
                      key={level.id}
                      onClick={() =>
                        setSelectedDifficulty(
                          level.id as "easy" | "medium" | "hard"
                        )
                      }
                      className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                        level.color
                      } ${
                        selectedDifficulty === level.id
                          ? "ring-2 ring-offset-2 ring-blue-500"
                          : ""
                      }`}
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
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedDifficulty === level.id
                              ? "border-blue-500 bg-blue-500"
                              : "border-stone-300"
                          }`}
                        >
                          {selectedDifficulty === level.id && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-stone-700">
                        {level.time}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => setStep("warning")}
                    className="w-full py-3 border-2 border-stone-300 rounded-lg font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleStartGame}
                    disabled={!selectedDifficulty}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      selectedDifficulty
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-stone-300 text-stone-500 cursor-not-allowed"
                    }`}
                  >
                    Begin Investigation
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Indicator */}
        <div className="mt-8">
          <div className="flex items-center justify-center gap-2">
            {["name", "warning", "difficulty"].map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    step === s
                      ? "bg-blue-600"
                      : ["name", "warning", "difficulty"].indexOf(step) >= i
                      ? "bg-stone-400"
                      : "bg-stone-200"
                  }`}
                />
                {i < 2 && (
                  <div
                    className={`w-8 h-0.5 ${
                      ["name", "warning", "difficulty"].indexOf(step) > i
                        ? "bg-stone-400"
                        : "bg-stone-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-stone-500 mt-2">
            {step === "name" && "Step 1 of 3"}
            {step === "warning" && "Step 2 of 3"}
            {step === "difficulty" && "Step 3 of 3"}
          </div>
        </div>
      </div>
    </div>
  );
}
