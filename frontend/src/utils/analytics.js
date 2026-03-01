export const loadGoogleAnalytics = (measurementId) => {
    if (!measurementId) {
        console.warn('GA4 Measurement ID is required to load Google Analytics.');
        return;
    }

    // Verificar si ya está cargado
    if (document.getElementById('ga-script')) return;

    // 1. Crear el script asíncrono de inicialización
    const script = document.createElement('script');
    script.id = 'ga-script';
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    // 2. Crear y ejecutar el script de configuración inicial
    const inlineScript = document.createElement('script');
    inlineScript.id = 'ga-inline-script';
    inlineScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', {
      'anonymize_ip': true, // Recomendable para RGPD
      'cookie_flags': 'SameSite=None;Secure'
    });
  `;
    document.head.appendChild(inlineScript);
};

export const disableGoogleAnalytics = (measurementId) => {
    // Configura una cookie para deshabilitar GA4 si el usuario revoca su consentimiento
    const disableStr = `ga-disable-${measurementId}`;
    document.cookie = `${disableStr}=true; expires=Thu, 31 Dec 2099 23:59:59 UTC; path=/`;
    window[disableStr] = true;
};
