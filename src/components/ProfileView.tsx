import React, { useState } from "react";
import { motion } from "motion/react";
import { Language, UserAccount } from "../types";
import { generateAnonymousAlias } from "../data";
import ConfirmationModal from "./ConfirmationModal";

interface ProfileViewProps {
  lang: Language;
  user: UserAccount;
  onUpdateAlias: (newAlias: string) => void;
  onUpdateLanguage: (newLang: Language) => void;
  onSignOut: () => void;
  onEnterAdmin: () => void;
}

export default function ProfileView({ lang, user, onUpdateAlias, onUpdateLanguage, onSignOut, onEnterAdmin }: ProfileViewProps) {
  const isFr = lang === "fr";
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  const handleRegenAlias = () => {
    const fresh = generateAnonymousAlias();
    onUpdateAlias(fresh);
  };

  return (
    <div className="pt-24 pb-32 px-4 max-w-4xl mx-auto w-full font-sans">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-xs text-center sm:text-left sm:flex sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              {isFr ? "Votre Profil Anonyme" : "Your Anonymous Profile"}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {isFr ? "Entièrement isolé de votre réelle identité." : "Completely isolated from your real-world credentials."}
            </p>
            <div className="pt-2 flex justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-xs text-teal-700 font-bold border border-teal-100">
                <span className="material-symbols-outlined text-sm">shield</span>
                <span>{user.anonymousAlias}</span>
              </span>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleRegenAlias}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-primary rounded-full transition-colors cursor-pointer"
            >
              {isFr ? "Régénérer l'alias" : "Regenerate Alias"}
            </motion.button>
          </div>
        </div>

        {/* Configurations Settings Checklist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preferences Box */}
          <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-gray-901 border-b border-gray-50 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-400">tune</span>
              <span>{isFr ? "Préférences de l'application" : "Application Settings"}</span>
            </h3>

            {/* Language Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 block">
                {isFr ? "Langue préférée" : "Preferred Language"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdateLanguage("en")}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    lang === "en"
                      ? "bg-primary text-white border-primary"
                      : "bg-slate-50 border-gray-200 text-gray-700 hover:bg-slate-100"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => onUpdateLanguage("fr")}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    lang === "fr"
                      ? "bg-primary text-white border-primary"
                      : "bg-slate-50 border-gray-200 text-gray-700 hover:bg-slate-100"
                  }`}
                >
                  Français
                </button>
              </div>
            </div>

            {/* Email registered details summary */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 block">
                {isFr ? "Identifiant de compte" : "Account Verification ID"}
              </label>
              <input
                type="text"
                disabled
                value={user.username || "AnonymousGuest"}
                className="w-full text-xs bg-slate-50 border border-gray-100 text-gray-500 rounded-xl px-3 py-2 cursor-not-allowed"
              />
              <p className="text-[9px] text-gray-400 leading-normal mt-1">
                {isFr 
                  ? "Cet email est chiffré à l'aide de SHA-256 et n'est jamais relié à vos publications publiques." 
                  : "This credential is securely SHA-256 hashed and never logically linked to any of your public forum logs."}
              </p>
            </div>
          </div>

          {/* Security details & Cryptography explanation card */}
          <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-gray-901 border-b border-gray-50 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-400">lock_outline</span>
              <span>{isFr ? "Guide d'Anonymat Garanti" : "Guaranteed Privacy Guide"}</span>
            </h3>
            
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong>1. {isFr ? "Ségrégation complète" : "Separated Architectures"}</strong><br />
              {isFr 
                ? "Vos données de profil privé et vos publications communautaires sont stockées dans deux bases de données physiquement distinctes afin de garantir l'anonymat."
                : "Your private authentication credentials and forum submissions reside in entirely disconnected datastores. They cannot be crossed-referenced."}
            </p>

            <p className="text-xs text-gray-500 leading-relaxed">
              <strong>2. {isFr ? "Masquage des métadonnées" : "Zero Telemetry Logging"}</strong><br />
              {isFr 
                ? "Nous ne suivons, n'enregistrons ni ne stockons jamais les adresses IP des utilisateurs, les identifiants d'appareils ou les fuseaux horaires."
                : "We enforce strict scrub pipelines which clear IP addresses, device identifiers, and browser agents prior to record indexation."}
            </p>

            <p className="text-xs text-gray-500 leading-relaxed">
              <strong>3. {isFr ? "Pas de cookies tiers" : "No Third-party Trackers"}</strong><br />
              {isFr 
                ? "Health Anonymous fonctionne sans aucun cookie tiers ni script de suivi externe."
                : "Health Anonymous runs exactly without generic tracking widgets, advertisement scopes, or analytics cookies."}
            </p>
          </div>
        </div>

        {/* Profile utilities and Admin entrance */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-4">
          {user.username?.toLowerCase() === "admin" && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onEnterAdmin}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 rounded-full cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
              <span>{isFr ? "Console d'Administration" : "Admin Database Portal"}</span>
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSignOutModalOpen(true)}
            className="w-full sm:w-auto px-6 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200/40 text-xs font-bold text-red-600 rounded-full transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>{isFr ? "Se déconnecter" : "Sign Out Session"}</span>
          </motion.button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={onSignOut}
        title={isFr ? "Se déconnecter de la session ?" : "Sign Out of the Session?"}
        message={isFr 
          ? "Êtes-vous sûr de vouloir vous déconnecter? Vos données de session locale seront purgées pour préserver votre anonymat." 
          : "Are you sure you want to sign out? Your local session details will be purged to maintain full privacy."
        }
        confirmLabel={isFr ? "Se déconnecter" : "Sign Out"}
        cancelLabel={isFr ? "Annuler" : "Cancel"}
        type="danger"
        lang={lang}
      />
    </div>
  );
}
