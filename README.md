# AquaVista Frontend

AquaVista is a municipal rate study platform with an AI assistant (AVA) for data analysis. This is the Next.js frontend that connects to the [AquaVista Backend API](../AquaVista%20BE).

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** MUI v9, Tailwind CSS v4
- **Forms:** Formik + Yup
- **Auth:** httpOnly cookies (no client-side token handling)
- **API Client:** Centralized `src/lib/api-client.ts` with automatic credential inclusion and token refresh

## Getting Started

### Prerequisites

- Node.js >= 24.15.0
- npm >= 11.12.0
- AquaVista Backend running (see backend README)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

### Environment Variables

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000` |

## Architecture

### Authentication

Authentication uses httpOnly cookies set by the backend. The frontend never directly handles JWT tokens.

- **`src/lib/api-client.ts`** — Centralized API client that automatically includes `credentials: "include"` and handles 401 → token refresh → retry.
- **`src/lib/auth.ts`** — Stores only user info (name, email, role, avatar) in localStorage. No tokens.
- All pages and components use `apiClient` methods (`get`, `post`, `patch`, `put`, `delete`, `upload`, `raw`).

### Key Directories

```
src/
  app/
    (dashboard)/          # Authenticated app routes
      overview/           # Global statistics dashboard
      projects/           # Project list + project-scoped pages
        [id]/
          dashboard/      # Pinned items per project
          data/           # File uploads & templates
          ask-ava/        # AI chat interface
          users/          # Project user management (admin)
      users/              # Global user management (admin)
      settings/           # User profile & password settings
    auth/                 # Login, sign-up, activation, password reset
    landing-page/         # Public marketing page
  components/             # Shared components (layout, charts, dialogs)
  hooks/                  # Custom React hooks (notifications, stats, etc.)
  lib/                    # Utilities (api-client, auth, config)
  menu-items.tsx          # Navigation configuration
```

### API Client Usage

```typescript
import { apiClient } from "@/lib/api-client";

// GET
const data = await apiClient.get<MyType>("/api/projects");

// POST
const result = await apiClient.post<MyType>("/api/projects", { name, municipality });

// FormData upload
const res = await apiClient.upload<MyType>("/api/projects/:id/data", formData);

// Raw response (e.g., file downloads)
const blob = await apiClient.raw<Blob>("/api/projects/:id/data/:fileId/download");
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm test` | Run Vitest tests |
| `npm run test:watch` | Run Vitest in watch mode |

## Deployment

The app is configured for Vercel deployment. Set `NEXT_PUBLIC_API_URL` to the production backend URL in your Vercel project settings.
