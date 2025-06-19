// 測試用
// 技巧：存在全域，之後不用每次載入

// 之後可串連 +1 -1 分



"use client"

import { getFirebaseApp } from "../../firebaseClient";
//Firebase - RealtimeDatabase
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import { useEffect } from "react";
//getDatabase 初始化  set 設定 push推資料
// useEffect 偵測網頁變動

//Firebase - Auth
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";

export default function HomeFB0617() {
  
  // Firebase 配置設定
  const firebaseConfig = {
    apiKey: "AIzaSyA0DD57-8TtueLBwyzttYsvJnxAJZDoGXM",
    authDomain: "web-f1925.firebaseapp.com",
    projectId: "web-f1925",
    storageBucket: "web-f1925.firebasestorage.app",
    messagingSenderId: "600796513613",
    appId: "1:600796513613:web:e8f15a226c73325b9ce304",
    measurementId: "G-W4YNQ0LK2Q",
    databaseURL:"https://web-f1925-default-rtdb.firebaseio.com/"
  };
  
  // 初始化 Firebase 應用
  const app = getFirebaseApp();
  // 初始化 Realtime Database
  const database = getDatabase(app);
  // 設定資料庫根目錄參考
  const dbRef = ref(database,"/");

  // 初始化 Firebase Auth
  const auth = getAuth();
  // 設定 Google 登入提供者 初始化 Google Auth
  const provider = new GoogleAuthProvider();

  // 畫面載入完成後，執行以下內容
  useEffect(() => {
    // 監聽資料庫變化
    onValue(dbRef, (snapshot) => {
      console.log(snapshot.val());
    });

    // 設定特定用戶資料
    const userRef = ref(database, "/accounts/000001/");
    set(userRef, {
      name: "yang",
      points: 200
    });
  }, []);

  // 新增帳號功能
  const addNewAccount = () => {
    console.log("click");
    const accountsRef = ref(database, "/accounts");

    push(accountsRef, {
      name: "yang",
      type: "user",
      point: "10",
    });
  };

  // Google 登入功能
  const login = () => {
    signInWithPopup(auth, provider).then((result) => {
      console.log(result); //UserCredentialImpl  其中 key 是 uid 避免用戶改名後系統認不出
      console.log(result.user.uid); // 其中 key 是 uid 避免用戶改名後系統認不出
      console.log(result.user.displayName);

      const uid = result.user.uid;
      const name = result.user.displayName;
      
      const accountsRef = ref(database, "/accounts" + uid );
      console.log(accountsRef);

      //增加判斷式，判斷有無帳號
      if (!accountsRef){
        //沒有此帳號，建立一個
        console.log("enter");
        
      }else{
        //有此帳號，載入資訊
        push(accountsRef, {
          name: "Wang",
          type: "User",
          point: "10",
          uid: uid
        })

      }

    });
  };

  return (
    <>
      fb0617
      <div onClick={addNewAccount} className="text-black border-black border-2 px-4 py-1">Add new Account</div>
      <div onClick={login} className="text-black border-black border-2 px-4 py-1">Login with Google</div>
    </>
  );
}
