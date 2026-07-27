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
            // Saudi mobile as typed behind the +966 prefix, with a leading 0 tolerated.
            'mobile' => ['nullable', 'required_if:rating,terrible,bad', 'string', 'regex:/^0?5\d{8}$/'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ], [
            'mobile.regex' => 'Enter a valid mobile number: 9 digits starting with 5.',
        ]);

        $feedback = Feedback::create($validated);

        if ($feedback->isNegative()) {
            Mail::to(config('mail.feedback_address'))->send(new NegativeFeedbackReceived($feedback));
        }

        return back()->with('feedbackSubmitted', true);
    }
}
