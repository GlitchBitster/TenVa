import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";

// GET all products or filter/sort
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    
    const category = searchParams.get("category");
    const sort = searchParams.get("sort");
    const search = searchParams.get("search");

    const query: any = {};

    if (category && category !== "all") {
      query.category = category.toLowerCase().slice(0, -1); // e.g. 'rings' -> 'ring'
      if (category === "stone") {
        query.category = "stone";
      } else if (category === "bracelet") {
        query.category = "bracelet";
      } else if (category === "necklace") {
        query.category = "necklace";
      } else if (category === "ring") {
        query.category = "ring";
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { crystalType: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption: any = { createdAt: -1 }; // Default newest
    if (sort === "price-asc") {
      sortOption = { price: 1 };
    } else if (sort === "price-desc") {
      sortOption = { price: -1 };
    } else if (sort === "newest") {
      sortOption = { createdAt: -1 };
    }

    const products = await Product.find(query).sort(sortOption);
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("GET Products Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
  }
}

// POST new product (Admin only)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();

    const {
      name,
      description,
      category,
      price,
      salePrice,
      isSale,
      images,
      crystalType,
      origin,
      stock,
    } = data;

    if (!name || !description || !category || !price || !images || !crystalType || !origin) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const product = await Product.create({
      name,
      description,
      category,
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : undefined,
      isSale: !!isSale,
      images: Array.isArray(images) ? images : [images],
      crystalType,
      origin,
      stock: stock ? Number(stock) : 10,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("POST Product Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}

// PUT update product (Admin only)
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("PUT Product Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

// DELETE product (Admin only)
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("DELETE Product Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 500 });
  }
}
