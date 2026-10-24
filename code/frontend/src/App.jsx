import { useEffect, useState } from "react";
import { CONFIG } from "./config.js";
import { NAV } from "./content.js";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Brands from "./components/Brands.jsx";
import Dsg from "./components/Dsg.jsx";
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
  // and the sections after it are numbered on from there.
  const hasGallery = media.length > 0;
  const nav = NAV.filter((n) => hasGallery || !n.gallery);
  let next = hasGallery ? 5 : 4;

  return (
    <>
      <Header nav={nav} />
      <main>
        <Hero />
        <Brands />
        <Dsg />
        <Services />
        <Approach />
        {hasGallery && <Gallery num="04" items={media} />}
        <Process num={pad(next++)} />
        <Faq num={pad(next++)} />
        <Booking num={pad(next++)} />
      </main>
      <Footer nav={nav} />
    </>
  );
}
