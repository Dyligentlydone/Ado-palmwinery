# ADO Palmwinery - Enterprise E-commerce Platform

A modern enterprise-level e-commerce website for premium palm products.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS v4
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Payments**: ONVO Pay hosted checkout integration
- **i18n**: English & Spanish (auto-detected by browser language)
- **Currencies**: USD, CRC (browse in EUR/GBP, charged in USD)

## Project Structure

```
├── client/           # React frontend (Vite)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route pages (storefront + admin)
│   │   ├── context/      # React context providers
│   │   ├── services/     # API client
│   │   ├── i18n/         # Translation files
│   │   └── types/        # TypeScript types
│   └── ...
├── server/           # Express backend
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth, locale, validation
│   │   ├── services/     # Business logic (ONVO Pay, shipping)
│   │   └── config/       # DB, constants
│   └── prisma/           # Schema & seed data
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Setup

1. **Install dependencies**:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

2. **Configure environment**:
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your database URL and API keys
   ```

3. **Set up database**:
   ```bash
   cd server
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```

4. **Start development**:
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev

   # Terminal 2 - Frontend
   cd client && npm run dev
   ```

5. **Access**:
   - Store: http://localhost:5173
   - Admin: http://localhost:5173/admin/login
   - API: http://localhost:5000/api

### Demo Credentials

- **Admin**: admin@adopalmwinery.com / admin123456
- **Customer**: demo@example.com / customer123

## Features

### Storefront
- Product catalog with search, filtering, and pagination
- Product detail pages with image gallery
- Shopping cart with quantity management
- Full checkout flow with shipping calculation
- Order history and tracking
- Multi-language support (EN/ES) with auto-detection
- Multi-currency display (USD/EUR/GBP)

### Admin Dashboard
- Analytics dashboard with revenue charts
- Order management with status updates and tracking
- Product CRUD with multi-language support
- Shipping zone management
- Secure JWT authentication

### Payments
- ONVO Pay hosted checkout integration for payment processing
- Webhook handling for payment status updates
- Multi-currency support
- Refund capability

## API Endpoints

| Method | Endpoint                    | Description          | Auth     |
|--------|-----------------------------|----------------------|----------|
| POST   | /api/auth/register          | Register user        | -        |
| POST   | /api/auth/login             | Login                | -        |
| GET    | /api/auth/profile           | Get profile          | User     |
| GET    | /api/products               | List products        | -        |
| GET    | /api/products/:slug         | Product detail       | -        |
| GET    | /api/products/featured      | Featured products    | -        |
| GET    | /api/products/categories    | List categories      | -        |
| GET    | /api/cart                   | Get cart             | User     |
| POST   | /api/cart/items             | Add to cart          | User     |
| PUT    | /api/cart/items/:id         | Update cart item     | User     |
| DELETE | /api/cart/items/:id         | Remove cart item     | User     |
| POST   | /api/orders                 | Create order         | User     |
| GET    | /api/orders/my              | My orders            | User     |
| POST   | /api/shipping/calculate     | Calculate shipping   | -        |
| GET    | /api/orders/admin/all       | All orders           | Admin    |
| GET    | /api/orders/admin/analytics | Analytics            | Admin    |
| PUT    | /api/orders/admin/:id       | Update order         | Admin    |
| POST   | /api/products/admin         | Create product       | Admin    |
| PUT    | /api/products/admin/:id     | Update product       | Admin    |
| DELETE | /api/products/admin/:id     | Delete product       | Admin    |
