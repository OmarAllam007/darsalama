import logo from '@/site/assets/images/logo.png';

export default function AppLogo() {
    return (
        <div className="flex h-10 w-full items-center overflow-hidden rounded-md bg-white px-2">
            <img
                src={logo}
                alt="Dar As Salama Medical Hospital"
                className="h-16 w-auto object-contain"
            />
        </div>
    );
}
