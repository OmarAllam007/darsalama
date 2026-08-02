<x-mail::message>
# New contact message

**From:** {{ $contactMessage->name }}  
**Email:** {{ $contactMessage->email }}  
**Phone:** {{ $contactMessage->phone ?: 'Not provided' }}  
**Subject:** {{ $contactMessage->subject }}

{{ $contactMessage->message }}

Reply to this email to contact {{ $contactMessage->name }} directly.
</x-mail::message>
