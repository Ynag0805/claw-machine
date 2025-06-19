// google 登入
// 別忘記到 auth 頁面新增服務提供商

"use client"
import { useState, useEffect } from "react";
import { getFirebaseApp } from "../../firebaseClient";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
export const dynamic = 'force-dynamic';

export default function FBAuth() {
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const app = getFirebaseApp();
    if (app) {
      const authInstance = getAuth();
      authInstance.useDeviceLanguage();
      setAuth(authInstance);
      setProvider(new GoogleAuthProvider());
    }
  }, []);

  const signIn = () => {
    if (!auth || !provider) return;
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
      <button onClick={signIn} disabled={!auth || !provider}>Sign In</button>
    </div>
  );
}
