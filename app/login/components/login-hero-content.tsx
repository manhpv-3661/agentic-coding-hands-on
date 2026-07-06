import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Introduction content block: "ROOT FURTHER" wordmark, subtitle/tagline copy,
 * and a slot for the login button.
 * MoMorph node: `662:14394` (Frame 487) → `662:14395` (Key Visual) +
 * `662:14755` (Frame 550, text + button).
 */
export function LoginHeroContent({ children }: { children: ReactNode }) {
  return (
    <div className="flex max-w-[600px] flex-col items-start gap-10 sm:gap-16 lg:gap-20">
      <Image
        src="/login/Root_Further_Logo.png"
        alt="Root Further"
        width={451}
        height={200}
        priority
        className="h-auto w-[240px] sm:w-[340px] lg:w-[451px]"
      />
      <div className="flex flex-col items-start gap-6 pl-4">
        <p className="font-montserrat max-w-[480px] text-[20px] leading-[40px] font-bold tracking-[0.5px] whitespace-pre-line text-white">
          {"Bắt đầu hành trình của bạn cùng SAA 2025.\nĐăng nhập để khám phá!"}
        </p>
        {children}
      </div>
    </div>
  );
}
