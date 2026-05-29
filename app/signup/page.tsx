"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !password || !confirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (!termsAccepted) {
      toast.error("Please accept the Terms & Conditions");
      return;
    }

    setLoading(true);

    try {
      // 1. POST registration request to API
      const registerRes = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          mobileNumber: mobileNumber ? `+91${mobileNumber}` : undefined,
          password,
        }),
      });

      if (!registerRes.ok) {
        const err = await registerRes.json();
        throw new Error(err.error || "Failed to create account");
      }

      toast.success("Account created successfully!");

      // 2. Automatically log the user in
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Failed to automatically sign in");
        router.push("/signin");
      } else {
        toast.success("Welcome to TanVi!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An error occurred during sign-up");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-background-dark flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden font-dm-sans">
      {/* Glow blobs */}
      <div className="absolute top-[20%] left-[20%] w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-[#1A1028]/85 backdrop-blur-md border border-primary/25 rounded-3xl p-8 shadow-[0_25px_50px_rgba(0,0,0,0.8),_0_0_20px_rgba(107,33,168,0.2)] space-y-5 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-accent/40 mx-auto bg-surface shadow-md">
            <img src="/logo.jpeg" alt="TanVi Logo" className="w-full h-full object-cover scale-105" />
          </div>
          <h2 className="font-cormorant text-3xl font-bold tracking-widest bg-gradient-to-r from-text-ivory to-accent bg-clip-text text-transparent">
            TANVI
          </h2>
          <p className="text-[10px] tracking-widest text-text-ivory/50 uppercase">Where Crystal Meets Soul</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-text-ivory/60 flex items-center gap-1.5">
              <User className="w-4 h-4 text-accent" /> Full Name
            </label>
            <input
              type="text"
              placeholder="Your Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-smooth text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-text-ivory/60 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-accent" /> Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-smooth text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-text-ivory/60 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-accent" /> Mobile Number (Optional)
            </label>
            <div className="flex">
              <span className="bg-[#0D0A1A]/50 border border-r-0 border-primary/20 rounded-l-xl px-3 py-2.5 text-text-ivory/70 text-sm flex items-center">
                +91
              </span>
              <input
                type="tel"
                placeholder="9999999999"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                maxLength={10}
                className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-r-xl px-4 py-2.5 text-text-ivory focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-smooth text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-text-ivory/60 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-accent" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl pl-4 pr-10 py-2.5 text-text-ivory focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-smooth text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-ivory/45 hover:text-text-ivory"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-text-ivory/60 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-accent" /> Confirm
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-smooth text-sm"
                required
              />
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2.5 py-1.5 text-xs text-text-ivory/60 select-none">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 accent-primary cursor-pointer"
            />
            <label htmlFor="terms" className="cursor-pointer leading-normal">
              I agree to the{" "}
              <Link href="/policies/terms" className="text-accent hover:underline">
                Terms & Conditions
              </Link>{" "}
              and Privacy Policy of TanVi.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-light hover:shadow-[0_0_12px_rgba(107,33,168,0.4)] border border-primary-light/20 rounded-xl text-text-ivory font-dm-sans text-xs tracking-widest font-bold uppercase transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            Create Account
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 text-xs text-text-ivory/30 select-none">
          <div className="flex-1 h-[1px] bg-primary/10" />
          <span>OR</span>
          <div className="flex-1 h-[1px] bg-primary/10" />
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3.5 bg-surface hover:border-accent border border-primary/15 rounded-xl text-text-ivory/80 font-dm-sans text-xs tracking-widest font-bold uppercase flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.99 0-.74-.08-1.3-.175-1.86v-.345H12.24z" />
          </svg>
          Sign Up with Google
        </button>

        {/* Redirect */}
        <p className="text-xs text-center text-text-ivory/50">
          Already have an account?{" "}
          <Link href={`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-accent hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background-dark flex justify-center items-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
