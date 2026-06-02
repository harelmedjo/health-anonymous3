import React, { useState } from "react";
import { motion } from "motion/react";
import { Language } from "../types";

interface LanguageSelectionProps {
  onSelect: (lang: Language) => void;
}

export default function LanguageSelection({ onSelect }: LanguageSelectionProps) {
  const [selected, setSelected] = useState<Language | null>(null);

  const handleSelect = (lang: Language) => {
    setSelected(lang);
  };

  return (
    <div className="flex-grow flex flex-col justify-between pt-16 pb-8 px-4 max-w-4xl mx-auto w-full min-h-screen">
      {/* Header section identical to mockup */}
      <header className="fixed top-0 left-0 w-full z-10 flex justify-between items-center px-4 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-1.5 cursor-pointer active:scale-95 duration-200">
          <span className="material-symbols-outlined text-primary text-[28px]">medical_services</span>
          <h1 className="font-bold text-lg text-primary tracking-tight">Health Anonymous</h1>
        </div>
        <button className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-primary transition-colors">
          EN/FR
        </button>
      </header>

      {/* Main welcome language grid */}
      <main className="flex-grow flex flex-col items-center justify-center py-12">
        <motion.div 
          className="text-center mb-8 max-w-2xl"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-4 inline-flex p-3.5 rounded-full bg-slate-100 text-primary shadow-xs">
            <span className="material-symbols-outlined text-3xl">language</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-8 mb-2">
            Select Your Language <br/>
            <span className="text-gray-500 font-medium text-xl">Choisissez votre langue</span>
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
            To provide the best healthcare community experience, please select your preferred language for navigation and discussions.
          </p>
        </motion.div>

        {/* English & French Cards strictly matching the mockup look */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
          {/* English Card */}
          <button 
            onClick={() => handleSelect("en")}
            className={`group relative flex flex-col items-start p-6 rounded-2xl bg-white border text-left transition-all duration-300 active:scale-98 ${
              selected === "en" 
                ? "border-primary-container ring-2 ring-primary bg-emerald-50/10 shadow-md"
                : "border-gray-200/80 hover:border-gray-300/80 shadow-xs"
            }`}
          >
            <div className="flex justify-between w-full mb-6">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-xl">public</span>
              </div>
              <div className={`transition-opacity duration-300 ${selected === "en" ? "opacity-100" : "opacity-0"}`}>
                <span className="material-symbols-outlined text-primary text-2xl fill-1">check_circle</span>
              </div>
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-1 font-headline">English</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-sans">
              Global medical terminology and diverse international communities.
            </p>
            <div className="absolute bottom-3 right-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-5xl">forum</span>
            </div>
          </button>

          {/* French Card */}
          <button 
            onClick={() => handleSelect("fr")}
            className={`group relative flex flex-col items-start p-6 rounded-2xl bg-white border text-left transition-all duration-300 active:scale-98 ${
              selected === "fr" 
                ? "border-primary-container ring-2 ring-primary/80 bg-emerald-50/10 shadow-md"
                : "border-gray-200/80 hover:border-gray-300/80 shadow-xs"
            }`}
          >
            <div className="flex justify-between w-full mb-6">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-xl">translate</span>
              </div>
              <div className={`transition-opacity duration-300 ${selected === "fr" ? "opacity-100" : "opacity-0"}`}>
                <span className="material-symbols-outlined text-primary text-2xl fill-1">check_circle</span>
              </div>
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-1 font-headline">Français</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-sans">
              Terminologie médicale précise et communautés francophones engagées.
            </p>
            <div className="absolute bottom-3 right-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-5xl">health_and_safety</span>
            </div>
          </button>
        </div>

        {/* Continue trigger */}
        <div className="w-full max-w-xs flex flex-col items-center gap-3">
          <motion.button 
            whileHover={{ scale: selected ? 1.02 : 1 }}
            whileTap={{ scale: selected ? 0.98 : 1 }}
            onClick={() => selected && onSelect(selected)}
            disabled={!selected}
            className={`w-full h-12 font-bold rounded-full shadow-md flex items-center justify-center gap-2 transition-all duration-300 ${
              selected 
                ? "bg-primary text-white cursor-pointer hover:bg-primary-container"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <span>{selected === "fr" ? "Continuer" : "Continue"}</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </motion.button>
          <p className="text-xs text-gray-400 italic font-sans text-center">
            {selected === "fr" ? "Vous pouvez changer cela à tout moment dans les paramètres." : "You can change this anytime in your profile settings."}
          </p>
        </div>
      </main>

      {/* Medical Disclaimer Footer strictly matching the mockup footer */}
      <footer className="w-full py-6 mt-8 border-t border-gray-100 bg-slate-50 rounded-xl text-center">
        <div className="max-w-2xl mx-auto px-4">
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            {selected === "fr" 
              ? "Avertissement médical : Les informations fournies le sont uniquement à des fins éducatives et ne constituent pas un avis professionnel. Veuillez consulter un professionnel de la santé qualifié."
              : "Medical Disclaimer: Information provided is for educational purposes only and not professional advice. Please consult with a qualified healthcare provider for medical concerns."}
          </p>
          <div className="flex justify-center gap-5 text-[11px] font-semibold text-gray-500">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Anonymity Guide</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
