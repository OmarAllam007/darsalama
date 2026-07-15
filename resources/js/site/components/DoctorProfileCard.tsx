import { Check, Maximize2, Phone } from 'lucide-react';
import { EMERGENCY_PHONE } from '@/site/i18n/constants';

type NamePair = { name: string; name_ar: string };

type Doctor = {
    name: string;
    name_ar: string;
    job: string;
    job_ar: string;
    image: string | null;
    nationality: { name: string; name_ar: string; flag: string | null } | null;
    qualifications?: NamePair[];
    services?: NamePair[];
};

export default function DoctorProfileCard({
    doctor,
    departmentName,
    departmentNameAr,
    onExpand,
    expandLabel,
}: {
    doctor: Doctor;
    departmentName: string;
    departmentNameAr: string;
    onExpand?: () => void;
    expandLabel?: string;
}) {
    const initials = doctor.name
        .replace(/^Dr\.?\s*/i, '')
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const qualifications = doctor.qualifications ?? [];
    const services = doctor.services ?? [];

    return (
        <div className="card">
            <div className="head">
                {onExpand && (
                    <button
                        type="button"
                        className="dp-expand"
                        onClick={onExpand}
                    >
                        <Maximize2 size={15} />
                        {expandLabel}
                    </button>
                )}
                <div className="h-ar">مستشفى دار السلامة الطبية</div>
                <div className="h-en">Dar As Salama Medical Hospital</div>
                <div className="rule" />
            </div>

            <div className="body">
                <div className="portrait">
                    {doctor.image ? (
                        <img
                            src={`/storage/${doctor.image}`}
                            alt={doctor.name}
                        />
                    ) : (
                        <div className="mono">{initials}</div>
                    )}
                    <div className="corner" />
                    <div className="ribbon">
                        <div className="r-dept">{departmentName}</div>
                    </div>
                </div>

                <div className="info">
                    {doctor.nationality && (
                        <div className="origin">
                            {doctor.nationality.flag && (
                                <span className="flag">
                                    <img
                                        src={doctor.nationality.flag}
                                        alt={doctor.nationality.name}
                                        loading="lazy"
                                    />
                                </span>
                            )}
                            <span className="flag-name">
                                {doctor.nationality.name}
                            </span>
                        </div>
                    )}

                    <div className="name-ar">{doctor.name_ar}</div>
                    <div className="name-en">{doctor.name}</div>

                    <div className="spec">
                        <span className="s-ar">{doctor.job_ar}</span>
                        <span className="s-en">{doctor.job}</span>
                    </div>

                    <div className="dept-pill">
                        <span className="d-ar">{departmentNameAr}</span>
                        <span className="dot" />
                        <span className="d-en">{departmentName}</span>
                    </div>

                    {qualifications.length > 0 && (
                        <>
                            <div className="lbl">
                                Qualifications
                                <span className="lbl-ar">المؤهلات</span>
                            </div>
                            <ul className="quals">
                                {qualifications.map((item, i) => (
                                    <li key={i}>
                                        <span className="q-mark">
                                            <Check size={13} />
                                        </span>
                                        <span>
                                            <span className="q-en">
                                                {item.name}
                                            </span>
                                            <span className="q-ar">
                                                {item.name_ar}
                                            </span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    {services.length > 0 && (
                        <>
                            <div className="lbl">
                                Services
                                <span className="lbl-ar">الخدمات</span>
                            </div>
                            <div className="services">
                                {services.map((item, i) => (
                                    <div
                                        className={[
                                            'svc',
                                            services.length % 2 === 1 &&
                                            i === services.length - 1
                                                ? 'solo'
                                                : null,
                                        ]
                                            .filter(Boolean)
                                            .join(' ')}
                                        key={i}
                                    >
                                        <span className="s-wrap">
                                            <span className="s-ar">
                                                {item.name_ar}
                                            </span>
                                            <span className="s-en">
                                                {item.name}
                                            </span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="foot">
                <div className="f-web">www.dasmh.sa</div>
                <div className="f-inq">
                    <div className="f-txt">
                        <div className="f-cap">
                            للاستفسارات والمواعيد
                            <span className="en">For Inquiries</span>
                        </div>
                        <div className="f-num">{EMERGENCY_PHONE}</div>
                    </div>
                    <span className="pic">
                        <Phone size={20} />
                    </span>
                </div>
            </div>
        </div>
    );
}
