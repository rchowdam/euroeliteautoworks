export default function SectionHead({ num, title, children }) {
  return (
    <div className="sec-head">
      <span className="sec-head__num">{num}</span>
      <h2>{title}</h2>
      {children && <p className="sec-head__intro">{children}</p>}
    </div>
  );
}
