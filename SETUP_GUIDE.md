# Pharmaline ERP - Setup Guide

## 🔐 Google OAuth Setup (Required for Login)

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing one: **"Pharmaline ERP"**
3. Click **"Create Credentials"** → **"OAuth client ID"**
4. Configure consent screen if prompted:
   - User Type: **Internal** (if you have Google Workspace) or **External**
   - App name: **Pharmaline ERP**
   - User support email: Your email
   - Developer contact: Your email
5. Create OAuth client ID:
   - Application type: **Web application**
   - Name: **Pharmaline ERP**
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for local dev)
     - `https://your-domain.vercel.app/api/auth/callback/google` (for production)
6. Copy your **Client ID** and **Client Secret**

### 2. Update Environment Variables

Add to your `.env` file:

```bash
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
```

---

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - Name: **pharmaline-erp**
   - Database Password: (save this!)
   - Region: Closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

### 2. Get Database URL

1. In your Supabase project, go to **Settings** → **Database**
2. Under "Connection string", select **URI**
3. Copy the connection string
4. Replace `[YOUR-PASSWORD]` with your actual password

Example:
```
postgresql://postgres.abc123xyz:YOUR-PASSWORD@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

### 3. Update .env

```bash
DATABASE_URL="postgresql://postgres.abc123xyz:YOUR-PASSWORD@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
```

### 4. Run Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 🚀 Run the App

```bash
npm run dev
```

Visit: **http://localhost:3000**

You'll be redirected to `/login` → Click **"Continue with Google"** → Sign in → Access dashboard!

---

## 🌐 Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "ready for deployment"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import your GitHub repo
3. Add environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (your Vercel URL: `https://your-app.vercel.app`)
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
4. Deploy!

### 3. Update Google OAuth Redirect URI

Back in Google Cloud Console, add your production URL:
```
https://your-app.vercel.app/api/auth/callback/google
```

---

## ✅ Verification Checklist

- [ ] Google OAuth credentials created
- [ ] `.env` file updated with Google credentials
- [ ] Supabase project created
- [ ] Database URL added to `.env`
- [ ] Migrations run successfully (`npx prisma migrate dev`)
- [ ] App runs locally (`npm run dev`)
- [ ] Can log in with Google
- [ ] Dashboard loads correctly
- [ ] Ready to deploy to Vercel

---

## 🆘 Troubleshooting

### "Invalid client" error on Google login
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Verify redirect URI matches exactly in Google Console

### Database connection error
- Check `DATABASE_URL` format
- Ensure password doesn't contain special characters (URL encode if needed)
- Test connection: `npx prisma db pull`

### Session/auth issues
- Generate new `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- Clear browser cookies
- Restart dev server

---

## 📧 Need Help?

Contact: malhar.soni@cautiontape.ca
