"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import CountdownTimer from "@/components/CountdownTimer";
import OrderModal from "@/components/OrderModal";
import AuthModal from "@/components/AuthModal";
import { useSession } from "next-auth/react";
import { Truck, ShieldCheck, RefreshCw, Headphones, ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Categories list
  const categories = [
    { name: "Rings", slug: "ring", gradient: "from-[#4C1D95]/40 via-[#1E1B4B]/30 to-[#831843]/10", itemCount: "3" },
    { name: "Bracelets", slug: "bracelet", gradient: "from-[#1E3A8A]/40 via-[#1E1B4B]/30 to-[#4D7C0F]/10", itemCount: "3" },
    { name: "Necklaces", slug: "necklace", gradient: "from-[#701A75]/40 via-[#1E1B4B]/30 to-[#B45309]/10", itemCount: "3" },
    { name: "Healing Stones", slug: "stone", gradient: "from-[#0F766E]/40 via-[#1E1B4B]/30 to-[#6D28D9]/10", itemCount: "3" },
  ];

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Intersection Observer for scroll fade-in animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const animatedElements = document.querySelectorAll(".fade-in-scroll");
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [products]);

  const handleOrderNow = (product: any) => {
    setSelectedProduct(product);
    if (session) {
      setIsOrderModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const featuredProducts = products.filter((p) => p.isSale).slice(0, 6);
  const latestArrivals = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  return (
    <>
      <Navbar />

      {/* Hero Banner */}
      <section className="relative h-screen flex flex-col justify-center items-center text-center px-6 overflow-hidden pt-16">
        {/* Banner Image with dark overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D0A1A]/40 via-[#0D0A1A]/70 to-[#0D0A1A] z-10" />
          {/* A high-end dark crystal background styling */}
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/30 via-background-dark to-background-dark animate-pulse duration-10000" />
        </div>

        <div className="relative z-20 max-w-3xl space-y-6 flex flex-col items-center">
          <span className="font-dm-sans text-xs md:text-sm tracking-[0.3em] uppercase text-accent font-semibold animate-fade-up">
            TenVa Crystal Collection
          </span>
          
          <h1 className="font-cormorant text-5xl md:text-7xl font-bold tracking-wide text-text-ivory leading-tight select-none">
            Where Crystal<br />
            <span className="italic bg-gradient-to-r from-accent via-primary-light to-accent bg-clip-text text-transparent">
              Meets Soul
            </span>
          </h1>

          <p className="font-dm-sans text-sm md:text-base text-text-ivory/60 max-w-xl mx-auto leading-relaxed">
            Enhance your energy and elevate your style with our premium handpicked crystal rings, bracelets, necklaces, and healing stones.
          </p>

          <div className="pt-6">
            <Link
              href="/collections"
              className="px-8 py-3.5 bg-gradient-to-r from-primary to-primary-light hover:shadow-[0_0_20px_rgba(107,33,168,0.5)] rounded-full text-text-ivory font-dm-sans text-xs tracking-widest uppercase font-semibold border border-primary-light/20 hover:border-accent transition-all duration-300 hover:scale-[1.03]"
            >
              Shop Now
            </Link>
          </div>
        </div>

        {/* Scroll helper */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-ivory/40 animate-bounce select-none">
          <span className="text-[9px] uppercase tracking-[0.2em] font-medium">Scroll</span>
          <div className="w-[1px] h-6 bg-text-ivory/20" />
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="py-16 px-6 md:px-12 bg-background-dark relative overflow-hidden border-t border-primary/10">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[10px] tracking-widest uppercase text-accent font-semibold">Categories</span>
              <h2 className="font-cormorant italic text-3xl md:text-4xl text-text-ivory font-medium">Shop by Category</h2>
            </div>
            <Link href="/collections" className="text-xs text-accent hover:text-primary-light font-bold flex items-center gap-1 uppercase tracking-wider transition-smooth">
              All Items <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Horizontal scroll grid wrapper */}
          <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
            {categories.map((cat, idx) => (
              <CategoryCard key={idx} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 px-6 md:px-12 bg-[#0D0A1A]/60 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[10px] tracking-widest uppercase text-accent font-semibold">Handpicked Faves</span>
            <h2 className="font-cormorant text-3xl md:text-5xl text-text-ivory font-medium">Featured Products</h2>
            <div className="w-12 h-1px bg-accent/30 mx-auto mt-4" />
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0 scroll-smooth">
              {featuredProducts.map((product) => (
                <div key={product._id} className="w-[280px] md:w-[320px] shrink-0">
                  <ProductCard product={product} onOrderNow={handleOrderNow} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Flash Sale Banner (Countdown Timer) */}
      <section className="py-12 px-6 md:px-12 bg-background-dark">
        <CountdownTimer />
      </section>

      {/* Latest Arrivals Section */}
      <section className="py-20 px-6 md:px-12 bg-[#0D0A1A]/60 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[10px] tracking-widest uppercase text-accent font-semibold">New Additions</span>
            <h2 className="font-cormorant text-3xl md:text-5xl text-text-ivory font-medium">Latest Arrivals</h2>
            <div className="w-12 h-1px bg-accent/30 mx-auto mt-4" />
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0 scroll-smooth">
              {latestArrivals.map((product) => (
                <div key={product._id} className="w-[280px] md:w-[320px] shrink-0">
                  <ProductCard product={product} onOrderNow={handleOrderNow} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-16 px-6 md:px-12 bg-background-dark border-t border-b border-primary/10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center p-4 space-y-3">
            <div className="w-12 h-12 rounded-full border border-primary/30 bg-surface flex justify-center items-center text-accent shadow-md">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-cormorant text-lg font-semibold text-text-ivory">Free Shipping</h3>
            <p className="font-dm-sans text-[11px] text-text-ivory/50">For orders above ₹999/-</p>
          </div>

          <div className="flex flex-col items-center text-center p-4 space-y-3">
            <div className="w-12 h-12 rounded-full border border-primary/30 bg-surface flex justify-center items-center text-accent shadow-md">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="font-cormorant text-lg font-semibold text-text-ivory">Easy Returns</h3>
            <p className="font-dm-sans text-[11px] text-text-ivory/50">Hassle-free 7-day returns</p>
          </div>

          <div className="flex flex-col items-center text-center p-4 space-y-3">
            <div className="w-12 h-12 rounded-full border border-primary/30 bg-surface flex justify-center items-center text-accent shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-cormorant text-lg font-semibold text-text-ivory">Secure Payment</h3>
            <p className="font-dm-sans text-[11px] text-text-ivory/50">Multiple safe payment options</p>
          </div>

          <div className="flex flex-col items-center text-center p-4 space-y-3">
            <div className="w-12 h-12 rounded-full border border-primary/30 bg-surface flex justify-center items-center text-accent shadow-md">
              <Headphones className="w-5 h-5" />
            </div>
            <h3 className="font-cormorant text-lg font-semibold text-text-ivory">24/7 Support</h3>
            <p className="font-dm-sans text-[11px] text-text-ivory/50">Support at any time of day</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 md:px-12 bg-background-dark/80 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Decorative Crystal Image */}
          <div className="relative aspect-[4/5] rounded-3xl bg-gradient-to-br from-primary/10 via-[#1A1028]/80 to-accent/5 border border-primary/20 flex justify-center items-center overflow-hidden shadow-2xl">
            {/* Spinning Rotating Glow */}
            <div className="absolute w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(147,51,234,0.18)_0%,transparent_60%)] animate-glow-rotate z-0 pointer-events-none" />
            
            {/* Elegant Serif Watermark Logo */}
            <div className="relative z-10 text-center select-none space-y-4">
              <span className="font-cormorant italic text-7xl md:text-9xl text-accent/25 block">T</span>
              <span className="font-dm-sans text-[10px] tracking-[0.3em] uppercase text-text-ivory/40">TenVa Craft</span>
            </div>
          </div>

          {/* Right: Story */}
          <div className="space-y-6">
            <span className="text-[10px] tracking-widest uppercase text-accent font-semibold">Our Story</span>
            <h2 className="font-cormorant text-4xl md:text-5xl text-text-ivory leading-tight font-medium">
              Where Crystal Energy Meets Elegant Luxury
            </h2>
            <p className="font-dm-sans text-sm md:text-base text-text-ivory/70 leading-relaxed">
              At TenVa, we believe that crystals are more than just beautiful ornaments. They are ancient energy conduits, grounding templates of light, and daily reminders of our connection to the Earth and our inner soul.
            </p>
            <p className="font-dm-sans text-sm md:text-base text-text-ivory/70 leading-relaxed">
              Every ring, bracelet, necklace, and healing stone in our collection is hand-selected and ethically sourced. We carefully examine each specimen for purity, clarity, and vibrational alignment, ensuring that the piece that finds you is truly meant for your journey.
            </p>
            <div className="pt-4">
              <Link
                href="/collections"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase text-accent hover:text-primary-light transition-smooth tracking-wider group"
              >
                Explore our catalog
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-smooth" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Action Button */}
      <a
        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918015819217"}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#128C7E] flex justify-center items-center text-background-dark shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_4px_25px_rgba(37,211,102,0.6)] hover:scale-105 transition-all duration-300 z-40"
        aria-label="Contact support on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-text-ivory fill-current" />
      </a>

      {/* Checkout and Auth modals */}
      {selectedProduct && (
        <OrderModal
          isOpen={isOrderModalOpen}
          onClose={() => {
            setIsOrderModalOpen(false);
            setSelectedProduct(null);
          }}
          items={[{
            productId: selectedProduct._id,
            name: selectedProduct.name,
            price: selectedProduct.isSale && selectedProduct.salePrice ? selectedProduct.salePrice : selectedProduct.price,
            qty: 1,
          }]}
          totalAmount={selectedProduct.isSale && selectedProduct.salePrice ? selectedProduct.salePrice : selectedProduct.price}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setSelectedProduct(null);
        }}
        callbackUrl="/collections"
      />

      <Footer />
    </>
  );
}
