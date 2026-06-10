import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Language, Condition, GroupPost, GroupComment, Medication, UserAccount } from "../types";
import ConfirmationModal from "./ConfirmationModal";

interface AdminPanelProps {
  lang: Language;
  onBack: () => void;
  onRefreshConditions: () => void;
  user?: UserAccount;
  appBackgroundColor: string;
  appTextColor: string;
  onThemeColorChange: (color: string) => void;
}

export default function AdminPanel({ lang, onBack, onRefreshConditions, user, appBackgroundColor, appTextColor, onThemeColorChange }: AdminPanelProps) {
  const isFr = lang === "fr";
  const [isAuthenticated, setIsAuthenticated] = useState(user?.username?.toLowerCase() === "admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<"conditions" | "moderation" | "audits" | "medications">("conditions");

  // Admin database states
  const [stats, setStats] = useState({
    totalConditions: 0,
    totalPosts: 0,
    totalComments: 0,
    totalMedications: 0,
    totalAnonymousMembersCount: "98.4k simulated members active"
  });
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [comments, setComments] = useState<GroupComment[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);

  // Add/Edit conditions form state
  const [isEditing, setIsEditing] = useState<string | null>(null); // "new" or condition ID
  const [formId, setFormId] = useState("");
  const [formNameEn, setFormNameEn] = useState("");
  const [formNameFr, setFormNameFr] = useState("");
  const [formCategory, setFormCategory] = useState("Chronic");
  const [formDescEn, setFormDescEn] = useState("");
  const [formDescFr, setFormDescFr] = useState("");
  const [formIcon, setFormIcon] = useState("pulmonology");

  // Add/Edit medications form state (for Tab 4)
  const [isEditingMed, setIsEditingMed] = useState<string | null>(null); // "new" or medication ID
  const [medFormId, setMedFormId] = useState("");
  const [medFormNameEn, setMedFormNameEn] = useState("");
  const [medFormNameFr, setMedFormNameFr] = useState("");
  const [medFormUsageEn, setMedFormUsageEn] = useState("");
  const [medFormUsageFr, setMedFormUsageFr] = useState("");
  const [medFormDosageEn, setMedFormDosageEn] = useState("");
  const [medFormDosageFr, setMedFormDosageFr] = useState("");
  const [medFormSideEffectsEn, setMedFormSideEffectsEn] = useState("");
  const [medFormSideEffectsFr, setMedFormSideEffectsFr] = useState("");
  const [medFormWarningsEn, setMedFormWarningsEn] = useState("");
  const [medFormWarningsFr, setMedFormWarningsFr] = useState("");
  const [medFormCategory, setMedFormCategory] = useState("Chronic");

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "danger" | "warning";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "danger",
    onConfirm: () => {},
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminDashboard();
    }
  }, [isAuthenticated]);

  const loadAdminDashboard = async () => {
    try {
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) setStats(await statsRes.json());

      const condsRes = await fetch("/api/conditions");
      if (condsRes.ok) setConditions(await condsRes.json());

      const postsRes = await fetch("/api/posts?includePending=true");
      if (postsRes.ok) setPosts(await postsRes.json());

      const auditsRes = await fetch("/api/admin/audits");
      if (auditsRes.ok) setAudits(await auditsRes.json());

      const medsRes = await fetch("/api/medications");
      if (medsRes.ok) setMedications(await medsRes.json());
    } catch (e) {
      console.error("Dashboard payload issues:", e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        const errorData = await res.json();
        setLoginError(errorData.error || (isFr ? "Identifiants invalides." : "Invalid admin username or password details."));
      }
    } catch (err) {
      setLoginError(isFr ? "Erreur de communication avec le serveur." : "Network connection check failures.");
    }
  };

  // Condition actions
  const handleOpenNewForm = () => {
    setIsEditing("new");
    setFormId("");
    setFormNameEn("");
    setFormNameFr("");
    setFormCategory("Chronic");
    setFormDescEn("");
    setFormDescFr("");
    setFormIcon("pulmonology");
  };

  const handleOpenEditForm = (cond: Condition) => {
    setIsEditing(cond.id);
    setFormId(cond.id);
    setFormNameEn(cond.nameEn);
    setFormNameFr(cond.nameFr);
    setFormCategory(cond.category);
    setFormDescEn(cond.descriptionEn);
    setFormDescFr(cond.descriptionFr);
    setFormIcon(cond.icon);
  };

  const handleSaveCondition = async (e: React.FormEvent) => {
    e.preventDefault();
    const condData = {
      id: formId.trim().toLowerCase().replace(/\s+/g, "_"),
      nameEn: formNameEn,
      nameFr: formNameFr,
      category: formCategory,
      descriptionEn: formDescEn,
      descriptionFr: formDescFr,
      membersCount: isEditing === "new" ? "1.0k" : conditions.find(c => c.id === formId)?.membersCount || "2.4k",
      resourcesCountEn: "85 Research papers",
      resourcesCountFr: "85 Articles de recherche",
      icon: formIcon
    };

    try {
      const res = await fetch("/api/conditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(condData)
      });

      if (res.ok) {
        setIsEditing(null);
        await loadAdminDashboard();
        onRefreshConditions();
      } else {
        alert("Failed to upsert condition");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCondition = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: isFr ? "Supprimer l'affection ?" : "Delete Condition?",
      message: isFr 
        ? `Êtes-vous sûr de vouloir supprimer définitivement l'affection '${id}' ? Tous les messages et commentaires associés seront purgés.` 
        : `Are you sure you want to completely delete the condition '${id}'? All associated posts and comments will be permanently erased.`,
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/conditions/${id}`, {
            method: "DELETE"
          });

          if (res.ok) {
            await loadAdminDashboard();
            onRefreshConditions();
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  // Medication actions
  const handleOpenNewMedForm = () => {
    setIsEditingMed("new");
    setMedFormId("");
    setMedFormNameEn("");
    setMedFormNameFr("");
    setMedFormUsageEn("");
    setMedFormUsageFr("");
    setMedFormDosageEn("");
    setMedFormDosageFr("");
    setMedFormSideEffectsEn("");
    setMedFormSideEffectsFr("");
    setMedFormWarningsEn("");
    setMedFormWarningsFr("");
    setMedFormCategory("Chronic");
  };

  const handleOpenEditMedForm = (med: Medication) => {
    setIsEditingMed(med.id);
    setMedFormId(med.id);
    setMedFormNameEn(med.nameEn);
    setMedFormNameFr(med.nameFr);
    setMedFormUsageEn(med.usageEn);
    setMedFormUsageFr(med.usageFr);
    setMedFormDosageEn(med.dosageEn || "");
    setMedFormDosageFr(med.dosageFr || "");
    setMedFormSideEffectsEn(med.sideEffectsEn || "");
    setMedFormSideEffectsFr(med.sideEffectsFr || "");
    setMedFormWarningsEn(med.warningsEn || "");
    setMedFormWarningsFr(med.warningsFr || "");
    setMedFormCategory(med.category || "Chronic");
  };

  const handleSaveMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    const medData: Medication = {
      id: medFormId.trim().toLowerCase().replace(/\s+/g, "_"),
      nameEn: medFormNameEn,
      nameFr: medFormNameFr,
      usageEn: medFormUsageEn,
      usageFr: medFormUsageFr,
      dosageEn: medFormDosageEn,
      dosageFr: medFormDosageFr,
      sideEffectsEn: medFormSideEffectsEn,
      sideEffectsFr: medFormSideEffectsFr,
      warningsEn: medFormWarningsEn,
      warningsFr: medFormWarningsFr,
      category: medFormCategory
    };

    try {
      const res = await fetch("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(medData)
      });

      if (res.ok) {
        setIsEditingMed(null);
        await loadAdminDashboard();
      } else {
        alert("Failed to save medication record.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMedication = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: isFr ? "Supprimer le médicament ?" : "Delete Medication?",
      message: isFr 
        ? `Êtes-vous sûr de vouloir supprimer définitivement le médicament '${id}' de l'annuaire ?` 
        : `Are you sure you want to completely delete medication '${id}' from the medication registry?`,
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/medications/${id}`, {
            method: "DELETE"
          });

          if (res.ok) {
            await loadAdminDashboard();
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  // Moderate content deletes
  const handleDeletePost = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: isFr ? "Supprimer le post ?" : "Delete Post?",
      message: isFr 
        ? "Êtes-vous sûr de vouloir supprimer définitivement ce post de la communauté ?" 
        : "Are you sure you want to permanently scrub this post from the support group?",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/posts/${id}`, {
            method: "DELETE"
          });

          if (res.ok) {
            await loadAdminDashboard();
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleApprovePost = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}/approve`, {
        method: "POST"
      });

      if (res.ok) {
        await loadAdminDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pt-24 pb-32 px-4 max-w-7xl mx-auto w-full font-sans transition-all duration-300">
      
      {/* Top flow trigger banner heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-901 tracking-tight font-headline flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">admin_panel_settings</span>
            <span>{isFr ? "Portail d'Administration Chiffré" : "Secured Admin Portal"}</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isFr 
              ? "Modération des bases de données de santé et des salons de discussion de la communauté."
              : "Direct secure manipulation of clinical indexes, peer posts tables, and privacy audit histories."}
          </p>
        </div>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-primary rounded-xl flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>{isFr ? "Retourner à l'application" : "Exit Admin Mode"}</span>
        </button>
      </div>

      <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-xs mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-3">
          {isFr ? "Personnalisation du thème" : "Theme Personalization"}
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={appBackgroundColor}
              onChange={(e) => onThemeColorChange(e.target.value)}
              className="w-12 h-12 p-0 rounded-xl border border-gray-200 cursor-pointer"
              aria-label={isFr ? "Sélecteur de couleur de fond" : "Background color picker"}
            />
            <div>
              <p className="text-xs text-gray-500">
                {isFr
                  ? "Définissez la couleur de fond de l'application pour votre session."
                  : "Set the app background color for your session."}
              </p>
              <p className="text-xs font-semibold" style={{ color: appTextColor }}>
                {isFr
                  ? `Texte ${appTextColor === "#ffffff" ? "blanc" : "noir"}`
                  : `Text ${appTextColor === "#ffffff" ? "white" : "black"}`}
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {isFr
              ? "Si le fond est clair, le texte devient noir. Si le fond est sombre, le texte devient blanc."
              : "Light backgrounds use black text, dark backgrounds use white text."}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          // STATE 1: SECURED LOGIN ENTRANCE
          <motion.div 
            key="login"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-md mx-auto bg-white border border-gray-150 rounded-2xl p-6 shadow-md"
          >
            <div className="text-center mb-6">
              <span className="material-symbols-outlined text-red-500 !text-5px] bg-red-50 p-3 rounded-full mb-3">lock</span>
              <h3 className="font-bold text-base text-gray-900">{isFr ? "Authentification requise" : "Verification Panel Gateway"}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {isFr ? "Veuillez entrer les identifiants pour surveiller PostgreSQL." : "Verify credentials to edit schema files."}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">
                  {isFr ? "Identifiant" : "Admin Username"}
                </label>
                <input 
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-gray-150 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary outline-hidden text-gray-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">
                  {isFr ? "Mot de passe" : "Admin Password"}
                </label>
                <input 
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-gray-150 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary outline-hidden text-gray-800"
                />
              </div>

              {loginError && (
                <div className="text-xs bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-100 font-bold">
                  ⚠️ {loginError}
                </div>
              )}

              {/* Informative defaults display conforming to user command requirements */}
              {user?.username?.toLowerCase() === "admin" && (
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-[11px] text-amber-800 leading-normal">
                  🔑 <strong>{isFr ? "Identifiants par défaut :" : "Development Defaults:"}</strong><br />
                  {isFr ? "Utilisateur : " : "Username: "}<code className="font-mono font-bold bg-amber-100/60 px-1 rounded">admin</code><br />
                  {isFr ? "Mot de passe : " : "Password: "}<code className="font-mono font-bold bg-amber-100/60 px-1 rounded">admin123</code>
                </div>
              )}

              <button
                type="submit"
                className="w-full h-11 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container transition-all active:scale-98 cursor-pointer shadow-xs"
              >
                {isFr ? "Déverrouiller la Console" : "Verify & Unlock Admin console"}
              </button>
            </form>
          </motion.div>
        ) : (
          // STATE 2: ADULT MODERATION WORKSPACE
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 animate-in fade-in duration-300"
          >
            {/* Quick stats high level telemetry cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-150 p-4 rounded-xl shadow-xs">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Total Conditions</span>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalConditions}</p>
              </div>
              <div className="bg-white border border-gray-150 p-4 rounded-xl shadow-xs">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Public Forum Posts</span>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPosts}</p>
              </div>
              <div className="bg-white border border-gray-150 p-4 rounded-xl shadow-xs">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Total Replies Cached</span>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalComments}</p>
              </div>
              <div className="bg-white border border-gray-150 p-4 rounded-xl shadow-xs">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">System Mode Status</span>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-emerald-600 tracking-wider">PostgreSQL ONLINE</span>
                </div>
              </div>
            </div>

            {/* Configured navigation tabs for moderator actions */}
            <div className="flex border-b border-gray-200">
              <button 
                onClick={() => { setActiveTab("conditions"); setIsEditing(null); }}
                className={`flex items-center gap-1.5 py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === "conditions" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                <span className="material-symbols-outlined text-base">database</span>
                <span>{isFr ? "Index Médico-Clinique" : "Clinical Metadata Index"}</span>
              </button>

              <button 
                onClick={() => { setActiveTab("moderation"); setIsEditing(null); }}
                className={`flex items-center gap-1.5 py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === "moderation" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                <span className="material-symbols-outlined text-base">gavel</span>
                <span>{isFr ? "Surveillance des Forums" : "Community Post Moderation"}</span>
              </button>

              <button 
                onClick={() => { setActiveTab("audits"); setIsEditing(null); setIsEditingMed(null); }}
                className={`flex items-center gap-1.5 py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === "audits" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                <span className="material-symbols-outlined text-base">receipt_long</span>
                <span>{isFr ? "Rapports d'Audit" : "Security Cryptographic Audits"}</span>
              </button>

              <button 
                onClick={() => { setActiveTab("medications"); setIsEditing(null); setIsEditingMed(null); }}
                className={`flex items-center gap-1.5 py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === "medications" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                <span className="material-symbols-outlined text-base font-bold">pill</span>
                <span>{isFr ? "Gestion Médicaments" : "Medication Reference CRUD"}</span>
              </button>
            </div>

            {/* TAB CONTENT PANELS */}

            {/* Panel 1: Conditions catalog database management */}
            {activeTab === "conditions" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-transparent">
                  <h3 className="font-bold text-sm text-gray-900">
                    {isFr ? "Affections cliniques" : "Registered Clinical Conditions"}
                  </h3>
                  {!isEditing && (
                    <button
                      onClick={handleOpenNewForm}
                      className="px-4 py-2 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer shadow-xs active:scale-97"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      <span>{isFr ? "Ajouter une affection" : "Create New index"}</span>
                    </button>
                  )}
                </div>

                {isEditing && (
                  <form onSubmit={handleSaveCondition} className="bg-slate-50 border border-gray-150 p-5 rounded-2xl space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-primary">
                      {isEditing === "new" ? (isFr ? "Nouvelle Affection" : "New Index Entry") : (isFr ? `Édition : ${formId}` : `Editing: ${formId}`)}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">ID Code</label>
                        <input 
                          type="text" 
                          required
                          disabled={isEditing !== "new"}
                          placeholder="e.g. hypertension"
                          value={formId}
                          onChange={(e) => setFormId(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-2 disabled:bg-gray-100 disabled:text-gray-400 focus:outline--none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Category Type</label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-2"
                        >
                          <option value="Chronic">Chronic</option>
                          <option value="Mental Health">Mental Health</option>
                          <option value="Infectious">Infectious</option>
                          <option value="Autoimmune">Autoimmune</option>
                          <option value="Rare Diseases">Rare Diseases</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Visual Symbol Icon</label>
                        <select
                          value={formIcon}
                          onChange={(e) => setFormIcon(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-2"
                        >
                          <option value="pulmonology">pulmonology (Briefcase)</option>
                          <option value="psychiatry">psychiatry (Brain)</option>
                          <option value="coronavirus">coronavirus (Viral)</option>
                          <option value="nutrition">nutrition (Apple)</option>
                          <option value="gastroenterology">gastroenterology (Stomach)</option>
                          <option value="neurology">neurology (Nerve)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">English Title Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="General Hypertension"
                          value={formNameEn}
                          onChange={(e) => setFormNameEn(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">French Title Name (Français)</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Hypertension générale"
                          value={formNameFr}
                          onChange={(e) => setFormNameFr(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">English Diagnosis Description</label>
                        <textarea 
                          required
                          rows={3}
                          value={formDescEn}
                          onChange={(e) => setFormDescEn(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">French Diagnosis Description (Français)</label>
                        <textarea 
                          required
                          rows={3}
                          value={formDescFr}
                          onChange={(e) => setFormDescFr(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(null)}
                        className="px-4 py-2 bg-white border border-gray-250 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#00685f] text-white text-xs font-bold rounded-lg hover:bg-[#004d46] cursor-pointer"
                      >
                        Save Index Changes
                      </button>
                    </div>
                  </form>
                )}

                <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans border-collapse">
                      <thead>
                        <tr className="bg-slate-50/65 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100">
                          <th className="p-4">Symbol</th>
                          <th className="p-4">ID</th>
                          <th className="p-4">English Title</th>
                          <th className="p-4">French Title</th>
                          <th className="p-4">Category</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {conditions.map((c) => (
                          <tr key={c.id} className="border-b border-gray-50 text-xs text-gray-700 hover:bg-slate-50/20">
                            <td className="p-4">
                              <span className="material-symbols-outlined text-gray-500 text-xl">{c.icon}</span>
                            </td>
                            <td className="p-4 font-mono font-bold text-slate-500">{c.id}</td>
                            <td className="p-4 font-bold text-gray-900">{c.nameEn}</td>
                            <td className="p-4 font-bold text-gray-900">{c.nameFr}</td>
                            <td className="p-4">
                              <span className="bg-teal-50 text-teal-700 border border-teal-100/30 font-bold uppercase tracking-wide text-[9px] px-2 py-0.5 rounded-md">
                                {c.category}
                              </span>
                            </td>
                            <td className="p-4 text-center space-x-2">
                              <button
                                onClick={() => handleOpenEditForm(c)}
                                className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded text-[10px] font-bold cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCondition(c.id)}
                                className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[10px] font-bold cursor-pointer"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Panel 2: Forum Post surveillance and moderation deletion */}
            {activeTab === "moderation" && (
              <div className="space-y-6">
                <h3 className="font-bold text-sm text-gray-900">
                  {isFr ? "Publications des utilisateurs actives" : "Active Public User Submissions"}
                </h3>

                <div className="space-y-4">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <article key={post.id} className={`bg-white border p-4 rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-xs hover:shadow-md transition-all duration-300 ${post.status === "pending" ? "border-amber-200 bg-amber-50/10" : "border-gray-150"}`}>
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-gray-400">
                            <span className="text-teal-700">{post.authorAlias}</span>
                            <span>•</span>
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">{post.conditionId}</span>
                            <span>•</span>
                            <span>{post.timestamp}</span>
                            <span>•</span>
                            {(!post.status || post.status === "approved") ? (
                              <span className="bg-teal-50 text-teal-700 border border-teal-100 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                                <span className="h-1 w-1 rounded-full bg-teal-500"></span>
                                {isFr ? "Approuvé" : "Approved"}
                              </span>
                            ) : (
                              <span className="bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
                                <span className="h-1 w-1 rounded-full bg-amber-500"></span>
                                {isFr ? "En attente" : "Pending Approval"}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-700 font-sans leading-relaxed">{post.content}</p>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {post.status === "pending" && (
                            <button
                              onClick={() => handleApprovePost(post.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs hover:shadow-sm"
                            >
                              <span className="material-symbols-outlined text-sm">verified</span>
                              <span>{isFr ? "Approuver" : "Approve"}</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            <span>{post.status === "pending" ? (isFr ? "Rejeter" : "Reject") : (isFr ? "Supprimer" : "Scrub Post")}</span>
                          </button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="text-xs text-center text-gray-400 italic py-8">{isFr ? "Aucune publication enregistrée." : "No public posts cached."}</p>
                  )}
                </div>
              </div>
            )}

            {/* Panel 3: Secure Audit logging stream representation */}
            {activeTab === "audits" && (
              <div className="space-y-6">
                <h3 className="font-bold text-sm text-gray-900">
                  {isFr ? "Journal des activités de sécurité" : "Cryptographic Compliance Audit Logs"}
                </h3>

                <div className="bg-slate-900 text-emerald-400 font-mono text-[11px] p-5 rounded-2xl border border-slate-800 shadow-md h-96 overflow-y-auto space-y-3">
                  <header className="border-b border-white/5 pb-2 mb-3 text-[10px] text-gray-500 tracking-wider">
                    SYSTEM SECURITY LOG STREAM - SHA-256 ISOLATED ACTIONS ONLY
                  </header>
                  {audits.map((aud, idx) => (
                    <div key={idx} className="border-b border-white/5 pb-1">
                      <span className="text-gray-500">[{new Date(aud.timestamp).toISOString()}]</span>{" "}
                      <span className="text-white font-bold">{aud.action}:</span>{" "}
                      <span className="text-emerald-300">{aud.details}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Panel 4: Bilingual Medication CRUD Management */}
            {activeTab === "medications" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-gray-900">
                    {isFr ? "Gestion des Fiches de Médicaments" : "Bilingual Prescription & OTC Medic Directory Index"}
                  </h3>
                  {!isEditingMed && (
                    <button
                      onClick={handleOpenNewMedForm}
                      className="px-4 py-2 bg-primary hover:bg-primary-container text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      <span>{isFr ? "Nouveau Médicament" : "Add Medication Formula"}</span>
                    </button>
                  )}
                </div>

                {isEditingMed && (
                  <form onSubmit={handleSaveMedication} className="bg-slate-50 border border-gray-150 p-5 rounded-2xl space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-primary">
                      {isEditingMed === "new" ? (isFr ? "Nouveau Produit" : "Create New Medication Profile") : (isFr ? `Édition : ${medFormId}` : `Modifying: ${medFormId}`)}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Medication Code/ID</label>
                        <input 
                          type="text" 
                          required
                          disabled={isEditingMed !== "new"}
                          placeholder="e.g. insulin"
                          value={medFormId}
                          onChange={(e) => setMedFormId(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-2 disabled:bg-gray-100 disabled:text-gray-400 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">English Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Insulin Glargine"
                          value={medFormNameEn}
                          onChange={(e) => setMedFormNameEn(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Nom Français (French)</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ex: Insuline Glargine"
                          value={medFormNameFr}
                          onChange={(e) => setMedFormNameFr(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Category</label>
                        <select 
                          value={medFormCategory}
                          onChange={(e) => setMedFormCategory(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-hidden"
                        >
                          <option value="Chronic">Chronic</option>
                          <option value="Mental Health">Mental Health</option>
                          <option value="Hormonal">Hormonal</option>
                          <option value="Painkiller">Painkiller</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Standard Dosage (EN)</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. 10 Units inject daily"
                          value={medFormDosageEn}
                          onChange={(e) => setMedFormDosageEn(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Posologie (FR)</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ex: Injecter 10 unités par jour"
                          value={medFormDosageFr}
                          onChange={(e) => setMedFormDosageFr(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Clinical Usage Description (EN)</label>
                        <textarea 
                          required
                          rows={2}
                          placeholder="Usage details and general patient treatment guides..."
                          value={medFormUsageEn}
                          onChange={(e) => setMedFormUsageEn(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Usage Clinique & Indications (FR)</label>
                        <textarea 
                          required
                          rows={2}
                          placeholder="Indications et traitements d'utilisation..."
                          value={medFormUsageFr}
                          onChange={(e) => setMedFormUsageFr(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Side Effects (EN)</label>
                        <input 
                          type="text" 
                          placeholder="Hypoglycemia, mild headache..."
                          value={medFormSideEffectsEn}
                          onChange={(e) => setMedFormSideEffectsEn(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Effets Secondaires (FR)</label>
                        <input 
                          type="text" 
                          placeholder="Hypoglycémie, maux de tête..."
                          value={medFormSideEffectsFr}
                          onChange={(e) => setMedFormSideEffectsFr(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Critical Caution & Warnings (EN)</label>
                        <input 
                          type="text" 
                          placeholder="Monitor blood sugar continuously..."
                          value={medFormWarningsEn}
                          onChange={(e) => setMedFormWarningsEn(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Mises En Garde & Contre-indications (FR)</label>
                        <input 
                          type="text" 
                          placeholder="Surveiller continuellement la glycémie..."
                          value={medFormWarningsFr}
                          onChange={(e) => setMedFormWarningsFr(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-2"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingMed(null)}
                        className="px-4 py-2 bg-white border border-gray-250 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#00685f] text-white text-xs font-bold rounded-lg hover:bg-[#004d46] cursor-pointer"
                      >
                        Save Medication Record
                      </button>
                    </div>
                  </form>
                )}

                <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans border-collapse">
                      <thead>
                        <tr className="bg-slate-50/65 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100">
                          <th className="p-4">ID</th>
                          <th className="p-4">English Name</th>
                          <th className="p-4">Nom Français</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Dosage (EN)</th>
                          <th className="p-4">Dosage (FR)</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medications.map((m) => (
                          <tr key={m.id} className="border-b border-gray-50 text-xs text-gray-700 hover:bg-slate-50/20">
                            <td className="p-4 font-mono font-bold text-slate-500">{m.id}</td>
                            <td className="p-4 font-bold text-gray-900">{m.nameEn}</td>
                            <td className="p-4 font-bold text-gray-900">{m.nameFr}</td>
                            <td className="p-4">
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100/30 font-bold uppercase tracking-wide text-[9px] px-2 py-0.5 rounded-md">
                                {m.category}
                              </span>
                            </td>
                            <td className="p-4 text-slate-500 italic max-w-xs truncate">{m.dosageEn}</td>
                            <td className="p-4 text-slate-500 italic max-w-xs truncate">{m.dosageFr}</td>
                            <td className="p-4 text-center space-x-2">
                              <button
                                onClick={() => handleOpenEditMedForm(m)}
                                className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded text-[10px] font-bold cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteMedication(m.id)}
                                className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[10px] font-bold cursor-pointer"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        lang={lang}
      />
    </div>
  );
}
