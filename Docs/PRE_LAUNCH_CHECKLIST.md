# Pre-Launch Checklist - Hypertropher

**Last Updated:** January 2025  
**Status:** Ready for Launch

---

## ✅ Completed (Automated)

### Security & Infrastructure
- ✅ **Security Headers** - Added to `next.config.mjs`
  - X-DNS-Prefetch-Control
  - Strict-Transport-Security (HSTS)
  - X-Frame-Options
  - X-Content-Type-Options
  - X-XSS-Protection
  - Referrer-Policy

- ✅ **Error Pages** - Created custom error pages
  - `app/not-found.tsx` - 404 page
  - `app/error.tsx` - 500 error page

- ✅ **Enhanced Metadata** - Updated `app/layout.tsx`
  - SEO metadata (title, description, keywords)
  - Open Graph tags for social sharing
  - Twitter Card metadata

- ✅ **Feedback System** - Added to Account page
  - Feedback form component
  - API endpoint (`/api/feedback`)
  - Note: Feedback table needs to be created in Supabase (see manual steps)

### Analytics & Monitoring
- ✅ **Vercel Analytics** - Already configured
- ⏸️ **Sentry Error Tracking** - Deferred (not needed for MVP with small userbase)

---

## 📋 Manual Steps Required

### 1. Domain Setup (Vercel)

**✅ Completed:**
- [x] Added `hypertropher.com` to Vercel (without www redirect)
- [x] Added `www.hypertropher.com` to Vercel separately

**Next Steps - Configure DNS Using Vercel Nameservers:**

1. **Get Nameservers from Vercel:**
   - In Vercel Dashboard → Your Project → Settings → Domains
   - Click on `hypertropher.com`
   - Look for "Nameservers" section
   - Copy the nameserver addresses (usually 2-4 addresses like `ns1.vercel-dns.com`, `ns2.vercel-dns.com`, etc.)

2. **Update Nameservers at Your Domain Registrar:**
   - Go to your domain registrar (where you bought hypertropher.com)
   - Find DNS/Nameserver settings
   - Replace existing nameservers with Vercel's nameservers
   - Save changes

3. **Wait for DNS Propagation:**
   - Usually takes 24-48 hours (can be faster, sometimes minutes)
   - Vercel will automatically configure all DNS records
   - SSL certificates will be issued automatically once DNS propagates

4. **Verify Setup:**
   - Check Vercel Dashboard → Domains → Status should show "Valid Configuration"
   - Wait for SSL certificate to be issued (shows in Vercel dashboard)

**Verification:**
- [ ] `https://hypertropher.com` loads correctly
- [ ] `https://www.hypertropher.com` loads correctly
- [ ] SSL certificate is valid (green padlock in browser)

---

### 2. Email/SMTP Setup

**Choose Provider:** Resend (recommended for MVP)

**Steps:**
1. Sign up at [resend.com](https://resend.com)
2. Add domain: `mail.hypertropher.com` (or use main domain)
3. Add DNS records (provided by Resend):
   - MX record
   - SPF record
   - DKIM record
   - DMARC record
4. Get SMTP credentials from Resend dashboard
5. Configure in Supabase:
   - Supabase Dashboard → Project Settings → Auth → SMTP Settings
   - Enter Resend SMTP credentials
   - From address: `Hypertropher <noreply@mail.hypertropher.com>`
6. Test OTP email delivery

**Verification:**
- [ ] OTP emails arrive in inbox (not spam)
- [ ] "From" address displays correctly
- [ ] Email deliverability score > 8/10 (use mail-tester.com)

---

### 3. Supabase Configuration

**Auth URLs:**
1. Supabase Dashboard → Authentication → URL Configuration
2. Update "Site URL" to: `https://hypertropher.com`
3. Add to "Redirect URLs":
   - `https://hypertropher.com/auth/callback`
   - `https://www.hypertropher.com/auth/callback`
   - Keep existing Vercel subdomain URLs temporarily

**Database:**
- [ ] Verify RLS policies are active
- [ ] Test database backups are enabled
- [ ] Create feedback table (optional, for storing feedback):

```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own feedback"
ON feedback FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
ON feedback FOR SELECT
TO authenticated
USING (true); -- Adjust based on your admin role logic
```

**Verification:**
- [ ] Authentication flow works on production domain
- [ ] Database queries execute correctly
- [ ] Storage bucket permissions verified

---

### 4. Google Maps API Configuration

**Steps:**
1. Google Cloud Console → APIs & Services → Credentials
2. Edit your API key
3. Under "Application restrictions" → "HTTP referrers", add:
   - `https://hypertropher.com/*`
   - `https://www.hypertropher.com/*`
4. Set up usage quotas/alerts (optional but recommended)

**Verification:**
- [ ] Google Maps autocomplete works on production
- [ ] No API key errors in console
- [ ] Usage within expected limits

---

### 5. Environment Variables (Vercel)

**Required Variables:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Set in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Set in Vercel
- [ ] `SUPABASE_SECRET_API_KEY` - Set in Vercel (server-side only)
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Set in Vercel
- [ ] `NEXT_PUBLIC_SITE_URL` - Set to `https://hypertropher.com` (important for Open Graph images and metadata)

**Steps:**
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable for "Production" environment
3. **Important:** Set `NEXT_PUBLIC_SITE_URL` to `https://hypertropher.com` after domain is working
4. Redeploy if variables were added after deployment

**Verification:**
- [ ] All environment variables are set
- [ ] Production build succeeds
- [ ] No missing env var errors in logs

---

### 6. Testing Checklist

**Authentication:**
- [ ] Sign up flow works (invite code + email OTP)
- [ ] Login flow works (email OTP)
- [ ] Logout works
- [ ] Session persists correctly

**Core Features:**
- [ ] Add dish form works
- [ ] Edit dish works
- [ ] Delete dish works
- [ ] Wishlist add/remove works
- [ ] City selection works
- [ ] Profile picture upload works
- [ ] Invite code generation/copying works

**Error Scenarios:**
- [ ] 404 page displays for invalid URLs
- [ ] Error page displays for server errors
- [ ] Network errors handled gracefully
- [ ] Invalid inputs show proper error messages

**Mobile Testing:**
- [ ] App works on iOS Safari
- [ ] App works on Android Chrome
- [ ] Touch interactions work correctly
- [ ] Images load properly
- [ ] Forms are usable on mobile

**Cross-Browser:**
- [ ] Chrome (desktop & mobile)
- [ ] Safari (desktop & mobile)
- [ ] Firefox (desktop)

---

### 7. Performance & Monitoring

**Performance:**
- [ ] Run Lighthouse audit (target: 90+ score)
- [ ] Check Core Web Vitals
- [ ] Verify images are optimized
- [ ] Test page load times (< 2.5s target)

**Monitoring:**
- [ ] Vercel Analytics is tracking
- [ ] Check Vercel logs for errors
- [ ] Monitor Supabase dashboard for issues
- [ ] Set up cost alerts (Vercel, Supabase, Google Maps)

---

### 8. Cost Monitoring Setup

**Vercel:**
- [ ] Check current usage
- [ ] Set up billing alerts (if applicable)

**Supabase:**
- [ ] Check current usage
- [ ] Monitor database size
- [ ] Monitor storage usage
- [ ] Set up usage alerts

**Google Maps:**
- [ ] Check API usage
- [ ] Set up usage quotas
- [ ] Set up billing alerts

**Resend (SMTP):**
- [ ] Monitor email usage
- [ ] Set up alerts for approaching limits

---

### 9. Communication & Documentation

**User Communication:**
- [ ] Prepare announcement message for friends
- [ ] Share invite codes with initial users
- [ ] Provide basic usage instructions

**Documentation:**
- [ ] Update README if needed
- [ ] Document any manual setup steps
- [ ] Keep bug tracking updated

---

## 🚀 Launch Day Checklist

**Before Going Live:**
- [ ] All manual steps completed
- [ ] All tests passed
- [ ] Domain is live and working
- [ ] SSL certificates valid
- [ ] Email delivery working
- [ ] No critical errors in logs

**Launch:**
- [ ] Deploy final production build
- [ ] Verify deployment successful
- [ ] Test critical paths one more time
- [ ] Announce to initial users

**Post-Launch:**
- [ ] Monitor for errors (first 24 hours)
- [ ] Collect initial user feedback
- [ ] Address any critical issues immediately
- [ ] Document any issues in Bug_tracking.md

---

## 📝 Notes

### Sentry Error Tracking
**Decision:** Deferred for MVP
**Reason:** Small, trusted userbase. Vercel logs + browser console sufficient.
**When to Add:** When scaling beyond friends or if error tracking becomes critical.

### Console.log Cleanup
**Status:** Partial
**Note:** Debug console.log statements remain in code. For production, consider:
- Removing debug logs
- Using environment-based logging
- Keeping only critical error logs

### Feedback Table
**Status:** Optional
**Current:** Feedback is logged to server console if table doesn't exist
**To Enable:** Create feedback table in Supabase (SQL provided above)

---

## 🎯 Success Criteria

**MVP Launch is Successful When:**
- ✅ All core features work on production domain
- ✅ Users can sign up and use the app
- ✅ No critical errors or security issues
- ✅ Performance meets targets (< 2.5s load time)
- ✅ Email delivery working reliably

---

## 🔄 Future Enhancements (Post-Launch)

- [ ] Add Sentry error tracking
- [ ] Implement feedback table in database
- [ ] Add more detailed analytics
- [ ] Create landing page
- [ ] Set up automated backups
- [ ] Add performance monitoring dashboard
- [ ] Implement user feedback system improvements

---

**Last Checked:** [Date]  
**Next Review:** After launch, weekly for first month

