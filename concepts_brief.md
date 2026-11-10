# Single-Clinic Role-Based Access Control (RBAC) & Doctor Data Isolation

* **Author:** allwyn46
* **Date:** 2026-11-10

## Overview

MediPro operates as a clinic CRM and appointment booking system. Currently, all staff share a single administrative view with unpartitioned access to revenue figures, patient records, and daily schedules. This feature introduces a two-tier Role-Based Access Control (RBAC) architecture separating **Clinic Administrators** from **Assigned Doctors**, backed by relational `doctor_id` scoping across all patient and appointment data.

1. **Admin Role (`role: admin`)**: Retains complete clinic-wide oversight. Admins view global clinic revenue, aggregate patient schedules, the clinic-wide lead pipeline, manage custom intake fields (`/settings/leads`), and provision doctor user accounts.
2. **Doctor Role (`role: doctor`)**: Scoped exclusively to assigned clinical workflows. Doctors log in with individual credentials and view only their assigned appointments, their assigned patient leads, their individual consultation revenue, and their clinical notes.
3. **Doctor Entity Model**: Dedicated `doctors` relational table linked 1-to-1 with `users` (`user_id`), storing clinical specialty, contact details, consultation fee, and active status.
4. **Relational Scoping**: Replaces legacy plain-text `doctor` strings with foreign key `doctor_id` on both `appointments` and `leads` tables (`nullOnDelete` to preserve historical records).

## Analysis

The 7-lens Goldfish review evaluated the feature across UX ergonomics, database constraints, architectural boundaries, and inventive software transforms:

### 1. Data Model & Relational Integrity (`structural` & `codebase_details`)
* **`users` Table Extension**:
  * Add `role` column (`string`, values: `'admin'`, `'doctor'`, default `'doctor'`, indexed).
* **New `doctors` Table**:
  * Fields: `id`, `user_id` (foreign key to `users`, unique, cascade on delete), `name` (string), `specialty` (string), `phone` (string, nullable), `email` (string, unique), `consultation_fee` (decimal 10,2), `is_active` (boolean, default true), `timestamps`.
* **Foreign Key Scoping on `appointments` and `leads`**:
  * Add `doctor_id` nullable foreign key referencing `doctors.id` with `nullOnDelete()`.
  * Index `doctor_id` on both tables for performant query filtering.
  * Keep legacy `doctor` string column during transition, backed by an accessor (`getDoctorNameAttribute`) for backward compatibility.
* **Initial Data Migration & Backfill**:
  * Database migration creates initial `Doctor` records and corresponding `User` credentials for existing seeded specialists (`Dr. Eddie Lake`, `Dr. Jamik Tashpulatov`, `Dr. Emily Whalen`, `Dr. Sarah Jenkins`).
  * Relational backfill script matches existing `appointments.doctor` string to `doctors.name` and populates `doctor_id`.

### 2. Authorization & Scoping Layer (`implementation_readiness` & `zoom_out`)
* **Route Protection via Dedicated Middleware**:
  * `EnsureUserIsAdmin` middleware guards:
    * `/settings/*` and `/api/settings/*` (Lead form fields).
    * `/api/doctors/*` (Doctor management and provisioning).
    * `/api/appointments/reset-demo` (Administrative demo reset).
* **Policy Enforcement**:
  * `LeadPolicy`:
    * `view(User $user, Lead $lead)`: `$user->isAdmin() || $lead->doctor_id === $user->doctor?->id`
    * `update(User $user, Lead $lead)`: `$user->isAdmin() || $lead->doctor_id === $user->doctor?->id`
  * `AppointmentPolicy`:
    * `view(User $user, Appointment $app)`: `$user->isAdmin() || $app->doctor_id === $user->doctor?->id`
    * `update(User $user, Appointment $app)`: `$user->isAdmin() || $app->doctor_id === $user->doctor?->id`
* **Controller Query Scoping**:
  * `DashboardController`:
    * Admin: clinic-wide revenue, appointments count, active leads count.
    * Doctor: `SUM(value)` on `Won` leads assigned to `doctor_id`, appointment count for `doctor_id`, and daily schedule filtered to this doctor.
  * `LeadController::getLeads()`: Scoped to `where('doctor_id', $user->doctor->id)` when authenticated user is a doctor.
  * `AppointmentController::patients()`: Restricts searchable patient list to the doctor's assigned patients to prevent cross-doctor patient data leakage.

### 3. Edge Cases & Operational Triage (`zoom_out` & `comprehension`)
* **Unassigned Leads and Bookings**:
  * Public inquiries via `welcome.tsx` or external sources may arrive without an assigned doctor (`doctor_id = null`).
  * *Triage Protocol*: Unassigned appointments and leads are visible in the Admin workspace with an "Unassigned Specialist" badge. Admins assign a doctor, instantly dispatching the record into that doctor's workspace.
* **Doctor Deactivation vs Financial Record Preservation**:
  * Using `nullOnDelete()` ensures that if a doctor leaves the clinic or their user account is deactivated (`is_active = false`), patient billing records, historical consultations, and past activity notes remain intact in the clinic audit log.

### 4. TRIZ Inventive Contradictions & Pattern Resolutions (`inventive_catalyst`)
* **Contradiction 1: Public Booking Calendar vs Private Doctor Scoping**:
  * *Conflict*: Appointment slots must be strictly isolated to assigned doctors, yet public guests on `welcome.tsx` need to view taken slots to prevent double-booking.
  * *Resolution (Separation by Scope & Anonymization)*:
    * Keep `GET /api/appointments/booked-slots` public, returning ONLY `{ date, time, doctor_id, status }` without patient names, phone numbers, or revenue values.
    * Keep full appointment details strictly authenticated and filtered by `doctor_id`.
* **Contradiction 2: Dynamic Doctor Creation vs Hardcoded Selectors**:
  * *Conflict*: Admins need to add new doctors dynamically, but booking dialogs currently embed hardcoded arrays (`CLINIC_DOCTORS`, `CLINICAL_SERVICES`).
  * *Resolution (Shared Props Injection)*:
    * Expose active doctors via Inertia shared props (`doctors: Doctor::active()->get(['id', 'name', 'specialty'])`).
    * Booking and intake dialog dropdowns consume dynamic `doctors` prop with graceful fallback to defaults.

## Goals vs. Non-Goals

* **In-Scope Goals:**
  * Add `role` column (`admin` / `doctor`) to `users` table.
  * Create `Doctor` model and `doctors` table linked to `users` via `user_id`.
  * Add `doctor_id` foreign key with index to `appointments` and `leads` tables.
  * Seed user credentials and doctor profiles for existing clinicians and backfill historical data.
  * Build `EnsureUserIsAdmin` middleware to lock down `/settings/*` and admin APIs.
  * Authorize lead and appointment updates via Laravel Policies (`LeadPolicy`, `AppointmentPolicy`).
  * Scope `DashboardController`, `LeadController`, `PipelineController`, and `AppointmentController` by authenticated doctor.
  * Conditionally render Settings navigation in `nav-user.tsx` only for Admins.
  * Expose dynamic active doctors to booking and intake dialogs.
* **Out-of-Scope Non-Goals:**
  * Multi-organization / multi-tenant database partitioning (separate clinics or hospital chains).
  * Patient login accounts (patients remain external guest bookers).
  * Granular custom permission matrix (e.g., custom checkboxes per action); access follows the clear two-tier `Admin` vs `Doctor` role distinction.

## Alternatives Weighed

* **Alternative 1: Name-based string matching on `doctor` column**:
  * *Mechanism*: Filter records by `where('doctor', auth()->user()->name)`.
  * *Pros*: Avoids database schema changes.
  * *Cons*: Fragile. Editing a doctor's name breaks historical linkage. Doctors sharing a name cause data collisions.
  * *Reason for Rejection*: `Rejected by author: Foreign key integrity with doctor_id is strictly required for data isolation and query performance.`
* **Alternative 2: Multi-tenant schema separation (Database / Schema per Doctor)**:
  * *Mechanism*: Separate database tables or schemas for each doctor.
  * *Pros*: Maximum physical data segregation.
  * *Cons*: Enormous infrastructure overhead, complex migrations, and breaks aggregate clinic-wide reporting for the clinic administrator.
  * *Reason for Rejection*: `Rejected by author: MediPro is a single clinic where doctors collaborate under one administration. Row-level foreign key scoping cleanly achieves complete privacy without infrastructure fragmentation.`
* **Alternative 3: Third-party permissions package (e.g. Spatie Laravel Permission)**:
  * *Mechanism*: Pull in `spatie/laravel-permission` for multi-role dynamic gates.
  * *Pros*: Broad feature set for role assignments.
  * *Cons*: Adds unneeded package dependency, extra tables (`roles`, `permissions`, `model_has_roles`), and query overhead for a simple two-tier (`admin` / `doctor`) system.
  * *Reason for Rejection*: `Rejected by author: Native Laravel Gates, Policies, and Middleware provide cleaner, faster execution without external dependency weight.`

## Formal Constraints & System Invariants

1. **Unassigned Triage Invariant**: Patient inquiries and bookings with `doctor_id = null` are strictly hidden from doctor workspaces and presented exclusively in the Administrator dashboard with an "Unassigned Specialist" badge. Only Admins have the authority to assign or reassign doctors.
2. **Zero Cross-Doctor Patient Leakage**: The patient search lookup endpoint (`GET /api/patients`), single lead views (`/leads/{id}`), and appointment modification routes enforce that doctors can view and search only patients assigned to their own clinical record. Unauthorized attempts return HTTP 403 Forbidden.
3. **Financial & Audit Preservation (`nullOnDelete`)**: Foreign key definitions on `appointments.doctor_id` and `leads.doctor_id` must use `nullOnDelete()`. Deactivating or deleting a doctor profile sets foreign keys to `NULL` while preserving historical financial transactions, billing records, and clinical consultation logs.
4. **Admin-Exclusive Administrative Boundary**: The Settings route group (`/settings/*`), custom field API routes (`/api/settings/*`), doctor management endpoints (`/api/doctors/*`), and administrative utilities (`/api/appointments/reset-demo`) are protected by `EnsureUserIsAdmin` middleware. The user menu (`nav-user.tsx`) conditionally suppresses the Settings navigation link for doctors.
5. **Dynamic Selector Binding**: All appointment booking and lead intake modals must dynamically bind doctor options to active records in the `doctors` table, replacing hardcoded static doctor arrays while maintaining fallback safety for offline tests.

## Key Decisions & Staging for Next Steps

1. **Role Definition**: Add `role` column (`admin`, `doctor`) to `users` table.
2. **Doctor Model & Table**: Create `doctors` table (`id`, `user_id`, `name`, `specialty`, `phone`, `email`, `consultation_fee`, `is_active`) and `Doctor` Eloquent model.
3. **Foreign Key Migration**: Add `doctor_id` foreign key with `nullOnDelete` to `appointments` and `leads` tables; backfill existing records.
4. **Middleware & Policies**: Implement `EnsureUserIsAdmin` middleware; create `LeadPolicy` and `AppointmentPolicy`.
5. **Scoped Controllers**:
   * `DashboardController`: Scoped stats, schedule, and revenue.
   * `LeadController`: Scoped `getLeads()`, policy check on `updateStatus()` and `addNote()`.
   * `PipelineController`: Scoped Kanban board.
   * `AppointmentController`: Scoped `patients()` lookup, confirmation, and decline actions.
6. **Frontend Integration**:
   * Dynamic auth user/doctor sharing via `HandleInertiaRequests`.
   * Hide Settings link in `nav-user.tsx` for doctors.
   * Replace hardcoded doctor/service lists with dynamic active doctor props.
