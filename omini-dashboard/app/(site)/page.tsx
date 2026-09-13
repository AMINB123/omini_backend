export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <div>
          <h1 className="text-4xl font-bold leading-tight text-ink md:text-5xl">
            پیام‌های فروشگاهت رو از سه پلتفرم، یه‌جا جواب بده
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink/70">
            اینستاگرام، واتساپ و تلگرام فروشگاهت رو به Omini وصل کن. هوش
            مصنوعی پیام‌ها رو دسته‌بندی می‌کنه، به سوال‌های ساده خودش جواب
            می‌ده، و بقیه رو برای تو نگه می‌داره.
          </p>
          <div className="mt-8 flex items-center gap-4">
            
            <a href="/register" className="rounded-full bg-primary px-7 py-3 font-medium text-white hover:bg-primary-dark">
              شروع رایگان
            </a>
            
            <a href="#pricing" className="text-sm font-medium text-ink/70 hover:text-ink">
              مشاهده تعرفه‌ها
            </a>
          </div>
        </div>
        <div className="relative flex h-80 items-center justify-center">
          <div className="absolute right-8 top-4 h-16 w-48 rounded-2xl rounded-tl-sm bg-white p-3 shadow-md">
            <div className="h-2 w-20 rounded bg-ink/10" />
            <div className="mt-2 h-2 w-32 rounded bg-ink/10" />
          </div>
          <div className="absolute left-4 top-20 h-16 w-48 rounded-2xl rounded-tr-sm bg-white p-3 shadow-md">
            <div className="h-2 w-24 rounded bg-ink/10" />
            <div className="mt-2 h-2 w-28 rounded bg-ink/10" />
          </div>
          <div className="absolute bottom-4 right-16 h-16 w-48 rounded-2xl rounded-tl-sm bg-white p-3 shadow-md">
            <div className="h-2 w-16 rounded bg-ink/10" />
            <div className="mt-2 h-2 w-32 rounded bg-ink/10" />
          </div>
          <div className="z-10 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-white shadow-lg">
            <span className="text-sm font-medium">Omini</span>
          </div>
        </div>
      </section>
    </main>
  );
}