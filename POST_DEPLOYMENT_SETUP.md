# Post-Deployment Setup - Final Step

## ✅ Deployment Complete!

Your Pharmaline ERP is now live at:
- **Production URL**: https://n-guayqrn90-malhar-sonis-projects.vercel.app
- **Alias**: https://n-sable-three.vercel.app

---

## 🔐 Critical: Update Google OAuth Redirect URIs

To enable authentication on your production site, you need to add the production URL to your Google OAuth credentials.

### Steps:

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com/apis/credentials

2. **Select Your OAuth 2.0 Client**:
   - Click on the OAuth client ID you created for this app

3. **Add Authorized Redirect URIs**:
   - Under "Authorized redirect URIs", click "+ ADD URI"
   - Add these two URLs:
     ```
     https://n-guayqrn90-malhar-sonis-projects.vercel.app/api/auth/callback/google
     https://n-sable-three.vercel.app/api/auth/callback/google
     ```

4. **Save Changes**:
   - Click "Save" at the bottom

5. **Test Authentication**:
   - Go to your production URL: https://n-guayqrn90-malhar-sonis-projects.vercel.app
   - Click "Continue with Google"
   - Verify you can sign in successfully

---

## 🎯 First Steps After Auth Works

1. **Sign in with Google** on production URL
2. **Promote yourself to Admin**:
   - Go to Supabase Dashboard: https://supabase.com/dashboard
   - Open SQL Editor
   - Run this query (replace with your email):
     ```sql
     UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@gmail.com';
     ```

3. **Add Initial Data**:
   - Navigate to `/inventory` → Add raw materials and packaging
   - Navigate to `/clients` → Add your first clients
   - Navigate to `/sourcing` → Add suppliers
   - Navigate to `/bom` → Create product formulas
   - Navigate to `/orders` → Create your first order!

---

## 🔄 Optional: Set Up Custom Domain

If you want a custom domain (e.g., `app.pharmaline.com`):

1. **Go to Vercel Dashboard**:
   - https://vercel.com/malhar-sonis-projects/n/settings/domains

2. **Add Domain**:
   - Enter your custom domain
   - Follow DNS configuration instructions

3. **Update Google OAuth**:
   - Add new redirect URI: `https://your-custom-domain.com/api/auth/callback/google`

4. **Update Vercel Environment Variable**:
   - In Vercel dashboard → Settings → Environment Variables
   - Update `NEXTAUTH_URL` to your custom domain

---

## 📊 Monitoring & Analytics (Optional)

### Vercel Analytics
```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to app/layout.tsx:
import { Analytics } from '@vercel/analytics/react'
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

# Redeploy
vercel --prod --yes
```

### Error Monitoring (Sentry)
```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs

# Follow prompts and redeploy
```

---

## 🎉 You're All Set!

Your Pharmaline ERP is now:
- ✅ Deployed to production
- ✅ Connected to Supabase PostgreSQL
- ✅ Ready for Google OAuth (after URI update)
- ✅ Fully functional with all features

**Next**: Update Google OAuth redirect URIs and start using your app!
