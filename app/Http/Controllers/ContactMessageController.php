<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactMessageRequest;
use App\Mail\ContactMessageConfirmation;
use App\Mail\ContactMessageReceived;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;

class ContactMessageController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(StoreContactMessageRequest $request): RedirectResponse
    {
        $contactMessage = ContactMessage::query()->create($request->validated());

        Mail::to(config('mail.contact_address'))->send(new ContactMessageReceived($contactMessage));
        Mail::to($contactMessage->email)->send(new ContactMessageConfirmation($contactMessage));

        return back()->with('contactMessageSubmitted', true);
    }
}
