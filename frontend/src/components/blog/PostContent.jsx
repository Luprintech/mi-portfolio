/**
 * PostContent — renderiza el markdown del post con syntax highlighting.
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { markdownComponents } from './markdownComponents';

export default function PostContent({ sanitizedContent }) {
  return (
    <div className="prose prose-blog prose-invert prose-sm md:prose-base lg:prose-lg max-w-none rounded-[2rem] border border-[var(--border-default)] bg-[var(--bg-elevated)]/78 px-6 py-8 text-justify shadow-[0_20px_80px_rgba(15,23,42,0.06)] md:px-10 md:py-12">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={markdownComponents}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  );
}
