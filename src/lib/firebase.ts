"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/** Singleton Firebase app instance */
let app: FirebaseApp;

/** Singleton Analytics instance (browser-only) */
let analytics: Analytics | null = null;

/** Singleton Firestore instance */
let db: Firestore;

/**
 * Returns the singleton Firebase app, initializing it on first call.
 * Safe to call during SSR — analytics is only initialized in the browser.
 */
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

/**
 * Returns the Firebase Analytics instance.
 * Returns null during SSR since analytics requires the browser.
 */
export function getFirebaseAnalytics(): Analytics | null {
  if (typeof window === "undefined") return null;
  if (!analytics) {
    analytics = getAnalytics(getFirebaseApp());
  }
  return analytics;
}

/**
 * Returns the singleton Firestore instance.
 */
export function getFirebaseFirestore(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}
