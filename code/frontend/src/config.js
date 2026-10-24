// Business details shown on the page. Empty values are simply hidden,
// so fill these in when they are known (no rebuild of anything else needed).
export const CONFIG = {
  brand: "Euro Elite Auto Works",
  tagline: "German car & DSG specialists",
  // People to call (from the business card). Shown as tel: links; numbers are Indian mobiles.
  contacts: [
    { name: "Chandu", phone: "93919 41493" },
    { name: "Arun", phone: "94898 40206" },
  ],
  // WhatsApp number in international format, digits only, e.g. "919000000000".
  // When set, the booking form also opens WhatsApp with the details filled in.
  whatsapp: "919489840206", // Arun
  email: "",
  // One line per entry.
  address: ["Huda Layout, Nallagandla", "Hyderabad, Telangana"],
  // Google Maps: the link opens the listing; the pin (lat, lng) is used for the map on the page.
  mapUrl: "https://maps.app.goo.gl/QiwSrnBdRXuAUaFr7",
  mapPin: [17.474166, 78.3017344],
  hours: [],
  // e.g. "12 months / 10,000 km". Empty = the warranty line is not shown.
  warranty: "",
  // Where the form posts. "" = same address as the page (the backend serves both).
  apiBaseUrl: "",
};

// "93919 41493" -> "tel:+919391941493"
export const telLink = (phone) => `tel:+91${phone.replace(/\D/g, "").slice(-10)}`;

