import React, { useState } from "react";
import { motion } from "motion/react";
import { X, Mail, Lock, User as UserIcon, ChefHat, Eye, EyeOff } from "lucide-react";
import { useStore } from "../context/StoreContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register, addToast } = useStore();
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLoginView && !name)) {
      addToast("Please fill in all required fields", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLoginView) {
        const res = await login(email, password);
        if (res.success) onClose();
      } else {
        const res = await register(name, email, password);
        if (res.success) onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo bypass functions
  const handleQuickLogin = async (role: "customer" | "admin") => {
    setIsSubmitting(true);
    try {
      const demoEmail = role === "admin" ? "arfasaniya5@gmail.com" : "customer@feast.com";
      const demoPass = role === "admin" ? "adminpassword" : "customerpassword";
      
      const res = await login(demoEmail, demoPass);
      if (res.success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100"
        id="auth-modal-card"
      >
        {/* Header background blob */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          id="btn-close-auth"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900" id="auth-title">
              {isLoginView ? "Welcome Back to Feast" : "Create Your Feast Account"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {isLoginView
                ? "Savor gourmet meals ordered instantly to your doorstep"
                : "Register to track orders and save your delivery details"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginView && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <UserIcon className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Arfa Saniya"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                    id="input-auth-name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                  id="input-auth-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                  id="input-auth-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>


            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-rose-200 hover:shadow-xl transition-all duration-150 flex items-center justify-center disabled:opacity-50"
              id="btn-auth-submit"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isLoginView ? (
                "Log In"
              ) : (
                "Sign Up Account"
              )}
            </button>
          </form>

          {/* Toggle link */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLoginView(!isLoginView)}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
              id="btn-toggle-auth-view"
            >
              {isLoginView ? "New to Feast? Register Here" : "Already have an account? Log In"}
            </button>
          </div>

          {/* Quick Demo Shortcuts */}
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-white text-gray-400 tracking-wider">Demo Quick Access</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              type="button"
              onClick={() => handleQuickLogin("customer")}
              className="flex flex-col items-center justify-center p-2.5 border border-rose-100 hover:border-rose-200 bg-rose-50/50 hover:bg-rose-50 rounded-xl text-center group transition-all"
              id="btn-demo-customer"
            >
              <span className="text-xs font-semibold text-rose-700">Customer Access</span>
              <span className="text-[10px] text-rose-500 mt-0.5 font-medium group-hover:underline">Happy Foodie</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("admin")}
              className="flex flex-col items-center justify-center p-2.5 border border-amber-100 hover:border-amber-200 bg-amber-50/50 hover:bg-amber-50 rounded-xl text-center group transition-all"
              id="btn-demo-admin"
            >
              <span className="text-xs font-semibold text-amber-700">Admin Dashboard</span>
              <span className="text-[10px] text-amber-500 mt-0.5 font-medium group-hover:underline">Chef Console</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
