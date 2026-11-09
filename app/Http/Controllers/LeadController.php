<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    /**
     * Display a listing of all leads.
     */
    public function index(): Response
    {
        return Inertia::render('leads/index', [
            'leads' => self::getLeads(),
        ]);
    }

    /**
     * Display the specified lead.
     */
    public function show(int $id): Response
    {
        $allLeads = self::getLeads();
        $lead = Lead::with('activities')->find($id);

        if (! $lead) {
            abort(404, 'Lead not found');
        }

        return Inertia::render('leads/show', [
            'lead' => $lead,
            'allLeads' => $allLeads,
        ]);
    }

    /**
     * Get all clinical leads with activities from the database.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function getLeads(): array
    {
        return Lead::with('activities')->orderBy('id')->get()->toArray();
    }
}
