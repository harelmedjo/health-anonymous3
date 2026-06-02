import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Language, View, UserAccount, Condition } from "./types";
import { CONDITIONS, generateAnonymousAlias } from "./data";

// Component imports
import SplashScreen from "./components/SplashScreen";
import LanguageSelection from "./components/LanguageSelection";
import CreateAccount from "./components/CreateAccount";
import ExploreConditions from "./components/ExploreConditions";
import SupportGroups from "./components/SupportGroups";
import AIChatView from "./components/AIChatView";
import ProfileView from "./components/ProfileView";
import ConditionDetailView from "./components/ConditionDetailView";
import AnonymityGuide from "./components/AnonymityGuide";
import AdminPanel from "./components/AdminPanel";
import MedicationsView from "./components/MedicationsView";
import PrivateMessaging from "./components/PrivateMessaging";
import NotificationsView from "./components/NotificationsView";

export default function App() {
  const [lang, setLang] = useState<Language>("en");
  const [view, setView] = useState<View>("splash");
  const [selectedConditionId, setSelectedConditionId] = useState<string | null>(null);
  const [aiChatQuery, setAiChatQuery] = useState<string | undefined>(undefined);
  const [conditions, setConditions] = useState<Condition[]>(CONDITIONS);
  const [privateMessageTargetPeer, setPrivateMessageTargetPeer] = useState<string | null>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [unreadDmCount, setUnreadDmCount] = useState(0);
  const lastSeenDmCountRef = useRef(0);
  
  // Safe anonymous initial state
  const [user, setUser] = useState<UserAccount>({
    isRegistered: false,
    anonymousAlias: "",
    preferredLanguage: "en"
  });

  const isFr = lang === "fr";

  // Fetch registered conditions dynamically from the database
  const fetchConditions = async () => {
    try {
      const res = await fetch("/api/conditions");
      if (res.ok) {
        const data = await res.ok ? await res.json() : CONDITIONS;
        if (Array.isArray(data)) {
          setConditions(data);
        }
      }
    } catch (e) {
      console.warn("API Loading failed, staying with mock index:", e);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const list = await res.json();
        const unread = list.filter((n: any) => !n.isRead).length;
        setUnreadNotificationsCount(unread);
      }
    } catch (e) {
      console.warn("Unread check issues:", e);
    }
  };

  useEffect(() => {
    fetchConditions();
    setUser((prev) => ({
      ...prev,
      anonymousAlias: generateAnonymousAlias()
    }));
  }, []);

  useEffect(() => {
    if (user.isRegistered) {
      fetchUnreadNotifications();
      const interval = setInterval(fetchUnreadNotifications, 7000);
      return () => clearInterval(interval);
    }
  }, [user.isRegistered]);

  // Poll for new DMs so the badge updates even when not on the DMs tab
  useEffect(() => {
    if (!user.isRegistered || !user.anonymousAlias) return;
    const checkDms = async () => {
      try {
        const res = await fetch(`/api/chats?alias=${encodeURIComponent(user.anonymousAlias)}`);
        if (res.ok) {
          const chats = await res.json();
          const total = chats.length;
          if (total > lastSeenDmCountRef.current) {
            setUnreadDmCount(total - lastSeenDmCountRef.current);
          }
        }
      } catch { /* silent */ }
    };
    checkDms();
    const dmInterval = setInterval(checkDms, 8000);
    return () => clearInterval(dmInterval);
  }, [user.isRegistered, user.anonymousAlias]);

  const handleLanguageSelect = (selectedLang: Language) => {
    setLang(selectedLang);
    setUser((prev) => ({ ...prev, preferredLanguage: selectedLang }));
    setView("register");
  };

  const handleRegisterSuccess = (username: string, chosenAlias?: string) => {
    setUser((prev) => ({
      ...prev,
      username: username,
      anonymousAlias: chosenAlias || prev.anonymousAlias,
      isRegistered: true
    }));
    setView("explore");
  };

  const handleUpdateAlias = (newAlias: string) => {
    setUser((prev) => ({ ...prev, anonymousAlias: newAlias }));
  };

  const handleUpdateLanguage = (newLang: Language) => {
    setLang(newLang);
    setUser((prev) => ({ ...prev, preferredLanguage: newLang }));
  };

  const handleSignOut = () => {
    setUser({
      isRegistered: false,
      anonymousAlias: generateAnonymousAlias(),
      preferredLanguage: "en"
    });
    setLang("en");
    setView("language_select");
    setSelectedConditionId(null);
  };

  // Navigating to direct education and symptom detail screen
  const handleSelectCondition = (conditionId: string) => {
    setSelectedConditionId(conditionId);
    setAiChatQuery(undefined);
    setView("condition_detail");
  };

  const handleOpenChat = () => {
    setAiChatQuery(undefined);
    setView("chat");
  };

  const handleOpenAnonymityGuide = () => {
    setView("anonymity_guide");
  };

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2D] font-sans overflow-x-hidden flex flex-col justify-between">
      {/* Dynamic Conditional Rendering */}
      <div className="flex-grow flex flex-col">
        <AnimatePresence mode="wait">
          {view === "splash" && (
            <motion.div 
              key="splash" 
              initial={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col"
            >
              <SplashScreen onComplete={() => setView("language_select")} />
            </motion.div>
          )}

          {view === "language_select" && (
            <motion.div 
              key="lang" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col"
            >
              <LanguageSelection onSelect={handleLanguageSelect} />
            </motion.div>
          )}

          {view === "register" && (
            <motion.div 
              key="reg" 
              initial={{ opacity: 0, scale: 0.99 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col"
            >
              <CreateAccount lang={lang} onSuccess={handleRegisterSuccess} defaultAlias={user.anonymousAlias} />
            </motion.div>
          )}

          {user.isRegistered && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-grow flex flex-col justify-between min-h-screen"
            >
              {/* Universal Polished Top App Bar identical to mockups */}
              <header className="fixed top-0 left-0 w-full z-45 flex justify-between items-center px-4 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
                <div 
                  onClick={() => {
                    setView("explore");
                    setSelectedConditionId(null);
                  }}
                  className="flex items-center gap-1.5 cursor-pointer active:scale-95 duration-200"
                >
                  <span className="material-symbols-outlined text-primary text-[28px]">medical_services</span>
                  <h1 className="font-bold text-lg text-primary tracking-tight font-headline">Health Anonymous</h1>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleOpenAnonymityGuide}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer ${
                      view === "anonymity_guide" 
                        ? "bg-teal-50 text-teal-700 border border-[#00685F]/20"
                        : "bg-slate-100 hover:bg-slate-200 text-primary"
                    }`}
                    title={isFr ? "Guide d'Anonymat" : "Anonymity Guide"}
                  >
                    <span className="material-symbols-outlined !text-sm">shield</span>
                    <span className="hidden sm:inline">{isFr ? "Confidentialité" : "Privacy Guide"}</span>
                  </button>

                  <button 
                    onClick={() => handleUpdateLanguage(lang === "en" ? "fr" : "en")}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-primary transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>EN/FR</span>
                  </button>
                </div>
              </header>

              {/* Central View Router */}
              <main className="flex-grow flex flex-col mb-12">
                {view === "explore" && (
                  <ExploreConditions 
                    lang={lang} 
                    onSelectCondition={handleSelectCondition} 
                    onOpenChat={handleOpenChat}
                    conditions={conditions}
                  />
                )}

                {view === "condition_detail" && selectedConditionId && (
                  <ConditionDetailView 
                    lang={lang}
                    conditionId={selectedConditionId}
                    onBack={() => setView("explore")}
                    onEnterSupportGroup={(id) => {
                      setSelectedConditionId(id);
                      setView("groups");
                    }}
                    onAskAI={(question) => {
                      setAiChatQuery(question);
                      setView("chat");
                    }}
                    conditions={conditions}
                  />
                )}

                {view === "anonymity_guide" && (
                  <AnonymityGuide 
                    lang={lang}
                    onBack={() => setView("explore")}
                  />
                )}

                 {view === "groups" && (
                  <SupportGroups 
                    lang={lang}
                    selectedConditionId={selectedConditionId}
                    onClearSelection={() => setSelectedConditionId(null)}
                    anonymousAlias={user.anonymousAlias}
                    conditions={conditions}
                    onOpenDirectChat={(peer) => {
                      setPrivateMessageTargetPeer(peer);
                      setView("direct_messages");
                    }}
                  />
                )}

                {view === "chat" && (
                  <AIChatView lang={lang} initialQuery={aiChatQuery} />
                )}

                {view === "medications" && (
                  <MedicationsView 
                    lang={lang} 
                    onBack={() => setView("explore")}
                    conditions={conditions}
                  />
                )}

                {view === "direct_messages" && (
                  <PrivateMessaging 
                    lang={lang} 
                    currentAlias={user.anonymousAlias} 
                    initialPeerAlias={privateMessageTargetPeer}
                    onBack={() => setView("groups")}
                  />
                )}

                {view === "notifications" && (
                  <NotificationsView 
                    lang={lang} 
                    onBack={() => {
                      setView("explore");
                      fetchUnreadNotifications();
                    }}
                  />
                )}

                {view === "profile" && (
                  <ProfileView 
                    lang={lang} 
                    user={user} 
                    onUpdateAlias={handleUpdateAlias} 
                    onUpdateLanguage={handleUpdateLanguage}
                    onSignOut={handleSignOut}
                    onEnterAdmin={() => setView("admin")}
                  />
                )}

                {view === "admin" && user.username?.toLowerCase() === "admin" && (
                  <AdminPanel 
                    lang={lang}
                    user={user}
                    onBack={() => setView("profile")}
                    onRefreshConditions={fetchConditions}
                  />
                )}
              </main>

              {/* Bottom Navigation Grid precisely styled matching Screen 3 mockup */}
              <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-1 py-2 pb-safe bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_20px_0px_rgba(30,41,59,0.04)] rounded-t-2xl">
                {/* Home tab button */}
                <button 
                  onClick={() => {
                    setView("explore");
                    setSelectedConditionId(null);
                  }}
                  className={`flex flex-col items-center justify-center transition-all duration-200 rounded-xl px-2 sm:px-4 py-1.5 cursor-pointer ${
                    view === "explore" 
                      ? "bg-teal-50 text-primary font-bold shadow-xs" 
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl sm:text-2xl mt-0.5">home</span>
                  <span className="text-[9px] sm:text-[10px] tracking-tight">{isFr ? "Accueil" : "Home"}</span>
                </button>

                {/* Groups forum tab button */}
                <button 
                  onClick={() => {
                    setView("groups");
                  }}
                  className={`flex flex-col items-center justify-center transition-all duration-200 rounded-xl px-2 sm:px-4 py-1.5 cursor-pointer ${
                    view === "groups" 
                      ? "bg-teal-50 text-primary font-bold shadow-xs" 
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl sm:text-2xl mt-0.5">group</span>
                  <span className="text-[9px] sm:text-[10px] tracking-tight">{isFr ? "Forums" : "Groups"}</span>
                </button>

                {/* Meds guide lookup index */}
                <button 
                  onClick={() => {
                    setView("medications");
                  }}
                  className={`flex flex-col items-center justify-center transition-all duration-200 rounded-xl px-2 sm:px-4 py-1.5 cursor-pointer ${
                    view === "medications" 
                      ? "bg-teal-50 text-primary font-bold shadow-xs" 
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl sm:text-2xl mt-0.5">pill</span>
                  <span className="text-[9px] sm:text-[10px] tracking-tight">{isFr ? "Médocs" : "Meds"}</span>
                </button>

                {/* Explore/Search Tab button strictly matching mock illustration styles */}
                <button 
                  onClick={() => {
                    setView("explore");
                    setSelectedConditionId(null);
                    setTimeout(() => {
                      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                      input?.focus();
                    }, 100);
                  }}
                  className={`flex flex-col items-center justify-center transition-all duration-200 rounded-xl px-2 sm:px-4 py-1.5 cursor-pointer ${
                    view === "explore" && document.activeElement?.tagName === "INPUT"
                      ? "bg-teal-600 text-white font-bold shadow-sm"
                      : "bg-teal-50 text-primary hover:bg-teal-100 font-bold shadow-xs"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl sm:text-2xl mt-0.5">search</span>
                  <span className="text-[9px] sm:text-[10px] tracking-tight">{isFr ? "Chercher" : "Search"}</span>
                </button>

                {/* AI Chat Bot assistant helper button */}
                <button 
                  onClick={() => {
                    setView("chat");
                  }}
                  className={`flex flex-col items-center justify-center transition-all duration-200 rounded-xl px-2 sm:px-4 py-1.5 cursor-pointer ${
                    view === "chat" 
                      ? "bg-teal-50 text-primary font-bold shadow-xs" 
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl sm:text-2xl mt-0.5">smart_toy</span>
                  <span className="text-[9px] sm:text-[10px] tracking-tight">{isFr ? "IA Chat" : "AI Chat"}</span>
                </button>

                {/* Private Direct Messages */}
                <button
                  onClick={() => {
                    setPrivateMessageTargetPeer(null);
                    setView("direct_messages");
                    setUnreadDmCount(0);
                    lastSeenDmCountRef.current = 0;
                  }}
                  className={`flex flex-col items-center justify-center transition-all duration-200 rounded-xl px-2 sm:px-4 py-1.5 cursor-pointer relative ${
                    view === "direct_messages"
                      ? "bg-teal-50 text-primary font-bold shadow-xs"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl sm:text-2xl mt-0.5">chat</span>
                  {unreadDmCount > 0 && (
                    <span className="absolute top-1 sm:top-1.5 right-1.5 sm:right-3 bg-primary text-white font-bold text-[8px] sm:text-[9px] h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border border-white">
                      {unreadDmCount}
                    </span>
                  )}
                  <span className="text-[9px] sm:text-[10px] tracking-tight">{isFr ? "Messages" : "DMs"}</span>
                </button>

                {/* Notifications count alerts */}
                <button 
                  onClick={() => {
                    setView("notifications");
                  }}
                  className={`flex flex-col items-center justify-center transition-all duration-200 rounded-xl px-2 sm:px-4 py-1.5 relative cursor-pointer ${
                    view === "notifications" 
                      ? "bg-teal-50 text-primary font-bold shadow-xs" 
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl sm:text-2xl mt-0.5">notifications</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1 sm:top-1.5 right-1.5 sm:right-3 bg-red-500 text-white font-bold text-[8px] sm:text-[9px] h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border border-white">
                      {unreadNotificationsCount}
                    </span>
                  )}
                  <span className="text-[9px] sm:text-[10px] tracking-tight">{isFr ? "Alertes" : "Inbox"}</span>
                </button>

                {/* Profile tab button */}
                <button 
                  onClick={() => {
                    setView("profile");
                  }}
                  className={`flex flex-col items-center justify-center transition-all duration-200 rounded-xl px-2 sm:px-4 py-1.5 cursor-pointer ${
                    view === "profile" 
                      ? "bg-teal-50 text-primary font-bold shadow-xs" 
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl sm:text-2xl mt-0.5">person</span>
                  <span className="text-[9px] sm:text-[10px] tracking-tight">{isFr ? "Profil" : "Profile"}</span>
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
