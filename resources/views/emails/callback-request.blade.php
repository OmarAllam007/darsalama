<x-mail::message>
# New Callback Request

A patient has asked the care team to get in touch.

<x-mail::panel>
**Follow-up requested**

Contact **{{ $callbackRequest->name }}** by **{{ $callbackRequest->preferred_contact === 'whatsapp' ? 'WhatsApp' : 'phone' }}** at **{{ $callbackRequest->phone }}**.
</x-mail::panel>

## Patient Details

**Name:** {{ $callbackRequest->name }}

**Phone:** {{ $callbackRequest->phone }}

**Preferred contact:** {{ $callbackRequest->preferred_contact === 'whatsapp' ? 'WhatsApp' : 'Phone' }}

@if ($callbackRequest->doctor || $callbackRequest->package_of_interest || $callbackRequest->best_time)
## Care Preferences

@if ($callbackRequest->doctor)
**Requested doctor:** {{ $callbackRequest->doctor->name }}
@endif

@if ($callbackRequest->package_of_interest)
**Package of interest:** {{ $callbackRequest->package_of_interest }}
@endif

@if ($callbackRequest->best_time)
**Best time to call:** {{ $callbackRequest->best_time }}
@endif
@endif

@if ($callbackRequest->notes)
## Patient Notes

<x-mail::panel>
{{ $callbackRequest->notes }}
</x-mail::panel>
@endif

<x-mail::button :url="route('admin.callback-requests.index')">
Review Callback Request
</x-mail::button>

Submitted {{ $callbackRequest->created_at->format('d M Y \a\t H:i') }}.

Regards,<br>
{{ config('app.name') }}
</x-mail::message>
