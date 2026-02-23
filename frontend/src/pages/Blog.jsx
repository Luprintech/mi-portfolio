import { useTranslation } from "react-i18next";

export default function Blog() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-32 pb-20 px-4 md:px-8 relative overflow-hidden selection:bg-violet-500/30">
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0b1220] to-transparent pointer-events-none z-0" />
      <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay pointer-events-none z-0" />
      <section className="max-w-4xl mx-auto py-20 px-4 relative z-10">
        <div className="bg-[#111827]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-10 shadow-lg text-center">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">{t('blog.title')}</h1>
          <p className="mt-4 text-gray-400">{t('blog.desc')}</p>
        </div>
      </section>
    </div>
  )
}
