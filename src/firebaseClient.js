import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyA0DD57-8TtueLBwyzttYsvJnxAJZDoGXM",
  authDomain: "web-f1925.firebaseapp.com",
  databaseURL: "https://web-f1925-default-rtdb.firebaseio.com",
  projectId: "web-f1925",
  storageBucket: "web-f1925.firebasestorage.app",
  messagingSenderId: "600796513613",
  appId: "1:600796513613:web:e8f15a226c73325b9ce304",
  measurementId: "G-W4YNQ0LK2Q"
};

export function getFirebaseApp() {
  if (typeof window === "undefined") return null; // Only run in browser
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApps()[0];
} 