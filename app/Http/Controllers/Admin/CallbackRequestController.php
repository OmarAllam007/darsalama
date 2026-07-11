<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CallbackRequest;
use Inertia\Inertia;
use Inertia\Response;

class CallbackRequestController extends Controller
{
    /**
     * Display a listing of callback requests, newest first.
     */
    public function index(): Response
    {
        return Inertia::render('admin/callback-requests/index', [
            'callbackRequests' => CallbackRequest::with('doctor:id,name')
                ->latest()
                ->paginate(20),
        ]);
    }
}
