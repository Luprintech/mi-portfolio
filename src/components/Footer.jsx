import { FaTwitter, FaGithub, FaLinkedin } from './icons'

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm">© {new Date().getFullYear()} Luprintech — Todos los derechos</div>

        <div className="flex items-center gap-4">
          <a href="#" aria-label="Twitter" className="hover:text-white">
            <FaTwitter />
          </a>
          <a href="#" aria-label="GitHub" className="hover:text-white">
            <FaGithub />
          </a>
          <a href="#" aria-label="LinkedIn" className="hover:text-white">
            <FaLinkedin />
          </a>
        </div>
      </div>
    </footer>
  )
}
