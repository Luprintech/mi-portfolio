import PostRichContent from './renderers/PostRichContent';

export default function PostContent({ post }) {
  return (
    <div
      className="prose prose-blog dark:prose-invert prose-sm md:prose-base lg:prose-lg max-w-none rounded-[2rem] border border-[var(--border-default)] bg-[var(--bg-elevated)]/78 px-6 py-8 text-justify shadow-[0_20px_80px_rgba(15,23,42,0.06)] md:px-10 md:py-12"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '1400px auto' }}
    >
      <PostRichContent post={post} />
    </div>
  );
}
