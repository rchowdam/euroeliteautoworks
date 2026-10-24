# Frontend — landing page (React + Vite)

React 18 + Vite 5, plain JavaScript and plain CSS. Node 18 works (don't move to Vite 6+, which needs Node 20).

```bash
cd code/frontend
npm install
npm run dev      # http://localhost:5173 — /api is proxied to the backend on 127.0.0.1:8000
npm run build    # dist/ — the backend serves this at /
```

## Where to change things

| What | File |
|---|---|
| Phone, WhatsApp, email, address, hours, warranty | `src/config.js` (empty = hidden on the page) |
| All page text: brands, gearboxes, services, steps, FAQ | `src/content.js` |
| Colours, fonts, spacing | `src/styles.css` (`:root` tokens) |
| Sections and their order | `src/App.jsx` → `src/components/` |

Design rules: flat colours only (no gradients or shadows), 1px hairlines, square corners.
Colours from the logo: white, black `#111111`, logo red `#EC1F23` (deeper `#C8161B` for small red text).
Fonts: Oswald (headings), Inter (body), IBM Plex Mono (codes). Logo files: `public/logo*.png`.
