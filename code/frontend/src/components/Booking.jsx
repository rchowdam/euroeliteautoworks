import { useState } from "react";
import { CONFIG, telLink } from "../config.js";
import { BRANDS, SERVICES } from "../content.js";
import { whatsappLink } from "../whatsapp.js";
import SectionHead from "./SectionHead.jsx";

const EMPTY = {
  name: "",
  phone: "",
  email: "",
  car_brand: "",
  car_model: "",
  car_year: "",
  service: "",
  message: "",
  preferred_date: "",
};

function whatsappText(f) {
  return [
    `Hello ${CONFIG.brand}, I'd like to book a diagnosis.`,
    `Name: ${f.name}`,
    `Phone: ${f.phone}`,
    `Car: ${[f.car_brand, f.car_model, f.car_year].filter(Boolean).join(" ")}`,
    `Service: ${f.service}`,
    f.preferred_date && `Preferred date: ${f.preferred_date}`,
    f.message && `Details: ${f.message}`,
  ]
    .filter(Boolean)
    .join("\n");
}

// The API answers 422 with a list of field errors; show the first one plainly.
function errorText(body) {
  const d = body && body.detail;
  if (Array.isArray(d) && d[0]) {
    const field = String(d[0].loc?.[d[0].loc.length - 1] || "").replace(/_/g, " ");
    return `Please check ${field}: ${String(d[0].msg).replace(/^Value error, /, "")}`;
  }
  return typeof d === "string" ? d : "Something went wrong. Please try again or call us.";
}

export default function Booking({ num }) {
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState({ status: "idle", message: "" });

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setState({ status: "sending", message: "" });
    // Open WhatsApp first: browsers block pop-ups that aren't direct results of a click.
    const wa = whatsappLink(whatsappText(form));
    if (wa) window.open(wa, "_blank", "noopener");
    try {
      const res = await fetch(`${CONFIG.apiBaseUrl}/api/public/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(errorText(body));
      setState({ status: "done", message: body.message });
      setForm(EMPTY);
    } catch (err) {
      setState({ status: "error", message: err.message || "Could not send. Please try again." });
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="section" id="book">
      <div className="wrap book">
        <div>
          <SectionHead num={num} title="Book a diagnosis">
            Tell us about your car and what you have noticed. We will call you back to confirm a time.
          </SectionHead>
          <Contact />
        </div>

        <form className="form" onSubmit={submit}>
          <div className="form__row">
            <Field label="Name" required>
              <input value={form.name} onChange={set("name")} required minLength={2} maxLength={80} autoComplete="name" />
            </Field>
            <Field label="Phone" required>
              <input type="tel" value={form.phone} onChange={set("phone")} required minLength={6} maxLength={20} autoComplete="tel" />
            </Field>
          </div>
          <Field label="Email">
            <input type="email" value={form.email} onChange={set("email")} maxLength={120} autoComplete="email" />
          </Field>
          <div className="form__row form__row--3">
            <Field label="Make" required>
              <select value={form.car_brand} onChange={set("car_brand")} required>
                <option value="">Select</option>
                {BRANDS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
                <option>Other</option>
              </select>
            </Field>
            <Field label="Model">
              <input value={form.car_model} onChange={set("car_model")} maxLength={60} placeholder="e.g. Octavia 2.0 TSI" />
            </Field>
            <Field label="Year">
              <input type="number" inputMode="numeric" value={form.car_year} onChange={set("car_year")} min={1980} max={2100} />
            </Field>
          </div>
          <div className="form__row">
            <Field label="Service" required>
              <select value={form.service} onChange={set("service")} required>
                <option value="">Select</option>
                {SERVICES.map(([title]) => (
                  <option key={title}>{title}</option>
                ))}
                <option>Not sure — need a diagnosis</option>
              </select>
            </Field>
            <Field label="Preferred date">
              <input type="date" value={form.preferred_date} onChange={set("preferred_date")} min={today} />
            </Field>
          </div>
          <Field label="What have you noticed?">
            <textarea rows={4} value={form.message} onChange={set("message")} maxLength={2000} placeholder="e.g. Judder when pulling away, gear light flashing" />
          </Field>

          <button className="btn btn--primary btn--block" disabled={state.status === "sending"}>
            {state.status === "sending" ? "Sending…" : "Send request"}
          </button>
          {state.message && (
            <p className={`form__msg form__msg--${state.status}`} role="status">
              {state.message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="field">
      <span className="field__label">
        {label}
        {required && <span className="field__req" aria-hidden="true"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Contact() {
  const rows = [
    ...CONFIG.contacts.map((c) => [c.name, <a href={telLink(c.phone)} className="contact__phone">{c.phone}</a>]),
    CONFIG.whatsapp && ["WhatsApp", <a href={whatsappLink("Hello")} target="_blank" rel="noreferrer">Message us</a>],
    CONFIG.email && ["Email", <a href={`mailto:${CONFIG.email}`}>{CONFIG.email}</a>],
    CONFIG.address.length > 0 && [
      "Workshop",
      <>
        {CONFIG.address.map((l) => <span key={l}>{l}<br /></span>)}
        {CONFIG.mapUrl && <a href={CONFIG.mapUrl} target="_blank" rel="noreferrer">Open in Google Maps</a>}
      </>,
    ],
    CONFIG.hours.length > 0 && ["Hours", CONFIG.hours.map((l) => <span key={l}>{l}<br /></span>)],
  ].filter(Boolean);
  if (!rows.length) return null;
  return (
    <>
      <dl className="contact">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {CONFIG.mapPin && <Map />}
    </>
  );
}

// Google's keyless embed of the workshop pin; loads only when scrolled near.
function Map() {
  const [lat, lng] = CONFIG.mapPin;
  return (
    <div className="map">
      <iframe
        title={`Map: ${CONFIG.brand}, ${CONFIG.address.join(", ")}`}
        src={`https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
