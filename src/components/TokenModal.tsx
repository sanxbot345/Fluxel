import React, { useState } from "react";
import { Key, Eye, EyeOff, Check, AlertCircle, ExternalLink } from "lucide-react";

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onSave: (newToken: string) => void;
}

export default function TokenModal({ isOpen, onClose, token, onSave }: TokenModalProps) {
  const [inputValue, setInputValue] = useState(token);
  const [showToken, setShowToken] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleValidateAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setIsSuccess(false);

    const trimmed = inputValue.trim();
    if (!trimmed) {
      setValidationError("Please enter a valid Vercel API token.");
      return;
    }

    setIsValidating(true);

    try {
      // Validate the token against Vercel Team/User API to make sure it functions!
      // This is dynamic real-world validation!
      const res = await fetch("https://api.vercel.com/v2/user", {
        headers: {
          Authorization: `Bearer ${trimmed}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || "Vercel rejected this API token. Please ensure it is active.");
      }

      // If valid, save it!
      onSave(trimmed);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 1500);
    } catch (err: any) {
      setValidationError(err.message || "Unable to authorize token with Vercel API.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Frosted glass backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Floating glass card container */}
      <div
        className="relative w-full max-w-md rounded-2xl liquid-glass-navbar p-6 md:p-8 animate-modal-entrance shadow-2xl"
        style={{
          boxShadow: "0 20px 50px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)",
          animation: "modalScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 mb-4 animate-pulse">
            <Key className="w-5 h-5" />
          </div>

          <h3 className="font-display text-2xl font-semibold tracking-tight text-white mb-2">
            Vercel Authorization
          </h3>
          <p className="text-sm font-sans text-stone-400 leading-relaxed mb-6">
            Enter your active Vercel Personal Access Token to unlock real cloud deployments. Your token is stored natively on your browser.
          </p>

          <form onSubmit={handleValidateAndSave} className="w-full">
            <div className="relative mb-4">
              <input
                type={showToken ? "text" : "password"}
                placeholder="vcp_xxxxxxxxxxxxxxxxxxxx"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full pl-4 pr-12 py-3.5 bg-stone-900/60 border border-stone-800 rounded-xl font-mono text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors focus:outline-none"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {validationError && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-rose-500/20 bg-rose-950/15 text-rose-400 text-xs text-left mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            {isSuccess && (
              <div className="flex items-center gap-2.5 p-3 rounded-lg border border-emerald-500/20 bg-emerald-950/15 text-emerald-400 text-xs text-left mb-4">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Token authorized & configured successfully.</span>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-stone-950/40 border border-white/5 hover:bg-stone-900/40 hover:border-white/10 rounded-xl text-stone-300 text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isValidating || isSuccess}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-stone-950 text-sm font-medium rounded-xl shadow-lg shadow-emerald-500/10 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-2"
              >
                {isValidating ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-stone-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Validating...
                  </>
                ) : (
                  "Save & Verify"
                )}
              </button>
            </div>
          </form>

          <a
            href="https://vercel.com/account/tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-400 transition-colors mt-6 font-sans group"
          >
            Get a Token from Vercel Account
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>

      <style>{`
        @keyframes modalScale {
          from {
            transform: scale(0.9) translateY(10px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
