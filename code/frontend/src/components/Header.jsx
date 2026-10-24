import { useState } from "react";
import Logo from "./Logo.jsx";

export default function Header({ nav }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="header">
      <div className="wrap header__inner">
        <a href="#top" className="header__brand" onClick={close} aria-label="Euro Elite Auto Works, home">
          <Logo />
        </a>
        <button
          className="header__toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
        </button>
        <nav id="site-nav" className={`header__nav${open ? " is-open" : ""}`}>
          {nav.map((item) => (
            <a key={item.href} href={item.href} onClick={close}>
              {item.label}
            </a>
          ))}
          <a href="#book" className="btn btn--primary btn--sm" onClick={close}>
            Book a diagnosis
          </a>
        </nav>
      </div>
    </header>
  );
}
