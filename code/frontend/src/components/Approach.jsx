import { CONFIG } from "../config.js";
import { PRINCIPLES } from "../content.js";
import SectionHead from "./SectionHead.jsx";

export default function Approach({ num }) {
  const items = CONFIG.warranty
    ? [...PRINCIPLES, ["Warranty", `Parts and labour covered for ${CONFIG.warranty}.`]]
    : PRINCIPLES;

  return (
    <section className="section section--paper2" id="approach">
      <div className="wrap">
        <SectionHead num={num} title="How we work">
          Clear diagnosis, honest pricing and work done to factory procedure.
        </SectionHead>
        <ul className="principles">
          {items.map(([title, text]) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
