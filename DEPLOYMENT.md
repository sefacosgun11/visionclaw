# VisionClaw Deployment Guide

## Architecture

Frontend (Vercel) → Backend (Railway) → PostgreSQL + Cloudinary + OpenAI

---

## Production URLs

Frontend: https://visionclaw.vercel.app
Backend: https://visionclaw-production-d39c.up.railway.app

---

## Backend (Railway)

### Environment Variables
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
PORT=3001
NODE_ENV=production

### Deploy
- Git push to main
- Railway auto-deploys
- Check logs in Railway dashboard

---

## Frontend (Vercel)

### Environment Variables
NEXT_PUBLIC_API_URL=https://visionclaw-production-d39c.up.railway.app

### Deploy
- Git push to main
- Vercel auto-deploys
- Check deployments tab

---

## Local Development

Backend:
cd backend
npm install
npm run dev

Frontend:
cd web-demo
npm install
NEXT_PUBLIC_API_URL=http://localhost:3001 npm run dev

---

## Monitoring

Railway logs: Dashboard → Logs
Vercel logs: Dashboard → Deployments → View Logs

---

## Database

PostgreSQL on Railway (auto-backed up)

---

## Cost

Railway: $7-50/month
Vercel: Free
OpenAI: ~$0.02-0.06 per execution
Cloudinary: Free tier
