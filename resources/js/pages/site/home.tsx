import { Head } from '@inertiajs/react';
import CtaStats from '@/site/components/CtaStats';
import Features from '@/site/components/Features';
import Hero from '@/site/components/Hero';
import TrustedBy from '@/site/components/TrustedBy';
import WhyChooseUs from '@/site/components/WhyChooseUs';

export default function Home() {
    return (
        <>
            <Head title="Dar As Salama Medical Hospital" />

            <main className="home-dsm">
                <Hero />
                <Features />
                <WhyChooseUs />
                <CtaStats />
                <TrustedBy />
            </main>
        </>
    );
}
