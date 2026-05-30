"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import OrderModal from "@/components/OrderModal";
import AuthModal from "@/components/AuthModal";
import { Heart, ShoppingBag, MapPin, Sparkles, RefreshCw, Calendar } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface ProductDetailClientProps {
  product: any;
  relatedProducts: any[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { data: session } = useSession();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  
  // Checkout Modals
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const checkWishlist = async () => {
      if (session) {
        try {
          const res = await fetch("/api/wishlist");
          if (res.ok) {
            const list = await res.json();
            setIsWishlisted(list.some((item: any) => item._id === product._id));
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        const local = localStorage.getItem("tenva_wishlist");
        if (local) {
          try {
            const list = JSON.parse(local);
            setIsWishlisted(list.includes(product._id));
          } catch {
            setIsWishlisted(false);
          }
        }
      }
    };
    checkWishlist();
  }, [session, product._id]);

  const handleWishlistToggle = async () => {
    if (loadingWishlist) return;
    setLoadingWishlist(true);

    if (session) {
      try {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product._id }),
        });

        if (res.ok) {
          const data = await res.json();
          setIsWishlisted(data.isAdded);
          toast.success(data.isAdded ? "Added to wishlist!" : "Removed from wishlist");
          window.dispatchEvent(new Event("wishlist-updated"));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingWishlist(false);
      }
    } else {
      let list: string[] = [];
      const local = localStorage.getItem("tenva_wishlist");
      if (local) {
        try {
          list = JSON.parse(local);
        } catch {
          list = [];
        }
      }

      const index = list.indexOf(product._id);
      let added = false;
      if (index > -1) {
        list.splice(index, 1);
      } else {
        list.push(product._id);
        added = true;
      }

      localStorage.setItem("tenva_wishlist", JSON.stringify(list));
      setIsWishlisted(added);
      toast.success(added ? "Added to wishlist (local)!" : "Removed from wishlist");
      window.dispatchEvent(new Event("wishlist-updated"));
      setLoadingWishlist(false);
    }
  };

  const handleOrder = () => {
    if (session) {
      setIsOrderModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const displayPrice = product.isSale && product.salePrice ? product.salePrice : product.price;
  const discountPercent = product.isSale && product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const getSizeInfo = (category: string) => {
    switch (category?.toLowerCase()) {
      case "ring":
        return "Adjustable (US size 6 - 8 fits all)";
      case "bracelet":
        return "Standard elastic thread (approx. 18cm)";
      case "necklace":
        return "Aesthetic chain with adjustable links (approx. 45cm)";
      default:
        return "Natural raw stone (varies, approx. 3 - 5cm)";
    }
  };

  const getCategoryGradient = (category: string) => {
    switch (category?.toLowerCase()) {
      case "ring":
        return "from-[#4C1D95]/40 via-[#1E1B4B]/30 to-[#831843]/10";
      case "bracelet":
        return "from-[#1E3A8A]/40 via-[#1E1B4B]/30 to-[#4D7C0F]/10";
      case "necklace":
        return "from-[#701A75]/40 via-[#1E1B4B]/30 to-[#B45309]/10";
      default:
        return "from-[#0F766E]/40 via-[#1E1B4B]/30 to-[#6D28D9]/10";
    }
  };

  const hasPlaceholderImg = !product.images || !product.images[0] || product.images[0].startsWith("gradient:");

  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-28 pb-20 px-6 md:px-12 max-w-7xl mx-auto space-y-16 font-dm-sans">
        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Product Image */}
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-gradient-to-br bg-opacity-10 border border-primary/20 shadow-2xl flex justify-center items-center">
            {product.isSale && (
              <span className="absolute top-4 left-4 bg-gradient-to-r from-accent to-amber-500 text-background-dark font-dm-sans font-bold text-xs tracking-widest px-3 py-1.5 rounded-full z-10 shadow-lg uppercase">
                Sale -{discountPercent}%
              </span>
            )}
            
            {hasPlaceholderImg ? (
              <div className={`absolute inset-0 bg-gradient-to-tr ${getCategoryGradient(product.category)} flex flex-col justify-center items-center p-8 text-center`}>
                <span className="font-cormorant italic text-accent/80 text-4xl tracking-wider capitalize">
                  {product.crystalType}
                </span>
                <div className="w-24 h-1px bg-accent/20 my-4" />
                <span className="font-dm-sans text-xs tracking-[0.25em] uppercase text-text-ivory/40">
                  TenVa Crystals
                </span>
              </div>
            ) : (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Right: Product Details Info */}
          <div className="space-y-6 lg:pl-4">
            <div className="space-y-2">
              <span className="text-[10px] tracking-widest uppercase text-accent font-semibold">
                {product.category}
              </span>
              <h1 className="font-cormorant text-4xl md:text-5xl text-text-ivory leading-tight font-medium">
                {product.name}
              </h1>
            </div>

            {/* Pricing Section */}
            <div className="flex items-end gap-4 py-2 border-b border-primary/10">
              <span className="font-dm-sans font-semibold text-accent text-3xl">
                ₹{displayPrice}
              </span>
              {product.isSale && (
                <span className="text-sm text-text-ivory/40 line-through mb-1.5">
                  Original: ₹{product.price}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-text-ivory/70 leading-relaxed">
              {product.description}
            </p>

            {/* Crystal Properties Grid */}
            <div className="grid grid-cols-2 gap-4 bg-surface/40 border border-primary/10 rounded-2xl p-5 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex justify-center items-center text-accent">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-text-ivory/40 font-medium uppercase tracking-wider text-[9px]">Crystal Type</h4>
                  <p className="text-text-ivory font-semibold capitalize mt-0.5">{product.crystalType}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex justify-center items-center text-accent">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-text-ivory/40 font-medium uppercase tracking-wider text-[9px]">Origin</h4>
                  <p className="text-text-ivory font-semibold capitalize mt-0.5">{product.origin}</p>
                </div>
              </div>

              <div className="col-span-2 flex items-center gap-3 pt-2.5 border-t border-primary/10">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex justify-center items-center text-accent">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-text-ivory/40 font-medium uppercase tracking-wider text-[9px]">Dimensions / Specifications</h4>
                  <p className="text-text-ivory font-semibold mt-0.5">{getSizeInfo(product.category)}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={handleOrder}
                className="flex-1 py-4 bg-gradient-to-r from-primary via-primary-light to-primary hover:shadow-[0_0_20px_rgba(107,33,168,0.5)] border border-primary-light/20 hover:border-accent rounded-xl text-text-ivory font-dm-sans text-xs tracking-widest font-bold uppercase flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.01] cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Order via WhatsApp
              </button>

              <button
                onClick={handleWishlistToggle}
                className={`w-14 h-14 rounded-xl border flex justify-center items-center backdrop-blur-md transition-smooth hover:scale-[1.02] cursor-pointer ${
                  isWishlisted
                    ? "bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                    : "bg-surface/50 border-primary/25 text-text-ivory/80 hover:border-primary-light hover:text-primary-light"
                }`}
                disabled={loadingWishlist}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
              </button>
            </div>
            
            {/* Shipping Policy mini */}
            <div className="flex items-center gap-2.5 text-xs text-text-ivory/45 pt-2">
              <RefreshCw className="w-3.5 h-3.5 text-accent" />
              <span>Easy 7-day exchanges. Free delivery on orders over ₹999.</span>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="space-y-8 pt-10 border-t border-primary/10">
            <h2 className="font-cormorant italic text-3xl text-text-ivory font-medium">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} onOrderNow={handleOrder} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Checkout and Auth modals */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        items={[{
          productId: product._id,
          name: product.name,
          price: displayPrice,
          qty: 1,
        }]}
        totalAmount={displayPrice}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        callbackUrl={`/product/${product._id}`}
      />

      <Footer />
    </>
  );
}
