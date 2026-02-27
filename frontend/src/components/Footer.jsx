import { FaGithub, FaLinkedin, FaYoutube } from './icons'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="bg-[var(--footer-bg)] border-t border-[var(--footer-border)] text-[var(--text-secondary)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm">© {new Date().getFullYear()} Guadalupe Cano — {t('footer.rights')}</div>

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
