
---

## 1. Objective

Enable **workers** on BlueBridge to:

1. Maintain a structured professional profile
2. Declare what services they provide and where they work
3. Discover **available client requests** that are:

   * Open
   * Still searching for a worker
   * Relevant to their services and work areas
4. Filter those requests using UI controls backed by efficient SQL queries

This PRD defines:

* Required database schemas
* Why each table exists
* How filtering works
* How to query open, available requests correctly and securely

---

## 2. Identity & Assumptions

### Authentication

* **Clerk** handles authentication
* **Supabase** is the system of record for application data

### Identity Mapping

* `users.id` (UUID) is the **primary internal identity**
* Clerk `user_id` is stored as `clerk_id` for JWT / RLS matching
* Workers are a *role* layered on top of users

---

## 3. Core Worker Tables (Schemas + Rationale)

---

### 3.1 `workers`

**Purpose:** Represents a user who can accept jobs

```sql
workers (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  clerk_id TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  rating_avg NUMERIC(2,1),
  jobs_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
)
```

**Notes**

* 1:1 with users
* Clean separation between *identity* and *capabilities*
* Used for RLS and availability checks

---

### 3.2 `services`

**Purpose:** Canonical list of supported services

```sql
services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  is_active BOOLEAN DEFAULT true
)
```

**Examples**

* Plumbing
* Electrical
* HVAC

**Why this table exists**

* Prevents free-text inconsistency
* Enables structured filtering
* Allows pricing, analytics, and expansion later

---

### 3.3 `worker_services`

**Purpose:** Declares which services a worker provides

```sql
worker_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  base_price NUMERIC,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (worker_id, service_id)
)
```

**Why this table is critical**

* Many-to-many relationship
* Allows per-service pricing, verification, experience
* Core matching logic lives here

---

### 3.4 `work_areas`

**Purpose:** Controlled vocabulary for where work occurs

```sql
work_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
)
```

**Examples**

* Bathroom
* Kitchen
* Basement
* Outdoor

---

### 3.5 `worker_work_areas`

**Purpose:** Declares where a worker is willing to work

```sql
worker_work_areas (
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  work_area_id UUID REFERENCES work_areas(id),
  PRIMARY KEY (worker_id, work_area_id)
)
```

---

## 4. Requests (Worker-Facing View)

Workers do **not** see all requests.
They only see requests that are:

* Open
* Still searching for a worker
* Match their services and work areas

---

### 4.1 Relevant Request Fields (Existing Table)

Assumed `requests` table includes:

```sql
requests (
  id UUID PRIMARY KEY,
  public_id TEXT UNIQUE,            -- BB-48291
  client_id UUID REFERENCES users(id),
  service_id UUID REFERENCES services(id),
  work_area_id UUID REFERENCES work_areas(id),
  status TEXT,
  open BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

---

### 4.2 Valid Request Statuses (Worker-Relevant)

```text
searching_for_worker   ← visible to workers
inspection_scheduled
waiting_for_offer
job_scheduled
in_progress
completed
cancelled
```

**Worker discovery only includes:**

* `status = 'searching_for_worker'`
* `open = true`

---

## 5. Worker Filter UI (Frontend → SQL Mapping)

---

### 5.1 Filter Controls (UI)

The worker “Available Requests” page includes:

| Filter              | Source         | Required |
| ------------------- | -------------- | -------- |
| Service             | services       | Yes      |
| Work Area           | work_areas     | Optional |
| Distance / Location | derived        | Optional |
| Date Range          | requests.dates | Optional |

---

### 5.2 Filter Button Behavior

**When user taps “Apply Filters”:**

1. Read selected service(s)
2. Read selected work area(s)
3. Build Supabase query with `.eq` and `.in`
4. Rely on RLS for security, but filter client-side for UX

---

### 5.3 Canonical Query (Supabase)

```ts
const { data, error } = await supabase
  .from('requests')
  .select(`
    id,
    public_id,
    created_at,
    service_id,
    work_area_id,
    status
  `)
  .eq('status', 'searching_for_worker')
  .eq('open', true)
  .in('service_id', workerServiceIds)
  .in('work_area_id', workerWorkAreaIds)
  .order('created_at', { ascending: false });
```

---

## 6. How Workers See Available Requests (End-to-End Flow)

---

### Step 1: Worker Logs In

* Clerk session established
* Supabase JWT contains `clerk_id`

---

### Step 2: Load Worker Profile

* Query `workers` by `clerk_id`
* Fetch:

  * worker_services → service_ids
  * worker_work_areas → work_area_ids

---

### Step 3: Fetch Available Requests

* Query `requests` using:

  * `status = searching_for_worker`
  * `open = true`
  * matching service + work area

---

### Step 4: Render Request Cards

Each card displays:

* Public Request ID (BB-XXXXX)
* Service name
* Work area
* Date submitted
* CTA: “View Details”

---

## 7. RLS (High Level)

### Requests Table

Workers can:

* **SELECT** requests where:

  * status = searching_for_worker
  * open = true

Workers cannot:

* Modify requests
* See client PII

---

## 8. Why This Design Is Correct

✅ Clean separation of concerns
✅ Scales to thousands of workers
✅ Enables fast matching
✅ Prevents schema rewrites
✅ Supports future features:

* Verification
* Pricing
* Ranking
* Analytics

---

## 9. Explicit Non-Goals (For Now)

* No bidding system
* No worker availability calendar
* No automatic assignment
* No cross-worker visibility

---

## 10. Summary

BlueBridge worker discovery is built on:

* **Normalized tables**
* **Explicit relationships**
* **Strict request visibility rules**
* **Frontend filtering backed by SQL**

This architecture ensures:

* Workers only see relevant jobs
* Clients get qualified matches
* The system scales without refactors

