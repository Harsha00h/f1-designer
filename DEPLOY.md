# Deploying F1 Designer

Two pieces: **backend** (FastAPI on Render) and **frontend** (Vite on Vercel).

## 1. Backend — Render

1. Push this repo to GitHub.
2. On [render.com](https://render.com): **New +** → **Blueprint** → pick the repo. Render reads `render.yaml`.
3. After it deploys, copy the URL (e.g. `https://f1-designer-api.onrender.com`).
4. In the service's **Environment** tab, set:
   - `ALLOWED_ORIGINS` = `https://your-vercel-domain.vercel.app` (comma-separate multiple)
5. Verify: `curl https://f1-designer-api.onrender.com/api/health` → `{"status":"ok",...}`.

Notes:
- `render.yaml` mounts a 1 GB persistent disk at `/app/fastf1_cache` so FastF1 doesn't re-download data on each restart.
- Free/starter plan cold starts can take 30–60 s; first hit to a session also pulls data from the F1 API.

## 2. Frontend — Vercel

1. Edit `vercel.json` and replace `REPLACE_WITH_RENDER_URL.onrender.com` with the Render URL from step 1.
2. Commit and push.
3. On [vercel.com](https://vercel.com): **Add New → Project** → import the repo.
   - **Root directory**: `f1-designer`
   - **Framework**: Vite (auto-detected)
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
4. Deploy. Vercel rewrites `/api/*` to your Render backend, so the frontend's relative `fetch('/api/...')` calls just work.

## 3. Post-deploy

- Update Render's `ALLOWED_ORIGINS` to your real Vercel domain once you have it.
- For a custom domain, add it in Vercel and append it to `ALLOWED_ORIGINS`.

## Local dev

Backend: `cd backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000`
Frontend: `npm install && npm run dev` (Vite proxies `/api` to `localhost:8000`).
