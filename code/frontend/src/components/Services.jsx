import { SERVICES } from "../content.js";
import SectionHead from "./SectionHead.jsx";

export default function Services({ num }) {
  return (
    <section className="section" id="services">
      <div className="wrap">
        <SectionHead num={num} title="Complete care for German cars">
          Whatever the problem with your German car, from scheduled servicing to complex repairs, one workshop that knows it.
        </SectionHead>
        <ol className="grid-list">
          {SERVICES.map(([title, text], i) => (
            <li key={title} className="tile">
              <span className="tile__num mono">{String(i + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
