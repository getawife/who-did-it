"use client";
import { motion } from "framer-motion";

interface LandingProps {
  onProceed: () => void;
}

export default function LandingView({ onProceed }: LandingProps) {
  return (
    <motion.div
      key="landing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      transition={{ duration: 0.6, ease: "circOut" }}
      // Updated: items-center justify-center with high-contrast text colors
      className="absolute inset-0 flex flex-col items-center justify-center space-y-12 bg-[#d6d3d1]/20 rounded-xl"
    >
      <div className="space-y-4 text-center">
        <h1 className="text-5xl md:text-7xl text-stone-900 tracking-tighter font-black uppercase">
          Can you solve <br /> the given case?
        </h1>
      </div>

      <button
        onClick={onProceed}
        className="group relative px-12 py-5 bg-stone-900 text-stone-100 overflow-hidden transition-all hover:bg-stone-800 text-2xl uppercase tracking-[0.2em] font-bold shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
      >
        <span className="relative z-10">Proceed</span>
        {/* Subtle hover effect */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      <p className="text-stone-400 text-xs uppercase tracking-widest pt-10">
        Investigation Authorization Required
      </p>
    </motion.div>
  );
}
