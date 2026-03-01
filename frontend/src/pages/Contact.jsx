import { useState } from "react";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaYoutube, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

export default function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "", email: "", subject: "", message: "", _website: "",
  });
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ocurrió un error misterioso procesando tu correo.");
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "", _website: "" });
    } catch (error) {
      setStatus("error");
      setErrorMessage(error.message);
    }
  };

  const handleProtectedEmail = (e) => {
    e.preventDefault();
    window.location.href = `mailto:contacto@guadalupecano.es`;
  };

  /* Clases compartidas para inputs/selects/textarea */
  const inputClass = "w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-secondary)] focus:ring-1 focus:ring-[var(--accent-secondary)] transition-all duration-300";

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pt-32 pb-20 px-4 md:px-8 relative overflow-hidden selection:bg-cyan-500/30">
      <Helmet>
        <title>Contacto | Guadalupe Cano — Desarrolladora Full Stack</title>
        <meta name="description" content="Contacta con Guadalupe Cano para proyectos de desarrollo web, integración de IA o automatización. Disponible para trabajo remoto e híbrido en Andalucía." />
        <link rel="canonical" href="https://guadalupecano.es/contacto" />
      </Helmet>
      <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay pointer-events-none z-0" />
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[var(--bg-secondary)] to-transparent opacity-80 z-0 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto relative z-10"
      >
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-cyan-400">
            {t('contact.title')}
          </h1>
          <p className="text-xl text-[var(--text-secondary)] font-medium mb-4">{t('contact.subtitle')}</p>
          <p className="max-w-2xl mx-auto text-[var(--text-muted)] leading-relaxed">{t('contact.intro')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Columna izquierda */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Formas directas */}
            <div className="bg-[var(--bg-surface)] backdrop-blur-md p-6 md:p-8 rounded-2xl border border-[var(--border-color)] hover:border-[var(--accent-primary)]/40 transition-all duration-300 shadow-[var(--card-shadow)]">
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
                <span className="w-1 h-8 bg-gradient-to-b from-fuchsia-500 to-cyan-400 rounded-full" />
                {t('contact.direct_ways')}
              </h3>

              <div className="space-y-6">
                <div className="group">
                  <label className="text-sm text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-1 block">{t('contact.email_label')}</label>
                  <button onClick={handleProtectedEmail} className="flex items-center gap-3 text-lg text-[var(--accent-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer outline-none">
                    <div className="p-2 bg-[var(--bg-elevated)] rounded-lg group-hover:bg-[var(--accent-secondary-dim)] transition-colors border border-[var(--border-subtle)]">
                      <FaEnvelope />
                    </div>
                    <span>{"con" + "tacto@" + "guada" + "lupe" + "cano" + ".es"}</span>
                  </button>
                </div>

                <div>
                  <label className="text-sm text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-1 block">{t('contact.location_label')}</label>
                  <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                    <div className="p-2 bg-[var(--bg-elevated)] rounded-lg text-fuchsia-400 border border-[var(--border-subtle)]">
                      <FaMapMarkerAlt />
                    </div>
                    <span>{t('contact.location')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Perfiles sociales */}
            <div className="bg-[var(--bg-surface)] backdrop-blur-md p-6 md:p-8 rounded-2xl border border-[var(--border-color)] hover:border-[var(--accent-secondary)]/30 transition-all duration-300 shadow-[var(--card-shadow)]">
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">{t('contact.profiles_title')}</h3>
              <div className="flex gap-4">
                <a href="https://www.linkedin.com/in/guadalupe-cano-moyano/" target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex flex-col items-center justify-center p-4 bg-[var(--bg-elevated)] rounded-xl hover:bg-[#0077b5] hover:text-white transition-all duration-300 group border border-[var(--border-color)] hover:border-transparent">
                  <FaLinkedin className="text-3xl mb-2 text-[var(--text-muted)] group-hover:text-white transition-colors" />
                  <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-white">LinkedIn</span>
                </a>
                <a href="https://github.com/Luprintech" target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex flex-col items-center justify-center p-4 bg-[var(--bg-elevated)] rounded-xl hover:bg-[#333] hover:text-white transition-all duration-300 group border border-[var(--border-color)] hover:border-transparent">
                  <FaGithub className="text-3xl mb-2 text-[var(--text-muted)] group-hover:text-white transition-colors" />
                  <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-white">GitHub</span>
                </a>
                <a href="https://www.youtube.com/@Luprintech" target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex flex-col items-center justify-center p-4 bg-[var(--bg-elevated)] rounded-xl hover:bg-[#FF0000] hover:text-white transition-all duration-300 group border border-[var(--border-color)] hover:border-transparent">
                  <FaYoutube className="text-3xl mb-2 text-[var(--text-muted)] group-hover:text-white transition-colors" />
                  <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-white">YouTube</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Formulario */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="lg:col-span-3"
          >
            <div className="bg-[var(--bg-surface)] backdrop-blur-md p-6 md:p-10 rounded-2xl border border-[var(--border-color)] shadow-[var(--shadow-md)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500" />

              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-8">{t('contact.form_title')}</h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <input type="text" name="_website" style={{ display: "none" }} tabIndex="-1" autoComplete="off"
                  value={formData._website || ""} onChange={handleChange} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-[var(--text-muted)]">{t('contact.form_name')}</label>
                    <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange}
                      className={inputClass} placeholder={t('contact.form_name_placeholder')} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-[var(--text-muted)]">{t('contact.form_email')}</label>
                    <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange}
                      className={inputClass} placeholder={t('contact.form_email_placeholder')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-[var(--text-muted)]">{t('contact.form_subject')}</label>
                  <select id="subject" name="subject" required value={formData.subject} onChange={handleChange}
                    className={`${inputClass} appearance-none`}>
                    <option value="" disabled className="bg-[#1e293b] text-gray-400">{t('contact.form_subject_default')}</option>
                    <option value="job_opportunity" className="bg-[#1e293b] text-white">{t('contact.form_subject_job')}</option>
                    <option value="collaboration"   className="bg-[#1e293b] text-white">{t('contact.form_subject_collab')}</option>
                    <option value="networking"      className="bg-[#1e293b] text-white">{t('contact.form_subject_net')}</option>
                    <option value="other"           className="bg-[#1e293b] text-white">{t('contact.form_subject_other')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-[var(--text-muted)]">{t('contact.form_msg')}</label>
                  <textarea id="message" name="message" required rows="5" value={formData.message} onChange={handleChange}
                    className={`${inputClass} resize-none`} placeholder={t('contact.form_msg_placeholder')} />
                </div>

                <button
                  type="submit"
                  disabled={status === "submitting" || status === "success"}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                    status === "success"
                      ? "bg-green-500/20 text-green-400 border border-green-500/50 cursor-default"
                      : "bg-gradient-to-r from-fuchsia-600 to-cyan-500 hover:from-fuchsia-500 hover:to-cyan-400 text-white shadow-lg shadow-fuchsia-500/20 hover:shadow-cyan-400/30 hover:-translate-y-1"
                  }`}
                >
                  {status === "submitting" ? (
                    <span className="animate-pulse">{t('contact.btn_sending')}</span>
                  ) : status === "success" ? (
                    <span>{t('contact.btn_success')}</span>
                  ) : (
                    <>{t('contact.btn_send')} <FaPaperPlane className="text-sm" /></>
                  )}
                </button>

                {status === "error" && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="text-center text-red-400 text-sm mt-4 bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                    {t('contact.error')} {errorMessage || "No se pudo conectar con el backend."}
                  </motion.p>
                )}
                {status === "success" && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="text-center text-green-400 text-sm mt-4 bg-green-500/10 py-2 rounded-lg border border-green-500/20">
                    {t('contact.success')}
                  </motion.p>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
