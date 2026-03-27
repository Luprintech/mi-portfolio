import { query, withTransaction } from './database.js';
import { deriveHtmlMetadata } from '../utils/htmlMetadata.js';

const READING_SPEED_WPM = 190;

function inferFormat(row) {
    if (row.format === 'html' || row.format === 'markdown') return row.format;
    if (row.content_html) return 'html';
    if (row.content_markdown_legacy) return 'markdown';
    return /<\/?[a-z][\s\S]*>/i.test(String(row.content || '')) ? 'html' : 'markdown';
}

function resolveContentFields(row) {
    const format = inferFormat(row);
    const contentHtml = row.content_html || (format === 'html' ? row.content || '' : '');
    const legacyMarkdown = row.content_markdown_legacy || (format === 'markdown' ? row.content || '' : '');
    const content = format === 'html' ? contentHtml : legacyMarkdown;

    return { format, contentHtml, legacyMarkdown, content };
}

function toDateString(value) {
    if (!value) return '';
    if (typeof value === 'string') return value.slice(0, 10);
    return new Date(value).toISOString().slice(0, 10);
}

function getStringArray(value) {
    if (Array.isArray(value)) {
        return value.filter(item => typeof item === 'string' && item.trim()).map(item => item.trim());
    }

    return [];
}

function extractPresentation(content, fallbackImage = '', format = 'markdown') {
    const coverMatch = typeof content === 'string'
        ? format === 'html'
            ? content.match(/<img[^>]+src=["']([^"']+)["']/i)
            : content.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/)
        : null;

    const normalizedText = typeof content === 'string'
        ? (format === 'html'
            ? content
                .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')
                .replace(/<code[\s\S]*?<\/code>/gi, ' ')
                .replace(/<img[^>]*>/gi, ' ')
                .replace(/<[^>]+>/g, ' ')
            : content
                .replace(/```[\s\S]*?```/g, ' ')
                .replace(/`[^`]*`/g, ' ')
                .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                .replace(/[#>*_~-]+/g, ' '))
            .replace(/\s+/g, ' ')
            .trim()
        : '';

    const wordCount = normalizedText ? normalizedText.split(' ').filter(Boolean).length : 0;

    return {
        coverImage: fallbackImage || coverMatch?.[1] || '',
        readingTime: Math.max(4, Math.ceil(wordCount / READING_SPEED_WPM)),
    };
}

function extractMarkdownTocTitles(content = '') {
    return String(content)
        .split('\n')
        .map(line => line.trim())
        .filter(line => /^###{0,1}\s+/.test(line))
        .map(line => line.replace(/^#{2,4}\s+/, '').trim())
        .filter(Boolean)
        .slice(0, 12);
}

function derivePostMetadata({ format, contentHtml, legacyMarkdown, fallbackImage = '', existingTocTitles = [] }) {
    if (format === 'html') {
        return deriveHtmlMetadata(contentHtml, { fallbackImage });
    }

    const legacyPresentation = extractPresentation(legacyMarkdown, fallbackImage, 'markdown');
    const tocTitles = extractMarkdownTocTitles(legacyMarkdown);

    return {
        ...legacyPresentation,
        tocTitles: tocTitles.length ? tocTitles : existingTocTitles,
        attachmentsMeta: [],
        documentSummary: [],
    };
}

function getRevisionNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function getAttachmentsMeta(value) {
    if (!Array.isArray(value)) return [];

    return value
        .map(item => {
            if (!item || typeof item !== 'object') return null;

            return {
                src: typeof item.src === 'string' ? item.src : '',
                title: typeof item.title === 'string' ? item.title : '',
                fileType: typeof item.fileType === 'string' ? item.fileType : '',
                display: typeof item.display === 'string' ? item.display : '',
            };
        })
        .filter(item => item?.src);
}

function createRevisionConflictError(currentRevision) {
    const error = new Error('La revision del post esta desactualizada. Recarga antes de guardar.');
    error.code = 'REVISION_CONFLICT';
    error.status = 409;
    error.currentRevision = currentRevision;
    return error;
}

function buildPersistedPost(currentRow, patch = {}) {
    const currentContent = currentRow ? resolveContentFields(currentRow) : { format: 'html', contentHtml: '', legacyMarkdown: '', content: '' };
    const format = patch.format ?? currentContent.format ?? 'html';
    const contentHtml = patch.contentHtml ?? (format === 'html' ? currentContent.contentHtml : '');
    const legacyMarkdown = patch.legacyMarkdown ?? (format === 'markdown' ? currentContent.legacyMarkdown : '');
    const content = format === 'html' ? contentHtml : legacyMarkdown;
    const existingTocTitles = currentRow ? getStringArray(currentRow.toc_titles) : [];
    const metadata = derivePostMetadata({
        format,
        contentHtml,
        legacyMarkdown,
        fallbackImage: patch.ogImage ?? currentRow?.og_image ?? '',
        existingTocTitles,
    });

    return {
        slug: patch.slug ?? currentRow?.slug,
        title: patch.title ?? currentRow?.title ?? '',
        content,
        format,
        contentHtml: format === 'html' ? contentHtml : '',
        legacyMarkdown: format === 'markdown' ? legacyMarkdown : '',
        excerpt: patch.excerpt ?? currentRow?.excerpt ?? '',
        tags: patch.tags ?? getStringArray(currentRow?.tags),
        date: patch.date ?? toDateString(currentRow?.publication_date),
        seoTitle: patch.seoTitle ?? currentRow?.seo_title ?? '',
        seoDescription: patch.seoDescription ?? currentRow?.seo_description ?? '',
        ogImage: patch.ogImage ?? currentRow?.og_image ?? '',
        canonicalUrl: patch.canonicalUrl ?? currentRow?.canonical_url ?? '',
        noindex: patch.noindex ?? Boolean(currentRow?.noindex),
        featured: patch.featured ?? Boolean(currentRow?.featured),
        showToc: patch.showToc ?? (currentRow ? (currentRow.show_toc ?? true) : true),
        status: patch.status ?? currentRow?.status ?? 'draft',
        coverImage: metadata.coverImage,
        readingTime: metadata.readingTime,
        tocTitles: metadata.tocTitles,
        attachmentsMeta: metadata.attachmentsMeta,
    };
}

async function createRevisionSnapshot(client, row, source) {
    const contentFields = resolveContentFields(row);
    const metadata = {
        title: row.title,
        excerpt: row.excerpt || '',
        tags: getStringArray(row.tags),
        seoTitle: row.seo_title || '',
        seoDescription: row.seo_description || '',
        ogImage: row.og_image || '',
        canonicalUrl: row.canonical_url || '',
        noindex: Boolean(row.noindex),
        featured: Boolean(row.featured),
        status: row.status,
        tocTitles: getStringArray(row.toc_titles),
        coverImage: row.cover_image || '',
        readingTime: Number(row.reading_time) || 4,
        attachmentsMeta: getAttachmentsMeta(row.attachments_meta),
        publicationDate: toDateString(row.publication_date),
    };

    await client.query(
        `INSERT INTO post_revisions (
            post_id,
            revision,
            snapshot_format,
            snapshot_content_html,
            snapshot_content_markdown_legacy,
            snapshot_meta,
            source
        ) VALUES (
            $1, $2, $3, $4, $5, $6::jsonb, $7
        )`,
        [
            row.id,
            getRevisionNumber(row.revision, 1),
            contentFields.format,
            contentFields.contentHtml,
            contentFields.legacyMarkdown,
            JSON.stringify(metadata),
            source,
        ]
    );
}

function mapPostRow(row, { includeContent = false, includePresentation = false } = {}) {
    const contentFields = resolveContentFields(row);
    const derivedPresentation = extractPresentation(contentFields.content, row.og_image || '', contentFields.format);
    const mapped = {
        slug: row.slug,
        title: row.title,
        date: toDateString(row.publication_date),
        excerpt: row.excerpt || '',
        tags: getStringArray(row.tags),
        tocTitles: getStringArray(row.toc_titles),
        seoTitle: row.seo_title || '',
        seoDescription: row.seo_description || '',
        ogImage: row.og_image || '',
        canonicalUrl: row.canonical_url || '',
        noindex: Boolean(row.noindex),
        featured: Boolean(row.featured),
        showToc: row.show_toc ?? true,
        status: row.status,
        format: contentFields.format,
        revision: getRevisionNumber(row.revision, contentFields.content ? 1 : 0),
        updatedAt: row.updated_at || null,
        lastAutosavedAt: row.last_autosaved_at || null,
    };

    if (includeContent) {
        mapped.content = contentFields.content;
        mapped.contentHtml = contentFields.contentHtml;
        mapped.legacyMarkdown = contentFields.legacyMarkdown;
    }

    if (includePresentation) {
        mapped.coverImage = row.cover_image || derivedPresentation.coverImage;
        mapped.readingTime = Number(row.reading_time) || derivedPresentation.readingTime;
        mapped.attachmentsMeta = getAttachmentsMeta(row.attachments_meta);
    }

    return mapped;
}

function mapProjectRow(row) {
    return {
        id: row.id,
        title: row.title,
        description: row.description || '',
        tech: getStringArray(row.tech),
        github: row.github || '',
        demo: row.demo || '',
        image: row.image || '',
        featured: Boolean(row.featured),
        category: row.category,
    };
}

async function getPostRowBySlug(slug, { includeDrafts = true } = {}) {
    const params = [slug];
    const whereDraft = includeDrafts ? '' : 'AND status = $2';
    if (!includeDrafts) params.push('published');

    const result = await query(
        `SELECT *
         FROM posts
         WHERE slug = $1 ${whereDraft}
         LIMIT 1`,
        params
    );

    return result.rows[0] || null;
}

async function getProjectRowById(id) {
    const result = await query(
        `SELECT *
         FROM projects
         WHERE id = $1
         LIMIT 1`,
        [id]
    );

    return result.rows[0] || null;
}

export async function listPostsForCms() {
    const result = await query(
        `SELECT *
         FROM posts
         ORDER BY publication_date DESC, created_at DESC`
    );

    return result.rows.map(row => mapPostRow(row));
}

export async function getPostForCms(slug) {
    const row = await getPostRowBySlug(slug, { includeDrafts: true });
    return row ? mapPostRow(row, { includeContent: true }) : null;
}

export async function createPost(data) {
    return withTransaction(async (client) => {
        const persisted = buildPersistedPost(null, data);

        if (data.featured && data.status === 'published') {
            await client.query(
                "UPDATE posts SET featured = FALSE WHERE featured = TRUE AND status = 'published'"
            );
        }

        const result = await client.query(
            `INSERT INTO posts (
                slug,
                title,
                content,
                format,
                content_html,
                content_markdown_legacy,
                excerpt,
                tags,
                publication_date,
                seo_title,
                seo_description,
                og_image,
                canonical_url,
                noindex,
                featured,
                show_toc,
                cover_image,
                reading_time,
                toc_titles,
                attachments_meta,
                revision,
                status
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19::jsonb, $20::jsonb, $21, $22
            )
            RETURNING *`,
            [
                persisted.slug,
                persisted.title,
                persisted.content,
                persisted.format,
                persisted.contentHtml,
                persisted.legacyMarkdown,
                persisted.excerpt,
                JSON.stringify(persisted.tags || []),
                persisted.date,
                persisted.seoTitle,
                persisted.seoDescription,
                persisted.ogImage,
                persisted.canonicalUrl,
                Boolean(persisted.noindex),
                Boolean(persisted.featured),
                Boolean(persisted.showToc),
                persisted.coverImage,
                persisted.readingTime,
                JSON.stringify(persisted.tocTitles || []),
                JSON.stringify(persisted.attachmentsMeta || []),
                1,
                persisted.status,
            ]
        );

        await createRevisionSnapshot(client, result.rows[0], persisted.status === 'published' ? 'publish' : 'manual-save');

        return mapPostRow(result.rows[0], { includeContent: true, includePresentation: true });
    });
}

async function persistPostUpdate(slug, patch, { source = 'manual-save', touchAutosave = false } = {}) {
    const currentRow = await getPostRowBySlug(slug, { includeDrafts: true });
    if (!currentRow) return null;

    if (patch.revision !== undefined && getRevisionNumber(patch.revision, -1) !== getRevisionNumber(currentRow.revision, 0)) {
        throw createRevisionConflictError(getRevisionNumber(currentRow.revision, 0));
    }

    const merged = buildPersistedPost(currentRow, patch);
    const nextRevision = getRevisionNumber(currentRow.revision, 0) + 1;

    return withTransaction(async (client) => {
        if (merged.featured && merged.status === 'published') {
            await client.query(
                "UPDATE posts SET featured = FALSE WHERE featured = TRUE AND status = 'published' AND slug <> $1",
                [slug]
            );
        }

        const result = await client.query(
            `UPDATE posts
             SET title = $2,
                  content = $3,
                  format = $4,
                  content_html = $5,
                  content_markdown_legacy = $6,
                  excerpt = $7,
                  tags = $8::jsonb,
                  publication_date = $9,
                  seo_title = $10,
                  seo_description = $11,
                  og_image = $12,
                  canonical_url = $13,
                  noindex = $14,
                  featured = $15,
                  show_toc = $16,
                  cover_image = $17,
                  reading_time = $18,
                  toc_titles = $19::jsonb,
                  attachments_meta = $20::jsonb,
                  revision = $21,
                  status = $22,
                  last_autosaved_at = CASE WHEN $23 THEN NOW() ELSE last_autosaved_at END,
                  updated_at = NOW()
               WHERE slug = $1
               RETURNING *`,
            [
                slug,
                merged.title,
                merged.content,
                merged.format,
                merged.contentHtml,
                merged.legacyMarkdown,
                merged.excerpt,
                JSON.stringify(merged.tags || []),
                merged.date,
                merged.seoTitle,
                merged.seoDescription,
                merged.ogImage,
                merged.canonicalUrl,
                Boolean(merged.noindex),
                Boolean(merged.featured),
                Boolean(merged.showToc),
                merged.coverImage,
                merged.readingTime,
                JSON.stringify(merged.tocTitles || []),
                JSON.stringify(merged.attachmentsMeta || []),
                nextRevision,
                merged.status,
                touchAutosave,
            ]
        );

        await createRevisionSnapshot(client, result.rows[0], source);

        return mapPostRow(result.rows[0], { includeContent: true, includePresentation: true });
    });
}

export async function updatePost(slug, patch, options = {}) {
    return persistPostUpdate(slug, patch, {
        source: options.source || (patch.status === 'published' ? 'publish' : 'manual-save'),
        touchAutosave: false,
    });
}

export async function autosavePost(slug, patch) {
    return persistPostUpdate(slug, patch, { source: 'autosave', touchAutosave: true });
}

export async function listPostRevisions(slug) {
    const row = await getPostRowBySlug(slug, { includeDrafts: true });
    if (!row) return null;

    const result = await query(
        `SELECT id, revision, source, created_at
         FROM post_revisions
         WHERE post_id = $1
         ORDER BY revision DESC, created_at DESC
         LIMIT 20`,
        [row.id]
    );

    return result.rows.map(item => ({
        id: item.id,
        revision: getRevisionNumber(item.revision, 0),
        source: item.source,
        createdAt: item.created_at,
    }));
}

export async function restorePostRevision(slug, revisionId, expectedRevision) {
    const currentRow = await getPostRowBySlug(slug, { includeDrafts: true });
    if (!currentRow) return null;

    if (expectedRevision !== undefined && getRevisionNumber(expectedRevision, -1) !== getRevisionNumber(currentRow.revision, 0)) {
        throw createRevisionConflictError(getRevisionNumber(currentRow.revision, 0));
    }

    const revisionResult = await query(
        `SELECT *
         FROM post_revisions
         WHERE id = $1 AND post_id = $2
         LIMIT 1`,
        [revisionId, currentRow.id]
    );

    const snapshot = revisionResult.rows[0];
    if (!snapshot) return undefined;

    const snapshotMeta = snapshot.snapshot_meta || {};

    return persistPostUpdate(
        slug,
        {
            title: snapshotMeta.title,
            excerpt: snapshotMeta.excerpt,
            tags: snapshotMeta.tags,
            date: snapshotMeta.publicationDate,
            seoTitle: snapshotMeta.seoTitle,
            seoDescription: snapshotMeta.seoDescription,
            ogImage: snapshotMeta.ogImage,
            canonicalUrl: snapshotMeta.canonicalUrl,
            noindex: snapshotMeta.noindex,
            featured: snapshotMeta.featured,
            status: snapshotMeta.status,
            format: snapshot.snapshot_format,
            contentHtml: snapshot.snapshot_content_html,
            legacyMarkdown: snapshot.snapshot_content_markdown_legacy,
            revision: getRevisionNumber(currentRow.revision, 0),
        },
        { source: 'restore', touchAutosave: false }
    );
}

export async function deletePost(slug) {
    const result = await query(
        `DELETE FROM posts
         WHERE slug = $1
         RETURNING slug`,
        [slug]
    );

    return result.rowCount > 0;
}

export async function listPostsForPublic() {
    const result = await query(
        `SELECT *
         FROM posts
         WHERE status = 'published'
         ORDER BY featured DESC, publication_date DESC, created_at DESC`
    );

    return result.rows.map(row => mapPostRow(row, { includePresentation: true }));
}

export async function getPostForPublic(slug) {
    const row = await getPostRowBySlug(slug, { includeDrafts: false });
    return row ? mapPostRow(row, { includeContent: true, includePresentation: true }) : null;
}

export async function listPostsForSitemap() {
    const result = await query(
        `SELECT slug, publication_date
         FROM posts
         WHERE status = 'published' AND noindex = FALSE
         ORDER BY publication_date DESC, created_at DESC`
    );

    return result.rows.map(row => ({
        slug: row.slug,
        date: toDateString(row.publication_date),
    }));
}

export async function listProjectsForCms() {
    const result = await query(
        `SELECT *
         FROM projects
         ORDER BY sort_order ASC, created_at ASC`
    );

    return result.rows.map(mapProjectRow);
}

export async function listProjectsForPublic() {
    return listProjectsForCms();
}

export async function createProject(data) {
    const orderResult = await query(
        'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM projects'
    );

    const sortOrder = Number(orderResult.rows[0].next_order) || 0;
    const result = await query(
        `INSERT INTO projects (
            id,
            title,
            description,
            tech,
            github,
            demo,
            image,
            featured,
            category,
            sort_order
        ) VALUES (
            $1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10
        )
        RETURNING *`,
        [
            data.id,
            data.title,
            data.description || '',
            JSON.stringify(data.tech || []),
            data.github || '',
            data.demo || '',
            data.image || '',
            Boolean(data.featured),
            data.category,
            sortOrder,
        ]
    );

    return mapProjectRow(result.rows[0]);
}

export async function updateProject(id, patch) {
    const currentRow = await getProjectRowById(id);
    if (!currentRow) return null;

    const merged = {
        title: patch.title ?? currentRow.title,
        description: patch.description ?? currentRow.description,
        tech: patch.tech ?? getStringArray(currentRow.tech),
        github: patch.github ?? currentRow.github,
        demo: patch.demo ?? currentRow.demo,
        image: patch.image ?? currentRow.image,
        featured: patch.featured ?? Boolean(currentRow.featured),
        category: patch.category ?? currentRow.category,
    };

    const result = await query(
        `UPDATE projects
         SET title = $2,
             description = $3,
             tech = $4::jsonb,
             github = $5,
             demo = $6,
             image = $7,
             featured = $8,
             category = $9,
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [
            id,
            merged.title,
            merged.description,
            JSON.stringify(merged.tech || []),
            merged.github,
            merged.demo,
            merged.image,
            Boolean(merged.featured),
            merged.category,
        ]
    );

    return mapProjectRow(result.rows[0]);
}

export async function deleteProject(id) {
    const result = await query(
        `DELETE FROM projects
         WHERE id = $1
         RETURNING id`,
        [id]
    );

    return result.rowCount > 0;
}
