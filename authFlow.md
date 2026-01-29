```markdown
# 📘 Product Requirements Document (PRD)
## Authentication & User Sync Flow  
### BlueBridge (Clerk + Supabase + Expo / React Native)

---

## 1. Purpose & Scope

This document defines the **complete authentication lifecycle** for the BlueBridge mobile application, including:

- Sign up vs sign in behavior
- Email verification
- Session handling
- Navigation gating
- Clerk → Supabase user synchronization
- Failure states and guardrails

This PRD applies to **client and worker users** and is **frontend-driven**, with Supabase enforcing backend integrity via Row Level Security (RLS).

---

## 2. System Responsibilities

### Clerk (Identity Provider)
Responsible for:
- User creation
- Email/password authentication
- Email verification
- Session creation and management
- Issuing JWTs

Clerk is the **source of truth for identity**.

---

### Supabase (Application Database)
Responsible for:
- Storing app-specific user data (role, phone, etc.)
- Enforcing access via Row Level Security
- Associating records with Clerk users

Supabase is the **source of truth for product state**.

---

## 3. Core Concepts

### User vs Session
- **User**: Permanent identity (email, name, ID)
- **Session**: Temporary authenticated state

Rules:
- A user can exist without a session
- A session cannot exist without a user
- Supabase access is allowed **only when a session exists**

---

## 4. High-Level Authentication Flow

```

App Launch
↓
Check Clerk Session
↓
┌──────────────────────────────┐
│ No Session                   │
│ → Authentication Flow        │
└──────────────────────────────┘
┌──────────────────────────────┐
│ Session Exists               │
│ → Supabase User Lookup       │
└──────────────────────────────┘

````

---

## 5. Detailed Flow Breakdown

---

### 5.1 App Launch / Cold Start

**Goal:** Determine whether the user is authenticated and where to route them.

**Logic:**
- Wait for Clerk to load (`isLoaded`)
- Check for active session (`isSignedIn`)

**Outcomes:**

| Condition | Action |
|--------|------|
| `!isSignedIn` | Navigate to Auth |
| `isSignedIn` & no Supabase user | Navigate to Role Selection |
| `isSignedIn` & Supabase user exists | Navigate to Home |

---

### 5.2 Authentication Screens

**Required Components:**
- `AuthContainer`
- `SignInScreen`
- `SignUpScreen`
- `VerificationScreen`

**Rules:**
- Sign in and sign up are separate flows
- Supabase must NOT be accessed here
- No navigation to app routes yet

---

### 5.3 Sign Up Flow

**Sequence:**
1. User enters email + password
2. Clerk creates user
3. Clerk sends verification email
4. App navigates to Verification screen

**Constraints:**
- Do NOT create Supabase user here
- Do NOT assign role here
- Do NOT assume session exists

---

### 5.4 Email Verification Flow (Critical)

**Sequence:**
1. User submits verification code
2. Clerk verifies email
3. Clerk creates session
4. App sets active session
5. Verification logic stops

**Required Guard (Idempotency):**
```ts
if (signUp.status === 'complete') return;
````

**Failure Mode:**

* Verification logic running more than once causes:

  * `"already verified"` errors
  * navigation loops

---

### 5.5 Session Activation (Gate)

A session is considered active when:

* `isSignedIn === true`
* `user.id` exists
* `getToken()` returns a JWT

🚫 No Supabase calls are allowed before this point.

---

### 5.6 Clerk → Supabase Session Bridging (Mandatory)

**Purpose:** Allow Supabase to evaluate RLS using Clerk identity.

**Required Implementation:**

```ts
const token = await getToken({ template: 'supabase' });

await supabase.auth.setSession({
  access_token: token,
  refresh_token: token,
});
```

**Failure Mode if Skipped:**

* Supabase treats user as anonymous
* Inserts/selects silently fail
* User never appears in database

---

### 5.7 Post-Verification Routing

**Logic:**

```
IF Supabase user exists
→ Home
ELSE
→ Role Selection
```

**Role Selection:**

* Client vs Worker
* Product logic, not authentication logic

---

### 5.8 Supabase User Creation (User Sync)

**Rules:**

* Runs exactly once per user
* Happens only AFTER:

  * Email verification
  * Session activation
  * Supabase session bridging
  * Role selection

**Data Sources:**

| Field         | Source |
| ------------- | ------ |
| clerk_user_id | Clerk  |
| email         | Clerk  |
| first_name    | Clerk  |
| last_name     | Clerk  |
| role          | UI     |
| phone         | null   |

**Insert Logic:**

```
SELECT user WHERE clerk_user_id = X
IF exists → return user
ELSE → INSERT user
```

---

### 5.9 Progressive Onboarding (Optional)

Used to collect:

* Phone
* Address
* DOB

**Rules:**

* Update Supabase only
* Clerk is untouched unless identity fields change

---

## 6. Navigation Rules

**Absolute Rules:**

* ❌ Never navigate to Home on session creation alone
* ✅ Navigate only when:

  * Session exists
  * Supabase user exists

**Common Failure:**

* Session is active but Supabase user missing
* App remains stuck in auth state

---

## 7. Required Components Summary

### Auth Layer

* `AuthProvider` (Clerk)
* `SessionGate`
* `SignIn`
* `SignUp`
* `VerifyEmail`

### Data Layer

* `useUserSync`
* `bridgeSupabaseSession`

### Navigation Guards

* `RequireSession`
* `RequireSupabaseUser`

---

## 8. Common Failure States

| Symptom                     | Root Cause                       |
| --------------------------- | -------------------------------- |
| Session active, no redirect | Supabase user not created        |
| "Already verified" error    | Duplicate verification execution |
| Supabase empty              | JWT not bridged                  |
| Sync never runs             | Incorrect guard logic            |

---

## 9. Non-Goals

* Supabase authentication
* Password handling outside Clerk
* Role storage in Clerk
* Auto-creating users without explicit flow

---

## 10. Success Criteria

* User verifies email → lands on Role Selection
* Role selected → Supabase user created
* App navigates to Home
* Subsequent launches skip auth flow entirely

---

## 11. TL;DR (For AI Systems)

> **Create user in Clerk → Verify email → Activate session → Bridge JWT → Select role → Create Supabase user → Navigate to Home**

Any deviation from this order will break authentication and user sync.

```

If you want, I can also:
- Split this into **Auth PRD + Data PRD**
- Add **state diagrams**
- Convert this into a **step-by-step AI prompt**
- Generate a **checklist version for debugging**

Just tell me.
```
