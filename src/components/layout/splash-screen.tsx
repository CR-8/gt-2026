import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SplashScreenProps {
  onClose?: () => void;
}

export default function SplashScreen({ onClose }: SplashScreenProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/events');
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="relative w-full h-full max-h-screen flex flex-col items-center justify-center p-8">
        {/* Lanyard Component */}
        <div className="w-full h-96 mb-8">
        </div>

        {/* Thank You Message */}
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Thank You for Participating!
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-gray-300">
            Your registration has been successfully submitted.
          </p>
          <p className="text-lg md:text-xl text-gray-400 mb-8">
            Your email would have been sent to you. Kindly follow the instructions mentioned.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Redirecting to events page in 5 seconds...
          </p>

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="px-8 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 hover:cursor-pointer transition-all duration-300 transform hover:scale-105"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}