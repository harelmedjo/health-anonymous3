import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Language, AppNotification } from "../types";

interface NotificationsViewProps {
  lang: Language;
  onBack: () => void;
}

export default function NotificationsView({ lang, onBack }: NotificationsViewProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const isFr = lang === "fr";

  const fetchNotifs = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/notifications/read", { method: "POST" });
      if (res.ok) {
        setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 pb-12 space-y-6">
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
              {isFr ? "Centre d'Alertes" : "Secure Activity Center"}
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              {isFr ? "Suivez les réponses à vos publications et les alertes du système" : "Real-time updates about forum posts, likes, replies and system health"}
            </p>
          </div>
        </div>
        
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={markAllRead}
            className="px-3 py-1.5 bg-primary/5 hover:bg-primary/10 text-primary rounded-full text-xs font-bold transition-colors cursor-pointer"
          >
            {isFr ? "Tout marquer comme lu" : "Mark all as read"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">
          <span className="material-symbols-outlined animate-spin">autorenew</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-16 bg-white rounded-2xl border border-slate-100 text-center space-y-2">
          <span className="material-symbols-outlined text-4xl text-slate-300">notifications_off</span>
          <p className="text-sm font-semibold text-slate-700">
            {isFr ? "Aucune notification" : "All caught up!"}
          </p>
          <p className="text-xs text-slate-400">
            {isFr ? "Vous n'avez pas de nouveaux messages ou avis." : "Activity notifications will appear confidential here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              key={n.id}
              className={`p-4 rounded-xl border transition-all flex gap-3.5 ${
                n.isRead
                  ? "bg-white border-slate-100/80 text-slate-700"
                  : "bg-emerald-50/10 border-emerald-200/50 text-slate-900 shadow-xs"
              }`}
            >
              <div className={`p-2 rounded-full self-start ${
                n.isRead ? "bg-slate-50 text-slate-400" : "bg-emerald-50 text-emerald-600"
              }`}>
                <span className="material-symbols-outlined text-md">
                  {n.isRead ? "notifications_active" : "notifications_unread"}
                </span>
              </div>
              <div className="space-y-1 flex-grow">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xs">
                    {isFr ? n.titleFr : n.titleEn}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                </div>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  {isFr ? n.contentFr : n.contentEn}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
