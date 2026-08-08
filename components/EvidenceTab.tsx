"use client";

import React, { useState, useEffect, useRef } from "react";
import CharacterAvatar from "./CharacterAvatar";
import { Short_Stack } from "next/font/google";

const handDrawn = Short_Stack({ weight: "400", subsets: ["latin"] });

export interface EvidenceItem {
  id: string;
  name: string;
  type: string;
  description?: string;
  [key: string]: any;
}

export interface QAItem {
  question: string;
  answer: string;
}

export interface WitnessItem {
  id?: string;
  role: string;
  statement?: string;
  reliability?: string;
  qna?: string | QAItem[];
  [key: string]: any;
}

export interface EvidenceTabProps {
  evidence?: EvidenceItem[];
  witnesses?: WitnessItem[];
  forensicDelay?: number;
  interviewedWitnesses?: string[];
  witnessTestimonies?: Record<string, string>;
  onInterview?: (role: string, statement: string) => void;
}

function parseWitnessQnA(witnessData: WitnessItem): QAItem[] {
  if (Array.isArray(witnessData.qna)) {
    return witnessData.qna;
  }

  const textSource = witnessData.qna || witnessData.statement || "";
  const blocks = textSource.split(/(?=Q:\s*)/).filter(Boolean);

  const parsed: QAItem[] = [];
  for (const block of blocks) {
    const qMatch = block.match(/Q:\s*([\s\S]*?)(?=\nA:|$)/);
    const aMatch = block.match(/A:\s*([\s\S]*?)(?=\nQ:|$)/);
    if (qMatch && aMatch) {
      parsed.push({
        question: qMatch[1].trim(),
        answer: aMatch[1].trim(),
      });
    }
  }

  if (parsed.length === 0 && textSource.trim()) {
    parsed.push({
      question: "Statement / Observation",
      answer: textSource.trim(),
    });
  }

  return parsed;
}

export default function EvidenceTab({
  evidence = [],
  witnesses = [],
  forensicDelay = 30,
  interviewedWitnesses = [],
  witnessTestimonies = {},
  onInterview,
}: EvidenceTabProps) {
  const [activeWitness, setActiveWitness] = useState<WitnessItem | null>(null);
  const [currentQAIndex, setCurrentQAIndex] = useState(0);
  const [typedQuestion, setTypedQuestion] = useState("");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [isTypingQuestion, setIsTypingQuestion] = useState(false);
  const [isTypingAnswer, setIsTypingAnswer] = useState(false);

  const [localForensicTime, setLocalForensicTime] =
    useState<number>(forensicDelay);

  const typewriterAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/audio/Typewriter.mp3");
    audio.volume = 0.2;
    audio.loop = true; // Loop audio as long as typing continues
    typewriterAudioRef.current = audio;

    return () => {
      audio.pause();
    };
  }, []);

  const playAudio = () => {
    if (typewriterAudioRef.current) {
      if (typewriterAudioRef.current.paused) {
        typewriterAudioRef.current.play().catch(() => {});
      }
    }
  };

  const stopAudio = () => {
    if (typewriterAudioRef.current) {
      typewriterAudioRef.current.pause();
      typewriterAudioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    setLocalForensicTime(forensicDelay);
  }, [forensicDelay]);

  useEffect(() => {
    if (localForensicTime <= 0) return;
    const timer = setInterval(() => {
      setLocalForensicTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [localForensicTime]);

  const qaPairs = activeWitness ? parseWitnessQnA(activeWitness) : [];
  const currentPair = qaPairs[currentQAIndex];

  useEffect(() => {
    if (!activeWitness || !currentPair) return;

    setTypedQuestion("");
    setTypedAnswer("");
    setIsTypingQuestion(true);
    setIsTypingAnswer(false);

    let qIndex = 0;
    let aIndex = 0;
    let typingState: "question" | "answer" | "done" = "question";

    const qText = currentPair.question;
    const aText = currentPair.answer;

    playAudio();

    const interval = setInterval(() => {
      if (typingState === "question") {
        if (qIndex < qText.length) {
          setTypedQuestion(qText.slice(0, qIndex + 1));
          qIndex++;
        } else {
          typingState = "answer";
          setIsTypingQuestion(false);
          setIsTypingAnswer(true);
        }
      } else if (typingState === "answer") {
        if (aIndex < aText.length) {
          setTypedAnswer(aText.slice(0, aIndex + 1));
          aIndex++;
        } else {
          typingState = "done";
          setIsTypingAnswer(false);
          stopAudio();
          clearInterval(interval);
        }
      }
    }, 25);

    return () => {
      clearInterval(interval);
      stopAudio();
    };
  }, [activeWitness, currentQAIndex]);

  const handleStartInterview = (witness: WitnessItem) => {
    setActiveWitness(witness);
    setCurrentQAIndex(0);
  };

  const handleContinue = () => {
    if (currentQAIndex < qaPairs.length - 1) {
      setCurrentQAIndex((prev) => prev + 1);
    } else {
      if (activeWitness && onInterview) {
        const fullStatement = qaPairs
          .map((p) => `Q: ${p.question}\nA: ${p.answer}`)
          .join("\n");
        onInterview(activeWitness.role, fullStatement);
      }
      setActiveWitness(null);
    }
  };

  const hasForensicItem = evidence.some(
    (item) => item.type?.toLowerCase() === "forensic",
  );

  return (
    <div className={`${handDrawn.className} space-y-8 relative`}>
      <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-stone-900">
            Physical Evidence
          </h2>
          {hasForensicItem && localForensicTime > 0 && (
            <span className="px-4 py-2 bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-semibold">
              Forensic Available in ({localForensicTime}s)
            </span>
          )}
        </div>

        {evidence.length === 0 ? (
          <p className="text-stone-400 italic text-sm py-4">
            No physical evidence collected for this case yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evidence.map((item, idx) => {
              const isForensicPending =
                item.type?.toLowerCase() === "forensic" &&
                localForensicTime > 0;

              return (
                <div
                  key={item.id || `evidence-${idx}`}
                  className="p-5 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-stone-900">{item.name}</h3>
                    <span className="text-xs px-2 py-0.5 bg-stone-200 rounded-md font-semibold text-stone-700">
                      {item.type}
                    </span>
                  </div>
                  <p
                    className={`text-stone-700 text-sm transition-all duration-500 ${
                      isForensicPending ? "blur-sm select-none" : ""
                    }`}
                  >
                    {item.description || "No description recorded."}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-stone-900 mb-6">
          Witness Statements
        </h2>

        {witnesses.length === 0 ? (
          <p className="text-stone-400 italic text-sm py-4">
            No witness statements recorded for this case.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {witnesses.map((w, idx) => {
              const isInterviewed = interviewedWitnesses.includes(w.role);
              const wPairs = parseWitnessQnA(w);

              return (
                <div
                  key={w.id || `witness-${idx}`}
                  className="p-6 bg-stone-50 border border-stone-200 rounded-2xl space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <CharacterAvatar
                      seed={w.role}
                      className="w-10 h-10 rounded-lg shrink-0 border border-stone-300 shadow-sm"
                    />
                    <span className="font-bold text-lg text-stone-900">
                      {w.role}
                    </span>
                  </div>

                  {isInterviewed ? (
                    <div className="flex flex-col md:flex-row gap-6 items-start pt-2">
                      <div className="flex-1 space-y-3 bg-white p-5 rounded-xl border border-stone-200 w-full shadow-sm">
                        {wPairs.map((pair, qIdx) => (
                          <div
                            key={qIdx}
                            className="space-y-1 border-b border-stone-100 pb-3 last:border-b-0 last:pb-0"
                          >
                            <p className="text-xs font-semibold text-stone-900">
                              {pair.question}
                            </p>
                            <p className="text-sm italic text-stone-700 leading-relaxed">
                              "{pair.answer}"
                            </p>
                          </div>
                        ))}
                      </div>

                      {w.reliability && (
                        <div className="relative w-full md:w-64 shrink-0 bg-amber-100/90 border border-amber-300/80 rounded-sm p-5 shadow-md rotate-1 transition-transform  mt-2 md:mt-0">
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full  flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-stone-900/60" />
                          </div>

                          <span className="font-bold tracking-wider uppercase text-[10px] text-amber-900/70 block mb-2 pt-1 border-b border-amber-300/70 pb-1">
                            Detective's Note
                          </span>
                          <p className="text-xs italic text-amber-950 leading-relaxed">
                            "My assessment on this witness: {w.reliability}"
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-stone-400 italic">
                        Statement unrecorded
                      </p>
                      <button
                        type="button"
                        onClick={() => handleStartInterview(w)}
                        className="px-6 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer shadow-md"
                      >
                        Question
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activeWitness && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-2xl max-w-2xl w-full relative flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 space-y-4 w-full">
              <div className="border-b border-stone-100 pb-2">
                <p className="text-base font-semibold text-stone-900 mt-1 min-h-[3rem]">
                  {typedQuestion}
                  {isTypingQuestion && (
                    <span className="inline-block w-1.5 h-4 bg-stone-900 ml-1 animate-pulse" />
                  )}
                </p>
              </div>

              <div className="min-h-[5rem] bg-stone-50 p-4 rounded-xl border border-stone-200">
                <p className="text-sm italic text-stone-700">
                  "{typedAnswer}"
                  {isTypingAnswer && (
                    <span className="inline-block w-1.5 h-3 bg-stone-700 ml-1 animate-pulse" />
                  )}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                {!isTypingQuestion && !isTypingAnswer && (
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="px-6 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer shadow-md"
                  >
                    {currentQAIndex < qaPairs.length - 1
                      ? "Continue"
                      : "Finish"}
                  </button>
                )}
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-center">
              <CharacterAvatar
                seed={activeWitness.role}
                className="w-24 h-24 rounded-2xl shadow-md border-2 border-stone-200"
              />
              <span className="text-sm font-bold text-stone-900 mt-2">
                {activeWitness.role}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
