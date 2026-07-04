import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Language, Condition, GroupPost, GroupComment } from "../types";
import { canSubmitContent } from "../contentUtils";

interface SupportGroupsProps {
  lang: Language;
  selectedConditionId: string | null;
  onClearSelection: () => void;
  anonymousAlias: string;
  conditions: Condition[];
  onOpenDirectChat?: (peerAlias: string) => void;
}

export default function SupportGroups({ lang, selectedConditionId, onClearSelection, anonymousAlias, conditions, onOpenDirectChat }: SupportGroupsProps) {
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [comments, setComments] = useState<GroupComment[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(selectedConditionId);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImageUrl, setNewPostImageUrl] = useState<string | null>(null);
  const [selectedPostComments, setSelectedPostComments] = useState<string | null>(null);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [newCommentImageUrl, setNewCommentImageUrl] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [actionMenuPostId, setActionMenuPostId] = useState<string | null>(null);

  const isFr = lang === "fr";

  // Fetch posts for active group
  useEffect(() => {
    if (activeGroupId) {
      const url = `/api/posts?conditionId=${activeGroupId}` + 
        (anonymousAlias ? `&userAlias=${encodeURIComponent(anonymousAlias)}` : "");
      fetch(url)
        .then(res => res.json())
        .then(data => setPosts(data))
        .catch(err => console.error(err));
    }
  }, [activeGroupId, anonymousAlias]);

  // Fetch comments when comments view expands
  useEffect(() => {
    if (selectedPostComments) {
      fetch(`/api/comments?postId=${selectedPostComments}`)
        .then(res => res.json())
        .then(data => setComments(data))
        .catch(err => console.error(err));
    }
  }, [selectedPostComments]);

  // If a condition is toggled from outside (Explore via onSelectCondition)
  React.useEffect(() => {
    if (selectedConditionId) {
      setActiveGroupId(selectedConditionId);
    }
  }, [selectedConditionId]);

  const activeGroup = (conditions || []).find((c) => c.id === activeGroupId);
  const filteredPosts = posts; // Server returns filtered list by default

  const handleImageSelection = async (event: React.ChangeEvent<HTMLInputElement>, target: "post" | "comment") => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string | null;
      if (target === "post") {
        setNewPostImageUrl(result);
      } else {
        setNewCommentImageUrl(result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroupId || !canSubmitContent(newPostContent, newPostImageUrl)) return;

    const newPost: GroupPost = {
      id: `p-${Date.now()}`,
      conditionId: activeGroupId,
      authorAlias: anonymousAlias,
      content: newPostContent,
      timestamp: isFr ? "À l'instant" : "Just now",
      likes: 0,
      commentsCount: 0,
      status: "pending",
      imageUrl: newPostImageUrl || undefined
    };

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost)
      });
      if (res.ok) {
        const savedPost = { ...newPost, status: "pending" as const };
        setPosts((prev) => [savedPost, ...prev]);
        setNewPostContent("");
        setNewPostImageUrl(null);
        setSuccessMessage(
          isFr 
            ? "Votre publication a été transmise en toute sécurité et est en attente d'approbation d'un modérateur." 
            : "Your post has been securely submitted and is pending moderator clearance."
        );
        setTimeout(() => setSuccessMessage(""), 7000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!canSubmitContent(newCommentContent, newCommentImageUrl)) return;

    const newComm: GroupComment = {
      id: `c-${Date.now()}`,
      postId: postId,
      authorAlias: anonymousAlias,
      content: newCommentContent,
      timestamp: isFr ? "À l'instant" : "Just now",
      imageUrl: newCommentImageUrl || undefined
    };

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComm)
      });
      if (res.ok) {
        setComments((prev) => [...prev, newComm]);
        setNewCommentContent("");
        setNewCommentImageUrl(null);
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pt-24 pb-32 px-4 max-w-4xl mx-auto w-full font-sans">
      <AnimatePresence mode="wait">
        {!activeGroupId ? (
          // STATE 1: Support Groups Catalog Overview
          <motion.div
            key="overview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            <div className="text-center max-w-lg mx-auto mb-8">
              <h2 className="text-2xl font-bold text-gray-901 tracking-tight mb-2">
                {isFr ? "Groupes de Soutien Anonymes" : "Anonymous Support Groups"}
              </h2>
              <p className="text-sm text-gray-500">
                {isFr 
                  ? "Entrez dans des salons de discussion de confiance sécurisés où vous pouvez partager vos expériences sans crainte."
                  : "Enter safe, secure community rooms where you can share medical experiences and recipes with complete piece of mind."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(conditions || []).map((cond) => {
                const postCount = posts.filter((p) => p.conditionId === cond.id).length;
                return (
                  <button
                    key={cond.id}
                    onClick={() => setActiveGroupId(cond.id)}
                    className="flex flex-col items-start p-5 bg-white rounded-2xl border border-gray-100 hover:border-primary/20 shadow-xs hover:shadow-md transition-all text-left group cursor-pointer active:scale-99"
                  >
                    <div className="flex items-center gap-3 mb-4 w-full">
                      <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-primary text-xl flex-shrink-0">
                        <span className="material-symbols-outlined">{cond.icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors text-sm sm:text-base truncate">
                          {isFr ? cond.nameFr : cond.nameEn}
                        </h3>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cond.category}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
                      {isFr ? cond.descriptionFr : cond.descriptionEn}
                    </p>
                    <div className="flex items-center justify-between w-full mt-auto pt-3 border-t border-gray-50 text-[10px] text-gray-400 font-bold uppercase">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">forum</span>
                        <span>{12 + postCount} {isFr ? "LANCEMENTS" : "ACTIVE POSTS"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-primary hover:underline">
                        <span>{isFr ? "REJOINDRE" : "ENTER ROOM"}</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          // STATE 2: Specific Support Group Lobby Detail
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Nav back bar */}
            <button 
              onClick={() => {
                setActiveGroupId(null);
                onClearSelection();
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>{isFr ? "Retour aux groupes" : "Back to Groups"}</span>
            </button>

            {/* Support Group Title Block Header */}
            <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-xs">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-100/40 flex items-center justify-center text-primary text-2xl">
                  <span className="material-symbols-outlined">{activeGroup?.icon}</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 font-headline leading-tight">
                    {isFr ? activeGroup?.nameFr : activeGroup?.nameEn}
                  </h2>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-lg mt-1">
                    {isFr ? activeGroup?.descriptionFr : activeGroup?.descriptionEn}
                  </p>
                </div>
              </div>

              {/* Secure Identity Badge details */}
              <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap gap-2 items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-sm">vpn_key</span>
                  <span className="font-semibold">{isFr ? "Salon anonymisé" : "Anonymized Support Stream"}</span>
                </div>
                <div className="text-[11px] font-bold text-primary bg-teal-50 px-3 py-1 rounded-full">
                  {isFr ? "Postez en tant que : " : "Posting as: "}
                  <span className="underline font-bold text-teal-800">{anonymousAlias}</span>
                </div>
              </div>
            </div>

            {/* Form writing post Anonymous */}
            <form onSubmit={handleCreatePost} className="bg-white p-4 border border-teal-600/10 rounded-2xl shadow-xs space-y-3">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={isFr ? `Partagez vos conseils, recettes ou préoccupations de manière anonyme dans ce groupe...` : `Share advice, symptoms summaries or comfort anonymously in this room...`}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-gray-100 rounded-xl p-3 focus:ring-1 focus:ring-primary focus:border-primary outline-hidden min-h-[70px] resize-none"
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-transparent">
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-gray-600 cursor-pointer hover:bg-slate-100">
                    <span className="material-symbols-outlined text-sm">image</span>
                    <span>{isFr ? "Ajouter une image" : "Add image"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImageSelection(event, "post")} />
                  </label>
                  <p className="text-[10px] text-gray-400 leading-none">
                    🔐 {isFr ? "Votre adresse IP et votre e-mail sont totalement masqués." : "Your IP and primary credentials are never stored."}
                  </p>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-container transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  {isFr ? "Publier de manière anonyme" : "Post Anonymously"}
                </button>
              </div>
              {newPostImageUrl && (
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-slate-50 p-2">
                  <img src={newPostImageUrl} alt="Selected upload preview" className="max-h-32 w-full object-cover rounded-lg" />
                  <button type="button" onClick={() => setNewPostImageUrl(null)} className="mt-2 text-[10px] text-red-500 font-semibold cursor-pointer">
                    {isFr ? "Supprimer l'image" : "Remove image"}
                  </button>
                </div>
              )}
            </form>

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-50 border border-emerald-150 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs"
              >
                <span className="material-symbols-outlined text-emerald-600 text-lg">verified_user</span>
                <span>{successMessage}</span>
              </motion.div>
            )}

            {/* List of active room posts */}
            <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">
                {isFr ? "Discussions de la communauté" : "Active Discussions"}
              </h3>

              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => {
                  const postComments = comments.filter((c) => c.postId === post.id);
                  const showComments = selectedPostComments === post.id;

                  return (
                    <div 
                      key={post.id}
                      className={`bg-white border rounded-2xl p-5 shadow-[0px_2px_8px_rgba(15,23,42,0.015)] space-y-3 transition-colors ${post.status === "pending" ? "border-amber-200 bg-amber-50/5" : "border-gray-100 hover:border-teal-600/10"}`}
                    >
                      <div className="flex justify-between items-center text-xs text-gray-400 font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-gray-400">account_circle</span>
                          <span className="text-teal-700 font-bold">{post.authorAlias}</span>
                          {post.authorAlias === anonymousAlias && (
                            <span className="text-[9px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded-full uppercase font-bold text-[8px]">
                              {isFr ? "VOUS" : "YOU"}
                            </span>
                          )}
                          {post.status === "pending" && (
                            <span className="text-[8px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider flex items-center gap-0.5">
                              <span className="h-1 w-1 rounded-full bg-amber-500 animate-pulse"></span>
                              {isFr ? "En attente " : "Awaiting Approval"}
                            </span>
                          )}
                          {post.authorAlias !== anonymousAlias && post.status !== "pending" && (
                            <button
                              onClick={() => onOpenDirectChat?.(post.authorAlias)}
                              className="text-[10px] text-primary hover:text-teal-800 bg-teal-50/60 hover:bg-teal-50 px-2 py-0.5 rounded-md flex items-center gap-0.5 cursor-pointer font-bold transition-all"
                              title={isFr ? "Envoyer un message privé" : "Message Confidentially"}
                            >
                              <span className="material-symbols-outlined !text-[11px]">chat</span>
                              <span>{isFr ? "Message" : "PM"}</span>
                            </button>
                          )}
                        </div>
                        <span>{post.timestamp}</span>
                      </div>

                      {post.content && (
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed min-h-[30px] font-sans">
                          {post.content}
                        </p>
                      )}
                      {post.imageUrl && (
                        <div className="rounded-xl overflow-hidden border border-gray-200 bg-slate-50 p-2">
                          <img src={post.imageUrl} alt="Shared media" className="max-h-48 w-full object-cover rounded-lg" />
                        </div>
                      )}

                      {post.status === "approved" && post.authorAlias === anonymousAlias && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActionMenuPostId(actionMenuPostId === post.id ? null : post.id)}
                            className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1.5 text-[10px] font-semibold text-teal-700 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">swap_horiz</span>
                            <span>{isFr ? "Continuer" : "Continue"}</span>
                          </button>
                          {actionMenuPostId === post.id && (
                            <div className="absolute left-0 top-full mt-2 z-10 flex flex-col rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPostComments(post.id);
                                  setActionMenuPostId(null);
                                }}
                                className="rounded-lg px-3 py-2 text-left text-[10px] font-semibold text-gray-700 hover:bg-slate-50 cursor-pointer"
                              >
                                {isFr ? "Répondre publiquement" : "Reply publicly"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onOpenDirectChat?.(post.authorAlias);
                                  setActionMenuPostId(null);
                                }}
                                className="rounded-lg px-3 py-2 text-left text-[10px] font-semibold text-gray-700 hover:bg-slate-50 cursor-pointer"
                              >
                                {isFr ? "Passer en privé" : "Continue privately"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Interactive bar for post */}
                      <div className="pt-2 border-t border-gray-50 flex items-center gap-4 text-xs text-gray-500">
                        <button 
                          onClick={() => handleLikePost(post.id)}
                          className="flex items-center gap-1 hover:text-red-500 transition-colors cursor-pointer font-bold"
                        >
                          <span className="material-symbols-outlined text-sm fill-0">favorite</span>
                          <span>{post.likes}</span>
                        </button>
                        <button 
                          onClick={() => setSelectedPostComments(showComments ? null : post.id)}
                          className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer font-bold"
                        >
                          <span className="material-symbols-outlined text-sm">chat_bubble</span>
                          <span>{post.commentsCount || postComments.length}</span>
                        </button>
                      </div>

                      {/* Sub-Comments Segment when toggled open */}
                      {showComments && (
                        <div className="pt-3 border-t border-gray-50 bg-slate-50/50 p-3 rounded-xl space-y-3 mt-2 animate-in fade-in duration-300">
                          {postComments.length > 0 ? (
                            <div className="space-y-3">
                              {postComments.map((comm) => (
                                <div key={comm.id} className="text-xs space-y-1">
                                  <div className="flex justify-between items-center font-bold text-gray-500 text-[10px]">
                                    <div className="flex items-center gap-1">
                                      <span className="text-teal-700">{comm.authorAlias}</span>
                                      {comm.authorAlias !== anonymousAlias && (
                                        <button
                                          type="button"
                                          onClick={() => onOpenDirectChat?.(comm.authorAlias)}
                                          className="text-[9px] text-primary hover:text-teal-800 bg-white hover:bg-slate-100 px-1 py-0.2 rounded border border-gray-150 cursor-pointer ml-1 inline-flex items-center font-bold"
                                        >
                                          PM
                                        </button>
                                      )}
                                    </div>
                                    <span>{comm.timestamp}</span>
                                  </div>
                                  {comm.content && (
                                    <p className="text-gray-700 leading-relaxed text-xs">
                                      {comm.content}
                                    </p>
                                  )}
                                  {comm.imageUrl && (
                                    <div className="rounded-lg overflow-hidden border border-gray-200 bg-white p-1.5 mt-1">
                                      <img src={comm.imageUrl} alt="Reply media" className="max-h-32 w-full object-cover rounded-md" />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-gray-400 italic">
                              {isFr ? "Aucun commentaire encore. Soyez le premier à répondre !" : "No replies yet. Be the first to answer!"}
                            </p>
                          )}

                          {/* Write sub-comment reply */}
                          <form 
                            onSubmit={(e) => handleCreateComment(e, post.id)} 
                            className="flex items-center gap-2 mt-2"
                          >
                            <input
                              type="text"
                              value={newCommentContent}
                              onChange={(e) => setNewCommentContent(e.target.value)}
                              placeholder={isFr ? "Ajouter une réponse anonyme..." : "Add anonymous reply..."}
                              className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
                            />
                            <label className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 cursor-pointer">
                              <span className="material-symbols-outlined text-sm">image</span>
                              <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImageSelection(event, "comment")} />
                            </label>
                            <button
                              type="submit"
                              className="bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-primary-container transition-all cursor-pointer"
                            >
                              {isFr ? "Répondre" : "Reply"}
                            </button>
                          </form>
                          {newCommentImageUrl && (
                            <div className="mt-2 rounded-lg border border-gray-200 bg-white p-2">
                              <img src={newCommentImageUrl} alt="Selected reply preview" className="max-h-24 w-full object-cover rounded-md" />
                              <button type="button" onClick={() => setNewCommentImageUrl(null)} className="mt-1 text-[10px] text-red-500 font-semibold cursor-pointer">
                                {isFr ? "Supprimer l'image" : "Remove image"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                  <span className="material-symbols-outlined text-gray-300 text-4xl mb-2">chat_bubble_outline</span>
                  <p className="text-xs font-semibold text-gray-500">
                    {isFr ? "Aucune discussion n'a encore été ouverte dans ce groupe." : "No discussions have been opened yet in this room."}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
