import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import FloatActions from '@/site/components/FloatActions';
import Footer from '@/site/components/Footer';
import Header from '@/site/components/Header';
import ScrollToHash from '@/site/components/ScrollToHash';
import { LanguageProvider } from '@/site/i18n/LanguageContext';
import '@/site/site.css';

export default function SiteLayout({ children }: { children: ReactNode }) {
    // Pages framed by the services tour bring their own chrome; the host page
    // already shows the header, so rendering ours again would double it up.
    const embedded = usePage().url.includes('embed=1');

    return (
        <LanguageProvider>
            <ScrollToHash />
            {!embedded && <Header />}
            {children}
            {!embedded && (
                <>
                    <FloatActions />
                    <Footer />
                </>
            )}
        </LanguageProvider>
    );
}
