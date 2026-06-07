import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";
import logger from "@/lib/logger";

// GET user orders or all orders (if Admin)
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let orders;
    if (session.user.role === "admin") {
      // Admin sees all orders
      orders = await Order.find({}).sort({ createdAt: -1 });
    } else {
      // User sees only their orders
      orders = await Order.find({ userId: session.user.id }).sort({ createdAt: -1 });
    }

    return NextResponse.json(orders);
  } catch (error: any) {
    logger.error("GET Orders Error", error);
    return NextResponse.json({ error: error.message || "Failed to fetch orders" }, { status: 500 });
  }
}

// POST create new order
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    const { items, totalAmount, deliveryAddress } = data;

    if (!items || !Array.isArray(items) || items.length === 0 || !totalAmount || !deliveryAddress) {
      return NextResponse.json({ error: "Missing required order details" }, { status: 400 });
    }

    // 1. Create the order document
    const order = await Order.create({
      userId: session.user.id,
      items,
      totalAmount: Number(totalAmount),
      deliveryAddress,
      status: "pending",
      whatsappSent: false,
    });

    // 2. Adjust stock levels (decrement stock of purchased items)
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.qty }
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    logger.error("POST Order Error", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
