import React from "react";
import { motion } from "motion/react";
import { Language, Condition } from "../types";

interface ConditionDetailViewProps {
  lang: Language;
  conditionId: string;
  onBack: () => void;
  onEnterSupportGroup: (conditionId: string) => void;
  onAskAI: (prePromotedText: string) => void;
  conditions: Condition[];
}

// Rich localized educational dataset to populate the "remaining screens" cleanly
const DETAIL_METADATA: Record<string, {
  symptomsEn: string[];
  symptomsFr: string[];
  lifestyleEn: string[];
  lifestyleFr: string[];
  stigmaLevel: "Low" | "Moderate" | "High";
  riskReasonEn: string;
  riskReasonFr: string;
}> = {
  diabetes: {
    symptomsEn: ["Increased thirst and frequent urination", "Fatigue and blurred vision", "Slow-healing sores or cuts"],
    symptomsFr: ["Soif constante et miction fréquente", "Fatigue inhabituelle et vision floue", "Cicatrisation ralentie des plaies"],
    lifestyleEn: ["Consistent carbohydrate distribution throughout the day", "30 minutes of daily aerobic or resistance training", "Routine screening of capillary blood glucose"],
    lifestyleFr: ["Répartition stable des glucides sur la journée", "30 minutes recommandées d'exercice ou musculation", "Audits réguliers de la glycémie capillaire"],
    stigmaLevel: "Moderate",
    riskReasonEn: "Misconceptions around diet trigger unwanted comments. Direct support keeps discussions blame-free.",
    riskReasonFr: "Les préjugés sur le régime déclenchent des blâmes. Le soutien anonyme évite les jugements."
  },
  anxiety: {
    symptomsEn: ["Excessive uncontrollable worry or fear", "Muscle tension and restiveness", "Sleep disturbances (insomnia)"],
    symptomsFr: ["Inquiétude excessive et peur incontrôlable", "Tension musculaire constante et agitation", "Perturbations sévères du sommeil"],
    lifestyleEn: ["Box breathing exercises (4 seconds count)", "Scheduled worry sessions (limiting worry to 15 mins daily)", "Limiting caffeine and inflammatory stimulants"],
    lifestyleFr: ["Exercice régulier de respiration par boîte (4 secondes)", "Créneaux d'inquiétude programmés (15 mins par jour)", "Diminution drastique de caféine et d'excitants"],
    stigmaLevel: "High",
    riskReasonEn: "Social anxiety makes face-to-face meetups extremely heavy. Anonymous boards guarantee safety.",
    riskReasonFr: "L'anxiété rend les réunions physiques pesantes. Les forums anonymes offrent la sécurité complète."
  },
  long_covid: {
    symptomsEn: ["Severe post-exertional malaise (PEM)", "Chronic fatigue and brain fog", "Palpitations and shortness of breath"],
    symptomsFr: ["Malaise post-effort sévère (MPE)", "Fatigue persistante et brouillard mental", "Palpitations cardiaques et souffle court"],
    lifestyleEn: ["Strict activity pacing (do not push through limits)", "Consistent hydration with electrolyte solutions", "Structured cognitive休息 (screen-free breaks)"],
    lifestyleFr: ["Régulation de l'effort physique (pas de dépassement)", "Hydratation accrue avec solutions d'électrolytes", "Repos cognitif complet et pauses sans écran"],
    stigmaLevel: "Moderate",
    riskReasonEn: "Skeptics often question chronic exhaustion. Peer feedback establishes validation.",
    riskReasonFr: "Certains doutent de l'épuisement. Les retours de pairs légitiment les symptômes."
  },
  celiac: {
    symptomsEn: ["Chronic abdominal discomfort and bloating", "Malabsorption and unexplained weight loss", "Dermatitis herpetiformis (itchy skin rash)"],
    symptomsFr: ["Inconfort abdominal chronique et ballonnements", "Malabsorption alimentaire et perte de poids", "Dermatite herpétiforme (éruptions cutanées)"],
    lifestyleEn: ["Strictest 100% gluten-free diet", "Screening for cross-contamination at home and kitchen", "Routine mineral density tests"],
    lifestyleFr: ["Régime 100 % sans gluten très rigoureux", "Vigilance accrue contre la contamination croisée", "Contrôles périodiques de la densité minérale"],
    stigmaLevel: "Low",
    riskReasonEn: "Social situations cause intense dining anxiety. Peer cooking recipes restore confidence.",
    riskReasonFr: "Les repas en société causent de l'anxiété. Le partage de recettes redonne de l'assurance."
  },
  crohns: {
    symptomsEn: ["Severe persistent abdominal cramps", "Frequent urgent diarrhea", "Fever and reduced appetite"],
    symptomsFr: ["Crampes abdominales aiguës et récurrentes", "Diarrhées impérieuses et fréquentes", "Fièvre inexpliquée et perte d'appétit"],
    lifestyleEn: ["Keeping a detailed daily meal and trigger log", "Consuming smaller, frequent meals instead of single heavy ones", "Low-residue diets during flare stages"],
    lifestyleFr: ["Journalisation des aliments et des crises", "Prise de petits repas légers et fréquents", "Régimes faibles en résidus lors des crises aiguës"],
    stigmaLevel: "High",
    riskReasonEn: "Bathroom conversations trigger severe awkwardness. Confidential forums provide release.",
    riskReasonFr: "Les discussions sur le transit sont jugées taboues. Les espaces privés libèrent la parole."
  },
  fibromyalgia: {
    symptomsEn: ["Diffuse widespread musculoskeletal pain", "Severe morning muscular stiffness", "Fibro-fog (short-term memory deficits)"],
    symptomsFr: ["Douleurs musculo-squelettiques diffuses", "Raideur musculaire prononcée le matin", "Brouillard fibro (perte de mémoire à court terme)"],
    lifestyleEn: ["Gentle low-impact swimming or water aerobics", "Structured myofascial relaxation or gentle stretching", "Optimizing sleep hygiene standards"],
    lifestyleFr: ["Natation douce à faible impact ou aquagym", "Massages myofasciaux ou étirements musculaires doux", "Optimisation rigoureuse de la routine du sommeil"],
    stigmaLevel: "Moderate",
    riskReasonEn: "Invisible pain is heavily doubted by outsiders. Safe rooms allow you to speak freely.",
    riskReasonFr: "Les douleurs invisibles sont souvent remises en cause. Nos salons libèrent la parole."
  }
};

export default function ConditionDetailView({ lang, conditionId, onBack, onEnterSupportGroup, onAskAI, conditions }: ConditionDetailViewProps) {
  const isFr = lang === "fr";
  const condition = (conditions || []).find((c) => c.id === conditionId);
  const detail = DETAIL_METADATA[conditionId] || {
    symptomsEn: ["Symptom indicators are active inside support groups."],
    symptomsFr: ["Les indicateurs de symptômes sont actifs dans la communauté."],
    lifestyleEn: ["Consult support group posts for diet options."],
    lifestyleFr: ["Consultez les posts pour les options de régime."],
    stigmaLevel: "Low" as const,
    riskReasonEn: "Discussing symptoms in safe areas maintains complete piece of mind.",
    riskReasonFr: "Discuter des symptômes en toute sécurité préserve votre sérénité."
  };

  if (!condition) {
    return (
      <div className="pt-24 text-center">
        <p className="text-gray-500">Condition not found.</p>
        <button onClick={onBack} className="text-primary font-bold hover:underline">Go Back</button>
      </div>
    );
  }

  const symptoms = isFr ? detail.symptomsFr : detail.symptomsEn;
  const lifestyle = isFr ? detail.lifestyleFr : detail.lifestyleEn;

  // Set up ready-made questions for AI consultation
  const prePromotedQuestion = isFr 
    ? `Pouvez-vous me donner des détails éducatifs supplémentaires et des conseils pour gérer le/la ${condition.nameFr} ?`
    : `Could you give me some helpful, educational insights on symptoms and natural management for ${condition.nameEn}?`;

  return (
    <div className="pt-24 pb-32 px-4 max-w-4xl mx-auto w-full font-sans">
      {/* Back to Explore Trigger bar */}
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        <span>{isFr ? "Retourner à l'exploration" : "Back to Explore"}</span>
      </button>

      {/* Hero Visual Card banner specifically mirroring condition icons and statistics */}
      <article className="bg-white rounded-2xl border border-gray-150 p-6 shadow-[0px_10px_30px_rgba(15,23,42,0.02)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center text-primary text-3xl">
              <span className="material-symbols-outlined">{condition.icon}</span>
            </div>
            <div>
              <span className="px-2.5 py-0.5 bg-slate-100 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {condition.category}
              </span>
              <h2 className="text-xl font-bold text-gray-905 font-headline mt-1">
                {isFr ? condition.nameFr : condition.nameEn}
              </h2>
            </div>
          </div>

          {/* Quick Stats banner widget */}
          <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">groups</span>
              <span>{condition.membersCount} {isFr ? "membres" : "members"}</span>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">menu_book</span>
              <span>{isFr ? "85 Documents" : "85 Researches"}</span>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans border-b border-gray-50 pb-5">
          {isFr ? condition.descriptionFr : condition.descriptionEn}
        </p>

        {/* Symptoms and Lifestyle Adaptations Side-by-Side layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Symptoms List Card */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-primary">warning</span>
              <span>{isFr ? "Symptômes Courants" : "Typical Symptoms"}</span>
            </h3>
            <ul className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-gray-100">
              {symptoms.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed font-sans">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Lifestyle List Card */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-primary">health_and_safety</span>
              <span>{isFr ? "Conseils de Gestion" : "Management Guidelines"}</span>
            </h3>
            <ul className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-gray-100">
              {lifestyle.map((l, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed font-sans">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Interactive Stigma and Privacy warning scorecard */}
        <div className="bg-red-50/30 border border-red-100 rounded-xl p-4 flex gap-3.5 items-start">
          <span className="material-symbols-outlined text-red-600">privacy_tip</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-red-950">
                {isFr ? "Indice de Confidentialité Requis" : "Privacy Audit Alert"}
              </span>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded-md uppercase">
                {isFr ? `STIGMATE : ${detail.stigmaLevel}` : `${detail.stigmaLevel} Stigma`}
              </span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed mt-1">
              {isFr ? detail.riskReasonFr : detail.riskReasonEn}
            </p>
          </div>
        </div>

        {/* Interactive Stigma and Privacy warning scorecard */}
        <div className="bg-red-50/30 border border-red-100 rounded-xl p-4 flex gap-3.5 items-start">
          <span className="material-symbols-outlined text-red-600">privacy_tip</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-red-950">
                {isFr ? "Indice de Confidentialité Requis" : "Privacy Audit Alert"}
              </span>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded-md uppercase">
                {isFr ? `STIGMATE : ${detail.stigmaLevel}` : `${detail.stigmaLevel} Stigma`}
              </span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed mt-1">
              {isFr ? detail.riskReasonFr : detail.riskReasonEn}
            </p>
          </div>
        </div>

        {/* 1.2 & 2.2 & 3.5 Disease Activity Statistics Graph Module */}
        <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-150 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-teal-600 text-base">analytics</span>
                <span>{isFr ? "Statistiques d'Activité de la Maladie" : "Disease Activity & Support Metrics"}</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-sans">
                {isFr ? "Tendances des signalements anonymes et volume de posts (Moyenne 7 jours)" : "Simulated localized flare-up index and group reporting volume (7-day average)"}
              </p>
            </div>
            <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 text-[10px] font-bold shadow-xs self-start">
              <button className="px-2.5 py-1 bg-teal-600 text-white rounded-md">
                {isFr ? "Discussion" : "Post Volume"}
              </button>
              <button className="px-2.5 py-1 text-slate-600 hover:text-slate-900">
                {isFr ? "Symptômes" : "Symptom Index"}
              </button>
            </div>
          </div>

          {/* Interactive SVG Area Chart representing activity */}
          <div className="bg-white p-4 rounded-xl border border-slate-150/80">
            <div className="h-44 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0.00" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal gridlines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="130" x2="500" y2="130" stroke="#f1f5f9" strokeWidth="1" />
                
                {/* Filled Area */}
                <path 
                  d="M 10 160 C 90 90, 150 140, 240 60 C 320 120, 420 40, 490 50 L 490 160 L 10 160 Z" 
                  fill="url(#chartGrad)" 
                />
                
                {/* Line Path */}
                <path 
                  d="M 10 160 C 90 90, 150 140, 240 60 C 320 120, 420 40, 490 50" 
                  fill="none" 
                  stroke="#0d9488" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                />

                {/* Vertical guides and interactive points */}
                <circle cx="90" cy="90" r="4.5" fill="#0d9488" stroke="#ffffff" strokeWidth="1.5" className="hover:scale-125 transition-transform" />
                <circle cx="240" cy="60" r="4.5" fill="#0d9488" stroke="#ffffff" strokeWidth="1.5" className="hover:scale-125 transition-transform" />
                <circle cx="490" cy="50" r="4.5" fill="#0d9488" stroke="#ffffff" strokeWidth="1.5" className="hover:scale-125 transition-transform" />
              </svg>
            </div>
            
            {/* X-axis legends */}
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-medium pt-2 border-t border-slate-100">
              <span>{isFr ? "Lun / Mon" : "Mon"}</span>
              <span>{isFr ? "Mer / Wed" : "Wed"}</span>
              <span>{isFr ? "Ven / Fri" : "Fri"}</span>
              <span>{isFr ? "Dim / Sun" : "Sun"}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-slate-700">
            <div className="bg-white p-2.5 rounded-xl border border-slate-150 shadow-xs">
              <span className="text-[10px] text-slate-400 block">{isFr ? "Pic de rapports" : "Peak Activity"}</span>
              <span className="font-bold text-xs text-slate-900 font-mono mt-0.5 block">21:00 UTC</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-150 shadow-xs">
              <span className="text-[10px] text-slate-400 block">{isFr ? "Inconfort Moyen" : "Symptom Level"}</span>
              <span className="font-bold text-xs text-teal-600 font-mono mt-0.5 block">{isFr ? "Léger / Faible" : "Moderate-Low"}</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-150 shadow-xs">
              <span className="text-[10px] text-slate-400 block">{isFr ? "Sujet phare" : "Trending Topic"}</span>
              <span className="font-bold text-xs text-slate-900 truncate mt-0.5 block">
                {isFr ? "Nutrition" : "Diet Options"}
              </span>
            </div>
          </div>
        </div>

        {/* Action triggers grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* CTA 1: Enter Support Group forum */}
          <button 
            onClick={() => onEnterSupportGroup(condition.id)}
            className="w-full h-12 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container shadow-xs active:scale-99 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">forum</span>
            <span>{isFr ? "Entrer dans le Groupe de Soutien" : "Join Support Discussions"}</span>
          </button>

          {/* CTA 2: Ask Secure AI assistant with pre-loaded context prompt */}
          <button 
            onClick={() => onAskAI(prePromotedQuestion)}
            className="w-full h-12 bg-slate-100 text-primary text-xs font-bold rounded-xl hover:bg-slate-200 active:scale-99 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">smart_toy</span>
            <span>{isFr ? "Demander à l'IA de manière sûre" : "Ask Secure AI Assistant"}</span>
          </button>
        </div>
      </article>

      {/* Styled mockup medical disclaimer bottom */}
      <footer className="text-center py-6 mt-8">
        <p className="text-[10px] text-gray-400 leading-normal max-w-xl mx-auto">
          {isFr 
            ? "Avertissement médical : Ces informations ont un but strictement indicatif et éducatif. Consultez impérativement votre médecin généraliste ou médecin spécialiste."
            : "Medical Disclaimer: The insights aggregated above are for structural educational awareness purposes only. Always consult medical experts."}
        </p>
      </footer>
    </div>
  );
}
