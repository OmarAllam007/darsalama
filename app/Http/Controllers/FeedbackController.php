<?php

namespace App\Http\Controllers;

use App\Mail\NegativeFeedbackReceived;
use App\Models\Feedback;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class FeedbackController extends Controller
{
    /**
     * Store patient feedback and alert the team when the rating is negative.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'rating' => ['required', Rule::in(['terrible', 'bad', 'okay', 'good', 'excellent'])],
            'mobile' => ['nullable', 'required_if:rating,terrible,bad', 'string', 'max:32'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $feedback = Feedback::create($validated);

        if ($feedback->isNegative()) {
            Mail::to(config('mail.feedback_address'))->send(new NegativeFeedbackReceived($feedback));
        }

        return back()->with('feedbackSubmitted', true);
    }
}
