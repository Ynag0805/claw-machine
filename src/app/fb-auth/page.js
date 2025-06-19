'use client';
export const dynamic = 'force-dynamic';
// google 登入
// 別忘記到 auth 頁面新增服務提供商

"use client"
import { useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";

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

function getFirebase() {
  if (typeof window === 'undefined') return null;
  if (!getApps().length) initializeApp(firebaseConfig, "fb-auth");
  return {
    auth: getAuth(),
    provider: new GoogleAuthProvider(),
  };
}

export default function FBAuth() {
  const [user, setUser] = useState(null);
  const fb = getFirebase();
  if (!fb) return null;
  const { auth, provider } = fb;
  auth.useDeviceLanguage();

  const signIn = () => {
    signInWithPopup(auth, provider).then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      setUser(user);
    }).catch((error) => {
      console.log(error);
    });
  };

  return (
    <div className="w-full h-screen">
      <h1>FB Auth</h1>
      <h3>User: {user?.displayName}</h3>
      <button onClick={signIn}>Sign In</button>
    </div>
  );
}
