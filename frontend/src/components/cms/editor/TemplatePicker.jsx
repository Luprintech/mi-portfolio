const EDITORIAL_TEMPLATES = [
    {
        key: 'tutorial',
        label: 'Tutorial tecnico',
        badge: 'Paso a paso',
        description: 'Guia completa para explicar un flujo, una integracion o una implementacion.',
        content: [
            '<h2>Que vas a construir</h2>',
            '<p>Resume el objetivo del tutorial, el resultado esperado y para quien esta pensado.</p>',
            '<h2>Contexto y punto de partida</h2>',
            '<p>Explica el problema, las decisiones importantes y el estado inicial.</p>',
            '<h2>Prerequisitos</h2>',
            '<ul><li>Herramienta o stack necesario</li><li>Versiones recomendadas</li><li>Accesos o credenciales necesarias</li></ul>',
            '<h2>Paso a paso</h2>',
            '<h3>1. Preparacion</h3>',
            '<p>Describe el primer paso con claridad.</p>',
            '<pre data-block="code" data-language="bash" data-variant="terminal" data-filename="terminal" data-title="Comandos iniciales"><code class="language-bash">npm install\nnpm run dev</code></pre>',
            '<h3>2. Implementacion</h3>',
            '<p>Desarrolla el flujo principal, una decision por seccion.</p>',
            '<h3>3. Validacion</h3>',
            '<p>Explica como comprobar el resultado y que salida esperar.</p>',
            '<h2>Problemas comunes</h2>',
            '<p>Documenta errores habituales, sintomas y solucion.</p>',
            '<h2>Cierre</h2>',
            '<p>Resume el aprendizaje y propone el siguiente paso natural.</p>',
        ].join(''),
    },
    {
        key: 'release-notes',
        label: 'Release notes',
        badge: 'Producto',
        description: 'Plantilla para comunicar cambios, impactos y acciones posteriores a una version.',
        content: [
            '<h2>Resumen del release</h2>',
            '<p>Explica en una idea corta que cambia y por que importa.</p>',
            '<h2>Highlights</h2>',
            '<ul><li>Cambio principal 1</li><li>Cambio principal 2</li><li>Cambio principal 3</li></ul>',
            '<h2>Detalles tecnicos</h2>',
            '<h3>Frontend / UX</h3>',
            '<p>Describe mejoras visibles y consideraciones de uso.</p>',
            '<h3>Backend / integraciones</h3>',
            '<p>Detalla cambios de API, contratos o operaciones.</p>',
            '<h2>Migracion o acciones requeridas</h2>',
            '<p>Indica si alguien tiene que actualizar configuracion, contenido o procesos.</p>',
            '<h2>Riesgos conocidos</h2>',
            '<p>Lista limitaciones, bugs pendientes o mitigaciones temporales.</p>',
            '<h2>Proximos pasos</h2>',
            '<p>Explica que sigue despues de este release.</p>',
        ].join(''),
    },
    {
        key: 'deep-dive',
        label: 'Deep dive',
        badge: 'Arquitectura',
        description: 'Ideal para desarmar decisiones tecnicas, tradeoffs y resultados de un caso real.',
        content: [
            '<h2>Problema</h2>',
            '<p>Define el dolor real que queres resolver.</p>',
            '<h2>Hipotesis y enfoque</h2>',
            '<p>Explica la estrategia elegida y por que gano frente a otras opciones.</p>',
            '<h2>Arquitectura</h2>',
            '<p>Describe los modulos y contratos involucrados.</p>',
            '<h2>Implementacion clave</h2>',
            '<pre data-block="code" data-language="typescript" data-variant="plain" data-filename="feature.ts" data-title="Fragmento central"><code class="language-typescript">export function buildFeature() {\n  return \'documenta aca la pieza central\';\n}</code></pre>',
            '<h2>Tradeoffs</h2>',
            '<p>Enumera costos, limites y decisiones postergadas.</p>',
            '<h2>Metricas o resultados</h2>',
            '<p>Comparte impacto, aprendizajes y que haria distinto la proxima vez.</p>',
        ].join(''),
    },
];

export default function TemplatePicker({ onApplyTemplate, activeTemplateKey = '' }) {
    return (
        <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Templates editoriales</p>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                        Carga una estructura base profesional para no arrancar desde cero. Si ya escribiste contenido, el template reemplaza el cuerpo actual.
                    </p>
                </div>
                {activeTemplateKey ? (
                    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                        Activo: {EDITORIAL_TEMPLATES.find(template => template.key === activeTemplateKey)?.label || activeTemplateKey}
                    </span>
                ) : null}
            </div>

            <div className="mt-4 grid gap-3 xl:grid-cols-3">
                {EDITORIAL_TEMPLATES.map(template => (
                    <article key={template.key} className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-[var(--text-primary)]">{template.label}</p>
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">{template.badge}</p>
                            </div>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{template.description}</p>

                        <button
                            type="button"
                            onClick={() => onApplyTemplate?.(template)}
                            className="mt-4 inline-flex items-center justify-center rounded-full border border-fuchsia-500/30 px-4 py-2 text-xs font-semibold text-fuchsia-300 transition-colors hover:bg-fuchsia-500/10"
                        >
                            Usar template
                        </button>
                    </article>
                ))}
            </div>
        </section>
    );
}
