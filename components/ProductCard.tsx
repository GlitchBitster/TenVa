"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Heart, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    salePrice?: number;
    isSale: boolean;
    images: string[];
    category: string;
    crystalType: string;
  };
  onOrderNow?: (product: any) => void;
}

export default function ProductCard({ product, onOrderNow }: ProductCardProps) {
  const { data: session } = useSession();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Check wishlist state on mount/session changes
  useEffect(() => {
    const checkWishlist = async () => {
      if (session) {
        try {
          const res = await fetch("/api/wishlist");
          if (res.ok) {
            const list = await res.json();
            const found = list.some((item: any) => item._id === product._id);
            setIsWishlisted(found);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        const local = localStorage.getItem("tanvi_wishlist");
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

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
        } else {
          toast.error("Failed to update wishlist");
        }
      } catch (err) {
        console.error(err);
        toast.error("An error occurred");
      } finally {
        setLoadingWishlist(false);
      }
    } else {
      // LocalStorage for guests
      let list: string[] = [];
      const local = localStorage.getItem("tanvi_wishlist");
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

      localStorage.setItem("tanvi_wishlist", JSON.stringify(list));
      setIsWishlisted(added);
      toast.success(added ? "Added to wishlist (local)!" : "Removed from wishlist");
      window.dispatchEvent(new Event("wishlist-updated"));
      setLoadingWishlist(false);
    }
  };

  // Get display price
  const displayPrice = product.isSale && product.salePrice ? product.salePrice : product.price;
  const originalPrice = product.price;
  const discountPercent = product.isSale && product.salePrice 
    ? Math.round(((originalPrice - product.salePrice) / originalPrice) * 100)
    : 0;

  // Fallback category crystal gradient backgrounds
  const getGradientBg = (category: string) => {
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

  return (
    <div className="group relative bg-[#1A1028]/80 backdrop-blur-sm rounded-2xl border border-primary/20 hover:border-accent p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_10px_35px_rgba(0,0,0,0.7),_0_0_20px_rgba(107,33,168,0.25)] flex flex-col overflow-hidden">
      {/* Product Image Link */}
      <Link href={`/product/${product._id}`} className="block relative aspect-square w-full rounded-xl overflow-hidden mb-4 bg-gradient-to-br bg-opacity-10 border border-primary/10 select-none">
        {/* SALE Badge */}
        {product.isSale && (
          <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-accent to-amber-500 text-background-dark font-dm-sans font-bold text-[10px] tracking-widest px-2.5 py-1 rounded-full z-10 shadow-lg uppercase">
            Sale -{discountPercent}%
          </span>
        )}

        {/* Wishlist Heart Overlay */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full border flex justify-center items-center backdrop-blur-md transition-smooth z-10 hover:scale-105 cursor-pointer ${
            isWishlisted
              ? "bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
              : "bg-background-dark/40 border-text-ivory/20 text-text-ivory hover:border-primary-light hover:text-primary-light"
          }`}
          disabled={loadingWishlist}
          aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Dynamic Image or Crystal Gradient */}
        {product.images && product.images[0] && !product.images[0].startsWith("gradient:") ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-tr ${getGradientBg(product.category)} flex flex-col justify-center items-center p-6 text-center`}>
            {/* Elegant Serif Category Icon Text */}
            <span className="font-cormorant italic text-accent/80 text-lg tracking-wider capitalize">
              {product.crystalType}
            </span>
            <div className="w-16 h-1px bg-accent/20 my-2" />
            <span className="font-dm-sans text-[10px] tracking-widest uppercase text-text-ivory/40">
              TanVi Crystals
            </span>
          </div>
        )}
      </Link>

      {/* Product Details */}
      <div className="flex-1 flex flex-col">
        <span className="font-dm-sans text-[10px] tracking-widest uppercase text-accent font-medium mb-1">
          {product.category}
        </span>
        <Link href={`/product/${product._id}`} className="block">
          <h3 className="font-cormorant text-xl text-text-ivory group-hover:text-accent transition-smooth line-clamp-1 mb-1 font-medium">
            {product.name}
          </h3>
        </Link>
        <p className="font-dm-sans text-xs text-text-ivory/50 line-clamp-2 leading-relaxed mb-4">
          {product.description}
        </p>

        {/* Pricing & Checkout */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-primary/10">
          <div className="flex flex-col">
            {product.isSale && (
              <span className="text-[10px] text-text-ivory/40 line-through">
                ₹{originalPrice}
              </span>
            )}
            <span className="font-dm-sans font-semibold text-accent text-base">
              ₹{displayPrice}
            </span>
          </div>

          <button
            onClick={() => onOrderNow && onOrderNow(product)}
            className="px-3.5 py-2 bg-gradient-to-r from-primary to-primary-light hover:shadow-[0_0_12px_rgba(107,33,168,0.4)] rounded-lg text-text-ivory font-dm-sans text-xs tracking-wider uppercase font-semibold flex items-center gap-1.5 border border-primary-light/10 hover:border-accent transition-smooth cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
}
