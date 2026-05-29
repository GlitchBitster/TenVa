import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

const sampleProducts = [
  {
    name: "Amethyst Ring",
    description: "An elegant, high-vibrational amethyst ring set in a beautiful band. Radiates deep healing energy and peaceful vibrations.",
    category: "ring",
    price: 899,
    salePrice: 649,
    isSale: true,
    images: ["gradient:ring"],
    crystalType: "amethyst",
    origin: "Brazil",
    stock: 12,
  },
  {
    name: "Rose Quartz Ring",
    description: "The stone of universal love. Hand-cut raw rose quartz crystal on an adjustable band, perfect for nurturing affection and emotional healing.",
    category: "ring",
    price: 799,
    isSale: false,
    images: ["gradient:ring"],
    crystalType: "rose quartz",
    origin: "Madagascar",
    stock: 15,
  },
  {
    name: "Lapis Lazuli Bracelet",
    description: "Featuring deep celestial blue lapis lazuli beads. Enhances intellectual ability, wisdom, truth, and unlocks your throat chakra.",
    category: "bracelet",
    price: 1199,
    salePrice: 899,
    isSale: true,
    images: ["gradient:bracelet"],
    crystalType: "lapis lazuli",
    origin: "Afghanistan",
    stock: 8,
  },
  {
    name: "Crystal Quartz Bracelet",
    description: "Clear quartz beads woven together. The master healer crystal, amplifying energy, thought, and the effect of other crystals.",
    category: "bracelet",
    price: 999,
    isSale: false,
    images: ["gradient:bracelet"],
    crystalType: "clear quartz",
    origin: "Brazil",
    stock: 20,
  },
  {
    name: "Amethyst Pendant Necklace",
    description: "A gorgeous point-cut amethyst crystal pendant suspended on a fine premium silver chain. Inspires spiritual awareness and tranquility.",
    category: "necklace",
    price: 1499,
    salePrice: 1199,
    isSale: true,
    images: ["gradient:necklace"],
    crystalType: "amethyst",
    origin: "Uruguay",
    stock: 6,
  },
  {
    name: "Moonstone Necklace",
    description: "A mesmerizing moonstone pendant that shimmers in the light. Channeling internal growth, strength, and new beginnings.",
    category: "necklace",
    price: 1299,
    isSale: false,
    images: ["gradient:necklace"],
    crystalType: "moonstone",
    origin: "India",
    stock: 10,
  },
  {
    name: "Raw Amethyst Stone",
    description: "Natural unpolished raw amethyst cluster. Perfect for placement on altars, desks, or nightstands to purify the surrounding space.",
    category: "stone",
    price: 499,
    salePrice: 349,
    isSale: true,
    images: ["gradient:stone"],
    crystalType: "amethyst",
    origin: "Brazil",
    stock: 25,
  },
  {
    name: "Black Tourmaline Stone",
    description: "Raw black tourmaline chunk. The ultimate psychic shield, guarding against negative energy, electromagnetic frequencies, and ill wishes.",
    category: "stone",
    price: 599,
    isSale: false,
    images: ["gradient:stone"],
    crystalType: "black tourmaline",
    origin: "Brazil",
    stock: 30,
  },
  {
    name: "Citrine Ring",
    description: "Bright golden citrine crystal set in a premium band. Symbolizes abundance, personal power, joy, and positive manifest energy.",
    category: "ring",
    price: 849,
    isSale: false,
    images: ["gradient:ring"],
    crystalType: "citrine",
    origin: "Brazil",
    stock: 7,
  },
  {
    name: "Tiger Eye Bracelet",
    description: "Gleaming golden-brown tiger eye crystal beads. Brings courage, focus, mental clarity, and shields against fear.",
    category: "bracelet",
    price: 899,
    salePrice: 699,
    isSale: true,
    images: ["gradient:bracelet"],
    crystalType: "tiger eye",
    origin: "South Africa",
    stock: 18,
  },
  {
    name: "Clear Quartz Point Stone",
    description: "Naturally formed clear quartz single terminated point. Excellent for meditation, energy channeling, and amplification work.",
    category: "stone",
    price: 449,
    isSale: false,
    images: ["gradient:stone"],
    crystalType: "clear quartz",
    origin: "Madagascar",
    stock: 22,
  },
  {
    name: "Labradorite Necklace",
    description: "Labradorite pendant showing magical flashes of blue and gold. The stone of transformation, awakening mystical abilities.",
    category: "necklace",
    price: 1599,
    isSale: false,
    images: ["gradient:necklace"],
    crystalType: "labradorite",
    origin: "Canada",
    stock: 9,
  },
];

export async function GET() {
  try {
    await connectDB();
    
    // Clear existing products
    await Product.deleteMany({});
    
    // Seed new products
    const seeded = await Product.insertMany(sampleProducts);
    
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      count: seeded.length,
      products: seeded,
    });
  } catch (error: any) {
    console.error("Database Seeding Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to seed database",
    }, { status: 500 });
  }
}
