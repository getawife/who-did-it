"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface Clue {
  id: string;
  title: string;
  description?: string;
  category: "evidence" | "witness" | "timeline";
  timestamp: string;
}

interface NotebookDrawerProps {
  clues?: Clue[];
}

export default function NotebookDrawer({ clues = [] }: NotebookDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userNotes, setUserNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"clues" | "notes">("clues");
  const [hasUnread, setHasUnread] = useState(false);
  const [prevClueCount, setPrevClueCount] = useState(clues.length);

  useEffect(() => {
    if (clues.length > prevClueCount) {
      if (!isOpen) {
        setHasUnread(true);
      }
      setPrevClueCount(clues.length);
    }
  }, [clues.length, isOpen, prevClueCount]);

  const toggleOpen = () => {
    if (!isOpen) setHasUnread(false);
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
        <button
          type="button"
          onClick={toggleOpen}
          className="relative bg-parchment-card hover:bg-parchment-main text-stone-900 border-2 border-r-0 border-stone-800 rounded-l-xl p-3 shadow-md transition-all flex flex-col items-center gap-2 cursor-pointer"
          aria-label="Toggle Case Notebook"
        >
          {hasUnread && (
            <span className="absolute -top-1 -left-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full rounded-full bg-stone-700 opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-stone-900 border border-parchment-main"></span>
            </span>
          )}
          <span className="text-xs font-bold uppercase tracking-wider [writing-mode:vertical-lr] rotate-180">
            Notebook
          </span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-stone-950 z-50"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 h-screen w-full sm:w-[480px] lg:w-[540px] bg-parchment-main border-l-4 border-stone-800 shadow-2xl z-50 flex flex-col min-h-0 text-stone-900"
            >
              <div className="p-5 border-b-2 border-stone-800 bg-parchment-card flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-extrabold text-stone-900">
                    Case Notebook
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-full border-2 border-stone-800 flex items-center justify-center font-bold text-stone-900 bg-parchment-main hover:bg-parchment-card transition-colors cursor-pointer text-lg"
                  aria-label="Close Notebook"
                >
                  ✕
                </button>
              </div>

              <div className="flex border-b-2 border-stone-800 bg-parchment-card/60 text-base shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("clues")}
                  className={`flex-1 py-3 font-bold transition-colors cursor-pointer ${
                    activeTab === "clues"
                      ? "bg-parchment-main text-stone-900 border-b-2 border-stone-900 -mb-[2px]"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Auto Clues ({clues.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("notes")}
                  className={`flex-1 py-3 font-bold transition-colors cursor-pointer ${
                    activeTab === "notes"
                      ? "bg-parchment-main text-stone-900 border-b-2 border-stone-900 -mb-[2px]"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Personal Notes
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 min-h-0">
                {activeTab === "clues" ? (
                  <div className="space-y-4 pb-6">
                    {clues.length === 0 ? (
                      <div className="text-center py-12 text-stone-600">
                        <p className="text-4xl mb-3">🔎</p>
                        <p className="text-base font-bold text-stone-900">
                          No clues gathered yet.
                        </p>
                        <p className="text-xs font-semibold mt-1">
                          Investigate further to uncover evidence.
                        </p>
                      </div>
                    ) : (
                      clues.map((clue) => (
                        <motion.div
                          key={clue.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-parchment-card border-2 border-stone-800 rounded-xl shadow-sm relative overflow-hidden"
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-extrabold text-stone-900 text-lg">
                              {clue.title}
                            </span>
                            <span className="text-xs px-2.5 py-1 rounded-full border border-stone-800 font-bold bg-stone-800 text-parchment-main uppercase tracking-wider shrink-0">
                              {clue.category}
                            </span>
                          </div>
                          <p className="text-sm text-stone-800 leading-relaxed font-semibold">
                            {clue.description}
                          </p>
                          <div className="mt-3 text-xs text-stone-600 text-right font-bold uppercase tracking-wider">
                            {clue.timestamp}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col pb-6">
                    <textarea
                      value={userNotes}
                      onChange={(e) => setUserNotes(e.target.value)}
                      placeholder="Write down your theories, suspect motives, or key findings here..."
                      className="w-full flex-1 p-4 bg-parchment-card/50 border-2 border-dashed border-stone-800 rounded-xl focus:outline-none focus:border-stone-900 text-stone-900 text-base resize-none leading-relaxed font-semibold placeholder:text-stone-500 shadow-inner"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
