# Project Guidelines

## Architecture

- This workspace is a monorepo with two active apps: Next.js frontend in `frontend/` and Flask backend in `backend/`.
- Keep frontend and backend changes scoped to their area unless the task explicitly spans both layers.
- Use [frontend/README.md](/home/abenitez/Project/incesdev/frontend/README.md) for template-specific UI background instead of re-documenting TailAdmin details here.
- Use [docker-compose.yml](/home/abenitez/Project/incesdev/docker-compose.yml) when a task involves the full stack; it wires the frontend container to the Flask API and depends on values from `.env`.

## Build And Run

- Frontend setup and local development:
  - `cd frontend && npm install`
  - `cd frontend && npm run dev`
  - `cd frontend && npm run build`
  - `cd frontend && npm run lint`
- Backend setup and local development:
  - `cd backend && uv sync`
  - `cd backend && uv run app.py`
- Full stack container run:
  - `docker compose up --build`
- The backend startup path uses `uv` and [backend/start.sh](/home/abenitez/Project/incesdev/backend/start.sh); prefer that toolchain over ad hoc `pip` commands unless the task requires otherwise.

## Frontend Conventions

- The frontend uses Next.js App Router under [frontend/src/app](/home/abenitez/Project/incesdev/frontend/src/app); keep route changes aligned with the existing route-group structure.
- Reuse the existing provider stack in [frontend/src/app/layout.tsx](/home/abenitez/Project/incesdev/frontend/src/app/layout.tsx) and preserve provider ordering unless a task requires a deliberate change.
- Use the `@/*` import alias defined in [frontend/tsconfig.json](/home/abenitez/Project/incesdev/frontend/tsconfig.json) instead of deep relative paths.
- Keep API calls centralized through [frontend/src/Services/HttpRequest.tsx](/home/abenitez/Project/incesdev/frontend/src/Services/HttpRequest.tsx) and endpoint constants in [frontend/src/Services/EndPoints.tsx](/home/abenitez/Project/incesdev/frontend/src/Services/EndPoints.tsx) rather than scattering raw `axios` calls.
- Be careful with browser-only state such as `localStorage`; the current HTTP wrapper guards against SSR access and new code should preserve that behavior.
- This codebase mixes Tailwind-based TailAdmin components with Ant Design. Prefer the existing local patterns in the touched area instead of introducing a third UI approach.

## Backend Conventions

- The Flask app is defined in [backend/app.py](/home/abenitez/Project/incesdev/backend/app.py). Routes are registered by importing controller modules for side effects, so new controllers must be imported there or their routes will not load.
- Keep API endpoints under the `/api/` prefix to match the existing controller pattern.
- Authentication uses the custom decorator in [backend/decorators.py](/home/abenitez/Project/incesdev/backend/decorators.py); protected endpoints expect the `Authorization` header in the format `JWT <token>`.
- Keep controller logic in [backend/src/controllers](/home/abenitez/Project/incesdev/backend/src/controllers), models in [backend/src/models](/home/abenitez/Project/incesdev/backend/src/models), and shared helpers in [backend/src/helpers](/home/abenitez/Project/incesdev/backend/src/helpers).
- Certificate-related work usually spans controllers plus Jinja templates in [backend/src/views/certificates](/home/abenitez/Project/incesdev/backend/src/views/certificates).
- The backend depends on system support for PDF generation through `pdfkit`; avoid assuming a pure Python runtime is enough when changing certificate flows or container setup.

## Project Pitfalls

- Do not assume frontend API base URLs are fully environment-driven. [frontend/src/Services/Config.tsx](/home/abenitez/Project/incesdev/frontend/src/Services/Config.tsx) currently hardcodes the API domain, so verify whether a task should preserve or refactor that behavior.
- Do not move controller imports out of the current startup pattern in [backend/app.py](/home/abenitez/Project/incesdev/backend/app.py) without accounting for circular-import risk.
- The Docker Compose setup expects an external network named `streams_streamnet`; keep that in mind before changing compose behavior or giving run instructions.
