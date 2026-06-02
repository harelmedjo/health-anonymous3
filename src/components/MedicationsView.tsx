import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Language, Medication } from "../types";

interface MedicationsViewProps {
  lang: Language;
  onBack: () => void;
  conditions: any[];
}

export default function MedicationsView({ lang, onBack }: MedicationsViewProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [loading, setLoading] = useState(true);

  const isFr = lang === "fr";

  React.useEffect(() => {
    fetch("/api/medications")
      .then(res => res.json())
      .then(data => {
        setMedications(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const list = new Set(medications.map(m => m.category));
    return ["All", ...Array.from(list)];
  }, [medications]);

  const filteredMeds = useMemo(() => {
    return medications.filter(m => {
      const matchSearch = 
        m.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.nameFr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.usageEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.usageFr.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === "All" || m.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [medications, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 pb-12">
      {/* Header element mirroring other exploration sections */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isFr ? "Guide des Médicaments" : "Medication Reference"}
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              {isFr ? "Recherchez la posologie, l'usage, et avertissements bilingues" : "Check secure dosage guidance, warnings, and safety guidelines"}
            </p>
          </div>
        </div>
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full">
          <span className="material-symbols-outlined text-xl">pill</span>
        </div>
      </div>

      {/* Modern Search/Filter Module 3.4 */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_4px_20px_rgba(30,41,59,0.02)] space-y-3">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isFr ? "Rechercher par nom d'ingrédient ou indication..." : "Search for medication by name, treatment, active agents..."}
            className="w-full h-11 pl-11 pr-4 bg-slate-50/50 rounded-xl border border-slate-200/80 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-sm placeholder:text-slate-400 font-sans"
          />
        </div>

        {/* Categories Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600"
              }`}
            >
              {cat === "All" ? (isFr ? "Tout" : "All Categories") : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Medications directory list */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">
          <span className="material-symbols-outlined animate-spin text-2xl">autorenew</span>
          <p className="text-xs mt-2 font-mono">Querying registered formulations...</p>
        </div>
      ) : filteredMeds.length === 0 ? (
        <div className="py-12 bg-white rounded-2xl border border-slate-100 text-center space-y-2">
          <span className="material-symbols-outlined text-4xl text-slate-300">healing_off</span>
          <p className="text-sm font-semibold text-slate-700">
            {isFr ? "Aucun médicament disponible" : "No medications matches found"}
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {isFr ? "Essayez une autre recherche ou demandez à l'assistant IA." : "Adjust your search parameters or query our clinical AI tool."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 space-y-3">
            {filteredMeds.map((med) => (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                key={med.id}
                onClick={() => setSelectedMed(med)}
                className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                  selectedMed?.id === med.id
                    ? "bg-emerald-50/20 border-emerald-500 shadow-xs"
                    : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"
                }`}
              >
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {isFr ? med.nameFr : med.nameEn}
                  </h3>
                  <p className="text-slate-400 font-mono text-[10px] uppercase tracking-wider mt-0.5">
                    {med.category}
                  </p>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-lg">
                  {selectedMed?.id === med.id ? "info" : "chevron_right"}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Interactive detail pane containing complete Dosage, Side effects and Warnings (3.4) */}
          <div className="md:col-span-2">
            <AnimatePresence mode="wait">
              {selectedMed ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)] space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider mb-2">
                        {selectedMed.category}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900">
                        {isFr ? selectedMed.nameFr : selectedMed.nameEn}
                      </h3>
                    </div>
                    <span className="material-symbols-outlined text-3xl text-emerald-600">medication</span>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Usage Block */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-md text-emerald-600">help_center</span>
                      <span>{isFr ? "Indications & Usages" : "Usage & Indication"}</span>
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-sans">
                      {isFr ? selectedMed.usageFr : selectedMed.usageEn}
                    </p>
                  </div>

                  {/* Dosage Block */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-md text-emerald-600">science</span>
                      <span>{isFr ? "Posologie standard" : "Dosage Information"}</span>
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-sans">
                      {isFr ? selectedMed.dosageFr : selectedMed.dosageEn}
                    </p>
                  </div>

                  {/* Side Effects Block */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-md text-orange-600">warning_amber</span>
                      <span>{isFr ? "Effets secondaires possibles" : "Potential Side Effects"}</span>
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-sans">
                      {isFr ? selectedMed.sideEffectsFr : selectedMed.sideEffectsEn}
                    </p>
                  </div>

                  {/* Warnings Block */}
                  <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl space-y-1">
                    <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-md text-rose-600">report</span>
                      <span>{isFr ? "Mises en garde & Contre-indications" : "Contraindications & Warnings"}</span>
                    </h4>
                    <p className="text-xs text-rose-900 leading-relaxed font-sans font-medium">
                      {isFr ? selectedMed.warningsFr : selectedMed.warningsEn}
                    </p>
                  </div>

                  {/* Medical Disclaimer anchor matching guidelines */}
                  <p className="text-[10px] text-slate-400 italic font-sans leading-relaxed text-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {isFr 
                      ? "Avertissement : Cette fiche est uniquement informative. Consultez toujours l'avis de votre pharmacien ou médecin avant toute prise."
                      : "Disclaimer: This synthesis does not replace formal diagnosis. Always inspect product package guidelines or consult qualified physicians."}
                  </p>
                </motion.div>
              ) : (
                <div className="bg-slate-50/40 rounded-2xl p-12 border border-dashed border-slate-200 text-center space-y-2 h-full flex flex-col justify-center items-center">
                  <span className="material-symbols-outlined text-4xl text-slate-300">visibility</span>
                  <p className="text-sm font-semibold text-slate-500">
                    {isFr ? "Sélectionnez un médicament" : "Select a medication item"}
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed font-sans">
                    {isFr ? "Sélectionnez un produit à gauche pour afficher sa posologie, ses effets secondaires et alertes médicales." : "Choose from the formulations list to inspect dosage details, health reports, and medical counter-indicators."}
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
