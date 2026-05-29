import React from "react";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductDetailClient from "./ProductDetailClient";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  await connectDB();
  
  let product;
  try {
    product = await Product.findById(id);
  } catch (err) {
    console.error("Invalid product ID:", err);
    return notFound();
  }

  if (!product) {
    return notFound();
  }

  // Fetch related products (same category, excluding current product)
  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
  }).limit(4);

  // Convert Mongoose documents to plain JS objects for passing to client components
  const serializedProduct = JSON.parse(JSON.stringify(product));
  const serializedRelatedProducts = JSON.parse(JSON.stringify(relatedProducts));

  return (
    <ProductDetailClient
      product={serializedProduct}
      relatedProducts={serializedRelatedProducts}
    />
  );
}
