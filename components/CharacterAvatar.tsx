"use client";

import React, { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { croodles } from "@dicebear/collection";

interface AvatarProps {
  seed: string;
  className?: string;
  isSuspect?: boolean;
}

export default function CharacterAvatar({
  seed,
  className,
  isSuspect = false,
}: AvatarProps) {
  const avatar = useMemo(() => {
    const bgColors = isSuspect
      ? ["d9d0c1", "c8beae"]
      : ["fdf6e3", "f5e6c8", "e7d7c1"];

    return createAvatar(croodles, {
      seed: seed,
      backgroundColor: bgColors,
    }).toDataUri();
  }, [seed, isSuspect]);

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[#fdf6e3] ${
        className || "w-10 h-10"
      }`}
    >
      <img
        src={avatar}
        alt={`${seed} avatar`}
        className="w-full h-full object-cover scale-110"
      />
    </div>
  );
}
