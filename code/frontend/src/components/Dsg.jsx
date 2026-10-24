import { DSG_SYMPTOMS, DSG_WORK, GEARBOXES, OTHER_AUTOMATICS } from "../content.js";
import SectionHead from "./SectionHead.jsx";

export default function Dsg() {
  return (
    <section className="section section--dark" id="dsg">
      <div className="wrap">
        <SectionHead num="01" title="DSG and dual-clutch specialists">
          A dual-clutch gearbox is precise, and so is fixing one. We diagnose the exact cause, then
          repair only what is needed, often without replacing the whole gearbox.
        </SectionHead>

        <div className="dsg__grid">
          <div>
            <h3 className="label">Signs your gearbox needs attention</h3>
            <ul className="checklist">
              {DSG_SYMPTOMS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="label">What we do</h3>
            <dl className="worklist">
              {DSG_WORK.map(([t, d]) => (
                <div key={t}>
                  <dt>{t}</dt>
                  <dd>{d}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="gearboxes">
          <h3 className="label">Gearboxes we work on</h3>
          <table className="gb-table">
            <thead>
              <tr>
                <th>Gearbox</th>
                <th>Code</th>
                <th>Type</th>
                <th>Found in</th>
              </tr>
            </thead>
            <tbody>
              {GEARBOXES.map((g) => (
                <tr key={g.code}>
                  <td className="mono strong">{g.code}</td>
                  <td className="mono">{g.ref}</td>
                  <td>{g.type}</td>
                  <td>{g.seen}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="note">{OTHER_AUTOMATICS}</p>
        </div>
      </div>
    </section>
  );
}
