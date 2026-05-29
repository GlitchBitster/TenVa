"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSession, signOut } from "next-auth/react";
import { User as UserIcon, ShoppingBag, Heart, MapPin, LogOut, ShieldCheck, Mail, Phone, Calendar, ArrowRight, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface Address {
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export default function AccountPage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses">("profile");
  const [loading, setLoading] = useState(true);

  // User Profile States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  // Lists states
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Add Address Form states
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<Address>({
    label: "Home",
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // 1. Fetch profile details
      const userRes = await fetch("/api/users");
      if (userRes.ok) {
        const userData = await userRes.json();
        setFullName(userData.fullName || "");
        setEmail(userData.email || "");
        setMobileNumber(userData.mobileNumber || "");
        setAddresses(userData.addresses || []);
      }

      // 2. Fetch order history
      const orderRes = await fetch("/api/orders");
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData);
      }
    } catch (err) {
      console.error("Failed to load user account data:", err);
      toast.error("Error loading account details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [session]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      toast.error("Name and Email are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, mobileNumber }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        
        // Trigger NextAuth session token update
        await update({
          fullName: updatedUser.fullName,
          mobileNumber: updatedUser.mobileNumber,
        });

        toast.success("Profile updated successfully!");
        fetchUserData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const { label, street, city, state, pincode, phone } = addressForm;
    if (!label || !street || !city || !state || !pincode || !phone) {
      toast.error("Please fill in all address details");
      return;
    }

    setLoading(true);
    try {
      const updatedAddresses = [...addresses, addressForm];
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: updatedAddresses }),
      });

      if (res.ok) {
        toast.success("Address added successfully!");
        setAddressForm({
          label: "Home",
          street: "",
          city: "",
          state: "",
          pincode: "",
          phone: "",
        });
        setIsAddingAddress(false);
        fetchUserData();
      } else {
        toast.error("Failed to add address");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving address");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (index: number) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    setLoading(true);
    try {
      const updatedAddresses = addresses.filter((_, idx) => idx !== index);
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: updatedAddresses }),
      });

      if (res.ok) {
        toast.success("Address deleted successfully!");
        fetchUserData();
      } else {
        toast.error("Failed to delete address");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting address");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-500/10 border-emerald-500 text-emerald-500";
      case "confirmed":
        return "bg-purple-500/10 border-purple-500 text-purple-500";
      default:
        return "bg-amber-500/10 border-amber-500 text-amber-500";
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-28 pb-20 px-6 md:px-12 max-w-6xl mx-auto space-y-10 font-dm-sans">
        {/* Title Header */}
        <div className="space-y-1">
          <span className="text-[10px] tracking-widest uppercase text-accent font-semibold">User Dashboard</span>
          <h1 className="font-cormorant text-4xl md:text-5xl text-text-ivory font-medium">My Account</h1>
          <p className="text-xs text-text-ivory/60">Configure your profile, manage shipping addresses, and review crystal order history.</p>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Left: Sidebar Navigation */}
          <div className="lg:col-span-1 glass border border-primary/20 rounded-2xl p-4 flex flex-col gap-1 w-full select-none">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full py-2.5 px-4 rounded-xl font-dm-sans text-xs tracking-wider uppercase flex items-center gap-3 transition-smooth cursor-pointer ${
                activeTab === "profile"
                  ? "bg-primary/25 text-accent border border-primary/30"
                  : "text-text-ivory/60 hover:text-text-ivory hover:bg-primary/10 border border-transparent"
              }`}
            >
              <UserIcon className="w-4 h-4 shrink-0" />
              Profile Details
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full py-2.5 px-4 rounded-xl font-dm-sans text-xs tracking-wider uppercase flex items-center gap-3 transition-smooth cursor-pointer ${
                activeTab === "orders"
                  ? "bg-primary/25 text-accent border border-primary/30"
                  : "text-text-ivory/60 hover:text-text-ivory hover:bg-primary/10 border border-transparent"
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              My Orders ({orders.length})
            </button>

            <Link
              href="/wishlist"
              className="w-full py-2.5 px-4 rounded-xl font-dm-sans text-xs tracking-wider uppercase flex items-center gap-3 text-text-ivory/60 hover:text-text-ivory hover:bg-primary/10 border border-transparent transition-smooth"
            >
              <Heart className="w-4 h-4 shrink-0" />
              My Wishlist
            </Link>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`w-full py-2.5 px-4 rounded-xl font-dm-sans text-xs tracking-wider uppercase flex items-center gap-3 transition-smooth cursor-pointer ${
                activeTab === "addresses"
                  ? "bg-primary/25 text-accent border border-primary/30"
                  : "text-text-ivory/60 hover:text-text-ivory hover:bg-primary/10 border border-transparent"
              }`}
            >
              <MapPin className="w-4 h-4 shrink-0" />
              Saved Addresses ({addresses.length})
            </button>

            <div className="h-[1px] bg-primary/15 my-2" />

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full py-2.5 px-4 rounded-xl font-dm-sans text-xs tracking-wider uppercase flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent transition-smooth cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Sign Out
            </button>
          </div>

          {/* Right: Tab Content Panels */}
          <div className="lg:col-span-3 min-h-[400px]">
            {loading && orders.length === 0 && addresses.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activeTab === "profile" ? (
              /* PROFILE details panel */
              <div className="glass border border-primary/20 rounded-3xl p-6 md:p-8 space-y-6">
                <h3 className="font-cormorant text-2xl text-accent font-semibold flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-accent" /> Profile Information
                </h3>

                <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-xl text-sm">
                  <div className="space-y-1.5">
                    <label className="text-xs text-text-ivory/60 flex items-center gap-1.5">
                      <UserIcon className="w-4 h-4 text-accent" /> Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-smooth"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-text-ivory/60 flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-accent" /> Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-smooth"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-text-ivory/60 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-accent" /> Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-smooth"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-light hover:shadow-[0_0_12px_rgba(107,33,168,0.4)] border border-primary-light/20 rounded-xl text-text-ivory font-dm-sans text-xs tracking-wider uppercase font-bold transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            ) : activeTab === "orders" ? (
              /* MY ORDERS panel */
              <div className="glass border border-primary/20 rounded-3xl p-6 md:p-8 space-y-6">
                <h3 className="font-cormorant text-2xl text-accent font-semibold flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" /> Order History
                </h3>

                {orders.length === 0 ? (
                  <div className="text-center py-12 text-text-ivory/40">
                    <p className="text-sm">You haven't placed any orders yet.</p>
                    <Link href="/collections" className="text-xs text-accent underline hover:text-primary-light uppercase tracking-wider block mt-4">
                      Browse Crystals
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        className="p-4 bg-[#1A1028]/60 border border-primary/20 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary/45 transition-smooth"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2.5">
                            <span className="font-dm-sans font-semibold text-text-ivory text-sm">
                              Order #{order._id.slice(-6).toUpperCase()}
                            </span>
                            <span className={`px-2 py-0.5 text-[9px] tracking-wider font-bold rounded border uppercase ${getStatusBadgeClass(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          
                          {/* Items description snippet */}
                          <p className="text-xs text-text-ivory/60 line-clamp-1">
                            {order.items.map((i: any) => `${i.name} (x${i.qty})`).join(", ")}
                          </p>
                          
                          <div className="flex items-center gap-4 text-[10px] text-text-ivory/40">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-accent" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                            <span>Total: <strong className="text-accent font-medium">₹{order.totalAmount}</strong></span>
                            {order.whatsappSent && (
                              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                <ShieldCheck className="w-3 h-3" /> WhatsApp Sent
                              </span>
                            )}
                          </div>
                        </div>

                        <Link
                          href={`/orders/${order._id}`}
                          className="w-full md:w-auto text-center px-4 py-2 border border-primary/30 hover:border-accent hover:text-accent rounded-lg text-text-ivory text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-1 transition-smooth"
                        >
                          View Details <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* ADDRESSES panel */
              <div className="glass border border-primary/20 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-cormorant text-2xl text-accent font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5" /> Saved Shipping Addresses
                  </h3>
                  
                  {!isAddingAddress && (
                    <button
                      onClick={() => setIsAddingAddress(true)}
                      className="px-3.5 py-2 border border-accent/40 hover:border-accent hover:text-accent rounded-xl text-text-ivory font-dm-sans text-xs tracking-wider uppercase font-semibold transition-smooth cursor-pointer"
                    >
                      + Add New
                    </button>
                  )}
                </div>

                {isAddingAddress ? (
                  /* Add Address Form */
                  <form onSubmit={handleAddAddress} className="space-y-4 max-w-xl text-sm border-t border-primary/10 pt-4">
                    <h4 className="text-xs tracking-wider uppercase text-text-ivory/60 font-semibold mb-2">New Address Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-xs text-text-ivory/60">Address Label (e.g. Home, Office)</label>
                        <input
                          type="text"
                          value={addressForm.label}
                          onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                          placeholder="Home"
                          className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none focus:border-primary-light"
                          required
                        />
                      </div>

                      <div className="col-span-2 space-y-1.5">
                        <label className="text-xs text-text-ivory/60">Street Address</label>
                        <input
                          type="text"
                          value={addressForm.street}
                          onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                          placeholder="Apartment, street, area..."
                          className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none focus:border-primary-light"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-text-ivory/60">City</label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          placeholder="Chennai"
                          className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none focus:border-primary-light"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-text-ivory/60">State</label>
                        <input
                          type="text"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          placeholder="Tamil Nadu"
                          className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none focus:border-primary-light"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-text-ivory/60">Pincode</label>
                        <input
                          type="text"
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                          placeholder="600040"
                          className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none focus:border-primary-light"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-text-ivory/60">Contact Phone</label>
                        <input
                          type="text"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          placeholder="+91 99999 99999"
                          className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none focus:border-primary-light"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-light border border-primary-light/20 rounded-xl text-text-ivory font-dm-sans text-xs tracking-wider uppercase font-bold hover:shadow-[0_0_12px_rgba(107,33,168,0.4)] transition-all duration-300 cursor-pointer"
                      >
                        Save Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="px-6 py-2.5 bg-surface border border-primary/20 rounded-xl text-text-ivory/80 font-dm-sans text-xs tracking-wider uppercase font-semibold transition-smooth cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12 text-text-ivory/40">
                    <p className="text-sm">You haven't saved any shipping addresses yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-[#1A1028]/60 border border-primary/20 rounded-2xl flex flex-col justify-between hover:border-primary/45 transition-smooth relative group"
                      >
                        <button
                          onClick={() => handleDeleteAddress(idx)}
                          className="absolute top-4 right-4 text-text-ivory/40 hover:text-red-400 transition-smooth p-1 cursor-pointer"
                          title="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="space-y-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[9px] font-bold text-accent uppercase tracking-widest">
                            <MapPin className="w-3 h-3" /> {addr.label}
                          </span>
                          <p className="text-xs text-text-ivory/80 leading-relaxed font-medium">
                            {addr.street},<br />
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-[10px] text-text-ivory/40">Phone: {addr.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
