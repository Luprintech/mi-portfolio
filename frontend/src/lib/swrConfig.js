/**
 * Configuración global de SWR.
 *
 * fetcher: wrapper sobre publicRequest para que SWR pueda llamarlo con la clave
 * como argumento directo.
 *
 * onErrorRetry: desactiva reintentos en 404 para no saturar el backend con
 * recursos que genuinamente no existen.
 */
import { publicRequest } from './publicApi';

export const fetcher = (url) => publicRequest(url);

export const swrGlobalConfig = {
    fetcher,
    revalidateOnFocus: false,
    dedupingInterval: 60_000,      // 1 min — evita peticiones duplicadas
    errorRetryCount: 2,
    onErrorRetry(error, _key, _config, revalidate, { retryCount }) {
        if (error?.status === 404) return;
        if (retryCount >= 2) return;
        setTimeout(() => revalidate({ retryCount }), 3_000);
    },
};
