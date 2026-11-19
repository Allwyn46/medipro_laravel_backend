# Patient Lead Prescription & Diagnostic Documents Vault

* **Author:** allwyn46
* **Date:** 2026-11-18

## Overview

The patient lead details page (`/leads/{id}`) will introduce an authenticated medical document management vault designed for diagnostic reports and prescriptions. The feature introduces two synchronized UI sections:
1. **Prescription & Diagnostic Upload Card:** Positioned on the left column directly above *Patient Clinical Notes*, featuring category classification (*X-Ray, Blood Test, MRI/CT Scan, Lab Report, Medication Prescription*) and file ingestion for PDF and image formats.
2. **Prescriptions & Diagnostics Tab:** Positioned beside the *Activity & Consultation History* table in the right column, displaying uploaded documents in a responsive 3-column grid equipped with secure downloads and a clinical print preview window stamped with patient metadata (*Patient Name, Age, Blood Group, Doctor, Date*).

All uploaded files are written to Laravel's private storage disk (`storage/app/private`) behind authorization-guarded streaming routes and automatically log an immutable audit milestone into the patient's activity history.

## Analysis

### 1. Security & Private Disk Streaming Architecture
* **Storage Isolation:** Diagnostic reports and prescriptions must reside exclusively within the local private disk (`storage/app/private/leads/{lead_id}/documents`) and never in public storage. No public symlinks will be created for medical assets.
* **Access Control & Policy Enforcement:** Direct URLs to files are blocked. Document delivery routes (`GET /api/leads/{lead}/documents/{document}/stream` and `GET /api/leads/{lead}/documents/{document}/download`) are guarded by `LeadPolicy::view`, ensuring only assigned doctors or clinic administrators can view or download patient records.
* **Protected HTTP Response Headers:** Responses emit strict caching headers (`Cache-Control: private, no-store, must-revalidate` and `X-Content-Type-Options: nosniff`) to prevent downstream proxy caching and MIME-type sniffing of Protected Health Information.

### 2. Immutability vs. Clinical Misattribution
* **The Immutability Paradox:** While clinical uploads must be immutable to preserve legal chain of custody, accidental file misattribution (e.g., uploading Patient B's lab results to Patient A's file) creates a severe privacy and medical risk if it cannot be corrected.
* **Append-Only Soft-Voiding Pattern:** Rather than allowing physical deletions or file updates, documents are write-once. If a file is uploaded in error, an authorized clinical supervisor can execute a "Void" action. This action flags the document as voided, records the supervisor ID, timestamp, and justification, and registers a neutralizing audit entry in `lead_activities` without purging the raw storage binary.

### 3. Print Execution & Patient Metadata Stamping
* **Non-Destructive Presentation Stamping:** Altering radiological images or PDF binaries to permanently stamp text watermarks risks degrading image quality or obscuring diagnostic markers.
* **CSS Print Composite:** Stamping is implemented via a clean clinic letterhead banner prepended during print execution (`@media print`). The preview modal renders `Patient Name`, `Age`, `Blood Group`, `Assigned Doctor`, and `Timestamp` above the embedded document view, leaving the original stored binary unaltered.

### 4. Layout Ergonomics & Left Column Space
* **Vertical Real Estate Preservation:** Adding an upload box above *Patient Clinical Notes* risks pushing clinical notes below the viewport fold. The upload card uses a compact dropzone layout with category pills and file drop that expands only when an active file is selected.

## Goals vs. Non-Goals

### In-Scope Goals
* **Database Migration & Model:** Create `lead_documents` table capturing `lead_id`, `category`, `original_name`, `file_path`, `file_size`, `mime_type`, `uploaded_by`, and `status`.
* **Private Storage Ingestion:** Store files securely in `storage/app/private/leads/{lead_id}/documents` with validation for PDF, JPEG, PNG, and WebP (up to 25MB).
* **Authenticated Streaming & Download API:** Implement controller routes enforcing doctor/admin authorization for document streaming and download.
* **Audit Trail Integration:** Automatically record an activity log entry in `lead_activities` upon file upload.
* **Upload Card (Left Column):** Embed category selector and file dropzone directly above *Patient Clinical Notes*.
* **Tabbed Right Panel:** Split the existing right column into tabs: "Activity History" and "Prescriptions & Diagnostics".
* **3-Column Document Grid:** Display uploaded items in a responsive 3-per-row card grid with category badges, timestamps, and action buttons.
* **Clinical Print Preview Modal:** Render document preview with a patient demographic header (*Name, Age, Blood Group, Doctor, Date*) and browser print integration.
* **Automated Pest Feature Tests:** Test upload validation, authorization enforcement, streaming headers, and activity logging.

### Out-of-Scope Non-Goals
* **DICOM Medical PACS Viewer:** Files are ingested and viewed as standard PDFs or raster images, not raw DICOM binaries.
* **OCR Text Extraction:** Automated parsing of lab test values into database fields is excluded.
* **Public Patient Portal Links:** Uploads are accessible strictly within the internal authenticated clinic portal.
* **Regulatory Digital Signature Workflows:** Cryptographic PKI digital signing of prescriptions is deferred.

## Alternatives Weighed

* **Public Storage (`storage/app/public`) with Symlink:** Rejected by author. Public URLs expose sensitive patient health data without authentication checks.
* **Binary Image Stamping via GD/ImageMagick:** Rejected by author. Modifying image pixels directly can distort clinical diagnostics. Switched to CSS `@media print` composite letterhead stamping.
* **Dedicated Separate Page for Prescriptions (`/leads/{id}/prescriptions`):** Rejected by author. Clinic staff need to view notes, consultation history, and prescriptions simultaneously in a unified patient profile.

## Key Decisions & Staging for Next Steps

* **Storage Path:** `storage/app/private/leads/{lead_id}/documents/`.
* **Category Presets:** X-Ray, Blood Test, MRI/CT Scan, Lab Report, Medication Prescription.
* **Immutability Policy:** Write-once ingestion with append-only voiding for clinical safety.
* **Next Step:** User review and transition to `/egm-draft` or direct implementation staging.
