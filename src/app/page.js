// 3D 夾娃娃機互動遊戲 with Google Auth & Leaderboard

"use client"
import Image from "next/image";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, CameraControls, Environment, useGLTF, ContactShadows, PerspectiveCamera, 
  axesHelper, KeyboardControls, useKeyboardControls, Box} from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import gsap from 'gsap';
import Swal from 'sweetalert2'
import { getFirebaseApp } from "../firebaseClient";
import { getDatabase, ref, onValue, push, get, set, update } from "firebase/database";
import { GoogleAuthProvider, signInWithPopup, getAuth, signOut } from "firebase/auth";



// Firebase config
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
const database = app ? getDatabase(app) : null;
const auth = app ? getAuth() : null;
const provider = app ? new GoogleAuthProvider() : null;

// LoginPage Component
function LoginPage({onLogin}) {
  const [error, setError] = useState(null);
  const handleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        onLogin(result.user);
      })
      .catch((err) => setError(err.message));
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl mb-4">夾娃娃機小遊戲</h1>
      <button onClick={handleLogin} className="bg-blue-500 text-white px-6 py-2 rounded">Google 登入</button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
}

function ClawModel({clawPos, isLowering, hasPrize}) {
  const clawModel = useGLTF(`claw.glb`);
  const clawModelRef = useRef();

  useFrame((state) => {
    if (clawModelRef.current) {
      //用 foreach 尋找 clawModelRef 中，名稱為 claw 物件，並且將其 rotation.y 增加 0.01
      clawModelRef.current.traverse((child) => {

        if (child.name === 'claw') {
          child.position.set(clawPos.x, clawPos.y, clawPos.z);
        }

        if(isLowering) return;

        if (child.name === 'clawBase') {
          child.position.set(clawPos.x, clawPos.y+0.15, clawPos.z);
        }

        if (child.name === 'track') {
          child.position.set(0.011943, clawPos.y+0.15, clawPos.z);
        }

        if (child.name === 'bear') {
          child.visible = hasPrize;
        }
      });
    }
  })
  
  return (
    <primitive
      ref={clawModelRef}
      object={clawModel.scene}
      scale={[0.6, 0.6, 0.6]}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  );
}


function Camera({setClawPos, boxRef, clawPos, isLowering, setIsLowering, hasPrize, setHasPrize, onGameResult}) {
  const cameraRef = useRef();
  
  //  [注意] useFrame and useKeyboardControls 都需要放在 Canvas 的子组件中
  
  useFrame(() => {
    if (cameraRef.current) {
      cameraRef.current.lookAt(0, 1, 0);
    }
  });

  const [, getKeys] = useKeyboardControls();


  useFrame((state) => {
    const { forward, backward, left, right, jump } = getKeys();
    const speed = 0.01;
    const limitX = 0.4;
    const limitZ = 0.4;
    
    if (boxRef.current) {
      if(!isLowering){
        if (forward) {
          setClawPos({x: clawPos.x, y: clawPos.y, z: clawPos.z - speed});
        }
        if (backward) {
          setClawPos({x: clawPos.x, y: clawPos.y, z: clawPos.z + speed});
        }
        if (left) {
          setClawPos({x: clawPos.x - speed, y: clawPos.y, z: clawPos.z});
        }
        if (right) {
          setClawPos({x: clawPos.x + speed, y: clawPos.y, z: clawPos.z});
        }
  
        if (clawPos.x > limitX) {
          setClawPos({x: limitX, y: clawPos.y, z: clawPos.z});
        }
        if (clawPos.x < -limitX) {
          setClawPos({x: -limitX, y: clawPos.y, z: clawPos.z});
        }
        if (clawPos.z > limitZ) {
          setClawPos({x: clawPos.x, y: clawPos.y, z: limitZ});
        }
        if (clawPos.z < -limitZ) {
          setClawPos({x: clawPos.x, y: clawPos.y, z: -limitZ});
        }

        if(jump){
          setHasPrize(false);
          console.log('jump');
          setIsLowering(true);
          
          //setClawPos with gsap
          console.log("down");

          //gsap convet to timeline
          // gsap.to(clawPos, { y: 2, duration: 2, onComplete: () => {
          
          // } });

          // 隨機判斷是否中獎
          const random = Math.random();
          const isWin = random < 0.5;

          
          // Has Prize ：用來記錄「這次有沒有夾到獎品」的狀態，影響獎品顯示與彈窗。
          // setHasPrize(isWin);
          // 預設讓獎品消失，等有夾到再出現獎品
          setHasPrize(false);
                    
          //gsap convet to timeline
           gsap.timeline().to(clawPos, { y: 2, duration: 2})
            .to(clawPos, { y: 2.7, duration: 3})
            .then(() => {

              setIsLowering(false);
              // 動畫結束時才設定有沒有夾到獎品
              setHasPrize(isWin); 
              if(isWin){
                console.log("中獎");
                Swal.fire({
                  title: '中獎了',
                  text: '恭喜你中獎了',
                  icon: 'success',
                  confirmButtonText: '確定',
                  timer: 2000
                });
                // 5秒後自動變沒東西
                setTimeout(() => setHasPrize(false), 5000);
              }else{
                console.log("沒中獎");
                Swal.fire({
                  title: '沒中獎',
                  text: '再接再厲',
                  icon: 'error',
                  confirmButtonText: '確定',
                  timer: 2000
                });
              }
              onGameResult(isWin);
            });

        }
        
      }
      
    }
  })

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 1, 3]} // 3 ~ 6
    />
  );
}

// AvatarMenu component
function AvatarMenu({ photoURL, playerName, onLogout, onShowBoard, onRename }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  return (
    <div className="absolute top-4 left-4 z-50 flex flex-col items-start" ref={menuRef}>
      <div className="flex items-center">
        <img
          src={photoURL}
          alt="avatar"
          className="w-12 h-12 rounded-full border-2 border-white shadow cursor-pointer"
          onClick={() => setOpen(o => !o)}
        />
        <span
          onClick={() => setOpen(o => !o)}
          className="ml-2 cursor-pointer font-medium text-white drop-shadow"
        >
          {playerName}
        </span>
      </div>
      {open && (
        <div className="mt-2 w-36 bg-white/90 rounded-lg shadow p-2 text-sm space-y-1">
          <button className="w-full text-left hover:text-green-600" onClick={() => { onRename(); setOpen(false); }}>修改暱稱</button>
          <button className="w-full text-left hover:text-blue-600" onClick={onShowBoard}>排行榜</button>
          <button className="w-full text-left hover:text-red-600" onClick={onLogout}>登出</button>
        </div>
      )}
    </div>
  );
}

// RenameDialog component
function RenameDialog({ current, onSave, onClose }) {
  const [value, setValue] = useState(current);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-72 space-y-4">
        <h3 className="text-lg font-semibold">修改暱稱</h3>
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          className="w-full border rounded px-2 py-1"
          maxLength={12}
        />
        <div className="text-right space-x-2">
          <button onClick={onClose}>取消</button>
          <button
            className="text-blue-600"
            onClick={() => onSave(value.trim() || current)}
          >
            儲存
          </button>
        </div>
      </div>
    </div>
  );
}

// GamePage Component
function GamePage({user, onLogout, onShowLeaderboard}) {
  const boxRef = useRef();
  const isHidden = true;
  const [clawPos, setClawPos] = useState({x: -0.4, y: 2.7, z: 0.2});
  const [isLowering, setIsLowering] = useState(false);
  const [hasPrize, setHasPrize] = useState(false);
  const [score, setScore] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [playerName, setPlayerName] = useState(user.displayName);
  const [showRename, setShowRename] = useState(false);

  // 取得暱稱（優先用 Firebase，否則用 Google 名）
  useEffect(() => {
    const userRef = ref(database, `/users/${user.uid}/name`);
    get(userRef).then(snap => {
      if (snap.exists()) setPlayerName(snap.val());
    });
  }, [user.uid]);

  // 遊戲結束時寫入紀錄
  const handleGameResult = (isWin) => {
    setScore(s => s + (isWin ? 1 : 0));
    update(ref(database, `/users/${user.uid}`), {
      name: playerName,
      photo: user.photoURL,
    });
    push(ref(database, `/users/${user.uid}/records`), {
      score: isWin ? 1 : 0,
      time: Date.now(),
    });
  };

  // 修改暱稱並寫回 Firebase
  const saveName = (newName) => {
    setPlayerName(newName);
    update(ref(database, `/users/${user.uid}`), {
      name: newName,
      photo: user.photoURL,
    });
    setShowRename(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 左上角頭像與暱稱，下拉選單 */}
      <AvatarMenu
        photoURL={user.photoURL}
        playerName={playerName}
        onLogout={onLogout}
        onShowBoard={() => setShowLeaderboard(true)}
        onRename={() => setShowRename(true)}
      />
      {showRename && (
        <RenameDialog
          current={playerName}
          onSave={saveName}
          onClose={() => setShowRename(false)}
        />
      )}
      {/* 右側懸浮排行榜卡片 */}
      {showLeaderboard && (
        <LeaderboardCard onClose={() => setShowLeaderboard(false)} />
      )}
      {/* Canvas 撐滿中間剩餘高度 */}
      <div className="absolute inset-0">
        <KeyboardControls
          map={[
            { name: "forward", keys: ["ArrowUp", "w", "W"] },
            { name: "backward", keys: ["ArrowDown", "s", "S"] },
            { name: "left", keys: ["ArrowLeft", "a", "A"] },
            { name: "right", keys: ["ArrowRight", "d", "D"] },
            { name: "jump", keys: ["Space"] },
          ]}
        >
          <Canvas className="w-full h-full">
            <ambientLight intensity={Math.PI / 2} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
            <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
            {
              !isHidden && <RoundedBox
                args={[1, 1, 1]}
                radius={0.05}
                smoothness={4}
                bevelSegments={4}
                creaseAngle={0.4}
              >
                <meshPhongMaterial color="#f3f3f3"/>
              </RoundedBox>
            }
            <Box ref={boxRef} args={[0.1, 0.1, 0.1]} position={[0, 0, 0]}>
              <meshPhongMaterial color="#f3f3f3"/>
            </Box>
            <Suspense fallback={null}>
              <ClawModel clawPos={clawPos} isLowering={isLowering} hasPrize={hasPrize} />
            </Suspense>
            <Environment
              background={true}
              backgroundBlurriness={0.5}
              backgroundIntensity={1}
              environmentIntensity={1}
              preset={'city'}
            /> 
            <ContactShadows opacity={1} scale={10} blur={10} far={10} resolution={256} color="#DDDDDD" />
            <Camera boxRef={boxRef} clawPos={clawPos} setClawPos={setClawPos} isLowering={isLowering} setIsLowering={setIsLowering}
              hasPrize={hasPrize} setHasPrize={setHasPrize} onGameResult={handleGameResult}
            />
            <CameraControls enablePan={false} enableZoom={false} />
            <axesHelper args={[10]} />
          </Canvas>
        </KeyboardControls>
      </div>
      {/* Footer 分數固定右下角浮動 */}
      <div className="absolute bottom-4 right-4 bg-white/70 px-3 py-1 rounded shadow z-20">
        目前分數：{score}
      </div>
    </div>
  );
}

// LeaderboardCard 只要顯示 name
function LeaderboardCard({onClose}) {
  const [records, setRecords] = useState([]);
  useEffect(() => {
    const usersRef = ref(database, "/users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {};
      // 將每個玩家的所有紀錄加總為總分
      const allUsers = Object.entries(data).map(([uid, user]) => {
        let totalScore = 0;
        if (user.records) {
          totalScore = Object.values(user.records).reduce((sum, r) => sum + (r.score || 0), 0);
        }
        return {
          uid,
          name: user.name || "匿名",
          score: totalScore
        };
      });
      // 依照總分排序
      allUsers.sort((a, b) => b.score - a.score);
      setRecords(allUsers);
    });
  }, []);
  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-30 flex flex-col transition-transform duration-300 animate-slide-in">
      <div className="flex justify-between items-center p-4 border-b">
        <span className="text-xl font-bold">排行榜</span>
        <button onClick={onClose} className="text-2xl leading-none">×</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <table className="w-full text-left">
          <thead><tr><th>玩家</th><th>分數</th></tr></thead>
          <tbody>
            {records.slice(0, 10).map((r, i) => (
              <tr key={i}><td>{r.name}</td><td>{r.score}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login'); // login, game

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) {
        setUser(u);
        setPage('game');
      } else {
        setUser(null);
        setPage('login');
      }
    });
    return () => unsubscribe();
  }, []);

  if (page === 'login') return <LoginPage onLogin={u => { setUser(u); setPage('game'); }} />;
  if (page === 'game' && user) return <GamePage user={user} onLogout={() => setPage('login')} onShowLeaderboard={() => {}} />;
  return null;
}
