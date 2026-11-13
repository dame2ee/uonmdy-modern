import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-navy-deep">
      <div className="uon-container flex flex-col items-center justify-between gap-4 py-8 text-center sm:flex-row sm:text-left">
        <Image
          src="/images/misc/logo.png"
          alt="University of Nursing, Mandalay."
          width={330}
          height={66}
          className="h-9 w-auto"
        />
        <p className="text-[12.5px] text-white/60">
          Copyright © 2025 University Of Nursing Mandalay. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
