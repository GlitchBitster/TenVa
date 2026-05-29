import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background-dark border-t border-primary/20 pt-16 pb-8 px-6 md:px-12 text-text-ivory/80">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        {/* Brand Info */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-accent/40 bg-surface">
              <img src="/logo.jpeg" alt="TanVi Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-cormorant text-2xl tracking-widest font-semibold bg-gradient-to-r from-text-ivory to-accent bg-clip-text text-transparent">
              TANVI
            </span>
          </Link>
          <p className="font-dm-sans text-sm text-text-ivory/60 leading-relaxed max-w-sm">
            Discover trendy crystal ornaments, premium spiritual gifts, and stylish healing stones curated for modern mindful lifestyles.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-surface border border-primary/20 flex justify-center items-center hover:border-accent hover:text-accent transition-smooth"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-surface border border-primary/20 flex justify-center items-center hover:border-accent hover:text-accent transition-smooth"
              aria-label="Facebook"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918015819217"}`}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-surface border border-primary/20 flex justify-center items-center hover:border-accent hover:text-accent transition-smooth"
              aria-label="WhatsApp"
            >
              {/* WhatsApp custom icon */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.464L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.885 1.456 5.487 0 9.95-4.43 9.954-9.885.002-2.643-1.027-5.127-2.899-7.001C16.616 1.85 14.124.817 11.48.817 6.002.817 1.54 5.247 1.536 10.701c-.001 1.784.485 3.53 1.408 5.093l-.979 3.575 3.682-.965zm12.352-7.39c-.27-.135-1.602-.79-1.849-.88-.247-.09-.427-.135-.607.135-.18.27-.697.88-.854 1.06-.157.18-.315.2-.585.065-.27-.135-1.14-.42-2.172-1.34-1.03-.92-1.72-2.05-1.92-2.39-.2-.34-.02-.52.15-.69.15-.15.34-.395.51-.59.17-.197.23-.34.34-.567.11-.227.06-.425-.03-.605-.09-.18-.607-1.46-.83-2l-.4-.96c-.22-.53-.45-.53-.61-.54h-.53c-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.27s.97 2.63 1.11 2.82c.14.19 1.9 2.9 4.6 4.07.64.28 1.14.45 1.53.57.64.2 1.22.17 1.68.1.51-.08 1.6-.65 1.83-1.28.23-.63.23-1.18.16-1.29-.07-.11-.25-.2-.52-.335z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-cormorant text-lg text-accent tracking-wider font-semibold mb-5">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/" className="hover:text-accent transition-smooth">Home</Link>
            </li>
            <li>
              <Link href="/collections" className="hover:text-accent transition-smooth">Shop Collections</Link>
            </li>
            <li>
              <Link href="/#about" className="hover:text-accent transition-smooth">About Us</Link>
            </li>
            <li>
              <Link href="/wishlist" className="hover:text-accent transition-smooth">Wishlist</Link>
            </li>
            <li>
              <Link href="/#contact" className="hover:text-accent transition-smooth">Contact Us</Link>
            </li>
          </ul>
        </div>

        {/* Information Policies */}
        <div>
          <h3 className="font-cormorant text-lg text-accent tracking-wider font-semibold mb-5">Information</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/policies/privacy" className="hover:text-accent transition-smooth">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/policies/terms" className="hover:text-accent transition-smooth">Terms & Conditions</Link>
            </li>
            <li>
              <Link href="/policies/shipping" className="hover:text-accent transition-smooth">Shipping & Return</Link>
            </li>
            <li>
              <Link href="/policies/refund" className="hover:text-accent transition-smooth">Refund Policy</Link>
            </li>
          </ul>
        </div>

        {/* Address & Contacts */}
        <div className="space-y-4 text-sm">
          <h3 className="font-cormorant text-lg text-accent tracking-wider font-semibold mb-1">Our Store Address</h3>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="text-text-ivory/70 leading-relaxed">
              AJ-99, 2nd Street, Anna Nagar,<br />Chennai - 600040, Tamil Nadu, India
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-accent shrink-0" />
            <a href="tel:+918015819217" className="hover:text-accent transition-smooth">
              +91 80158 19217
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-accent shrink-0" />
            <a href="mailto:shop.dcrushy@gmail.com" className="hover:text-accent transition-smooth">
              shop.dcrushy@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright and Payment Gateways */}
      <div className="max-w-7xl mx-auto border-t border-primary/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-text-ivory/50">
        <p>&copy; {new Date().getFullYear()} TanVi Crystals. All rights reserved.</p>
        
        {/* Payment Gateways */}
        <div className="flex items-center gap-3 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-smooth">
          <span className="font-semibold text-[10px] tracking-wider text-text-ivory/70">GPAY</span>
          <span className="text-[10px] text-primary-light">|</span>
          <span className="font-semibold text-[10px] tracking-wider text-text-ivory/70">PHONEPE</span>
          <span className="text-[10px] text-primary-light">|</span>
          <span className="font-semibold text-[10px] tracking-wider text-text-ivory/70">PAYTM</span>
          <span className="text-[10px] text-primary-light">|</span>
          <span className="font-semibold text-[10px] tracking-wider text-text-ivory/70">RAZORPAY</span>
          <span className="text-[10px] text-primary-light">|</span>
          <span className="font-semibold text-[10px] tracking-wider text-accent">UPI</span>
        </div>
      </div>
    </footer>
  );
}
