import { useEffect, useRef, useState } from "react";
import { CONFIG, telLink } from "../config.js";
import { HERO_SLIDES } from "../content.js";
import { whatsappLink } from "../whatsapp.js";
import FuelDiagram from "./FuelDiagram.jsx";
import GearboxDiagram from "./GearboxDiagram.jsx";

const DIAGRAMS = { dsg: GearboxDiagram, fuel: FuelDiagram };
const PHOTO_SECONDS = 3.5;
const SLIDE_SECONDS = 7;

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Slides change when the red bar under the active tab finishes (CSS animation), so
// pausing is just pausing the animation, and with reduced motion there is no auto-play.
export default function Hero({ photos = {} }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);

  const go = (i) => setActive((i + HERO_SLIDES.length) % HERO_SLIDES.length);

  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
  };

  return (
    <section
      className={`hero${paused ? " is-paused" : ""}`}
      id="top"
      aria-roledescription="carousel"
      aria-label="What we do"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="wrap hero__grid" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="hero__text">
          <div className="hero__stack">
            {HERO_SLIDES.map((s, i) => {
              // One h1 for the page; the other slides use h2 with the same look.
              const Title = i === 0 ? "h1" : "h2";
              return (
                <div
                  key={s.id}
                  className={`hero__slide${i === active ? " is-active" : ""}`}
                  aria-hidden={i !== active}
                  aria-roledescription="slide"
                >
                  <p className="eyebrow">{s.eyebrow}</p>
                  <Title className="hero__title">
                    {s.title[0]}
                    <em>{s.title[1]}</em>
                  </Title>
                  <p className="lead">{s.lead}</p>
                </div>
              );
            })}
          </div>
          <div className="actions">
            <a href="#book" className="btn btn--primary">Book a diagnosis</a>
            {CONFIG.whatsapp && (
              <a href={whatsappLink("Hello, I'd like to book a diagnosis for my car.")} className="btn btn--line" target="_blank" rel="noreferrer">
                WhatsApp us
              </a>
            )}
          </div>
          {CONFIG.contacts.length > 0 && (
            <ul className="callus">
              {CONFIG.contacts.map((c) => (
                <li key={c.phone}>
                  <span className="label">Call {c.name}</span>
                  <a href={telLink(c.phone)}>{c.phone}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="hero__stack">
          {HERO_SLIDES.map((s, i) => {
            const Diagram = DIAGRAMS[s.id];
            const own = photos[s.id] || [];
            return (
              <figure key={s.id} className={`hero__panel hero__slide${i === active ? " is-active" : ""}`} aria-hidden={i !== active}>
                {own.length > 0 ? <PhotoCycle photos={own} running={i === active && !paused} /> : <Diagram />}
                <figcaption>
                  <span className="mono">{s.codes}</span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>

      <div className="wrap hero__tabs">
        {HERO_SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={`hero__tab${i === active ? " is-active" : ""}`}
            aria-current={i === active}
            onClick={() => go(i)}
          >
            {i === active && (
              <span
                className="hero__bar"
                // A slide with photos stays up long enough to show each of them once.
                style={{ animationDuration: `${Math.max(SLIDE_SECONDS, (photos[s.id] || []).length * PHOTO_SECONDS)}s` }}
                onAnimationEnd={() => go(active + 1)}
              />
            )}
            <span className="mono">{String(i + 1).padStart(2, "0")}</span> {s.tab}
          </button>
        ))}
      </div>
    </section>
  );
}

// Photos chosen for a slide in /admin, fading one after the other while the slide is showing.
function PhotoCycle({ photos, running }) {
  const [shown, setShown] = useState(0);
  const current = shown % photos.length;

  useEffect(() => {
    if (!running || photos.length < 2 || reducedMotion()) return undefined;
    const timer = setInterval(() => {
      setShown((n) => n + 1);
    }, PHOTO_SECONDS * 1000);
    return () => {
      clearInterval(timer);
    };
  }, [running, photos.length]);

  return (
    <div className="hero__photos">
      {photos.map((p, i) => (
        <img key={p.id} src={p.url} alt={p.caption || ""} className={i === current ? "is-shown" : ""} />
      ))}
      {photos.length > 1 && (
        <span className="hero__count mono">
          {current + 1} / {photos.length}
        </span>
      )}
    </div>
  );
}
