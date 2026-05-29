import React from "react";
import Link from "next/link";

interface CategoryCardProps {
  category: {
    name: string;
    slug: string;
    gradient: string;
    itemCount: string;
  };
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/collections?category=${category.slug}`}
      className="flex-shrink-0 w-44 md:w-56 aspect-[4/3] rounded-2xl relative overflow-hidden group border border-primary/10 hover:border-accent transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.6),0_0_15px_rgba(107,33,168,0.2)]"
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-50 group-hover:opacity-60 transition-smooth`} />
      
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-[#1A1028]/20 backdrop-blur-[2px] group-hover:backdrop-blur-none transition-smooth" />
      
      {/* Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
        <span className="text-[10px] tracking-widest uppercase text-text-ivory/50 group-hover:text-accent transition-smooth font-medium">
          {category.itemCount} Items
        </span>
        
        <div>
          <h3 className="font-cormorant italic text-xl md:text-2xl text-text-ivory group-hover:text-accent transition-smooth font-medium">
            {category.name}
          </h3>
          <div className="w-6 h-[1px] bg-accent/40 mt-1.5 group-hover:w-12 transition-smooth" />
        </div>
      </div>
    </Link>
  );
}
