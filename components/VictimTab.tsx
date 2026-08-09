"use client";

import CharacterAvatar from "./CharacterAvatar";

export interface VictimData {
  name?: string;
  job?: string;
  occupation?: string;
  age?: number | string;
  timeOfDeath?: string;
  tod?: string;
  routine?: string[];
  timeline?: string[];
  description?: string;
}

export interface VictimProps {
  victim?: VictimData;
}

export default function VictimTab({ victim }: VictimProps) {
  if (!victim) {
    return (
      <div className="bg-parchment-card rounded-2xl border-2 border-stone-800 p-8 shadow-xl text-stone-900">
        <p className="text-stone-600 italic text-sm font-semibold">
          No victim details recorded for this case.
        </p>
      </div>
    );
  }

  const isValidValue = (val?: string | number) => {
    if (val === undefined || val === null) return false;
    const str = String(val).trim().toUpperCase();
    return str !== "" && str !== "N/A" && str !== "NA" && str !== "UNCERTAIN";
  };

  const name = victim.name || "Unknown Victim";
  const job = victim.job || victim.occupation || "Occupation Unspecified";

  const rawAge = victim.age;
  const rawTod = victim.timeOfDeath || victim.tod;

  const hasAge = isValidValue(rawAge);
  const hasTod = isValidValue(rawTod);

  const timelineEvents = victim.routine || victim.timeline || [];

  return (
    <div className="bg-parchment-card rounded-2xl border-2 border-stone-800 p-8 shadow-xl space-y-6 text-stone-900">
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b-2 border-stone-800">
        <div className="w-28 h-28 rounded-2xl border-2 border-stone-800 shadow-md bg-parchment-main overflow-hidden p-1.5 flex items-center justify-center shrink-0">
          <CharacterAvatar seed={name} className="w-full h-full" />
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-extrabold text-stone-900">{name}</h2>
          <p className="text-stone-700 text-lg font-bold">
            {job}
            {hasAge && `, ${rawAge} years old`}
          </p>
          {hasTod && (
            <span className="inline-block mt-2 px-3 py-1 bg-stone-800 text-parchment-main border border-stone-800 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
              Estimated TOD: {rawTod}
            </span>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-extrabold text-stone-900 mb-4">Timeline</h3>
        {timelineEvents.length === 0 ? (
          <p className="text-stone-600 italic text-sm font-semibold">
            No timeline or routine recorded.
          </p>
        ) : (
          <div className="space-y-3">
            {timelineEvents.map((line, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 bg-parchment-main border-2 border-stone-800 rounded-xl shadow-sm"
              >
                <span className="w-7 h-7 rounded-full bg-stone-800 text-parchment-main flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                  {i + 1}
                </span>
                <p className="text-stone-900 text-base font-semibold leading-relaxed">
                  {line}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
