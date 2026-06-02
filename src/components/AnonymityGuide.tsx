import React, { useState } from "react";
import { motion } from "motion/react";
import { Language } from "../types";

interface AnonymityGuideProps {
  lang: Language;
  onBack: () => void;
}

export default function AnonymityGuide({ lang, onBack }: AnonymityGuideProps) {
  const isFr = lang === "fr";
  
  // Custom interactive toggles for user-configurable privacy parameters
  const [autoburn, setAutoburn] = useState(true);
  const [obfuscateLocation, setObfuscateLocation] = useState(true);
  const [privateFonts, setPrivateFonts] = useState(true);

  return (
    <div className="pt-24 pb-32 px-4 max-w-4xl mx-auto w-full font-sans">
      {/* Back trigger */}
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        <span>{isFr ? "Retour" : "Back"}</span>
      </button>

      {/* Visual Header card */}
      <section className="bg-white border border-gray-150 p-6 rounded-2xl shadow-xs mb-8 text-center sm:text-left sm:flex sm:items-center sm:gap-6">
        <div className="mx-auto sm:mx-0 w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-primary text-4xl flex-shrink-0 mb-4 sm:mb-0">
          <span className="material-symbols-outlined !text-4xl">verified_user</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-901 tracking-tight font-headline">
            {isFr ? "Guide de Protection de la Vie Privée" : "Privacy & Anonymity Guide"}
          </h2>
          <p className="text-xs text-gray-500 max-w-xl leading-relaxed mt-1">
            {isFr 
              ? "Découvrez les technologies de chiffrement et d'isolation de niveau militaire de Health Anonymous qui garantissent votre anonymat absolu."
              : "Learn how Health Anonymous utilizes state-of-the-art segregation and military-grade hashing to secure absolute client-side confidentiality."}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Settings Core */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
            {isFr ? "Configuration de l'Anonymat" : "Confidentiality Audit"}
          </h3>

          <div className="bg-white border border-gray-150 rounded-2xl p-5 space-y-5 shadow-xs">
            {/* Row 1: Read-only core metadata */}
            <div className="flex justify-between items-start gap-3 pb-4 border-b border-gray-50">
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-sm">
                  {isFr ? "Metadonnées Supprimées d'Office" : "Forced Metadata Scrubbing"}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {isFr ? "Supprime adresses IP, agents utilisateurs et informations de géolocalisation" : "Removes IP addresses, system specs, and geolocation tags before server routing."}
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md uppercase tracking-wide whitespace-nowrap">
                {isFr ? "INDÉBOULONNABLE" : "ALWAYS ACTIVE"}
              </span>
            </div>

            {/* Row 2: Read-only SHA-256 Hashing */}
            <div className="flex justify-between items-start gap-3 pb-4 border-b border-gray-50">
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-sm">
                  {isFr ? "Chiffrement Cryptographique SHA-256" : "SHA-256 Signature Isolation"}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {isFr ? "Isoler vos rapports médicaux de tout profil ou mot de passe réels." : "Passwords and emails undergo unique client-side hashing to decouple public records from raw logins."}
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md uppercase tracking-wide whitespace-nowrap">
                {isFr ? "ACTIVE" : "ALWAYS ACTIVE"}
              </span>
            </div>

            {/* Row 3: Configurable autoburn cache */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-50">
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-sm">
                  {isFr ? "Autodestruction de la Session" : "Session Autoburner"}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {isFr ? "Wipe local caches and cookies after 10 minutes of complete inactivity." : "Wipe browser caches and sign out anonymous alias automatically after 10 minutes of total inactivity."}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={autoburn}
                  onChange={(e) => setAutoburn(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Row 4: Configurable geographic routing */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-50">
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-sm">
                  {isFr ? "Brouillage Géographique (VPN Interne)" : "Geographic Block Obfuscator"}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {isFr ? "Falsifier et brouiller les nœuds CDN de l'application" : "Mask and cycle your approximate network location to prevent browser timezone matching."}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={obfuscateLocation}
                  onChange={(e) => setObfuscateLocation(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Row 5: Configurable system font blocking */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-sm">
                  {isFr ? "Anti-Fingerprint de Polices" : "System Font Shield"}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {isFr ? "Bloquer le scan de vos polices système pour éviter les empreintes numériques." : "Inject standard general fonts only to block browser structural hashing via system font catalogs."}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={privateFonts}
                  onChange={(e) => setPrivateFonts(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Q&A / Security Principles FAQ */}
        <aside className="lg:col-span-5 space-y-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
            {isFr ? "Questions Fréquentes" : "Security FAQ"}
          </h3>

          <div className="space-y-4">
            {/* QA Item 1 */}
            <div className="bg-slate-50/70 border border-gray-100 p-4 rounded-xl">
              <h4 className="font-bold text-gray-950 text-xs mb-1.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">live_help</span>
                <span>{isFr ? "Comment mes messages sont-ils reliés ?" : "How are public forum posts linked to me?"}</span>
              </h4>
              <p className="text-xs text-slate-600 leading-normal font-sans">
                {isFr 
                  ? "Ils ne sont pas reliés ! Chaque post utilise un pseudonyme aléatoire comme 'GentleWillow25' qui est entièrement séparé de vos identifiants réels." 
                  : "They are completely isolated. Community posts are logged with dynamic ephemerals, meaning your password logs and discussion histories are held on separate databases."}
              </p>
            </div>

            {/* QA Item 2 */}
            <div className="bg-slate-50/70 border border-gray-100 p-4 rounded-xl">
              <h4 className="font-bold text-gray-950 text-xs mb-1.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">live_help</span>
                <span>{isFr ? "L'IA conserve-t-elle mes recherches ?" : "Does the AI train on my medical symptoms?"}</span>
              </h4>
              <p className="text-xs text-slate-600 leading-normal font-sans">
                {isFr 
                  ? "Non ! Vos requêtes IA passent par un proxy anonymisé et les données sont instantanément purgées après la génération de la réponse éducative." 
                  : "No! All AI requests are funneled through an anonymized proxy gateway client-side. Your inputs are stripped of any device links and never persist."}
              </p>
            </div>

            {/* QA Item 3 */}
            <div className="bg-slate-50/70 border border-gray-100 p-4 rounded-xl">
              <h4 className="font-bold text-gray-950 text-xs mb-1.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">live_help</span>
                <span>{isFr ? "Comment puis-je effacer mes traces ?" : "Can I clear all my footprints?"}</span>
              </h4>
              <p className="text-xs text-slate-600 leading-normal font-sans">
                {isFr 
                  ? "Vous pouvez cliquer sur 'Se déconnecter' dans votre profil. Cela supprimera toutes vos données de navigation locales et expirera toutes les sessions en cours." 
                  : "Simply click 'Sign Out' inside your Profile settings. This instantly purges local cookies, storage tokens, and expires live database access tokens."}
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Styled Footer */}
      <footer className="text-center py-8 mt-12 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 leading-normal px-2 max-w-lg mx-auto">
          {isFr 
            ? "Ce guide décrit le pipeline de protection de la vie privée de Health Anonymous de bout en bout. Nous mettons continuellement à jour nos audits de sécurité."
            : "This reference guide describes the exact end-to-end protective pipeline. We undergo recursive third-party vulnerability audits annually."}
        </p>
        <div className="flex justify-center gap-4 mt-3 text-[10px] font-semibold text-gray-400">
          <a href="#" className="hover:text-primary">Audit Log</a>
          <span className="text-gray-300">|</span>
          <a href="#" className="hover:text-primary">Source Code</a>
        </div>
      </footer>
    </div>
  );
}
