"use client";

import React, { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import OrderModal from "@/components/OrderModal";
import AuthModal from "@/components/AuthModal";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Filter, SlidersHorizontal, Search } from "lucide-react";

function CollectionsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Load URL query parameters
  const categoryParam = searchParams.get("category") || "all";
  const searchParam = searchParams.get("search") || "";

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [sortOption, setSortOption] = useState("newest");
  const [searchQuery, setSearchQuery] = useState(searchParam);

  // Modal checkout states
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync category state when URL changes
  useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  // Sync search state when URL changes
  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (activeCategory !== "all") {
          queryParams.set("category", activeCategory);
        }
        if (sortOption) {
          queryParams.set("sort", sortOption);
        }
        if (searchQuery) {
          queryParams.set("search", searchQuery);
        }

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory, sortOption, searchQuery]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    // Update URL without reloading page
    const params = new URLSearchParams(window.location.search);
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`/collections?${params.toString()}`, { scroll: false });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    router.push(`/collections?${params.toString()}`, { scroll: false });
  };

  const handleOrderNow = (product: any) => {
    setSelectedProduct(product);
    if (session) {
      setIsOrderModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-28 pb-20 px-6 md:px-12 max-w-7xl mx-auto space-y-8">
        {/* Banner Title */}
        <div className="space-y-2">
          <span className="text-[10px] tracking-widest uppercase text-accent font-semibold">TenVa Catalog</span>
          <h1 className="font-cormorant text-4xl md:text-6xl text-text-ivory font-medium capitalize">
            {activeCategory === "all" ? "Our Collections" : `${activeCategory}s`}
          </h1>
          <p className="font-dm-sans text-xs md:text-sm text-text-ivory/60 max-w-md">
            Discover beautiful ornaments created with high-vibration healing crystals designed to elevate your style and energy.
          </p>
        </div>

        {/* Filters and Sorting controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center py-4 border-t border-b border-primary/10">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0 w-full md:w-auto">
            <span className="text-accent text-xs font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {["all", "ring", "bracelet", "necklace", "stone"].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-1.5 rounded-full font-dm-sans text-xs tracking-wider uppercase border transition-smooth cursor-pointer ${
                  activeCategory === cat
                    ? "bg-primary/20 border-accent text-accent"
                    : "bg-surface/30 border-primary/10 text-text-ivory/55 hover:border-primary/40 hover:text-text-ivory"
                }`}
              >
                {cat === "all" ? "All" : cat === "stone" ? "Stones" : `${cat}s`}
              </button>
            ))}
          </div>

          {/* Search Input & Sort dropdown */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex items-center glass px-3.5 py-1.5 rounded-xl border border-primary/20 text-xs w-full sm:w-56">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-text-ivory focus:outline-none w-full pr-2 placeholder-text-ivory/40"
              />
              <button type="submit" className="text-text-ivory/60 hover:text-accent">
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 glass px-3.5 py-1.5 rounded-xl border border-primary/20 text-xs text-text-ivory w-full sm:w-auto">
              <SlidersHorizontal className="w-3.5 h-3.5 text-accent" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-text-ivory cursor-pointer font-medium"
              >
                <option value="newest" className="bg-[#1A1028] text-text-ivory">Newest Arrivals</option>
                <option value="price-asc" className="bg-[#1A1028] text-text-ivory">Price: Low to High</option>
                <option value="price-desc" className="bg-[#1A1028] text-text-ivory">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32 space-y-4">
            <p className="text-text-ivory/50 font-dm-sans text-sm">No products found matching your criteria.</p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
                setSortOption("newest");
                router.push("/collections");
              }}
              className="text-xs text-accent underline uppercase tracking-wider hover:text-primary-light"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} onOrderNow={handleOrderNow} />
            ))}
          </div>
        )}
      </main>

      {/* Checkouts & Auth popups */}
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

export default function CollectionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background-dark flex justify-center items-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CollectionsContent />
    </Suspense>
  );
}
