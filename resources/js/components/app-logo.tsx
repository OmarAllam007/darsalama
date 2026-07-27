import logo from '@/site/assets/images/logo.png';

export default function AppLogo() {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-[0_8px_24px_-10px_rgba(0,0,0,0.75)] ring-1 ring-white/20">
                <img
                    src={logo}
                    alt="Dar As Salama Medical Hospital"
                    className="w-9 object-contain"
                />
            </div>
            <div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-semibold tracking-wide text-white">
                    Dar Al Salama
                </span>
                <span className="mt-0.5 truncate text-[10px] font-medium tracking-[0.16em] text-[#d2b66e] uppercase">
                    Care operations
                </span>
            </div>
        </div>
    );
}
