import { FaGithub, FaLinkedin, FaYoutube } from './icons'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="bg-[var(--footer-bg)] border-t border-[var(--footer-border)] text-[var(--text-secondary)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2">
          <span>© {new Date().getFullYear()} Guadalupe Cano — {t('footer.rights')}</span>
          <span className="hidden md:inline text-[var(--border-color)]">|</span>
          <Link to="/politica-privacidad" className="hover:text-[var(--accent-primary)] transition-colors underline underline-offset-2">Política de Privacidad</Link>
          <span className="hidden md:inline text-[var(--border-color)]">|</span>
          <Link to="/politica-cookies" className="hover:text-[var(--accent-primary)] transition-colors underline underline-offset-2">Política de Cookies</Link>
        </div>

        <div className="flex items-center gap-4">
          <a href="https://github.com/Luprintech" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-[var(--text-primary)] transition-colors">
            <FaGithub />
          </a>
          <a href="https://www.linkedin.com/in/guadalupe-cano-moyano/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-[var(--text-primary)] transition-colors">
            <FaLinkedin />
          </a>
          <a href="https://www.youtube.com/@Luprintech" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-[var(--text-primary)] transition-colors">
            <FaYoutube />
          </a>
        </div>
      </div>
    </footer>
  )
}
