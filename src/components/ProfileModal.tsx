import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, User as UserIcon, Calendar, Mail, Check, RefreshCw } from "lucide-react";
import { useAuthStore } from "../store/authStore";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  addToast: (message: string, type: "success" | "error" | "info") => void;
}

export default function ProfileModal({ isOpen, onClose, addToast }: ProfileModalProps) {
  const { profile, updateUserProfile, isLoading } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [seed, setSeed] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      // Try to extract seed from existing URL or fallback
      const url = profile.avatarUrl || "";
      const match = url.match(/seed=([^&]+)/);
      setSeed(match ? decodeURIComponent(match[1]) : profile.uid);
      setAvatarUrl(url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.uid}`);
    }
  }, [profile, isOpen]);

  if (!isOpen || !profile) return null;

  // Real-time generator of Dicebear adventurer avatar based on seed
  const generateNewAvatar = () => {
    const randomWords = [
      "Stellar", "Quantum", "Shadow", "Pristine", "Neon", "Cyber", "Enigma", "Galaxy", 
      "Vortex", "Fluxel", "Beacon", "Alpha", "Zenith", "Aether", "Cosmos", "Summit"
    ];
    const newSeed = `${randomWords[Math.floor(Math.random() * randomWords.length)]}${Math.floor(Math.random() * 1000)}`;
    setSeed(newSeed);
    setAvatarUrl(`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(newSeed)}`);
  };

  const handleSeedChange = (val: string) => {
    setSeed(val);
    setAvatarUrl(`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(val)}`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 2) {
      addToast("Full name must be at least 2 characters.", "error");
      return;
    }

    try {
      await updateUserProfile(fullName, avatarUrl);
      addToast("Profile successfully synchronized!", "success");
      onClose();
    } catch {
      addToast("Failed to update profile settings.", "error");
    }
  };

  // Format date readable
  const formattedDate = profile.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString(undefined, { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      })
    : "Recently";

  return (
    <AnimatePresence>
      <div id="profile-modal-root" className="fixed inset-0 z-[2200] flex items-center justify-center p-4">
        {/* Semi-transparent Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Sheet panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0d0d0f]/90 shadow-2xl p-6 sm:p-8 overflow-hidden backdrop-blur-xl"
          style={{
            boxShadow: "0 30px 80px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.1)"
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center text-blue-400 font-bold shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-white text-base tracking-wide leading-tight">
                  User Account Profile
                </h3>
                <span className="text-[10px] font-mono text-stone-500 tracking-wider uppercase">Personal Settings Dashboard</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-stone-900 border border-white/5 hover:bg-stone-850 text-stone-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* User Avatar Customizer with Animation */}
            <div className="flex flex-col items-center justify-center gap-4 py-4 px-6 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="relative group">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="relative w-20 h-20 rounded-full border-2 border-white/10 bg-stone-900 p-0.5 object-cover shrink-0"
                />
                <button
                  type="button"
                  onClick={generateNewAvatar}
                  className="absolute bottom-0 right-0 p-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title="Randomize Avatar seed"
                >
                  <RefreshCw className="w-3 h-3 animate-spin duration-1000" style={{ animationIterationCount: "1" }} />
                </button>
              </div>

              {/* Seed Editor Input */}
              <div className="w-full space-y-1">
                <label className="text-[10px] font-mono font-medium tracking-wider text-stone-500 uppercase text-center block">Avatar Generator Seed</label>
                <input
                  type="text"
                  value={seed}
                  placeholder="custom-avatar-tag"
                  onChange={(e) => handleSeedChange(e.target.value)}
                  className="w-full text-center py-1.5 px-3 bg-black/30 border border-white/5 focus:border-blue-500/30 rounded-lg text-xs font-mono text-stone-300 outline-none transition-all placeholder:text-stone-700"
                />
              </div>
            </div>

            {/* Account Details */}
            <div className="space-y-4">
              {/* Full Name input */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-medium tracking-wider text-stone-400 uppercase block">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  required
                  placeholder="John Doe"
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-black/30 hover:bg-black/40 focus:bg-black/50 border border-white/5 focus:border-blue-500/40 rounded-xl text-white outline-none transition-all"
                />
              </div>

              {/* Email (Readonly) */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-medium tracking-wider text-stone-400 uppercase block">Email Address (Read-only)</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-900 border border-white/5 rounded-xl text-stone-500 outline-none cursor-not-allowed select-none"
                  />
                </div>
              </div>

              {/* Metadata details */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-stone-900/40 border border-white/5 rounded-xl text-[11px] font-mono text-stone-400">
                <Calendar className="w-3.5 h-3.5 text-purple-400shrink-0" />
                <span>Joined Fluxel: </span>
                <span className="text-stone-300 font-semibold">{formattedDate}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-850 border border-white/5 text-stone-300 text-xs font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isLoading ? (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
