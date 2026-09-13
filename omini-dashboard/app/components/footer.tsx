import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Logo />

          <div className="flex gap-6 text-sm text-ink/70">
            <a href="/#features" className="hover:text-ink">
              امکانات
            </a>
            <a href="/#pricing" className="hover:text-ink">
              تعرفه‌ها
            </a>
            <a href="/login" className="hover:text-ink">
              ورود
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink/50 md:text-right">
          © ۱۴۰۵ Omini. تمامی حقوق محفوظ است. 
        </p>
        <p className="mt-6 text-center text-xs text-ink/50 md:text-right">
          By Amin Bolouki
        </p>
      </div>
    </footer>
  );
}