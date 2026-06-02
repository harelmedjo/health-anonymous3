import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  // Auto-advance loading animation after simulating connection establishment
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 300);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-between min-h-screen py-12 px-6 bg-gradient-to-b from-[#FDFDFF] to-[#F1F4FF] overflow-hidden select-none font-sans relative">
      
      {/* Visual background ambient gradient circles */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-[#00685F]/5 rounded-full blur-[80px] -z-10" />
      <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[100px] -z-10" />

      {/* Spacer to align center content */}
      <div className="h-4" />

      {/* Main Core branding block */}
      <div className="flex flex-col items-center text-center max-w-sm w-full">
        {/* Centered medical briefcase logo container with shadow */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="w-32 h-32 rounded-[2rem] bg-white shadow-[0_24px_48px_-12px_rgba(0,104,95,0.12)] border border-[#00685F]/5 flex items-center justify-center relative mb-8"
        >
          {/* Pulsing glow banner ring background */}
          <div className="absolute inset-0 rounded-[2rem] bg-[#00685F]/10 animate-ping opacity-60 scale-95" />
          
          <span className="material-symbols-outlined !text-[56px] text-primary relative z-10">
            medical_services
          </span>
        </motion.div>

        {/* Application title */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-3xl font-bold tracking-tight text-[#00685f] font-headline"
        >
          Health Anonymous
        </motion.h1>

        {/* Application slogan */}
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-gray-500 font-medium text-sm mt-3"
        >
          Anonymous Health Support for Everyone
        </motion.p>

        {/* Connection progress container */}
        <div className="w-full max-w-[200px] mt-16 space-y-3">
          {/* Progress bar scale */}
          <div className="h-[2px] w-full bg-slate-200/60 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>

          {/* Securely connecting indicator label */}
          <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400 text-center select-none flex items-center justify-center gap-1.5 pt-1 animate-pulse">
            <span>Securely Connecting</span>
            <span className="inline-flex gap-0.5">
              <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" />
              <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </span>
          </div>
        </div>
      </div>

      {/* Secure Cryptographic Badge Bottom anchor */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="flex items-center gap-1.5 text-xs text-[#00685f]/80 font-semibold bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-[#00685f]/5 shadow-sm">
          <span className="material-symbols-outlined text-[18px] text-primary">
            shield
          </span>
          <span className="tracking-wide">End-to-End Encrypted Anonymity</span>
        </div>
      </motion.div>

    </div>
  );
}
