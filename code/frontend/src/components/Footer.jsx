import { CONFIG, telLink } from "../config.js";
import { BRANDS } from "../content.js";
import Logo from "./Logo.jsx";

export default function Footer({ nav }) {
  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <div>
          <Logo inverse />
          <p className="footer__tag">{CONFIG.tagline}</p>
        </div>
        <nav aria-label="Footer">
          <span className="label">Site</span>
          {nav.map((n) => (
            <a key={n.href} href={n.href}>{n.label}</a>
          ))}
          <a href="#book">Book</a>
        </nav>
        <div>
          <span className="label">Makes</span>
          <p>{BRANDS.join(" · ")}</p>
        </div>
        <div className="footer__contact">
          <span className="label">Contact</span>
          {CONFIG.contacts.map((c) => (
            <p key={c.phone}>
              {c.name} <a href={telLink(c.phone)}>{c.phone}</a>
            </p>
          ))}
          {CONFIG.address.length > 0 && (
            <p>
              {CONFIG.mapUrl ? <a href={CONFIG.mapUrl} target="_blank" rel="noreferrer">{CONFIG.address.join(", ")}</a> : CONFIG.address.join(", ")}
            </p>
          )}
        </div>
      </div>
      <div className="wrap footer__legal">
        <span>© {new Date().getFullYear()} {CONFIG.brand}</span>
        <span>Independent specialist. Not affiliated with any vehicle manufacturer. Brand names are used for identification only.</span>
      </div>
    </footer>
  );
}
