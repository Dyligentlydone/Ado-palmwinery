# ADO Palmwinery - Project Notes

## Build & Run Commands

### Frontend (client/)
- `npm run dev` - Start Vite dev server on port 5173
- `npm run build` - Build for production
- `npx tsc --noEmit` - Type check

### Backend (server/)
- `npm run dev` - Start Express server with tsx watch on port 5000
- `npm run build` - Compile TypeScript
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run DB migrations
- `npm run prisma:seed` - Seed database with sample data
- `npm run prisma:studio` - Open Prisma Studio

## Database Setup
Requires PostgreSQL. Set `DATABASE_URL` in `server/.env`.
Run `npx prisma migrate dev --name init` then `npm run prisma:seed`.

## Key Architecture
- Frontend proxies `/api` requests to backend via Vite config
- JWT auth with Bearer tokens stored in localStorage
- i18n: English/Spanish with browser language auto-detection
- Multi-currency: product prices stored per-currency in DB
- ONVO Pay: hosted checkout integration ready, needs `ONVO_SECRET_KEY` + `ONVO_WEBHOOK_SECRET` in `.env`. Charges in USD/CRC only; EUR/GBP shoppers checkout in USD

## Admin Credentials (dev seed)
- admin@adopalmwinery.com / admin123456
