
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import Scene from './components/Scene';
import UI from './components/UI';
import HandTracker from './components/HandTracker';
import { AppStatus, HandData } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [handData, setHandData] = useState<HandData>({ distance: 0, isDetected: false, rawDistance: 0 });
  const [expansion, setExpansion] = useState(0); // 0 (Tree) to 1 (Sphere)
  
  // Smoothly interpolate expansion based on hand data
  useEffect(() => {
    if (handData.isDetected) {
      // Map hand distance (approx 50 to 400px in screen space) to 0-1
      const target = Math.min(Math.max((handData.distance - 0.1) / 0.5, 0), 1);
      
      // Gentle smoothing
      const interval = setInterval(() => {
        setExpansion(prev => prev + (target - prev) * 0.1);
      }, 16);
      return () => clearInterval(interval);
    } else {
      // Return to tree state if hands are lost
      const interval = setInterval(() => {
        setExpansion(prev => prev * 0.95);
      }, 16);
      return () => clearInterval(interval);
    }
  }, [handData]);

  const handleHandUpdate = useCallback((data: HandData) => {
    setHandData(data);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 5, 20], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={['#09090b']} />
          <Scene expansion={expansion} />
          <EffectComposer>
            <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Hand Tracking Logic (Hidden Video) */}
      <HandTracker 
        onUpdate={handleHandUpdate} 
        onStatusChange={setStatus} 
        isActive={status === AppStatus.ACTIVE}
      />

      {/* Overlay UI */}
      <UI 
        status={status} 
        setStatus={setStatus} 
        expansion={expansion} 
        handDetected={handData.isDetected}
      />
      
      {/* Subtle Grid / Texture for modern feel */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
    </div>
  );
};

export default App;
