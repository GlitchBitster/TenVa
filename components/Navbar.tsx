"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Search, Heart, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlistCount, setWishlistCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // Fetch wishlist count
  const fetchWishlistCount = async () => {
    if (session) {
      try {
        const res = await fetch("/api/wishlist");
        if (res.ok) {
          const data = await res.ok ? await res.json() : [];
          setWishlistCount(data.length || 0);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // LocalStorage for guests
      const local = localStorage.getItem("tenva_wishlist");
      if (local) {
        try {
          const parsed = JSON.parse(local);
          setWishlistCount(parsed.length || 0);
        } catch {
          setWishlistCount(0);
        }
      } else {
        setWishlistCount(0);
      }
    }
  };

  useEffect(() => {
    fetchWishlistCount();

    // Listen to custom wishlist update events
    const handleWishlistUpdate = () => {
      fetchWishlistCount();
    };

    window.addEventListener("wishlist-updated", handleWishlistUpdate);
    
    // Add scroll listener for sticky nav styling
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("wishlist-updated", handleWishlistUpdate);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [session]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/collections?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-smooth py-4 px-6 md:px-12 flex justify-between items-center ${
          scrolled
            ? "bg-background-dark/90 backdrop-blur-md border-b border-primary/20 shadow-lg shadow-black/30"
            : "bg-transparent"
        }`}
      >
        {/* Left Side: Hamburger & Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="text-text-ivory hover:text-accent transition-smooth md:hidden"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-accent/40 group-hover:border-accent transition-smooth relative bg-surface">
              <img
                src="/logo.jpeg"
                alt="TenVa Logo"
                className="w-full h-full object-cover scale-105"
              />
            </div>
            <span className="font-cormorant text-2xl tracking-widest font-semibold bg-gradient-to-r from-text-ivory to-accent bg-clip-text text-transparent group-hover:opacity-90 transition-smooth">
              tenva
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation links */}
        <ul className="hidden md:flex items-center gap-8 font-dm-sans text-sm tracking-wider uppercase text-text-ivory/80">
          <li>
            <Link href="/" className="hover:text-accent transition-smooth relative after:content-[''] after:absolute after:w-0 after:h-[1px] after:bottom-[-4px] after:left-0 after:bg-accent after:transition-smooth hover:after:w-full">
              Home
            </Link>
          </li>
          <li>
            <Link href="/collections" className="hover:text-accent transition-smooth relative after:content-[''] after:absolute after:w-0 after:h-[1px] after:bottom-[-4px] after:left-0 after:bg-accent after:transition-smooth hover:after:w-full">
              Collections
            </Link>
          </li>
          <li>
            <Link href="/#about" className="hover:text-accent transition-smooth relative after:content-[''] after:absolute after:w-0 after:h-[1px] after:bottom-[-4px] after:left-0 after:bg-accent after:transition-smooth hover:after:w-full">
              About
            </Link>
          </li>
          <li>
            <Link href="/wishlist" className="hover:text-accent transition-smooth relative after:content-[''] after:absolute after:w-0 after:h-[1px] after:bottom-[-4px] after:left-0 after:bg-accent after:transition-smooth hover:after:w-full">
              Wishlist
            </Link>
          </li>
          <li>
            <Link href="/#contact" className="hover:text-accent transition-smooth relative after:content-[''] after:absolute after:w-0 after:h-[1px] after:bottom-[-4px] after:left-0 after:bg-accent after:transition-smooth hover:after:w-full">
              Contact
            </Link>
          </li>
        </ul>

        {/* Right Side: Search, Wishlist, Account */}
        <div className="flex items-center gap-5 text-text-ivory">
          {/* Search Toggle */}
          <div className="relative">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hover:text-accent transition-smooth cursor-pointer"
              aria-label="Toggle Search"
            >
              <Search className="w-5 h-5" />
            </button>
            {isSearchOpen && (
              <form
                onSubmit={handleSearchSubmit}
                className="absolute right-0 top-10 w-64 glass p-2 rounded-xl border border-primary/30 flex items-center shadow-2xl animate-fade-up"
              >
                <input
                  type="text"
                  placeholder="Search crystals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm w-full text-text-ivory placeholder-text-ivory/50 focus:outline-none px-2"
                  autoFocus
                />
                <button type="submit" className="text-accent hover:text-primary-light p-1">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Wishlist Link */}
          <Link href="/wishlist" className="relative hover:text-accent transition-smooth" aria-label="View Wishlist">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-text-ivory text-[9px] font-bold w-4 h-4 rounded-full flex justify-center items-center shadow-md">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Account Icon */}
          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href={session.user.role === "admin" ? "/admin" : "/account"}
                className="hover:text-accent transition-smooth flex items-center gap-1.5 text-sm"
              >
                <User className="w-5 h-5" />
                <span className="hidden lg:inline text-xs max-w-[80px] truncate">
                  {session.user.fullName?.split(" ")[0]}
                </span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hover:text-red-400 transition-smooth p-1 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link href="/signin" className="hover:text-accent transition-smooth flex items-center gap-1" aria-label="Sign In">
              <User className="w-5 h-5" />
            </Link>
          )}
        </div>
      </nav>

      {/* Hamburger Drawer Menu (Mobile Drawer) */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-smooth ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsDrawerOpen(false)}
      >
        <div
          className={`fixed top-0 left-0 h-full w-[280px] bg-background-dark/95 border-r border-primary/20 p-6 flex flex-col justify-between shadow-2xl transition-all duration-300 ${
            isDrawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-accent/40 bg-surface">
                  <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <span className="font-cormorant text-xl tracking-widest font-semibold bg-gradient-to-r from-text-ivory to-accent bg-clip-text text-transparent">
                  tenva
                </span>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="text-text-ivory hover:text-accent">
                <X className="w-6 h-6" />
              </button>
            </div>

            <ul className="flex flex-col gap-6 text-base tracking-wider uppercase font-dm-sans">
              <li>
                <Link
                  href="/"
                  className="hover:text-accent block py-1 border-b border-primary/10 transition-smooth"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/collections"
                  className="hover:text-accent block py-1 border-b border-primary/10 transition-smooth"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Collections
                </Link>
              </li>
              <li>
                <Link
                  href="/#about"
                  className="hover:text-accent block py-1 border-b border-primary/10 transition-smooth"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="hover:text-accent block py-1 border-b border-primary/10 transition-smooth"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Wishlist
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  className="hover:text-accent block py-1 border-b border-primary/10 transition-smooth"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-auto">
            {session ? (
              <div className="flex flex-col gap-3">
                <Link
                  href={session.user.role === "admin" ? "/admin" : "/account"}
                  className="w-full text-center py-3 bg-gradient-to-r from-primary to-primary-light hover:shadow-[0_0_15px_rgba(107,33,168,0.5)] rounded-xl font-medium transition-smooth uppercase text-sm"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  My Account ({session.user.fullName?.split(" ")[0]})
                </Link>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full py-3 bg-surface border border-primary/20 rounded-xl hover:border-red-400 text-red-400 font-medium transition-smooth uppercase text-sm cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/signin"
                className="w-full block text-center py-3 bg-gradient-to-r from-primary to-primary-light hover:shadow-[0_0_15px_rgba(107,33,168,0.5)] rounded-xl font-medium transition-smooth uppercase text-sm"
                onClick={() => setIsDrawerOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
