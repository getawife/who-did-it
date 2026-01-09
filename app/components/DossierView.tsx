"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import easyCases from "@/app/cases/easyCases.json";
import mediumCases from "@/app/cases/mediumCases.json";
import hardCases from "@/app/cases/hardCases.json";
import CharacterAvatar from "./CharacterAvatar";

type Case =
  | (typeof easyCases)[0]
  | (typeof mediumCases)[0]
  | (typeof hardCases)[0];
type Suspect = Case["suspects"][0];

interface DossierProps {
  difficulty: "easy" | "medium" | "hard";
}

const DIFFICULTY_CONFIG = {
  easy: { forensic: 10, subpoena: 15, witnessSilence: 0, subpoenaFail: 0 },
  medium: { forensic: 30, subpoena: 60, witnessSilence: 0.05, subpoenaFail: 0 },
  hard: { forensic: 60, subpoena: 45, witnessSilence: 0.3, subpoenaFail: 0.2 },
};

export default function DossierView({ difficulty }: DossierProps) {
  const [activeTab, setActiveTab] = useState<
    "briefing" | "victim" | "suspects" | "evidence"
  >("briefing");
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [pendingSubpoenas, setPendingSubpoenas] = useState<
    Record<string, number>
  >({});
  const [unlockedRecords, setUnlockedRecords] = useState<string[]>([]);
  const [failedActions, setFailedActions] = useState<string[]>([]);
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [viewingPhone, setViewingPhone] = useState<Suspect | null>(null);
  const [forensicTimer, setForensicTimer] = useState<number | null>(null);
  const [interviewedWitnesses, setInterviewedWitnesses] = useState<string[]>(
    []
  );
  const [witnessTestimonies, setWitnessTestimonies] = useState<
    Record<string, string>
  >({});
  const [isAccusing, setIsAccusing] = useState(false);
  const [verdict, setVerdict] = useState<"pending" | "correct" | "incorrect">(
    "pending"
  );

  // Game logic (unchanged)
  useEffect(() => {
    const collections = {
      easy: easyCases,
      medium: mediumCases,
      hard: hardCases,
    };
    const selectedCollection = collections[difficulty];
    const randomNumber = Math.floor(Math.random() * 192) + 909;
    const randomID = randomNumber.toString();
    const foundCase = selectedCollection.find(
      (c) => c.id === `case-${randomID}h`
    ) as Case;
    if (foundCase) setCurrentCase(foundCase);
    else {
      const fallbackIndex = Math.floor(
        Math.random() * selectedCollection.length
      );
      setCurrentCase(selectedCollection[fallbackIndex] as Case);
    }
  }, [difficulty]);

  useEffect(() => {
    if (activeTab === "evidence" && forensicTimer === null) {
      let time = DIFFICULTY_CONFIG[difficulty].forensic;
      if (difficulty === "medium" && Math.random() > 0.5) time = 0;
      setForensicTimer(time);
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
              records.includes(name) ? records : [...records, name]
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

  const handleSubpoena = (suspectName: string) => {
    const suspect = currentCase?.suspects.find((s) => s.name === suspectName);
    if (
      !pendingSubpoenas[suspectName] &&
      !unlockedRecords.includes(suspectName)
    ) {
      if (!suspect || !suspect.subpoenaData) {
        setFailedActions((prev) => [...prev, `subpoena-${suspectName}`]);
        return;
      }
      setPendingSubpoenas((prev) => ({
        ...prev,
        [suspectName]: DIFFICULTY_CONFIG[difficulty].subpoena,
      }));
    }
  };

  const handleInterview = (role: string, statement: string) => {
    if (!interviewedWitnesses.includes(role)) {
      setInterviewedWitnesses((prev) => [...prev, role]);
      if (!statement || statement.trim() === "") {
        setWitnessTestimonies((prev) => ({
          ...prev,
          [role]: "No witness available for this lead.",
        }));
      } else {
        setWitnessTestimonies((prev) => ({
          ...prev,
          [role]: statement,
        }));
      }
    }
  };

  const submitAccusation = (suspectId: string) => {
    if (suspectId === currentCase?.solution?.killerId) setVerdict("correct");
    else setVerdict("incorrect");
  };

  if (!currentCase) return null;

  // UI Components
  const DifficultyBadge = () => {
    const config = {
      easy: {
        label: "Junior",
        color: "bg-green-100 text-green-800 border-green-200",
      },
      medium: {
        label: "Lead",
        color: "bg-amber-100 text-amber-800 border-amber-200",
      },
      hard: {
        label: "Expert",
        color: "bg-red-100 text-red-800 border-red-200",
      },
    };
    return (
      <div
        className={`px-3 py-1 rounded-full text-sm font-medium border ${config[difficulty].color}`}
      >
        {config[difficulty].label} Level
      </div>
    );
  };

  const StatusIndicator = ({
    type,
    label,
    value,
    active = true,
  }: {
    type: "timer" | "count" | "status";
    label: string;
    value: string | number;
    active?: boolean;
  }) => (
    <div
      className={`p-3 rounded-lg border ${
        active ? "bg-white border-stone-200" : "bg-stone-50 border-stone-100"
      }`}
    >
      <div className="text-sm text-stone-600 mb-1">{label}</div>
      <div className="text-xl font-semibold text-stone-900">{value}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-xl font-bold text-stone-900">
                Case #{currentCase.caseNumber}
              </h1>
              <p className="text-sm text-stone-600">{currentCase.title}</p>
            </div>
            <DifficultyBadge />
          </div>

          <div className="flex items-center gap-6">
            <div className="text-sm text-stone-600">
              Det.{" "}
              <span className="font-semibold text-stone-900">
                {localStorage.getItem("userName") || "Unknown"}
              </span>
            </div>
            <button
              onClick={() => setIsAccusing(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Make accusation"
            >
              File Accusation
            </button>
          </div>
        </div>
      </header>

      {/* Main Investigation Dashboard */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Case Navigation Tabs */}
        <nav className="mb-8" role="tablist" aria-label="Case sections">
          <div className="flex gap-2 border-b border-stone-200">
            {[
              { id: "briefing", label: "Case Briefing", icon: "📋" },
              { id: "victim", label: "Victim Profile", icon: "🕵️" },
              { id: "suspects", label: "Suspects", icon: "👤" },
              { id: "evidence", label: "Evidence", icon: "🔍" },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 -mb-px border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-700 font-medium"
                    : "border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Primary Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === "briefing" && (
                <motion.div
                  key="briefing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-xl border border-stone-200 p-8"
                >
                  <h2 className="text-2xl font-bold text-stone-900 mb-6">
                    Case Briefing
                  </h2>
                  <div className="prose prose-stone max-w-none">
                    <p className="text-lg text-stone-700 leading-relaxed">
                      {currentCase.briefing.description}
                    </p>
                  </div>
                  <div className="mt-8 pt-6 border-t border-stone-200">
                    <div className="flex flex-wrap gap-4">
                      <StatusIndicator
                        type="status"
                        label="Crime Type"
                        value={currentCase.crimeType}
                      />
                      <StatusIndicator
                        type="count"
                        label="Suspects"
                        value={currentCase.suspects.length}
                      />
                      <StatusIndicator
                        type="count"
                        label="Witnesses"
                        value={currentCase.witnesses.length}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "victim" && (
                <motion.div
                  key="victim"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-xl border border-stone-200 p-8"
                >
                  <div className="flex items-start gap-8 mb-8">
                    <CharacterAvatar
                      seed={currentCase.victim.name}
                      className="w-32 h-32 rounded-lg border-2 border-stone-300"
                    />
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-stone-900 mb-2">
                        {currentCase.victim.name}
                      </h2>
                      <p className="text-stone-600">
                        {currentCase.victim.job}, {currentCase.victim.age}
                      </p>
                      <div className="mt-4 text-sm text-stone-500">
                        Time of death: {currentCase.victim.timeOfDeath}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-stone-900 mb-4">
                      Verified Daily Routine
                    </h3>
                    <div className="space-y-3">
                      {currentCase.victim.routine.map((line, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg"
                        >
                          <div className="w-6 h-6 rounded-full bg-stone-800 text-white flex items-center justify-center text-xs font-medium">
                            {i + 1}
                          </div>
                          <p className="text-stone-700 flex-1">{line}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "suspects" && (
                <motion.div
                  key="suspects"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-xl border border-stone-200 p-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-stone-900">
                      Persons of Interest
                    </h2>
                    <div className="text-sm text-stone-600">
                      {currentCase.suspects.length} individuals
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentCase.suspects.map((suspect) => (
                      <button
                        key={suspect.id}
                        onClick={() => setSelectedSuspect(suspect)}
                        className="text-left p-6 rounded-lg border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label={`View details for ${suspect.name}`}
                      >
                        <div className="flex items-start gap-4">
                          <CharacterAvatar
                            seed={suspect.name}
                            className="w-16 h-16 rounded-lg border border-stone-300"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-stone-900 mb-1">
                              {suspect.name}
                            </h3>
                            <p className="text-sm text-stone-600 mb-3">
                              {suspect.relationToVictim}
                            </p>
                            <div className="text-sm text-blue-600 font-medium">
                              Review dossier →
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "evidence" && (
                <motion.div
                  key="evidence"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {/* Evidence Section */}
                  <div className="bg-white rounded-xl border border-stone-200 p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-stone-900">
                        Physical Evidence
                      </h2>
                      {forensicTimer !== null && forensicTimer > 0 && (
                        <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                          <div className="text-sm font-medium text-amber-800">
                            Forensic analysis: {forensicTimer}s
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {currentCase.evidence.map((item) => (
                        <div
                          key={item.id}
                          className="p-6 rounded-lg border border-stone-200"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="font-semibold text-stone-900">
                              {item.name}
                            </h3>
                            <span className="px-2 py-1 text-xs font-medium bg-stone-100 text-stone-700 rounded">
                              {item.type}
                            </span>
                          </div>
                          <p
                            className={`text-stone-700 ${
                              item.type === "Forensic" &&
                              (forensicTimer ?? 0) > 0
                                ? "blur-sm"
                                : ""
                            }`}
                          >
                            {item.description}
                          </p>
                          {item.type === "Forensic" &&
                            (forensicTimer ?? 0) > 0 && (
                              <div className="mt-3 text-sm text-amber-600 font-medium">
                                Laboratory analysis in progress...
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Witness Statements */}
                  <div className="bg-white rounded-xl border border-stone-200 p-8">
                    <h2 className="text-2xl font-bold text-stone-900 mb-8">
                      Witness Statements
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {currentCase.witnesses.map((witness, idx) => {
                        const interviewed = interviewedWitnesses.includes(
                          witness.role
                        );
                        return (
                          <div
                            key={idx}
                            className="p-6 rounded-lg border border-stone-200"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <CharacterAvatar
                                  seed={witness.role}
                                  className="w-12 h-12 rounded-lg"
                                />
                                <div>
                                  <h3 className="font-semibold text-stone-900">
                                    {witness.role}
                                  </h3>
                                  <div
                                    className={`text-xs font-medium px-2 py-1 rounded ${
                                      interviewed
                                        ? "bg-green-100 text-green-800"
                                        : "bg-stone-100 text-stone-700"
                                    }`}
                                  >
                                    {interviewed ? "Interviewed" : "Pending"}
                                  </div>
                                </div>
                              </div>
                              {!interviewed && (
                                <button
                                  onClick={() =>
                                    handleInterview(
                                      witness.role,
                                      witness.statement
                                    )
                                  }
                                  className="px-3 py-1 text-sm font-medium bg-stone-800 text-white rounded hover:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
                                >
                                  Interview
                                </button>
                              )}
                            </div>
                            {interviewed ? (
                              <div className="p-4 bg-stone-50 rounded-lg">
                                <p className="text-stone-700 italic">
                                  "{witnessTestimonies[witness.role]}"
                                </p>
                              </div>
                            ) : (
                              <p className="text-stone-500 italic">
                                Statement not recorded
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Investigation Sidebar */}
          <div className="space-y-8">
            {/* Active Tasks */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h3 className="text-lg font-semibold text-stone-900 mb-6">
                Active Tasks
              </h3>
              <div className="space-y-4">
                {/* Pending Subpoenas */}
                {Object.keys(pendingSubpoenas).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-stone-700 mb-3">
                      Subpoena Processing
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(pendingSubpoenas).map(([name, time]) => (
                        <div
                          key={name}
                          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-stone-900">
                              {name.split(" ")[0]}
                            </span>
                          </div>
                          <span className="text-lg font-semibold text-blue-700">
                            {time}s
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unlocked Phone Records */}
                {unlockedRecords.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-stone-700 mb-3">
                      Available Records
                    </h4>
                    <div className="space-y-2">
                      {unlockedRecords.map((name) => (
                        <button
                          key={name}
                          onClick={() => {
                            const suspect = currentCase.suspects.find(
                              (s) => s.name === name
                            );
                            if (suspect) setViewingPhone(suspect);
                          }}
                          className="w-full text-left p-3 rounded-lg border border-stone-200 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-stone-900">
                              {name}
                            </span>
                            <span className="text-sm text-blue-600">
                              Review →
                            </span>
                          </div>
                          <div className="text-xs text-stone-500 mt-1">
                            Phone records
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Active Tasks */}
                {Object.keys(pendingSubpoenas).length === 0 &&
                  unlockedRecords.length === 0 && (
                    <div className="text-center py-6">
                      <div className="text-3xl mb-3">📋</div>
                      <p className="text-sm text-stone-600">No active tasks</p>
                      <p className="text-xs text-stone-500 mt-1">
                        Begin your investigation
                      </p>
                    </div>
                  )}
              </div>
            </div>

            {/* Case Timeline */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h3 className="text-lg font-semibold text-stone-900 mb-6">
                Investigation Status
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="text-sm text-stone-600 mb-2">
                    Evidence Collected
                  </div>
                  <div className="text-2xl font-bold text-stone-900">
                    {currentCase.evidence.length} items
                  </div>
                </div>
                <div>
                  <div className="text-sm text-stone-600 mb-2">
                    Witnesses Interviewed
                  </div>
                  <div className="text-2xl font-bold text-stone-900">
                    {interviewedWitnesses.length} of{" "}
                    {currentCase.witnesses.length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-stone-600 mb-2">
                    Phone Records
                  </div>
                  <div className="text-2xl font-bold text-stone-900">
                    {unlockedRecords.length} unlocked
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {/* Suspect Dossier Modal */}
        {selectedSuspect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedSuspect(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`Suspect dossier: ${selectedSuspect.name}`}
            >
              <div className="sticky top-0 bg-white border-b border-stone-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-stone-900">
                  Suspect Dossier
                </h2>
                <button
                  onClick={() => setSelectedSuspect(null)}
                  className="p-2 hover:bg-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500"
                  aria-label="Close dossier"
                >
                  ✕
                </button>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-6">
                    <div className="space-y-4">
                      <CharacterAvatar
                        seed={selectedSuspect.name}
                        className="w-full aspect-square rounded-xl border-2 border-stone-300"
                      />
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-stone-900">
                          {selectedSuspect.name}
                        </h3>
                        <p className="text-stone-600">
                          {selectedSuspect.relationToVictim}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {unlockedRecords.includes(selectedSuspect.name) ? (
                        <button
                          onClick={() => {
                            setViewingPhone(selectedSuspect);
                            setSelectedSuspect(null);
                          }}
                          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Review Phone Records
                        </button>
                      ) : failedActions.includes(
                          `subpoena-${selectedSuspect.name}`
                        ) ? (
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-center">
                          <div className="text-red-700 font-medium">
                            No records available
                          </div>
                          <div className="text-sm text-red-600 mt-1">
                            Cannot issue subpoena
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSubpoena(selectedSuspect.name)}
                          disabled={!!pendingSubpoenas[selectedSuspect.name]}
                          className={`w-full py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            pendingSubpoenas[selectedSuspect.name]
                              ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                              : "bg-stone-800 text-white hover:bg-stone-900 focus:ring-stone-500"
                          }`}
                        >
                          {pendingSubpoenas[selectedSuspect.name]
                            ? `Processing... ${
                                pendingSubpoenas[selectedSuspect.name]
                              }s`
                            : "Request Phone Subpoena"}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-stone-900 mb-4">
                        Alibi
                      </h4>
                      <div className="p-6 bg-stone-50 rounded-xl border border-stone-200">
                        <p className="text-stone-700 italic text-lg">
                          "{selectedSuspect.alibi || "No alibi provided."}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Phone Records Modal */}
        {viewingPhone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setViewingPhone(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="relative bg-stone-900 text-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`Phone records: ${viewingPhone.name}`}
            >
              <div className="sticky top-0 bg-stone-800 border-b border-stone-700 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CharacterAvatar
                    seed={viewingPhone.name}
                    className="w-10 h-10 rounded-lg"
                  />
                  <div>
                    <h2 className="font-bold text-lg">{viewingPhone.name}</h2>
                    <p className="text-sm text-stone-400">
                      Phone Records - Subpoena Approved
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingPhone(null)}
                  className="p-2 hover:bg-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500"
                  aria-label="Close records"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {viewingPhone.subpoenaData.messages?.map((log, i) => {
                  const isFromSuspect = log.from === viewingPhone.name;
                  return (
                    <div
                      key={i}
                      className={`mb-4 ${
                        isFromSuspect ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`inline-block p-4 rounded-xl max-w-[85%] ${
                          isFromSuspect
                            ? "bg-blue-600 text-white"
                            : "bg-stone-800 text-stone-200"
                        }`}
                      >
                        <div className="text-xs font-medium text-stone-400 mb-1">
                          {log.from}
                        </div>
                        <p className="mb-2">{log.text}</p>
                        <div className="text-xs text-stone-500">{log.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Accusation Modal */}
        {isAccusing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setIsAccusing(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="relative bg-white rounded-2xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="File official accusation"
            >
              <div className="p-8">
                {verdict === "pending" ? (
                  <>
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-stone-900 mb-2">
                        File Official Accusation
                      </h2>
                      <p className="text-stone-600">
                        Select the suspect you believe committed the crime
                      </p>
                    </div>

                    <div className="space-y-4 mb-8">
                      {currentCase.suspects.map((suspect) => (
                        <button
                          key={suspect.id}
                          onClick={() => submitAccusation(suspect.id)}
                          className="w-full p-4 rounded-lg border border-stone-200 hover:border-red-300 hover:bg-red-50 text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          <div className="flex items-center gap-4">
                            <CharacterAvatar
                              seed={suspect.name}
                              className="w-12 h-12 rounded-lg"
                            />
                            <div>
                              <div className="font-semibold text-stone-900">
                                {suspect.name}
                              </div>
                              <div className="text-sm text-stone-600">
                                {suspect.relationToVictim}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setIsAccusing(false)}
                      className="w-full py-3 border border-stone-300 rounded-lg font-medium hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                  </>
                ) : verdict === "correct" ? (
                  <div className="text-center py-8">
                    <div className="text-5xl text-green-600 mb-6">✓</div>
                    <h3 className="text-2xl font-bold text-stone-900 mb-4">
                      Case Closed
                    </h3>
                    <div className="mb-8">
                      <p className="text-stone-700 italic">
                        "{currentCase.solution?.closingStatement}"
                      </p>
                    </div>
                    <button
                      onClick={() => window.location.reload()}
                      className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Investigate Next Case
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-5xl text-red-600 mb-6">✗</div>
                    <h3 className="text-2xl font-bold text-stone-900 mb-4">
                      Incorrect Accusation
                    </h3>
                    <div className="mb-8">
                      <p className="text-stone-700">
                        The evidence does not support this accusation. The
                        investigation continues.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setVerdict("pending");
                        setIsAccusing(false);
                      }}
                      className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Continue Investigation
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
