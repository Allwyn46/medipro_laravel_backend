# Dedicated Appointments Navigation & Advanced Schedule Filtering

* **Author:** allwyn46
* **Date:** 2026-11-13

## Overview

Clinical staff and specialists need an authoritative, full-screen registry to search, filter, and audit patient appointments across any date window and lifecycle status without cluttering the operational front-desk dashboard. Currently, appointments are embedded on the main dashboard alongside revenue widgets, where filtering is restricted to basic search, doctor selection, and single-day tabs (Today/Tomorrow).

This feature introduces a dedicated "Appointments" tab directly beneath "Leads" in the main sidebar, navigating to `/appointments`. The page provides an advanced, read-only data table featuring multi-status selection (enabling concurrent filtering across statuses such as `Confirmed`, `Pending`, `Awaiting Confirmation`, and `Reschedule`), dual-layer date filtering (combining quick preset pills like `Today`, `Tomorrow`, `This Week`, and `This Month` with a custom date-range picker), and strict doctor role-based scoping so clinicians only see their own appointments while administrators retain clinic-wide visibility. The dashboard's existing appointments table remains intact for daily front-desk operations.

## Analysis

Evaluating this concept against the live MediPro codebase across seven architectural review lenses surfaces several technical requirements and constraints:

1. **Routing and Controller Method Disambiguation:**
   `AppointmentController` already defines an `index(): JsonResponse` method used by JSON consumers. Overwriting or overloading this method creates a route collision. The dedicated Inertia page must use a dedicated controller action, `registry(Request $request): Response`, registered as `Route::get('/appointments', [AppointmentController::class, 'registry'])->name('appointments.index');`.

2. **Doctor-Level Scoping and Authorization Boundary:**
   To maintain security isolation between specialists (as verified in `DoctorScopingTest.php`):
   - When an authenticated user has the `doctor` role (`$user->isDoctor()`), the query must strictly restrict results to `$user->doctor->id`. Any input parameter such as `?doctor_id=...` passed in the query string must be ignored.
   - When an authenticated administrator (`$user->isAdmin()`) visits the page, all clinic appointments are visible by default, and an optional specialist dropdown allows filtering by a specific doctor. The list of active doctors is passed as a prop exclusively to administrators.

3. **Date Normalization for Interval Filtering:**
   Appointment records in the database store dates as text strings (`YYYY-MM-DD`, alongside relative values like `'Today'`, `'Tomorrow'`, `'Nov 6'`). Evaluating interval conditions (such as `date >= dateFrom && date <= dateTo`) against unnormalized strings produces inaccurate results. The client-side table must use a date normalizer mirroring `Appointment::getScheduledDate()` that converts relative and formatted strings into standardized ISO date strings (`YYYY-MM-DD`) before interval checks.

4. **Multi-Status Selection and Quick Groupings:**
   Instead of a single dropdown, status filtering uses a faceted multi-select popover with checkboxes for each lifecycle status (`Confirmed`, `In Progress`, `Scheduled`, `Completed`, `Cancelled`, `Pending`, `Awaiting Confirmation`, `Reschedule`). Two clinical macro shortcuts are provided:
   - "Needs Action" (selects `Pending` and `Awaiting Confirmation`).
   - "Active Schedule" (selects `Confirmed`, `In Progress`, and `Scheduled`).

5. **Read-Only Ledger Boundary with Slide-Over Audit Drawer:**
   In line with the requirement for no direct row mutations, the registry omits mutating buttons (such as status updates, cancellations, or check-ins). To allow clinical staff to inspect complete visit context, rows or action menus trigger a slide-over audit drawer (`Sheet`) displaying booking timestamps, confirmation tokens, clinical notes, and a navigational link to the patient lead (`/leads/{id}`).

6. **Retention of the Dashboard Schedule View:**
   The dashboard's existing table remains untouched. It serves as the immediate daily triage and check-in station, while `/appointments` acts as the analytical and audit registry.

## Goals vs. Non-Goals

* **In-Scope Goals:**
  * Add "Appointments" to `navMain` in `resources/js/components/app-sidebar.tsx` directly under "Leads", rendered with `CalendarIcon`.
  * Define `Route::get('/appointments', [AppointmentController::class, 'registry'])->name('appointments.index');` protected by the `auth` middleware.
  * Implement `AppointmentController::registry` enforcing strict doctor-level scoping and admin-only doctor list props.
  * Build a dedicated Inertia page (`resources/js/pages/appointments/index.tsx`) using the standard clinic `Layout`.
  * Support multi-status selection via a multi-select popover with count badges and reset capability.
  * Support dual-layer date filtering: preset pills (`All`, `Today`, `Tomorrow`, `This Week`, `This Month`) and custom date-range inputs (`From` and `To`).
  * Implement date normalization for accurate range filtering across relative date strings.
  * Implement a read-only slide-over inspection drawer for viewing detailed appointment audit data.
  * Add comprehensive feature tests (`AppointmentsRegistryTest.php`) verifying doctor scoping, admin access, unauthorized redirects, and filter contracts.

* **Out-of-Scope Non-Goals:**
  * Modifying or replacing the existing dashboard table.
  * Adding mutating row actions (cancellations, check-in, status changes) directly inside the registry table.
  * Calendar grid (month/week grid view) visualizations; this feature focuses strictly on tabular data filtering.
  * External calendar syncing (Google Calendar, Apple iCal, Outlook).

## Alternatives Weighed

* **Overriding `AppointmentController::index` with Content Negotiation:**
  * *Option:* Use `$request->wantsJson()` inside the existing `index` method to return either JSON or Inertia.
  * *Reason Rejected by Reviewers:* Brittle and error-prone. Browser page reloads or client-side fetch requests with ambiguous `Accept` headers can trigger unexpected JSON responses. A dedicated method (`registry`) provides explicit separation.
* **Inline Status Mutation Buttons on Each Row:**
  * *Option:* Including quick "Complete" or "Cancel" buttons on table rows.
  * *Reason Rejected by Author:* Violates the explicit requirement for a clean, non-mutating registry and increases the risk of accidental status mutations during historical audits.
* **Replacing Dashboard Table with a Link to `/appointments`:**
  * *Option:* Removing the dashboard appointments card completely.
  * *Reason Rejected by Author:* Front-desk staff need an immediate view of today's queue and pending portal bookings without navigating away from the dashboard.

## Key Decisions & Staging for Next Steps

1. **Routing:** Register `GET /appointments` using `AppointmentController::registry`.
2. **Access Security:** Hardcode `doctor_id` enforcement in the backend for doctor logins; ignore user-supplied `doctor_id` in doctor requests.
3. **Filtering Stack:** Combine text search, multi-status faceted selection, specialist dropdown (admins), preset date pills, and custom date range picker.
4. **Data Normalization:** Implement a shared date normalizer in TypeScript to ensure relative dates (`Today`, `Tomorrow`) match calendar filters correctly.
5. **Detailed Inspection:** Provide a non-mutating slide-over audit drawer for full record inspection.
