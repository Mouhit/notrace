"use client";
import { useEffect, useState } from "react";
import { nanoid } from "nanoid";

export function useOwnerId(): string | null {
  const [ownerId, setOwnerId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem("notrace-owner-id");
    if (!id) {
      id = nanoid(20);
      localStorage.setItem("notrace-owner-id", id);
    }
    setOwnerId(id);
  }, []);

  return ownerId;
}
