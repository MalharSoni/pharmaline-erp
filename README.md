# Pharmaline ERP

A comprehensive pharmaceutical manufacturing ERP system built for efficient production management, inventory tracking, and order fulfillment.

## Project Overview

**Client:** Pharmaline Inc. (https://pharmalineinc.com/)
**Company Size:** 50 employees
**Industry:** Pharmaceutical Manufacturing

### Core Pain Points Solved
1. **Inventory Management** — Real-time tracking of raw materials, packaging, and finished products
2. **Production Scheduling** — Plan vs actual production tracking with yield monitoring
3. **On-Time Delivery** — Cycle time tracking from PO received to dispatch

### Success Metrics (6-month goal)
- Full and efficient process flow visibility for VP of Operations
- Shorter lead times through better material availability tracking
- Revenue growth via capital-light inventory model (reorder point optimization)

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Auth:** NextAuth.js
- **UI:** Tailwind CSS + shadcn/ui
- **Icons:** Lucide React
- **Forms:** react-hook-form + Zod
- **Deployment:** Vercel

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your DATABASE_URL and NEXTAUTH_SECRET

# Run Prisma migrations
npx prisma migrate dev

# Seed database with initial data
npx prisma db seed

# Start development server
npm run dev
```

Visit `http://localhost:3000`

---

## Project Documentation

See detailed documentation in:
- `SCHEMA_DESIGN.md` — Complete database schema and design decisions
- `/docs` folder (coming soon) — Feature specifications and workflows

---

## Support

For issues or questions, contact: malhar.soni@cautiontape.ca
