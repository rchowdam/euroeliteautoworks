import { useEffect, useState } from "react";
import { CONFIG } from "./config.js";
import { NAV } from "./content.js";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Brands from "./components/Brands.jsx";
import Dsg from "./components/Dsg.jsx";
import Fuel from "./components/Fuel.jsx";
import Services from "./components/Services.jsx";
import Approach from "./components/Approach.jsx";
import Gallery from "./components/Gallery.jsx";
import Process from "./components/Process.jsx";
import Faq from "./components/Faq.jsx";
import Booking from "./components/Booking.jsx";
import Footer from "./components/Footer.jsx";

const pad = (n) => String(n).padStart(2, "0");

export default function App() {
  const [media, setMedia] = useState([]);

  useEffect(() => {
    fetch(`${CONFIG.apiBaseUrl}/api/public/media`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setMedia)
      .catch(() => {});
  }, []);

  // The gallery (and its menu link) only appears once something is published,
  // so sections are numbered in order as they render.
  // Photos set to "hero-dsg" / "hero-fuel" in /admin cycle in that hero slide's panel instead.
  const gallery = media.filter((m) => !m.place || m.place === "gallery");
  const heroPhotos = {
    dsg: media.filter((m) => m.place === "hero-dsg"),
    fuel: media.filter((m) => m.place === "hero-fuel"),
  };
  const hasGallery = gallery.length > 0;
  const nav = NAV.filter((n) => hasGallery || !n.gallery);
  let next = 1;

  return (
    <>
      <Header nav={nav} />
      <main>
        <Hero photos={heroPhotos} />
        <Brands />
        <Dsg num={pad(next++)} />
        <Fuel num={pad(next++)} />
        <Services num={pad(next++)} />
        <Approach num={pad(next++)} />
        {hasGallery && <Gallery num={pad(next++)} items={gallery} />}
        <Process num={pad(next++)} />
        <Faq num={pad(next++)} />
        <Booking num={pad(next++)} />
      </main>
      <Footer nav={nav} />
    </>
  );
}
