# 🚀 Botari AI - Windows Quick Start

## Step 1: Set Environment Variables

In Command Prompt (CMD), run:
```cmd
set DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/botari
set OPENAI_API_KEY=sk-your-openai-key
set JWT_SECRET=your-secret-key
```

**Replace:**
- `YOUR_PASSWORD` with your PostgreSQL password
- `sk-your-openai-key` with your OpenAI API key

## Step 2: Run Migrations

```cmd
cd botari-api
run-migrations.bat
```

## Step 3: Start All Services

Open **3 separate Command Prompt windows**:

### Window 1 - Backend:
```cmd
cd botari-api
npm run dev
```

### Window 2 - Frontend:
```cmd
cd botari-frontend
npm run dev
```
Open http://localhost:5173

### Window 3 - Admin:
```cmd
cd botari-admin
set PORT=3001
npm start
```
Open http://localhost:3001

---

## ⚠️ Port 3000 is in use?

For the admin panel, either:
1. Press **Y** to run on another port
2. Or set PORT before starting:
   ```cmd
   set PORT=3001
   npm start
   ```

## 🗄️ Don't have PostgreSQL installed?

### Option 1: Install PostgreSQL
Download from https://www.postgresql.org/download/windows/

### Option 2: Use a cloud database (Neon, Supabase, Railway)
Set the DATABASE_URL to your cloud database URL

### Option 3: Use Docker
```cmd
docker run -d --name botari-db -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15
```

## 🧪 Test if it's working

1. Open http://localhost:5173 - You should see the landing page
2. Click "Start Hiring" to register
3. Log in to see the dashboard
4. Open http://localhost:3001 for admin (if you chose a different port, use that)

## 🆘 Getting "column does not exist" errors?

The migrations haven't run successfully. Make sure:
1. PostgreSQL is running
2. DATABASE_URL is set correctly
3. The database "botari" exists (create it in pgAdmin if needed)

## 📞 Need to create the database?

In pgAdmin or psql:
```sql
CREATE DATABASE botari;
```

Then run migrations again.
