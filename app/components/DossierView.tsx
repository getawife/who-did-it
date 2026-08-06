"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Short_Stack } from "next/font/google";
import easyCases from "@/app/cases/easyCases.json";
import mediumCases from "@/app/cases/mediumCases.json";
import hardCases from "@/app/cases/hardCases.json";

import HeaderNav from "./HeaderNav";
import BriefingTab from "./BriefingTab";
import VictimTab from "./VictimTab";
import SuspectsTab from "./SuspectsTab";
import EvidenceTab from "./EvidenceTab";
import CharacterAvatar from "./CharacterAvatar";

const handDrawn = Short_Stack({ weight: "400", subsets: ["latin"] });

type Case =
  | (typeof easyCases)[0]
  | (typeof mediumCases)[0]
  | (typeof hardCases)[0];

const DIFFICULTY_CONFIG = {
  easy: { forensic: 10, subpoena: 15 },
  medium: { forensic: 30, subpoena: 60 },
  hard: { forensic: 60, subpoena: 45 },
};

export default function DossierView({
  difficulty,
}: {
  difficulty: "easy" | "medium" | "hard";
}) {
  const [activeTab, setActiveTab] = useState<
    "briefing" | "victim" | "suspects" | "evidence"
  >("briefing");
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [pendingSubpoenas, setPendingSubpoenas] = useState<
    Record<string, number>
  >({});
  const [unlockedRecords, setUnlockedRecords] = useState<string[]>([]);
  const [selectedSuspect, setSelectedSuspect] = useState<any | null>(null);
  const [viewingPhone, setViewingPhone] = useState<any | null>(null);
  const [forensicTimer, setForensicTimer] = useState<number | null>(null);
  const [interviewedWitnesses, setInterviewedWitnesses] = useState<string[]>(
    [],
  );
  const [witnessTestimonies, setWitnessTestimonies] = useState<
    Record<string, string>
  >({});
  const [isAccusing, setIsAccusing] = useState(false);
  const [verdict, setVerdict] = useState<"pending" | "correct" | "incorrect">(
    "pending",
  );

  useEffect(() => {
    const collections = {
      easy: easyCases,
      medium: mediumCases,
      hard: hardCases,
    };
    const flat =
      difficulty === "hard" ? collections.hard.flat() : collections[difficulty];
    setCurrentCase(flat[Math.floor(Math.random() * flat.length)] as Case);
  }, [difficulty]);

  useEffect(() => {
    if (activeTab === "evidence" && forensicTimer === null) {
      setForensicTimer(DIFFICULTY_CONFIG[difficulty].forensic);
    }
  }, [activeTab, forensicTimer, difficulty]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPendingSubpoenas((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((name) => {
          if (next[name] > 1) next[name] -= 1;
          else {
            setUnlockedRecords((records) =>
              records.includes(name) ? records : [...records, name],
            );
            delete next[name];
          }
        });
        return next;
      });
      setForensicTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInterview = (role: string, statement: string) => {
    if (!interviewedWitnesses.includes(role)) {
      setInterviewedWitnesses((prev) => [...prev, role]);
      setWitnessTestimonies((prev) => ({
        ...prev,
        [role]: statement || "No statement provided.",
      }));
    }
  };

  const submitAccusation = (suspectId: string) => {
    setVerdict(
      suspectId === currentCase?.solution?.killerId ? "correct" : "incorrect",
    );
  };

  if (!currentCase) return null;

  return (
    <div
      className={`${handDrawn.className} min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 text-stone-900 pb-12`}
    >
      <HeaderNav
        caseNumber={currentCase.caseNumber}
        title={currentCase.title}
        difficulty={difficulty}
        onOpenAccusation={() => setIsAccusing(true)}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Playful Pill Navigation */}
        <nav className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {[
            { id: "briefing", label: "Briefing", icon: "📋" },
            { id: "victim", label: "Victim Profile", icon: "🕵️" },
            { id: "suspects", label: "Suspects", icon: "👤" },
            { id: "evidence", label: "Evidence", icon: "🔍" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab Views */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            {activeTab === "briefing" && (
              <BriefingTab
                description={currentCase.briefing.description}
                crimeType={currentCase.crimeType}
                suspectsCount={currentCase.suspects.length}
                witnessesCount={currentCase.witnesses.length}
              />
            )}
            {activeTab === "victim" && (
              <VictimTab victim={currentCase.victim} />
            )}
            {activeTab === "suspects" && (
              <SuspectsTab
                suspects={currentCase.suspects}
                onSelect={setSelectedSuspect}
              />
            )}
            {activeTab === "evidence" && (
              <EvidenceTab
                evidence={currentCase.evidence}
                witnesses={currentCase.witnesses}
                forensicTimer={forensicTimer}
                interviewedWitnesses={interviewedWitnesses}
                witnessTestimonies={witnessTestimonies}
                onInterview={handleInterview}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Suspect Modal */}
      {selectedSuspect && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold">{selectedSuspect.name}</h3>
                <p className="text-stone-600">
                  {selectedSuspect.relationToVictim}
                </p>
              </div>
              <button
                onClick={() => setSelectedSuspect(null)}
                className="text-stone-400 font-bold hover:text-stone-700"
              >
                ✕
              </button>
            </div>
            <p className="p-4 bg-stone-50 rounded-xl text-stone-700 border border-stone-200">
              "{selectedSuspect.alibi}"
            </p>
          </div>
        </div>
      )}

      {/* Accusation Modal */}
      {isAccusing && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-stone-200 space-y-6">
            <h2 className="text-2xl font-bold text-center">Accuse a Suspect</h2>
            <div className="space-y-3">
              {currentCase.suspects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => submitAccusation(s.id)}
                  className="w-full text-left p-4 rounded-xl border-2 border-stone-200 hover:border-red-400 hover:bg-red-50 font-bold transition-all"
                >
                  {s.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsAccusing(false)}
              className="w-full py-3 bg-stone-200 rounded-xl font-bold hover:bg-stone-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Verdict Screen */}
      {verdict !== "pending" && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 text-center space-y-6 shadow-2xl border border-stone-200">
            <h2
              className={`text-4xl font-extrabold ${verdict === "correct" ? "text-green-600" : "text-red-600"}`}
            >
              {verdict === "correct" ? "Case Solved! 🎉" : "Wrong Suspect! ❌"}
            </h2>
            <p className="text-stone-700 text-lg">
              {verdict === "correct"
                ? "Great job, Detective! You cracked the case."
                : "The real culprit got away."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all"
            >
              Play Another Case
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
