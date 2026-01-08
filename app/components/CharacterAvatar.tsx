"use client";

import React, { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { croodles } from "@dicebear/collection";

interface AvatarProps {
  seed: string;
  className?: string;
}

export default function CharacterAvatar({ seed, className }: AvatarProps) {
  const avatar = useMemo(() => {
    return createAvatar(croodles, {
      seed: seed,
      // We can customize properties to match a "noir" or "sketchy" vibe
      backgroundColor: ["fdf6e3"], // Match our paper color
    }).toDataUri();
  }, [seed]);

  return (
    <img
      src={avatar}
      alt={`${seed} avatar`}
      className={`border-2 border-stone-800 bg-[#fdf6e3] shadow-sm ${className}`}
    />
  );
}
