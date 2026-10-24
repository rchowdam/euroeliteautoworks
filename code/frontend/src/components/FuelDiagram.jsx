// Line drawing of a direct-injection fuel system: tank and low-pressure pump,
// high-pressure pump, rail and four injectors. Decorative only; same style as GearboxDiagram.
export default function FuelDiagram() {
  const cylinders = [245, 285, 325, 365];
  return (
    <svg className="diagram" viewBox="0 0 420 300" role="img" aria-label="Fuel system schematic">
      <g fill="none" stroke="currentColor" strokeWidth="1.25">
        {/* tank with the low-pressure pump inside */}
        <rect x="20" y="180" width="70" height="70" />
        <rect x="45" y="195" width="20" height="40" />
        {/* low-pressure line to the high-pressure pump */}
        <polyline points="55,195 55,150 150,150" />
        {/* high-pressure pump, driven by the camshaft */}
        <rect x="150" y="130" width="40" height="40" className="diagram__accent" />
        <circle cx="170" cy="150" r="9" className="diagram__accent" />
        {/* high-pressure line and rail */}
        <polyline points="190,150 205,150 205,88 220,88" className="diagram__accent" />
        <rect x="220" y="80" width="180" height="16" className="diagram__accent" />
        {cylinders.map((x) => (
          <g key={x}>
            {/* injector, nozzle and spray into the cylinder */}
            <rect x={x - 6} y="96" width="12" height="40" className="diagram__accent" />
            <line x1={x} y1="136" x2={x} y2="152" className="diagram__accent" />
            <polyline points={`${x - 8},168 ${x},152 ${x + 8},168`} className="diagram__accent" />
            <rect x={x - 16} y="146" width="32" height="84" />
          </g>
        ))}
      </g>
      <g className="diagram__labels">
        <text x="20" y="268">TANK · LP PUMP</text>
        <text x="150" y="190" className="diagram__accent-text">HP PUMP</text>
        <text x="220" y="70" className="diagram__accent-text">RAIL</text>
        {cylinders.map((x, i) => (
          <text key={x} x={x} y="248" textAnchor="middle">{i + 1}</text>
        ))}
        <text x="400" y="290" textAnchor="end">LOW PRESSURE · HIGH PRESSURE — EVERY CYLINDER</text>
      </g>
    </svg>
  );
}
