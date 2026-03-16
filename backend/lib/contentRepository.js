import { query, withTransaction } from './database.js';

const READING_SPEED_WPM = 190;

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

function extractPresentation(content, fallbackImage = '') {
    const coverMatch = typeof content === 'string'
        ? content.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/)
        : null;

    const normalizedText = typeof content === 'string'
        ? content
            .replace(/```[\s\S]*?```/g, ' ')
            .replace(/`[^`]*`/g, ' ')
            .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/[#>*_~-]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
        : '';

    const wordCount = normalizedText ? normalizedText.split(' ').filter(Boolean).length : 0;

    return {
        coverImage: fallbackImage || coverMatch?.[1] || '',
        readingTime: Math.max(4, Math.ceil(wordCount / READING_SPEED_WPM)),
    };
}

function mapPostRow(row, { includeContent = false, includePresentation = false } = {}) {
    const mapped = {
        slug: row.slug,
        title: row.title,
        date: toDateString(row.publication_date),
        excerpt: row.excerpt || '',
        tags: getStringArray(row.tags),
        seoTitle: row.seo_title || '',
        seoDescription: row.seo_description || '',
        ogImage: row.og_image || '',
        canonicalUrl: row.canonical_url || '',
        noindex: Boolean(row.noindex),
        featured: Boolean(row.featured),
        status: row.status,
    };

    if (includeContent) {
        mapped.content = row.content;
    }

    if (includePresentation) {
        const presentation = extractPresentation(row.content, row.og_image || '');
        mapped.coverImage = presentation.coverImage;
        mapped.readingTime = presentation.readingTime;
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
                excerpt,
                tags,
                publication_date,
                seo_title,
                seo_description,
                og_image,
                canonical_url,
                noindex,
                featured,
                status
            ) VALUES (
                $1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11, $12, $13
            )
            RETURNING *`,
            [
                data.slug,
                data.title,
                data.content,
                data.excerpt || '',
                JSON.stringify(data.tags || []),
                data.date,
                data.seoTitle || '',
                data.seoDescription || '',
                data.ogImage || '',
                data.canonicalUrl || '',
                Boolean(data.noindex),
                Boolean(data.featured),
                data.status,
            ]
        );

        return mapPostRow(result.rows[0]);
    });
}

export async function updatePost(slug, patch) {
    const currentRow = await getPostRowBySlug(slug, { includeDrafts: true });
    if (!currentRow) return null;

    const merged = {
        slug: currentRow.slug,
        title: patch.title ?? currentRow.title,
        content: patch.content ?? currentRow.content,
        excerpt: patch.excerpt ?? currentRow.excerpt,
        tags: patch.tags ?? getStringArray(currentRow.tags),
        date: patch.date ?? toDateString(currentRow.publication_date),
        seoTitle: patch.seoTitle ?? currentRow.seo_title,
        seoDescription: patch.seoDescription ?? currentRow.seo_description,
        ogImage: patch.ogImage ?? currentRow.og_image,
        canonicalUrl: patch.canonicalUrl ?? currentRow.canonical_url,
        noindex: patch.noindex ?? Boolean(currentRow.noindex),
        featured: patch.featured ?? Boolean(currentRow.featured),
        status: patch.status ?? currentRow.status,
    };

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
                 excerpt = $4,
                 tags = $5::jsonb,
                 publication_date = $6,
                 seo_title = $7,
                 seo_description = $8,
                 og_image = $9,
                 canonical_url = $10,
                 noindex = $11,
                 featured = $12,
                 status = $13,
                 updated_at = NOW()
             WHERE slug = $1
             RETURNING *`,
            [
                slug,
                merged.title,
                merged.content,
                merged.excerpt,
                JSON.stringify(merged.tags || []),
                merged.date,
                merged.seoTitle,
                merged.seoDescription,
                merged.ogImage,
                merged.canonicalUrl,
                Boolean(merged.noindex),
                Boolean(merged.featured),
                merged.status,
            ]
        );

        return mapPostRow(result.rows[0]);
    });
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
