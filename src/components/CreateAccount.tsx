import React, { useState } from "react";
import { motion } from "motion/react";
import { Language } from "../types";
import { generateAnonymousAlias } from "../data";

interface CreateAccountProps {
  lang: Language;
  onSuccess: (username: string, anonymousAlias?: string) => void;
  defaultAlias?: string;
}

export default function CreateAccount({ lang, onSuccess, defaultAlias }: CreateAccountProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMess, setErrorMess] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(false);

  const isFr = lang === "fr";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMess("");

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setErrorMess(isFr ? "Veuillez entrer un email ou un nom d'utilisateur." : "Please enter an email or username.");
      return;
    }

    if (!isLoginMode && (trimmedUsername.toLowerCase() === "admin" || trimmedUsername.toLowerCase() === "administrator")) {
      setErrorMess(isFr 
        ? "Politique de sécurité : Le mot 'admin' est réservé. Un seul administrateur est autorisé dans ce système." 
        : "Security policy: The username 'admin' is reserved. Exactly one administrator is allowed in the entire system.");
      return;
    }

    if (!isLoginMode && password.length < 8) {
      setErrorMess(isFr ? "Le mot de passe doit contenir au moins 8 caractères." : "Password must be at least 8 characters.");
      return;
    }

    if (!isLoginMode) {
      if (password !== confirmPassword) {
        setErrorMess(isFr ? "Les mots de passe ne correspondent pas." : "Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      if (isLoginMode) {
        // Log in an existing user
        const res = await fetch("/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: trimmedUsername, password })
        });
        const data = await res.json();
        setLoading(false);
        if (res.ok) {
          onSuccess(data.username, data.anonymousAlias);
        } else {
          setErrorMess(
            isFr 
              ? "Identifiants de connexion invalides. Veuillez vérifier votre nom d'utilisateur et mot de passe." 
              : data.error || "Invalid username or password credentials."
          );
        }
      } else {
        // Register a new user
        const anonAlias = defaultAlias || generateAnonymousAlias();
        const res = await fetch("/api/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: trimmedUsername, password, anonymousAlias: anonAlias })
        });
        const data = await res.json();
        setLoading(false);
        if (res.ok) {
          onSuccess(data.username, data.anonymousAlias);
        } else {
          setErrorMess(
            isFr 
              ? "Ce nom d'utilisateur est déjà enregistré. Veuillez vous connecter." 
              : data.error || "Username is already registered. Please sign in instead."
          );
        }
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMess(isFr ? "Erreur de connexion. Veuillez réessayer." : "Connection error. Please try again.");
    }
  };

  const handleSocialSelect = async (provider: string) => {
    setLoading(true);
    const socialUsername = `${provider}User_${Math.floor(Math.random() * 899) + 100}`;
    const socialPassword = `SocialSecure992_${provider}`;
    try {
      const anonAlias = defaultAlias || generateAnonymousAlias();
      // Try to register the user
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: socialUsername, password: socialPassword, anonymousAlias: anonAlias })
      });
      if (res.ok) {
        const data = await res.json();
        onSuccess(data.username, data.anonymousAlias);
      } else {
        // Try logging them in
        const loginRes = await fetch("/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: socialUsername, password: socialPassword })
        });
        if (loginRes.ok) {
          const data = await loginRes.json();
          onSuccess(data.username, data.anonymousAlias);
        } else {
          onSuccess(socialUsername, anonAlias);
        }
      }
    } catch {
      onSuccess(socialUsername, generateAnonymousAlias());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col justify-between pt-16 pb-8 px-4 max-w-lg mx-auto w-full min-h-screen">
      {/* Top App Bar template */}
      <header className="fixed top-0 left-0 w-full z-10 flex justify-between items-center px-4 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-1.5 cursor-pointer active:scale-95 duration-200">
          <span className="material-symbols-outlined text-primary text-[28px]">medical_services</span>
          <h1 className="font-bold text-lg text-primary tracking-tight">Health Anonymous</h1>
        </div>
        <button className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-primary transition-colors">
          EN/FR
        </button>
      </header>

      {/* Main Contents */}
      <main className="flex-grow flex flex-col items-center justify-center py-8">
        <motion.div 
          className="w-full text-center space-y-2 mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 font-headline tracking-tight">
            {isLoginMode 
              ? (isFr ? "Se connecter" : "Sign In to Account")
              : (isFr ? "Créer un compte" : "Create an Account")
            }
          </h2>
          <p className="text-sm text-gray-500 font-sans">
            {isLoginMode
              ? (isFr ? "Accédez de manière sécurisée à votre tableau de bord." : "Access your secure workspace and discussions.")
              : (isFr ? "Rejoignez notre communauté de santé anonyme et sûre." : "Join our safe, anonymous health community.")
            }
          </p>
        </motion.div>

        {/* Outer Card strictly styled to mockup instructions */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full bg-white rounded-2xl p-6 border border-gray-100 shadow-[0px_10px_30px_rgba(30,41,59,0.04)]"
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Identity input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 block ml-1" htmlFor="identity">
                {isFr ? "E-mail ou nom d'utilisateur" : "Email or Username"}
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  person
                </span>
                <input 
                  id="identity" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yourname@example.com"
                  className="w-full h-12 pl-12 pr-4 bg-slate-50/50 rounded-xl border border-gray-200/80 focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary transition-all text-sm placeholder:text-gray-400" 
                  type="text" 
                  required
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 block ml-1" htmlFor="password">
                {isFr ? "Mot de passe" : "Password"}
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  lock
                </span>
                <input 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full h-12 pl-12 pr-12 bg-slate-50/50 rounded-xl border border-gray-200/80 focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary transition-all text-sm placeholder:text-gray-400" 
                  type={showPassword ? "text" : "password"} 
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password input */}
            {!isLoginMode && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 block ml-1" htmlFor="confirm_password">
                  {isFr ? "Confirmer le mot de passe" : "Confirm Password"}
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                    security
                  </span>
                  <input 
                    id="confirm_password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full h-12 pl-12 pr-4 bg-slate-50/50 rounded-xl border border-gray-200/80 focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary transition-all text-sm placeholder:text-gray-400" 
                    type="password" 
                    required
                  />
                </div>
              </div>
            )}

            {errorMess && (
              <p className="text-xs text-red-500 font-semibold text-center mt-1">
                {errorMess}
              </p>
            )}

            {/* Submitting button */}
            <motion.button 
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-container transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">autorenew</span>
              ) : (
                isLoginMode 
                  ? (isFr ? "Se connecter" : "Sign In")
                  : (isFr ? "Créer un compte" : "Create Account")
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200/60"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400 font-medium uppercase tracking-wider text-[10px]">
                {isFr ? "ou continuer avec" : "or continue with"}
              </span>
            </div>
          </div>

          {/* Social login grid */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialSelect("Google")}
              className="flex items-center justify-center gap-2 h-11 rounded-full border border-gray-200/85 hover:bg-slate-50 text-xs font-semibold text-gray-700 transition-colors cursor-pointer active:scale-95 duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialSelect("Apple")}
              className="flex items-center justify-center gap-2 h-11 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer active:scale-95 duration-200"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 814 1000" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105.9-57.9-155.7-127.4C46.8 790.2 0 663.8 0 541.8c0-207.4 135.4-316.9 269-316.9 70.3 0 128.8 46.4 173 46.4 42.4 0 109.2-49.1 189.2-49.1 30.3 0 130.3 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
              </svg>
              <span>Apple</span>
            </button>
          </div>

          {/* Bottom redirection Link */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              {isLoginMode ? (
                <>
                  {isFr ? "Nouveau sur l'application ?" : "New to the app?"}
                  <button 
                    type="button"
                    onClick={() => {
                      setIsLoginMode(false);
                      setErrorMess("");
                    }}
                    className="text-primary font-bold hover:underline ml-1 cursor-pointer bg-transparent border-none"
                  >
                    {isFr ? "Créer un compte" : "Create Account"}
                  </button>
                </>
              ) : (
                <>
                  {isFr ? "Vous avez déjà un compte ?" : "Already have an account?"}
                  <button 
                    type="button"
                    onClick={() => {
                      setIsLoginMode(true);
                      setErrorMess("");
                    }}
                    className="text-primary font-bold hover:underline ml-1 cursor-pointer bg-transparent border-none"
                  >
                    {isFr ? "Se connecter" : "Sign In"}
                  </button>
                </>
              )}
            </p>
          </div>
        </motion.div>

        {/* Security / trust claims */}
        <div className="flex items-center justify-center gap-4 py-4 mt-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="material-symbols-outlined text-emerald-600 text-lg">encrypted</span>
            <span>{isFr ? "Chiffrement de bout en bout" : "End-to-End Encrypted"}</span>
          </div>
          <div className="w-px h-3 bg-gray-200"></div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="material-symbols-outlined text-emerald-600 text-lg">hide_source</span>
            <span>{isFr ? "Vie privée garantie" : "Privacy Guaranteed"}</span>
          </div>
        </div>
      </main>

      {/* Styled mockup Medical Disclaimer footer */}
      <footer className="w-full py-6 mt-6 border-t border-gray-100 bg-slate-50 rounded-xl text-center">
        <div className="max-w-2xl mx-auto px-4">
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            {isFr 
              ? "Avertissement médical : Les informations fournies le sont uniquement à des fins éducatives et ne constituent pas un avis professionnel. Veuillez consulter un professionnel de la santé qualifié."
              : "Medical Disclaimer: Information provided is for educational purposes only and not professional advice. Please consult with a qualified healthcare provider for medical concerns."}
          </p>
          <div className="flex justify-center gap-5 text-[11px] font-semibold text-gray-500">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Anonymity Guide</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
