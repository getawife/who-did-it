"use client";

import { Short_Stack } from "next/font/google";

const handDrawn = Short_Stack({ weight: "400", subsets: ["latin"] });

interface BriefingTabProps {
  description: string;
  crimeType: string;
  suspectsCount: number;
  witnessesCount: number;
}

export default function BriefingTab({
  description,
  crimeType,
  suspectsCount,
  witnessesCount,
}: BriefingTabProps) {
  return (
    <div
      className={`${handDrawn.className} bg-white rounded-2xl border border-stone-200 p-8 shadow-xl space-y-6`}
    >
      <div className="inline-block bg-stone-800 text-white px-3 py-1 rounded-lg text-sm font-semibold tracking-wide">
        Case Overview
      </div>
      <p className="text-xl text-stone-800 leading-relaxed">{description}</p>

      <div className="pt-6 border-t border-stone-200 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
          <span className="text-xs text-stone-500 uppercase tracking-wider">
            Crime Type
          </span>
          <p className="text-lg font-bold text-stone-900 mt-1">{crimeType}</p>
        </div>
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
          <span className="text-xs text-stone-500 uppercase tracking-wider">
            Suspects
          </span>
          <p className="text-lg font-bold text-stone-900 mt-1">
            {suspectsCount} Persons
          </p>
        </div>
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
          <span className="text-xs text-stone-500 uppercase tracking-wider">
            Witnesses
          </span>
          <p className="text-lg font-bold text-stone-900 mt-1">
            {witnessesCount} Interviews
          </p>
        </div>
      </div>
    </div>
  );
}
