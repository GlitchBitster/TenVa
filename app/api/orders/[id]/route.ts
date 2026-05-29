import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { auth } from "@/lib/auth";

// GET order details by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Security check: Only admin or the user who owns the order can view it
    if (session.user.role !== "admin" && order.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("GET Order Detail Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch order details" }, { status: 500 });
  }
}

// PATCH update order (Admin update status or Client update whatsappSent)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    const { status, whatsappSent } = data;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updates: any = {};

    // 1. Admin status update
    if (status !== undefined) {
      if (session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      if (!['pending', 'confirmed', 'delivered'].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updates.status = status;
    }

    // 2. WhatsApp message confirmation status
    if (whatsappSent !== undefined) {
      // Both user (after checkout redirection) and admin can mark whatsappSent as true
      updates.whatsappSent = !!whatsappSent;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("PATCH Order Detail Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update order" }, { status: 500 });
  }
}
