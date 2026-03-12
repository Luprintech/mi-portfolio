import './env.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONTENT_PATH define la raiz compartida de posts, proyectos y sitemap.
const CONTENT_PATH = process.env.CONTENT_PATH
    ? path.resolve(process.env.CONTENT_PATH)
    : path.join(__dirname, '../../frontend/public');

export const POSTS_DIR = path.join(CONTENT_PATH, 'posts');
export const POSTS_INDEX = path.join(POSTS_DIR, 'index.json');
export const PROJECTS_FILE = path.join(CONTENT_PATH, 'projects.json');
export const IMAGES_DIR = path.join(POSTS_DIR, 'images');
export const DOCS_DIR = path.join(POSTS_DIR, 'documents');
export const AUDIO_DIR = path.join(POSTS_DIR, 'audio');
export const SITEMAP_FILE = path.join(CONTENT_PATH, 'sitemap.xml');
