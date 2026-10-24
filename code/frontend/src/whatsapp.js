import { CONFIG } from "./config.js";

// wa.me link with a pre-filled message, or "" when no WhatsApp number is set.
export function whatsappLink(text) {
  if (!CONFIG.whatsapp) return "";
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
}
