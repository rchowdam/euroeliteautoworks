// The brand logo (artwork in business_plan/brand/). `inverse` = white-text version for dark backgrounds.
export default function Logo({ inverse = false }) {
  return (
    <img
      className={`logo${inverse ? " logo--inverse" : ""}`}
      src={inverse ? "/logo-inverse.png" : "/logo.png"}
      alt="Euro Elite Auto Works"
      width="960"
      height="234"
    />
  );
}
