import { SERVICES } from "../content.js";
import SectionHead from "./SectionHead.jsx";

export default function Services() {
  return (
    <section className="section" id="services">
      <div className="wrap">
        <SectionHead num="02" title="Complete care for German cars">
          From scheduled servicing to complex repairs, one workshop that knows your car.
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
