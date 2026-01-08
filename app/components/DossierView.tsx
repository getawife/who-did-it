"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import easyCases from "@/app/cases/easyCases.json";
import mediumCases from "@/app/cases/mediumCases.json";
import hardCases from "@/app/cases/hardCases.json";

// Updated type to support all three difficulty files
type Case =
  | (typeof easyCases)[0]
  | (typeof mediumCases)[0]
  | (typeof hardCases)[0];
type Suspect = Case["suspects"][0];
import CharacterAvatar from "./CharacterAvatar";

interface DossierProps {
  difficulty: "easy" | "medium" | "hard";
}

// Logic Mapping for Difficulty Requirements
const DIFFICULTY_CONFIG = {
  easy: { forensic: 10, subpoena: 15, witnessSilence: 0, subpoenaFail: 0 },
  medium: { forensic: 30, subpoena: 60, witnessSilence: 0.05, subpoenaFail: 0 },
  hard: { forensic: 60, subpoena: 45, witnessSilence: 0.3, subpoenaFail: 0.2 },
};

const InterviewStamp = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 overflow-hidden">
    <motion.div
      initial={{ scale: 2, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.8 }}
      className="border-4 border-red-700 px-4 py-1 rounded-sm rotate-[-12deg] bg-white/10 backdrop-blur-[1px]"
    >
      <p className="text-red-700 font-black text-xl tracking-tighter uppercase font-mono">
        INTERVIEWED
      </p>
    </motion.div>
  </div>
);

export default function DossierView({ difficulty }: DossierProps) {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<
    "briefing" | "victim" | "suspects" | "evidence"
  >("briefing");
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [pendingSubpoenas, setPendingSubpoenas] = useState<
    Record<string, number>
  >({});
  const [unlockedRecords, setUnlockedRecords] = useState<string[]>([]);
  const [failedActions, setFailedActions] = useState<string[]>([]); // Tracks Hard mode errors
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

  // --- EFFECTS ---

  useEffect(() => {
    const collections = {
      easy: easyCases,
      medium: mediumCases,
      hard: hardCases,
    };

    const selectedCollection = collections[difficulty];

    // Logic for range 909 to 1100
    // (1100 - 909 + 1) = 192 possible outcomes
    const randomNumber = Math.floor(Math.random() * 192) + 909;
    const randomID = randomNumber.toString();

    const foundCase = selectedCollection.find(
      (c) => c.id === `case-${randomID}h`
    ) as Case;

    if (foundCase) {
      setCurrentCase(foundCase);
    } else {
      // Fallback: If the specific ID doesn't exist, pick any random case
      // from the file so the screen isn't blank
      const fallbackIndex = Math.floor(
        Math.random() * selectedCollection.length
      );
      setCurrentCase(selectedCollection[fallbackIndex] as Case);
    }
  }, [difficulty]);

  // Forensic Logic (Medium 50% chance of no forensic)
  useEffect(() => {
    if (activeTab === "evidence" && forensicTimer === null) {
      let time = DIFFICULTY_CONFIG[difficulty].forensic;

      if (difficulty === "medium" && Math.random() > 0.5) {
        time = 0; // 50% chance of instant unlock
      }

      setForensicTimer(time);
    }
  }, [activeTab, forensicTimer, difficulty]);

  // Master Clock for Subpoenas and Forensic
  useEffect(() => {
    const interval = setInterval(() => {
      setPendingSubpoenas((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((name) => {
          if (next[name] > 1) {
            next[name] -= 1;
          } else {
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

  // --- HANDLERS ---

  const handleSubpoena = (suspectName: string) => {
    // 1. Find the suspect object to check for data existence
    const suspect = currentCase?.suspects.find((s) => s.name === suspectName);

    if (
      !pendingSubpoenas[suspectName] &&
      !unlockedRecords.includes(suspectName)
    ) {
      // 2. Check if subpoena data exists for this suspect
      if (!suspect || !suspect.subpoenaData) {
        setFailedActions((prev) => [...prev, `subpoena-${suspectName}`]);
        // You can also add a specific toast or alert here: "Unable to file a subpoena"
        return;
      }

      // 3. If it exists, start the timer based on DIFFICULTY_CONFIG
      setPendingSubpoenas((prev) => ({
        ...prev,
        [suspectName]: DIFFICULTY_CONFIG[difficulty].subpoena,
      }));
    }
  };

  const handleInterview = (role: string, statement: string) => {
    if (!interviewedWitnesses.includes(role)) {
      setInterviewedWitnesses((prev) => [...prev, role]);

      // Check if the statement exists in the JSON
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
    if (suspectId === currentCase?.solution?.killerId) {
      setVerdict("correct");
    } else {
      setVerdict("incorrect");
    }
  };

  if (!currentCase) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full h-full bg-[#1a1a1a] text-stone-900 rounded-lg overflow-hidden shadow-2xl border border-stone-800 relative"
    >
      {/* CINEMATIC ACCUSATION MODAL */}
      <AnimatePresence>
        {isAccusing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex items-center justify-center bg-red-950/95 backdrop-blur-2xl p-10"
          >
            <motion.div
              initial={{ scale: 0.9, rotate: -1 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-[#fdf6e3] max-w-2xl w-full p-12 border-[12px] border-stone-900 shadow-2xl relative"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-700 text-white px-8 py-2 font-black uppercase tracking-[0.4em] text-sm shadow-xl">
                Official Indictment
              </div>

              {verdict === "pending" ? (
                <>
                  <div className="text-center mb-10">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-stone-900 mb-2">
                      Select the Prime Suspect
                    </h2>
                    <p className="text-[10px] text-stone-500 font-mono uppercase tracking-widest underline underline-offset-4">
                      Warning: A wrongful arrest will result in immediate
                      termination of the investigation.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {currentCase.suspects.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => submitAccusation(s.id)}
                        className="w-full p-4 border-2 border-stone-300 hover:border-red-700 hover:bg-red-50 text-left flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-5">
                          <CharacterAvatar
                            seed={s.name}
                            className="w-14 h-14 grayscale group-hover:grayscale-0 border border-stone-800"
                          />
                          <div>
                            <p className="font-black uppercase text-lg text-stone-900 leading-none">
                              {s.name}
                            </p>
                            <p className="text-[9px] font-mono text-stone-500 mt-1 uppercase">
                              {s.relationToVictim}
                            </p>
                          </div>
                        </div>
                        <span className="opacity-0 group-hover:opacity-100 text-red-700 font-black text-[10px] tracking-widest">
                          ISSUE WARRANT →
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-10 pt-4 border-t border-stone-200 text-center">
                    <button
                      onClick={() => setIsAccusing(false)}
                      className="text-stone-400 hover:text-stone-800 uppercase text-[10px] font-bold tracking-widest transition-colors"
                    >
                      « Return to Field Notes
                    </button>
                  </div>
                </>
              ) : verdict === "correct" ? (
                <div className="text-center py-8 space-y-6">
                  <div className="text-green-700 font-black text-7xl tracking-tighter scale-110">
                    GUILTY
                  </div>
                  <h3 className="text-2xl font-bold uppercase border-y border-stone-200 py-4">
                    The Case of {currentCase.title} is Closed
                  </h3>
                  <p className="text-stone-800 italic leading-relaxed text-lg">
                    "{currentCase.solution?.closingStatement}"
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-stone-900 text-white py-4 font-black uppercase tracking-widest hover:bg-black transition-all"
                  >
                    Next Assignment
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 space-y-6">
                  <div className="text-red-600 font-black text-7xl tracking-tighter">
                    FAILED
                  </div>
                  <h3 className="text-2xl font-bold uppercase">
                    Wrongful Arrest
                  </h3>
                  <p className="text-stone-700 border-y border-stone-200 py-6">
                    The evidence was insufficient. The real killer has slipped
                    through your fingers, and your department has been served
                    with a lawsuit.
                  </p>
                  <button
                    onClick={() => {
                      setVerdict("pending");
                      setIsAccusing(false);
                    }}
                    className="w-full bg-red-900 text-white py-4 font-black uppercase tracking-widest"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PHONE RECORDS MODAL */}
      <AnimatePresence>
        {viewingPhone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-20"
          >
            <motion.div
              initial={{ y: 50, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              className="bg-[#0a0a0a] w-80 h-[600px] rounded-[3rem] border-[12px] border-stone-800 overflow-hidden flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.8)]"
            >
              <div className="h-7 bg-stone-800 w-1/3 mx-auto rounded-b-2xl mb-2" />
              <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3 bg-stone-900/50">
                <CharacterAvatar
                  seed={viewingPhone.name}
                  className="w-10 h-10 rounded-full border border-stone-700"
                />
                <div>
                  <p className="text-white font-bold text-xs leading-none mb-1">
                    {viewingPhone.name}
                  </p>
                  <p className="text-[9px] text-green-500 font-mono uppercase tracking-tighter">
                    Secure Link Active
                  </p>
                </div>
              </div>

              <div className="flex-1 px-4 overflow-y-auto space-y-6 flex flex-col pt-4 scrollbar-hide bg-[#0f0f0f]">
                {viewingPhone.subpoenaData.messages?.map((log, i) => {
                  const isFromSuspect = log.from === viewingPhone.name;
                  return (
                    <div
                      key={i}
                      className={`flex flex-col max-w-[85%] ${
                        isFromSuspect
                          ? "self-end items-end"
                          : "self-start items-start"
                      }`}
                    >
                      <span className="text-[9px] font-black uppercase text-stone-500 mb-1 px-1">
                        {log.from}
                      </span>
                      <div
                        className={`p-3 rounded-2xl text-xs ${
                          isFromSuspect
                            ? "bg-amber-600 text-black font-bold rounded-tr-none"
                            : "bg-stone-800 text-stone-200 rounded-tl-none border border-stone-700"
                        }`}
                      >
                        {log.text}
                      </div>
                      <span className="text-[8px] font-mono text-stone-600 mt-1 px-1">
                        {log.time}
                      </span>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setViewingPhone(null)}
                className="mx-8 my-6 p-3 bg-red-900/20 text-red-500 border border-red-900/30 rounded-xl font-black uppercase text-[10px]"
              >
                Terminate Link
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUSPECT DETAIL MODAL */}
      <AnimatePresence>
        {selectedSuspect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-12 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-[#fdf6e3] w-full max-w-2xl shadow-2xl border-2 border-stone-800 overflow-hidden flex flex-col"
            >
              <div className="p-8 flex gap-8">
                <div className="space-y-4">
                  <CharacterAvatar
                    seed={selectedSuspect.name}
                    className="w-48 h-48 border-4 border-stone-800 shadow-lg"
                  />
                  {unlockedRecords.includes(selectedSuspect.name) ? (
                    <button
                      onClick={() => setViewingPhone(selectedSuspect)}
                      className="w-full bg-amber-600 text-black py-3 px-4 font-black uppercase text-xs hover:bg-amber-500 transition-colors"
                    >
                      Access Logs
                    </button>
                  ) : failedActions.includes(
                      `subpoena-${selectedSuspect.name}`
                    ) ? (
                    <div className="w-full bg-red-900/20 text-red-600 py-3 px-4 font-black uppercase text-[10px] text-center border border-red-900/50">
                      Unable to file a subpoena
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubpoena(selectedSuspect.name)}
                      disabled={!!pendingSubpoenas[selectedSuspect.name]}
                      className="w-full bg-stone-900 text-amber-500 py-3 px-4 font-black uppercase text-xs disabled:opacity-50"
                    >
                      {pendingSubpoenas[selectedSuspect.name]
                        ? "Warrant Pending..."
                        : "Request Subpoena"}
                    </button>
                  )}
                </div>
                <div className="flex-1 space-y-6">
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-stone-900">
                    {selectedSuspect.name}
                  </h2>
                  <div className="space-y-4 text-sm">
                    <div className="bg-stone-200/50 p-3 border-l-4 border-stone-800">
                      <p className="text-[10px] font-bold text-stone-500 uppercase mb-1 tracking-widest">
                        Alibi
                      </p>
                      <p className="italic">
                        "{selectedSuspect.alibi || "No alibi recorded."}"
                      </p>
                    </div>
                    <p>
                      <strong>Relation:</strong>{" "}
                      {selectedSuspect.relationToVictim}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedSuspect(null)}
                className="w-full bg-stone-200 border-t-2 border-stone-800 py-4 font-black uppercase text-sm hover:bg-stone-300"
              >
                Close File
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT NAVIGATION */}
      <div className="w-64 flex flex-col pt-10 bg-[#0f172a] border-r border-black/50">
        <div className="px-6 mb-8 text-stone-500 text-[10px] uppercase tracking-[0.3em] font-bold">
          Case Navigation
        </div>
        {["briefing", "victim", "suspects", "evidence"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`text-left px-6 py-4 uppercase tracking-widest text-xs border-l-4 transition-all ${
              activeTab === tab
                ? "bg-white/5 border-amber-600 text-white"
                : "border-transparent text-stone-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CENTER STAGE */}
      <div className="flex-1 bg-[#fdf6e3] overflow-y-auto relative shadow-inner">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/felt.png')]" />
        <div className="p-16 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {activeTab === "briefing" && (
                <div className="max-w-prose space-y-8">
                  <p className="text-amber-700 font-bold uppercase text-xs tracking-widest">
                    Initial Docket // {currentCase.caseNumber}
                  </p>
                  <h2 className="text-5xl font-black uppercase tracking-tighter">
                    {currentCase.title}
                  </h2>
                  <p className="text-2xl leading-relaxed italic border-l-4 border-stone-300 pl-6 text-stone-800">
                    {currentCase.briefing.description}
                  </p>
                  <div className="flex gap-4">
                    <div className="inline-block p-4 border-2 border-red-900 text-red-900 bg-red-900/5 uppercase text-xs font-bold">
                      Classification: {currentCase.crimeType}
                    </div>
                    <div className="inline-block p-4 border-2 border-stone-900 text-stone-900 bg-stone-900/5 uppercase text-xs font-bold">
                      Difficulty: {difficulty}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "victim" && (
                <div className="space-y-8">
                  <div className="flex items-center space-x-6 border-b-4 border-stone-900 pb-4">
                    <CharacterAvatar
                      seed={currentCase.victim.name}
                      className="w-24 h-24 rounded-sm rotate-[-2deg] border-2 border-stone-800 shadow-lg"
                    />
                    <h3 className="text-4xl font-black uppercase tracking-tighter">
                      Post-Mortem: {currentCase.victim.name}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-6">
                      {[
                        { label: "Age", val: currentCase.victim.age },
                        { label: "Job", val: currentCase.victim.job },
                        {
                          label: "Est. TOD",
                          val: currentCase.victim.timeOfDeath,
                        },
                      ].map((stat, i) => (
                        <div key={i} className="border-b border-stone-300 pb-2">
                          <p className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">
                            {stat.label}
                          </p>
                          <p className="text-xl font-bold text-stone-900">
                            {stat.val}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-stone-200/50 p-6 border-2 border-dashed border-stone-400">
                      <h4 className="font-black mb-4 uppercase text-xs text-stone-600 underline">
                        Verified Routine
                      </h4>
                      <ul className="text-sm space-y-3 font-mono">
                        {currentCase.victim.routine.map((line, i) => (
                          <li key={i}>» {line}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "suspects" && (
                <div className="space-y-10">
                  <h3 className="text-4xl font-black uppercase tracking-tighter border-b-4 border-stone-900 pb-2">
                    Persons of Interest
                  </h3>
                  <div className="grid grid-cols-3 gap-8">
                    {currentCase.suspects.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => setSelectedSuspect(s)}
                        className="bg-white p-4 border border-stone-300 cursor-pointer hover:border-amber-600 transition-all shadow-sm"
                      >
                        <CharacterAvatar
                          seed={s.name}
                          className="w-full aspect-square grayscale hover:grayscale-0 transition-all mb-4"
                        />
                        <h4 className="text-center font-black uppercase text-sm">
                          {s.name}
                        </h4>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "evidence" && (
                <div className="space-y-12">
                  <div className="flex justify-between items-end border-b-4 border-stone-900 pb-2">
                    <h3 className="text-4xl font-black uppercase tracking-tighter">
                      Evidence Locker
                    </h3>
                    {forensicTimer !== null && forensicTimer > 0 && (
                      <div className="text-right">
                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">
                          Lab Backlog
                        </p>
                        <p className="text-xl font-mono font-bold text-amber-700">
                          {forensicTimer}s
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    {currentCase.evidence.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white p-6 border border-stone-300 shadow-sm relative"
                      >
                        <span className="absolute top-0 right-0 bg-stone-800 text-white px-2 py-1 text-[10px] font-mono">
                          {item.id}
                        </span>
                        <h4 className="text-xl font-bold uppercase mb-2 text-stone-950">
                          {item.name}
                        </h4>
                        <p
                          className={`text-sm italic transition-all duration-1000 ${
                            item.type === "Forensic" && (forensicTimer ?? 0) > 0
                              ? "blur-md opacity-30"
                              : "text-stone-700"
                          }`}
                        >
                          "{item.description}"
                        </p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-stone-400 mb-6 underline">
                      Digital Intercepts
                    </h4>
                    <div className="grid grid-cols-3 gap-4 min-h-[64px]">
                      {unlockedRecords.map((name) => (
                        <button
                          key={name}
                          onClick={() =>
                            setViewingPhone(
                              currentCase.suspects.find(
                                (s) => s.name === name
                              ) || null
                            )
                          }
                          className="h-16 px-4 bg-amber-600/10 border border-amber-600 text-amber-900 font-black uppercase text-[10px] flex items-center justify-between hover:bg-amber-600/20 transition-all"
                        >
                          <span className="truncate">
                            {name.split(" ")[0]}'s Phone
                          </span>
                          <span>VIEW →</span>
                        </button>
                      ))}
                      {unlockedRecords.length === 0 && (
                        <p className="col-span-3 h-16 flex items-center text-stone-400 italic text-sm">
                          Waiting for warrant approval...
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-8 border-t-2 border-stone-200">
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-stone-400 mb-6">
                      Witness Statements
                    </h4>
                    <div className="flex flex-wrap gap-6">
                      {currentCase.witnesses.map((w, idx) => {
                        const interviewed = interviewedWitnesses.includes(
                          w.role
                        );
                        return (
                          <div
                            key={idx}
                            className="group relative flex items-center space-x-4 px-4 py-3 bg-stone-200/50 border border-stone-300 min-w-[240px]"
                          >
                            {interviewed && <InterviewStamp />}
                            <CharacterAvatar
                              seed={w.role}
                              className="w-12 h-12 rounded-full border-stone-800"
                            />
                            <div className="font-mono text-sm font-bold uppercase">
                              {w.role}
                            </div>
                            {!interviewed && (
                              <button
                                onClick={() =>
                                  handleInterview(w.role, w.statement)
                                }
                                className="absolute inset-0 bg-stone-900/90 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center font-black uppercase text-[10px] transition-opacity"
                              >
                                Conduct Interview
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="w-72 flex flex-col p-8 bg-[#0a0a0a] border-l border-black text-xs uppercase tracking-tighter text-stone-500">
        <div className="border-b border-white/5 pb-6 mb-6">
          <p className="font-bold mb-1">Assigned Investigator</p>
          <p className="text-amber-500 font-black text-lg italic tracking-normal">
            Det. {localStorage.getItem("userName") || "Unknown"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          <p className="text-stone-600 font-bold border-b border-white/5 pb-2">
            Case Progress
          </p>
          {interviewedWitnesses.map((role) => (
            <motion.div
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              key={role}
              className="p-3 bg-stone-900 border-l-2 border-amber-600"
            >
              <p className="text-amber-500 font-black text-[9px] mb-1">
                {role}
              </p>
              <p className="text-stone-300 normal-case italic leading-tight">
                "{witnessTestimonies[role] || "Awaiting Statement..."}"
              </p>
            </motion.div>
          ))}
          {Object.entries(pendingSubpoenas).map(([name, time]) => (
            <div
              key={name}
              className="p-3 bg-red-950/20 border border-red-900/40"
            >
              <p className="text-red-500 font-bold">
                {name.split(" ")[0]}'s Subpoena
              </p>
              <p className="text-xl font-mono text-red-600 animate-pulse">
                {time}s
              </p>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-white/10">
          <button
            onClick={() => setIsAccusing(true)}
            className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-black uppercase text-xs tracking-[0.2em] shadow-[0_0_20px_rgba(185,28,28,0.2)] transition-all active:scale-95"
          >
            Draft Accusation
          </button>
        </div>
      </div>
    </motion.div>
  );
}
