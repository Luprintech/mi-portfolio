import DocumentBlock from './renderers/DocumentBlock';

export default function DocumentEmbed({ src, filename, fileType, displayMode, embedHeight, embedWidth }) {
  return (
    <DocumentBlock
      src={src}
      filename={filename}
      fileType={fileType}
      display={displayMode}
      embedHeight={embedHeight}
      embedWidth={embedWidth}
    />
  );
}
