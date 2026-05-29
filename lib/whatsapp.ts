/**
 * Helper functions to generate pre-filled WhatsApp links for checkout and customer support
 */

interface WhatsAppItem {
  name: string;
  qty: number;
  price: number;
}

interface WhatsAppAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export function generateWhatsAppLink(
  adminPhone: string,
  customerName: string,
  customerPhone: string,
  items: WhatsAppItem[],
  totalAmount: number,
  address: WhatsAppAddress
): string {
  const itemsText = items
    .map((item) => `- ${item.name} x${item.qty} ₹${item.price}`)
    .join("\n");
    
  const fullAddress = `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`;

  const message = `🛍️ New Order from TanVi!\n\nCustomer: ${customerName}\nPhone: ${customerPhone}\nItems:\n${itemsText}\n\nTotal: ₹${totalAmount}\nAddress: ${fullAddress}\n\nPlease confirm this order.`;

  // Clean the phone number (remove +, spaces, dashes, etc.)
  const cleanNumber = adminPhone.replace(/\D/g, "");
  
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function generateSupportWhatsAppLink(adminPhone: string, orderId: string): string {
  const message = `Hello TanVi support, I need assistance with my Order ID: ${orderId}.`;
  const cleanNumber = adminPhone.replace(/\D/g, "");
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
