import { STEPS } from "../content.js";
import SectionHead from "./SectionHead.jsx";

export default function Process({ num }) {
  return (
    <section className="section" id="process">
      <div className="wrap">
        <SectionHead num={num} title="From booking to hand-over" />
        <ol className="steps">
          {STEPS.map(([title, text], i) => (
            <li key={title}>
              <span className="steps__num mono">{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
