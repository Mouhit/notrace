import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Expiry } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function expiryToSeconds(expiry: Expiry): number | null {
  switch (expiry) {
    case "5min": return 5 * 60;
    case "1hr": return 60 * 60;
    case "24hr": return 24 * 60 * 60;
    case "never": return null;
  }
}

export function expiryLabel(expiry: Expiry): string {
  switch (expiry) {
    case "5min": return "5 minutes";
    case "1hr": return "1 hour";
    case "24hr": return "24 hours";
    case "never": return "No expiry";
  }
}

export function formatCountdown(seconds: number): string {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }
  return `${seconds}s`;
}
