<?php

namespace App\Mail;

use App\Models\CallbackRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CallbackRequestReceived extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public CallbackRequest $callbackRequest)
    {
        $this->callbackRequest->loadMissing('doctor');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New callback request from '.$this->callbackRequest->name,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.callback-request',
            with: ['callbackRequest' => $this->callbackRequest],
        );
    }
}
