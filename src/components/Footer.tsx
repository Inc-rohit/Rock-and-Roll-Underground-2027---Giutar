import Image from "next/image";

type Props = object;

export default function Footer({ }: Props) {
    return (
        <footer className="border-t border-white/10 bg-black text-white">
            <div className="flex flex-col items-center gap-6 px-4 py-14 mx-auto max-w-4xl">
                <Image
                    src="/stage/logo-2027.png"
                    alt="Rock & Roll Underground 2027"
                    width={751}
                    height={412}
                    className="h-auto w-[260px] max-w-full"
                />
                <p className="text-sm tracking-wide text-white/60">
                    © 2027 RRU. All Rights Reserved.
                </p>
            </div>
        </footer>
    );
}
