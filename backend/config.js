import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export const CONTENT_PATH = process.env.CONTENT_PATH
    ? path.resolve(process.env.CONTENT_PATH)
    : path.join(__dirname, '../frontend/public');

export const POSTS_DIR    = path.join(CONTENT_PATH, 'posts');
export const POSTS_INDEX  = path.join(POSTS_DIR, 'index.json');
export const PROJECTS_FILE = path.join(CONTENT_PATH, 'projects.json');
export const IMAGES_DIR   = path.join(POSTS_DIR, 'images');
