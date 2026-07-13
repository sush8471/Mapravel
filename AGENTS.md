## Project Summary
This is a Next.js application that displays interactive journey maps using Mapbox and Supabase. It features a cinematic experience for clients and an administrative dashboard for managing client data.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database/Auth**: Supabase
- **Maps**: Mapbox GL JS
- **Animations**: Framer Motion
- **UI Components**: Radix UI, shadcn/ui
- **Icons**: Lucide React
- **Date Formatting**: date-fns
- **Package Manager**: Bun

## Architecture
- `src/app`: App Router with map routes (`/map/[slug]`) and admin routes (`/admin`).
- `src/app/admin`: Password-protected dashboard with sidebar layout.
  - `/admin/clients`: List of all journey maps/clients.
  - `/admin/clients/new`: Form to create a new client.
  - `/admin/clients/[id]`: Form to edit, publish, or delete a client.
- `src/app/api`: Server-side API routes for authentication.
- `src/lib`: Shared logic, types, and Supabase client configuration.
- `src/components`: UI components including Mapbox integration and admin UI elements.

## User Preferences
- Admin theme: Dark background (#0a0a0f) with gold accents (#f5c542).
- Admin authentication: Simple password-based check using `ADMIN_PASSWORD` env var.

## Project Guidelines
- Use Bun for installing dependencies and running scripts.
- Use `framer-motion` for high-end UI transitions.
- Ensure all admin routes are protected via the layout check.
- Keep components minimal and clean with a dark, premium aesthetic.

## Common Patterns
- **Root Redirect**: Dynamically redirects to the most recently published journey map.
- **Admin Auth**: Stores authentication state in `localStorage` and a cookie named `dacharacterz-admin`.
- **Dynamic Maps**: Fetches client, location, and media data dynamically from Supabase based on route slugs.
