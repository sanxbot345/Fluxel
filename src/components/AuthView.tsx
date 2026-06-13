import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Github, 
  Info, 
  Sparkles,
  ArrowLeft,
  Check,
  AlertCircle,
  X
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

interface AuthViewProps {
  isOpen: boolean;
  onClose: () => void;
  addToast: (message: string, type: "success" | "error" | "info") => void;
}

export default function AuthView({ isOpen, onClose, addToast }: AuthViewProps) {
  const { 
    loginWithEmail, 
    registerWithEmail, 
    loginWithGoogle, 
    forgotPassword,
    isLoading,
    error,
    setError
  } = useAuthStore();

  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Clear errors when swapping modes
  useEffect(() => {
    setError(null);
  }, [mode, setError]);

  // Real-time validations for Register
  const isEmailValid = email.includes("@") && email.includes(".");
  const isPasswordValid = password.length >= 6;
  const passwordsMatch = password === confirmPassword;
  const isNameValid = fullName.trim().length >= 2;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid) {
      addToast("Please enter a valid email address.", "error");
      return;
    }
    if (!password) {
      addToast("Please enter your password.", "error");
      return;
    }

    try {
      await loginWithEmail(email, password, rememberMe);
      addToast("Successfully signed in! Welcome back.", "success");
      onClose();
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNameValid) {
      addToast("Please enter a full name (at least 2 characters).", "error");
      return;
    }
    if (!isEmailValid) {
      addToast("Please enter a valid email address.", "error");
      return;
    }
    if (!isPasswordValid) {
      addToast("Password must be at least 6 characters.", "error");
      return;
    }
    if (!passwordsMatch) {
      addToast("Passwords do not match.", "error");
      return;
    }

    try {
      await registerWithEmail(fullName, email, password);
      addToast("Account created successfully! Welcome to Fluxel.", "success");
      onClose();
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid) {
      addToast("Please enter a valid email address to reset password.", "error");
      return;
    }

    try {
      await forgotPassword(email);
      addToast("Password reset email sent! Check your inbox.", "success");
      setMode("login");
    } catch (err: any) {
      addToast(err.message, "error");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      addToast("Successfully connected with Google Account!", "success");
      onClose();
    } catch (err: any) {
      if (err.message === "Google authentication popup was closed." || err.message === "Google popup was blocked by your browser. Please allow popups.") {
        addToast(err.message, "info");
        onClose(); // Automatically close login view
      } else {
        addToast(err.message, "error");
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="auth-view-root" className="fixed inset-0 z-[2200] flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Background Orbs */}
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-500/10 blur-[100px] animate-pulse pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-500/10 blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: "2s" }} />

          {/* Main Form container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="relative w-full max-w-md z-10"
          >
            {/* Subtle glass container */}
            <div 
              className="relative rounded-3xl border border-white/10 bg-[#0c0c0e]/60 backdrop-blur-xl p-6 sm:p-10 shadow-[0_24px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.08)] overflow-hidden"
              style={{
                boxShadow: "0 30px 80px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.08)"
              }}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-5 right-5 p-1.5 rounded-xl bg-stone-900 border border-white/5 hover:bg-stone-850 text-stone-400 hover:text-white transition-all cursor-pointer active:scale-95 duration-150 z-20"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
          {/* Top layout */}
          <div className="flex flex-col items-center text-center mb-8">
            {/* Elegant App Logo */}
            <div className="w-12 h-12 rounded-2xl border border-white/10 overflow-hidden shadow-inner mb-4 relative group">
              <img 
                src="/favicon.jpg" 
                alt="Fluxel Icon" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#10b981] rounded-full border-2 border-[#0c0c0e]"></div>
            </div>
            
            {/* Title */}
            <h1 className="font-display font-extrabold text-xl tracking-tight text-white mb-1 uppercase">
              {mode === "login" && "LOGIN FLUXEL DEPLOYMENT"}
              {mode === "register" && "CREATE ACCOUNT"}
              {mode === "forgot" && "RESET PASSWORD"}
            </h1>
            <p className="text-stone-400 text-xs sm:text-sm font-sans max-w-xs leading-relaxed">
              {mode === "login" && "Enter your credentials to publish projects instantly"}
              {mode === "register" && "Start your cloud deployment journey with us today"}
              {mode === "forgot" && "We'll send a password recovery code link to your email"}
            </p>
          </div>

          {/* Core Auth Forms */}
          <AnimatePresence mode="wait">
            {mode === "login" && (
              <motion.form 
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSignIn}
                className="space-y-4"
              >
                {/* Email address field */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-medium tracking-wider text-stone-400 uppercase block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input 
                      type="email"
                      value={email}
                      required
                      placeholder="name@example.com"
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-black/30 hover:bg-black/40 focus:bg-black/55 border border-white/5 focus:border-blue-500/40 rounded-xl text-white outline-none transition-all placeholder:text-stone-600"
                    />
                  </div>
                </div>

                {/* Password password field */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-mono font-medium tracking-wider text-stone-400 uppercase block">Password</label>
                    <button 
                      type="button" 
                      onClick={() => setMode("forgot")}
                      className="text-[11px] font-mono text-stone-500 hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      required
                      placeholder="••••••••"
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 text-sm bg-black/30 hover:bg-black/40 focus:bg-black/55 border border-white/5 focus:border-blue-500/40 rounded-xl text-white outline-none transition-all placeholder:text-stone-600"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-stone-300 transition-colors rounded"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me & Options */}
                <div className="flex items-center justify-between py-1">
                  <label className="flex items-center gap-2 text-xs text-stone-400 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-white/10 bg-black/40 text-blue-500 focus:ring-0 w-3.5 h-3.5 transition-colors cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-sm transition-all shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_8px_25px_rgba(37,99,235,0.3)] duration-200 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {mode === "register" && (
              <motion.form 
                key="register-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleSignUp}
                className="space-y-4"
              >
                {/* Full name input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-medium tracking-wider text-stone-400 uppercase block">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input 
                      type="text"
                      value={fullName}
                      required
                      placeholder="John Doe"
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 text-sm bg-black/30 hover:bg-black/40 focus:bg-black/55 border border-white/5 focus:border-blue-500/40 rounded-xl text-white outline-none transition-all placeholder:text-stone-600"
                    />
                    {fullName && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isNameValid ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Email address field */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-medium tracking-wider text-stone-400 uppercase block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input 
                      type="email"
                      value={email}
                      required
                      placeholder="name@example.com"
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 text-sm bg-black/30 hover:bg-black/40 focus:bg-black/55 border border-white/5 focus:border-blue-500/40 rounded-xl text-white outline-none transition-all placeholder:text-stone-600"
                    />
                    {email && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isEmailValid ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Password input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-medium tracking-wider text-stone-400 uppercase block font-sans">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      required
                      placeholder="••••••••"
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 text-sm bg-black/30 hover:bg-black/40 focus:bg-black/55 border border-white/5 focus:border-blue-500/40 rounded-xl text-white outline-none transition-all placeholder:text-stone-600"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-stone-300 transition-colors rounded"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && (
                    <span className="text-[10px] font-mono mt-0.5 block flex items-center gap-1">
                      {isPasswordValid ? (
                        <span className="text-emerald-500 flex items-center gap-1"><Check className="w-3 h-3" /> Minimum size verified</span>
                      ) : (
                        <span className="text-stone-500">Need at least 6 characters</span>
                      )}
                    </span>
                  )}
                </div>

                {/* Confirm password input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-medium tracking-wider text-stone-400 uppercase block font-sans">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input 
                      type="password"
                      value={confirmPassword}
                      required
                      placeholder="••••••••"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 text-sm bg-black/30 hover:bg-black/40 focus:bg-black/55 border border-white/5 focus:border-blue-500/40 rounded-xl text-white outline-none transition-all placeholder:text-stone-600"
                    />
                    {confirmPassword && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {passwordsMatch ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Create action button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-sm transition-all shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_8px_25px_rgba(37,99,235,0.3)] duration-200 cursor-pointer active:scale-98 flex items-center justify-center"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </motion.form>
            )}

            {mode === "forgot" && (
              <motion.form 
                key="forgot-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleForgotPassword}
                className="space-y-4"
              >
                {/* Email address field */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-medium tracking-wider text-stone-400 uppercase block text-start font-sans">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input 
                      type="email"
                      value={email}
                      required
                      placeholder="name@example.com"
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-black/30 hover:bg-black/40 focus:bg-black/55 border border-white/5 focus:border-blue-500/40 rounded-xl text-white outline-none transition-all placeholder:text-stone-600"
                    />
                  </div>
                </div>

                {/* Send recovery link action button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-sm transition-all shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_8px_25px_rgba(37,99,235,0.3)] duration-200 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <>
                      <span>Send Recovery Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Back to sign in */}
                <button 
                  type="button"
                  onClick={() => setMode("login")}
                  className="w-full text-center text-xs text-stone-500 hover:text-stone-300 transition-colors py-1 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <span className="relative z-10 px-3 bg-[#0c0c0e] text-[10px] font-mono uppercase text-stone-600 tracking-widest">
              Security Protocol
            </span>
          </div>

          {/* Social login option */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 text-stone-300 font-medium text-xs sm:text-sm hover:text-white transition-all cursor-pointer active:scale-98 duration-150 flex items-center justify-center gap-2.5 shadow-inner"
          >
            {/* Google Vector Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-sans">Continue with Google</span>
          </button>

          {/* Switch links */}
          <div className="mt-8 text-center">
            {mode === "login" ? (
              <p className="text-xs text-stone-500">
                Don't have an account?{" "}
                <button 
                  type="button" 
                  onClick={() => setMode("register")}
                  className="font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer inline-flex items-center gap-0.5 font-sans"
                >
                  Sign Up <Sparkles className="w-3 h-3 ml-0.5 text-blue-400 animate-pulse" />
                </button>
              </p>
            ) : mode === "register" ? (
              <p className="text-xs text-stone-500">
                Already have an account?{" "}
                <button 
                  type="button" 
                  onClick={() => setMode("login")}
                  className="font-medium text-purple-400 hover:text-purple-300 transition-colors cursor-pointer font-sans"
                >
                  Sign In
                </button>
              </p>
            ) : null}
          </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
