import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { FlashToast } from '@/types/ui';

export function useFlashToast(): void {
    useEffect(() => {
        return router.on('success', (event) => {
            const flash = event.detail.page.props.flash as { toast?: FlashToast } | undefined;
            const data = flash?.toast;

            if (!data) {
                return;
            }

            toast[data.type](data.message);
        });
    }, []);
}