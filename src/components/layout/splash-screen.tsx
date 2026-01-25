"use client";

import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";
import { GridScan } from "../gridscan/GridScan";

interface SplashScreenProps {
  onClose?: () => void;
  autoRedirectMs?: number;
  ctaLabel?: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export default function SplashScreen({
  onClose,
  autoRedirectMs = 60000, // Default: 60 seconds
  ctaLabel = "Continue",
  secondaryAction,
}: SplashScreenProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(Math.ceil(autoRedirectMs / 1000));
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setVisible(true);
    setShowConfetti(true);
  }, []);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 60000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      if (onClose) onClose();
      router.push("/events"); // Auto-redirect to /events
    }, autoRedirectMs);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [autoRedirectMs, onClose, router]);

  const handleRedirectNow = () => {
    if (onClose) onClose();
    router.push("/events");
  };

  return (
    <div className="fixed inset-0 z-80">
      {showConfetti && (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 1920}
          height={typeof window !== 'undefined' ? window.innerHeight : 1080}
          recycle={true}
          numberOfPieces={200}
        />
      )}
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden bg-black">
        <GridScan
          sensitivity={0.55}
          lineThickness={0.8}
          linesColor="#3e658e"
          gridScale={0.1}
          scanColor="#ff9e9e"
          scanOpacity={0.4}
          enablePost
          bloomIntensity={0.6}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
        />
      </div>

      {/* Overlay */}
      <div className="relative z-40 flex items-center justify-center w-full h-full p-6 text-white">
        <div
          role="status"
          className={`max-w-4xl w-full text-center transition-all duration-700 ease-out
            ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1 mb-6 text-sm font-medium rounded-full bg-green-500/20 text-green-300 border border-green-400/30">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Registration Confirmed
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            You&apos;re All Set 🎉
          </h1>

          {/* Description */}
          <p className="text-lg md:text-2xl text-gray-300 mb-4">
            Your registration has been successfully submitted.
          </p>

          <p className="text-base md:text-lg text-gray-400 mb-10">
            A confirmation email has been sent with further instructions.
            Please check your inbox (and spam folder, just in case).
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {onClose && (
              <button
                onClick={onClose}
                className="px-10 py-3 bg-orange-600 text-white font-semibold rounded-lg
                hover:bg-orange-700 transition-all duration-300 transform hover:scale-105
                focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
              >
                {ctaLabel}
                {countdown > 0 && (
                  <span className="ml-2 text-sm opacity-80">
                    ({countdown})
                  </span>
                )}
              </button>
            )}

            {/* New: Redirect Now Button */}
            <button
              onClick={handleRedirectNow}
              className="px-6 sm:px-8 py-2.5 sm:py-3 border border-white/40 text-white tracking-widest text-xs sm:text-sm
                               hover:border-orange-400 hover:text-orange-300 transition cursor-pointer"
            >
              Go to Events Now
            </button>

            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="px-8 py-3 text-sm text-gray-300 hover:text-white underline underline-offset-4"
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
