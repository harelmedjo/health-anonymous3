import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Language, Condition } from "../types";

interface ExploreConditionsProps {
  lang: Language;
  onSelectCondition: (conditionId: string) => void;
  onOpenChat: () => void;
  conditions: Condition[];
}

export default function ExploreConditions({ lang, onSelectCondition, onOpenChat, conditions }: ExploreConditionsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Hypertension treatments",
    "Celiac Disease diet",
    "Sleep Apnea symptoms"
  ]);

  const isFr = lang === "fr";

  const categories = useMemo(() => {
    return isFr 
      ? ["Toutes", "Chronic", "Infectious", "Mental Health", "Rare Diseases", "Autoimmune"]
      : ["All Categories", "Chronic", "Infectious", "Mental Health", "Rare Diseases", "Autoimmune"];
  }, [isFr]);

  const filteredConditions = useMemo(() => {
    return (conditions || []).filter((cond) => {
      const matchesSearch = 
        cond.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cond.nameFr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cond.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cond.descriptionFr.toLowerCase().includes(searchQuery.toLowerCase());

      const englishCategory = selectedCategory === "Toutes" || selectedCategory === "All Categories" 
        ? "All" 
        : selectedCategory;

      const matchesCategory = englishCategory === "All" || cond.category === englishCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, conditions]);

  const handleRecentClick = (term: string) => {
    setSearchQuery(term);
  };

  const clearRecent = () => {
    setRecentSearches([]);
  };

  return (
    <div className="pt-24 pb-32 px-4 max-w-7xl mx-auto w-full font-sans">
      {/* Hero Section */}
      <section className="mb-8">
        <motion.h2 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-gray-900 font-headline mb-4"
        >
          {isFr ? "Explorer les affections" : "Explore Conditions"}
        </motion.h2>
        
        {/* Search bar designed precisely with matching absolute icons & hover borders */}
        <div className="relative group">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-2xl transition-colors group-focus-within:text-primary">
            search
          </span>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isFr ? "Rechercher des maladies, symptômes ou médicaments..." : "Search diseases, symptoms, or medications..."}
            className="w-full pl-14 pr-12 py-4 bg-white border border-gray-150 rounded-2xl text-base shadow-[0px_4px_18px_rgba(15,23,42,0.02)] focus:outline-hidden focus:ring-2 focus:ring-teal-600/15 focus:border-primary transition-all font-sans"
            type="text"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>
      </section>

      {/* Category Chips scrolling menu styled to match the mockup perfectly */}
      <section className="mb-8 overflow-x-auto scrollbar-none -mx-4 px-4">
        <div className="flex gap-2 pb-1 min-w-max">
          {categories.map((cat) => {
            const isActive = cat === selectedCategory;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-200 active:scale-95 ${
                  isActive 
                    ? "bg-primary text-white shadow-md active:bg-primary-container"
                    : "bg-teal-50/40 text-gray-700 hover:bg-teal-50 border border-teal-100/10"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Top Results */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
            {isFr ? "Principaux résultats" : "Top Results"}
          </h3>

          <AnimatePresence mode="popLayout">
            {filteredConditions.length > 0 ? (
              filteredConditions.map((cond, index) => (
                <motion.article 
                  key={cond.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => onSelectCondition(cond.id)}
                  className="bg-white p-5 rounded-2xl shadow-[0px_8px_24px_rgba(15,23,42,0.015)] border border-gray-100 hover:border-primary/20 transition-all group cursor-pointer active:scale-99"
                >
                  <div className="flex gap-4 items-start sm:items-center">
                    <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform text-primary text-2xl">
                      <span className="material-symbols-outlined">{cond.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors truncate font-sans text-base">
                          {isFr ? cond.nameFr : cond.nameEn}
                        </h4>
                        <span className="px-2.5 py-0.5 bg-slate-100 text-gray-600 rounded-full text-[10px] font-bold">
                          {cond.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed mt-1 mb-3 line-clamp-2">
                        {isFr ? cond.descriptionFr : cond.descriptionEn}
                      </p>
                      
                      {/* Stats row with icons matching the look of mockup details */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-gray-400">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">group</span>
                          <span>{cond.membersCount} {isFr ? "membres anonymes" : "Anonymous Members"}</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">article</span>
                          <span>{isFr ? cond.resourcesCountFr : cond.resourcesCountEn}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                <span className="material-symbols-outlined text-gray-300 text-5xl mb-2">sentiment_dissatisfied</span>
                <p className="text-sm font-medium text-gray-500">
                  {isFr ? "Aucune affection correspondante trouvée." : "No matching conditions found."}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Sidebar containing searches and trendings */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Recent Searches Card matching mockup perfectly */}
          <section className="bg-slate-50 border border-gray-100 p-5 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">
                {isFr ? "Recherches récentes" : "Recent Searches"}
              </h3>
              {recentSearches.length > 0 && (
                <button 
                  onClick={clearRecent}
                  className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                >
                  {isFr ? "Tout effacer" : "Clear all"}
                </button>
              )}
            </div>
            
            {recentSearches.length > 0 ? (
              <ul className="space-y-3">
                {recentSearches.map((term, index) => (
                  <li 
                    key={index}
                    onClick={() => handleRecentClick(term)}
                    className="flex items-center gap-2.5 text-xs text-gray-600 hover:text-primary cursor-pointer transition-colors group"
                  >
                    <span className="material-symbols-outlined text-gray-400 text-sm">history</span>
                    <span className="font-medium">{term}</span>
                    <span className="material-symbols-outlined text-xs ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      north_west
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400 italic">
                {isFr ? "Aucune recherche récente." : "No recent searches."}
              </p>
            )}
          </section>

          {/* Trending Conditions with mockup image headers */}
          <section>
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-4 px-1">
              {isFr ? "Affections tendances" : "Trending Conditions"}
            </h3>
            
            <div className="space-y-3">
              {/* Box 1: Lyme Disease */}
              <div 
                onClick={() => onSelectCondition("crohns")} // redirection example or generic engagement
                className="relative overflow-hidden rounded-2xl h-24 shadow-xs group cursor-pointer active:scale-98 transition-transform"
              >
                <img 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLQdeCQzonA5184H9CAyIl1gFoTwYJwx-TfHnGGYtXEobVH0k1-I30PN6oin8tIk2KRoH_H0ISe3J81yFhJHrHZ3MD1RubydvSg-6gltPW5PvSFplbTWpl-qgtLy1vn6ka2Slm-8LhHuEG_1UlzMqv1iPrYD19DyCqoSIvOAuK1xIKwx0Lo0Vpv85JEnlGpYG3kCgbMZ5156STQl_99kbHJIZH0nyMekIwx19IIchc7WXC4mkR9cVUbUbo-rzIYwQ8hysxb9lsI00N"
                  alt="Lyme Disease Microscopic Structure"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-transparent flex flex-col justify-center px-5">
                  <span className="text-white/70 text-[9px] font-bold uppercase tracking-widest mb-0.5">
                    {isFr ? "INTÉRÊT CROISSANT" : "RISING INTEREST"}
                  </span>
                  <span className="text-white font-bold text-base font-headline">
                    {isFr ? "Maladie de Lyme" : "Lyme Disease"}
                  </span>
                </div>
              </div>

              {/* Box 2: Seasonal Allergies */}
              <div 
                onClick={() => onSelectCondition("celiac")}
                className="relative overflow-hidden rounded-2xl h-24 shadow-xs group cursor-pointer active:scale-98 transition-transform"
              >
                <img 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFC2-iGuwfQDDuqlAmkEi0EvW99L9DRdLGNk-NqTs3MjF7GJqExGAAmCvTwesKMdEma1ZSPYKGIdMV4ZP97BPWU0M1gnbyR7K7VKNcTydazR2eM2VhfhsuoCRJVKe7tC-TqSt57R7WSAoiZ4_Zxu87-MgrJHTWNv390JaLgTI_LZZ1EJ4v-sh_-PP28P08mbZ61DwEnqhzEaZCw8C4kE0JlgtA8PCuJflJ1VuDoIQ9KhCrpQr8dG8QGzeJrQjA9qMkzgz_BFm4fMCu"
                  alt="Seasonal Allergies Grains"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-teal-800/90 via-teal-700/60 to-transparent flex flex-col justify-center px-5">
                  <span className="text-white/70 text-[9px] font-bold uppercase tracking-widest mb-0.5">
                    {isFr ? "ALERTE SAISONNIÈRE" : "SEASON ALERT"}
                  </span>
                  <span className="text-white font-bold text-base font-headline">
                    {isFr ? "Allergies Saisonnières" : "Seasonal Allergies"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Core medical disclaimer bottom anchor */}
          <footer className="text-center py-4">
            <p className="text-[10px] text-gray-400 leading-normal px-2">
              {isFr 
                ? "Avertissement médical : Les informations fournies le sont uniquement à des fins éducatives et ne constituent pas un avis médical professionnel. Demandez toujours l'avis d'un professionnel de la santé."
                : "Medical Disclaimer: Information provided is for educational purposes only and not professional advice. Always seek the advice of your physician."}
            </p>
            <div className="flex justify-center gap-3 mt-3 text-[10px] font-semibold text-gray-400">
              <a href="#" className="hover:text-primary">Privacy Policy</a>
              <span className="text-gray-300">|</span>
              <a href="#" className="hover:text-primary">Terms</a>
            </div>
          </footer>
        </aside>
      </div>

      {/* Floating Action Button - Opens Chat with specific responsive animations */}
      <motion.button 
        whileHover={{ scale: 1.05, rotate: 6 }}
        whileTap={{ scale: 0.95 }}
        onClick={onOpenChat}
        className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer active:scale-95 transition-all z-40"
      >
        <span className="material-symbols-outlined text-[26px]">help_center</span>
      </motion.button>
    </div>
  );
}
