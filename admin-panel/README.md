# Campus Assist — Super Admin Panel

Next.js admin panel for **SUPER_ADMIN** users. Manage users, colleges, communities, posts, comments, and attachments.

## Setup

1. Copy env example and set your API base URL:
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` and set `NEXT_PUBLIC_API_BASE_URL` to your API server (e.g. `http://10.99.69.2:8080`).

2. Install and run:
   ```bash
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).



## Login

- Only accounts with type **SUPER_ADMIN** can sign in.
- Use **email + password** (same as `POST /api/auth/login`).
- Access and refresh tokens are stored in `localStorage` and sent as `Authorization: Bearer <token>`.

## Features

- **Dashboard** — Aggregate stats and service health.
- **Users** — List, change type (USER / COLLEGE / SUPER_ADMIN), activate/deactivate.
- **Colleges** — List, view detail, force-delete.
- **Communities** — List, view detail, force-delete.
- **Posts** — List, force-delete.
- **Comments** — List, force-delete.
- **Attachments** — List, download, force-delete.

All admin actions use the unified admin API (`/api/admin/*`) and require a valid SUPER_ADMIN session.
