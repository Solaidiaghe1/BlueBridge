

---

# 📄 Product Requirements Document

## Saved Addresses Feature — Table & Client Flow

**Product:** BlueBridge
**Scope:** Manage user saved addresses for request creation
**Out of Scope:** Worker assignment, request processing, payments

---

## 1. Objective

Enable clients to **save addresses for future requests** and dynamically **detect existing saved addresses** during request creation, improving user experience and reducing repetitive data entry.

* Clients can store multiple addresses
* Requests always capture a **snapshot** of the address
* Users can optionally **select a saved address** during request creation
* Users **must provide a label** for saved addresses (e.g., “Home”, “Rental Property”)

---

## 2. Actors

### Primary Actor

* **Client User**

  * Authenticated via Clerk
  * Has a `users.id` in Supabase

### Systems

* React Native Client App
* Supabase (Postgres + RLS)
* Clerk Authentication

---

## 3. Preconditions

1. Client is authenticated via Clerk
2. Clerk user is synced to Supabase `users` table
3. Client role = `client`
4. Local request form is in **Step 3: Address**

---

## 4. Database Schema: `addresses` Table

**Purpose:** Store all saved addresses for clients. Each address is tied to a single client.

```sql
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Client relationship
  user_id UUID NOT NULL REFERENCES users(id),
  user_clerk_id TEXT NOT NULL,

  -- Required label for multi-property support
  label TEXT NOT NULL, -- e.g., "Home", "Rental Property"

  -- Address fields
  street_address TEXT NOT NULL,
  apt_suite_unit TEXT,           -- optional
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,

  -- Default flag
  is_default BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Optional: Index for faster lookups
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
```

---

## 5. RLS (Row-Level Security) Policies

### Policy: Users can read their own addresses

```sql
CREATE POLICY "Users can view own addresses"
  ON addresses
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
```

### Policy: Users can insert their own addresses

```sql
CREATE POLICY "Users can insert own addresses"
  ON addresses
  FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
```

### Policy: Users can update their addresses

```sql
CREATE POLICY "Users can update own addresses"
  ON addresses
  FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
```

---

## 6. Client Request Form — Step 3 (Address) Flow

### 6.1 Load Step 3

**Objective:** Dynamically show “Use saved address” button if addresses exist.

**Logic:**

1. On mount, query `addresses` table for current user:

```ts
SELECT * FROM addresses
WHERE user_id = :current_user_id
ORDER BY is_default DESC, created_at DESC;
```

2. **If one or more addresses exist**:

   * Show button: **“Use saved address”**
   * Clicking populates address fields in form
   * Optional: allow editing after selection

3. **If no addresses exist**:

   * Hide saved address button
   * Show empty manual form

---

### 6.2 Checkbox: “Save address for future requests”

* Displayed below manual input fields
* Label: `☑ Save this address for future requests`
* Only visible when user enters a **new address**
* **Label field is required** when saving a new address (e.g., “Home”, “Rental Property”)

**Behavior on submit:**

1. **Check for duplicates**:

```ts
SELECT id FROM addresses
WHERE user_id = :user_id
  AND street_address = :street_address
  AND zip_code = :zip_code;
```

2. **If duplicate exists**:

   * Reuse existing `id`
   * Do not insert a new row

3. **If no duplicate**:

   * Insert new row into `addresses`
   * Return `address.id`

4. Always **insert full address snapshot** into `requests` table, regardless of saved address

---

### 6.3 Request Insert Payload Example

```ts
await supabase
  .from('requests')
  .insert([{
    client_id: supabaseUser.id,
    client_clerk_id: clerkUser.id,
    title,
    description,
    media_urls,
    street_address,
    apt_suite_unit,
    city,
    state,
    zip_code,
    address_id: savedAddressId || null, // optional foreign key
    available_dates,
    time_windows,
    pets_on_site,
    parking_notes,
    status: 'searching'
  }])
  .select()
  .single();
```

---

## 7. Success Criteria

* Saved addresses detected and dynamically displayed in Step 3
* Checkbox correctly inserts into `addresses` table
* Label field is **required** when saving a new address
* Duplicate addresses are not created
* Requests always include a **snapshot** of the address
* UI adapts based on user’s saved addresses
* Data integrity is maintained between `users`, `addresses`, and `requests`

---

## 8. Non-Goals

* Auto-selecting addresses without user input
* Editing saved addresses during request submission
* Worker assignment, offers, or payments

---

## 9. Design Principle

> **Addresses are user-owned assets; requests are immutable snapshots.**

---
