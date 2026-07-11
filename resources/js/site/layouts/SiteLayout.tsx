import type {ReactNode} from 'react';
import Footer from '@/site/components/Footer'
import Header from '@/site/components/Header'
import ScrollToHash from '@/site/components/ScrollToHash'
import { LanguageProvider } from '@/site/i18n/LanguageContext'
import '@/site/site.css'

export default function SiteLayout({ children }: { children: ReactNode }) {
    return (
        <LanguageProvider>
            <ScrollToHash />
            <Header />
            {children}
            <Footer />
        </LanguageProvider>
    )
}
