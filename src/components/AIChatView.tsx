import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Language, Message } from "../types";

interface AIChatViewProps {
  lang: Language;
  initialQuery?: string;
}

export default function AIChatView({ lang, initialQuery }: AIChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      sender: "bot",
      text: lang === "fr" 
        ? "Bonjour ! Je suis votre assistant médical IA sécurisé et anonyme. De quoi aimeriez-vous discuter aujourd'hui ? Veuillez noter que je ne peux fournir que des informations éducatives."
        : "Hello! I am your secure, anonymous AI Medical Assistant. What health-related topics or symptoms would you like to explore today? Please remember I am here for educational purposes only.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isFr = lang === "fr";

  // Trigger initial queried consult if redirected from condition detail cards
  const initialRef = useRef(false);
  useEffect(() => {
    if (initialQuery && !initialRef.current) {
      initialRef.current = true;
      // Delay slightly to let the UI finish transition animations elegantly
      const timer = setTimeout(() => {
        handleSend(initialQuery);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [initialQuery]);

  // Auto-scroll on new message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Gather only user and model messages in clean structure
      const chatHistory = [...messages, userMsg].map((msg) => ({
        sender: msg.sender,
        text: msg.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory })
      });

      if (!res.ok) {
        throw new Error("Failed to contact secure pipeline");
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: "bot",
          text: data.text || (isFr ? "Je n'ai pas pu générer de réponse. Recommencez s'il vous plaît." : "I was unable to retrieve a response. Please try again."),
          timestamp: new Date()
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "bot",
          text: isFr 
            ? "Erreur de connexion avec le serveur de santé sécurisé. Veuillez réessayer." 
            : "Connection error with secure health servers. Please re-submit your concern.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  // Simple and bulletproof text formatter that turns markdown *bold* and lists into lists
  const formatText = (text: string) => {
    return text.split("\n").map((line, index) => {
      // Check for bullet list item
      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        const itemText = line.replace(/^[\s*-]+/, "");
        return (
          <li key={index} className="ml-4 list-disc text-xs sm:text-sm text-gray-700 leading-relaxed mb-1">
            {renderInlineMarkdown(itemText)}
          </li>
        );
      }
      
      // Typical paragraph
      if (!line.trim()) return <div key={index} className="h-2" />;
      return (
        <p key={index} className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-2">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  // Inline styling for bolding **text**
  const renderInlineMarkdown = (line: string) => {
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} className="font-bold text-gray-900">
          {match[1]}
        </strong>
      );
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return parts.length > 0 ? parts : line;
  };

  const suggestions = isFr 
    ? [
        "Quels sont les symptômes typiques du côlon irritable ?",
        "Existe-t-il un régime spécifique pour la maladie cœliaque ?",
        "Comment puis-je gérer mon niveau de cortisol naturellement ?"
      ]
    : [
        "What are typical symptoms of Crohn's disease?",
        "Is there a specific diet for gluten sensitivity?",
        "How often should an A1C test be scheduled?"
      ];

  return (
    <div className="pt-24 pb-32 px-4 max-w-4xl mx-auto w-full flex flex-col h-[calc(100vh-140px)] font-sans">
      {/* Interactive AI Chat Header with secure label */}
      <div className="bg-white border border-gray-150 p-4 rounded-t-2xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">smart_toy</span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">
              {isFr ? "Assistant Médical IA" : "Anonymous AI Assistant"}
            </h3>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 tracking-wider">SECURE ENDPOINT</span>
            </div>
          </div>
        </div>
        <div className="text-right text-[10px] text-gray-400 font-semibold bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
          {isFr ? "Anonymité totale" : "100% Secure & Private"}
        </div>
      </div>

      {/* Message pipeline container */}
      <div className="flex-1 bg-white border-x border-b border-gray-150 p-4 overflow-y-auto space-y-4">
        <AnimatePresence>
          {messages.map((msg) => {
            const isBot = msg.sender === "bot";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-[85%] ${isBot ? "mr-auto" : "ml-auto flex-row-reverse"}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-primary flex-shrink-0 self-start">
                    <span className="material-symbols-outlined text-base">smart_toy</span>
                  </div>
                )}
                <div 
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm ${
                    isBot 
                      ? "bg-slate-50/85 text-gray-700 rounded-tl-none border border-slate-100" 
                      : "bg-primary text-white rounded-tr-none shadow-sm"
                  }`}
                >
                  <div className="break-words font-sans">
                    {isBot ? formatText(msg.text) : <p className="leading-relaxed">{msg.text}</p>}
                  </div>
                  <span className={`block text-[9px] font-semibold mt-1.5 text-right ${isBot ? "text-gray-400" : "text-emerald-100"}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {isTyping && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex gap-3 mr-auto max-w-[80%]"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-primary flex-shrink-0 self-start">
                <span className="material-symbols-outlined text-base">smart_toy</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>

      {/* Suggested question prompts visible on empty screen interaction */}
      {messages.length < 3 && !isTyping && (
        <div className="mt-3 overflow-x-auto scrollbar-none py-1">
          <div className="flex gap-2 min-w-max px-1">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(sug)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-teal-50 hover:text-primary hover:border-teal-200 text-[11px] font-semibold text-gray-600 rounded-lg border border-slate-200 transition-all cursor-pointer text-left max-w-sm"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Secure bottom input row bar */}
      <div className="mt-3 bg-white p-3 border border-gray-150 rounded-2xl flex items-center gap-2 shadow-xs">
        <input 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(inputValue)}
          placeholder={isFr ? "Posez n'importe quelle question confidentielle..." : "Pose any confidential health question..."}
          className="flex-1 px-3 py-2 text-xs sm:text-sm bg-transparent border-none outline-hidden focus:outline-hidden focus:ring-0 text-gray-800"
          type="text"
          disabled={isTyping}
        />
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSend(inputValue)}
          disabled={!inputValue.trim() || isTyping}
          className={`px-4 py-2 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition-all cursor-pointer ${
            inputValue.trim() && !isTyping
              ? "bg-primary text-white hover:bg-primary-container"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          <span>{isFr ? "Envoyer" : "Ask"}</span>
          <span className="material-symbols-outlined text-base">send</span>
        </motion.button>
      </div>

      <div className="mt-2 text-center">
        <p className="text-[10px] text-gray-400 leading-normal italic px-4">
          {isFr 
            ? "Aide IA : Réponses éducatives immédiates. Toujours consulter un médecin pour les cas critiques." 
            : "AI Guidance: Immediate responsive teaching. Always seek formal diagnoses for clinical cases."}
        </p>
      </div>
    </div>
  );
}
