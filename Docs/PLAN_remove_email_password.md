# Detailed Plan: Remove Email+Password Authentication

## Overview
Remove email+password authentication method and keep only email+OTP. This simplifies the codebase and fixes the broken email verification flow.

## Impact Assessment

### ✅ Safe to Remove
- **Existing Users with Passwords**: Can still log in via OTP (Supabase allows this)
- **No Breaking Changes**: Users are not locked out - they can use OTP instead
- **OTP Flow Already Working**: The OTP signup/login flow is fully functional

### ⚠️ Considerations
- Users who prefer passwords will need to use OTP
- One additional email per login (but manageable cost)

---

## Files to Modify

### 1. Frontend - Signup/Login Page (`app/signup/page.tsx`)

**Changes:**
- Remove `SignupMethod` and `LoginMethod` type definitions (only keep OTP)
- Remove `password` and `confirmPassword` state variables
- Remove signup/login method selection buttons (Email+Password vs Email+OTP)
- Remove password input fields and validation
- Remove "Forgot password?" link from login form
- Set default `signupMethod` and `loginMethod` to `'email_otp'` (or remove entirely)
- Simplify `handleSignup` to only handle OTP flow
- Simplify `handleLogin` to only handle OTP flow
- Remove `refreshSession()` call after password login (only needed for OTP now)

**Code Locations:**
- Lines 14-15: Type definitions
- Lines 19-20: State initialization
- Lines 25-26: Password state
- Lines 48-60: Password validation in signup
- Lines 67-70: Password in request body
- Lines 106-110: Password validation in login
- Lines 117-119: Password in request body
- Lines 129-132: Password login success handling
- Lines 190-215: Signup method selector UI
- Lines 231-258: Password fields in signup form
- Lines 283-307: Login method selector UI
- Lines 323-345: Password field in login form (including forgot password link)

---

### 2. Backend - Signup API (`app/api/auth/signup/route.ts`)

**Changes:**
- Remove `password` and `provider` from request body destructuring
- Remove password validation (length check)
- Remove email+password signup branch (lines 66-97)
- Keep only OTP signup flow
- Update invite code validation (already present, no changes needed)

**Code Locations:**
- Line 8: Request body parameters
- Lines 65-97: Email+password signup logic
- Lines 99-121: OTP signup (keep this)

---

### 3. Backend - Login API (`app/api/auth/login/route.ts`)

**Changes:**
- Remove `password` from request body destructuring
- Remove `useOtp` parameter (always use OTP now)
- Remove password validation
- Remove `signInWithPassword` call
- Keep only OTP login flow
- Simplify rate limiting message

**Code Locations:**
- Line 7: Request body parameters
- Lines 42-61: OTP login (keep this)
- Lines 62-87: Email+password login (remove this)

---

### 4. Auth Callback Route (`app/auth/callback/route.ts`)

**Changes:**
- Update comment (line 16) - remove reference to email+password verification
- Route already handles OTP verification correctly, minimal changes needed

**Code Locations:**
- Line 16: Comment update only

---

### 5. Files to Delete

**Password Reset Pages:**
- `app/reset-password/page.tsx` - Delete entire file
- `app/update-password/page.tsx` - Delete entire file
- `app/api/auth/reset-password/route.ts` - Delete entire file

**Reason:** These are only needed for password-based auth, which we're removing.

---

### 6. Documentation Updates

**Files to Update:**
- `DATABASE_SCHEMA.md`: Remove references to email+password auth
- `Docs/Implementation.md`: Update authentication section
- `Docs/Bug_tracking.md`: Document this as a change (if needed)

**Specific Updates:**
- `DATABASE_SCHEMA.md` line 89-90: Update auth methods list
- `Docs/Implementation.md` line 615: Update authentication methods

---

## Implementation Steps (In Order)

### Step 1: Update Frontend Signup Page
1. Remove password-related state and types
2. Remove method selector UI
3. Remove password input fields
4. Simplify form handlers to only use OTP
5. Test signup flow

### Step 2: Update Backend APIs
1. Simplify signup API to only handle OTP
2. Simplify login API to only handle OTP
3. Test API endpoints

### Step 3: Delete Password Reset Pages
1. Delete `app/reset-password/page.tsx`
2. Delete `app/update-password/page.tsx`
3. Delete `app/api/auth/reset-password/route.ts`
4. Remove any references to these routes

### Step 4: Update Auth Callback
1. Update comment in callback route

### Step 5: Update Documentation
1. Update `DATABASE_SCHEMA.md`
2. Update `Docs/Implementation.md`
3. Update any other relevant docs

### Step 6: Testing
1. Test complete OTP signup flow
2. Test complete OTP login flow
3. Verify existing password users can log in with OTP
4. Verify no broken links or references

---

## Edge Cases & Safety Checks

### ✅ Existing Users with Passwords
- **Status**: Safe - They can use OTP to log in
- **Action**: No migration needed, Supabase supports both

### ✅ Password Reset Links
- **Status**: Will be removed, but existing links might still work
- **Action**: Consider adding redirect to signup page with message

### ✅ Email Verification Links (Password Signup)
- **Status**: Some users might have pending verification emails
- **Action**: Callback route still handles these, but they should complete profile via OTP if needed

### ✅ API Backwards Compatibility
- **Status**: Breaking change - APIs will reject password parameters
- **Action**: Expected and intentional

---

## Verification Checklist

After implementation, verify:
- [ ] Signup form only shows email and invite code fields
- [ ] Login form only shows email field
- [ ] No password-related UI elements visible
- [ ] OTP signup flow works end-to-end
- [ ] OTP login flow works end-to-end
- [ ] Password reset pages are deleted
- [ ] No broken links or 404s
- [ ] TypeScript compilation succeeds
- [ ] No linter errors
- [ ] Documentation updated
- [ ] Existing users can log in with OTP

---

## Rollback Plan

If issues arise:
1. Revert git commit
2. All password functionality will be restored
3. Existing users unaffected (can use either method)

---

## Notes

- **Cost**: Additional email per login (manageable with SMTP provider)
- **Security**: Improved (no password-related vulnerabilities)
- **UX**: Simplified (one consistent flow)
- **Code**: Significantly reduced complexity

