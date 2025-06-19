"use client"
import Image from "next/image";
import { Canvas, useFrame } from "@react-three/fiber";
// 匯入 drei 套件的多個輔助元件與 hooks： 
// RoundedBox：圓角立方體
// CameraControls：相機控制
// Environment：環境貼圖
// useGLTF：載入 glTF 3D 模型
// ContactShadows：接觸陰影
// PerspectiveCamer：應為 PerspectiveCamera，此處拼錯
// axesHelper：座標軸輔助線
// KeyboardControls、useKeyboardControls：鍵盤控制
// Box：立方體
import { RoundedBox, CameraControls, Environment, useGLTF, ContactShadows,
  PerspectiveCamera, axesHelper, KeyboardControls, useKeyboardControls, Box} from "@react-three/drei";
//  Suspense 異步載入與狀態管理
import { Suspense, useEffect, useState, useRef } from "react";
import ClawCamera from "@/component/ClawCamera";



function ClawModel({clawPos, isClawDown}){
  const clawModel = useGLTF("/claw.glb");
  const clawRef = useRef();

  //動態調整模型內各部件的位置
  useFrame(()=>{
    if(clawRef.current){
      clawRef.current.traverse((child)=>{
        
        if(child.name == "claw"){
          child.position.set(clawPos.x, clawPos.y + 2.85, clawPos.z);
        }

        if(child.name == "clawBase"){
          child.position.set(clawPos.x, 2.85, clawPos.z);
        }

        if(child.name == "track"){
          child.position.set(0, 2.85, clawPos.z);
        }

      });
    }
  });

  // 渲染 three.js 的 3D 物件
  return (<>
    <primitive
      object={clawModel.scene}
      scale={[0.6, 0.6, 0.6]}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  </>)
  
}



export default function Home() {
  //隱藏之前的 demo RoundedBox
  const isHidden = true;
  // 控制爪子的位置跟狀態
  const [clawPos, setClawPos] = useState({x: 0, y: 0, z: 0});
  const [isClawDown, setIsClawDown] = useState(false);


  return (
    <div className="w-full h-screen">
      <KeyboardControls
        map={[
          { name: "forward", keys: ["ArrowUp", "w", "W"] },
          { name: "backward", keys: ["ArrowDown", "s", "S"] },
          { name: "left", keys: ["ArrowLeft", "a", "A"] },
          { name: "right", keys: ["ArrowRight", "d", "D"] },
          { name: "jump", keys: ["Space"] },
        ]}
      >

      <Canvas>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

      {/* 如果 isHidden 為 false，顯示一個圓角立方體（目前隱藏） */}  
      {
       !isHidden && <RoundedBox
          args={[1, 1, 1]} // Width, height, depth. Default is [1, 1, 1]
          radius={0.05} // Radius of the rounded corners. Default is 0.05
          smoothness={4} // The number of curve segments. Default is 4
          bevelSegments={4} // The number of bevel segments. Default is 4, setting it to 0 removes the bevel, as a result the texture is applied to the whole geometry.
          creaseAngle={0.4} // Smooth normals everywhere except faces that meet at an angle greater than the crease angle
        >
          <meshPhongMaterial color="#333333"/>
        </RoundedBox>
      }

        <Suspense fallback={null}>
          {/* 直接渲染一個 three.js 物件 */}
          {/* <primitive
            object={clawModel.scene}
            scale={[0.6, 0.6, 0.6]}
            position={[0, -2, 0]}
            rotation={[0, 0, 0]}
          /> */}
          {/* 自訂元件 */}
          <ClawModel clawPos={clawPos} isClawDown={isClawDown} />
        </Suspense>
        
        {/* 加入城市環境貼圖，真實感背景 */}
        <Environment
          background={true} // can be true, false or "only" (which only sets the background) (default: false)
          backgroundBlurriness={0.5} // optional blur factor between 0 and 1 (default: 0, only works with three 0.146 and up)
          backgroundIntensity={1} // optional intensity factor (default: 1, only works with three 0.163 and up)
          environmentIntensity={1} // optional intensity factor (default: 1, only works with three 0.163 and up)
          preset={'city'}
        />
        {/* 物件與地面接觸處有陰影效果 */}
        <ContactShadows opacity={1} scale={10} blur={10} far={10} resolution={256} color="#DDDDDD" />
        {/* 攝影機根據爪子狀態調整視角 */}
        <ClawCamera clawPos={clawPos} setClawPos={setClawPos} isClawDown={isClawDown} setIsClawDown={setIsClawDown} />
        <CameraControls />
        <axesHelper args={[10]} />

     </Canvas>
    </KeyboardControls>
  </div>
  );
}
