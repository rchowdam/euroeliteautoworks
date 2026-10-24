// Line drawing of a dual-clutch gearbox: two clutches, two input shafts,
// odd gears on one, even gears on the other. Decorative only.
export default function GearboxDiagram() {
  const odd = [1, 3, 5, 7];
  const even = [2, 4, 6, "R"];
  return (
    <svg className="diagram" viewBox="0 0 420 300" role="img" aria-label="Dual-clutch gearbox schematic">
      <g fill="none" stroke="currentColor" strokeWidth="1.25">
        {/* engine input */}
        <line x1="20" y1="150" x2="70" y2="150" />
        {/* clutches K1 / K2 */}
        <rect x="70" y="70" width="34" height="160" />
        <rect x="112" y="95" width="34" height="110" className="diagram__accent" />
        {/* outer and inner input shafts */}
        <line x1="104" y1="118" x2="400" y2="118" />
        <line x1="146" y1="182" x2="400" y2="182" className="diagram__accent" />
        {odd.map((g, i) => (
          <rect key={`o${g}`} x={180 + i * 56} y={84} width="28" height="34" />
        ))}
        {even.map((g, i) => (
          <rect key={`e${g}`} x={180 + i * 56} y={182} width="28" height="34" className="diagram__accent" />
        ))}
      </g>
      <g className="diagram__labels">
        <text x="20" y="140">ENGINE</text>
        <text x="74" y="252">K1</text>
        <text x="116" y="252" className="diagram__accent-text">K2</text>
        {odd.map((g, i) => (
          <text key={`ot${g}`} x={194 + i * 56} y="72" textAnchor="middle">{g}</text>
        ))}
        {even.map((g, i) => (
          <text key={`et${g}`} x={194 + i * 56} y="240" textAnchor="middle" className="diagram__accent-text">{g}</text>
        ))}
        <text x="400" y="290" textAnchor="end">ODD · EVEN — NEXT GEAR ALWAYS READY</text>
      </g>
    </svg>
  );
}
