import type { ComponentProps, FormEvent } from 'react';

/**
 * Shared attributes for the mobile inputs that sit behind a +966 prefix:
 * digits only, exactly 9 of them, starting with 5. Keep in sync with the
 * `phone` rule in CallbackRequestController.
 */
export const saudiPhoneInputProps: ComponentProps<'input'> = {
    type: 'tel',
    inputMode: 'numeric',
    autoComplete: 'tel-national',
    pattern: '5[0-9]{8}',
    maxLength: 9,
    minLength: 9,
    required: true,
    placeholder: '5XXXXXXXX',
    onInput: (event: FormEvent<HTMLInputElement>) => {
        event.currentTarget.value = event.currentTarget.value.replace(
            /\D/g,
            '',
        );
    },
};
