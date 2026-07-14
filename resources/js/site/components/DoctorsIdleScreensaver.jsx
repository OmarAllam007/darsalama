import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import DoctorProfileCard from './DoctorProfileCard';
import ScaledDoctorCard from './ScaledDoctorCard';

const IDLE_MS = 30000;
const POLL_MS = 2000;
const DECK_MS = 2600;
const DOCTOR_MS = 5000;
const ACTIVITY_EVENTS = [
    'pointerdown',
    'touchstart',
    'wheel',
    'keydown',
    'pointermove',
];

function doctorInitials(name) {
    return name
        .replace(/^Dr\.?\s*/i, '')
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

// Mirrors the reference departments.html screensaver: for each department it
// first fans out a deck of the doctors' photos, then reveals each doctor's
// full card one by one before moving on to the next department.
export default function DoctorsIdleScreensaver({ departments, enabled }) {
    const { t, lang } = useLanguage();
    const [visible, setVisible] = useState(false);
    const [phase, setPhase] = useState('deck');
    const [deckGo, setDeckGo] = useState(false);
    const [deptIndex, setDeptIndex] = useState(0);
    const [docIndex, setDocIndex] = useState(0);
    const lastActivity = useRef(Date.now());
    const scrollPos = useRef({ x: 0, y: 0 });

    const dismiss = () => {
        setVisible(false);
        document.body.style.overflow = '';
        window.scrollTo(scrollPos.current.x, scrollPos.current.y);
    };

    // Track activity + poll for idleness.
    useEffect(() => {
        const onActivity = () => {
            lastActivity.current = Date.now();
            setVisible((v) => {
                if (v) dismiss();
                return v ? false : v;
            });
        };
        ACTIVITY_EVENTS.forEach((evt) =>
            document.addEventListener(evt, onActivity, { passive: true }),
        );

        const poll = setInterval(() => {
            if (!enabled || visible || departments.length === 0) return;
            if (Date.now() - lastActivity.current >= IDLE_MS) {
                scrollPos.current = { x: window.scrollX, y: window.scrollY };
                document.body.style.overflow = 'hidden';
                setDeptIndex(0);
                setDocIndex(0);
                setPhase('deck');
                setVisible(true);
            }
        }, POLL_MS);

        return () => {
            ACTIVITY_EVENTS.forEach((evt) =>
                document.removeEventListener(evt, onActivity),
            );
            clearInterval(poll);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, visible, departments.length]);

    // Trigger the fan-out animation each time a deck is shown.
    useEffect(() => {
        if (!visible || phase !== 'deck') return undefined;

        setDeckGo(false);
        const raf = requestAnimationFrame(() => setDeckGo(true));

        return () => cancelAnimationFrame(raf);
    }, [visible, phase, deptIndex]);

    // Advance the sequence: deck -> each doctor card -> next department.
    useEffect(() => {
        if (!visible) return undefined;

        if (phase === 'deck') {
            const id = setTimeout(() => {
                setDocIndex(0);
                setPhase('card');
            }, DECK_MS);

            return () => clearTimeout(id);
        }

        const id = setTimeout(() => {
            const dept = departments[deptIndex];

            if (dept && docIndex + 1 < dept.doctors.length) {
                setDocIndex(docIndex + 1);
            } else {
                setDeptIndex((d) => (d + 1) % departments.length);
                setDocIndex(0);
                setPhase('deck');
            }
        }, DOCTOR_MS);

        return () => clearTimeout(id);
    }, [visible, phase, deptIndex, docIndex, departments]);

    if (!visible || departments.length === 0) return null;

    const dept = departments[deptIndex % departments.length];
    if (!dept || dept.doctors.length === 0) return null;

    const doctor = dept.doctors[docIndex % dept.doctors.length];

    return (
        <div className="dsm saver-overlay active" onClick={dismiss}>
            <div className="saver-dept">
                <div className="sv-ar">{dept.name_ar}</div>
                <div className="sv-en">{dept.name}</div>
            </div>
            <div
                className="saver-stage go"
                onClick={(e) => e.stopPropagation()}
            >
                {phase === 'deck' ? (
                    <div className={deckGo ? 'sv-deck go' : 'sv-deck'}>
                        {dept.doctors.slice(0, 4).map((d, i) => (
                            <div className={`sv-fan f${i}`} key={d.id}>
                                {d.image ? (
                                    <img
                                        src={`/storage/${d.image}`}
                                        alt={lang === 'ar' ? d.name_ar : d.name}
                                    />
                                ) : (
                                    <span className="sv-mono">
                                        {doctorInitials(d.name)}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <ScaledDoctorCard key={doctor.id} dense>
                        <DoctorProfileCard
                            doctor={doctor}
                            departmentName={dept.name}
                            departmentNameAr={dept.name_ar}
                        />
                    </ScaledDoctorCard>
                )}
            </div>
            <div className="saver-hint">
                {lang === 'ar'
                    ? 'المس الشاشة للمتابعة'
                    : t('doctorsHero.saverHint')}
            </div>
        </div>
    );
}
