import { BRANDS } from "../content.js";

// Brand names as text only (no manufacturer logos).
export default function Brands() {
  return (
    <section className="brands" aria-label="Makes we work on">
      <div className="wrap brands__inner">
        <span className="label">We work on</span>
        <ul className="brands__list">
          {BRANDS.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
