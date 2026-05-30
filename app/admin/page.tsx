"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSession } from "next-auth/react";
import { ShoppingBag, Users, Layers, Plus, Trash2, Edit, CheckCircle, Truck, Upload, X, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

interface ProductForm {
  id?: string;
  name: string;
  description: string;
  category: "ring" | "bracelet" | "necklace" | "stone";
  price: string;
  salePrice: string;
  isSale: boolean;
  images: string[];
  crystalType: string;
  origin: string;
  stock: string;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"orders" | "users" | "products">("orders");
  const [loading, setLoading] = useState(true);

  // DB datasets
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Product Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState<ProductForm>({
    name: "",
    description: "",
    category: "ring",
    price: "",
    salePrice: "",
    isSale: false,
    images: [],
    crystalType: "",
    origin: "",
    stock: "10",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Orders
      const orderRes = await fetch("/api/orders");
      if (orderRes.ok) setOrders(await orderRes.json());

      // 2. Fetch Users
      const userRes = await fetch("/api/users");
      if (userRes.ok) setUsers(await userRes.json());

      // 3. Fetch Products
      const productRes = await fetch("/api/products");
      if (productRes.ok) setProducts(await productRes.json());
    } catch (err) {
      console.error(err);
      toast.error("Failed to load admin dataset");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && session.user?.role === "admin") {
      fetchData();
    }
  }, [session]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchData();
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating order status");
    }
  };

  const handleProductDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products?id=${productId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Product deleted successfully");
        fetchData();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting product");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onloadend = async () => {
      try {
        const base64data = reader.result as string;
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64data }),
        });

        if (res.ok) {
          const data = await res.json();
          setForm((prev) => ({
            ...prev,
            images: [...prev.images, data.url],
          }));
          toast.success("Image uploaded successfully!");
        } else {
          toast.error("Upload failed");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error uploading file");
      } finally {
        setUploadingImage(false);
      }
    };
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  const handleFormOpen = (mode: "add" | "edit", product?: any) => {
    setFormMode(mode);
    if (mode === "edit" && product) {
      setForm({
        id: product._id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price.toString(),
        salePrice: product.salePrice ? product.salePrice.toString() : "",
        isSale: product.isSale || false,
        images: product.images || [],
        crystalType: product.crystalType || "",
        origin: product.origin || "",
        stock: product.stock.toString(),
      });
    } else {
      setForm({
        name: "",
        description: "",
        category: "ring",
        price: "",
        salePrice: "",
        isSale: false,
        images: [],
        crystalType: "",
        origin: "",
        stock: "10",
      });
    }
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.description || !form.price || form.images.length === 0 || !form.crystalType || !form.origin) {
      toast.error("Please fill in all required fields and upload an image");
      return;
    }

    const payload = {
      ...form,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : undefined,
      stock: Number(form.stock),
    };

    try {
      let res;
      if (formMode === "add") {
        res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast.success(formMode === "add" ? "Product added!" : "Product updated!");
        setIsFormOpen(false);
        fetchData();
      } else {
        toast.error("Failed to save product");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving product details");
    }
  };

  if (!session || session.user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background-dark flex flex-col justify-center items-center p-6 text-center text-sm">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500 flex justify-center items-center text-red-500 mb-4 animate-bounce">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="font-cormorant text-3xl font-semibold text-text-ivory mb-2">Access Denied</h2>
        <p className="text-text-ivory/60 max-w-sm mb-6">This administration page is restricted. Please sign in as an administrator.</p>
        <button onClick={() => window.location.href = "/"} className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-light rounded-xl uppercase font-semibold text-xs tracking-wider">
          Return Home
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-28 pb-20 px-6 md:px-12 max-w-7xl mx-auto space-y-10 font-dm-sans">
        {/* Title */}
        <div className="space-y-1">
          <span className="text-[10px] tracking-widest uppercase text-accent font-semibold">Admin Panel</span>
          <h1 className="font-cormorant text-4xl md:text-5xl text-text-ivory font-medium">TenVa Dashboard</h1>
          <p className="text-xs text-text-ivory/60">Oversee store performance, manage product listings, track order statuses, and verify clients.</p>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {/* Tabs Sidebar */}
          <div className="glass border border-primary/20 rounded-2xl p-4 flex flex-col gap-1 select-none">
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full py-2.5 px-4 rounded-xl font-dm-sans text-xs tracking-wider uppercase flex items-center gap-3 transition-smooth cursor-pointer ${
                activeTab === "orders"
                  ? "bg-primary/25 text-accent border border-primary/30"
                  : "text-text-ivory/60 hover:text-text-ivory hover:bg-primary/10 border border-transparent"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Manage Orders ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`w-full py-2.5 px-4 rounded-xl font-dm-sans text-xs tracking-wider uppercase flex items-center gap-3 transition-smooth cursor-pointer ${
                activeTab === "products"
                  ? "bg-primary/25 text-accent border border-primary/30"
                  : "text-text-ivory/60 hover:text-text-ivory hover:bg-primary/10 border border-transparent"
              }`}
            >
              <Layers className="w-4 h-4" />
              Products Catalog ({products.length})
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`w-full py-2.5 px-4 rounded-xl font-dm-sans text-xs tracking-wider uppercase flex items-center gap-3 transition-smooth cursor-pointer ${
                activeTab === "users"
                  ? "bg-primary/25 text-accent border border-primary/30"
                  : "text-text-ivory/60 hover:text-text-ivory hover:bg-primary/10 border border-transparent"
              }`}
            >
              <Users className="w-4 h-4" />
              Registered Users ({users.length})
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activeTab === "orders" ? (
              /* ORDERS Manager Panel */
              <div className="glass border border-primary/20 rounded-3xl p-6 md:p-8 space-y-6">
                <h3 className="font-cormorant text-2xl text-accent font-semibold flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" /> Incoming Store Orders
                </h3>

                {orders.length === 0 ? (
                  <p className="text-sm text-text-ivory/50 text-center py-10">No orders received yet.</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        className="p-4 bg-[#1A1028]/60 border border-primary/20 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary/45 transition-smooth text-xs"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-text-ivory text-sm">
                              Order #{order._id.slice(-6).toUpperCase()}
                            </span>
                            <span className={`px-2 py-0.5 text-[9px] tracking-wider font-bold rounded border uppercase ${
                              order.status === "delivered"
                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                                : order.status === "confirmed"
                                ? "bg-purple-500/10 border-purple-500 text-purple-500"
                                : "bg-amber-500/10 border-amber-500 text-amber-500"
                            }`}>
                              {order.status}
                            </span>
                            {order.whatsappSent && (
                              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                                <CheckCircle className="w-3 h-3" /> WhatsApp Sent
                              </span>
                            )}
                          </div>
                          
                          <p className="text-text-ivory/60 leading-normal">
                            {order.items.map((i: any) => `${i.name} (x${i.qty})`).join(", ")}
                          </p>
                          
                          <div className="text-[10px] text-text-ivory/40 space-y-0.5">
                            <p>Customer ID: {order.userId}</p>
                            <p>Shipping: {order.deliveryAddress.street}, {order.deliveryAddress.city} (Phone: {order.deliveryAddress.phone})</p>
                            <p>Date: {new Date(order.createdAt).toLocaleString()} | Total: <strong className="text-accent font-medium">₹{order.totalAmount}</strong></p>
                          </div>
                        </div>

                        {/* Status Actions */}
                        <div className="flex gap-2 w-full md:w-auto">
                          {order.status === "pending" && (
                            <button
                              onClick={() => handleStatusUpdate(order._id, "confirmed")}
                              className="flex-1 md:flex-none px-3.5 py-2 bg-gradient-to-r from-primary to-primary-light rounded-lg text-text-ivory font-semibold uppercase tracking-wider hover:shadow-[0_0_8px_rgba(107,33,168,0.3)] flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Confirm
                            </button>
                          )}
                          {order.status !== "delivered" && (
                            <button
                              onClick={() => handleStatusUpdate(order._id, "delivered")}
                              className="flex-1 md:flex-none px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg text-background-dark font-bold uppercase tracking-wider hover:shadow-[0_0_8px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5" /> Deliver
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === "products" ? (
              /* PRODUCTS Catalog Manager Panel */
              <div className="glass border border-primary/20 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-cormorant text-2xl text-accent font-semibold flex items-center gap-2">
                    <Layers className="w-5 h-5" /> Product Inventory Catalog
                  </h3>
                  
                  <button
                    onClick={() => handleFormOpen("add")}
                    className="px-3.5 py-2 bg-gradient-to-r from-primary to-primary-light rounded-xl text-text-ivory font-dm-sans text-xs tracking-wider uppercase font-semibold flex items-center gap-1.5 hover:shadow-[0_0_12px_rgba(107,33,168,0.4)] transition-smooth border border-primary-light/10 hover:border-accent cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                </div>

                {products.length === 0 ? (
                  <p className="text-sm text-text-ivory/50 text-center py-10">No products registered yet.</p>
                ) : (
                  <div className="space-y-3.5">
                    {products.map((product) => {
                      const hasPlaceholderImg = !product.images || !product.images[0] || product.images[0].startsWith("gradient:");
                      return (
                        <div
                          key={product._id}
                          className="p-3 bg-[#1A1028]/60 border border-primary/20 rounded-2xl flex justify-between items-center gap-4 hover:border-primary/45 transition-smooth text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface border border-primary/10 flex justify-center items-center shrink-0 select-none">
                              {hasPlaceholderImg ? (
                                <span className="font-cormorant italic text-[8px] text-accent/80 text-center">
                                  {product.crystalType}
                                </span>
                              ) : (
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-text-ivory text-sm capitalize">{product.name}</h4>
                              <p className="text-[10px] text-text-ivory/40 uppercase tracking-widest">
                                {product.category} | Type: {product.crystalType} | Stock: {product.stock}
                              </p>
                              <span className="text-accent mt-0.5 block font-medium">
                                ₹{product.isSale && product.salePrice ? product.salePrice : product.price}{" "}
                                {product.isSale && (
                                  <span className="text-[10px] text-text-ivory/40 line-through">₹{product.price}</span>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Catalog Action buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleFormOpen("edit", product)}
                              className="p-2 border border-primary/20 hover:border-accent hover:text-accent rounded-lg text-text-ivory/60 transition-smooth cursor-pointer"
                              title="Edit product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleProductDelete(product._id)}
                              className="p-2 border border-primary/20 hover:border-red-400 rounded-lg text-text-ivory/60 hover:text-red-400 transition-smooth cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* USERS List Panel */
              <div className="glass border border-primary/20 rounded-3xl p-6 md:p-8 space-y-6">
                <h3 className="font-cormorant text-2xl text-accent font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5" /> Registered Store Users
                </h3>

                {users.length === 0 ? (
                  <p className="text-sm text-text-ivory/50 text-center py-10">No users found.</p>
                ) : (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div
                        key={user._id}
                        className="p-4 bg-[#1A1028]/60 border border-primary/20 rounded-2xl space-y-1 hover:border-primary/45 transition-smooth text-xs"
                      >
                        <div className="flex justify-between items-center font-semibold text-text-ivory text-sm">
                          <span>{user.fullName}</span>
                          <span className={`px-2 py-0.5 text-[8px] font-bold rounded uppercase tracking-wider ${
                            user.role === "admin" ? "bg-accent/15 border border-accent text-accent" : "bg-primary/10 border border-primary/20 text-text-ivory/60"
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <p className="text-text-ivory/60 font-medium">Email: {user.email} | Phone: {user.mobileNumber || "N/A"}</p>
                        <p className="text-[10px] text-text-ivory/40">
                          Auth: {user.authProvider} | Created: {new Date(user.createdAt).toLocaleDateString()} | Addresses: {user.addresses?.length || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Product Modal Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#1A1028]/95 border border-primary/30 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-8">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-primary/20 bg-surface/50 backdrop-blur-md">
              <h3 className="font-cormorant text-xl tracking-wider text-accent font-semibold">
                {formMode === "add" ? "Register New Ornament" : "Modify Catalog Product"}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-text-ivory/60 hover:text-accent">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable form body */}
            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-sm font-dm-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs text-text-ivory/60">Product Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Amethyst Healing Bracelet"
                    className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs text-text-ivory/60">Product Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e: any) => setForm({ ...form, description: e.target.value })}
                    placeholder="Handcrafted crystal bracelet featuring natural amethyst gems..."
                    rows={3}
                    className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none text-xs leading-relaxed"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-text-ivory/60">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e: any) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none cursor-pointer"
                  >
                    <option value="ring">Ring</option>
                    <option value="bracelet">Bracelet</option>
                    <option value="necklace">Necklace</option>
                    <option value="stone">Stone</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-text-ivory/60">Stock Level *</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-text-ivory/60">Original Price (INR) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="899"
                    className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-text-ivory/60">Sale Price (INR - Optional)</label>
                  <input
                    type="number"
                    value={form.salePrice}
                    onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                    placeholder="649"
                    className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none"
                  />
                </div>

                <div className="col-span-2 py-1 flex items-center gap-2 text-xs text-text-ivory/80 select-none">
                  <input
                    type="checkbox"
                    id="isSale"
                    checked={form.isSale}
                    onChange={(e) => setForm({ ...form, isSale: e.target.checked })}
                    className="accent-primary cursor-pointer w-4 h-4"
                  />
                  <label htmlFor="isSale" className="cursor-pointer">Mark this product as discounted (FLASH SALE)</label>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-text-ivory/60">Crystal Type *</label>
                  <input
                    type="text"
                    value={form.crystalType}
                    onChange={(e) => setForm({ ...form, crystalType: e.target.value })}
                    placeholder="Amethyst, Quartz, etc..."
                    className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-text-ivory/60">Geographical Origin *</label>
                  <input
                    type="text"
                    value={form.origin}
                    onChange={(e) => setForm({ ...form, origin: e.target.value })}
                    placeholder="Brazil, India, Madagascar..."
                    className="w-full bg-[#0D0A1A]/80 border border-primary/20 rounded-xl px-4 py-2.5 text-text-ivory focus:outline-none"
                    required
                  />
                </div>

                {/* Cloudinary Image Uploader */}
                <div className="col-span-2 space-y-3">
                  <label className="text-xs text-text-ivory/60 block">Product Images * (Upload via Cloudinary)</label>
                  
                  {/* File Upload Box */}
                  <div className="relative border border-dashed border-primary/30 rounded-xl p-6 bg-surface/30 text-center hover:border-accent transition-smooth flex flex-col items-center justify-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className={`w-8 h-8 text-accent mb-2 ${uploadingImage ? "animate-pulse" : ""}`} />
                    <p className="text-xs text-text-ivory/60">
                      {uploadingImage ? "Uploading to Cloudinary..." : "Click or Drag product image file to upload"}
                    </p>
                  </div>

                  {/* Uploaded Images Thumbnails */}
                  {form.images.length > 0 && (
                    <div className="flex flex-wrap gap-3 pt-1 select-none">
                      {form.images.map((imgUrl, index) => (
                        <div
                          key={index}
                          className="w-16 h-16 rounded-lg overflow-hidden border border-primary/25 relative group shrink-0"
                        >
                          <img src={imgUrl} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-background-dark hover:scale-110 transition-smooth cursor-pointer"
                          >
                            <X className="w-3 h-3 text-text-ivory" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fallback Checkbox (Temporary Placeholder) */}
                  {form.images.length === 0 && (
                    <div className="flex items-center gap-2 text-[10px] text-text-ivory/40">
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, images: ["gradient:placeholder"] }))}
                        className="text-accent underline hover:text-primary-light cursor-pointer"
                      >
                        Use crystal gradient placeholder image
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-primary/10">
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-light hover:shadow-[0_0_12px_rgba(107,33,168,0.4)] border border-primary-light/20 hover:border-accent rounded-xl text-text-ivory font-dm-sans text-xs tracking-wider uppercase font-bold transition-all duration-300 disabled:opacity-50 cursor-pointer"
                >
                  {formMode === "add" ? "Create Product" : "Save Changes"}
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-2.5 bg-surface border border-primary/25 rounded-xl text-text-ivory/80 font-dm-sans text-xs tracking-wider uppercase font-semibold transition-smooth cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
