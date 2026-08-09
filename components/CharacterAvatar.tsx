"use client";

import React, { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { croodles } from "@dicebear/collection";

interface AvatarProps {
  seed: string;
  className?: string;
  isSuspect?: boolean;
}

export default function CharacterAvatar({ seed, className }: AvatarProps) {
  const avatar = useMemo(() => {
    return createAvatar(croodles, {
      seed: seed,
      backgroundColor: ["transparent"],
      scale: 80,
    }).toDataUri();
  }, [seed]);

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-xl ${
        className || "w-10 h-10"
      }`}
    >
      <img
        src={avatar}
        alt={`${seed} avatar`}
        className="w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
}
