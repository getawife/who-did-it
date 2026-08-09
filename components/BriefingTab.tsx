"use client";

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
    <div className="bg-parchment-main rounded-2xl border-2 border-stone-800 p-8 shadow-md space-y-6">
      <div className="inline-block bg-stone-800 text-parchment-main px-3 py-1 rounded-lg text-sm font-semibold tracking-wide">
        Case Overview
      </div>

      <p className="text-xl text-stone-900 leading-relaxed">{description}</p>

      <div className="pt-6 border-t-2 border-stone-800/20 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-parchment-card border-2 border-stone-800 rounded-xl">
          <span className="text-xs text-stone-700 uppercase tracking-wider font-semibold">
            Crime Type
          </span>
          <p className="text-lg font-bold text-stone-900 mt-1">{crimeType}</p>
        </div>

        <div className="p-4 bg-parchment-card border-2 border-stone-800 rounded-xl">
          <span className="text-xs text-stone-700 uppercase tracking-wider font-semibold">
            Suspects
          </span>
          <p className="text-lg font-bold text-stone-900 mt-1">
            {suspectsCount} {suspectsCount === 1 ? "Person" : "Persons"}
          </p>
        </div>

        <div className="p-4 bg-parchment-card border-2 border-stone-800 rounded-xl">
          <span className="text-xs text-stone-700 uppercase tracking-wider font-semibold">
            Witnesses
          </span>
          <p className="text-lg font-bold text-stone-900 mt-1">
            {witnessesCount} {witnessesCount === 1 ? "Interview" : "Interviews"}
          </p>
        </div>
      </div>
    </div>
  );
}
