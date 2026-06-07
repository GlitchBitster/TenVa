import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";
import logger from "@/lib/logger";

// GET user's wishlist with populated product details
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id).populate("wishlist");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.wishlist || []);
  } catch (error: any) {
    logger.error("GET Wishlist Error", error);
    return NextResponse.json({ error: error.message || "Failed to fetch wishlist" }, { status: 500 });
  }
}

// POST toggle product in user's wishlist
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const pId = new mongoose.Types.ObjectId(productId);
    const index = user.wishlist.indexOf(pId as any);

    let isAdded = false;
    if (index > -1) {
      // Remove it
      user.wishlist.splice(index, 1);
    } else {
      // Add it
      user.wishlist.push(pId as any);
      isAdded = true;
    }

    await user.save();
    return NextResponse.json({ success: true, isAdded, wishlist: user.wishlist });
  } catch (error: any) {
    logger.error("POST Wishlist Error", error);
    return NextResponse.json({ error: error.message || "Failed to update wishlist" }, { status: 500 });
  }
}
