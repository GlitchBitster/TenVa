"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Mail, Phone, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [activeTab, setActiveTab] = useState<"email" | "mobile">("email");
  const [loading, setLoading] = useState(false);

  // Email form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP states (shared between Email OTP and Mobile OTP)
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all credentials");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back to TanVi!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during sign-in");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const target = activeTab === "email" ? email : `+91${mobileNumber}`;
    if (!target) {
      toast.error(`Please enter a valid ${activeTab}`);
      return;
    }

    // Basic format checks
    if (activeTab === "email" && !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (activeTab === "mobile" && mobileNumber.length !== 10) {
      toast.error("Please enter a 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, type: activeTab }),
      });

      if (res.ok) {
        setOtpSent(true);
        toast.success("OTP sent! Please check your inbox / logs.");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error generating OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = activeTab === "email" ? email : `+91${mobileNumber}`;
    if (!otpCode || otpCode.length !== 6) {
      toast.error("Please enter a 6-digit verification code");
      return;
    }

    setLoading(true);
    try {
      // Direct NextAuth OTP signIn trigger
      const res = await signIn("otp", {
        target,
        code: otpCode,
        type: activeTab,
        redirect: false,
      });

      if (res?.error) {
        toast.error(res.error || "Invalid or expired OTP");
      } else {
        toast.success("Signed in successfully!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-background-dark flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden font-dm-sans">
      {/* Visual glowing blobs */}
      <div className="absolute top-[20%] left-[20%] w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-[#1A1028]/85 backdrop-blur-md border border-primary/25 rounded-3xl p-8 shadow-[0_25px_50px_rgba(0,0,0,0.8),_0_0_20px_rgba(107,33,168,0.2)] space-y-6 z-10">
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

        {/* Tab Toggle */}
        {!otpSent && (
          <div className="flex bg-[#0D0A1A]/80 border border-primary/20 rounded-xl p-1 select-none">
            <button
              onClick={() => setActiveTab("email")}
              className={`flex-1 py-2 text-center text-xs tracking-wider uppercase rounded-lg font-semibold transition-smooth cursor-pointer ${
                activeTab === "email"
                  ? "bg-primary/25 text-accent shadow-sm"
                  : "text-text-ivory/50 hover:text-text-ivory"
              }`}
            >
              Email Sign In
            </button>
            <button
              onClick={() => setActiveTab("mobile")}
              className={`flex-1 py-2 text-center text-xs tracking-wider uppercase rounded-lg font-semibold transition-smooth cursor-pointer ${
                activeTab === "mobile"
                  ? "bg-primary/25 text-accent shadow-sm"
                  : "text-text-ivory/50 hover:text-text-ivory"
              }`}
            >
              Mobile OTP
            </button>
          </div>
        )}

        {/* Auth Body Forms */}
        {otpSent ? (
          /* OTP Verification Form */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-text-ivory/60 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-accent" /> Verification Code
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-3 text-center text-lg font-bold tracking-[0.25em] text-text-ivory focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-smooth"
                required
              />
              <p className="text-[10px] text-text-ivory/40 text-center">
                OTP sent to: <span className="text-accent">{activeTab === "email" ? email : `+91 ${mobileNumber}`}</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-light hover:shadow-[0_0_15px_rgba(107,33,168,0.4)] border border-primary-light/20 rounded-xl text-text-ivory font-dm-sans text-xs tracking-widest font-bold uppercase transition-all duration-300 disabled:opacity-50 cursor-pointer"
            >
              Verify & Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtpCode("");
              }}
              className="text-xs text-accent/70 hover:text-accent text-center block mx-auto pt-1 underline"
            >
              Change email/phone number
            </button>
          </form>
        ) : activeTab === "email" ? (
          /* Credentials Form */
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-text-ivory/60 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-accent" /> Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-3 text-text-ivory focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-smooth text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs text-text-ivory/60 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-accent" /> Password
                </label>
                <Link href="/forgot" className="text-[10px] text-accent/70 hover:text-accent underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl pl-4 pr-10 py-3 text-text-ivory focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-smooth text-sm"
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

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-light hover:shadow-[0_0_12px_rgba(107,33,168,0.4)] border border-primary-light/20 rounded-xl text-text-ivory font-dm-sans text-xs tracking-widest font-bold uppercase transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                Sign In
              </button>
              
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-3 bg-[#0D0A1A]/60 hover:bg-[#0D0A1A] border border-primary/25 rounded-xl text-text-ivory/80 font-dm-sans text-xs tracking-widest font-semibold uppercase transition-smooth cursor-pointer"
              >
                Sign In with Magic Link (OTP)
              </button>
            </div>
          </form>
        ) : (
          /* Mobile OTP Form */
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-text-ivory/60 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-accent" /> Mobile Number
              </label>
              <div className="flex">
                <span className="bg-[#0D0A1A]/50 border border-r-0 border-primary/20 rounded-l-xl px-3 py-3 text-text-ivory/70 text-sm flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="9999999999"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                  maxLength={10}
                  className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-r-xl px-4 py-3 text-text-ivory focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-smooth text-sm"
                  required
                />
              </div>
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-light hover:shadow-[0_0_12px_rgba(107,33,168,0.4)] border border-primary-light/20 rounded-xl text-text-ivory font-dm-sans text-xs tracking-widest font-bold uppercase transition-all duration-300 disabled:opacity-50 cursor-pointer"
            >
              Send Verification OTP
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 text-xs text-text-ivory/30 select-none">
          <div className="flex-1 h-[1px] bg-primary/10" />
          <span>OR</span>
          <div className="flex-1 h-[1px] bg-primary/10" />
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3.5 bg-surface hover:border-accent border border-primary/15 rounded-xl text-text-ivory/80 font-dm-sans text-xs tracking-widest font-bold uppercase flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer"
        >
          {/* Google Icon G */}
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.99 0-.74-.08-1.3-.175-1.86v-.345H12.24z" />
          </svg>
          Sign In with Google
        </button>

        {/* Redirect */}
        <p className="text-xs text-center text-text-ivory/50">
          Don't have an account?{" "}
          <Link href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-accent hover:underline font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background-dark flex justify-center items-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
