"use client";

import CharacterAvatar from "./CharacterAvatar";
import { Short_Stack } from "next/font/google";

const handDrawn = Short_Stack({ weight: "400", subsets: ["latin"] });

export default function SuspectsTab({
  suspects,
  onSelect,
}: {
  suspects: any[];
  onSelect: (s: any) => void;
}) {
  return (
    <div
      className={`${handDrawn.className} bg-white rounded-2xl border border-stone-200 p-8 shadow-xl`}
    >
      <h2 className="text-2xl font-bold text-stone-900 mb-6">
        Persons of Interest
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suspects.map((suspect) => (
          <button
            key={suspect.id}
            onClick={() => onSelect(suspect)}
            className="p-5 rounded-xl border-2 border-stone-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left flex items-center gap-4 group cursor-pointer"
          >
            <CharacterAvatar
              seed={suspect.name}
              className="w-16 h-16 rounded-xl border border-stone-300 shadow-sm"
            />
            <div>
              <h3 className="font-bold text-lg text-stone-900 group-hover:text-blue-700">
                {suspect.name}
              </h3>
              <p className="text-stone-600 text-sm mb-1">
                {suspect.relationToVictim}
              </p>
              <span className="text-xs font-semibold text-blue-600">
                Review File ➔
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
