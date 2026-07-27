import { Sparkles } from 'lucide-react';
import Pearls from './Pearls';

export default function PageBanner({ eyebrow, title, intro, image }) {
    return (
        <section className="page-banner">
            <img src={image} alt="" className="page-banner__img" />
            <div className="page-banner__scrim" />
            <Sparkles className="page-banner__mark" aria-hidden="true" />
            <div className="page-banner__inner container">
                <p className="eyebrow page-banner__eyebrow">
                    <Pearls /> {eyebrow}
                </p>
                <h1>{title}</h1>
                <p className="page-banner__intro">{intro}</p>
            </div>
            <div className="page-banner__gold-line" />
        </section>
    );
}
