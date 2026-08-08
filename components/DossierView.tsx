"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Short_Stack } from "next/font/google";
import easyCases from "@/cases/easyCases.json";
import mediumCases from "@/cases/mediumCases.json";
import hardCases from "@/cases/hardCases.json";

import HeaderNav from "./HeaderNav";
import BriefingTab from "./BriefingTab";
import VictimTab from "./VictimTab";
import SuspectsTab from "./SuspectsTab";
import EvidenceTab from "./EvidenceTab";
import NotebookDrawer, { Clue } from "./NotebookDrawer";
import CharacterAvatar from "./CharacterAvatar";

const handDrawn = Short_Stack({ weight: "400", subsets: ["latin"] });

type Difficulty = "easy" | "medium" | "hard";

const FORENSIC_DELAYS: Record<Difficulty, number> = {
  easy: 10,
  medium: 30,
  hard: 60,
};

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
  type: string;
  description?: string;
}

interface Victim {
  name: string;
  modeOfDeath?: string;
  causeOfDeath?: string;
  [key: string]: unknown;
}

interface Solution {
  killerId: string | number;
  closingStatement?: string;
  requiredProof: {
    meansId: string | number;
    opportunityId: string | number;
    motiveId: string | number;
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
              <li
                key="no-options"
                className="p-3 text-sm text-stone-400 font-bold text-center"
              >
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
  const [timeRemainingMinutes, setTimeRemainingMinutes] = useState<
    number | null
  >(null);
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
  const [daFeedback, setDaFeedback] = useState<string>("");
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
  const [formValidationMessage, setFormValidationMessage] = useState<
    string | null
  >(null);

  const unlockClue = useCallback(
    (type: "evidence" | "statements" | "messages", id: string | number) => {
      const stringId = String(id);
      setUnlockedClues((prev) => {
        if (prev[type].includes(stringId)) return prev;
        return { ...prev, [type]: [...prev[type], stringId] };
      });
    },
    [],
  );

  const closeAccusationModal = () => {
    setIsAccusing(false);
    setFormValidationMessage(null);
  };

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

      setUnlockedClues({
        evidence: (currentCase.evidence || []).map((e) => String(e.id)),
        statements: [],
        messages: [],
      });

      if (difficulty === "easy") {
        setTimeRemainingMinutes(
          Math.floor(Math.random() * (900 - 720 + 1)) + 720,
        );
      } else if (difficulty === "medium") {
        setTimeRemainingMinutes(
          Math.floor(Math.random() * (600 - 480 + 1)) + 480,
        );
      } else if (difficulty === "hard") {
        setTimeRemainingMinutes(
          Math.floor(Math.random() * (480 - 300 + 1)) + 300,
        );
      }
    }
  }, [currentCase, difficulty]);

  useEffect(() => {
    if (timeRemainingMinutes === null || timeRemainingMinutes <= 0) return;
    const timer = setInterval(() => {
      setTimeRemainingMinutes((prev) =>
        prev !== null && prev > 0 ? prev - 1 : 0,
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemainingMinutes]);

  const handleInterview = (role: string, statement: string) => {
    if (!interviewedWitnesses.includes(role)) {
      setInterviewedWitnesses((prev) => [...prev, role]);
      setWitnessTestimonies((prev) => ({
        ...prev,
        [role]: statement || "No statement provided.",
      }));

      const witnessObj = currentCase?.witnesses.find((w) => w.role === role);
      const witnessId = witnessObj?.id || witnessObj?.role || role;

      unlockClue("statements", witnessId);

      setClues((prev) => [
        ...prev,
        {
          id: `interview-${role}-${Date.now()}`,
          title: `Witness Testimony: ${role}`,
          description: statement ?? "No statement provided.",
          category: "witness",
          timestamp: "Just now",
        },
      ]);
    }
  };

  const handleSubpoenaRequest = (suspectName: string) => {
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
        title: `Subpoena Obtained: ${suspectName}`,
        description: `Official phone records & messages obtained for ${suspectName}.`,
        category: "timeline",
        timestamp: "Just now",
      },
    ]);
  };

  const extractRawId = (prefixedId: string) =>
    prefixedId.replace(/^(evidence|witness|message)-/, "");

  const handleAccusationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationMessage(null);

    if (
      !accusedSuspect ||
      !selectedMeans ||
      !selectedOpportunity ||
      !selectedMotive
    ) {
      setFormValidationMessage(
        "Please select evidence for all four required fields.",
      );
      return;
    }

    const solution = currentCase?.solution;
    const requiredProof = solution?.requiredProof;

    const rawMeansId = extractRawId(selectedMeans);
    const rawOpportunityId = extractRawId(selectedOpportunity);
    const rawMotiveId = extractRawId(selectedMotive);

    const isSuspectCorrect =
      String(accusedSuspect) === String(solution?.killerId);
    const isMeansCorrect =
      String(rawMeansId) === String(requiredProof?.meansId);
    const isOpportunityCorrect =
      String(rawOpportunityId) === String(requiredProof?.opportunityId);
    const isMotiveCorrect =
      String(rawMotiveId) === String(requiredProof?.motiveId);

    setIsAccusing(false);

    if (
      isSuspectCorrect &&
      isMeansCorrect &&
      isOpportunityCorrect &&
      isMotiveCorrect
    ) {
      setVerdict("correct");
      setDaFeedback(
        solution?.closingStatement ||
          "Solid work, Detective! Your theory and proof held up cleanly in court. We got a conviction.",
      );
    } else {
      setVerdict("incorrect");
      if (!isSuspectCorrect) {
        setDaFeedback(
          "I can't take this to court. You brought us the wrong suspect entirely—the real killer is walking free.",
        );
      } else if (!isMeansCorrect) {
        setDaFeedback(
          "You brought the right suspect, but your proof regarding the weapon or means fell apart under defense cross-examination.",
        );
      } else if (!isOpportunityCorrect) {
        setDaFeedback(
          "You identified the right suspect, but your timeline and proof of opportunity were easily torn apart by the defense.",
        );
      } else if (!isMotiveCorrect) {
        setDaFeedback(
          "We have the right suspect and weapon, but your proof of motive wasn't convincing enough to establish intent to the jury.",
        );
      } else {
        setDaFeedback(
          "The evidence wasn't strong enough to secure a conviction.",
        );
      }
    }
  };

  if (!currentCase) return null;

  const isTimeUp = timeRemainingMinutes !== null && timeRemainingMinutes <= 0;

  const displayHours =
    timeRemainingMinutes !== null
      ? (timeRemainingMinutes / 60).toFixed(1)
      : "0";

  const suspectOptions: DropdownOption[] = (currentCase.suspects || []).map(
    (s) => ({
      id: String(s.id),
      label: `${s.name} (${s.role || s.relationToVictim || "Suspect"})`,
    }),
  );

  const availableWitnesses = (currentCase.witnesses || []).filter((w) => {
    const witnessKey = String(w.id || w.role);
    return unlockedClues.statements.includes(witnessKey);
  });

  const availableMessages: Array<Message & { suspectName: string }> = [];
  (currentCase.suspects || []).forEach((s) => {
    if (s.subpoenaData?.messages) {
      s.subpoenaData.messages.forEach((msg) => {
        if (unlockedClues.messages.includes(String(msg.id))) {
          availableMessages.push({ ...msg, suspectName: s.name });
        }
      });
    }
  });

  const allClueOptions: DropdownOption[] = [
    ...(currentCase.evidence || [])
      .filter((e) => unlockedClues.evidence.includes(String(e.id)))
      .map((e) => ({
        id: `evidence-${e.id}`,
        label: `[Evidence] ${e.name}`,
      })),
    ...availableWitnesses.map((w) => ({
      id: `witness-${w.id || w.role}`,
      label: `[Witness] ${w.role}: "${w.statement.slice(0, 35)}..."`,
    })),
    ...availableMessages.map((msg) => ({
      id: `message-${msg.id}`,
      label: `[Subpoena Text - ${msg.suspectName}] ${msg.time}: "${msg.text.slice(0, 35)}..."`,
    })),
  ];

  const meansOptions = allClueOptions;
  const opportunityOptions = allClueOptions;
  const motiveOptions = allClueOptions;

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

          {timeRemainingMinutes !== null && (
            <div className="bg-white shadow-sm px-5 py-2.5 rounded-2xl flex items-center gap-3">
              <div>
                <p className="text-xs uppercase font-extrabold text-black">
                  Shift Hours Remaining
                </p>
                <p className="text-lg font-bold text-stone-600">
                  {displayHours} Hours
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
                        description: suspect.alibi ?? "No alibi provided.",
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
                forensicDelay={FORENSIC_DELAYS[difficulty]}
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
              You ran out of time. The suspect caught wind of the investigation
              and fled town before a warrant could be issued.
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
                onClick={closeAccusationModal}
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

              {formValidationMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold">
                  {formValidationMessage}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeAccusationModal}
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
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-stone-200 space-y-6">
            <h2
              className={`text-4xl font-extrabold text-center ${
                verdict === "correct" ? "text-green-600" : "text-red-600"
              }`}
            >
              {verdict === "correct" ? "Case Solved!" : "Verdict: Acquitted!"}
            </h2>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-stone-50 p-6 rounded-2xl border border-stone-200">
              <div className="flex-shrink-0 text-center">
                <CharacterAvatar
                  seed="District Attorney DA"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <p className="mt-2 text-xs font-extrabold uppercase tracking-wider text-stone-500">
                  District Attorney
                </p>
              </div>

              <div className="flex-1 space-y-2">
                <p className="text-xs font-extrabold uppercase text-blue-600">
                  DA Statement
                </p>
                <p className="text-stone-800 text-base leading-relaxed italic">
                  &ldquo;{daFeedback}&rdquo;
                </p>
              </div>
            </div>

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
