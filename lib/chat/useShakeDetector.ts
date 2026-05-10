"use client";
import { useEffect, useRef } from "react";

interface ShakeOptions {
  threshold?: number;
  timeout?: number;
  onShake: () => void;
}

/**
 * Detects device shake using DeviceMotionEvent.
 * On iOS 13+ requires permission.
 */
export function useShakeDetector({ threshold = 25, timeout = 1500, onShake }: ShakeOptions) {
  const lastTime = useRef(0);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const lastZ = useRef(0);
  const cooldown = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.DeviceMotionEvent) return;

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;

      const { x = 0, y = 0, z = 0 } = acc;
      const now = Date.now();
      if (now - lastTime.current < 100) return;
      lastTime.current = now;

      const deltaX = Math.abs((x ?? 0) - lastX.current);
      const deltaY = Math.abs((y ?? 0) - lastY.current);
      const deltaZ = Math.abs((z ?? 0) - lastZ.current);

      lastX.current = x ?? 0;
      lastY.current = y ?? 0;
      lastZ.current = z ?? 0;

      const totalDelta = deltaX + deltaY + deltaZ;

      if (totalDelta > threshold && !cooldown.current) {
        cooldown.current = true;
        onShake();
        setTimeout(() => { cooldown.current = false; }, timeout);
      }
    };

    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === "function") {
        try {
          const perm = await (DeviceMotionEvent as any).requestPermission();
          if (perm === "granted") {
            window.addEventListener("devicemotion", handleMotion);
          }
        } catch {
          // Permission denied silently
        }
      } else {
        window.addEventListener("devicemotion", handleMotion);
      }
    };

    requestPermission();
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [threshold, timeout, onShake]);
}
