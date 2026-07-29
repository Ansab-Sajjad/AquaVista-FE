import { cn } from "@/lib/utils";

export default function Logo({ classNameFull, classNameMobile }: { classNameFull?: string; classNameMobile?: string }) {
  return (
    <>
      <img
        src="/images/email/logo.png"
        alt="Logo"
        className={cn("h-[27px] w-auto", classNameFull)}
      />

      <img
        src="/images/email/logo.png"
        alt="Logo"
        className={cn("h-[27px] w-auto", classNameMobile)}
      />
    </>
  );
}
