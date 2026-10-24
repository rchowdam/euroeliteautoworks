import { CONFIG, telLink } from "../config.js";
import { whatsappLink } from "../whatsapp.js";
import GearboxDiagram from "./GearboxDiagram.jsx";

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap hero__grid">
        <div className="hero__text">
          <p className="eyebrow">German car specialists · DSG experts</p>
          <h1>
            German engineering deserves a <em>specialist.</em>
          </h1>
          <p className="lead">
            Euro Elite Auto Works services and repairs Volkswagen, Audi, Škoda, Porsche, BMW and
            Mercedes-Benz, with particular expertise in DSG and dual-clutch transmissions.
          </p>
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
        <figure className="hero__panel">
          <GearboxDiagram />
          <figcaption>
            <span className="mono">DQ200 · DQ250 · DQ381 · DQ500 · S tronic · PDK</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
