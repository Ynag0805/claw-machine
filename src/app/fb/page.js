// Realtime Database 監聽、即時更新的資料庫

"use client"

import { getFirebaseApp } from "../../firebaseClient";
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import { useState, useEffect } from "react";

export default function FB() {

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

  const app = getFirebaseApp();
  const database = getDatabase(app);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ref 是指向你要上傳到的路徑，也可以想像成資料夾
    const dbRef = ref(database, "/");
  
    onValue(dbRef, (snapshot) => {
      // 偵測資料變動，會隨時取得最新資料
      const data = snapshot.val();
      setData(data);
      setLoading(false);
    }, (error) => {
      setError(error);
      setLoading(false);
    });


  }, []);

  const uploadData = () => {
    // 將資料 push 到對應的 list 內
    const dbRef = ref(database, "/");
    push(dbRef, {
      name: "John",
      age: 30,
      time: Date.now()
    });

  }

  return (
    <div className="w-full h-screen">
      <h1>FB</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={() => {
        uploadData();
      }}>Set Data</button>
    </div>
  );
}
