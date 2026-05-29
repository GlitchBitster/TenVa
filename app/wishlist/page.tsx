"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderModal from "@/components/OrderModal";
import { Heart, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function WishlistPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Checkout modal states
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  // Sync guest wishlist from localStorage to database when signed in
  useEffect(() => {
    const syncLocalWishlist = async () => {
      if (session) {
        const local = localStorage.getItem("tanvi_wishlist");
        if (local) {
          try {
            const ids = JSON.parse(local);
            if (ids && ids.length > 0) {
              // Toggle each local item to DB
              for (const productId of ids) {
                await fetch("/api/wishlist", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ productId }),
                });
              }
              // Clear local wishlist once synced
              localStorage.removeItem("tanvi_wishlist");
              window.dispatchEvent(new Event("wishlist-updated"));
              toast.success("Synced your guest wishlist!");
            }
          } catch (err) {
            console.error("Failed to sync guest wishlist:", err);
          }
        }
        fetchWishlist();
      } else {
        // Fallback for guest (in case middleware redirection is disabled or during transition)
        const local = localStorage.getItem("tanvi_wishlist");
        if (local) {
          try {
            const ids = JSON.parse(local);
            const prodRes = await fetch("/api/products");
            if (prodRes.ok) {
              const allProds = await prodRes.json();
              const filtered = allProds.filter((p: any) => ids.includes(p._id));
              setItems(filtered);
            }
          } catch (err) {
            console.error(err);
          }
        } else {
          setItems([]);
        }
        setLoading(false);
      }
    };

    syncLocalWishlist();
  }, [session]);

  const handleRemoveItem = async (productId: string) => {
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
      toast.error("Failed to remove item");
    }
  };

  const handleOrderSingle = (product: any) => {
    const price = product.isSale && product.salePrice ? product.salePrice : product.price;
    setSelectedItems([{
      productId: product._id,
      name: product.name,
      price: price,
      qty: 1,
    }]);
    setIsOrderModalOpen(true);
  };

  const handleOrderAll = () => {
    if (items.length === 0) return;
    
    const formatted = items.map((product) => {
      const price = product.isSale && product.salePrice ? product.salePrice : product.price;
      return {
        productId: product._id,
        name: product.name,
        price: price,
        qty: 1,
      };
    });

    setSelectedItems(formatted);
    setIsOrderModalOpen(true);
  };

  const totalAmount = selectedItems.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);

  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-28 pb-20 px-6 md:px-12 max-w-5xl mx-auto space-y-8 font-dm-sans">
        {/* Title */}
        <div className="space-y-1">
          <span className="text-[10px] tracking-widest uppercase text-accent font-semibold">Your Favorites</span>
          <h1 className="font-cormorant text-4xl md:text-5xl text-text-ivory font-medium">My Wishlist</h1>
          <p className="text-xs text-text-ivory/60">Manage your favorite crystals or place a quick checkout order via WhatsApp.</p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 glass border border-primary/20 rounded-3xl p-12 space-y-4 max-w-xl mx-auto">
            <Heart className="w-12 h-12 text-accent/40 mx-auto stroke-[1.5]" />
            <h3 className="font-cormorant text-2xl text-text-ivory">Your Wishlist is Empty</h3>
            <p className="text-xs text-text-ivory/55">Explore our stunning collections to find ornaments that speak to your soul.</p>
            <div className="pt-2">
              <Link
                href="/collections"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-primary to-primary-light hover:shadow-[0_0_12px_rgba(107,33,168,0.4)] rounded-xl text-text-ivory text-xs tracking-wider uppercase font-semibold transition-smooth"
              >
                Browse Collections <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Wishlist Items List */}
            <div className="space-y-4">
              {items.map((item) => {
                const price = item.isSale && item.salePrice ? item.salePrice : item.price;
                const hasPlaceholderImg = !item.images || !item.images[0] || item.images[0].startsWith("gradient:");

                return (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-[#1A1028]/60 border border-primary/20 rounded-2xl hover:border-accent/40 transition-smooth gap-4 group"
                  >
                    {/* Thumbnail & Title */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-primary/10 bg-surface shrink-0 relative flex justify-center items-center select-none">
                        {hasPlaceholderImg ? (
                          <span className="font-cormorant italic text-[10px] text-accent/80 text-center px-1">
                            {item.crystalType}
                          </span>
                        ) : (
                          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      
                      <div>
                        <Link href={`/product/${item._id}`} className="hover:text-accent transition-smooth">
                          <h3 className="font-cormorant text-lg md:text-xl text-text-ivory font-medium line-clamp-1">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-[10px] text-text-ivory/50 uppercase tracking-widest">{item.category}</p>
                      </div>
                    </div>

                    {/* Actions and Pricing */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-primary/10">
                      <span className="font-dm-sans font-semibold text-accent text-sm md:text-base">
                        ₹{price}
                      </span>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleOrderSingle(item)}
                          className="px-4 py-2 bg-gradient-to-r from-primary to-primary-light hover:shadow-[0_0_10px_rgba(107,33,168,0.4)] rounded-lg text-text-ivory font-dm-sans text-xs tracking-wider uppercase font-semibold flex items-center gap-1.5 transition-smooth border border-primary-light/10 hover:border-accent cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Order Now
                        </button>
                        
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="p-2 border border-primary/15 hover:border-red-400 rounded-lg text-text-ivory/60 hover:text-red-400 transition-smooth cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Batch Checkout Action */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleOrderAll}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-primary via-primary-light to-primary hover:shadow-[0_0_15px_rgba(107,33,168,0.5)] border border-primary-light/20 hover:border-accent rounded-xl text-text-ivory font-dm-sans text-xs tracking-widest font-bold uppercase flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Order All via WhatsApp
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Checkout Modal */}
      {selectedItems.length > 0 && (
        <OrderModal
          isOpen={isOrderModalOpen}
          onClose={() => {
            setIsOrderModalOpen(false);
            setSelectedItems([]);
          }}
          items={selectedItems}
          totalAmount={totalAmount}
        />
      )}

      <Footer />
    </>
  );
}
