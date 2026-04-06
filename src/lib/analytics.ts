"use client";

import { useEffect, useRef } from "react";
import {
  doc,
  setDoc,
  getDoc,
  increment,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseFirestore } from "./firebase";

/** Firestore collection name for tool analytics */
const COLLECTION = "tool_usage";

/** Maximum number of events to store per tool (FIFO) */
const MAX_EVENTS = 500;

/**
 * Returns the current hour as a string key (0–23).
 */
function currentHourKey(): string {
  return new Date().getHours().toString();
}

/**
 * Returns today's date as a YYYY-MM-DD string.
 */
function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Trims the events array to MAX_EVENTS using FIFO (keeps most recent).
 * Called after appending a new event.
 */
async function trimEvents(slug: string): Promise<void> {
  const db = getFirebaseFirestore();
  const ref = doc(db, COLLECTION, slug);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const events = data.events as unknown[] | undefined;
  if (!events || events.length <= MAX_EVENTS) return;

  // Keep only the most recent MAX_EVENTS
  const trimmed = events.slice(events.length - MAX_EVENTS);
  await setDoc(ref, { events: trimmed }, { merge: true });
}

/**
 * Tracks a tool usage event to Firestore.
 * Increments totalUses, updates dailyUses and hourlyDist maps,
 * and appends an event entry. Fire-and-forget — never blocks UI.
 *
 * @param slug - The tool slug identifier.
 * @param toolName - Human-readable tool name.
 */
export function trackUsage(slug: string, toolName: string): void {
  try {
    const db = getFirebaseFirestore();
    const ref = doc(db, COLLECTION, slug);
    const day = todayKey();
    const hour = currentHourKey();
    const ua =
      typeof navigator !== "undefined"
        ? navigator.userAgent.slice(0, 120)
        : "unknown";

    setDoc(
      ref,
      {
        slug,
        name: toolName,
        totalUses: increment(1),
        lastUsedAt: Timestamp.now(),
        [`dailyUses.${day}`]: increment(1),
        [`hourlyDist.${hour}`]: increment(1),
        events: arrayUnion({
          action: "use",
          at: new Date().toISOString(),
          ua,
        }),
      },
      { merge: true }
    )
      .then(() => trimEvents(slug))
      .catch(() => {});
  } catch {
    // Analytics must never break tools
  }
}

/**
 * Tracks a file download event to Firestore.
 * Increments downloads counter and appends a download event entry.
 * Fire-and-forget — never blocks UI.
 *
 * @param slug - The tool slug identifier.
 */
export function trackDownload(slug: string): void {
  try {
    const db = getFirebaseFirestore();
    const ref = doc(db, COLLECTION, slug);
    const ua =
      typeof navigator !== "undefined"
        ? navigator.userAgent.slice(0, 120)
        : "unknown";

    setDoc(
      ref,
      {
        downloads: increment(1),
        lastUsedAt: Timestamp.now(),
        events: arrayUnion({
          action: "download",
          at: new Date().toISOString(),
          ua,
        }),
      },
      { merge: true }
    )
      .then(() => trimEvents(slug))
      .catch(() => {});
  } catch {
    // Analytics must never break tools
  }
}

/**
 * Hook that tracks a tool page visit on mount.
 * Deduplicates within the same component lifecycle.
 *
 * @param slug - The tool slug to track.
 * @param toolName - Human-readable tool name.
 */
export function useToolAnalytics(slug: string, toolName: string): void {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackUsage(slug, toolName);
  }, [slug, toolName]);
}
