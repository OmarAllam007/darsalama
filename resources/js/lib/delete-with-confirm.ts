import { router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export async function deleteWithConfirm(
    url: string,
    label: string,
    warning?: string,
): Promise<void> {
    const result = await Swal.fire({
        title: `Delete "${label}"?`,
        text: warning,
        icon: 'warning',
        theme: 'auto',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        confirmButtonColor: 'var(--destructive)',
        cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) {
        return;
    }

    router.delete(url, {
        preserveScroll: true,
        onSuccess: () => toast.success(`"${label}" deleted.`),
        onError: () => toast.error(`Failed to delete "${label}".`),
    });
}
