# 🚀 Botari AI - Quick Start Guide

## ✅ What's Been Built

Your AI employee platform is complete with:

| Component | Status | Description |
|-----------|--------|-------------|
| **Backend API** | ✅ Running | Express + TypeScript on port 4000 |
| **Frontend** | ✅ Ready | React + Vite customer dashboard |
| **Admin Panel** | ✅ Ready | React admin dashboard |
| **Chat Widget** | ✅ Ready | Embeddable widget for any website |
| **WhatsApp** | ✅ Ready | Baileys integration for WhatsApp |
| **AI Agents** | ✅ Ready | 10 AI employees with actions |
| **Voice Calls** | ✅ Ready | Vonage integration (needs API key) |
| **Analytics** | ✅ Ready | Dashboard metrics & reports |

## 📋 10 AI Employees Available

1. **Amina** ($49) - WhatsApp Sales (EN/SW/Pidgin)
2. **Stan** ($99) - B2B Sales Rep
3. **Eva** ($99) - Customer Support
4. **Zara** ($99) - Appointment Scheduler
5. **Omar** ($149) - Voice/Call Agent (EN/AR/FR)
6. **Leila** ($149) - Social Media Manager
7. **Kofi** ($149) - Content Writer
8. **Priya** ($299) - Legal Assistant
9. **Marcus** ($299) - Financial Analyst
10. **Tunde** ($299) - Operations Manager

## 🛠️ Quick Start (Windows)

### Step 1: Set Environment Variables

In PowerShell, run:
```powershell
$env:DATABASE_URL = "postgresql://user:password@localhost:5432/botari"
$env:OPENAI_API_KEY = "sk-your-openai-key"
$env:JWT_SECRET = "your-secret-key"
```

Or create a `.env` file in `botari-api/`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/botari
OPENAI_API_KEY=sk-your-openai-key
JWT_SECRET=your-jwt-secret
PORT=4000
```

### Step 2: Run Database Migrations

**Option A - Using batch file:**
```cmd
cd botari-api
run-migrations.bat
```

**Option B - Manual with psql:**
```cmd
psql postgresql://user:password@localhost:5432/botari -f migrations/001_initial_schema.sql
psql postgresql://user:password@localhost:5432/botari -f migrations/002_add_indexes.sql
psql postgresql://user:password@localhost:5432/botari -f migrations/003_seed_data.sql
psql postgresql://user:password@localhost:5432/botari -f migrations/004_add_signal_keys_table.sql
psql postgresql://user:password@localhost:5432/botari -f migrations/004_analytics_views.sql
psql postgresql://user:password@localhost:5432/botari -f migrations/004_voice_calls.sql
psql postgresql://user:password@localhost:5432/botari -f migrations/004_seed_ai_employees.sql
```

**Option C - Using pgAdmin or DBeaver:**
Open each SQL file in `botari-api/migrations/` and execute them in order.

### Step 3: Start the Backend

```powershell
cd botari-api
npm run dev
```

You should see:
```
🚀 Botari API running on port 4000
🤖 AI Agents: Active
📱 WhatsApp Webhook: /api/webhook/whatsapp
```

### Step 4: Start the Frontend (New Terminal)

```powershell
cd botari-frontend
npm run dev
```

Open http://localhost:5173

### Step 5: Start the Admin Panel (New Terminal)

```powershell
cd botari-admin
npm start
```

Open http://localhost:3000

## 📁 Project Structure

```
botari-ai/
├── botari-api/           # Backend API (Express + TypeScript)
│   ├── src/
│   │   ├── agent/        # AI agents with function calling
│   │   ├── routes/       # API endpoints
│   │   ├── voice/        # Vonage voice integration
│   │   ├── whatsapp/     # Baileys WhatsApp integration
│   │   ├── analytics/    # Analytics engine
│   │   └── db.ts         # Database connection
│   └── migrations/       # SQL migration files
├── botari-frontend/      # Customer dashboard (React + Vite)
├── botari-admin/         # Admin panel (React)
└── botari-widget/        # Embeddable chat widget
```

## 🔌 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register` | Register business |
| `POST /api/auth/login` | Login |
| `GET /api/employees` | List AI employees |
| `GET /api/employees/my-team` | Get hired team |
| `POST /api/employees/hire` | Hire employee |
| `POST /api/whatsapp/connect` | Connect WhatsApp |
| `POST /api/agents/execute` | Execute AI action |
| `GET /api/dashboard/stats` | Dashboard stats |
| `GET /api/analytics/overview` | Platform analytics |

## 🐛 Troubleshooting

### "column 'employee_id' does not exist"
→ Run the migrations (Step 2 above)

### "Vonage API credentials not configured"
→ Optional - add Vonage keys to .env or ignore for now

### "psql not found"
→ Install PostgreSQL or use pgAdmin/DBeaver to run SQL files

### Port already in use
→ Change PORT in .env or kill the process using port 4000

## 📞 Support

If you need help:
1. Check the logs in the terminal
2. Review the SQL files in `migrations/`
3. Check the docs in `botari-api/docs/`

---

**🎉 Your Botari AI platform is ready! Start hiring AI employees!**
