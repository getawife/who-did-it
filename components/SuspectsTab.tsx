"use client";

import { useState } from "react";
import CharacterAvatar from "./CharacterAvatar";
import { Short_Stack } from "next/font/google";

const handDrawn = Short_Stack({ weight: "400", subsets: ["latin"] });

export interface Message {
  id: string;
  sender?: string;
  from?: string;
  time?: string;
  text?: string;
}

export interface Suspect {
  id: string;
  name: string;
  relationToVictim?: string;
  alibi?: string;
  role?: string;
  motive?: string;
  subpoenaData?: {
    messages?: Message[];
  };
  [key: string]: any; // Flexible index signature
}

export interface SuspectsTabProps {
  suspects?: Suspect[];
  onSelect?: (suspect: Suspect) => void;
}

export default function SuspectsTab({
  suspects = [],
  onSelect,
}: SuspectsTabProps) {
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);

  const handleSelect = (suspect: Suspect) => {
    setSelectedSuspect(suspect);
    if (onSelect) onSelect(suspect);
  };

  return (
    <div
      className={`${handDrawn.className} bg-white rounded-2xl border border-stone-200 p-8 shadow-xl`}
    >
      <h2 className="text-2xl font-bold text-stone-900 mb-6">
        Persons of Interest
      </h2>

      {suspects.length === 0 ? (
        <p className="text-stone-400 italic text-sm py-4">
          No suspects recorded for this case.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suspects.map((suspect, idx) => (
            <button
              key={suspect.id || `suspect-${idx}`}
              type="button"
              onClick={() => handleSelect(suspect)}
              className="p-5 rounded-xl border-2 border-stone-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left flex items-center gap-4 group cursor-pointer"
            >
              <CharacterAvatar
                seed={suspect.name}
                className="w-16 h-16 rounded-xl border border-stone-300 shadow-sm shrink-0"
              />
              <div>
                <h3 className="font-bold text-lg text-stone-900 group-hover:text-blue-700">
                  {suspect.name}
                </h3>
                <p className="text-stone-600 text-sm mb-1">
                  {suspect.relationToVictim || "Relation unspecified"}
                </p>
                <span className="text-xs font-semibold text-blue-600">
                  Review File
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedSuspect && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative border-2 border-stone-300 shadow-2xl flex flex-col md:flex-row gap-6">
            <button
              type="button"
              onClick={() => setSelectedSuspect(null)}
              className="cursor-pointer absolute top-4 right-4 text-stone-500 hover:text-stone-800 text-xl font-bold z-10"
              aria-label="Close dossier modal"
            >
              ✕
            </button>

            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <CharacterAvatar
                  seed={selectedSuspect.name}
                  className="w-20 h-20 rounded-xl border border-stone-300 shadow-md"
                />
                <div>
                  <h3 className="text-2xl font-bold text-stone-900">
                    {selectedSuspect.name}
                  </h3>
                  <p className="text-stone-600 text-sm">
                    {selectedSuspect.relationToVictim || "Relation unspecified"}
                  </p>
                  {selectedSuspect.role && (
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded border border-amber-300 font-semibold">
                      {selectedSuspect.role}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200">
                <h4 className="font-bold text-sm text-stone-700 uppercase tracking-wide mb-1">
                  Alibi
                </h4>
                <p className="text-stone-800 text-sm leading-relaxed">
                  {selectedSuspect.alibi || "No alibi statement recorded."}
                </p>
              </div>

              {selectedSuspect.motive && (
                <div className="bg-white p-4 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-sm text-stone-700 uppercase tracking-wide mb-1">
                    Suspected Motive
                  </h4>
                  <p className="text-stone-800 text-sm leading-relaxed">
                    {selectedSuspect.motive}
                  </p>
                </div>
              )}
            </div>

            <div className="w-full md:w-72 shrink-0">
              <div className="bg-stone-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-stone-700">
                <div className="w-20 h-4 bg-stone-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-stone-900 border border-stone-700"></div>
                </div>

                <div className="bg-slate-900 rounded-[1.8rem] p-3 h-96 flex flex-col justify-between overflow-hidden font-sans">
                  <div className="border-b border-slate-800 pb-2 text-center">
                    <p className="text-xs font-semibold text-slate-300">
                      Subpoenaed Records
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto my-2 space-y-3 pr-1 text-xs">
                    {selectedSuspect.subpoenaData?.messages &&
                    selectedSuspect.subpoenaData.messages.length > 0 ? (
                      selectedSuspect.subpoenaData.messages.map((msg, mIdx) => {
                        const senderName = msg.sender || msg.from || "Unknown";
                        const isSuspect =
                          senderName.toLowerCase() ===
                          selectedSuspect.name.toLowerCase();

                        return (
                          <div
                            key={msg.id || `msg-${mIdx}`}
                            className={`flex flex-col ${
                              isSuspect ? "items-end" : "items-start"
                            }`}
                          >
                            <span className="text-[9px] text-slate-400 mb-0.5 px-1">
                              {senderName} {msg.time ? `• ${msg.time}` : ""}
                            </span>
                            <div
                              className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-snug ${
                                isSuspect
                                  ? "bg-blue-600 text-white rounded-br-none"
                                  : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700"
                              }`}
                            >
                              {msg.text || ""}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex items-center justify-center text-center p-4 text-slate-500 text-xs italic">
                        No subpoenaed message logs available for this suspect.
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-center">
                    <div className="w-16 h-1 bg-slate-700 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
