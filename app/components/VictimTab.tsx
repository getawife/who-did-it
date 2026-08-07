"use client";

import CharacterAvatar from "./CharacterAvatar";
import { Short_Stack } from "next/font/google";

const handDrawn = Short_Stack({ weight: "400", subsets: ["latin"] });

interface VictimProps {
  victim: {
    name: string;
    job: string;
    age: number;
    timeOfDeath: string;
    routine: string[];
  };
}

export default function VictimTab({ victim }: VictimProps) {
  return (
    <div
      className={`${handDrawn.className} bg-white rounded-2xl border border-stone-200 p-8 shadow-xl space-y-6`}
    >
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-stone-200">
        <CharacterAvatar
          seed={victim.name}
          className="w-28 h-28 rounded-2xl border-2 border-stone-300 shadow-md"
        />
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-bold text-stone-900">{victim.name}</h2>
          <p className="text-stone-600 text-lg">
            {victim.job}, {victim.age} years old
          </p>
          <span className="inline-block mt-2 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-semibold">
            Estimated TOD: {victim.timeOfDeath}
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-stone-900 mb-4">
          Verified Timeline
        </h3>
        <div className="space-y-3">
          {victim.routine.map((line, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 bg-stone-50 border border-stone-200 rounded-xl"
            >
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                {i + 1}
              </span>
              <p className="text-stone-800 text-base">{line}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
