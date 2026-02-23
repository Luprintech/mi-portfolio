# Ecosistema Digital Personal - Portfolio

Plataforma unificada para la presentación de perfil profesional, documentación técnica técnica y portafolio de desarrollo. Desarrollado con una arquitectura desacoplada Frontend/Backend para permitir una óptima escalabilidad, aplicar seguridad y mantener un entorno de despliegue controlado.

## Stack Tecnológico

**Frontend**: React, Vite, Tailwind CSS, Framer Motion.
**Backend**: Node.js, Express.
**Integraciones y Seguridad**: Nodemailer, Helmet, Express-Rate-Limit, Express-Validator, CORS.

## Arquitectura del Proyecto

El proyecto está diseñado bajo un modelo de cliente-servidor con total separación de responsabilidades:

- `/frontend`: SPA (Single Page Application) que consume una única API local o remota. Componentizado para permitir ampliación horizontal.
- `/backend`: Servicio API RESTful puro con endpoints protegidos encargado del procesamiento de datos y la comunicación externa (SMTP).

## Características Principales

- **Identidad Visual Consistente**: Theme oscuro de alta fidelidad, unificado mediante tokens transversales, con manejo avanzado de interactividad a través de Framer Motion.
- **Micro-interacciones**: Optimización de carga visual para evitar Layout Shifts, usando técnicas como Backdrop Blur, transparencias anidadas y gradientes abstractos (`radiales` y `ruido` estático CSS).
- **Procesamiento de Formularios Seguro**: Comunicación HTTP hacia la API usando estado de red `idle, submitting, success, error`.

## Implementaciones de Seguridad (Backend)

1. **Proxy Trust**: Configuración nativa de Express (`app.set('trust proxy', 1)`) para prevenir falsos positivos de Rate Limiting cuando se sirve desde Nginx u orquestadores como Render/Railway.
2. **Límite de Payload (DoS)**: Restricción del parser JSON natural a 10kb por petición, mitigando intentos de ataque de denegación de servicio a nivel de memoria RAM enviando cadenas corruptas.
3. **Control de Frecuencia (Rate Limiting)**: Bloqueo de peticiones al endpoint por IP, establecido métricamente a un máximo de 5 envíos cada ventana de 10 minutos.
4. **Cabeceras HTTP y CORS**: Integración de Helmet para mitigar ataques como Clickjacking o Cross-Site Scripting. Reglas de CORS restrictivas con lista blanca de orígenes.
5. **Sanitización Transversal**: Filtros con `express-validator` aplicando `trim`, `escape` y verificación estructural estricta antes de pasar la validación al Service Controller.
6. **Honeypotting y Ofuscación**: Prevención perimetral en frontend usando campos ciegos con `tabIndex="-1"` y rotura programática de las URL tipo `mailto:` para eludir scrapers pasivos.

## Ejecución en Desarrollo (Local)

El despliegue local requiere encender dos servidores aislados. Asume tener instalados Node.js v18+ y gestor de paquetes (npm o similar).

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```
*Asegúrate de configurar los parámetros SMTP dentro del nuevo archivo .env antes de iniciar.*

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Configuración de Entorno (.env)

**Para Backend:**
- `FRONTEND_URL`: URL base de origen aceptada bajo el CORS.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`: Validaciones y autenticación del sistema hacia el servidor SMTP de reenvío.
- `CONTACT_EMAIL`, `PORT`: Puerto local y enrutamiento final del email parseado.

**Para Frontend:**
- `VITE_API_URL`: Ubicación raíz del backend. Vital si el backend se externaliza.

## Despliegue en Producción

Como resultado de esta arquitectura técnica dividida, el despliegue requiere dos ambientes:

- **Frontend HTTP Estático (Recomendado: Vercel o Netlify)**: Inyectar variable `VITE_API_URL` apuntando a la IP/Endpoint del Backend durante el proceso de build.
- **Backend Node Persistente (Recomendado: Railway, Render o VPS genérico)**: El entorno debe mantener vivo el proceso `node server.js`. Si se opta por VPS autogestionado, requiere PM2 o Systemd + Proxy Inverso con Nginx acoplado junto con Certbot para HTTPS.

## Decisiones Técnicas

- Se prefirió **Node.js con Express modular** en lugar de Vercel Serverless Functions para el Backend. Las funciones Serverless sufren cuellos de botella temporales conocidos como "Cold Starts". Cuando se envían peticiones a SMTP la latencia inicial y tiempos de respuesta variables suelen provocar colapsos del proceso.
- La **separación total Front/Back** permite no ligar estricatamente a React la arquitectura final, dejando el terreno allanado para eventuales adiciones con Flutter, Next o migraciones de vista nativas en el futuro donde el Node operaría como un verdadero punto de verdad sin modificaciones.

## Optimizaciones Futuras

- Sistema de Testing end-to-end con Cypress o Playwright sobre las views principales.
- Implementar validaciones en TypeScript a lo largo del backend para evitar casteo dinámico o tipos no estáticos, mejorando la robustez de Express-Validator.
- Integración de Logger centralizado (ej. Winston o Pino) en reemplazo del flujo natural para tener perfiles de monitorización persistentes ante caídas.
