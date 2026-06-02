import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Language } from "../types";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "danger" | "warning" | "info";
  lang: Language;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  type = "danger",
  lang,
}: ConfirmationModalProps) {
  const isFr = lang === "fr";

  // Default labels if not provided
  const resolvedConfirmLabel = confirmLabel || (type === "danger" 
    ? (isFr ? "Confirmer" : "Confirm Delete") 
    : (isFr ? "Confirmer" : "Confirm"));
    
  const resolvedCancelLabel = cancelLabel || (isFr ? "Annuler" : "Cancel");

  // Type specific style config
  const typeConfig = {
    danger: {
      accentColor: "text-red-600 bg-red-50 border-red-100",
      accentIcon: "warning",
      confirmBtn: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    },
    warning: {
      accentColor: "text-amber-600 bg-amber-50 border-amber-100",
      accentIcon: "gavel",
      confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500",
    },
    info: {
      accentColor: "text-primary bg-emerald-50 border-emerald-100",
      accentIcon: "info",
      confirmBtn: "bg-primary hover:bg-primary-dark text-white focus:ring-primary",
    },
  };

  const config = typeConfig[type] || typeConfig.danger;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop with fade-in */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            id="confirmation-modal-backdrop"
          />

          {/* Modal dialogue box with scale-up */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden z-10"
            id="confirmation-modal-content"
          >
            {/* Top design header accent */}
            <div className={`h-1.5 w-full ${type === 'danger' ? 'bg-red-500' : type === 'warning' ? 'bg-amber-500' : 'bg-primary'}`} />

            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Accent Icon Circle */}
                <div className={`p-3 rounded-full border shrink-0 flex items-center justify-center ${config.accentColor}`}>
                  <span className="material-symbols-outlined text-2xl">{config.accentIcon}</span>
                </div>

                {/* Text Context */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight leading-6">
                    {title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    {message}
                  </p>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end items-center gap-2.5">
                <button
                  id="confirmation-modal-cancel-btn"
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 rounded-full border border-slate-200/60 transition-colors cursor-pointer text-center"
                >
                  {resolvedCancelLabel}
                </button>
                <button
                  id="confirmation-modal-confirm-btn"
                  type="button"
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`w-full sm:w-auto px-6 py-2 text-xs font-bold rounded-full shadow-sm transition-all text-center cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-offset-2 ${config.confirmBtn}`}
                >
                  {resolvedConfirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
