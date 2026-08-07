"use client";

import CharacterAvatar from "./CharacterAvatar";
import { Short_Stack } from "next/font/google";

const handDrawn = Short_Stack({ weight: "400", subsets: ["latin"] });

interface EvidenceItem {
  id: string;
  name: string;
  type: string;
  description?: string;
}

interface WitnessItem {
  id?: string;
  role: string;
  statement: string;
}

interface EvidenceTabProps {
  evidence?: EvidenceItem[];
  witnesses?: WitnessItem[];
  forensicTimer: number | null;
  interviewedWitnesses?: string[];
  witnessTestimonies?: Record<string, string>;
  onInterview: (role: string, statement: string) => void;
}

export default function EvidenceTab({
  evidence = [],
  witnesses = [],
  forensicTimer,
  interviewedWitnesses = [],
  witnessTestimonies = {},
  onInterview,
}: EvidenceTabProps) {
  return (
    <div className={`${handDrawn.className} space-y-8`}>
      <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-stone-900">
            Physical Evidence
          </h2>
          {forensicTimer !== null && forensicTimer > 0 && (
            <span className="px-4 py-2 bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-semibold animate-pulse">
              Forensic Available in ({forensicTimer}s)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evidence.map((item) => {
            const isForensicPending =
              item.type === "Forensic" && (forensicTimer ?? 0) > 0;

            return (
              <div
                key={item.id}
                className="p-5 bg-stone-50 border border-stone-200 rounded-xl"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-stone-900">{item.name}</h3>
                  <span className="text-xs px-2 py-0.5 bg-stone-200 rounded-md font-semibold text-stone-700">
                    {item.type}
                  </span>
                </div>
                <p
                  className={`text-stone-700 text-sm ${
                    isForensicPending ? "blur-sm select-none" : ""
                  }`}
                >
                  {item.description || "No description recorded."}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-stone-900 mb-6">
          Witness Statements
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {witnesses.map((w, idx) => {
            const isInterviewed = interviewedWitnesses.includes(w.role);

            return (
              <div
                key={w.id || `witness-${idx}`}
                className="p-5 bg-stone-50 border border-stone-200 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CharacterAvatar
                      seed={w.role}
                      className="w-10 h-10 rounded-lg"
                    />
                    <span className="font-bold text-stone-900">{w.role}</span>
                  </div>

                  {!isInterviewed && (
                    <button
                      onClick={() => onInterview(w.role, w.statement)}
                      className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      Question
                    </button>
                  )}
                </div>

                {isInterviewed ? (
                  <p className="text-sm italic text-stone-700 bg-white p-3 rounded-lg border border-stone-200">
                    "{witnessTestimonies[w.role] || w.statement}"
                  </p>
                ) : (
                  <p className="text-xs text-stone-400 italic">
                    Statement unrecorded
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
