import { useTranslation } from "react-i18next";
import CountryFlag from "react-country-flag";

/**
 * Selector de idioma con banderas SVG.
 * ES → España (ES), EN → Reino Unido (GB)
 */
export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  const languages = [
    { code: "es", countryCode: "ES", label: "ES", ariaLabel: "Cambiar a Español" },
    { code: "en", countryCode: "GB", label: "EN", ariaLabel: "Switch to English" },
  ];

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      {languages.map(({ code, countryCode, label, ariaLabel }, idx) => {
        const isActive = i18n.resolvedLanguage === code;
        return (
          <span key={code} className="flex items-center">
            <button
              onClick={() => handleLanguageChange(code)}
              className={`
                flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200
                ${isActive
                  ? "text-[var(--accent-secondary)] cursor-default bg-[var(--accent-secondary-dim)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
                }
              `}
              aria-label={ariaLabel}
              aria-current={isActive ? "true" : undefined}
              disabled={isActive}
            >
              <CountryFlag
                countryCode={countryCode}
                svg
                aria-label={ariaLabel}
                style={{ width: "1.1em", height: "1.1em", borderRadius: "2px" }}
              />
              <span>{label}</span>
            </button>
            {/* Separador entre botones */}
            {idx < languages.length - 1 && (
              <span className="text-[var(--border-color)] select-none px-0.5" aria-hidden="true">
                /
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
