import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { generateSupportWhatsAppLink } from "@/lib/whatsapp";
import { Calendar, Package, MapPin, CheckCircle, ShieldCheck, ChevronRight, MessageCircle } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session || !session.user) {
    redirect("/signin");
  }

  await connectDB();

  let order;
  try {
    order = await Order.findById(id);
  } catch (err) {
    console.error(err);
    return notFound();
  }

  if (!order) {
    return notFound();
  }

  // Security check: Only Admin or the owner can view this order
  if (session.user.role !== "admin" && order.userId.toString() !== session.user.id) {
    return notFound();
  }

  // Enrich order items with images from the Product catalog
  const enrichedItems = await Promise.all(
    order.items.map(async (item) => {
      const product = await Product.findById(item.productId).select("images category crystalType");
      return {
        productId: item.productId.toString(),
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: product?.images?.[0] || null,
        category: product?.category || null,
        crystalType: product?.crystalType || null,
      };
    })
  );

  const adminPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918015819217";
  const supportLink = generateSupportWhatsAppLink(adminPhone, order._id.toString());

  // Determine active timeline steps
  const steps = [
    { label: "Order Placed", status: "pending", desc: "We received your order request." },
    { label: "Order Confirmed", status: "confirmed", desc: "Your order details have been verified." },
    { label: "Delivered", status: "delivered", desc: "Your crystal package has arrived!" },
  ];

  const getStepIndex = (status: string) => {
    if (status === "delivered") return 2;
    if (status === "confirmed") return 1;
    return 0; // pending
  };

  const currentStepIdx = getStepIndex(order.status);

  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-28 pb-20 px-6 md:px-12 max-w-4xl mx-auto space-y-8 font-dm-sans">
        {/* Header Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-text-ivory/50 select-none">
          <Link href="/account" className="hover:text-accent transition-smooth">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <span>Order Details</span>
        </div>

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2 border-b border-primary/10">
          <div className="space-y-1">
            <span className="text-[10px] tracking-widest uppercase text-accent font-semibold">Order Summary</span>
            <h1 className="font-cormorant text-3xl md:text-4xl text-text-ivory font-medium">
              Order #{order._id.toString().slice(-6).toUpperCase()}
            </h1>
            <div className="flex items-center gap-4 text-xs text-text-ivory/55">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span>Total: <strong className="text-accent font-medium">₹{order.totalAmount}</strong></span>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
            order.status === "delivered"
              ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
              : order.status === "confirmed"
              ? "bg-purple-500/10 border-purple-500 text-purple-500"
              : "bg-amber-500/10 border-amber-500 text-amber-500"
          }`}>
            {order.status}
          </span>
        </div>

        {/* Order Status Timeline Banner */}
        <div className="glass border border-primary/20 rounded-3xl p-6 md:p-8 space-y-6">
          <h3 className="font-cormorant text-xl text-accent font-semibold flex items-center gap-2">
            <Package className="w-5 h-5" /> Delivery Timeline
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative pt-2 select-none">
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStepIdx;
              const isActive = idx === currentStepIdx;

              return (
                <div key={idx} className="flex gap-4 md:flex-col items-start md:items-center relative">
                  {/* Circle Icon */}
                  <div className={`w-8 h-8 rounded-full border-2 flex justify-center items-center shrink-0 z-10 ${
                    isCompleted
                      ? "bg-primary border-accent text-accent shadow-[0_0_12px_rgba(212,175,122,0.4)]"
                      : "bg-surface border-primary/20 text-text-ivory/30"
                  }`}>
                    {isCompleted ? <CheckCircle className="w-4 h-4 text-accent fill-background-dark" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                  </div>

                  {/* Text Details */}
                  <div className="space-y-1 md:text-center">
                    <h4 className={`font-semibold text-xs uppercase tracking-wider ${isCompleted ? "text-text-ivory" : "text-text-ivory/40"}`}>
                      {step.label}
                    </h4>
                    <p className="text-[11px] text-text-ivory/50 leading-relaxed max-w-xs">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details Grid: Items and Delivery Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Product List */}
          <div className="lg:col-span-2 glass border border-primary/20 rounded-3xl p-6 space-y-4">
            <h3 className="font-cormorant text-xl text-accent font-semibold">Ordered Items</h3>
            <div className="space-y-3">
              {enrichedItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between items-center p-3 bg-[#1A1028]/60 border border-primary/10 rounded-2xl gap-4"
                >
                  <div className="flex items-center gap-3">
                    {/* Image thumb */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-primary/10 bg-surface flex justify-center items-center shrink-0 select-none">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-cormorant italic text-[9px] text-accent/80 text-center px-1">
                          {item.crystalType || "Crystal"}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-cormorant text-base text-text-ivory font-medium line-clamp-1 leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-[9px] text-text-ivory/40 uppercase tracking-widest">{item.category}</p>
                      <span className="text-[11px] text-accent mt-0.5 block">
                        ₹{item.price} <span className="text-text-ivory/40 font-normal">x{item.qty}</span>
                      </span>
                    </div>
                  </div>

                  <span className="font-semibold text-text-ivory/80 text-sm">
                    ₹{item.price * item.qty}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Billing */}
            <div className="border-t border-primary/10 pt-4 flex justify-between items-center font-semibold text-accent text-base">
              <span>Total Price</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Right: Address and Support details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Delivery address details card */}
            <div className="glass border border-primary/20 rounded-3xl p-6 space-y-4">
              <h3 className="font-cormorant text-xl text-accent font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Delivery Address
              </h3>
              
              <div className="space-y-3 text-xs">
                <span className="inline-block px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[9px] font-bold text-accent uppercase tracking-widest">
                  {order.deliveryAddress.label}
                </span>
                
                <p className="text-text-ivory/80 leading-relaxed">
                  {order.deliveryAddress.street},<br />
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                </p>
                
                <div className="pt-2 border-t border-primary/10">
                  <p className="text-[10px] text-text-ivory/40">Contact Phone:</p>
                  <p className="font-semibold text-text-ivory mt-0.5">{order.deliveryAddress.phone}</p>
                </div>
              </div>
            </div>

            {/* WhatsApp Support CTA */}
            <a
              href={supportLink}
              target="_blank"
              rel="noreferrer"
              className="w-full py-4 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:shadow-[0_0_15px_rgba(37,211,102,0.4)] border border-emerald-500/20 hover:border-accent rounded-xl text-background-dark font-dm-sans text-xs tracking-widest font-bold uppercase flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.01]"
            >
              <MessageCircle className="w-4.5 h-4.5 text-text-ivory fill-current" />
              Contact Support on WA
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
