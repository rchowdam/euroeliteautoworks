import { FAQ } from "../content.js";
import SectionHead from "./SectionHead.jsx";

export default function Faq({ num }) {
  return (
    <section className="section section--paper2" id="faq">
      <div className="wrap faq">
        <SectionHead num={num} title="Questions" />
        <div className="faq__list">
          {FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
