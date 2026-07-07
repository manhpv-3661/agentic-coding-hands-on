/**
 * Footer copyright bar — MoMorph node `662:14447` (mms_D_Footer).
 * Padding is `90px 40px` per the Figma node (`px-[90px] py-10`), matching
 * `site-footer.tsx`'s value for the same shared footer component.
 *
 * @param copyright - dict-sourced copyright line (`shared.footer.copyright`),
 *   shared verbatim with `site-footer.tsx`.
 */
export function LoginFooter({ copyright }: { copyright: string }) {
  return (
    <footer className="relative z-10 flex items-center justify-center border-t border-[#2E3940] px-[90px] py-10">
      <p className="font-montserrat-alternates text-center text-base leading-6 font-bold text-white">
        {copyright}
      </p>
    </footer>
  );
}
