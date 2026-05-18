# UnitSignUp

A modern resident treatment signup and property coordination platform built for operational efficiency, resident communication, and scalable multi-property management.

UnitSignUp streamlines how residential communities, property managers, and service teams coordinate treatment scheduling, resident participation, and administrative oversight through a centralized web platform.

---

# Features

## Resident Signup Portal
- Simple resident-facing signup workflow
- Mobile-friendly responsive interface
- Property-specific signup pages
- Secure submission handling
- Spam/bot protection with Cloudflare Turnstile

## Administrative Dashboard
- View resident submissions in real time
- Manage multiple properties from one dashboard
- Generate and manage property signup links
- Export resident data to CSV
- Centralized operational visibility

## Modern Infrastructure
- Built with Next.js
- Hosted on Vercel
- Database powered by Supabase
- Server-side protected admin functionality
- Cloudflare Turnstile integration for abuse prevention

---

# Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Backend/API | Next.js Server Functions |
| Database | Supabase (PostgreSQL) |
| Authentication/Security | Admin Password + Supabase Service Role |
| Bot Protection | Cloudflare Turnstile |
| Hosting | Vercel |

---

# Project Structure

text /app   ├── admin/   ├── api/   ├── p/[propertySlug]/   └── components/  /public /supabase   └── schema.sql  package.json README.md 

---

# Environment Variables

Create a .env.local file in the root directory:

env NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key ADMIN_PASSWORD=your-admin-password  NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key TURNSTILE_SECRET_KEY=your-turnstile-secret-key 

---

# Database Setup

Run the schema file located in:

text /supabase/schema.sql 

inside the Supabase SQL Editor.

This creates the required:
- properties
- submissions

tables used throughout the platform.

---

# Local Development

## Install Dependencies

bash npm install 

## Run Development Server

bash npm run dev 

App will run locally at:

text http://localhost:3000 

---

# Resident Signup Example

Example property signup URL:

text http://localhost:3000/p/demo-property 

Residents can:
- submit treatment participation requests
- provide unit information
- communicate access instructions
- securely send data to the database

---

# Admin Dashboard

Admin portal:

text http://localhost:3000/admin 

Capabilities include:
- viewing all resident submissions
- exporting operational CSV reports
- managing property signup pages
- monitoring participation rates

---

# Security Notes

- Never expose the SUPABASE_SERVICE_ROLE_KEY
- Keep admin credentials server-side only
- Cloudflare Turnstile is strongly recommended for production deployment
- All sensitive operations should run through protected server-side logic

---

# Deployment

## Recommended Hosting: Vercel

Deploy directly through:

https://vercel.com

Add all environment variables before deploying.

---

# Scalability Vision

UnitSignUp is designed to scale beyond a simple signup form into a full operational coordination platform for:

- Residential property management
- Pest control coordination
- Maintenance scheduling
- Vendor communication
- Compliance tracking
- Multi-property operational oversight

---

# Future Roadmap

- Resident SMS notifications
- Email confirmations
- QR-code property onboarding
- Role-based admin accounts
- Property analytics dashboard
- Automated scheduling windows
- Maintenance request integration
- Resident status tracking

---

# License

Private/Internal Project

---

# Author

Taylor Kimura  
Account Manager & Operations Development
