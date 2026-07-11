<?php

namespace App\Http\Controllers;

use App\Mail\CallbackRequestReceived;
use App\Models\CallbackRequest;
use App\Models\Doctor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class CallbackRequestController extends Controller
{
    /**
     * Store a new callback request for a doctor and notify the admin.
     */
    public function store(Request $request, Doctor $doctor): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:32'],
            'package_of_interest' => ['nullable', 'string', 'max:255'],
            'best_time' => ['nullable', 'string', 'max:255'],
            'preferred_contact' => ['required', 'string', 'in:phone,whatsapp'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $callbackRequest = $doctor->callbackRequests()->create($validated);

        Mail::to(config('mail.admin_address'))->send(new CallbackRequestReceived($callbackRequest));

        return back()->with('callbackRequestSubmitted', true);
    }
}
