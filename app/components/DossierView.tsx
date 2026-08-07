"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
import NotebookDrawer, { Clue } from "./NotebookDrawer";

const handDrawn = Short_Stack({ weight: "400", subsets: ["latin"] });

interface Message {
  id: string;
  time: string;
  text: string;
}

interface SubpoenaData {
  messages?: Message[];
}

interface Suspect {
  id: string;
  name: string;
  role?: string;
  relationToVictim?: string;
  alibi: string;
  isSubpoenaed?: boolean;
  subpoenaData?: SubpoenaData;
}

interface Witness {
  id: string;
  role: string;
  statement: string;
}

interface EvidenceItem {
  id: string;
  name: string;
  description?: string;
}

interface Victim {
  name: string;
  modeOfDeath?: string;
  causeOfDeath?: string;
  [key: string]: unknown;
}

interface Solution {
  killerId: string;
  closingStatement?: string;
  requiredProof: {
    meansId: string;
    opportunityId: string;
    motiveId: string;
  };
}

interface Case {
  caseNumber: string | number;
  title: string;
  crimeType: string;
  briefing: {
    description: string;
  };
  victim: Victim;
  suspects: Suspect[];
  witnesses: Witness[];
  evidence: EvidenceItem[];
  solution: Solution;
}

type TabType = "briefing" | "victim" | "suspects" | "evidence";
type Difficulty = "easy" | "medium" | "hard";

interface ActionCosts {
  interview: number;
  forensics: number;
  subpoena: number;
}

const ACTION_COSTS: Record<Difficulty, ActionCosts> = {
  easy: { interview: 0, forensics: 0, subpoena: 0 },
  medium: { interview: 1, forensics: 2, subpoena: 2 },
  hard: { interview: 2, forensics: 3, subpoena: 3 },
};

interface DropdownOption {
  id: string;
  label: string;
}

interface CustomSelectProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

function CustomSelect({
  options,
  value,
  onChange,
  placeholder,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.id === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-sm text-stone-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none flex justify-between items-center text-left cursor-pointer"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="text-xs text-stone-500 ml-2">▼</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-1 bg-white border border-stone-300 rounded-xl shadow-xl max-h-52 overflow-y-auto"
          >
            {options.length === 0 ? (
              <li className="p-3 text-sm text-stone-400 font-bold text-center">
                No items available yet
              </li>
            ) : (
              options.map((opt) => (
                <li
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={`p-3 text-sm font-bold border-b border-stone-100 last:border-b-0 cursor-pointer transition-colors ${
                    opt.id === value
                      ? "bg-blue-50 text-blue-700"
                      : "text-stone-800 hover:bg-stone-100"
                  }`}
                >
                  {opt.label}
                </li>
              ))
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DossierView({
  difficulty,
}: {
  difficulty: Difficulty;
}) {
  const [activeTab, setActiveTab] = useState<TabType>("briefing");
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [hoursRemaining, setHoursRemaining] = useState<number | null>(null);
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
  const [clues, setClues] = useState<Clue[]>([]);

  const [unlockedClues, setUnlockedClues] = useState<{
    evidence: string[];
    statements: string[];
    messages: string[];
  }>({
    evidence: [],
    statements: [],
    messages: [],
  });

  const [accusedSuspect, setAccusedSuspect] = useState("");
  const [selectedMeans, setSelectedMeans] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] = useState("");
  const [selectedMotive, setSelectedMotive] = useState("");
  const [accusationError, setAccusationError] = useState<string | null>(null);

  const costs = ACTION_COSTS[difficulty];

  const consumeHours = useCallback(
    (amount: number) => {
      if (difficulty === "easy" || amount <= 0) return;
      setHoursRemaining((prev) =>
        prev !== null ? Math.max(0, prev - amount) : null,
      );
    },
    [difficulty],
  );

  const unlockClue = useCallback(
    (type: "evidence" | "statements" | "messages", id: string) => {
      setUnlockedClues((prev) => {
        if (prev[type].includes(id)) return prev;
        return { ...prev, [type]: [...prev[type], id] };
      });
    },
    [],
  );

  useEffect(() => {
    const collections = {
      easy: easyCases as unknown as Case[],
      medium: mediumCases as unknown as Case[],
      hard: (hardCases as unknown as Case[][]).flat(),
    };
    const flat = collections[difficulty];
    const pickedCase = flat[Math.floor(Math.random() * flat.length)];
    setCurrentCase(pickedCase);
  }, [difficulty]);

  useEffect(() => {
    if (currentCase) {
      const victimData = currentCase.victim;
      const initialClues: Clue[] = [
        {
          id: "initial-briefing",
          title: `Case #${currentCase.caseNumber}`,
          description: currentCase.briefing.description,
          category: "evidence",
          timestamp: "Day 1 - 09:00",
        },
        {
          id: "victim-info",
          title: `Victim: ${currentCase.victim.name}`,
          description: `Found at Crime Scene. Mode of death: ${
            victimData.modeOfDeath ||
            victimData.causeOfDeath ||
            "Under investigation"
          }.`,
          category: "evidence",
          timestamp: "Day 1 - 09:15",
        },
      ];
      setClues(initialClues);

      if (currentCase.evidence) {
        currentCase.evidence.forEach((item) => {
          unlockClue("evidence", item.id);
        });
      }

      if (currentCase.suspects) {
        currentCase.suspects.forEach((s) => {
          if (!s.isSubpoenaed && s.subpoenaData?.messages) {
            s.subpoenaData.messages.forEach((msg) => {
              unlockClue("messages", msg.id);
            });
          }
        });
      }

      if (difficulty !== "easy") {
        const suspectCount = currentCase.suspects?.length || 0;
        const subpoenaCount = (currentCase.suspects || []).filter(
          (s) => s.isSubpoenaed || s.subpoenaData,
        ).length;

        if (difficulty === "medium") {
          setHoursRemaining(
            Math.round(suspectCount * 2 + subpoenaCount * 2 + 2),
          );
        } else if (difficulty === "hard") {
          setHoursRemaining(
            Math.round(suspectCount * 1.5 + subpoenaCount * 1.5),
          );
        }
      } else {
        setHoursRemaining(null);
      }
    }
  }, [currentCase, difficulty, unlockClue]);

  const handleInterview = (role: string, statement: string) => {
    if (!interviewedWitnesses.includes(role)) {
      if (hoursRemaining !== null && hoursRemaining < costs.interview) {
        alert("Not enough shift hours remaining to conduct this interview.");
        return;
      }

      consumeHours(costs.interview);
      setInterviewedWitnesses((prev) => [...prev, role]);
      setWitnessTestimonies((prev) => ({
        ...prev,
        [role]: statement || "No statement provided.",
      }));

      const witnessObj = currentCase?.witnesses.find((w) => w.role === role);
      if (witnessObj?.id) {
        unlockClue("statements", witnessObj.id);
      }

      setClues((prev) => [
        ...prev,
        {
          id: `interview-${role}-${Date.now()}`,
          title: `Witness Interview: ${role}`,
          description: statement || "No statement provided.",
          category: "witness",
          timestamp: "Just now",
        },
      ]);
    }
  };

  const handleSubpoenaRequest = (suspectName: string) => {
    if (hoursRemaining !== null && hoursRemaining < costs.subpoena) {
      alert("Not enough shift hours remaining to execute a subpoena.");
      return;
    }

    consumeHours(costs.subpoena);
    const suspectData = currentCase?.suspects.find(
      (s) => s.name === suspectName,
    );
    if (suspectData?.subpoenaData?.messages) {
      suspectData.subpoenaData.messages.forEach((msg) => {
        unlockClue("messages", msg.id);
      });
    }

    setClues((prevClues) => [
      ...prevClues,
      {
        id: `subpoena-${suspectName}-${Date.now()}`,
        title: `Subpoena Unlocked: ${suspectName}`,
        description: `Official records obtained for ${suspectName}.`,
        category: "timeline",
        timestamp: "Just now",
      },
    ]);
  };

  const handleAccusationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAccusationError(null);

    if (
      !accusedSuspect ||
      !selectedMeans ||
      !selectedOpportunity ||
      !selectedMotive
    ) {
      setAccusationError("You must select proof for all four fields.");
      return;
    }

    const solution = currentCase?.solution;
    const requiredProof = solution?.requiredProof;

    const isSuspectCorrect = accusedSuspect === solution?.killerId;
    const isMeansCorrect = selectedMeans === requiredProof?.meansId;
    const isOpportunityCorrect =
      selectedOpportunity === requiredProof?.opportunityId;
    const isMotiveCorrect = selectedMotive === requiredProof?.motiveId;

    if (
      isSuspectCorrect &&
      isMeansCorrect &&
      isOpportunityCorrect &&
      isMotiveCorrect
    ) {
      setVerdict("correct");
      setIsAccusing(false);
    } else {
      if (!isSuspectCorrect) {
        setAccusationError(
          "The District Attorney rejected the warrant: You accused the wrong suspect.",
        );
      } else if (!isMeansCorrect) {
        setAccusationError(
          "The District Attorney says: You have the right suspect, but your proof of means/weapon is incorrect.",
        );
      } else if (!isOpportunityCorrect) {
        setAccusationError(
          "The District Attorney says: You identified the right suspect, but your proof of opportunity/timeline is flawed.",
        );
      } else if (!isMotiveCorrect) {
        setAccusationError(
          "The District Attorney says: You have the suspect and weapon, but your proof of motive is unconvincing.",
        );
      } else {
        setAccusationError("Insufficient evidence to secure a conviction.");
      }
    }
  };

  if (!currentCase) return null;

  const isTimeUp = hoursRemaining !== null && hoursRemaining <= 0;

  const suspectOptions: DropdownOption[] = (currentCase.suspects || []).map(
    (s) => ({
      id: s.id,
      label: `${s.name} (${s.role || s.relationToVictim || "Suspect"})`,
    }),
  );

  const meansOptions: DropdownOption[] = (currentCase.evidence || [])
    .filter((e) => unlockedClues.evidence.includes(e.id))
    .map((e) => ({
      id: e.id,
      label: `[Evidence] ${e.name}`,
    }));

  const availableWitnesses = (currentCase.witnesses || []).filter((w) =>
    unlockedClues.statements.includes(w.id),
  );

  const availableMessages: Array<Message & { suspectName: string }> = [];
  (currentCase.suspects || []).forEach((s) => {
    if (s.subpoenaData?.messages) {
      s.subpoenaData.messages.forEach((msg) => {
        if (unlockedClues.messages.includes(msg.id)) {
          availableMessages.push({ ...msg, suspectName: s.name });
        }
      });
    }
  });

  const opportunityOptions: DropdownOption[] = [
    ...availableWitnesses.map((w) => ({
      id: w.id,
      label: `[Witness] ${w.role}: "${w.statement.slice(0, 35)}..."`,
    })),
    ...meansOptions,
  ];

  const motiveOptions: DropdownOption[] = [
    ...availableMessages.map((msg) => ({
      id: msg.id,
      label: `[Text - ${msg.suspectName}] ${msg.time}: "${msg.text.slice(0, 35)}..."`,
    })),
  ];

  return (
    <div
      className={`${handDrawn.className} min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 text-stone-900 pb-12 relative`}
    >
      <HeaderNav
        caseNumber={currentCase.caseNumber}
        title={currentCase.title}
        difficulty={difficulty}
        onOpenAccusation={() => setIsAccusing(true)}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <nav className="flex gap-3 overflow-x-auto pb-2">
            {[
              { id: "briefing", label: "Briefing" },
              { id: "victim", label: "Victim Profile" },
              { id: "suspects", label: "Suspects" },
              { id: "evidence", label: "Evidence" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {hoursRemaining !== null && (
            <div className="bg-amber-50 border border-amber-300 px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-sm">
              <div>
                <p className="text-xs uppercase font-extrabold text-amber-800">
                  Shift Hours Remaining
                </p>
                <p className="text-lg font-bold text-amber-900">
                  {hoursRemaining} Hours
                </p>
              </div>
            </div>
          )}
        </div>

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
                onSelect={(suspect) => {
                  handleSubpoenaRequest(suspect.name);
                  setClues((prev) => {
                    const exists = prev.some(
                      (c) => c.id === `suspect-${suspect.id}`,
                    );
                    if (exists) return prev;
                    return [
                      ...prev,
                      {
                        id: `suspect-${suspect.id}`,
                        title: `Suspect Alibi: ${suspect.name}`,
                        description: suspect.alibi,
                        category: "witness",
                        timestamp: "Just now",
                      },
                    ];
                  });
                }}
              />
            )}
            {activeTab === "evidence" && (
              <EvidenceTab
                evidence={currentCase.evidence}
                witnesses={currentCase.witnesses}
                forensicTimer={hoursRemaining}
                interviewedWitnesses={interviewedWitnesses}
                witnessTestimonies={witnessTestimonies}
                onInterview={handleInterview}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <NotebookDrawer clues={clues} />

      {isTimeUp && verdict === "pending" && (
        <div className="fixed inset-0 bg-stone-900/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 text-center space-y-6 shadow-2xl border border-stone-200">
            <h2 className="text-4xl font-extrabold text-red-600">
              Shift Ended
            </h2>
            <p className="text-stone-700 text-lg">
              You ran out of action points and time. The suspect caught wind of
              the investigation and fled town before a warrant could be issued.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all cursor-pointer"
            >
              Try Case Again
            </button>
          </div>
        </div>
      )}

      {isAccusing && !isTimeUp && (
        <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h2 className="text-2xl font-bold text-stone-900">
                Create a Formal Accusation
              </h2>
              <button
                type="button"
                onClick={() => setIsAccusing(false)}
                className="text-stone-400 font-bold hover:text-stone-700 cursor-pointer"
                aria-label="Close accusation modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAccusationSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-stone-500 mb-1">
                  1. Primary Suspect
                </label>
                <CustomSelect
                  options={suspectOptions}
                  value={accusedSuspect}
                  onChange={setAccusedSuspect}
                  placeholder="Select Primary Suspect..."
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-stone-500 mb-1">
                  2. Proof of Means / Weapon
                </label>
                <CustomSelect
                  options={meansOptions}
                  value={selectedMeans}
                  onChange={setSelectedMeans}
                  placeholder="Select Evidence of Means..."
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-stone-500 mb-1">
                  3. Proof of Opportunity
                </label>
                <CustomSelect
                  options={opportunityOptions}
                  value={selectedOpportunity}
                  onChange={setSelectedOpportunity}
                  placeholder="Select Proof of Opportunity..."
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-stone-500 mb-1">
                  4. Proof of Motive
                </label>
                <CustomSelect
                  options={motiveOptions}
                  value={selectedMotive}
                  onChange={setSelectedMotive}
                  placeholder="Select Proof of Motive..."
                />
              </div>

              {accusationError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold">
                  {accusationError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAccusing(false)}
                  className="px-5 py-2.5 rounded-xl font-bold bg-stone-200 hover:bg-stone-300 transition-colors cursor-pointer"
                >
                  Review Case
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Submit Accusation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {verdict !== "pending" && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 text-center space-y-6 shadow-2xl border border-stone-200">
            <h2
              className={`text-4xl font-extrabold ${
                verdict === "correct" ? "text-green-600" : "text-red-600"
              }`}
            >
              {verdict === "correct" ? "Case Solved!" : "Wrong Suspect!"}
            </h2>
            <p className="text-stone-700 text-lg">
              {verdict === "correct"
                ? currentCase.solution?.closingStatement ||
                  "Great job, Detective! You cracked the case."
                : "The real culprit got away due to lack of evidence."}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all cursor-pointer"
            >
              Play Another Case
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
