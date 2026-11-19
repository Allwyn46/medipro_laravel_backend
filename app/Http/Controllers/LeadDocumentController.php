<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\LeadActivity;
use App\Models\LeadDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LeadDocumentController extends Controller
{
    /**
     * Upload and store a new clinical prescription or diagnostic document.
     */
    public function store(Request $request, int $id): JsonResponse
    {
        $lead = Lead::findOrFail($id);

        if ($request->user()?->cannot('view', $lead)) {
            abort(403, 'Unauthorized. You do not have permission to manage documents for this patient lead.');
        }

        $validated = $request->validate([
            'category' => ['required', 'string', 'max:100'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:25600'], // 25MB max
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension() ?: 'bin';
        $mimeType = $file->getMimeType() ?: 'application/octet-stream';
        $fileSize = $file->getSize();

        $fileName = Str::uuid()->toString().'.'.$extension;
        $filePath = $file->storeAs("leads/{$lead->id}/documents", $fileName, 'local');

        $document = LeadDocument::create([
            'lead_id' => $lead->id,
            'category' => trim($validated['category']),
            'title' => pathinfo($originalName, PATHINFO_FILENAME),
            'original_name' => $originalName,
            'file_name' => $fileName,
            'file_path' => $filePath,
            'file_size' => $fileSize,
            'mime_type' => $mimeType,
            'uploaded_by' => $request->user()?->id,
            'status' => 'active',
        ]);

        $activity = LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => 'Prescription',
            'title' => "Prescription Uploaded: {$document->category}",
            'description' => "Uploaded {$originalName} ({$document->formatted_size}) into clinical records.",
            'doctor' => $request->user()?->name ?? $lead->doctor,
            'date' => now()->format('Y-m-d H:i'),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Document '{$document->category}' uploaded successfully.",
            'document' => $document->load('uploader'),
            'activity' => $activity,
        ], 201);
    }

    /**
     * Stream a prescription or diagnostic file for inline preview or printing.
     */
    public function stream(Request $request, int $id, int $documentId): BinaryFileResponse
    {
        $lead = Lead::findOrFail($id);

        if ($request->user()?->cannot('view', $lead)) {
            abort(403, 'Unauthorized. Access to patient clinical documents denied.');
        }

        $document = $lead->documents()->findOrFail($documentId);

        if (! Storage::disk('local')->exists($document->file_path)) {
            abort(404, 'Clinical document file not found on storage server.');
        }

        $fullPath = Storage::disk('local')->path($document->file_path);

        $response = response()->file($fullPath, [
            'Content-Type' => $document->mime_type,
            'Content-Disposition' => 'inline; filename="'.addslashes($document->original_name).'"',
            'X-Content-Type-Options' => 'nosniff',
        ]);
        $response->setPrivate();
        $response->headers->addCacheControlDirective('no-store', true);

        return $response;
    }

    /**
     * Download an original prescription or diagnostic document attachment.
     */
    public function download(Request $request, int $id, int $documentId): StreamedResponse
    {
        $lead = Lead::findOrFail($id);

        if ($request->user()?->cannot('view', $lead)) {
            abort(403, 'Unauthorized. Access to patient clinical documents denied.');
        }

        $document = $lead->documents()->findOrFail($documentId);

        if (! Storage::disk('local')->exists($document->file_path)) {
            abort(404, 'Clinical document file not found on storage server.');
        }

        return Storage::disk('local')->download($document->file_path, $document->original_name, [
            'Cache-Control' => 'private, no-cache, no-store, must-revalidate',
        ]);
    }

    /**
     * Mark an uploaded document as voided to correct clinical misattributions without deleting raw data.
     */
    public function void(Request $request, int $id, int $documentId): JsonResponse
    {
        $lead = Lead::findOrFail($id);

        if ($request->user()?->cannot('view', $lead)) {
            abort(403, 'Unauthorized.');
        }

        $document = $lead->documents()->findOrFail($documentId);

        $document->update([
            'status' => 'voided',
            'voided_reason' => $request->input('reason', 'Voided by clinician.'),
            'voided_by' => $request->user()?->id,
            'voided_at' => now(),
        ]);

        $activity = LeadActivity::create([
            'lead_id' => $lead->id,
            'type' => 'Prescription',
            'title' => "Prescription Voided: {$document->category}",
            'description' => "Document {$document->original_name} marked as voided by {$request->user()?->name}.",
            'doctor' => $request->user()?->name ?? $lead->doctor,
            'date' => now()->format('Y-m-d H:i'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document voided successfully.',
            'document' => $document->fresh(['uploader', 'voider']),
            'activity' => $activity,
        ]);
    }
}
