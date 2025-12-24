
import React, { useEffect, useRef } from 'react';
import { AppStatus, HandData } from '../types';

interface HandTrackerProps {
  onUpdate: (data: HandData) => void;
  onStatusChange: (status: AppStatus) => void;
  isActive: boolean;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onUpdate, onStatusChange, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const handsRef = useRef<any>(null);

  useEffect(() => {
    if (!isActive) return;

    let isMounted = true;

    async function setup() {
      onStatusChange(AppStatus.LOADING);
      try {
        // Load MediaPipe scripts dynamically to avoid initial bundle bloat
        const script1 = document.createElement('script');
        script1.src = "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";
        const script2 = document.createElement('script');
        script2.src = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";
        
        document.head.appendChild(script1);
        document.head.appendChild(script2);

        await new Promise((resolve) => {
          const check = () => {
            if ((window as any).Hands && (window as any).Camera) resolve(null);
            else setTimeout(check, 100);
          };
          check();
        });

        if (!isMounted) return;

        const hands = new (window as any).Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        hands.onResults((results: any) => {
          if (!isMounted) return;

          if (results.multiHandLandmarks && results.multiHandLandmarks.length >= 1) {
            let distance = 0;
            
            if (results.multiHandLandmarks.length >= 2) {
              // Measure distance between center of two hands
              const h1 = results.multiHandLandmarks[0][0]; // Wrist
              const h2 = results.multiHandLandmarks[1][0]; // Wrist
              const dx = h1.x - h2.x;
              const dy = h1.y - h2.y;
              distance = Math.sqrt(dx*dx + dy*dy);
            } else {
              // If only one hand, measure distance between thumb (4) and index (8) tips
              const thumb = results.multiHandLandmarks[0][4];
              const index = results.multiHandLandmarks[0][8];
              const dx = thumb.x - index.x;
              const dy = thumb.y - index.y;
              distance = Math.sqrt(dx*dx + dy*dy) * 1.5; // Scale it up
            }

            onUpdate({
              distance,
              isDetected: true,
              rawDistance: distance
            });
          } else {
            onUpdate({ distance: 0, isDetected: false, rawDistance: 0 });
          }
        });

        const camera = new (window as any).Camera(videoRef.current, {
          onFrame: async () => {
            await hands.send({ image: videoRef.current! });
          },
          width: 640,
          height: 480
        });

        camera.start();
        onStatusChange(AppStatus.ACTIVE);
        handsRef.current = hands;

      } catch (error) {
        console.error("Hand tracking setup failed", error);
        onStatusChange(AppStatus.ERROR);
      }
    }

    setup();

    return () => {
      isMounted = false;
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, [isActive, onUpdate, onStatusChange]);

  return (
    <video 
      ref={videoRef} 
      className="hidden" 
      playsInline 
      muted 
    />
  );
};

export default HandTracker;
