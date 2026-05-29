"use client";

import React, { useState, useEffect } from "react";
import { X, MapPin, Phone, Truck, Send } from "lucide-react";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: {
    productId: string;
    name: string;
    price: number;
    qty: number;
    image?: string;
  }[];
  totalAmount: number;
}

interface AddressForm {
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export default function OrderModal({ isOpen, onClose, items, totalAmount }: OrderModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(-1);
  const [form, setForm] = useState<AddressForm>({
    label: "Home",
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  // Fetch saved user addresses on mount
  useEffect(() => {
    if (isOpen) {
      const fetchUserData = async () => {
        try {
          const res = await fetch("/api/users");
          if (res.ok) {
            const data = await res.json();
            if (data.addresses && data.addresses.length > 0) {
              setSavedAddresses(data.addresses);
              // Pre-select first address
              setSelectedAddressIndex(0);
              const addr = data.addresses[0];
              setForm({
                label: addr.label,
                street: addr.street,
                city: addr.city,
                state: addr.state,
                pincode: addr.pincode,
                phone: addr.phone,
              });
            }
          }
        } catch (err) {
          console.error("Failed to load user addresses:", err);
        }
      };
      fetchUserData();
    }
  }, [isOpen]);

  const handleAddressSelect = (index: number) => {
    setSelectedAddressIndex(index);
    if (index === -1) {
      // Clear form for custom input
      setForm({
        label: "Home",
        street: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
      });
    } else {
      const addr = savedAddresses[index];
      setForm({
        label: addr.label,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        phone: addr.phone,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (selectedAddressIndex !== -1) {
      setSelectedAddressIndex(-1); // Switch to custom if user edits
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.street || !form.city || !form.state || !form.pincode || !form.phone) {
      toast.error("Please fill in all address details");
      return;
    }

    setLoading(true);

    try {
      // 1. Save order in MongoDB (status: pending)
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          totalAmount,
          deliveryAddress: form,
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || "Failed to place order in database");
      }

      const order = await orderRes.json();

      // 2. Also save the address to user profile if it's a new address
      if (selectedAddressIndex === -1) {
        try {
          const updatedAddresses = [...savedAddresses, form];
          await fetch("/api/users", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ addresses: updatedAddresses }),
          });
        } catch (addrErr) {
          console.error("Failed to save address to profile:", addrErr);
        }
      }

      // 3. Construct WhatsApp Link
      const adminPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918015819217";
      const itemsList = items.map((item) => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
      }));

      // Generate pre-filled URL
      const whatsappUrl = generateWhatsAppLink(
        adminPhone,
        form.label === "Home" ? "Valued Customer" : form.label, // generic label if name is unknown
        form.phone,
        itemsList,
        totalAmount,
        form
      );

      // 4. Mark order as whatsappSent: true
      await fetch(`/api/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappSent: true }),
      });

      // 5. Open WhatsApp in new tab
      window.open(whatsappUrl, "_blank");

      // 6. Success notifications & Redirects
      toast.success("Order placed! Redirecting to WhatsApp...");
      onClose();
      router.push(`/orders/${order._id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to complete checkout");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      {/* Modal Content */}
      <div className="relative w-full max-w-xl bg-[#1A1028]/95 border border-primary/30 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8),_0_0_30px_rgba(107,33,168,0.3)] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-primary/20 bg-surface/50 backdrop-blur-md">
          <div className="flex items-center gap-2 text-accent">
            <Truck className="w-5 h-5" />
            <h3 className="font-cormorant text-xl tracking-wider font-semibold">Confirm Your Order</h3>
          </div>
          <button onClick={onClose} className="text-text-ivory/60 hover:text-accent transition-smooth">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm font-dm-sans">
          {/* Order Summary Summary Panel */}
          <div className="bg-surface/50 border border-primary/10 rounded-2xl p-4 space-y-3">
            <h4 className="font-dm-sans text-xs tracking-wider uppercase text-text-ivory/60">Items summary</h4>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between items-center text-xs">
                  <span className="text-text-ivory line-clamp-1">{item.name} <span className="text-accent">x{item.qty}</span></span>
                  <span className="text-text-ivory/80 font-medium">₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-primary/10 pt-2.5 flex justify-between items-center font-semibold text-accent">
              <span>Total Amount</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>

          {/* Saved Addresses Panel */}
          {savedAddresses.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs tracking-wider uppercase text-text-ivory/60 block">Select delivery address</label>
              <div className="grid grid-cols-2 gap-3">
                {savedAddresses.map((addr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddressSelect(idx)}
                    className={`p-3 rounded-xl border text-left transition-smooth cursor-pointer ${
                      selectedAddressIndex === idx
                        ? "bg-primary/20 border-accent text-text-ivory"
                        : "bg-surface/30 border-primary/10 text-text-ivory/60 hover:border-primary/40"
                    }`}
                  >
                    <div className="font-semibold text-xs text-accent flex items-center gap-1.5 mb-1 uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5" />
                      {addr.label}
                    </div>
                    <p className="text-[11px] line-clamp-2 leading-relaxed">{addr.street}, {addr.city}</p>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddressSelect(-1)}
                  className={`p-3 rounded-xl border text-center flex flex-col justify-center items-center gap-1 transition-smooth cursor-pointer ${
                    selectedAddressIndex === -1
                      ? "bg-primary/20 border-accent text-text-ivory"
                      : "bg-surface/30 border-primary/10 text-text-ivory/60 hover:border-primary/40"
                  }`}
                >
                  <span className="font-semibold text-xs text-accent uppercase tracking-wider">+ New Address</span>
                </button>
              </div>
            </div>
          )}

          {/* Address Fields */}
          <div className="space-y-4 pt-1">
            <h4 className="text-xs tracking-wider uppercase text-text-ivory/60">Shipping address details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs text-text-ivory/70 font-medium">Address Label (e.g. Home, Office)</label>
                <input
                  type="text"
                  name="label"
                  value={form.label}
                  onChange={handleInputChange}
                  placeholder="Home, Office..."
                  className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-smooth"
                  required
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="text-xs text-text-ivory/70 font-medium">Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={form.street}
                  onChange={handleInputChange}
                  placeholder="Apartment number, street name..."
                  className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-smooth"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-ivory/70 font-medium">City</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleInputChange}
                  placeholder="Chennai"
                  className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-smooth"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-ivory/70 font-medium">State</label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleInputChange}
                  placeholder="Tamil Nadu"
                  className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-smooth"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-ivory/70 font-medium">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleInputChange}
                  placeholder="600040"
                  className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-smooth"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-ivory/70 font-medium flex items-center gap-1">
                  <Phone className="w-3 h-3 text-accent" /> Contact Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  placeholder="+91 99999 99999"
                  className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-smooth"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:shadow-[0_0_15px_rgba(37,211,102,0.4)] hover:border-accent border border-emerald-500/30 rounded-xl text-background-dark font-dm-sans text-xs tracking-widest font-bold uppercase flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            {loading ? "Completing Checkout..." : "Order & Confirm via WhatsApp"}
          </button>
        </form>
      </div>
    </div>
  );
}
