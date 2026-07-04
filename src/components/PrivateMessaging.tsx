import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Language, PrivateMessage, DirectChat } from "../types";

interface PrivateMessagingProps {
  lang: Language;
  currentAlias: string;
  initialPeerAlias?: string | null;
  onBack: () => void;
}

export default function PrivateMessaging({ lang, currentAlias, initialPeerAlias, onBack }: PrivateMessagingProps) {
  const [chats, setChats] = useState<DirectChat[]>([]);
  const [activePeer, setActivePeer] = useState<string | null>(initialPeerAlias || null);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [text, setText] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [attachedMediaUrl, setAttachedMediaUrl] = useState<string | null>(null);

  const isFr = lang === "fr";
  const chatEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Suggested bilingual quick responses
  const QUICK_RESPONSES = isFr 
    ? ["Merci pour ton partage d'expérience.", "Est-ce que ton médecin t'a conseillé cela ?", "C'est difficile, je te soutiens !", "Comment te sens-tu aujourd'hui ?"]
    : ["Thank you for sharing your experience.", "Did your physician recommend that?", "I completely understand what you are going through.", "How are you holding up today?"];

  // Fetch conversations directory list
  const fetchChats = async () => {
    try {
      const res = await fetch(`/api/chats?alias=${currentAlias}`);
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
      setLoadingChats(false);
    } catch {
      setLoadingChats(false);
    }
  };

  // Fetch messages between currentAlias and activePeer
  const fetchMessages = async (peer: string) => {
    setLoadingMsgs(true);
    try {
      const res = await fetch(`/api/messages?user=${currentAlias}&peer=${peer}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
      setLoadingMsgs(false);
    } catch {
      setLoadingMsgs(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [currentAlias]);

  useEffect(() => {
    if (activePeer) {
      fetchMessages(activePeer);
      setIsBlocked(false);
      setIsReported(false);

      // Poll for new messages every 4 seconds so both sides see updates in real time
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => fetchMessages(activePeer), 4000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activePeer]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (contentToSend: string) => {
    if (!activePeer || !contentToSend.trim()) return;

    const mockId = Math.floor(Math.random() * 1000000).toString();
    const chatUnionId = `${currentAlias}_${activePeer}`;

    const newMsg: PrivateMessage = {
      id: mockId,
      chatId: chatUnionId,
      senderAlias: currentAlias,
      recipientAlias: activePeer,
      content: contentToSend,
      timestamp: isFr ? "À l'instant" : "Just now",
      mediaUrl: attachedMediaUrl || undefined
    };

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsg)
      });
      
      if (res.ok) {
        setMessages((prev) => [...prev, newMsg]);
        setText("");
        setAttachedMediaUrl(null);
        await fetchChats();
      } else {
        const errData = await res.json();
        alert(errData.error || "Delivery blocked.");
      }
    } catch {
      alert("Error reaching messaging server.");
    }
  };

  const handleBlockUser = async () => {
    if (!activePeer) return;
    try {
      const res = await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blocking: currentAlias,
          blocked: activePeer
        })
      });
      if (res.ok) {
        setIsBlocked(true);
        setShowBlockDialog(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReportUser = async () => {
    if (!activePeer) return;
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "r-" + Math.floor(Math.random() * 90000),
          titleEn: `Abuse Report against ${activePeer}`,
          titleFr: `Signalement d'abus contre ${activePeer}`,
          contentEn: `User ${currentAlias} reported peer ${activePeer} for inappropriate postings. Moderator evaluation requested.`,
          contentFr: `L'utilisateur ${currentAlias} a signalé ${activePeer} pour contenu abusif. Examen requis.`,
          timestamp: "Just now",
          isRead: false
        })
      });
      setIsReported(true);
      setShowReportDialog(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedMediaUrl(reader.result as string | null);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-12">
      {/* Upper header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary">chat_bubble</span>
              <span>{isFr ? "Messages Sécurisés" : "Confidential Direct Chat"}</span>
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              {isFr ? "Messages cryptés et anonymes de pair-à-pair" : "End-to-end masked peer-to-peer discussions"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{isFr ? "Canal Chiffré" : "Secure Node Active"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.02)] min-h-[550px]">
        
        {/* Left Side: Direct Chats index */}
        <div className="col-span-1 border-r border-slate-100 p-4 flex flex-col space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {isFr ? "Discussions actives" : "Active Discussions"}
          </h3>

          {loadingChats ? (
            <div className="py-12 text-center text-slate-400">
              <span className="material-symbols-outlined animate-spin">autorenew</span>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex-grow flex flex-col justify-center items-center text-center p-6 space-y-2">
              <span className="material-symbols-outlined text-themegray-light text-2xl">forum</span>
              <p className="text-xs font-medium text-slate-700">
                {isFr ? "Aucune conversation" : "No peer sessions yet"}
              </p>
              <p className="text-[10px] text-slate-400 leading-relaxed max-w-[180px]">
                {isFr ? "Appuyez sur le bouton « Message » à côté de l'alias d'un utilisateur dans un groupe de soutien pour démarrer une conversation privée." : "Tap the \"PM\" button next to any user's alias inside a support group to start a private conversation."}
              </p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-[400px]">
              {chats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActivePeer(c.peerAlias)}
                  className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                    activePeer === c.peerAlias
                      ? "bg-primary/5 border-l-4 border-l-primary px-4 bg-slate-50"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-slate-400">person</span>
                      <span>{c.peerAlias}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate max-w-[150px] font-sans">
                      {c.lastMessage}
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">{c.timestamp}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Active conversation stream */}
        <div className="col-span-1 md:col-span-2 flex flex-col bg-slate-50/30">
          {activePeer ? (
            <div className="flex-grow flex flex-col justify-between h-full">
              
              {/* Active Header & Safety Actions Toolbar */}
              <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-bold text-slate-800 text-sm">{activePeer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowReportDialog(true)}
                    className="p-1 px-2.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">flag</span>
                    <span>{isFr ? "Signaler" : "Report Anonymously"}</span>
                  </button>
                  <button 
                    onClick={() => setShowBlockDialog(true)}
                    className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">block</span>
                    <span>{isFr ? "Bloquer" : "Block User"}</span>
                  </button>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-grow p-4 overflow-y-auto space-y-4 max-h-[350px]">
                {loadingMsgs ? (
                  <div className="py-20 text-center text-slate-400">
                    <span className="material-symbols-outlined animate-spin text-xl">autorenew</span>
                  </div>
                ) : isBlocked ? (
                  <div className="py-12 text-center text-red-500 bg-red-50 rounded-xl max-w-md mx-auto p-4 space-y-1">
                    <span className="material-symbols-outlined text-3xl">block</span>
                    <h4 className="font-bold text-xs">{isFr ? "Utilisateur Bloqué" : "Peer Session Has Terminated"}</h4>
                    <p className="text-[11px] leading-relaxed">
                      {isFr ? "Vous avez bloqué cet utilisateur. Aucune communication n'est possible." : "You have initiated a secure blockage on this peer alias."}
                    </p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 text-xs">
                    {isFr ? "Début de la conversation sécurisée." : "No prior messages. Ask a secure question below."}
                  </div>
                ) : (
                  <>
                    {messages.map((m) => {
                      const isMe = m.senderAlias === currentAlias;
                      return (
                        <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`p-3 rounded-2xl max-w-sm space-y-1.5 shadow-xs ${
                            isMe ? "bg-primary text-white rounded-tr-xs" : "bg-white text-slate-800 rounded-tl-xs border border-slate-100"
                          }`}>
                            <p className="text-xs font-sans leading-relaxed break-words">{m.content}</p>
                            {m.mediaUrl && (
                              <div className="rounded-xl overflow-hidden max-w-[200px] border border-slate-200">
                                <img src={m.mediaUrl} alt="Confidential upload" referrerPolicy="no-referrer" className="w-full object-cover h-32" />
                              </div>
                            )}
                            <div className="flex justify-between items-center text-[9px] gap-4 opacity-70">
                              <span>{m.senderAlias}</span>
                              <span>{m.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Suggestions / Pre-Made quick responses widget */}
              {!isBlocked && (
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
                  {QUICK_RESPONSES.map((qr) => (
                    <button
                      key={qr}
                      onClick={() => handleSendMessage(qr)}
                      className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-600 rounded-full text-[10px] font-medium border border-slate-200 cursor-pointer whitespace-nowrap transition-colors"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              )}

              {/* Active message input toolbar */}
              {!isBlocked && (
                <div className="p-3 bg-white border-t border-slate-100">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage(text);
                    }}
                    className="flex items-center gap-2"
                  >
                    <label className={`w-9.5 h-9.5 flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                      attachedMediaUrl ? "bg-yellow-50 text-yellow-600" : "bg-slate-50 hover:bg-slate-100 text-slate-500"
                    }`}>
                      <span className="material-symbols-outlined text-lg">
                        {attachedMediaUrl ? "image" : "attach_file"}
                      </span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageSelection} />
                    </label>

                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={isFr ? "Écrire un message chiffré..." : "Write end-to-end encrypted message..."}
                      className="flex-grow h-10 px-3 bg-slate-50/50 rounded-xl border border-slate-200 focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary text-xs font-sans"
                    />

                    <button
                      type="submit"
                      disabled={!text.trim() && !attachedMediaUrl}
                      className="w-10 h-10 bg-primary hover:bg-primary-container text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">send</span>
                    </button>
                  </form>
                  {attachedMediaUrl && (
                    <div className="mt-2 flex items-center justify-between p-2 bg-yellow-50/50 border border-yellow-100 rounded-lg text-[10px] text-yellow-800">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">photo</span>
                        <span>{isFr ? "Image cryptée jointe" : "Encrypted image attached"}</span>
                      </span>
                      <button onClick={() => setAttachedMediaUrl(null)} className="text-red-500 font-bold hover:underline cursor-pointer">
                        {isFr ? "Supprimer" : "Remove"}
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="flex-grow flex flex-col justify-center items-center text-center p-12 space-y-3">
              <span className="material-symbols-outlined text-5xl text-slate-300">chat</span>
              <p className="text-sm font-semibold text-slate-600">
                {isFr ? "Sélectionnez une session de chat" : "CONFIDENTIAL LOCKBOX"}
              </p>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed font-sans">
                {isFr ? "Sélectionnez un utilisateur à gauche pour commencer à lui écrire en direct ou visitez un groupe de soutien." : "Direct messaging is fully sanitized and encrypted. To initiate a secure chat session, tap an alias name inside any support forum group."}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Block Confirmation Dialog */}
      <AnimatePresence>
        {showBlockDialog && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xl max-w-sm w-full space-y-4"
            >
              <div className="flex gap-3 items-start">
                <div className="p-2.5 bg-red-50 text-red-600 rounded-full">
                  <span className="material-symbols-outlined text-xl">block</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {isFr ? `Bloquer ${activePeer} ?` : `Block ${activePeer}?`}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans mt-1">
                    {isFr 
                      ? "Cela fermera immédiatement la session de chat. Cet utilisateur ne pourra plus vous contacter."
                      : "This will terminate the chat channel instantly. This alias will no longer be able to transmit direct messages to you."}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 text-xs font-semibold pt-2">
                <button 
                  onClick={() => setShowBlockDialog(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {isFr ? "Annuler" : "Cancel"}
                </button>
                <button 
                  onClick={handleBlockUser}
                  className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 cursor-pointer"
                >
                  {isFr ? "Bloquer" : "Authorize Block"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Abuse Report Confirmation Dialog */}
      <AnimatePresence>
        {showReportDialog && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xl max-w-sm w-full space-y-4"
            >
              <div className="flex gap-3 items-start">
                <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-full">
                  <span className="material-symbols-outlined text-xl">flag</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {isFr ? "Signaler un abus anonyme ?" : "Anonymously Report Abuse?"}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans mt-1">
                    {isFr 
                      ? "Soumettez cet alias et ses messages récents aux administrateurs pour non-respect de la charte de comportement."
                      : "Submit this peer alias and a log slice to system moderators for violations of community guidelines."}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 text-xs font-semibold pt-2">
                <button 
                  onClick={() => setShowReportDialog(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {isFr ? "Annuler" : "Cancel"}
                </button>
                <button 
                  onClick={handleReportUser}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-full hover:bg-yellow-700 cursor-pointer"
                >
                  {isFr ? "Transmettre le signalement" : "Transmit Anonymous Report"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Toast Notification */}
      <AnimatePresence>
        {isReported && (
          <div className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-xl shadow-lg text-xs leading-relaxed max-w-xs z-50 flex items-center gap-2">
            <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
            <p>
              {isFr 
                ? "Signalement reçu. Nos administrateurs examineront la session dans un délai de 24 heures."
                : "Report transmitted. System operators will evaluate the peer chat log within 24 hours."}
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
