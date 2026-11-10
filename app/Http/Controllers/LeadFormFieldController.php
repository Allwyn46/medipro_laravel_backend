<?php

namespace App\Http\Controllers;

use App\Models\LeadFormField;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LeadFormFieldController extends Controller
{
    /**
     * Display a listing of active lead form fields.
     */
    public function index(): JsonResponse
    {
        $fields = LeadFormField::active()->get();

        return response()->json([
            'success' => true,
            'fields' => $fields,
        ]);
    }

    /**
     * Store a newly created lead form field definition.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'label' => ['required', 'string', 'max:100'],
            'type' => ['required', 'string', 'in:text,dropdown'],
            'options' => ['required_if:type,dropdown', 'nullable', 'array', 'min:1'],
            'options.*' => ['required', 'string', 'max:100'],
            'is_required' => ['nullable', 'boolean'],
        ]);

        $baseSlug = Str::slug($validated['label'], '_');
        if (empty($baseSlug)) {
            $baseSlug = 'field_'.time();
        }

        $slug = $baseSlug;
        $counter = 1;
        while (LeadFormField::where('name', $slug)->exists()) {
            $slug = $baseSlug.'_'.$counter;
            $counter++;
        }

        $maxSort = LeadFormField::max('sort_order') ?? 0;

        $field = LeadFormField::create([
            'label' => trim($validated['label']),
            'name' => $slug,
            'type' => $validated['type'],
            'options' => $validated['type'] === 'dropdown' ? array_values(array_filter(array_map('trim', $validated['options'] ?? []))) : null,
            'is_required' => (bool) ($validated['is_required'] ?? false),
            'sort_order' => $maxSort + 1,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Custom field created successfully.',
            'field' => $field,
        ], 201);
    }

    /**
     * Deactivate the specified lead form field.
     */
    public function destroy(int $id): JsonResponse
    {
        $field = LeadFormField::findOrFail($id);
        $field->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Custom field deactivated successfully.',
        ]);
    }
}
