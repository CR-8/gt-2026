'use client';

import React from 'react';
import { GridScan } from '@/components/gridscan/GridScan';

export default function Hero() {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* GridScan Background */}
      <div className="absolute inset-0">
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

      {/* Content Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="px-4 sm:px-6 md:px-8 text-center pointer-events-auto">
          {/* Title + X */}
          <div className="relative flex items-center justify-center">
            <h1 className="text-[18vw] sm:text-[16vw] md:text-[15vw] lg:text-[16vw] xl:text-[18vw] font-bold text-white tracking-tighter leading-none font-barbra-high">
              GANTAVYA
            </h1>
          </div>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-5 md:mt-6 text-xs sm:text-sm md:text-base lg:text-lg font-bricolage tracking-[0.25em] sm:tracking-[0.35em] uppercase text-white/70">
            DECATRON · Celebrating 10 Years
          </p>

          {/* CTA */}
          <div className="mt-6 sm:mt-8 md:mt-10 flex justify-center">
            <button className="px-6 sm:px-8 py-2.5 sm:py-3 border border-white/40 text-white tracking-widest text-xs sm:text-sm
                               hover:border-orange-400 hover:text-orange-300 transition">
              ENTER THE GRID
            </button>
          </div>
        </div>
      </div>

      {/* Contrast Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/70 pointer-events-none z-[1]" />
    </section>
  );
}
