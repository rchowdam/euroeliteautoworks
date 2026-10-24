// Page copy in one place, so wording can change without touching layout.
// Keep claims factual: no ratings, counts or testimonials until real ones exist.

export const BRANDS = ["Volkswagen", "Audi", "Škoda", "Porsche", "BMW", "Mercedes-Benz", "MINI"];

export const NAV = [
  { href: "#dsg", label: "DSG" },
  { href: "#fuel", label: "Fuel" },
  { href: "#services", label: "Services" },
  { href: "#approach", label: "Approach" },
  // Only shown once photos or videos are published from /admin.
  { href: "#gallery", label: "Workshop", gallery: true },
  { href: "#process", label: "Process" },
  { href: "#faq", label: "FAQ" },
];

// Hero slides. `title` is [plain part, red part]; `diagram` picks the line drawing in Hero.jsx.
export const HERO_SLIDES = [
  {
    id: "dsg",
    tab: "DSG & dual-clutch",
    eyebrow: "German car specialists · DSG experts",
    title: ["German engineering deserves a ", "specialist."],
    lead: "Euro Elite Auto Works services and repairs Volkswagen, Audi, Škoda, Porsche, BMW, Mercedes-Benz and MINI, whatever the fault, with particular expertise in DSG and dual-clutch transmissions.",
    codes: "DQ200 · DQ250 · DQ381 · DQ500 · S tronic · PDK",
  },
  {
    id: "fuel",
    tab: "Fuel systems",
    eyebrow: "German car specialists · Fuel systems",
    title: ["Fuel system faults, found and ", "fixed."],
    lead: "Injectors, high- and low-pressure fuel pumps and fuel pressure faults on petrol and diesel engines. Hard starting, misfires or loss of power: we trace the cause before replacing parts.",
    codes: "TSI · TFSI · TDI · Direct injection · Common rail",
  },
];

export const DSG_SYMPTOMS = [
  "Judder or shudder when pulling away",
  "Jerky or harsh shifts in slow traffic",
  "Delay when selecting D or R",
  "Flashing gear indicator or gearbox warning",
  "Stuck in one gear (limp mode)",
  "Clunk or knock between gears",
];

export const DSG_WORK = [
  ["Mechatronic unit", "Fault tracing, repair or replacement of the gearbox control unit and valve body."],
  ["Clutch packs", "Dry and wet dual-clutch replacement, measured and set to specification."],
  ["Adaptation", "Basic settings and clutch adaptation after repair, or when shifts feel rough."],
  ["Oil & filter", "Gearbox oil and filter service for wet-clutch units, at the right interval."],
  ["Software & coding", "Control unit diagnostics, updates and coding."],
  ["Road test", "Every car is driven before and after the work, so the fault is confirmed and cleared."],
];

export const GEARBOXES = [
  { code: "DQ200", ref: "0AM · 0CW", type: "7-speed · dry clutch", seen: "Compact and mid-size petrol VW, Škoda, Audi" },
  { code: "DQ250", ref: "02E", type: "6-speed · wet clutch", seen: "Higher-torque petrol and diesel models" },
  { code: "DQ381", ref: "0GC", type: "7-speed · wet clutch", seen: "Newer VW, Škoda and Audi models" },
  { code: "DQ500", ref: "0BH · 0BT", type: "7-speed · wet clutch", seen: "High-torque and larger models" },
  { code: "S tronic", ref: "0B5 · DL501", type: "7-speed · wet clutch", seen: "Longitudinal Audi models" },
  { code: "PDK", ref: "Porsche", type: "Dual-clutch", seen: "Porsche" },
];

export const OTHER_AUTOMATICS = "Also: ZF 8HP, Aisin and Mercedes-Benz 7G / 9G-TRONIC automatics.";

export const FUEL_SYMPTOMS = [
  "Long cranking or hard starting, hot or cold",
  "Misfire, rough idle or shaking at idle",
  "Loss of power or hesitation when accelerating",
  "Engine warning light or limp mode",
  "Smoke from the exhaust or a smell of fuel",
  "Higher fuel consumption than usual",
];

export const FUEL_WORK = [
  ["Injector bench test", "Each injector tested on our workbench for spray pattern, delivery and leak-off, compared across all cylinders."],
  ["Fuel pump bench test", "High- and low-pressure fuel pumps tested on the bench for pressure and delivery."],
  ["Fuel pressure diagnosis", "Live pressure readings to find whether the fault is the pump, a sensor, the regulator or a leak."],
  ["Replacement & coding", "Injectors and pumps replaced to specification, with injector codes entered in the engine control unit."],
  ["Filters & lines", "Fuel filter service and leak checks on lines and seals."],
  ["Road test", "Every car is driven after the work, with fuel pressures and trims checked."],
];

// Injector and pump makes tested on the workbench.
export const FUEL_MAKES = [
  { make: "Bosch", parts: "Injectors · high-pressure pumps", type: "Petrol and diesel" },
  { make: "Continental", parts: "Injectors · high-pressure pumps", type: "Petrol and diesel, including Siemens VDO piezo" },
  { make: "Delphi", parts: "Injectors · high-pressure pumps", type: "Diesel common rail" },
  { make: "Denso", parts: "Injectors · high-pressure pumps", type: "Petrol and diesel" },
];

export const FUEL_NOTE = "Petrol direct injection (TSI, TFSI) and diesel common rail (TDI, CDI and BMW diesels).";

export const SERVICES = [
  ["DSG & automatic transmission", "Mechatronics, clutch packs, adaptations and oil service for dual-clutch and automatic gearboxes."],
  ["Engine", "TSI, TFSI and TDI engines: timing chains, oil leaks, turbochargers, misfires and carbon cleaning."],
  ["Fuel system", "Injectors, high- and low-pressure fuel pumps, fuel pressure faults and hard starting, petrol and diesel."],
  ["Diagnostics & coding", "Fault tracing with dealer-level software, module coding and retrofits."],
  ["Scheduled service", "Service to the manufacturer's schedule, with oils and filters to the correct specification."],
  ["Suspension & steering", "Shock absorbers, bushes, control arms, air suspension and wheel alignment."],
  ["Brakes", "Pads, discs and fluid, plus ABS and stability-control faults."],
  ["Electrical", "Battery drain, sensors, lighting and control modules."],
  ["Air conditioning", "Leak testing, compressor repair and refrigerant recharge."],
];

export const PRINCIPLES = [
  ["German cars only", "We work on a small family of makes every day. That focus is the difference between guessing and knowing."],
  ["Diagnosis before parts", "We find the cause before replacing anything, so you pay for the fix, not for trial and error."],
  ["Written estimate first", "You see and approve the price before work starts. Anything extra is agreed with you first."],
  ["Genuine & OEM parts", "Parts to the original specification. Your old parts are kept for you to see."],
  ["Updates with photos", "Findings and photos are sent to you while the car is with us."],
];

export const GALLERY = {
  title: "Inside the workshop",
  intro: "Cars on the ramp, gearboxes on the bench and the work in progress.",
};

export const STEPS = [
  ["Book", "Send the form, call or message us. Tell us the car and what you notice."],
  ["Diagnose", "Inspection, fault-code reading and a road test to confirm the problem."],
  ["Approve", "A written estimate with the cause, the fix and the price. Nothing starts without your yes."],
  ["Repair", "Work to factory procedure, with photo updates along the way."],
  ["Hand over", "Final road test, explanation of the work, and your old parts."],
];

export const FAQ = [
  [
    "What is a DSG gearbox?",
    "DSG (Direct-Shift Gearbox) is the Volkswagen Group's dual-clutch automatic. One clutch handles the odd gears and the other the even gears, so the next gear is always ready and shifts are very quick. Audi calls it S tronic; Porsche's version is PDK.",
  ],
  [
    "My DSG judders when pulling away. Do I need a new gearbox?",
    "Usually not. Judder is often caused by clutch wear, clutch adaptation or a mechatronic fault, and each of these can be repaired on its own. We diagnose first and tell you exactly what is needed.",
  ],
  [
    "How often should DSG oil be changed?",
    "Wet-clutch gearboxes (DQ250, DQ381, DQ500, S tronic) need regular oil and filter changes; the interval depends on the gearbox and how the car is used. The dry-clutch DQ200 has no routine gearbox oil change in most schedules. We check the schedule for your exact car.",
  ],
  [
    "Which cars do you work on?",
    "Volkswagen, Audi, Škoda, Porsche, BMW, Mercedes-Benz and MINI: petrol, diesel and automatic, and any kind of fault, from routine servicing to major repairs.",
  ],
  [
    "Will I know the price before you start?",
    "Yes. After diagnosis you receive a written estimate. Work starts only after you approve it, and anything extra found along the way is agreed with you first.",
  ],
];
