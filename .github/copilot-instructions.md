Project: Splitwise-style expense tracker frontend.
Stack: React (Vite), plain JavaScript (NO TypeScript), Tailwind CSS v4,
react-router-dom v6+, axios, @tanstack/react-query, react-hook-form + zod, lucide-react, date-fns.
Rules:
- Use functional components, .jsx for components, .js for everything else.
- Style only with Tailwind utility classes. Mobile responsive.
- Money uses Intl.NumberFormat with en-IN / INR. Never use floats for split logic: work in paise (integers).
- The backend (Spring Boot) does not exist yet, so all api/*.js functions return mock data wrapped in Promises with a small delay. Function signatures must stay the same when we later swap in axios calls.
- Keep components small and reusable. Add loading, empty and error states.
- Folder structure: src/api, components/{layout,common,expense,group,balance}, pages, context, hooks, mocks, utils, routes.