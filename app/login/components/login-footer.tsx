/**
 * Footer copyright bar — MoMorph node `662:14447` (mms_D_Footer).
 *
 * @param copyright - dict-sourced copyright line (`shared.footer.copyright`),
 *   shared verbatim with `site-footer.tsx`.
 */
export function LoginFooter({ copyright }: { copyright: string }) {
  return (
    <footer className="relative z-10 flex items-center justify-center border-t border-[#2E3940] px-6 py-10">
      <p className="font-montserrat-alternates text-center text-base leading-6 font-bold text-white">
        {copyright}
      </p>
    </footer>
  );
}
