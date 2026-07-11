<x-mail::message>
# New Callback Request

@if ($callbackRequest->doctor)
**Doctor:** {{ $callbackRequest->doctor->name }}
@endif
**Name:** {{ $callbackRequest->name }}
**Phone:** {{ $callbackRequest->phone }}
@if ($callbackRequest->package_of_interest)
**Package of interest:** {{ $callbackRequest->package_of_interest }}
@endif
@if ($callbackRequest->best_time)
**Best time to call:** {{ $callbackRequest->best_time }}
@endif
**Preferred contact:** {{ $callbackRequest->preferred_contact }}
@if ($callbackRequest->notes)

**Notes:**
{{ $callbackRequest->notes }}
@endif

<x-mail::button :url="config('app.url').'/admin/callback-requests'">
View in admin
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
