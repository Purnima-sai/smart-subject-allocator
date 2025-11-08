# Smart Subject Allocator (SSAEMS)

This repository contains a Node.js/Express backend and a React frontend.

Quick commands (run from project root `smart-subject-allocator`):

- Install dependencies for both projects:

```powershell
npm run install-all
```

- Run both backend and frontend in development mode:

```powershell
npm run dev
```

- Start both (production-like):

```powershell
npm start
```

Notes:
- The frontend is configured to proxy API requests to `http://localhost:5000` (backend default). If you run the backend on a different port, update `frontend/package.json` `proxy` field or set `PORT`/`HOST` accordingly.
- Backend scripts (from `backend/package.json`): `npm run dev` uses `nodemon`, `npm run seed` creates a seeded admin user (email `admin@example.com`, password `admin123`).
- Postman collection is available at `backend/postman_collection_ssaems.json`.

If you want, I can run `npm run install-all` and `npm run dev` from here to start both servers and show logs. Let me know if you want me to proceed.
