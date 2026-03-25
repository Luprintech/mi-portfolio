function extractHeadings(content = '') {
    return Array.from(String(content || '').matchAll(/<h2[\s\S]*?>([\s\S]*?)<\/h2>/gi)).map(match => match[1]);
}

function countCodeBlocks(content = '') {
    return Array.from(String(content || '').matchAll(/<pre[\s\S]*?<code[\s\S]*?>[\s\S]*?<\/code><\/pre>/gi)).length;
}

function countCodeBlocksWithMetadata(content = '') {
    return Array.from(String(content || '').matchAll(/<pre[^>]*data-language="[^"]+"[^>]*?(data-filename="[^"]+"|data-title="[^"]+")[^>]*>/gi)).length;
}

function buildChecklist({ form, wordCount }) {
    const content = String(form.content || '');
    const headings = extractHeadings(content);
    const codeBlocks = countCodeBlocks(content);
    const codeBlocksWithMetadata = countCodeBlocksWithMetadata(content);
    const seoTitle = form.seoTitle || form.title || '';
    const seoDescription = form.seoDescription || form.excerpt || '';
    const tags = String(form.tags || '').split(',').map(tag => tag.trim()).filter(Boolean);

    return [
        {
            label: 'Titulo claro y especifico',
            hint: 'Ideal entre 20 y 70 caracteres para portada, SEO y shares.',
            done: form.title.trim().length >= 20 && form.title.trim().length <= 70,
        },
        {
            label: 'Resumen editorial listo',
            hint: 'El excerpt deberia contar la promesa del post en una o dos frases.',
            done: form.excerpt.trim().length >= 90 && form.excerpt.trim().length <= 220,
        },
        {
            label: 'Taxonomia y portada definidas',
            hint: 'Al menos 2 tags y una portada explicita ayudan a descubrir y distribuir el contenido.',
            done: tags.length >= 2 && Boolean(form.ogImage.trim()),
        },
        {
            label: 'Estructura escaneable',
            hint: 'Conviene incluir secciones H2 para guiar la lectura tecnica.',
            done: headings.length >= 2,
        },
        {
            label: 'Cuerpo con suficiente desarrollo',
            hint: 'Para una publicacion tecnica profesional conviene no quedarse corto.',
            done: wordCount >= 180,
        },
        {
            label: 'Bloques de codigo documentados',
            hint: codeBlocks > 0 ? `Hay ${codeBlocks} bloque(s) de codigo y ${codeBlocksWithMetadata} con metadata visible.` : 'Si agregas codigo, suma lenguaje y archivo o titulo para dar contexto.',
            done: codeBlocks === 0 || codeBlocksWithMetadata === codeBlocks,
        },
        {
            label: 'SEO base resuelto',
            hint: 'Meta title y description deben poder heredarse sin romper longitudes recomendadas.',
            done: seoTitle.length >= 20 && seoTitle.length <= 60 && seoDescription.length >= 70 && seoDescription.length <= 160,
        },
    ];
}

export default function EditorialChecklist({ form, wordCount }) {
    const items = buildChecklist({ form, wordCount });
    const completed = items.filter(item => item.done).length;
    const ready = completed === items.length;

    return (
        <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Checklist editorial</p>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                        Antes de publicar, revisa estructura, contexto y metadata. La idea no es bloquearte: es darte una guia concreta para salir con un post mas profesional.
                    </p>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${ready ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
                    {completed}/{items.length} checks listos
                </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {items.map(item => (
                    <article key={item.label} className={`rounded-2xl border px-4 py-3 ${item.done ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-[var(--border-default)] bg-[var(--bg-elevated)]'}`}>
                        <div className="flex items-start gap-3">
                            <span className={`mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${item.done ? 'bg-emerald-500/15 text-emerald-300' : 'bg-[var(--bg-primary)] text-[var(--text-muted)]'}`}>
                                {item.done ? 'OK' : '...'}
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-[var(--text-primary)]">{item.label}</p>
                                <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{item.hint}</p>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
