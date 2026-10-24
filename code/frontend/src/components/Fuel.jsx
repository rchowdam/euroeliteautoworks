import { FUEL_MAKES, FUEL_NOTE, FUEL_SYMPTOMS, FUEL_WORK } from "../content.js";
import SectionHead from "./SectionHead.jsx";

// Same layout as the DSG section: signs, what we do, then the makes we bench-test.
export default function Fuel({ num }) {
  return (
    <section className="section section--dark" id="fuel">
      <div className="wrap">
        <SectionHead num={num} title="Fuel system specialists">
          Injectors and fuel pumps are tested on our own workbench, so we know which part has
          failed before anything is replaced.
        </SectionHead>

        <div className="dsg__grid">
          <div>
            <h3 className="label">Signs of a fuel system fault</h3>
            <ul className="checklist">
              {FUEL_SYMPTOMS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="label">What we do</h3>
            <dl className="worklist">
              {FUEL_WORK.map(([t, d]) => (
                <div key={t}>
                  <dt>{t}</dt>
                  <dd>{d}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="gearboxes">
          <h3 className="label">Injector and pump makes we test</h3>
          <table className="gb-table">
            <thead>
              <tr>
                <th>Make</th>
                <th>Parts</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {FUEL_MAKES.map((m) => (
                <tr key={m.make}>
                  <td className="mono strong">{m.make}</td>
                  <td>{m.parts}</td>
                  <td>{m.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="note">{FUEL_NOTE}</p>
        </div>
      </div>
    </section>
  );
}
