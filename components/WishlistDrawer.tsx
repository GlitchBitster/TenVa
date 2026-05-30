"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";
import { generateWhatsAppLink } from "@/lib/whatsapp";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderNow: (product: any) => void;
}

export default function WishlistDrawer({ isOpen, onClose, onOrderNow }: WishlistDrawerProps) {
  const { data: session } = useSession();
  const [items, setItems] = useState<any[]>([]);

  const fetchWishlist = useCallback(async () => {
    if (session) {
      try {
        const res = await fetch("/api/wishlist");
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // LocalStorage for guests
      const local = localStorage.getItem("tenva_wishlist");
      if (local) {
        try {
          const ids = JSON.parse(local);
          // To get full product details for guest users, we can fetch all products
          // and filter by the ids list. This is highly efficient and client-side!
          const prodRes = await fetch("/api/products");
          if (prodRes.ok) {
            const allProds = await prodRes.json();
            const filtered = allProds.filter((p: { _id: string }) => ids.includes(p._id));
            setItems(filtered);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setItems([]);
      }
    }
  }, [session]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchWishlist();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, fetchWishlist]);

  const handleRemove = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (session) {
      try {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        if (res.ok) {
          toast.success("Removed from wishlist");
          fetchWishlist();
          window.dispatchEvent(new Event("wishlist-updated"));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      const local = localStorage.getItem("tenva_wishlist");
      if (local) {
        try {
          const list = JSON.parse(local);
          const filtered = list.filter((id: string) => id !== productId);
          localStorage.setItem("tenva_wishlist", JSON.stringify(filtered));
          toast.success("Removed from wishlist");
          fetchWishlist();
          window.dispatchEvent(new Event("wishlist-updated"));
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const handleOrderAll = () => {
    if (items.length === 0) return;
    
    // Redirect to WhatsApp with all items
    const adminPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918015819217";
    const itemsList = items.map((item) => ({
      name: item.name,
      qty: 1,
      price: item.isSale && item.salePrice ? item.salePrice : item.price,
    }));
    
    const totalAmount = itemsList.reduce((acc, curr) => acc + curr.price, 0);

    const whatsappUrl = generateWhatsAppLink(
      adminPhone,
      session?.user?.fullName || "Valued Customer",
      session?.user?.mobileNumber || "N/A",
      itemsList,
      totalAmount,
      {
        street: "[Please enter shipping street]",
        city: "[Please enter city]",
        state: "[Please enter state]",
        pincode: "[Please enter pincode]",
      }
    );

    window.open(whatsappUrl, "_blank");
    toast.success("Redirecting all items to WhatsApp...");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#0D0A1A] border-l border-primary/20 h-full p-6 flex flex-col shadow-2xl z-10 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-primary/10 mb-6">
          <div className="flex items-center gap-2 text-accent">
            <Heart className="w-5 h-5 fill-accent" />
            <h3 className="font-cormorant text-xl tracking-wider font-semibold">Your Wishlist</h3>
          </div>
          <button onClick={onClose} className="text-text-ivory/60 hover:text-accent transition-smooth">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-text-ivory/40">
              <Heart className="w-10 h-10 mb-3 stroke-[1.5]" />
              <p className="text-sm font-dm-sans">Your wishlist is empty</p>
              <Link
                href="/collections"
                onClick={onClose}
                className="mt-4 text-xs text-accent underline hover:text-primary-light uppercase tracking-wider"
              >
                Go Shop Crystals
              </Link>
            </div>
          ) : (
            items.map((item) => {
              const price = item.isSale && item.salePrice ? item.salePrice : item.price;
              const hasPlaceholderImg = !item.images || !item.images[0] || item.images[0].startsWith("gradient:");

              return (
                <div
                  key={item._id}
                  className="flex gap-4 p-3 bg-[#1A1028]/60 border border-primary/10 rounded-xl hover:border-primary/30 transition-smooth group"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-primary/10 bg-surface shrink-0 relative flex justify-center items-center">
                    {hasPlaceholderImg ? (
                      <span className="font-cormorant italic text-[10px] text-accent/80 text-center px-1">
                        {item.crystalType}
                      </span>
                    ) : (
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-cormorant text-base text-text-ivory group-hover:text-accent transition-smooth line-clamp-1 leading-snug">
                        {item.name}
                      </h4>
                      <p className="font-dm-sans text-xs text-accent font-medium mt-0.5">₹{price}</p>
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <button
                        onClick={() => {
                          onOrderNow(item);
                          onClose();
                        }}
                        className="text-[10px] tracking-wider uppercase text-primary-light hover:text-accent font-bold transition-smooth flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        Order
                      </button>
                      
                      <button
                        onClick={(e) => handleRemove(item._id, e)}
                        className="text-[10px] tracking-wider uppercase text-red-400 hover:text-red-300 font-bold transition-smooth flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="mt-6 pt-4 border-t border-primary/10 space-y-4">
            <div className="flex justify-between items-center font-semibold text-accent text-sm">
              <span>Items Total ({items.length})</span>
              <span>
                ₹
                {items.reduce(
                  (acc, curr) => acc + (curr.isSale && curr.salePrice ? curr.salePrice : curr.price),
                  0
                )}
              </span>
            </div>
            
            <button
              onClick={handleOrderAll}
              className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-light hover:shadow-[0_0_15px_rgba(107,33,168,0.4)] hover:border-accent border border-primary-light/20 rounded-xl text-text-ivory font-dm-sans text-xs tracking-widest font-bold uppercase flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              Order All via WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
