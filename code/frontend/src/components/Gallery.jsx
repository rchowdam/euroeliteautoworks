import { useEffect, useState } from "react";
import { GALLERY } from "../content.js";
import SectionHead from "./SectionHead.jsx";

const PAGE = 9;

// Photos and videos added in /admin. App only renders this when there is at least one.
export default function Gallery({ num, items }) {
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState(null);

  return (
    <section className="section" id="gallery">
      <div className="wrap">
        <SectionHead num={num} title={GALLERY.title}>
          {GALLERY.intro}
        </SectionHead>
        <ul className="gallery">
          {items.slice(0, shown).map((m) => (
            <li key={m.id} className="gallery__item">
              {m.kind === "video" ? (
                // "#t=0.1" makes browsers show the first frame instead of a blank box.
                <video src={`${m.url}#t=0.1`} controls playsInline preload="metadata" />
              ) : (
                <button className="gallery__photo" onClick={() => setOpen(m)} aria-label={m.caption || "Open photo"}>
                  <img src={m.url} alt={m.caption || ""} loading="lazy" />
                </button>
              )}
              {m.caption && <p className="gallery__caption">{m.caption}</p>}
            </li>
          ))}
        </ul>
        {items.length > shown && (
          <div className="actions">
            <button className="btn btn--line" onClick={() => setShown(shown + PAGE)}>
              Show more
            </button>
          </div>
        )}
      </div>
      {open && <Lightbox item={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

function Lightbox({ item, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={item.caption || "Photo"} onClick={onClose}>
      <button className="lightbox__close" onClick={onClose}>
        Close
      </button>
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={item.url} alt={item.caption || ""} />
        {item.caption && <figcaption>{item.caption}</figcaption>}
      </figure>
    </div>
  );
}
