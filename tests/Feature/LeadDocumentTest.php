<?php

use App\Models\Lead;
use App\Models\LeadDocument;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('local');
});

test('unauthenticated users cannot access lead document endpoints', function () {
    $lead = Lead::factory()->create();

    $this->postJson(route('leads.documents.store', ['id' => $lead->id]), [])->assertUnauthorized();
    $this->get(route('leads.documents.stream', ['id' => $lead->id, 'documentId' => 1]))->assertUnauthorized();
    $this->get(route('leads.documents.download', ['id' => $lead->id, 'documentId' => 1]))->assertUnauthorized();
    $this->postJson(route('leads.documents.void', ['id' => $lead->id, 'documentId' => 1]), [])->assertUnauthorized();
});

test('authenticated staff can upload a prescription document with category', function () {
    $user = User::factory()->admin()->create();
    $lead = Lead::factory()->create();

    $fakeFile = UploadedFile::fake()->create('chest_xray.pdf', 1024, 'application/pdf');

    $response = $this->actingAs($user)->postJson(route('leads.documents.store', ['id' => $lead->id]), [
        'category' => 'X-Ray',
        'file' => $fakeFile,
    ]);

    $response->assertCreated();
    $response->assertJson([
        'success' => true,
        'document' => [
            'lead_id' => $lead->id,
            'category' => 'X-Ray',
            'original_name' => 'chest_xray.pdf',
            'mime_type' => 'application/pdf',
            'status' => 'active',
        ],
    ]);

    $this->assertDatabaseHas('lead_documents', [
        'lead_id' => $lead->id,
        'category' => 'X-Ray',
        'original_name' => 'chest_xray.pdf',
        'status' => 'active',
    ]);

    $this->assertDatabaseHas('lead_activities', [
        'lead_id' => $lead->id,
        'type' => 'Prescription',
        'title' => 'Prescription Uploaded: X-Ray',
    ]);

    $doc = LeadDocument::where('lead_id', $lead->id)->first();
    Storage::disk('local')->assertExists($doc->file_path);
});

test('upload validates mandatory category and allowed mime types', function () {
    $user = User::factory()->admin()->create();
    $lead = Lead::factory()->create();

    // Missing category and file
    $response = $this->actingAs($user)->postJson(route('leads.documents.store', ['id' => $lead->id]), []);
    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['category', 'file']);

    // Disallowed file extension (.txt or .exe)
    $badFile = UploadedFile::fake()->create('malicious.exe', 500, 'application/x-msdownload');
    $response2 = $this->actingAs($user)->postJson(route('leads.documents.store', ['id' => $lead->id]), [
        'category' => 'Blood Test',
        'file' => $badFile,
    ]);
    $response2->assertUnprocessable();
    $response2->assertJsonValidationErrors(['file']);
});

test('authenticated staff can stream and download an uploaded document', function () {
    $user = User::factory()->admin()->create();
    $lead = Lead::factory()->create();

    $fakeFile = UploadedFile::fake()->create('blood_report.png', 1024, 'image/png');

    $this->actingAs($user)->postJson(route('leads.documents.store', ['id' => $lead->id]), [
        'category' => 'Blood Test',
        'file' => $fakeFile,
    ]);

    $doc = LeadDocument::where('lead_id', $lead->id)->first();

    // Stream route
    $streamRes = $this->actingAs($user)->get(route('leads.documents.stream', ['id' => $lead->id, 'documentId' => $doc->id]));
    $streamRes->assertOk();
    $streamRes->assertHeader('Content-Type', 'image/png');
    $streamRes->assertHeader('Cache-Control', 'no-store, private');

    // Download route
    $downloadRes = $this->actingAs($user)->get(route('leads.documents.download', ['id' => $lead->id, 'documentId' => $doc->id]));
    $downloadRes->assertOk();
    expect($downloadRes->headers->get('content-disposition'))->toContain('attachment; filename=blood_report.png');
});

test('clinical supervisor can void a document to correct an accidental upload', function () {
    $user = User::factory()->admin()->create();
    $lead = Lead::factory()->create();

    $fakeFile = UploadedFile::fake()->create('wrong_patient_scan.pdf', 500, 'application/pdf');
    $this->actingAs($user)->postJson(route('leads.documents.store', ['id' => $lead->id]), [
        'category' => 'MRI / CT Scan',
        'file' => $fakeFile,
    ]);

    $doc = LeadDocument::where('lead_id', $lead->id)->first();

    $voidRes = $this->actingAs($user)->postJson(route('leads.documents.void', ['id' => $lead->id, 'documentId' => $doc->id]), [
        'reason' => 'Misfiled diagnostic report.',
    ]);

    $voidRes->assertOk();
    $voidRes->assertJson([
        'success' => true,
        'document' => [
            'status' => 'voided',
            'voided_reason' => 'Misfiled diagnostic report.',
        ],
    ]);

    expect($doc->fresh()->status)->toBe('voided')
        ->and($doc->fresh()->voided_by)->toBe($user->id);

    $this->assertDatabaseHas('lead_activities', [
        'lead_id' => $lead->id,
        'type' => 'Prescription',
        'title' => 'Prescription Voided: MRI / CT Scan',
    ]);
});
