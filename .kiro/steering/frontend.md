---
inclusion: fileMatch
fileMatchPattern: "src/**"
---

# Frontend Steering

These rules apply whenever you are working on files inside `src/`.

## Component Patterns

- Use functional components with hooks only — no class components.
- Keep components co-located in `src/`; group related screens or feature clusters in the same file when they are tightly coupled.
- Extract reusable logic into custom hooks (`useXxx`) rather than duplicating stateful logic across components.
- Prefer named exports over default exports for components.

## TypeScript

- All frontend files must be `.tsx` (JSX) or `.ts` (no JSX). Do not use `.js` or `.jsx`.
- Define shared shapes in `src/types.ts`. Import from there rather than redefining types inline.
- Avoid `any`. Use `unknown` with a type guard when the shape is genuinely unknown.
- Enable strict null checks — handle `undefined` and `null` explicitly.

## Styling

- Use Tailwind utility classes exclusively. Do not write inline `style` props or new CSS rules except in `src/index.css` (global resets) or `src/App.css`.
- Follow a mobile-first approach: base classes target small screens, `md:` / `lg:` prefixes expand for larger viewports.

## State and Data Fetching

- All API calls go through `src/services/storage.ts`. Components must not call `fetch` directly.
- Derive analytics and statistics via `src/services/analytics.ts` — it is pure and side-effect-free.
- Use React state (`useState`, `useReducer`) for local UI state. Avoid introducing a global state library unless explicitly requested.

## Routing

- Routes are defined in `src/App.tsx` using React Router 7.
- Use `<Link>` and `useNavigate` for navigation — do not manipulate `window.location` directly.

## Maps

- Map components use `react-leaflet` v5 with `leaflet` 1.9.
- Always import Leaflet CSS (`leaflet/dist/leaflet.css`) before rendering any map component.
- Fix the default marker icon path for Vite by reassigning `L.Icon.Default.prototype._getIconUrl` or using `L.Icon.Default.mergeOptions`.

## Charts

- Use `recharts` for all data visualisation. Keep chart components small and focused on a single metric.

## Testing

- Test files live alongside source files or in the same `src/` tree with a `.test.ts` / `.test.tsx` suffix.
- Use Vitest 5 + `@testing-library/react`. The setup file is `src/vitest.setup.ts`.
- Test behaviour, not implementation — avoid asserting on internal state or private methods.
- The `analytics.ts` service is pure and should have comprehensive unit tests.
