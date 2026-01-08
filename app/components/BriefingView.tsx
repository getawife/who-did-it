"use client";
import { motion } from "framer-motion";

interface BriefingProps {
  name: string;
  onNameChange: (name: string) => void;
  agreed: boolean;
  onAgreeChange: (agreed: boolean) => void;
  onEnterScene: () => void;
}

export default function BriefingView({
  name,
  onNameChange,
  agreed,
  onAgreeChange,
  onEnterScene,
}: BriefingProps) {
  return (
    <motion.div
      key="briefing"
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      transition={{ duration: 0.4, ease: "circOut" }}
      className="absolute inset-0 flex flex-col items-center justify-center space-y-6 w-full"
    >
      <div className="w-full bg-white border-2 border-stone-400 p-8 shadow-sm overflow-y-auto max-h-[400px]">
        <div className="mb-6 space-y-4 text-stone-800">
          <div className="flex items-center space-x-2 border-b border-stone-200 pb-2 mb-4">
            <span className="font-bold uppercase text-xs text-stone-500">
              Personnel:
            </span>
            <div className="flex items-center">
              <span className="mr-2">Detective</span>
              <input
                type="text"
                placeholder="Enter Name"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                className="border-b border-stone-400 focus:outline-none focus:border-red-700 bg-transparent w-40 placeholder:text-stone-300"
              />
            </div>
          </div>

          <p className="text-lg leading-relaxed">
            The ink on your reinstatement papers is barely dry. They told you
            the precinct had changed, but the smell remains the same. It is the
            scent of stale coffee and heavy regret.
          </p>
          <p className="text-lg leading-relaxed">
            You have been assigned Case 402-B. It is a gruesome one. It is the
            kind of scene that makes the rookies lose their lunch and the
            veterans lose their sleep. The details are jagged, the evidence is
            cold, and the victim is waiting for a voice.
          </p>

          <div className="bg-stone-50 p-4 border-l-4 border-stone-800 mt-6">
            <p className="text-xs uppercase font-bold text-stone-500 mb-1">
              Content Advisory
            </p>
            <p className="text-stone-600 text-sm italic">
              This investigation involves graphic depictions of violence,
              references to self-harm, and psychological distress. Viewer
              discretion is mandatory before viewing the files.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="agree"
            checked={agreed}
            onChange={(e) => onAgreeChange(e.target.checked)}
            className="w-5 h-5 text-stone-800 cursor-pointer"
          />
          <label
            htmlFor="agree"
            className="text-lg cursor-pointer select-none text-stone-900"
          >
            I agree and would like to proceed
          </label>
        </div>

        <button
          disabled={!agreed || !name}
          onClick={onEnterScene}
          className={`px-12 py-2 bg-stone-900 text-white rounded transition-all ${
            agreed && name
              ? "opacity-100 hover:bg-stone-700"
              : "opacity-20 cursor-not-allowed"
          }`}
        >
          Enter Scene
        </button>
      </div>
    </motion.div>
  );
}
