<x-mail::message>
# Patient Feedback Needs Follow-up

A patient rated their experience as **{{ ucfirst($feedback->rating) }}**.

**Rating:** {{ ucfirst($feedback->rating) }}
@if ($feedback->mobile)
**Mobile:** {{ $feedback->mobile }}
@endif
**Received:** {{ $feedback->created_at->format('d M Y, H:i') }}
@if ($feedback->notes)

**What they told us:**
{{ $feedback->notes }}
@endif

<x-mail::button :url="config('app.url').'/admin/feedback'">
View in admin
</x-mail::button>

Please reach out to the patient as soon as possible.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
