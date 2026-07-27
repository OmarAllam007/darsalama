<?php

namespace App\Http\Controllers;

use App\Mail\CallbackRequestReceived;
use App\Models\CallbackRequest;
use App\Models\Department;
use App\Models\Doctor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Throwable;

class CallbackRequestController extends Controller
{
    /**
     * Store a new callback request for a doctor and notify the admin.
     */
    public function store(Request $request, Doctor $doctor): RedirectResponse
    {
        return $this->notify($doctor->callbackRequests()->create($this->validated($request)));
    }

    /**
     * Store a new callback request scoped to a department and notify the admin.
     */
    public function storeForDepartment(Request $request, Department $department): RedirectResponse
    {
        $callbackRequest = CallbackRequest::create([
            ...$this->validated($request),
            'department_id' => $department->id,
        ]);

        return $this->notify($callbackRequest);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:255'],
            // Saudi mobile as typed behind the +966 prefix, with a leading 0 tolerated.
            'phone' => ['required', 'string', 'regex:/^0?5\d{8}$/'],
            'package_of_interest' => ['nullable', 'string', 'max:255'],
            'best_time' => ['nullable', 'string', 'max:255'],
            'preferred_contact' => ['required', 'string', 'in:phone,whatsapp'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ], [
            'phone.regex' => 'Enter a valid mobile number: 9 digits starting with 5.',
        ]);
    }

    /**
     * Mail the request to the coordinators, reporting back whether it went out.
     */
    private function notify(CallbackRequest $callbackRequest): RedirectResponse
    {
        try {
            Mail::to(config('mail.callback_recipients'))->send(new CallbackRequestReceived($callbackRequest));
        } catch (Throwable $e) {
            report($e);

            return back()->withErrors(['callback' => 'We saved your request but could not notify our team. Please call us to confirm.']);
        }

        return back()->with('callbackRequestSubmitted', true);
    }
}
