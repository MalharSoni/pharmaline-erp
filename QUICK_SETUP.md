# ⚡ 2-Minute Setup

I've done everything I can automatically. You just need to **copy-paste 3 things**:

---

## 1️⃣ Google OAuth (2 clicks)

**Click this link:** https://console.cloud.google.com/apis/credentials/oauthclient

1. Click **"Create Project"** → Name: `Pharmaline ERP` → **Create**
2. Click **"Configure Consent Screen"**:
   - User Type: **External** → **Create**
   - App name: `Pharmaline ERP`
   - Your email in both fields
   - Click **Save and Continue** (skip scopes, test users, summary)
3. Back to **Credentials** → **"Create Credentials"** → **"OAuth client ID"**:
   - Application type: **Web application**
   - Name: `Pharmaline ERP`
   - Authorized redirect URIs → **Add URI**:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - Click **Create**
4. **COPY the Client ID and Client Secret** that pop up

**Paste them here:** `/Users/malharsoni/pharmaline-erp/.env`
```bash
GOOGLE_CLIENT_ID="paste-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="paste-here"
```

---

## 2️⃣ Supabase Database (2 clicks)

**Click this link:** https://supabase.com/dashboard/new/pharmaline-erp

1. Sign in with GitHub/Google
2. Create new project:
   - Name: `pharmaline-erp`
   - Database Password: **Make one and SAVE IT**
   - Region: Pick closest to you
   - Click **Create new project**
3. Wait 2 mins for it to finish
4. Go to **Settings** (left sidebar) → **Database** → **Connection string** → **URI**
5. **Copy the connection string** (replace `[YOUR-PASSWORD]` with your password)

**Paste it here:** `/Users/malharsoni/pharmaline-erp/.env`
```bash
DATABASE_URL="paste-the-whole-string-here"
```

---

## 3️⃣ Run This Command

Once you've pasted both credentials into `.env`:

```bash
npx prisma migrate dev --name init
```

This creates all the database tables.

---

## ✅ Done!

Refresh **http://localhost:3000** → Click "Continue with Google" → You're in!

---

## 🚨 If Something Breaks

**Show me this:**
1. Screenshot of the error
2. Contents of your `.env` file (hide passwords with `***`)

I'll fix it instantly.
