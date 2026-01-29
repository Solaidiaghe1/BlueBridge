

# 📄 Product Requirements Document

## Client → Supabase Request Write Flow

**Product:** BlueBridge
**Scope:** Capture client request in Supabase from request form
**Out of Scope:** Worker acceptance, offers, or payments

---

## 1. Objective

Enable clients to submit a complete service request from the app and have it **stored in Supabase**, including:

* Client information
* Address (saved or new)
* Media attachments (images/videos)
* Availability / time windows
* Additional notes
* Status tracking for worker assignment

The goal is **zero friction**, **accurate snapshot**, and **future reference**.

---

## 2. Actors

### Primary Actor

* **Client User**

  * Authenticated via Clerk
  * `users.id` exists in Supabase

### Systems

* React Native Client App
* Supabase (Postgres + RLS)
* Clerk Authentication
* Cloud Storage (Supabase Storage)

---

## 3. Preconditions

1. Client is authenticated via Clerk
2. Client has a `users.id` in Supabase
3. Client has **Step 3: Address** filled (saved or new)
4. Form fields are validated locally

---

## 4. Database Schema: `requests` Table (Updated for Photos & Videos)

```sql
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Client references
  client_id UUID NOT NULL REFERENCES users(id),
  client_clerk_id TEXT NOT NULL,

  -- Worker assignment (optional, null until assigned)
  worker_id UUID REFERENCES users(id),
  worker_clerk_id TEXT,

  -- Request details
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Media URLs split into photos & videos
  photos TEXT[] DEFAULT '{}',  -- array of image URLs
  videos TEXT[] DEFAULT '{}',  -- array of video URLs

  -- Address snapshot
  street_address TEXT NOT NULL,
  apt_suite_unit TEXT,           -- optional
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  address_id UUID REFERENCES addresses(id), -- optional FK

  -- Schedule / availability
  available_dates DATE[] NOT NULL,
  time_windows TEXT[] NOT NULL,  -- e.g., ["10:00-12:00", "14:00-16:00"]

  -- Additional notes
  pets_on_site BOOLEAN DEFAULT false,
  parking_notes TEXT,

  -- Status workflow
  status TEXT CHECK (status IN (
    'searching_for_worker',
    'inspection_scheduled',
    'waiting_for_offer',
    'job_scheduled',
    'completed',
    'cancelled'
  )) DEFAULT 'searching_for_worker',
  is_open BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for filtering by client
CREATE INDEX idx_requests_client_id ON requests(client_id);

-- Index for status filtering
CREATE INDEX idx_requests_status ON requests(status);
```

---

## 5. Supabase Storage — Media Handling

1. Images and videos uploaded from client device
2. Store files in **Supabase Storage bucket**, organized by:

   ```
   requests/<request_id>/<filename>
   ```
3. After upload, store returned **public URLs** in `requests.media_urls` array

---

## 6. Client Request Form Flow

### Step 1: General Details

* Fields: `title`, `description`
* Validation: max length (title 50 words, description 300 words)

### Step 2: Media Upload

## 6.2 Media Upload (Updated)

* Users can attach multiple **images** and **videos**
* Upload separately to Supabase Storage:

  ```
  requests/<request_id>/photos/<filename>
  requests/<request_id>/videos/<filename>
  ```
* After upload, store returned **URLs** in respective arrays:

```ts
photos: string[]  // image URLs
videos: string[]  // video URLs
```

* During request insert:

```ts
await supabase
  .from('requests')
  .insert([{
    ...otherFields,
    photos: photosArray,
    videos: videosArray
  }])
  .select()
  .single();
```

---

### Step 3: Address (Saved or New)

* Follow **Saved Address PRD**
* If “Use saved address” selected → populate address fields
* If new and checkbox = save → insert into `addresses`

### Step 4: Availability / Time Windows

* Multi-date selection
* Multi-time window selection per date
* Store as `available_dates` and `time_windows` arrays

### Step 5: Additional Notes

* `pets_on_site` (checkbox)
* `parking_notes` (optional text field)

### Step 6: Review

* Show **full request preview**, including media
* User confirms submission

### Step 7: Submit

* **Validate all fields**
* Upload media if not done yet
* Insert request into `requests` table

---

## 7. Insert Logic (Example)

```ts
const requestPayload = {
  client_id: supabaseUser.id,
  client_clerk_id: clerkUser.id,
  title,
  description,
  media_urls,        // array of URLs from Supabase Storage
  street_address,
  apt_suite_unit,
  city,
  state,
  zip_code,
  address_id: savedAddressId || null,
  available_dates,
  time_windows,
  pets_on_site,
  parking_notes,
  status: 'searching_for_worker',
  is_open: true
};

const { data, error } = await supabase
  .from('requests')
  .insert([requestPayload])
  .select()
  .single();
```

---

## 8. RLS (Row-Level Security)

* **Clients can read their own requests**

```sql
CREATE POLICY "Clients can view own requests"
  ON requests
  FOR SELECT
  USING (client_id = current_setting('request.jwt.claims', true)::json->>'sub');
```

* **Clients can insert requests**

```sql
CREATE POLICY "Clients can insert requests"
  ON requests
  FOR INSERT
  WITH CHECK (client_id = current_setting('request.jwt.claims', true)::json->>'sub');
```

* **Clients can update their requests** (limited fields, optional)

---

## 9. Success Criteria

* Request inserted correctly into `requests` table
* Media files uploaded and URLs saved in `media_urls`
* Address snapshot included and optional FK to saved address
* Status initialized correctly (`searching_for_worker`)
* Multi-date and multi-time-window arrays stored correctly
* Clients can see their requests in **Request Status Page**

---

## 10. Non-Goals

* Worker assignment / offers / scheduling
* Payments or Stripe integration
* Push notifications (handled separately)

---

## 11. Design Principle

> **Requests are immutable records**.
> **Saved addresses are reusable assets**, always referenced, never overwritten.
> Media files are **linked via URL**, never embedded in database.

---



