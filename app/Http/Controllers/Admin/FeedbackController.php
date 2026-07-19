<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    /**
     * Display a listing of patient feedback, newest first.
     */
    public function index(): Response
    {
        return Inertia::render('admin/feedback/index', [
            'feedback' => Feedback::latest()->paginate(20),
        ]);
    }
}
