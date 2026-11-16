# Lead Intake Custom Field Kanban Management

* **Author:** allwyn46
* **Date:** 2026-11-16

## Overview

The Lead Form Settings page (`/settings/leads`) will provide an admin-restricted, two-column Kanban board (**Active** vs **Inactive**) dedicated solely to managing staff-created custom intake fields. All ten standard built-in lead fields (*Patient Full Name, Phone Number, Email Address, Clinical Service, Assigned Doctor, Pipeline Status, Priority Level, Total Estimated Value, Referral Source, and Clinical Notes*) are excluded from the board and remain permanent. 

Dragging a custom field card between the Active and Inactive columns triggers an immediate auto-save API call. This instantly updates field availability within the "Add New Patient Lead" modal while preserving historical intake data and labels on all existing patient records.

## Analysis

### 1. Architectural & Data Integrity Findings
* **Historical Label Resolution Bug**: In the current implementation of `LeadController::show()`, custom field metadata is loaded via `LeadFormField::active()->get()`. When an admin moves a field to "Inactive", historical leads containing values for that field lose their label mapping and fallback to raw snake_case database keys in the UI. To maintain historical readability, `LeadController::show()` must fetch all field definitions (`LeadFormField::all()`) regardless of active status.
* **Storage Separation**: Built-in lead fields map directly to dedicated SQL columns on the `leads` table, whereas custom intake fields are stored as JSON key-value pairs within `leads.custom_fields`. Restricting the Kanban board exclusively to custom fields prevents structural schema mismatches and protects core clinical reporting metrics.
* **Validation Behavior for Inactive Required Fields**: In `LeadController::store()`, backend validation rules are constructed dynamically from active fields. If a custom field is flagged as `is_required` but placed in the Inactive column, it will not block new lead submissions. Cards in the Inactive column will display a "Required when active" indicator so administrators understand the conditional requirement.

### 2. Interaction & UX Ergonomics
* **Immediate Auto-Save with Rollback**: When a card is dropped into a new column, the frontend applies an optimistic state update and dispatches an asynchronous `PATCH` request. If the network request fails, the UI reverts the card to its origin column and displays an error alert. A toast notification with an "Undo" trigger allows quick reversal of accidental moves without leaving the page.
* **Accessibility & Pointer Fallback (WCAG 2.5.7)**: Relying solely on drag-and-drop gestures introduces friction on mobile devices and assistive hardware. Each field card includes a secondary one-click action button (e.g., "Move to Inactive" / "Move to Active") to allow status toggling without dragging.
* **Component Reuse**: The application already includes `@dnd-kit/core` and `@dnd-kit/sortable` in `package.json`. The board will utilize these existing libraries rather than introducing third-party packages.

## Goals vs. Non-Goals

### In-Scope Goals
* **Two-Column Kanban Interface**: Provide side-by-side Active and Inactive droppable drop zones on `/settings/leads`.
* **Drag-and-Drop Interaction**: Support dragging cards between Active and Inactive columns using `@dnd-kit`.
* **One-Click Fallback Controls**: Provide direct toggle buttons on cards for keyboard and touch ergonomics.
* **Immediate Auto-Save Persistence**: Implement a backend route (`PATCH /api/settings/lead-fields/{id}/status`) to update `is_active` asynchronously.
* **Intake Form Integration**: Ensure `AddLeadDialog` dynamically filters and renders only fields marked `is_active = true`.
* **Historical Data Integrity**: Update `LeadController::show()` to pass all field definitions so deactivated fields remain readable on past records.
* **Admin Authorization Enforcement**: Restrict settings modification endpoints to authenticated administrative accounts.

### Out-of-Scope Non-Goals
* **Built-in Field Management**: Permitting toggling, reordering, or deactivating standard clinic intake fields (Name, Phone, Email, Service, Doctor, Status, Priority, Value, Source, Notes).
* **Intra-Column Custom Sorting**: Reordering active fields within the column to change intake form layout sequence (ordering remains stable based on creation ID/timestamp).
* **Destructive Data Purging**: Deleting past responses or altering existing `leads.custom_fields` records when a field is deactivated.
* **Non-Admin Configuration**: Granting doctor or standard staff roles permission to toggle intake field availability.

## Alternatives Weighed

* **Tabular Toggle Switches**: Rejected by author. A standard list with toggle switches was considered, but the author specifically mandated a spatial two-column Kanban table for visual segregation.
* **Including Standard Built-in Fields on Board**: Rejected by author. Managing core fields on the board was evaluated, but the author confirmed all standard clinical fields must be completely excluded from the board.
* **Explicit Save Changes Button (Staged Mutation)**: Rejected by author. Staging changes locally until a manual "Save" button is clicked was considered, but auto-save on card drop was selected for operational efficiency.
* **Custom Intake Form Drag-to-Order**: Rejected by author. Enabling vertical drag sorting to dictate exact input order was evaluated, but the author confirmed no ordering requirement is needed.

## Key Decisions & Staging for Next Steps

* **Dependency Reuse**: Utilize existing `@dnd-kit` packages without adding new dependencies.
* **Dedicated Status Endpoint**: Create `PATCH /api/settings/lead-fields/{id}/status` accepting `{"is_active": boolean}`.
* **Historical Label Fix**: Update `LeadController::show()` to use `LeadFormField::all()` to prevent slug fallback bugs on past leads.
* **Next Step**: Proceed to formal design specification with `/egm-draft` or refine the brief based on human feedback.
