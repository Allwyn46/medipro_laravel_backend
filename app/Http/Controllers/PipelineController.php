<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class PipelineController extends Controller
{
    /**
     * Display the clinical pipeline board and table.
     */
    public function index(): Response
    {
        return Inertia::render('pipeline', [
            'leads' => LeadController::getLeads(),
        ]);
    }
}
