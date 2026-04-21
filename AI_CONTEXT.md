# AI Context - Project Rules

## 1. Project overview

This project is a progressive web application for learning topography of cities in the Netherlands.

Primary users:
- Children older than 8 years
- Parents

Main goals:
- Teach children topography 
- Teach in a playful way

Out of scope for now:
- Teach them topography of cities in Europe and the world
- High scores online

---

## 2. Current stack

- Build tool: Vite
- Frontend: TypeScript
- Linting: ESLint
- Formatting: Prettier
<!-- - Styling: Tailwind CSS -->
<!-- - UI components: shadcn/ui
- Backend: Next.js server actions + route handlers
- Database: PostgreSQL
- ORM: Prisma
- Auth: NextAuth / Auth.js
- Validation: Zod
- Testing: Vitest + Testing Library
- E2E: Playwright -->
- Package manager: npm

---

## 3. Core product principles

- Prefer clarity over cleverness.
- Keep the codebase boring, predictable, and easy to maintain.
- Reuse existing patterns before introducing new ones.
- Optimize for developer speed and long-term readability.
- Build only what is required for the current scope.

---

## 4. Architecture rules

### General
- Use TypeScript strict mode.
- Keep modules focused and cohesive.
- Prefer explicit types for exported functions and shared interfaces.
- Do not introduce new dependencies unless clearly justified.
- Use the SOLID principles

### Frontend & components
- Keep components small and focused on one responsibility.
- Avoid deeply coupled components.
- Extract reusable UI only after a real repetition pattern appears.
- Prefer composition over large monolithic components.
- Keep presentational components separate from business logic where practical.

### Data and business logic
- Keep business logic out of purely presentational components.
- Put reusable logic into hooks, helpers, or services when appropriate.
- Validate external input whenever relevant.
- Prefer pure functions for transformation logic.

### State management
- Prefer local state first.
- Use URL state for filters/search/pagination when appropriate.
- Do not add global state libraries unless there is a clear need.

---

## 5. Folder and file conventions

Use this structure:

- `src/` as the main folder for all source files in the sub-folders
    - `app/` for routes, providers, entry logic, app config, global state wiring
    - `components/` for reusable UI components
    - `db/` for database-related code
    - `features/` for feature-specific components, logic, services, types and utils
    - `lib/` for shared library helpers    
    - `services/` for API calls or business services
    - `types/` for shared types
    - `styling/` for global styling
    - `tests/` for test helpers and integration tests
    - `util/` for small utilities and small helper functions

Rules:
- Prefer feature-based grouping when logic belongs to one domain.
- Avoid dumping unrelated helpers into `utils.ts`.
- Name files clearly and explicitly.
- Do not create duplicate helper functions if a shared one already exists.

---

## 6. Coding conventions

### TypeScript
- Avoid `any`.
- Prefer `unknown` over `any` when input is uncertain.
- Prefer explicit return types for exported functions.
- Keep types close to where they are used, unless shared.
- Validate external input with Zod.
- Do not trust request payloads, query params, or form data.
- Do not leave dead code behind.
- Do not add placeholder code that is not clearly marked.

### Naming
- Use descriptive names.
- Prefer full words over abbreviations.
- Use `handleX` for event handlers.
- Use `getX`, `createX`, `updateX`, `deleteX` for actions.
- Use singular names for types/entities and plural names for collections.

## Error handling
- Never silently swallow errors.
- Show useful feedback to the user when appropriate.
- Log enough context for debugging, but do not expose sensitive data.
- Fail safely and predictably.
- Prefer explicit handling over hidden fallback behavior.

### Comments
- Do not add obvious comments.
- Add comments only when explaining non-trivial reasoning, trade-offs, or constraints.

---

## 7. UI and UX rules

- Use existing design tokens and spacing patterns.
- Prefer consistent layouts over visual novelty.
- Keep forms simple and easy to scan.
- Provide useful loading, empty, and error states.
- Use accessible and clear labels on all inputs.
- Ensure responsive behavior on laptop and mobile widths.
- Avoid visual clutter.
- Make common actions obvious.

When building UI:
- reuse existing ui components where possible
- do not invent a new design language
- keep interactions obvious and predictable

Accessibility expectations:
- Use semantic HTML
- Ensure buttons and links are distinguishable
- Provide labels for inputs
- Support keyboard navigation where relevant
- Do not rely only on color to communicate meaning

---

## 8. Security and privacy rules

- Never hardcode secrets or API keys.
- Never expose server-only environment variables to the client.
- Never trust client input without validation.
- Sanitize and validate all external input.
- Do not log sensitive personal data.
- Apply authorization checks on all protected actions.
- Prefer least privilege.

If implementing auth-related code:
- fail closed, not open
- do not assume the UI alone is sufficient protection

---

## 9. Testing expectations

Write tests for:
- business logic with branching paths
- validation logic
- critical user interactions
- core user flows
- non-trivial utility functions
- edge cases when logic is non-trivial
- important rendering states

Testing rules:
- Do not write excessive low-value snapshot tests.
- Prefer meaningful behavior tests over implementation-detail tests
- Keep tests readable and focused
- e2e tests for key flows only

---

## 10. AI working instructions

When helping with this codebase, follow these rules:

1. First inspect existing patterns before creating new ones.
2. Match the current architecture and style.
<!-- 3. Prefer minimal changes over broad refactors. -->
4. Do not rename files, move folders, or restructure modules unless necessary.
5. Do not introduce new dependencies unless you explain why.
6. When implementing a feature, include:
   - the code change
   - a short explanation
   - edge cases considered
   - suggested tests
7. For non-trivial tasks, first provide a short plan.
8. If requirements are ambiguous, choose the simplest solution that matches current patterns.
9. Preserve backward compatibility unless explicitly told otherwise.
10. If you see a better refactor, suggest it separately instead of mixing it into the requested task.

---

## 11. Definition of done

A task is done when:
- the feature works
- types are correct
- lint issues are not introduced
- validation is included where needed
- loading and error states are handled
- the implementation matches existing project patterns
- tests are added according to the test expectations
- no unnecessary files or abstractions were introduced

---

## 12. Preferred output style for AI assistants

When generating code for this project:
- be concise
- explain trade-offs briefly
- prefer complete code over pseudo-code
- avoid overengineering
- do not output large unrelated refactors
- clearly mention assumptions