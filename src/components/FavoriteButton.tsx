"use client";

import { useState, useTransition } from "react";
import { toggleFavorite } from "@/lib/actions/favorites";
import type { FavoriteTarget } from "@/lib/types";

export default function FavoriteButton({
  targetType,
  targetId,
  initialFavorited,
  isLoggedIn,
}: {
  targetType: FavoriteTarget;
  targetId: string;
  initialFavorited: boolean;
  isLoggedIn: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();

  if (!isLoggedIn) return null;

  return (
    <button
      type="button"
      aria-label="즐겨찾기"
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setFavorited((v) => !v);
        startTransition(() => toggleFavorite(targetType, targetId));
      }}
      className={`flex h-8 w-8 items-center justify-center rounded-full border text-[15px] transition ${
        favorited ? "border-coral bg-coral text-white" : "border-line bg-white text-ink-soft hover:border-coral hover:text-coral"
      }`}
    >
      {favorited ? "★" : "☆"}
    </button>
  );
}
