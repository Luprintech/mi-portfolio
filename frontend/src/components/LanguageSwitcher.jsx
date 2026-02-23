import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <button
        onClick={() => handleLanguageChange("es")}
        className={`transition-colors duration-200 ${
          i18n.resolvedLanguage === "es"
            ? "text-cyan-400 cursor-default"
            : "text-gray-500 hover:text-gray-300"
        }`}
        aria-label="Cambiar a Español"
        aria-current={i18n.resolvedLanguage === "es"}
      >
        ES
      </button>
      <span className="text-gray-700 select-none">/</span>
      <button
        onClick={() => handleLanguageChange("en")}
        className={`transition-colors duration-200 ${
          i18n.resolvedLanguage === "en"
            ? "text-cyan-400 cursor-default"
            : "text-gray-500 hover:text-gray-300"
        }`}
        aria-label="Switch to English"
        aria-current={i18n.resolvedLanguage === "en"}
      >
        EN
      </button>
    </div>
  );
}
