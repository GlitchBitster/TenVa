"use client";

import React from "react";
import { X, Lock, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  callbackUrl?: string;
}

export default function AuthModal({ isOpen, onClose, callbackUrl = "/collections" }: AuthModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSignInRedirect = () => {
    onClose();
    router.push(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  };

  const handleSignUpRedirect = () => {
    onClose();
    router.push(`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-[#1A1028]/95 border border-primary/30 rounded-3xl shadow-[0_25px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(107,33,168,0.25)] p-6 overflow-hidden text-center">
        {/* Glow */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-ivory/60 hover:text-accent transition-smooth"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon */}
        <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex justify-center items-center mx-auto mb-4 text-accent">
          <Lock className="w-5 h-5" />
        </div>

        <h3 className="font-cormorant text-2xl text-text-ivory font-semibold mb-2">
          Authentication Required
        </h3>
        <p className="font-dm-sans text-xs text-text-ivory/60 leading-relaxed mb-6">
          To complete your crystal checkout and confirm your order details via WhatsApp, please sign in or register an account with TanVi.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleSignInRedirect}
            className="w-full py-3 bg-gradient-to-r from-primary to-primary-light hover:shadow-[0_0_12px_rgba(107,33,168,0.4)] hover:border-accent border border-primary-light/20 rounded-xl text-text-ivory font-dm-sans text-xs tracking-widest font-bold uppercase flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            Sign In to Account
          </button>
          
          <button
            onClick={handleSignUpRedirect}
            className="w-full py-3 bg-surface hover:border-accent border border-primary/10 rounded-xl text-text-ivory/80 font-dm-sans text-xs tracking-widest font-bold uppercase flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Create New Account
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-5 text-xs text-text-ivory/40 hover:text-text-ivory transition-smooth block mx-auto underline"
        >
          Continue Browsing
        </button>
      </div>
    </div>
  );
}
